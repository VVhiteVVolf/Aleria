"""Rebuild only projects whose author-owned defaults were overwritten.

Group presets by their required correction, so visible sliders in unrelated
projects cannot override hidden fitting defaults. All changes remain staged.
"""
import collections
import copy
import json
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from audit import INSTANCE
from profile_reader import selected_profile

ROOT = Path(__file__).parent
STAGE = ROOT / 'default-repair-build'


def main():
    report = json.loads((ROOT / 'build-default-audit.json').read_text(encoding='utf-8'))
    if report['missing_project_sources']:
        raise ValueError('Incomplete source audit')
    projects = [p for p in report['projects'] if p['conflicts']]
    groups = collections.defaultdict(list)
    for project in projects:
        key = (project['family'], tuple(sorted((c['name'], c['size'], c['expected']) for c in project['conflicts'])))
        groups[key].append(project)
    profile = selected_profile(INSTANCE)
    tool = STAGE / 'BodySlide'
    catalog = STAGE / 'catalog'
    output = STAGE / 'output'
    source_tool = INSTANCE / 'MODS/mods/BodySlide and Outfit Studio/CalienteTools/BodySlide'
    shutil.copytree(source_tool, tool, dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns('ShapeData', 'SliderSets', 'SliderGroups', 'SliderPresets', 'Log_*.txt'))
    for folder in ('ShapeData', 'SliderSets', 'SliderGroups', 'SliderPresets'):
        (catalog / folder).mkdir(parents=True, exist_ok=True)
    output.mkdir(parents=True, exist_ok=True)
    cache = {}
    folders = set()
    for index, project in enumerate(projects):
        path = Path(project['osp'])
        if path not in cache:
            cache[path] = {}
            for s in ET.parse(path).getroot().iter('SliderSet'):
                # Preserve the original build's first-match tie resolution.
                cache[path].setdefault(s.get('name'), s)
        element = cache[path][project['name']]
        doc = ET.Element('SliderSetInfo', version='1')
        doc.append(copy.deepcopy(element))
        ET.ElementTree(doc).write(catalog / 'SliderSets' / ('repair-%04d.osp' % index), encoding='utf-8', xml_declaration=True)
        folders.add(element.findtext('DataFolder'))
        for shape in element.findall('Shape'):
            folders.update((shape.get('DataFolder') or '').split(';'))
    print('Copying source data for', len(projects), 'affected projects', flush=True)
    shape_sources = [(mod, directory / 'CalienteTools/BodySlide/ShapeData')
                     for mod, directory in reversed(profile['sources'])
                     if (directory / 'CalienteTools/BodySlide/ShapeData').is_dir()]
    for folder in sorted(folders - {''}):
        relative = 'CalienteTools/BodySlide/ShapeData/' + folder.replace('\\', '/')
        found = False
        for mod, directory in shape_sources:
            source = directory / folder.replace('\\', '/')
            if source.is_dir():
                shutil.copytree(source, catalog / 'ShapeData' / folder, dirs_exist_ok=True)
                found = True
        # Some authors leave an unused reference folder on a shape. Required
        # source files and slider deltas are checked explicitly below.
    missing = []
    for project in projects:
        element = cache[Path(project['osp'])][project['name']]
        folder = element.findtext('DataFolder')
        source = catalog / 'ShapeData' / folder / element.findtext('SourceFile').replace('\\', '/')
        if not source.is_file():
            missing.append(str(source))
        shape_folders = {s.get('target'): s.get('DataFolder', folder) for s in element.findall('Shape')}
        for delta in element.findall('Slider/Data'):
            name = (delta.text or '').replace('\\', '/')
            filename = name.split('.osd/')[0] + '.osd' if '.osd/' in name else name
            dep = folder if delta.get('local') == 'true' else shape_folders.get(delta.get('target'), folder)
            if filename and not any((catalog / 'ShapeData' / f / filename).is_file() for f in dep.split(';')):
                missing.append(str(catalog / 'ShapeData' / dep / filename))
    if missing:
        raise FileNotFoundError(repr(sorted(set(missing))))
    config = ET.parse(tool / 'Config.xml')
    for key, value in {'TargetGame': '4', 'ProjectPath': str(catalog) + '\\',
                       'BSATextureScan': 'false', 'OutputDataPath': str(output) + '\\'}.items():
        element = config.getroot().find(key)
        if element is None:
            element = ET.SubElement(config.getroot(), key)
        element.text = value
    config.write(tool / 'Config.xml', encoding='utf-8', xml_declaration=True)
    statuses = []
    for index, ((family, corrections), rows) in enumerate(groups.items(), 1):
        name = 'Local Seam Repair 20261006 ' + str(index)
        doc = ET.Element('SliderGroups')
        group = ET.SubElement(doc, 'Group', name=name)
        for row in rows:
            ET.SubElement(group, 'Member', name=row['name'])
        ET.ElementTree(doc).write(catalog / 'SliderGroups' / ('repair-%d.xml' % index), encoding='utf-8', xml_declaration=True)
        preset_file = INSTANCE / ('MODS/mods/Local - New Downloads OBody Output 20261006/CalienteTools/BodySlide/SliderPresets/Local New Downloads ' + family + '.xml')
        presets = ET.parse(preset_file)
        preset = next(presets.getroot().iter('Preset'))
        preset.set('name', name)
        for group in preset.findall('Group'):
            preset.remove(group)
        ET.SubElement(preset, 'Group', name=name)
        values = {(s.get('name'), s.get('size')): s for s in preset.findall('SetSlider')}
        for slider, size, value in corrections:
            values[(slider, size)].set('value', str(value))
        presets.write(catalog / 'SliderPresets' / ('repair-%d.xml' % index), encoding='utf-8', xml_declaration=True)
        command = [str(tool / 'BodySlide x64.exe'), '--groupbuild', name,
                   '--preset=' + name, '--trimorphs', '--targetdir', str(output)]
        startup = subprocess.STARTUPINFO()
        startup.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        startup.wShowWindow = 0
        print('Building group', index, 'projects:', len(rows), 'corrections:', corrections, flush=True)
        with (STAGE / ('console-%d.log' % index)).open('w', encoding='utf-8') as log:
            result = subprocess.run(command, cwd=tool, startupinfo=startup, stdout=log, stderr=log, timeout=600)
        bodylog = (tool / 'Log_BS.txt').read_text(encoding='utf-8-sig', errors='replace')
        shutil.copy2(tool / 'Log_BS.txt', STAGE / ('build-%d.log' % index))
        success = result.returncode == 0 and 'All group build sets processed successfully' in bodylog
        statuses.append({'group': name, 'projects': len(rows), 'success': success, 'exit_code': result.returncode})
        (STAGE / 'build-status.json').write_text(json.dumps(statuses, indent=2), encoding='utf-8')
        if not success:
            raise RuntimeError(bodylog)
        print('Completed group', index, flush=True)
    print('Completed all affected builds:', len(projects), flush=True)


if __name__ == '__main__':
    main()
