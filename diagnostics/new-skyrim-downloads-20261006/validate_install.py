"""Validate actual profile activation, resources, and preserved core body winners."""
from pathlib import Path
import hashlib
import json
import sys
from stage import header

OUT = Path(__file__).parent
sys.path.insert(0, str(OUT.parent / 'obody-bodyslide-audit-20261006'))
from plugin_records import scan


def main():
    plan = json.loads((OUT / 'deployment-plan.json').read_text(encoding='utf-8'))
    instance = Path(plan['instance'])
    profile = instance / 'MODS/profiles' / plan['profile']
    lines = (profile / 'modlist.txt').read_text(encoding='utf-8-sig').splitlines()
    active = [l[1:] for l in lines if l.startswith('+') and not l.endswith('_separator')]
    assert all(m['name'] in active for m in plan['mods'])
    assert not set(plan['disabled_mods']) & set(active)
    for name in ('modlist', 'plugins', 'loadorder'):
        assert (profile / (name + '.txt')).read_bytes() == (OUT / (name + '.after.txt')).read_bytes()
    providers = {}
    for name in active:
        for path in (instance / 'MODS/mods' / name).iterdir():
            if path.suffix.casefold() in ('.esp', '.esm', '.esl'):
                providers.setdefault(path.name.casefold(), path)
    for path in (instance / 'STOCK GAME/Data').iterdir():
        if path.suffix.casefold() in ('.esp', '.esm', '.esl'):
            providers.setdefault(path.name.casefold(), path)
    plugins = [l[1:] for l in (profile / 'plugins.txt').read_text(encoding='utf-8-sig').splitlines() if l.startswith('*')]
    implicit = ['Skyrim.esm', 'Update.esm', 'Dawnguard.esm', 'HearthFires.esm', 'Dragonborn.esm'] + (
        instance / 'STOCK GAME/Skyrim.ccc').read_text(encoding='utf-8-sig').splitlines()
    present = {p.casefold() for p in plugins}
    plugins = [p for p in implicit if p.casefold() in providers and p.casefold() not in present] + plugins
    positions = {p.casefold(): i for i, p in enumerate(plugins)}
    full = light = 0
    for i, name in enumerate(plugins):
        info = header(providers[name.casefold()])
        light += info['light']
        full += not info['light']
        for master in info['masters']:
            assert master.casefold() in positions and positions[master.casefold()] < i, (name, master)
    assert {'full': full, 'light': light} == plan['plugin_counts']
    config = json.loads((OUT.parent / 'obody-bodyslide-audit-20261006/configuration.json').read_text(encoding='utf-8'))
    cores = []
    for core in config['core']:
        relative = core['output'] + '_1.nif'
        winner = next(instance / 'MODS/mods' / name / relative for name in active
                      if (instance / 'MODS/mods' / name / relative).is_file())
        assert winner == Path(core['winner']['path']), (relative, winner)
        cores.append({'output': relative, 'provider': winner.parent.parent.parent.name, 'path': str(winner)})
    textures = json.loads((OUT / 'texture-validation.json').read_text(encoding='utf-8'))
    support = json.loads((OUT / 'build-support-receipt.json').read_text(encoding='utf-8'))
    resolved = {r['relative'].casefold() for r in support}
    remaining = [r for r in textures['missing'] if r['texture'] not in resolved]
    armor_models = set(json.loads((OUT / 'new-armor-models.json').read_text()))
    used = [r for r in remaining if r['mesh'] in armor_models or '/facegeom/' in r['mesh']]
    critical = [r for r in used if r['slot'] == 0]
    assert not critical, critical
    assert not textures['parse_errors']
    result = {'verified': True, 'profile': plan['profile'], 'new_mods_active': len(plan['mods']),
              'new_plugins_active': len(plan['new_plugins']), 'plugin_counts': {'full': full, 'light': light},
              'master_order_valid': True, 'core_body_winners_unchanged': cores,
              'saves': len(list((profile / 'saves').glob('*.ess'))),
              'new_meshes_parsed': textures['meshes_checked'], 'texture_references_checked': textures['texture_references'],
              'missing_diffuse_textures_in_new_armor_and_facegeom': critical,
              'remaining_references': remaining, 'remaining_references_in_armor_and_facegeom': used,
              'game_runtime_test': 'Not performed; files, builds, dependency order and resource references validated.'}
    (OUT / 'installation-validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: v for k, v in result.items() if not k.startswith(('core_', 'remaining_'))}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
