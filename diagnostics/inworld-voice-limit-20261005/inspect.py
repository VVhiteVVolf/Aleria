from pathlib import Path
import collections
import datetime
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
import yaml

sys.stdout.reconfigure(encoding='utf-8')
output = Path(r'E:\Aleria\diagnostics\inworld-voice-limit-20261005')
config_path = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet\config\Inworld.yaml')
config = yaml.safe_load(config_path.read_text(encoding='utf-8-sig'))
cache = config.get('clone_cache', {})
entries = cache.get('entries', [])
cached_keys = {entry.get('clone_key') for entry in entries}
key = str(config.get('api_key_base64', '')).strip()
if not key or '\r' in key or '\n' in key:
    raise RuntimeError('API-Zugangsdaten fehlen oder enthalten Zeilenumbrüche. Keine Zugangsdaten ausgeben.')
headers = {'Authorization': 'Basic ' + key, 'Accept': 'application/json'}
url = 'https://api.inworld.ai/voices/v1/voices'
request = urllib.request.Request(url, headers=headers, method='GET')
result = {
    'config_path': str(config_path), 'model': config.get('model_id'),
    'cache_max_voices': cache.get('max_voices'), 'cached_entries': len(entries),
    'distinct_cached_keys': len(cached_keys),
    'max_parallel_requests': config.get('max_parallel_requests'),
    'max_retries': config.get('max_retries'),
    'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'mutations': False
}
try:
    with urllib.request.urlopen(request, timeout=25) as response:
        data = json.load(response)
    result['api_status'] = 200
    result['response_keys'] = list(data) if isinstance(data, dict) else []
    voices = data.get('voices', []) if isinstance(data, dict) else []
    result['remote_voice_count_on_page'] = len(voices)
    result['has_next_page'] = bool(data.get('nextPageToken')) if isinstance(data, dict) else False
    result['voice_field_names'] = list(voices[0]) if voices else []
    # Nur Voice-Metadaten sichern. Weder API-Schlüssel noch HTTP-Header speichern.
    safe_voices = [{field: voice.get(field) for field in ['name', 'voiceId', 'displayName', 'description', 'source', 'owned', 'langCode', 'languageCode', 'createTime'] if field in voice} for voice in voices]
    owned = [voice for voice in safe_voices if voice.get('owned') is True]
    managed = [voice for voice in owned if 'skyrimnet_voice_key=' in str(voice.get('description', ''))]
    registered = [voice for voice in managed if voice.get('displayName') in cached_keys]
    unregistered = [voice for voice in managed if voice.get('displayName') not in cached_keys]
    result['owned_voice_count'] = len(owned)
    result['skyrimnet_managed_voice_count'] = len(managed)
    result['managed_voices_matching_local_cache'] = len(registered)
    result['managed_voices_not_in_local_cache'] = [{'displayName': voice.get('displayName'), 'voiceId': voice.get('voiceId')} for voice in unregistered]
    result['source_counts'] = dict(collections.Counter(str(voice.get('source')) for voice in safe_voices))
    result['voice_names_sample'] = safe_voices[:5]
    output.mkdir(parents=True, exist_ok=True)
    (output / 'remote-voices.json').write_text(json.dumps(safe_voices, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
except urllib.error.HTTPError as error:
    result['api_status'] = error.code
    try:
        message = json.loads(error.read().decode('utf-8')).get('message', 'Keine Fehlerbeschreibung')
        result['api_error'] = str(message).replace(key, '[REDACTED]')[:300]
    except (ValueError, UnicodeDecodeError):
        result['api_error'] = 'Keine JSON-Fehlerbeschreibung'
except (urllib.error.URLError, TimeoutError) as error:
    result['api_error'] = type(error).__name__
output.mkdir(parents=True, exist_ok=True)
(output / 'report.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
