"""Install validated Veronica ESPFE into the selected, closed MO2 profile only."""
from datetime import datetime
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
import zipfile

sys.path.insert(0, r'E:\Aleria\skyrim-outfit-catalog\scripts')
from profile_reader import selected_profile
from plugin_reader import records, text

ROOT = Path(__file__).parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
NAME = 'Veronica - ESPFE 20261014'
OLD = 'Veronica The Flirty Imperial Milf SE'
PACKAGE = ROOT / 'packages' / NAME
TARGET = INSTANCE / 'MODS/mods' / NAME
PREP = json.loads((ROOT / 'preparation.json').read_text())
VALIDATION = json.loads((ROOT / 'validation.json').read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def running(name):
    result = subprocess.run(['tasklist', '/FI', f'IMAGENAME eq {name}', '/NH'], capture_output=True, text=True, check=True)
    return name.lower() in result.stdout.lower()

assert not running('SkyrimSE.exe') and not running('ModOrganizer.exe'), 'Close Skyrim and MO2 first'
before = selected_profile(INSTANCE)
assert before['profile'] == PREP['profile'] and before['fingerprint'] == PREP['fingerprint'], 'Profile changed; inspect again'
assert OLD in before['active_mods'] and NAME not in before['active_mods']
assert 'VeronicaFollower.esp' in before['plugins']
assert not any('eudora' in p.lower() for p in before['plugins']), 'Unexpected active Eudora'
assert not TARGET.exists(), 'Destination already exists; do not merge blindly'
assert sha(PACKAGE / 'VeronicaFollower.esp') == VALIDATION['sha256']
assert sha(Path(PREP['packages'][0]['source']) / 'VeronicaFollower.esp') == PREP['packages'][0]['sha256_original']
for name in before['plugins']:
    if name == 'VeronicaFollower.esp':
        continue
    header = next(records(before['providers'][name.lower()]['path'], (b'TES4',)))
    assert not any(k == b'MAST' and text(v).lower() == 'veronicafollower.esp' for k, v in header[3]), f'Unplanned dependent: {name}'

profile = before['directory']
backup = ROOT / 'backup' / before['profile']
backup.mkdir(parents=True, exist_ok=False)
control = ('modlist.txt', 'plugins.txt', 'loadorder.txt')
for name in control:
    shutil.copy2(profile / name, backup / name)
protected = {str(p): sha(p) for p in Path(PREP['packages'][0]['source']).rglob('*') if p.is_file()}
for _, source in before['sources']:
    skn = source / 'SKSE/Plugins/SkyrimNet'
    for section in ('config', 'overlay', 'external'):
        folder = skn / section
        if folder.exists():
            protected.update({str(p): sha(p) for p in folder.rglob('*') if p.is_file()})
for other in (INSTANCE / 'MODS/profiles').iterdir():
    if other.is_dir() and other != profile:
        protected.update({str(other / name): sha(other / name) for name in control if (other / name).is_file()})

lines = (profile / 'modlist.txt').read_bytes().splitlines(keepends=True)
matches = [i for i, line in enumerate(lines) if line.decode('utf-8-sig').strip() == '+' + OLD]
assert len(matches) == 1
index = matches[0]
ending = b'\r\n' if lines[index].endswith(b'\r\n') else b'\n'
lines[index:index+1] = [('+' + NAME).encode() + ending, ('-' + OLD).encode() + ending]

try:
    shutil.copytree(PACKAGE, TARGET)
    for file in PACKAGE.rglob('*'):
        if file.is_file():
            assert sha(file) == sha(TARGET / file.relative_to(PACKAGE))
    (profile / 'modlist.txt').write_bytes(b''.join(lines))
    after = selected_profile(INSTANCE)
    assert set(after['active_mods']) == set(before['active_mods']) - {OLD} | {NAME}
    assert after['plugins'] == before['plugins']
    assert after['providers']['veronicafollower.esp']['mod'] == NAME
    counts = {'full': 0, 'light': 0}
    active = {p.lower() for p in after['plugins']}
    for name in after['plugins']:
        header = next(records(after['providers'][name.lower()]['path'], (b'TES4',)))
        counts['light' if header[1] & 0x200 else 'full'] += 1
        for kind, value in header[3]:
            if kind == b'MAST':
                assert text(value).lower() in active, f'Missing active master: {name}: {text(value)}'
    assert counts == {'full': 252, 'light': 3785}, counts
    assert sha(profile / 'plugins.txt') == PREP['fingerprint']['plugins.txt']
    assert sha(profile / 'loadorder.txt') == PREP['fingerprint']['loadorder.txt']
    assert all(sha(Path(path)) == digest for path, digest in protected.items()), 'Protected file changed'
except Exception:
    shutil.copy2(backup / 'modlist.txt', profile / 'modlist.txt')
    # Leave an inactive package available for inspection; never remove unrelated files.
    raise

receipt = {'time': datetime.now().isoformat(), 'profile': after['profile'], 'installed': NAME,
           'disabled_original': OLD, 'original_retained': PREP['packages'][0]['source'],
           'counts': counts, 'normal_slots_free': 254 - counts['full'],
           'eudora_installed': False, 'protected_files_verified': len(protected),
           'fingerprint': after['fingerprint'], 'validation': VALIDATION,
           'save_warning': 'Use a save from before Veronica was loaded; compacted FormIDs are not an automatic migration of existing save references.'}
(ROOT / 'installation.json').write_text(json.dumps(receipt, indent=2, ensure_ascii=False, default=str), encoding='utf-8')
with zipfile.ZipFile(ROOT / 'migration-veronica-espfe.zip', 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=4) as archive:
    for file in TARGET.rglob('*'):
        if file.is_file():
            archive.write(file, str(Path('mods') / NAME / file.relative_to(TARGET)))
    for name in control:
        archive.write(profile / name, str(Path('profiles') / after['profile'] / name))
    for name in ('installation.json', 'validation.json', 'veronica-formid-map.json'):
        archive.write(ROOT / name, name)
print(json.dumps(receipt, indent=2, ensure_ascii=False, default=str))
