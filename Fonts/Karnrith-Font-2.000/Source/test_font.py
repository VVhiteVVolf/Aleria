"""Validate coverage, layout behavior, saved formats and language contents."""
from pathlib import Path
import hashlib,json,unicodedata as ud
from itertools import product
from fontTools.ttLib import TTFont
import uharfbuzz as hb

ROOT=Path(__file__).resolve().parent.parent
records=json.loads((ROOT/'alphabet.json').read_text(encoding='utf-8'))
coverage=json.loads((ROOT/'zeichensatz.json').read_text(encoding='utf-8'))
language=json.loads((ROOT/'Sprache/morgar.json').read_text(encoding='utf-8'))
expected={int(r['codepoint'][2:],16):r['glyph'] for r in coverage}
required=set(range(32,127))|set(range(160,384))|{0x1E9E}|set(range(0xE300,0xE31E))|set(range(0xE500,0xE51E))
assert required<=expected.keys(),sorted(required-expected.keys())
path=ROOT/'fonts/KarnrithTiefenrunen-Regular.ttf';base=TTFont(path)
assert base.getGlyphOrder()[0]=='.notdef' and base.getBestCmap()==expected
for ext in ('ttf','woff','woff2','otf'):
    f=TTFont(path.with_suffix('.'+ext))
    assert f.getBestCmap()==expected and f.getGlyphOrder()==base.getGlyphOrder()
    for table in ('hmtx','GSUB','GPOS'):assert f.getTableData(table)==base.getTableData(table),(ext,table)
    if ext!='otf':assert f.getTableData('glyf')==base.getTableData('glyf')
    else:assert f.sfntVersion=='OTTO' and 'CFF ' in f
    assert f['OS/2'].fsType==0 and f['head'].fontRevision==3.0
    print(f'{ext}: coverage, metrics and OpenType rules PASS')
fonts={ext:hb.Font(hb.Face(path.with_suffix('.'+ext).read_bytes())) for ext in ['ttf','otf']}
def shape(text,features=None,ext='ttf'):
    b=hb.Buffer();b.add_str(text);b.guess_segment_properties();hb.shape(fonts[ext],b,features or {})
    return [(base.getGlyphName(i.codepoint),p.x_advance,p.x_offset,p.y_offset) for i,p in zip(b.glyph_infos,b.glyph_positions)]
for cp in expected:
    assert all(v[0]!='.notdef' for v in shape(chr(cp))),hex(cp)
    assert shape(chr(cp))==shape(chr(cp),ext='otf'),('CFF shaping',hex(cp))
for cp in range(192,384):
    c=chr(cp);assert shape(c)==shape(ud.normalize('NFD',c)),c
for r in records:
    for cp in [r['codepoint'],r['legacyCodepoint']]:assert expected[int(cp[2:],16)]==r['glyph']
    assert [g[0] for g in shape(r['char'])]==[r['glyph']]
for token,g in [('NG','rune17'),('TH','rune21'),('KH','rune22'),('GH','rune25'),('SH','rune26'),('CH','rune27'),('DH','rune28')]:
    for letters in product(*[(c,c.lower()) for c in token]):
        s=''.join(letters);assert [v[0] for v in shape(s)]==[g],s
        assert len(shape(s,{'liga':False}))==2,s
for a in records:
    for b in records:assert [v[0] for v in shape(a['char']+b['char'])]==[a['glyph'],b['glyph']]
assert shape('ß')==shape('ẞ') and shape('ß')!=shape('S') and len(shape('SS'))==2
for a,b in [('T','TH'),('C','CH'),('C','K'),('C','Q'),('J','I'),('X','S'),('0','O'),('Ä','A'),('Ö','O'),('Ü','U'),('Á','A'),('Ý','Y')]:assert shape(a)!=shape(b),(a,b)
masters=json.loads((ROOT/'source/design-manifest.json').read_text(encoding='utf-8'))
assert len({hashlib.sha256(base['glyf'][m['glyph']].compile(base['glyf'])).hexdigest() for m in masters})==50
for name in base.getGlyphOrder():
    g=base['glyf'][name];g.recalcBounds(base['glyf'])
    if g.numberOfContours:
        assert g.yMax<=1000 and g.yMin>=-240,(name,g.yMin,g.yMax)
        advance,_=base['hmtx'][name]
        if advance:assert g.xMax<=advance,(name,g.xMax,advance)
assert len(language['roots'])==30 and len(language['affixes'])==33
assert len(language['words'])==100 and len(language['names'])==200
assert len({w['new'] for w in language['words']})==100
for sex in ['männlich','weiblich']:assert len({n['new'] for n in language['names'] if n['group']==sex})==100
for item in language['words']+language['names']:
    assert item['new']==item['syllables'].replace('-','')
    assert all(v[0]!='.notdef' for v in shape(item['new'])),item['new']
    assert shape(item['new'])==shape(item['new'],ext='otf'),item['new']
for s in ['König Kök: zwölf Jäger, große Wölfe & 25 €!','CJXcjx Qq ÄÖÜ äöü ßẞ ÁÉÍÓÚÝ áéíóúý','ĞİıŞÇç Éé Ññ Łł Ææ Œœ','0123456789 [ ] { } @ # % \\ / ←↑→↓↔ ≠≤≥≈∞ ⁰¹²³ ₀₁₂₃']:
    assert all(v[0]!='.notdef' for v in shape(s))
print('473 codepoints, NFC/NFD, 28 case variants, 900 PUA pairs, 50 distinct masters, bounds, 100 words and 200 names PASS.')
