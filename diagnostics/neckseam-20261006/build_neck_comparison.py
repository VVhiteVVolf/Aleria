"""Build two isolated comparison outfits with the correct weight-dependent seam.

Reads installed tools and projects; all output stays in this diagnostic folder.
"""
import copy
import json
import shutil
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from audit import INSTANCE
from profile_reader import selected_profile

ROOT = Path(__file__).parent


def main():
    profile = selected_profile(INSTANCE)
    tool = ROOT / 'comparison-build' / 'BodySlide'
    catalog = ROOT / 'comparison-build' / 'catalog'
    output = ROOT / 'comparison-build' / 'output'
    source_tool = INSTANCE / 'MODS/mods/BodySlide and Outfit Studio/CalienteTools/BodySlide'
    shutil.copytree(source_tool, tool, dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns('ShapeData', 'SliderSets', 'SliderGroups', 'SliderPresets', 'Log_*.txt'))
    for folder in ('ShapeData', 'SliderSets', 'SliderGroups', 'SliderPresets'):
        (catalog / folder).mkdir(parents=True, exist_ok=True)
    output.mkdir(parents=True, exist_ok=True)
    mod = INSTANCE / 'MODS/mods/Local - CBBE 3BA Vanilla Outfits Redone - Default 20261006'
    osp = mod / 'CalienteTools/BodySlide/SliderSets/CBBE 3BA Vanilla (Physics).osp'
    wanted = {'CBBE 3BA Vanilla - Body - Wench (Physics)', 'CBBE 3BA Vanilla - Body - Blacksmith (Physics)'}
    selected = [s for s in ET.parse(osp).getroot().iter('SliderSet') if s.get('name') in wanted]
    if len(selected) != len(wanted):
        raise ValueError('Comparison projects not found')
    folders = set()
    groups = ET.Element('SliderGroups')
    group = ET.SubElement(groups, 'Group', name='Neck comparison')
    for item in selected:
        doc = ET.Element('SliderSetInfo', version='1')
        doc.append(copy.deepcopy(item))
        ET.ElementTree(doc).write(catalog / 'SliderSets' / (item.get('name').replace(':', '_') + '.osp'), encoding='utf-8', xml_declaration=True)
        ET.SubElement(group, 'Member', name=item.get('name'))
        folders.add(item.findtext('DataFolder'))
        for shape in item.findall('Shape'):
            folders.update((shape.get('DataFolder') or '').split(';'))
    for folder in folders - {''}:
        relative = 'CalienteTools/BodySlide/ShapeData/' + folder.replace('\\', '/')
        # Copy lowest to highest priority, like MO2's winning loose files.
        found = False
        for name, directory in reversed(profile['sources']):
            source = directory / relative
            if source.is_dir():
                shutil.copytree(source, catalog / 'ShapeData' / folder, dirs_exist_ok=True)
                found = True
        if not found:
            raise FileNotFoundError(relative)
    ET.ElementTree(groups).write(catalog / 'SliderGroups/comparison.xml', encoding='utf-8', xml_declaration=True)
    preset_file = INSTANCE / 'MODS/mods/Local - New Downloads OBody Output 20261006/CalienteTools/BodySlide/SliderPresets/Local New Downloads female.xml'
    presets = ET.parse(preset_file)
    preset = next(presets.getroot().iter('Preset'))
    preset.set('name', 'Neck comparison zero')
    for g in preset.findall('Group'):
        preset.remove(g)
    ET.SubElement(preset, 'Group', name='Neck comparison')
    for slider in preset.findall('SetSlider'):
        if slider.get('name') == 'NeckSeam':
            slider.set('value', '100' if slider.get('size') == 'small' else '0')
    presets.write(catalog / 'SliderPresets/comparison.xml', encoding='utf-8', xml_declaration=True)
    config = ET.parse(tool / 'Config.xml')
    for key, value in {'TargetGame': '4', 'ProjectPath': str(catalog) + '\\',
                       'BSATextureScan': 'false', 'OutputDataPath': str(output) + '\\'}.items():
        element = config.getroot().find(key)
        if element is None:
            element = ET.SubElement(config.getroot(), key)
        element.text = value
    config.write(tool / 'Config.xml', encoding='utf-8', xml_declaration=True)
    command = [str(tool / 'BodySlide x64.exe'), '--groupbuild', 'Neck comparison',
               '--preset=Neck comparison zero', '--trimorphs', '--targetdir', str(output)]
    startup = subprocess.STARTUPINFO()
    startup.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    startup.wShowWindow = 0
    print('Building comparison meshes outside the game:', str(output), flush=True)
    with (ROOT / 'comparison-build/console.log').open('w', encoding='utf-8') as log:
        result = subprocess.run(command, cwd=tool, startupinfo=startup, stdout=log, stderr=log, timeout=180)
    bodylog = (tool / 'Log_BS.txt').read_text(encoding='utf-8-sig', errors='replace')
    success = result.returncode == 0 and 'All group build sets processed successfully' in bodylog
    print(json.dumps({'exit_code': result.returncode, 'success': success, 'output': str(output)}), flush=True)
    if not success:
        raise RuntimeError(bodylog)


if __name__ == '__main__':
    main()
