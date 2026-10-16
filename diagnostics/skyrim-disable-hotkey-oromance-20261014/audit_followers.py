"""Assess remaining full follower plugins and previously excluded downloads."""
from pathlib import Path
from collections import Counter
import json
import mmap
import re
import struct
import sys

sys.path.insert(0, r'E:\Aleria\skyrim-outfit-catalog\scripts')
from profile_reader import selected_profile
from plugin_reader import fields, text

ROOT = Path(__file__).parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
state = selected_profile(INSTANCE)
plugin_names = ['Inigo.esp', 'Lucien.esp', '018Auri.esp', 'HLIORemi.esp', 'Katana.esp', 'VeronicaFollower.esp',
                'Lucien-AnniversaryEdition-Patch.esp', 'Lucien-Moonpath-Patch.esp', '018AuriVIGILANTpatch.esp']
subjects = []
for name in plugin_names:
    provider = state['providers'].get(name.lower())
    if provider:
        subjects.append({'name': name, 'path': provider['path'], 'mod': provider['mod'], 'active': name in state['plugins']})
old = json.loads(Path(r'E:\Aleria\diagnostics\new-followers-20261007/plugin-inventory.json').read_text())
for row in old:
    if row['index'] not in [13, 14, 16, 23, 24] or 'back up' in row['path'].lower() or row['light']:
        continue
    if Path(row['path']).is_file():
        subjects.append({'name': row['plugin'], 'path': Path(row['path']), 'mod': 'Previously excluded download', 'active': False})

result = []
for subject in subjects:
    path = subject['path']
    with path.open('rb') as stream:
        header = stream.read(24)
        _, size, flags, _ = struct.unpack_from('<4sIII', header)
        header_fields = list(fields(stream.read(size)))
    masters = [text(value) for kind, value in header_fields if kind == b'MAST']
    types, ids = Counter(), []
    with path.open('rb') as stream, mmap.mmap(stream.fileno(), 0, access=mmap.ACCESS_READ) as data:
        cursor = 0
        while cursor + 24 <= len(data):
            kind, size, record_flags, form = struct.unpack_from('<4sIII', data, cursor)
            if kind == b'GRUP':
                cursor += 24
                continue
            if kind != b'TES4' and form >> 24 == len(masters):
                types[kind.decode('ascii')] += 1
                ids.append(form & 0xFFFFFF)
            cursor += 24 + size
    source_roots = [path.parent / 'Scripts', path.parent / 'Source']
    source_hits = []
    checked = set()
    for source_root in source_roots:
        if source_root.is_dir():
            for source in source_root.rglob('*.psc'):
                if source in checked:
                    continue
                checked.add(source)
                for number, line in enumerate(source.read_text(encoding='utf-8-sig', errors='replace').splitlines(), 1):
                    if re.search(r'\bGetForm(?:FromFile|Ex)?\s*\(', line, re.I):
                        source_hits.append({'source': str(source), 'line': number, 'text': line.strip()[:200]})
    status = 'Too many new records for a single ESL' if len(ids) > 4096 else (
        'Flag-only structural candidate' if len(ids) <= 2048 and all(0x800 <= value <= 0xFFF for value in ids) and not types['CELL'] and not types['NAVM'] else (
            'Potential compacting candidate; verify scripts and external resources' if len(ids) <= 2048 else 'Requires extended ESL support and further checks'))
    result.append({**subject, 'path': str(path), 'own_records': len(ids), 'new_record_types': dict(types),
                   'min_id': min(ids) if ids else None, 'max_id': max(ids) if ids else None,
                   'source_files_scanned': len(checked), 'hardcoded_lookup_candidates': source_hits,
                   'assessment': status})

(ROOT / 'follower-esl-audit.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
lines = ['FOLLOWER – ESL-EIGNUNG, 14.10.2026',
         'Kein Follower wurde konvertiert. Alle gezählten Datensätze stammen aus den vorhandenen Plugins.',
         'Kein geprüfter voller Follower bzw. Begleiterpatch ist ohne FormID-Kompaktierung umstellbar.',
         'Bei Kompaktierung: Formreferenzen, FaceGen-Dateinamen und NIF-Pfade, Sprachdateien, SEQ, Scripts und alle Patches anpassen.',
         'Bereits in Spielständen benutzte normale Follower nicht still auf neu nummerierte IDs wechseln.', '']
for row in result:
    lines += [f'{row["name"]} | {"aktiv" if row["active"] else "nicht aktiv / Download"}',
              f'  Eigene neue Datensätze: {row["own_records"]}; neue CELL: {row["new_record_types"].get("CELL",0)}; neue NAVM: {row["new_record_types"].get("NAVM",0)}',
              f'  Befund: {row["assessment"]}',
              f'  Geprüfte PSC: {row["source_files_scanned"]}; mögliche fest codierte Formabfragen: {len(row["hardcoded_lookup_candidates"])}']
lines += ['', 'BEWERTUNG:',
          'Veronica, Eudora und Neisa liegen unter der alten ESL-Datensatzgrenze. Das macht sie zu Prüfkandidaten, nicht zu bereits validierten ESPFE-Versionen.',
          'Auri passt zahlenmäßig, ist wegen neuer CELL/NAVM, Dialogen, Scripts und vieler Folgepatches keine einfache Konvertierung.',
          'Inigo, Lucien, Remiel, Katana, Heart of Ice/Astrid und Ivar überschreiten sogar den erweiterten Bereich von 4096 eigenen Datensätzen.',
          'Eudoras zusätzliches Naughty-Voice-Plugin muss bei einer Umstellung der Hauptmod passend mit umgebaut werden.',
          'Auch kleine Lucien-/Auri-Kommentarpatches benötigen Kompaktierung und die Anpassung ihrer Sprach-/Questressourcen.',
          'Quelle zur FaceGen-/Sprach-/SEQ-Anpassung und bestehenden Spielständen: https://www.nexusmods.com/skyrimspecialedition/mods/56396?tab=description']
(ROOT / 'FOLLOWER_ESL_PRUEFBERICHT.txt').write_text('\n'.join(lines) + '\n', encoding='utf-8-sig')
for row in result:
    print(row['name'], row['own_records'], 'CELL', row['new_record_types'].get('CELL', 0), 'NAVM', row['new_record_types'].get('NAVM', 0), row['assessment'])
