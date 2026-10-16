"""Forward existing gameplay records and replace only requested appearance fields.

The gameplay master's complete index order is preserved. Its own slot becomes
an explicit master; only incoming appearance references need remapping.
No downloaded plugin is changed or compacted.
"""
from pathlib import Path
import json
import struct
import sys

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT.parents[1] / 'skyrim-outfit-catalog/scripts'))
from plugin_reader import records, text

APPEARANCE = {b'RNAM', b'WNAM', b'HCLF', b'FTST', b'PNAM', b'QNAM', b'NAM6', b'NAM7', b'NAM9', b'NAMA', b'DOFT', b'SOFT'}
REFERENCES = {b'RNAM', b'WNAM', b'HCLF', b'FTST', b'PNAM', b'DOFT', b'SOFT'}
TINT = {b'TINI', b'TINC', b'TINV', b'TIAS'}


def field(kind, data):
    if len(data) > 65535:
        return b'XXXX'+struct.pack('<HI', 4, len(data))+kind+b'\0\0'+data
    return kind+struct.pack('<H', len(data))+data


def record(kind, form, fields, flags=0):
    payload = b''.join(field(k, d) for k, d in fields)
    return struct.pack('<4sIIIIHH', kind, len(payload), flags & ~0x40000, form, 0, 44, 0)+payload


def grouped(fields):
    groups = []
    for kind, data in fields:
        key = b'TINT' if kind in TINT else kind
        if groups and groups[-1][0] == key:
            groups[-1][1].append((kind, data))
        else:
            groups.append((key, [(kind, data)]))
    return groups


def merge(gameplay, appearance, source_masters, masters):
    def remap(data):
        form = struct.unpack('<I', data)[0]
        if not form:
            return data
        owner = source_masters[form >> 24]
        return struct.pack('<I', (masters.index(owner) << 24) | (form & 0xffffff))
    source = [(k, remap(d) if k in REFERENCES else d) for k, d in appearance]
    old_groups = grouped(gameplay)
    source_groups = grouped(source)
    changed = []
    for key, values in source_groups:
        if key not in APPEARANCE | {b'TINT'}:
            continue
        matches = [i for i, (k, _) in enumerate(old_groups) if k == key]
        if matches:
            old_groups[matches[0]] = (key, values)
            for i in reversed(matches[1:]):
                old_groups.pop(i)
        else:
            source_pos = next(i for i, (k, _) in enumerate(source_groups) if k == key)
            following = [k for k, _ in source_groups[source_pos+1:]]
            insert = next((i for i, (k, _) in enumerate(old_groups) if k in following), len(old_groups))
            old_groups.insert(insert, (key, values))
        changed.append(key.decode())
    source_keys = {k for k, _ in source_groups}
    old_groups = [(k, values) for k, values in old_groups if k not in APPEARANCE | {b'TINT'} or k in source_keys]
    result = [item for _, values in old_groups for item in values]
    female = next(struct.unpack_from('<I', d)[0] & 1 for k, d in source if k == b'ACBS')
    result = [(k, struct.pack('<I', (struct.unpack_from('<I', d)[0] & ~1) | female)+d[4:] if k == b'ACBS' else d) for k, d in result]
    # Everything outside the explicitly chosen appearance fields must remain
    # byte-identical. Only the female bit in ACBS may change.
    def gameplay_only(fields):
        return [(k, (bytes([d[0] & 254])+d[1:]) if k == b'ACBS' else d)
                for k, d in fields if k not in APPEARANCE | TINT]
    assert gameplay_only(result) == gameplay_only(gameplay)
    return result, changed


def main():
    plan = json.loads((ROOT/'selected-stage.json').read_text(encoding='utf-8'))
    before = json.loads((ROOT/'npc-before.json').read_text(encoding='utf-8'))['winners']
    originals = {row['plugin'] for row in before.values()}
    if len(originals) != 1:
        raise ValueError('Expected common gameplay master for the four NPCs')
    original = next(iter(originals))
    first = next(iter(before.values()))
    header = next(records(first['path']))
    masters = [text(d) for k, d in header[3] if k == b'MAST'] + [original]
    mods = {m['index']: m for m in plan['mods']}
    appearance_files = {4: Path(mods[4]['directory'])/'EolaReplacer.esp',
                        26: Path(mods[26]['directory'])/'SN Cicero Replacer.esp'}
    for file in appearance_files.values():
        if file.name not in masters:
            masters.append(file.name)
    assert len(masters) < 253
    merged = []
    receipts = []
    for index, file in appearance_files.items():
        source_header = next(records(file))
        source_masters = [text(d) for k, d in source_header[3] if k == b'MAST']+[file.name]
        for _, flags, form, appearance in records(file, (b'NPC_',)):
            if form >> 24 == len(source_masters)-1:
                continue
            key = 'skyrim.esm:'+format(form & 0xffffff, '06x')
            row = before[key]
            gameplay_record = next(r for r in records(row['path'], (b'NPC_',)) if r[2] == int(row['form'], 16))
            data, changes = merge(gameplay_record[3], appearance, source_masters, masters)
            merged.append(record(b'NPC_', gameplay_record[2], data, gameplay_record[1]))
            receipts.append({'npc':key, 'appearance_plugin':file.name, 'gameplay_plugin':original,
                             'fields':changes, 'gameplay_data_preserved':True})
    name = 'Local - New Followers NPC Compatibility 20261007'
    target = ROOT/'staged'/name
    target.mkdir(parents=True, exist_ok=True)
    plugin = 'Local New Followers NPC Compatibility.esp'
    fields = [(b'HEDR', struct.pack('<fII', 1.7, len(merged), 0x800)),
              (b'CNAM', b'Local appearance compatibility\0'),
              (b'SNAM', b'Preserves Nolvus NPC gameplay and requested visual replacements.\0')]
    for master in masters:
        fields.extend([(b'MAST', master.encode('utf-8')+b'\0'), (b'DATA', b'\0'*8)])
    payload = b''.join(merged)
    group = struct.pack('<4sI4sIHHI', b'GRUP', 24+len(payload), b'NPC_', 0, 0, 0, 0)+payload
    (target/plugin).write_bytes(record(b'TES4', 0, fields, 0x200)+group)
    (target/'meta.ini').write_text('[General]\ngameName=SkyrimSE\nmodid=0\nversion=1.0\ncomments=Appearance compatibility; existing gameplay data verified byte-identical.\n', encoding='utf-8')
    plan['mods'].append({'index':32, 'name':name, 'directory':str(target), 'plugins':[plugin], 'options':[]})
    (ROOT/'selected-stage.json').write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding='utf-8')
    (ROOT/'npc-compatibility.json').write_text(json.dumps({'masters':masters, 'records':receipts}, indent=2), encoding='utf-8')
    print(json.dumps({'light_plugin':plugin, 'NPCs':len(receipts), 'gameplay_preserved':True}))


if __name__ == '__main__':
    main()
