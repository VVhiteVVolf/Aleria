"""Read only the public character database; write diagnostics, never sources."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
DATABASE = ROOT / 'CharakterDatenbank'
baseline = json.loads((ROOT / 'diagnostics/group-system-integration-2026-11-01/before-profile-hashes.json').read_text(encoding='utf-8'))
snapshot = json.loads((DATABASE / 'generated/characters.snapshot.json').read_text(encoding='utf-8'))
registry = json.loads((DATABASE / 'registry.json').read_text(encoding='utf-8'))

def gameplay_hash(row):
    data = {'inventory': row.get('inventory'), 'combatProfile': row.get('combatProfile')}
    return hashlib.sha256(json.dumps(data, sort_keys=True, separators=(',', ':'), ensure_ascii=True).encode()).hexdigest()

rows = {row['id']: row for row in snapshot['characters']}
records = {}
paths = {}
for entry in registry['records']:
    path = (DATABASE / entry['path']).resolve()
    path.relative_to((DATABASE / 'records').resolve())
    record = json.loads(path.read_text(encoding='utf-8'))['character']
    records[record['id']] = record
    paths[record['id']] = entry['path']

report = {
    'algorithm': "sha256(json.dumps({'inventory':row.get('inventory'),'combatProfile':row.get('combatProfile')},sort_keys=True,separators=(',',':'),ensure_ascii=True).encode())",
    'baselineCount': len(baseline), 'snapshotCount': len(rows), 'recordCount': len(records),
    'addedIds': sorted(set(rows) - set(baseline)), 'removedIds': sorted(set(baseline) - set(rows)),
    'changedSnapshotGameplay': [id for id, row in rows.items() if gameplay_hash(row) != baseline.get(id)],
    'changedRecordGameplay': [id for id, row in records.items() if gameplay_hash(row) != baseline.get(id)],
    'snapshotRecordMismatch': [id for id, row in rows.items() if id not in records or gameplay_hash(row) != gameplay_hash(records[id])]
}
(OUT / 'gameplay-preservation.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report))
assert len(baseline) == len(rows) == len(records) == 255
assert not any(report[key] for key in ['addedIds', 'removedIds', 'changedSnapshotGameplay', 'changedRecordGameplay', 'snapshotRecordMismatch'])
