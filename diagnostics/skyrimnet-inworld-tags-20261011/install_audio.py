"""Back up and replace exactly the existing enabled audio-tag prompt."""
from pathlib import Path
from datetime import datetime
import hashlib
import json
import shutil
import subprocess
import sys
import zipfile
import yaml

ROOT = Path(__file__).parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
sys.path.insert(0, str(Path(r'E:\Aleria\skyrim-outfit-catalog\scripts')))
from profile_reader import selected_profile

MOD = 'SkyrimNet - Beta 25 Local Compatibility'
RELATIVE = Path('SKSE/Plugins/SkyrimNet/external/local.inworld-audio-tags/prompts/submodules/user_final_instructions/0650_audio_tags.prompt')
TARGET = INSTANCE / 'MODS/mods' / MOD / RELATIVE
RUNTIME = INSTANCE / 'MODS/mods/SkyrimNet - Beta25 Test Runtime 20260927/SKSE/Plugins/SkyrimNet'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def require(condition, message):
    if not condition:
        raise RuntimeError(message)

inspection = json.loads((ROOT / 'inspection.json').read_text())
state = selected_profile(INSTANCE)
require(state['fingerprint'] == inspection['fingerprint'], 'Profile changed; re-inspect before installation')
require(MOD in state['active_mods'], 'Compatibility mod is not active')
require(sha(TARGET) == 'd9435fa66895286e44e9926d08652e1202180e8d904f91fd3357c4149ab23a39', 'Target prompt changed since inspection')
processes = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq SkyrimSE.exe', '/NH'], capture_output=True, text=True, check=True)
require('SkyrimSE.exe' not in processes.stdout, 'Skyrim must remain closed while replacing the prompt')
registry = json.loads((RUNTIME / 'content-registry.json').read_text(encoding='utf-8-sig'))
require(registry['plugins']['local.inworld-audio-tags']['enabled'], 'Local audio bundle disabled')
settings = yaml.safe_load((RUNTIME / 'config/Inworld.yaml').read_text(encoding='utf-8-sig'))
require(settings['enable_audio_tags'] is True, 'Inworld audio tags are disabled')
require(yaml.safe_load((RUNTIME / 'config/SkyrimNet.yaml').read_text(encoding='utf-8-sig'))['tts']['engine'] == 'inworld', 'TTS engine changed')
attachment = next(Path(r'C:\Users\fhg_r\.codex\attachments\28bcdd52-b5a2-4fb5-bb84-fb436b5859e6').glob('*.txt'))
require(sha(attachment) == sha(ROOT / 'candidate.prompt'), 'Candidate is not the exact provided attachment')
subprocess.run([str(ROOT / 'test_audio_prompt.exe'), str(ROOT / 'candidate.prompt')], check=True)

protected = [p for directory in (RUNTIME / 'config', RUNTIME / 'overlay', TARGET.parents[6] / 'Scripts')
             if directory.is_dir() for p in directory.rglob('*') if p.is_file()]
protected += [RUNTIME / 'content-registry.json']
protected += [state['directory'] / name for name in ('modlist.txt', 'plugins.txt', 'loadorder.txt')]
compatibility = INSTANCE / 'MODS/mods' / MOD
protected += [p for p in compatibility.rglob('*') if p.is_file() and p != TARGET]
protected = list(dict.fromkeys(protected))
before = {str(p): sha(p) for p in protected}
backup = ROOT / 'backup' / RELATIVE
require(not backup.exists(), 'Backup already exists; do not overwrite it')
backup.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(TARGET, backup)
try:
    shutil.copyfile(ROOT / 'candidate.prompt', TARGET)
    subprocess.run([str(ROOT / 'test_audio_prompt.exe'), str(TARGET)], check=True)
    require(sha(TARGET) == sha(attachment), 'Installed bytes differ from attachment')
    require(all(p.is_file() and sha(p) == before[str(p)] for p in protected), 'An unrelated protected file changed')
except Exception:
    shutil.copy2(backup, TARGET)
    raise

receipt = {
    'installed_at': datetime.now().astimezone().isoformat(),
    'profile': state['profile'], 'target': str(TARGET), 'backup': str(backup),
    'sha256_before': sha(backup), 'sha256_after': sha(TARGET),
    'source_attachment': str(attachment), 'attachment_installed_verbatim': True,
    'validation': '128 render cases passed before and after installation; no live paid TTS test',
    'protected_files_unchanged': len(protected),
    'inworld_audio_tags_enabled': True, 'tts_engine': 'inworld',
    'mod_activation_or_plugin_changes': False,
}
(ROOT / 'installation.json').write_text(json.dumps(receipt, indent=2), encoding='utf-8')
with zipfile.ZipFile(ROOT / 'migration-audio-tags.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.write(TARGET, (Path('mods') / MOD / RELATIVE).as_posix())
    archive.write(ROOT / 'installation.json', 'installation.json')
print(json.dumps(receipt, indent=2))
