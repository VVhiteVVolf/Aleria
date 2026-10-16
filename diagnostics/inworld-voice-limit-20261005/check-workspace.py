from pathlib import Path
import json
import urllib.request
import urllib.error
import urllib.parse
import yaml

root = Path(__file__).parent
report = json.loads((root / 'report.json').read_text(encoding='utf-8'))
config = yaml.safe_load(Path(report['config_path']).read_text(encoding='utf-8-sig'))
voices = json.loads((root / 'remote-voices.json').read_text(encoding='utf-8'))
workspace = str(config.get('workspace_id', '')).strip()
namespaces = sorted({str(v.get('name', '')).split('/')[1] for v in voices if str(v.get('name', '')).startswith('workspaces/')})
result = {'configured_workspace_matches_list': workspace in namespaces, 'list_workspace_count': len(namespaces), 'mutations': False}
url = 'https://api.inworld.ai/voices/v1/workspaces/' + urllib.parse.quote(workspace, safe='') + '/voices'
request = urllib.request.Request(url, headers={'Authorization': 'Basic ' + str(config['api_key_base64']).strip(), 'Accept': 'application/json'}, method='GET')
try:
    with urllib.request.urlopen(request, timeout=25) as response:
        data = json.load(response)
    current = data.get('voices', [])
    result.update(status=200, total_size=data.get('totalSize'), returned=len(current), next_page=bool(data.get('nextPageToken')), owned=sum(v.get('owned') is True for v in current), same_voice_ids={v.get('voiceId') for v in current} == {v.get('voiceId') for v in voices})
except urllib.error.HTTPError as error:
    result.update(status=error.code)
except (urllib.error.URLError, TimeoutError) as error:
    result.update(error=type(error).__name__)
(root / 'workspace-check.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, indent=2))
