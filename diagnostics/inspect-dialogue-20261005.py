from pathlib import Path
import collections
import json
import re
import sys
import yaml

sys.stdout.reconfigure(encoding='utf-8')
root = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet')
out = Path(r'E:\Aleria\diagnostics\skyrimnet-dialogue-repetition-20261005')
out.mkdir(exist_ok=True)
decoder = json.JSONDecoder(strict=False)
secret = re.compile(r'key|token|auth|password|credential', re.I)
def safe(value):
    if isinstance(value, dict):
        return {k: '[REDACTED]' if secret.search(k) else safe(v) for k,v in value.items()}
    if isinstance(value, list):
        return [safe(v) for v in value]
    return value
configs = {}
for name in ['SkyrimNet', 'OpenRouter', 'Events', 'Memory', 'NpcThoughts', 'PlayerDialogue', 'Entity', 'Diary', 'DynamicBio', 'DialogueFilter']:
    file = root / 'config' / (name + '.yaml')
    configs[name] = safe(yaml.safe_load(file.read_text(encoding='utf-8-sig')))
(out / 'settings-redacted.json').write_text(json.dumps(configs, indent=2, ensure_ascii=False), encoding='utf-8')
source = (root / 'logs' / 'openrouter_input.log').read_text(encoding='utf-8', errors='replace')
headers = list(re.finditer(r'^\[(.*?)\] \[(.*?)\] Generate(?:Streaming)? request \[(.*?)\]:\s*', source, re.M))
requests = []
parse_errors = []
for i, header in enumerate(headers):
    try:
        value, _ = decoder.raw_decode(source[header.end():].lstrip())
    except ValueError as error:
        if header.group(1) >= '2026-10-05 17:24:00':
            parse_errors.append({'timestamp':header.group(1),'error':str(error), 'prefix': source[header.end():header.end()+30]})
        continue
    if header.group(1) >= '2026-10-05 17:24:00':
        requests.append({'timestamp': header.group(1), 'category': header.group(2), 'id': header.group(3), 'request': safe(value)})
(out / 'latest-requests.json').write_text(json.dumps(requests, indent=2, ensure_ascii=False), encoding='utf-8')
summary = []
for item in requests:
    value = item['request']
    messages = value.get('messages', [])
    summary.append({'timestamp':item['timestamp'],'id':item['id'],'category':item['category'],'model':value.get('model'), 'temperature':value.get('temperature'), 'frequency_penalty':value.get('frequency_penalty'), 'presence_penalty':value.get('presence_penalty'), 'top_p':value.get('top_p'), 'message_count':len(messages), 'roles':dict(collections.Counter(m.get('role') for m in messages)), 'message_sizes':[len(str(m.get('content',''))) for m in messages], 'last_message_excerpt':str(messages[-1].get('content',''))[-650:] if messages else ''})
(out / 'request-summary.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding='utf-8')
print(json.dumps({'parsed_headers':len(headers), 'parse_errors':parse_errors[:3], 'requests':summary}, indent=2, ensure_ascii=False))
