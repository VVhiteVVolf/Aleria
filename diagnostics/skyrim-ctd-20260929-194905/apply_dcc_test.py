from pathlib import Path
import datetime
import hashlib
import json
import shutil
import subprocess

ROOT = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
PROFILE_NAME = 'Nolvus Awakening - SkyrimNet Beta25 Test'
PROFILE = ROOT / 'MODS/profiles' / PROFILE_NAME
WORK = Path(__file__).parent
MODS = ['Dynamic Combat Collision 1.4.3', 'Dynamic Combat Collision - MCM 1.1']

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def exact_line_change(data, old, new):
    parts = data.splitlines(keepends=True)
    matching = [i for i, line in enumerate(parts) if line.rstrip(b'\r\n') == old.encode()]
    if len(matching) != 1:
        raise RuntimeError(f'Expected exactly one active entry: {old}, got {len(matching)}')
    index = matching[0]
    ending = parts[index][len(parts[index].rstrip(b'\r\n')):]
    parts[index] = new.encode() + ending
    return b''.join(parts)

def main():
    processes = subprocess.run(['powershell', '-NoProfile', '-Command',
        'Get-Process SkyrimSE,ModOrganizer -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ProcessName'],
        capture_output=True, text=True)
    if processes.stdout.strip():
        raise RuntimeError('Close Skyrim and MO2 first: ' + processes.stdout.strip())
    ini = (ROOT / 'MO2/ModOrganizer.ini').read_text(encoding='utf-8-sig')
    if f'selected_profile=@ByteArray({PROFILE_NAME})' not in ini:
        raise RuntimeError('Selected MO2 profile changed; recheck before applying.')
    original = {name: (PROFILE / name).read_bytes() for name in ['modlist.txt', 'plugins.txt']}
    updated = original.copy()
    for name in MODS:
        updated['modlist.txt'] = exact_line_change(updated['modlist.txt'], '+' + name, '-' + name)
    updated['plugins.txt'] = exact_line_change(updated['plugins.txt'], '*DynamicCombatCollision.esp', 'DynamicCombatCollision.esp')
    stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    backup = ROOT / 'MODS/Backups' / ('DCC-Follower-Stability-' + stamp)
    backup.mkdir(parents=True, exist_ok=False)
    for name in ['modlist.txt', 'plugins.txt', 'loadorder.txt']:
        if (PROFILE / name).exists():
            shutil.copy2(PROFILE / name, backup / name)
    shutil.copy2(ROOT / 'MO2/ModOrganizer.ini', backup / 'ModOrganizer.ini')
    # Preserve the latest save and its SKSE companion without editing either.
    saves = sorted((PROFILE / 'saves').glob('*.ess'), key=lambda p: p.stat().st_mtime, reverse=True)
    saved = []
    if saves:
        (backup / 'saves').mkdir()
        for source in [saves[0], saves[0].with_suffix('.skse')]:
            if source.exists():
                shutil.copy2(source, backup / 'saves' / source.name)
                saved.append({'name': source.name, 'sha256': sha(source)})
    for name in ['SkyrimNet.log', 'IntelEngine.log', 'crash-2026-09-29-17-49-05.log', 'crash-2026-09-29-03-07-32.log']:
        source = Path(r'C:\Users\fhg_r\OneDrive\Dokumente\My Games\Skyrim Special Edition\SKSE') / name
        if source.exists():
            (backup / 'logs').mkdir(exist_ok=True)
            shutil.copy2(source, backup / 'logs' / name)
    # The only changes are two mod activation flags and one plugin activation flag.
    for name, contents in updated.items():
        if (PROFILE / name).read_bytes() != original[name]:
            raise RuntimeError('Profile changed during preparation.')
    for name, contents in updated.items():
        (PROFILE / name).write_bytes(contents)
    for name, contents in updated.items():
        assert (PROFILE / name).read_bytes() == contents
    state = {'profile': str(PROFILE), 'backup': str(backup), 'disabled_mods': MODS,
             'disabled_plugin': 'DynamicCombatCollision.esp', 'saved_game_backup': saved,
             'changed_files': {name: {'before': hashlib.sha256(original[name]).hexdigest(),
                                      'after': sha(PROFILE / name)} for name in updated}}
    (backup / 'manifest.json').write_text(json.dumps(state, indent=2), encoding='utf-8')
    (WORK / 'applied.json').write_text(json.dumps(state, indent=2), encoding='utf-8')
    print(json.dumps(state, indent=2))

if __name__ == '__main__':
    main()
