"""Build private 3BA follower meshes and outfits with OBody-compatible bases."""
from pathlib import Path
import copy
import json
import shutil
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
sys.path.insert(0, str(ROOT.parents[1] / 'skyrim-outfit-catalog/scripts'))
from profile_reader import selected_profile


def norm(value):
    return value.replace('\\', '/').strip('/').casefold()


def prepare():
    mods = json.loads((ROOT / 'selected-stage.json').read_text(encoding='utf-8'))['mods']
    if '--index' in sys.argv:
        chosen = int(sys.argv[sys.argv.index('--index')+1])
        mods = [m for m in mods if m['index'] == chosen]
    catalog = ROOT / 'BuildCatalog'
    for folder in ('ShapeData', 'SliderSets', 'SliderPresets', 'SliderGroups'):
        (catalog / folder).mkdir(parents=True, exist_ok=True)
    tool = ROOT / 'BodySlide'
    original = INSTANCE / 'MODS/mods/BodySlide and Outfit Studio/CalienteTools/BodySlide'
    shutil.copytree(original, tool, dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns('ShapeData', 'SliderSets', 'SliderPresets', 'SliderGroups', 'Log_BS.txt'))
    sources = {}
    profile = selected_profile(INSTANCE)
    for _, directory in reversed(profile['sources']):
        folder = directory / 'CalienteTools/BodySlide/ShapeData'
        if folder.is_dir():
            for path in folder.rglob('*'):
                if path.is_file():
                    sources[norm(path.relative_to(folder).as_posix())] = path
    projects = {}
    for mod in mods:
        base = Path(mod['directory']) / 'CalienteTools/BodySlide'
        folder = base / 'ShapeData'
        if folder.is_dir():
            for path in folder.rglob('*'):
                if path.is_file():
                    sources[norm(path.relative_to(folder).as_posix())] = path
        if not (base / 'SliderSets').is_dir():
            continue
        for path in (base / 'SliderSets').rglob('*.osp'):
            for element in ET.parse(path).getroot().findall('.//SliderSet'):
                output = norm(element.findtext('OutputPath', '') + '/' + element.findtext('OutputFile', ''))
                if output.startswith('meshes/actors/character/character assets/'):
                    raise ValueError('Global body output forbidden: ' + output)
                if output in projects:
                    raise ValueError('Ambiguous outfit output: ' + output)
                projects[output] = (element, mod, path)
    rows = []
    folders = set()
    # Each project gets its own preset: cosmetic zeros never leak into another
    # project's hidden fitting or conversion sliders with the same name.
    for number, (output, (element, mod, source)) in enumerate(projects.items()):
        element = copy.deepcopy(element)
        original_name = element.get('name')
        build_name = 'Followers-%03d '%number + original_name
        element.set('name', build_name)
        folder = norm(element.findtext('DataFolder', ''))
        folders.add(folder)
        shape_folders = {s.get('target'): norm(s.get('DataFolder', folder)) for s in element.findall('Shape')}
        folders.update(f for sf in shape_folders.values() for f in sf.split(';'))
        group_name = 'Follower Build %03d'%number
        preset_name = 'Follower Zero %03d'%number
        doc = ET.Element('SliderSetInfo', {'version': '1'})
        doc.append(element)
        ET.ElementTree(doc).write(catalog/'SliderSets'/('%03d.osp'%number), encoding='utf-8', xml_declaration=True)
        groups = ET.Element('SliderGroups')
        group = ET.SubElement(groups, 'Group', {'name': group_name})
        ET.SubElement(group, 'Member', {'name': build_name})
        ET.ElementTree(groups).write(catalog/'SliderGroups'/('%03d.xml'%number), encoding='utf-8', xml_declaration=True)
        presets = ET.Element('SliderPresets')
        preset = ET.SubElement(presets, 'Preset', {'name': preset_name, 'set': build_name})
        ET.SubElement(preset, 'Group', {'name': group_name})
        retained = []
        for slider in element.findall('Slider'):
            if slider.get('hidden', 'false').lower() == 'true' or slider.get('zap', 'false').lower() == 'true' or slider.get('name') in {'NeckSeam', 'AnkleSize'}:
                retained.append(dict(slider.attrib))
                continue
            for size in ('small', 'big'):
                ET.SubElement(preset, 'SetSlider', {'name': slider.get('name'), 'size': size, 'value': '0'})
        ET.ElementTree(presets).write(catalog/'SliderPresets'/('%03d.xml'%number), encoding='utf-8', xml_declaration=True)
        rows.append({'name': original_name, 'output': output, 'mod': mod['name'], 'index': mod['index'],
                     'group': group_name, 'preset': preset_name, 'retained_defaults': retained,
                     'weights': element.find('OutputFile').get('GenWeights', 'true').lower() == 'true'})
    for relative, path in sources.items():
        if any(relative.startswith(f + '/') for f in folders if f):
            target = catalog / 'ShapeData' / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
    missing = []
    for path in (catalog/'SliderSets').glob('*.osp'):
        element = ET.parse(path).getroot().find('SliderSet')
        folder = norm(element.findtext('DataFolder', ''))
        if not (catalog/'ShapeData'/folder/element.findtext('SourceFile').replace('\\', '/')).is_file():
            missing.append(element.findtext('SourceFile'))
        shape_folders = {s.get('target'): norm(s.get('DataFolder', folder)) for s in element.findall('Shape')}
        for delta in element.findall('Slider/Data'):
            ref = norm(delta.text or '')
            file = ref.split('.osd/')[0] + '.osd' if '.osd/' in ref else ref
            dep = folder if delta.get('local') == 'true' else shape_folders.get(delta.get('target'), folder)
            if file and not any((catalog/'ShapeData'/f/file).is_file() for f in dep.split(';')):
                missing.append(dep + '/' + file)
    if missing:
        raise ValueError('Missing BodySlide sources: ' + repr(sorted(set(missing))))
    config = ET.parse(tool/'Config.xml')
    for name, value in {'TargetGame':'4', 'ProjectPath':str(catalog)+'\\', 'BSATextureScan':'false',
                        'OutputDataPath':str(ROOT/'generated')+'\\'}.items():
        el = config.getroot().find(name)
        if el is None:
            el = ET.SubElement(config.getroot(), name)
        el.text = value
    config.write(tool/'Config.xml', encoding='utf-8', xml_declaration=True)
    (ROOT/'build-plan.json').write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding='utf-8')
    print('Prepared %d private-body / outfit projects.'%len(rows), flush=True)
    return rows


