"""Place new follower plugins before existing environment patches, preserving old order."""
from pathlib import Path
import json
import shutil
import subprocess
import sys

from deploy_followers import ROOT, INSTANCE, selected_profile, header


def prepare():
    plan = json.loads((ROOT / 'deployment-plan.json').read_text(encoding='utf-8'))
    profile = selected_profile(INSTANCE)
    new = {name.casefold() for name in plan['new_plugins']}
    compatibility = 'Local New Followers NPC Compatibility.esp'
    existing = [name for name in profile['plugins'] if name.casefold() not in new]
    old = json.loads((ROOT / 'profile-before.json').read_text(encoding='utf-8'))['plugins']
    assert existing == old
    positions = {name.casefold(): index for index, name in enumerate(existing)}
    group = [name for name in plan['new_plugins'] if name != compatibility]
    required = {master.casefold() for name in group
                for master in header(profile['providers'][name.casefold()]['path'])['masters']
                if master.casefold() not in new}
    anchor = max(positions[name] for name in required)
    baseline = json.loads((ROOT / 'world-cell-baseline.json').read_text(encoding='utf-8'))
    assert not baseline['missing'] and not baseline['errors']
    protected = {key: value for key, value in baseline['winners'].items()
                 if value['position'] > anchor}
    exceptions = {key: value for key, value in baseline['winners'].items()
                  if value['position'] <= anchor}
    assert all(value['kind'] == 'NAVM' for value in exceptions.values())
    final = existing[:anchor + 1] + group + existing[anchor + 1:] + [compatibility]
    final_positions = {name.casefold(): index for index, name in enumerate(final)}
    for name in plan['new_plugins']:
        assert all(final_positions[master.casefold()] < final_positions[name.casefold()]
                   for master in header(profile['providers'][name.casefold()]['path'])['masters'])
    backup = ROOT / 'backup-before-order'
    backup.mkdir(exist_ok=True)
    for filename in ('plugins.txt', 'loadorder.txt'):
        original = (profile['directory'] / filename).read_bytes()
        assert original == (ROOT / (filename + '.after')).read_bytes()
        (backup / filename).write_bytes(original)
        lines = original.decode('utf-8-sig').splitlines(keepends=True)
        clean = [line for line in lines if line.strip().lstrip('*').casefold() not in new]
        # Anchor on the explicit Beards master; keep implicit core entries and comments intact.
        insertion = next(index for index, line in enumerate(clean)
                         if line.strip().lstrip('*').casefold() == existing[anchor].casefold()) + 1
        prefix = '*' if filename == 'plugins.txt' else ''
        additions = [prefix + name + '\r\n' for name in group]
        revised = clean[:insertion] + additions + clean[insertion:]
        if revised and not revised[-1].endswith('\n'):
            revised[-1] += '\r\n'
        revised.append(prefix + compatibility + '\r\n')
        (ROOT / (filename + '.ordered')).write_bytes(''.join(revised).encode('utf-8'))
    receipt = {'anchor': existing[anchor], 'new_base_plugins': group,
               'compatibility_patch_last': compatibility,
               'original_order_preserved': True, 'protected_environment_records': protected,
               'author_navmesh_retained': exceptions}
    (ROOT / 'ordering-validation.json').write_text(json.dumps(receipt, indent=2), encoding='utf-8')
    print(json.dumps({'anchor': existing[anchor], 'protected_records': len(protected),
                      'retained_author_navmeshes': len(exceptions)}, indent=2))


def apply():
    profile = selected_profile(INSTANCE)
    state = subprocess.run(['powershell', '-NoProfile', '-Command',
                            '@(Get-Process SkyrimSE,ModOrganizer -ErrorAction SilentlyContinue).Count'],
                           capture_output=True, text=True, check=True)
    assert state.stdout.strip() == '0', 'Skyrim or MO2 is running'
    for filename in ('plugins.txt', 'loadorder.txt'):
        assert (profile['directory'] / filename).read_bytes() == (ROOT / (filename + '.after')).read_bytes()
    for filename in ('plugins.txt', 'loadorder.txt'):
        shutil.copyfile(ROOT / (filename + '.ordered'), profile['directory'] / filename)
        shutil.copyfile(ROOT / (filename + '.ordered'), ROOT / (filename + '.after'))
    from deploy_followers import verify
    verify()


if __name__ == '__main__':
    apply() if '--apply' in sys.argv else prepare()
