"""Validate coverage, shaping, lore mappings, bounds and all three font files."""
from pathlib import Path
import json,unicodedata as ud,hashlib
from fontTools.ttLib import TTFont
import uharfbuzz as hb

ROOT=Path(__file__).resolve().parent.parent
records=json.loads((ROOT/'alphabet.json').read_text(encoding='utf-8'))
coverage=json.loads((ROOT/'zeichensatz.json').read_text(encoding='utf-8'))
expected={int(r['codepoint'][2:],16):r['glyph'] for r in coverage}
required=set(range(32,127))|set(range(160,384))|{0x1E9E}|set(range(0xE200,0xE21E))
assert required<=expected.keys(),sorted(required-expected.keys())
base=TTFont(ROOT/'fonts/Nharazim-Regular.ttf')
assert base.getGlyphOrder()[0]=='.notdef'
assert base.getBestCmap()==expected
for ext in ('ttf','woff','woff2'):
    f=TTFont(ROOT/f'fonts/Nharazim-Regular.{ext}')
    assert f.getBestCmap()==expected
    assert f.getGlyphOrder()==base.getGlyphOrder()
    for table in ('glyf','hmtx','GSUB','GPOS'):
        assert f.getTableData(table)==base.getTableData(table), (ext,table)
    assert f['OS/2'].fsType==0
    print(f'{ext}: {len(expected)} mapped codepoints; identical outlines, metrics and shaping tables PASS')
font=hb.Font(hb.Face((ROOT/'fonts/Nharazim-Regular.ttf').read_bytes()))
def shape(s):
    b=hb.Buffer();b.add_str(s);b.guess_segment_properties();hb.shape(font,b)
    return [(base.getGlyphName(i.codepoint),p.x_advance,p.x_offset,p.y_offset) for i,p in zip(b.glyph_infos,b.glyph_positions)]
for cp in expected:
    assert all(v[0]!='.notdef' for v in shape(chr(cp))),f'U+{cp:04X}'
for cp in range(192,384):
    s=chr(cp)
    assert shape(s)==shape(ud.normalize('NFD',s)),f'NFC/NFD mismatch {s}'
for r in records:
    cp=int(r['codepoint'][2:],16)
    for c in {r['token'],r['token'].lower(),chr(cp)}:
        assert [v[0] for v in shape(c)]==[r['glyph']],(c,r)
assert shape('ß')==shape('ẞ')
assert shape('K')!=shape('C') and len(shape('CH'))==2 and len(shape('SS'))==2
assert len({hashlib.sha256(base['glyf'][r['glyph']].compile(base['glyf'])).hexdigest() for r in records})==30
for a in records:
    for b in records:
        assert [v[0] for v in shape(a['char']+b['char'])]==[a['glyph'],b['glyph']]
for n in base.getGlyphOrder():
    g=base['glyf'][n];g.recalcBounds(base['glyf'])
    if g.numberOfContours:
        assert g.yMax<=1000 and g.yMin>=-240,(n,g.yMin,g.yMax)
        advance,_=base['hmtx'][n]
        if advance:assert g.xMax<=advance,(n,g.xMax,advance)
for text in ['König Kök grüßt zwölf Jäger: ÄÖÜ äöü ßẞ, QW!','0123456789 & @ # [] {} \\ / _ € ₺ £ ¥ © ® ™','ĞİıŞÇç Éé Ññ Łł Ææ Œœ','← ↑ → ↓ ↔ ≠ ≤ ≥ ≈ ∞ ⁰¹²³⁴⁵⁶⁷⁸⁹ ₀₁₂₃₄₅₆₇₈₉']:
    assert all(v[0]!='.notdef' for v in shape(text))
print('All mapped characters, NFC/NFD, 30 unique lore glyphs, 900 lore pairs, sample text and bounds PASS')
