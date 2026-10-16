"""Capture current local logs and correlate Bersi dialogue/action requests."""
from pathlib import Path
from collections import Counter
from datetime import datetime
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
LOGS = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet\logs')
HEADER = re.compile(r'^\[(.*?)\] \[([^]]*)\] (?:Generate(?:Streaming)?(?: complete)?|Decide) (request|response) \[([^]]*)\]:\s*$', re.M)
SNAPSHOT = ROOT / 'snapshot'
SNAPSHOT.mkdir(parents=True, exist_ok=True)

def entries(path):
    content = path.read_text(encoding='utf-8-sig', errors='replace')
    matches = list(HEADER.finditer(content))
    for i, match in enumerate(matches):
        yield {'stamp': match[1], 'variant': match[2], 'kind': match[3], 'request': match[4],
               'body': content[match.end():matches[i+1].start() if i+1 < len(matches) else len(content)].strip()}

for name in ('openrouter_input.log', 'openrouter_output.log', 'conversation_log.log'):
    if not (SNAPSHOT / name).exists(): shutil.copy2(LOGS / name, SNAPSHOT / name)
responses = {entry['request']: entry for entry in entries(SNAPSHOT / 'openrouter_output.log')}
relevant = []
all_today = []
parse_recoveries = []
parse_failures = []
for request in entries(SNAPSHOT / 'openrouter_input.log'):
    if request['stamp'] < '2026-10-15 21:00': continue
    raw = request.pop('body')
    try:
        data = json.JSONDecoder(strict=False).raw_decode(raw)[0]
    except (ValueError, TypeError) as error:
        # Diagnostic log text can contain unescaped literal backslashes. Repair
        # only the in-memory parser input; keep the original snapshot unchanged.
        recovered = re.sub(r'\\(?!["\\/bfnrtu])', lambda match: '\\\\', raw)
        try:
            data = json.JSONDecoder(strict=False).raw_decode(recovered)[0]
            parse_recoveries.append({'request': request['request'], 'error': str(error)})
        except (ValueError, TypeError) as second_error:
            parse_failures.append({'request': request['request'], 'error': str(second_error)})
            continue
    prompt = '\n'.join(m.get('content', '') for m in data.get('messages', []) if isinstance(m.get('content'), str))
    request.update(data=data, response=responses.get(request['request'], {}).get('body'))
    all_today.append(request)
    if 'Bersi' in prompt: relevant.append(request)
(ROOT / 'requests-today.json').write_text(json.dumps(all_today, ensure_ascii=False, indent=2), encoding='utf8')
(ROOT / 'bersi-requests.json').write_text(json.dumps(relevant, ensure_ascii=False, indent=2), encoding='utf8')
(ROOT / 'log-parsing.json').write_text(json.dumps({'recoveries': parse_recoveries, 'failures': parse_failures}, indent=2), encoding='utf8')
for request in relevant:
    data = request['data']
    if request['stamp'] < '2026-10-15 22:28': continue
    if request['variant'] not in ('', 'default', 'action_evaluation'): continue
    print(json.dumps({'stamp': request['stamp'], 'variant': request['variant'], 'request': request['request'],
        'model': data.get('model'), 'temperature': data.get('temperature'),
        'messages': [(m.get('role'), len(str(m.get('content', '')))) for m in data.get('messages', [])],
        'response': request['response']}, ensure_ascii=True))
print('COUNTS', Counter(r['variant'] for r in relevant))
