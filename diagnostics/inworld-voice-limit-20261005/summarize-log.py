from pathlib import Path
import collections
import json
import re

root = Path(__file__).parent
log = Path(r'C:\Users\fhg_r\OneDrive\Dokumente\My Games\Skyrim Special Edition\SKSE\SkyrimNet.log')
counts = collections.Counter()
evidence = []
slots = []
with log.open(encoding='utf-8', errors='replace') as stream:
    for line in stream:
        timestamp = line[:25]
        if 'InworldInterface.cpp' in line:
            for pattern, label in [('Synthesis successful', 'successful_syntheses'), ('Clone response - status: 200', 'successful_clones'), ('Clone response - status: 400', 'clone_http_400'), ('Clone response - status: 429', 'clone_http_429'), ('DeleteVoice', 'delete_voice_log_entries')]:
                if pattern in line:
                    counts[label] += 1
            if 'Inworld clone slots:' in line:
                message = line.split('Inworld clone slots:', 1)[1].strip()
                if not slots or slots[-1]['counts'] != message:
                    slots.append({'time': timestamp, 'counts': message})
            if 'Clone response - status:' in line or 'Synthesis successful' in line:
                evidence.append(line.strip())
        if 'DELETE called for URL: https://api.inworld.ai/' in line:
            counts['inworld_delete_requests'] += 1
result = {'log_path': str(log), 'counts': dict(counts), 'slot_transitions': slots, 'recent_tts_evidence': evidence[-12:], 'mutations': False}
(root / 'log-summary.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, indent=2))