def run(rows):
    statuses = []
    tool = ROOT/'BodySlide'
    startup = subprocess.STARTUPINFO()
    startup.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    startup.wShowWindow = 0
    for number, row in enumerate(rows):
        output = ROOT/'generated'/row['mod']
        output.mkdir(parents=True, exist_ok=True)
        command = [str(tool/'BodySlide x64.exe'), '--groupbuild', row['group'],
                   '--preset='+row['preset'], '--trimorphs', '--targetdir', str(output)]
        start = time.time()
        console = ROOT/'extract-logs'/('build-%03d-console.log'%number)
        with console.open('w', encoding='utf-8') as stream:
            result = subprocess.run(command, cwd=tool, startupinfo=startup, stdout=stream, stderr=stream, timeout=180)
        log = tool/'Log_BS.txt'
        content = log.read_text(encoding='utf-8-sig', errors='replace')
        shutil.copy2(log, ROOT/'extract-logs'/('build-%03d.log'%number))
        success = result.returncode == 0 and log.stat().st_mtime >= start and 'All group build sets processed successfully' in content
        if not success:
            raise RuntimeError(content)
        relative = row['output']
        expected = [relative+'_0.nif', relative+'_1.nif'] if row['weights'] else [relative+'.nif']
        for file in expected:
            if not (output/file).is_file():
                raise FileNotFoundError(output/file)
        statuses.append({'name': row['name'], 'success': True, 'seconds': round(time.time()-start, 2), 'files': expected})
        (ROOT/'build-status.json').write_text(json.dumps(statuses, indent=2), encoding='utf-8')
        print('%d/%d %s'%(number+1, len(rows), row['name']), flush=True)


if __name__ == '__main__':
    run(prepare())
