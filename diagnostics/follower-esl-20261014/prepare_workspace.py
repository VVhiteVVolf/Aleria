"""Stage independent copies of the two followers and their required masters."""
from pathlib import Path
import hashlib
import json
import shutil
import sys

sys.path.insert(0, r'E:\Aleria\skyrim-outfit-catalog\scripts')
from profile_reader import selected_profile

ROOT = Path(__file__).parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
DATA = ROOT / 'xedit-data'
MODS = ROOT / 'packages'
state = selected_profile(INSTANCE)
DATA.mkdir(exist_ok=True)
MODS.mkdir(exist_ok=True)
sources = {
    'Veronica - ESPFE 20261014': INSTANCE / 'MODS/mods/Veronica The Flirty Imperial Milf SE',
    'Eudora - ESPFE 20261014': Path(r'E:\Aleria\diagnostics\new-followers-20261007/staged/Local - Eudora - The Dibellan Shieldmaiden 20261007'),
}
receipt = []
for name, source in sources.items():
    target = MODS / name
    if not target.exists():
        shutil.copytree(source, target)
    for plugin in target.glob('*.esp'):
        shutil.copy2(plugin, DATA / plugin.name)
        receipt.append({'package': name, 'source': str(source), 'plugin': plugin.name,
                        'sha256_original': hashlib.sha256(plugin.read_bytes()).hexdigest()})

masters = ['Skyrim.esm', 'Update.esm', 'Dawnguard.esm', 'HearthFires.esm', 'Dragonborn.esm', 'SkyUI_SE.esp']
for name in masters:
    provider = state['providers'][name.lower()]
    target = DATA / name
    if not target.exists():
        shutil.copy2(provider['path'], target)

# Only these files are visible to this xEdit invocation; real game data is not used.
names = masters + ['VeronicaFollower.esp', 'EudoraFernFollwer.esp']
(ROOT / 'plugins.txt').write_bytes(('\r\n'.join('*' + name for name in names) + '\r\n').encode('ascii'))
(ROOT / 'loadorder.txt').write_bytes(('\r\n'.join(names) + '\r\n').encode('ascii'))
(ROOT / 'Skyrim.ini').write_bytes(b'[General]\r\nsLanguage=ENGLISH\r\n')
(ROOT / 'preparation.json').write_text(json.dumps({'profile': state['profile'], 'fingerprint': state['fingerprint'], 'packages': receipt}, indent=2), encoding='utf-8')
print('Independent follower packages and 6 copied masters staged.')
