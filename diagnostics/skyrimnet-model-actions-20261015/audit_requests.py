"""Read-only correlation of local request/response logs; never send prompts online."""
from collections import Counter, defaultdict
from pathlib import Path
import json
import re
import statistics

ROOT = Path(__file__).parent
LOGS = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet\logs')
HEADER = re.compile(r'^\[(.*?)\] \[([^]]*)\] (?:Generate(?:Streaming)?(?: complete)?|Decide) (request|response) \[([^]]*)\]:\s*$', re.M)

def entries(path):
    content = path.read_text(encoding='utf-8-sig', errors='replace')
    headers = list(HEADER.finditer(content))
    for i, match in enumerate(headers):
        yield (*match.groups(), content[match.end():headers[i+1].start() if i+1 < len(headers) else len(content)].strip())

requests = {}
errors = Counter()
for path in LOGS.glob('openrouter_input*.log'):
    for stamp, variant, kind, req, body in entries(path):
        if stamp < '2026-10-07':
            continue
        try:
            data = json.JSONDecoder(strict=False).raw_decode(body)[0]
        except (ValueError, TypeError):
            errors['input_json_decode'] += 1
            continue
        requests[req] = {'stamp': stamp, 'variant': variant, 'data': data}

counts = defaultdict(Counter)
sizes = defaultdict(list)
examples = []
responses = []
for path in LOGS.glob('openrouter_output*.log'):
    for stamp, variant, kind, req, body in entries(path):
        if stamp < '2026-10-07':
            continue
        request = requests.get(req)
        if not request:
            errors['response_without_retained_input'] += 1
            continue
        data = request['data']
        model = data.get('model', '(unknown)')
        key = (variant or 'dialogue', model)
        act = re.findall(r'^\s*ACTION:\s*(\w+)', body, re.M)
        any_action = 'ACTION:' in body
        wrapped = bool(re.search(r'^\s*[*_`]+\s*ACTION:', body, re.M))
        c = counts[key]
        c['responses'] += 1
        c['with_ACTION_marker'] += int(any_action)
        c['with_plain_ACTION_line'] += int(bool(act))
        c['wrapped_ACTION_line'] += int(wrapped)
        c['multiple_ACTION_markers'] += int(body.count('ACTION:') > 1)
        for a in act:
            c['action:' + a] += 1
        messages = data.get('messages', [])
        prompt = '\n'.join(m.get('content', '') for m in messages if isinstance(m.get('content'), str))
        sizes[key].append(len(prompt))
        dialogue = variant in ('', 'default')
        record = {'stamp': stamp, 'request': req, 'variant': variant, 'model': model,
                  'actions': act, 'wrapped': wrapped, 'prompt_chars': len(prompt), 'response_chars': len(body),
                  'has_action_rubric': '## Actions Available' in prompt,
                  'has_quest_prompt': '## Quests You Could Raise' in prompt,
                  'max_tokens': data.get('max_tokens'), 'temperature': data.get('temperature'),
                  'provider': data.get('provider'), 'reasoning': data.get('reasoning')}
        responses.append(record)
        if dialogue and (wrapped or stamp >= '2026-10-14'):
            examples.append({**record, 'response': body,
                             'last_user_message': next((m.get('content', '') for m in reversed(messages) if m.get('role') == 'user'), '')})

summary = []
for key, c in sorted(counts.items()):
    summary.append({'variant': key[0], 'model': key[1], **dict(c),
                    'median_prompt_chars': int(statistics.median(sizes[key])),
                    'max_prompt_chars': max(sizes[key])})
report = {'scope': '2026-10-07 onward; retained locally matched request/response pairs',
          'limitations': ['ACTION frequency is not action correctness or success rate.',
                          'Conversations differ between models; observational, not controlled A/B.',
                          'Request model can differ from actual responder after provider/model fallback.'],
          'pairing_errors': dict(errors), 'summary': summary, 'responses': responses, 'recent_dialogue_examples': examples}
(ROOT / 'request-audit.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
for row in summary:
    print(json.dumps(row, ensure_ascii=False))
print('PAIRING', dict(errors), 'EXAMPLES', len(examples))
