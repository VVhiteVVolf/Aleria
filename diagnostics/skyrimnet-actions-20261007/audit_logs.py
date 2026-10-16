"""Read-only, bounded analysis of the supplied SkyrimNet log bundle."""
from pathlib import Path
from collections import Counter
import json
import re

ROOT = Path(r'C:\Users\fhg_r\Downloads\Logs')
OUT = Path(__file__).parent
PREFIX = re.compile(r'^\[(.*?)\] \[\d+\] \[(\w+)\] \[([^]]+)\] (.*)$')

def main():
    warnings = Counter()
    examples = {}
    actions = []
    parsed = Counter()
    selectors = []
    packages = []
    quest = []
    for number, line in enumerate((ROOT / 'SkyrimNet.log').open(encoding='utf-8', errors='replace'), 1):
        match = PREFIX.match(line.rstrip())
        if not match:
            continue
        stamp, level, source, body = match.groups()
        record = {'line': number, 'time': stamp, 'source': source, 'message': body[:1700]}
        if level in ('warning', 'error', 'critical'):
            key = re.sub(r'trace_id:[^ ]* span_id:[^]]*', 'trace', body)
            key = re.sub(r'\b\d+\b', '#', key)
            key = re.sub(r'0x[0-9A-Fa-f]+', '<address>', key)
            key = source.split(':')[0] + ': ' + key[:250]
            warnings[key] += 1
            examples.setdefault(key, record)
        if 'ActionQueue: Executing action ' in body:
            actions.append(record)
        if 'Successfully parsed action ' in body:
            parsed[re.search(r"parsed action '([^']+)'", body)[1]] += 1
        if 'ActionSelector::RunSelectionLlm: LLM response' in body or 'did not match' in body or 'HandleEmbeddedActionResponse:' in body and 'No embedded action' not in body:
            selectors.append(record)
        if any(word in source for word in ('Package', 'QuestScript', 'TalkTo')) and any(word in body.lower() for word in ('follow', 'dismiss', 'cancel', 'remove', 'clear', 'plunderer')):
            packages.append(record)
        if any(word in body for word in ('QUEST-TIF', 'TriggerDialogueLine:','already-fired', 'already fired')):
            quest.append(record)
    report = {
        'warnings': [{'count': count, 'signature': sig, 'example': examples[sig]} for sig, count in warnings.most_common()],
        'executed_actions': actions, 'parsed_embedded_actions': dict(parsed),
        'selection_results': selectors, 'packages': packages, 'quest_events': quest,
    }
    (OUT / 'log-analysis.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'warning_groups': len(warnings), 'warning_total': sum(warnings.values()), 'executed_action_counts': dict(Counter(re.search(r"action '([^']+)'", a['message'])[1] for a in actions)), 'parsed_actions': dict(parsed), 'quest_events': len(quest)}, ensure_ascii=False))
    for entry in report['warnings'][:28]:
        print(entry['count'], entry['example']['line'], entry['signature'])
    print('--- Transfer/follower/quest execution ---')
    for a in actions:
        if re.search(r'Gold|Item|Trade|Follow|Companion|Dismiss|Escort|Task|Dialogue|Accompany', a['message'], re.I):
            print(a['line'], a['time'], a['message'])

if __name__ == '__main__':
    main()
