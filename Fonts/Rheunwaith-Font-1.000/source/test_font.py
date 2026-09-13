"""Run with fonttools and uharfbuzz. Validates the shipped font family."""
from pathlib import Path
import hashlib,json,unicodedata as ud
from itertools import product
from fontTools.ttLib import TTFont
import uharfbuzz as hb

ROOT=Path(__file__).resolve().parent.parent
records=json.loads((ROOT/'alphabet.json').read_text(encoding='utf-8'))
coverage=json.loads((ROOT/'zeichensatz.json').read_text(encoding='utf-8'))
expected={int(r['codepoint'][2:],16):r['glyph'] for r in coverage}
required=set(range(32,127))|set(range(160,384))|{0x1E9E}|set(range(0xE300,0xE31E))|set(range(0x10C00,0x10C1E))
assert required<=expected.keys(),sorted(required-expected.keys())
base=TTFont(ROOT/'fonts/Rheunwaith-Regular.ttf')
assert base.getGlyphOrder()[0]=='.notdef'
assert base.getBestCmap()==expected
for ext in ('ttf','woff','woff2'):
    f=TTFont(ROOT/f'fonts/Rheunwaith-Regular.{ext}')
    assert f.getBestCmap()==expected and f.getGlyphOrder()==base.getGlyphOrder()
    for table in ('glyf','hmtx','GSUB','GPOS'):assert f.getTableData(table)==base.getTableData(table),(ext,table)
    assert f['OS/2'].fsType==0
    print(f'{ext}: {len(expected)} codepoints; matching outlines, metrics, GSUB and GPOS PASS')
font=hb.Font(hb.Face((ROOT/'fonts/Rheunwaith-Regular.ttf').read_bytes()))
def shape(text,features=None):
    b=hb.Buffer();b.add_str(text);b.guess_segment_properties();hb.shape(font,b,features or {})
    return [(base.getGlyphName(i.codepoint),p.x_advance,p.x_offset,p.y_offset) for i,p in zip(b.glyph_infos,b.glyph_positions)]
for cp in expected:assert all(v[0]!='.notdef' for v in shape(chr(cp))),hex(cp)
for cp in range(192,384):
    c=chr(cp);assert shape(c)==shape(ud.normalize('NFD',c)),c
for r in records:
    for cp in [r['codepoint'],r['legacyCodepoint']]:assert expected[int(cp[2:],16)]==r['glyph']
    assert [g[0] for g in shape(r['char'])]==[r['glyph']]
for token,g in [('CH','rune27'),('LL','rune25'),('NG','rune26'),('RH','rune28'),('TH','rune18')]:
    for letters in product(*[(c,c.lower()) for c in token]):
        s=''.join(letters)
        assert [v[0] for v in shape(s)]==[g],s
        assert len(shape(s,{'liga':False}))==2,s
for a in records:
    for b in records:assert [v[0] for v in shape(a['char']+b['char'])]==[a['glyph'],b['glyph']]
assert shape('ß')==shape('ẞ') and len(shape('SS'))==2
assert shape('Q')!=shape('K') and shape('K')!=shape('C')
masters=[r['glyph'] for r in records]+['extraQ','extraSharpS']
assert len({hashlib.sha256(base['glyf'][n].compile(base['glyf'])).hexdigest() for n in masters})==32
for name in base.getGlyphOrder():
    g=base['glyf'][name];g.recalcBounds(base['glyf'])
    if g.numberOfContours:
        assert g.yMax<=1000 and g.yMin>=-240,(name,g.yMin,g.yMax)
        advance,_=base['hmtx'][name]
        if advance:assert g.xMax<=advance,(name,g.xMax,advance)
for text in ['Gawain Tristan Chwerw Llwyd Ngoll Rhyd Thal','König Kök: zwölf Jäger, große Wölfe & 25 €!','ÄÖÜ äöü ßẞ Qq JKjk','ĞİıŞÇç Éé Ññ Łł Ææ Œœ','0123456789 [ ] { } @ # % \\ / ←↑→↓↔ ≠≤≥≈∞ ⁰¹²³ ₀₁₂₃']:
    assert all(v[0]!='.notdef' for v in shape(text))
print('Coverage, NFC/NFD, 20 mixed-case ligatures, 900 PUA pairs, 32 distinct masters and bounds PASS')
