"""Assess record ownership and dependency cost of full plugins, read-only."""
from pathlib import Path
from collections import Counter
import json
import mmap
import struct

ROOT = Path(__file__).parent
inventory = json.loads((ROOT / 'inventory.json').read_text())
by_name = {row['plugin'].lower(): row for row in inventory['plugins']}
details = []
for row in inventory['plugins']:
    if row['light']:
        continue
    types, own_types = Counter(), Counter()
    new_ids = []
    with Path(row['path']).open('rb') as stream, mmap.mmap(stream.fileno(), 0, access=mmap.ACCESS_READ) as data:
        cursor = 0
        while cursor + 24 <= len(data):
            kind, size, flags, form = struct.unpack_from('<4sIII', data, cursor)
            if kind == b'GRUP':
                cursor += 24
                continue
            if cursor + 24 + size > len(data):
                raise ValueError(f'Truncated record in {row["plugin"]}')
            if kind != b'TES4':
                types[kind.decode('ascii')] += 1
                if (form >> 24) == len(row['masters']):
                    new_ids.append(form & 0xFFFFFF)
                    own_types[kind.decode('ascii')] += 1
            cursor += 24 + size
    within_range = not new_ids or all(0x800 <= form <= 0xFFF for form in new_ids)
    candidate = within_range and len(new_ids) <= 2048 and not any(kind in own_types for kind in ('CELL', 'NAVM'))
    closure = [by_name[name.lower()] for name in row['dependent_closure']]
    detail = {**row, 'record_types': dict(types), 'new_record_types': dict(own_types),
              'new_record_count': len(new_ids), 'new_id_min': min(new_ids) if new_ids else None,
              'new_id_max': max(new_ids) if new_ids else None,
              'flag_only_structural_candidate': candidate,
              'removal_cluster_full': 1 + sum(not item['light'] for item in closure),
              'removal_cluster_light': sum(item['light'] for item in closure)}
    details.append(detail)

(ROOT / 'full-plugin-analysis.json').write_text(json.dumps(details, indent=2), encoding='utf-8')
print('STRUCTURAL CANDIDATES FOR FLAG-ONLY REVIEW (not approved conversions):')
for row in details:
    if row['flag_only_structural_candidate']:
        print(row['plugin'], '| new=', row['new_record_count'], '| types=', row['new_record_types'], '| dependents=', len(row['dependent_closure']))
print('SMALL OPTIONAL PLUGINS WITH NO DIRECT MASTER DEPENDENTS:')
for row in details:
    if row['record_count'] < 500 and not row['dependent_closure']:
        print(row['plugin'], '| new=', row['new_record_count'], '| flag-only=', row['flag_only_structural_candidate'])
