"""Verify installed override contents, usable morph links and protected core outputs."""
from pathlib import Path
import hashlib
import json
import sys
import xml.etree.ElementTree as ET
from nif_links import header

OUT = Path(__file__).parent
AUDIT = OUT.parent / 'obody-bodyslide-audit-20261006'
sys.path.insert(0, str(AUDIT))
from nif_inspection import inspect_nif
from morph_details import tri_table
from inventory import normalized

def digest(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

def main():
    deployment = json.loads((OUT/'deployment.json').read_text(encoding='utf-8'))
    repair = json.loads((OUT/'repair-stage.json').read_text(encoding='utf-8'))
    inventory = json.loads((AUDIT/'inventory.json').read_text(encoding='utf-8'))
    configuration = json.loads((AUDIT/'configuration.json').read_text(encoding='utf-8'))
    morphs = json.loads((AUDIT/'morph-details.json').read_text(encoding='utf-8'))['projects']
    root = Path(inventory['instance'])
    mod = Path(deployment['mod_path'])
    modlist = root/'MODS/profiles'/deployment['profile']/'modlist.txt'
    active = [line[1:] for line in modlist.read_text(encoding='utf-8-sig').splitlines() if line.startswith('+')]
    assert active[0] == deployment['mod_name'], 'Repair output must have highest file priority'
    stage = OUT/'mod-stage'
    stage_files = {p.relative_to(stage).as_posix(): digest(p) for p in stage.rglob('*') if p.is_file()}
    installed_files = {p.relative_to(mod).as_posix(): digest(p) for p in mod.rglob('*') if p.is_file()}
    assert stage_files == installed_files, 'Installed override differs from verified stage'
    weighted_meshes = 0
    usable = []
    fixed = []
    for project in repair['generated_projects']:
        table = tri_table(mod/(project['output']+'.tri'))
        assert table['valid']
        if not table['shapes']:
            fixed.append(project['name'])
            continue
        for suffix in ['_0.nif', '_1.nif'] if project['weights'] else ['.nif']:
            mesh = inspect_nif(mod/(project['output']+suffix))
            assert mesh['bodytri']
            assert all(normalized(link) == project['output'].removeprefix('meshes/')+'.tri' for link in mesh['bodytri'])
            assert {s['name'] for s in mesh['shapes']} & {s['name'] for s in table['shapes']}
            weighted_meshes += 1
        usable.append(project['name'])
    for change in repair['nif_link_repairs']:
        before = Path(change['source']).read_bytes()
        after = (mod/change['relative']).read_bytes()
        assert hashlib.sha256(before).hexdigest() == change['source_sha256']
        assert hashlib.sha256(after).hexdigest() == change['new_sha256']
        assert before[header(before)['block_start']:] == after[header(after)['block_start']:]
    for xml in (mod/'CalienteTools/BodySlide/SliderGroups').glob('*.xml'):
        ET.parse(xml)
    core_checked = []
    for core in configuration['core']:
        for relative in [core['output']+'_0.nif', core['output']+'_1.nif', core['output']+'.tri']:
            providers = inventory['files'][relative]
            winner = next(p for p in providers if p['mod'] in active)
            assert winner['mod'] == core['winner']['mod']
            assert not (mod/relative).exists(), 'Unrequested core body replacement'
            old_hashes = [item['sha256'] for project in morphs for item in project.get('meshes', []) if item.get('relative') == relative and item.get('sha256')]
            # The original audit's core pair verification supplies provenance; compare its recorded hashes where present.
            current_hash = digest(winner['path'])
            if old_hashes:
                assert current_hash in old_hashes
            core_checked.append({'relative': relative, 'winner': winner['mod'], 'sha256': current_hash})
    for filename in ['plugins.txt', 'loadorder.txt']:
        path = modlist.parent/filename
        assert digest(path) == deployment['before_hashes'][str(path)], 'Plugin order changed'
    config = root/'MODS/mods/BodySlide and Outfit Studio/CalienteTools/BodySlide/Config.xml'
    xml = ET.parse(config)
    assert Path(xml.findtext('OutputDataPath')) == mod
    assert not xml.findtext('ProjectPath')
    result = {'verified': True, 'installed_files': len(stage_files), 'generated_projects': len(repair['generated_projects']), 'projects_with_usable_morphs': len(usable), 'verified_morph_meshes': weighted_meshes, 'fixed_accessory_exceptions': fixed, 'bodytri_reference_repairs': len(repair['nif_link_repairs']), 'core_outputs': core_checked, 'plugin_order_unchanged': True, 'ingame_test_performed': False}
    (OUT/'repair-validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k != 'core_outputs'}, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
