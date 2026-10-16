"""Stage author installer selections without changing the game or plugins."""
from pathlib import Path
import json
import shutil
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parent
CATALOG = json.loads((ROOT / 'catalog.json').read_text(encoding='utf-8'))

NAMES = {
    0: 'Amy Follower', 1: 'Malik - Avenger of the Lost',
    2: 'Darvok - Fists of the Unyielding', 5: 'Kian and Karo - Brothers of the Wild',
    6: 'ColdSun - Karla Raven', 7: 'ColdSun - Lyris Titanborn',
    8: 'ColdSun - Melana Appearance', 9: 'Daedric Individuals - 3BA Followers',
    10: 'Dracania Armor - 3BA', 11: 'ELLE Elven Assasin - 3BA',
    13: 'Eudora - The Dibellan Shieldmaiden', 14: 'Heart of Ice - Astrid',
    15: 'Hyren - 3BA Follower', 16: 'Ivar - Skaal Follower',
    18: 'Skogul - Standalone 3BA', 20: 'Malryn - Standalone 3BA',
    21: 'Melana the War Maiden', 24: 'Neisa Follower',
    28: 'ColdSun - Visions Asset Pack', 29: 'VriTarl Follower',
}
WRAPPERS = {
    9: 'Daedric Individuals - Followers', 11: '[E] Elven Assasin 3BA',
    13: 'Eudora - The Dibellan Shieldmaiden A Custom Voiced Follower',
    16: 'Ivar - Skaal Custom Voiced Follower', 18: 'Lazarus Followers - Skogul',
    24: 'Neisa-1.6/Neisa Follower', 29: 'VriTarlFollower',
}


def copy_entry(source, target):
    if not source.exists():
        raise FileNotFoundError(source)
    if source.is_dir():
        shutil.copytree(source, target, dirs_exist_ok=True)
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)


def install_files(base, target, nodes):
    for node in nodes:
        copy_entry(base / node.get('source').replace('\\', '/'),
                   target / node.get('destination').replace('\\', '/'))


def selected_options(base, target, options):
    config = next(base.rglob('ModuleConfig.xml'))
    doc = ET.parse(config).getroot()
    package = config.parent.parent
    required = doc.find('requiredInstallFiles')
    if required is not None:
        install_files(package, target, required)
    selected = []
    for step_name, label, occurrence in options:
        steps = [s for s in doc.findall('.//installStep') if s.get('name') == step_name]
        candidates = [p for s in steps for p in s.findall('.//plugin') if p.get('name') == label]
        option = candidates[occurrence]
        files = option.find('files')
        if files is not None:
            install_files(package, target, files)
        selected.append({'step': step_name, 'option': label, 'occurrence': occurrence})
    return selected


def main():
    staged = []
    for index, label in NAMES.items():
        base = ROOT / 'unpacked' / str(index)
        name = 'Local - ' + label + ' 20261007'
        target = ROOT / 'staged' / name
        target.mkdir(parents=True, exist_ok=True)
        options = []
        if index == 0:
            for source, destination in [
                ('00 Shared/meshes', 'meshes'), ('00 Shared/textures', 'textures'),
                ('10 Main/Amy follower default/meshes', 'meshes'),
                ('20 Main/Amy follower CBBE/textures/actors', 'textures/actors'),
                ('10 Main/Amy follower default/Amy_follower.esp', 'Amy_follower.esp'),
            ]:
                copy_entry(base / source, target / destination)
            options = ['Default installed body; new follower at Candlehearth Hall']
        elif index == 1:
            options = selected_options(base, target, [('Intro', 'OK', 0),
                                                     ('Do you want Facepaint?', 'Yes (recommended)', 0)])
        elif index == 2:
            options = selected_options(base, target, [('IMPORTANT', 'OK', 0),
                ('High or Low Poly?', 'Low Poly', 0), ('Facepaint?', 'Yes', 0)])
        elif index == 5:
            options = selected_options(base, target, [('Recommended Mods', 'OK', 0),
                ('Low Poly Antlers', 'Antlers (recommended)', 0),
                ('Kian Facepaint', '1028px', 0), ('Karo Facepaint', '1028px', 0)])
        elif index == 8:
            options = selected_options(base, target, [('Melana Options', 'Muscular', 0),
                                                     ('Melana Options', 'Normal', 0)])
        elif index == 10:
            options = selected_options(base, target, [('Step1', '3BA', 0), ('Step1', 'Heavy', 0)])
        elif index == 14:
            options = selected_options(base, target, [('Physics', 'Physics', 0)])
        else:
            source = base / WRAPPERS.get(index, '')
            for item in source.iterdir():
                if item.name.casefold() in {'fomod', 'meta.ini', 'eudiora back ups'}:
                    continue
                copy_entry(item, target / item.name)
        archive = CATALOG['archives'][index]
        plugin_names = sorted(p.name for p in target.iterdir()
                              if p.is_file() and p.suffix.casefold() in {'.esp', '.esm', '.esl'})
        metadata = '\n'.join([
            '[General]', 'gameName=SkyrimSE', 'modid=' + str(archive.get('nexus_id', 0)),
            'version=1.0', 'installationFile=' + archive['archive'].replace('\\', '/'),
            'comments=Author installer selections recorded in new-followers-20261007; plugin bytes unchanged.', '',
        ])
        (target / 'meta.ini').write_text(metadata, encoding='utf-8')
        staged.append({'index': index, 'name': name, 'directory': str(target),
                       'archive': archive['archive'], 'plugins': plugin_names, 'options': options})
    result = {'mods': staged, 'policy': 'No plugin compaction or plugin edits. Preserve global meshes.'}
    (ROOT / 'stage.json').write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')
    print(json.dumps([{'index': m['index'], 'plugins': m['plugins']} for m in staged], indent=2))


if __name__ == '__main__':
    main()
