"""Read the effective SkyrimNet audio prompt and public audio-tag switches only."""
from pathlib import Path
import hashlib
import json
import sys
import yaml

sys.path.insert(0, str(Path(r'E:\Aleria\skyrim-outfit-catalog\scripts')))
from profile_reader import selected_profile

ROOT = Path(__file__).parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
state = selected_profile(INSTANCE)
suffix = 'submodules/user_final_instructions/0650_audio_tags.prompt'
prompt_providers = []
config_providers = {}
for name, directory in state['sources']:
    skn = directory / 'SKSE/Plugins/SkyrimNet'
    if not skn.is_dir():
        continue
    for path in skn.rglob('0650_audio_tags.prompt'):
        prompt_providers.append({'mod': name, 'path': str(path),
                                 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    for filename in ('Inworld.yaml', 'SkyrimNet.yaml', 'TtsTextFilter.yaml'):
        path = skn / 'config' / filename
        if path.is_file():
            config_providers.setdefault(filename, {'mod': name, 'path': str(path)})

def public_fields(value, prefix=''):
    result = {}
    if isinstance(value, dict):
        for key, child in value.items():
            field = f'{prefix}.{key}'.strip('.')
            key_lower = str(key).lower()
            if any(word in key_lower for word in ('secret', 'key', 'token', 'password', 'endpoint')):
                continue
            if any(word in key_lower for word in ('audiotag', 'audio_tag', 'ttsengine', 'ttslanguage', 'modelid', 'modelname')):
                result[field] = child
            elif isinstance(child, dict):
                result.update(public_fields(child, field))
    return result

settings = {}
for filename, provider in config_providers.items():
    data = yaml.safe_load(Path(provider['path']).read_text(encoding='utf-8-sig'))
    settings[filename] = {**provider, 'public_fields': public_fields(data)}

registry_info = []
for name, directory in state['sources']:
    path = directory / 'SKSE/Plugins/SkyrimNet/content-registry.json'
    if path.is_file():
        data = json.loads(path.read_text(encoding='utf-8-sig'))
        registry_info.append({'mod': name, 'path': str(path), 'audio_entries':
                              {key: value for key, value in data.items() if 'audio' in key.lower()}})
        break

report = {'profile': state['profile'], 'fingerprint': state['fingerprint'],
          'prompt_providers': prompt_providers, 'settings': settings, 'registry': registry_info}
(ROOT / 'inspection.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
