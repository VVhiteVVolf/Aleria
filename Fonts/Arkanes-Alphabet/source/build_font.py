"""Run with Python 3 and fonttools[woff]. Compiles the editable SVG glyphs."""
from pathlib import Path
import json,re,xml.etree.ElementTree as ET
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.ttLib import TTFont
from compatibility import extend

SOURCE=Path(__file__).resolve().parent;ROOT=SOURCE.parent
records=json.loads((ROOT/'alphabet.json').read_text(encoding='utf-8'))
manifest=json.loads((SOURCE/'design-manifest.json').read_text(encoding='utf-8'))
glyphs={};metrics={}
for i,(r,m) in enumerate(zip(records,manifest)):
    w,h=m['sourcePixels'];pad=12;scale=min(740/h,720/w)
    pen=TTGlyphPen(None);convert=Cu2QuPen(pen,max_err=0.65,reverse_direction=True)
    tree=ET.parse(SOURCE/f'glyphs/{i+1:02}-{r["name"]}.svg').getroot()
    for path in tree.iter('{http://www.w3.org/2000/svg}path'):
        if path.attrib.get('fill','').upper() in ['#FFFFFF','WHITE']:continue
        t=re.search(r'translate\(([-.\d]+)[ ,]+([-.\d]+)\)',path.attrib.get('transform',''))
        tx,ty=map(float,t.groups()) if t else (0,0)
        target=TransformPen(convert,(scale,0,0,-scale,70+(tx-pad)*scale,40+(h+pad-ty)*scale))
        parse_path(path.attrib['d'],target)
    glyphs[r['glyph']]=pen.glyph();metrics[r['glyph']]=(m['advance'],70)

inputs={r['token']:'input'+str(i).zfill(2) for i,r in enumerate(records) if len(r['token'])==1}
order=['.notdef','space']+[r['glyph'] for r in records]+list(inputs.values())
p=TTGlyphPen(None)
for contour in [[(70,40),(70,780),(540,780),(540,40)],[(115,85),(495,85),(495,735),(115,735)]]:
    p.moveTo(contour[0])
    for xy in contour[1:]:p.lineTo(xy)
    p.closePath()
glyphs['.notdef']=p.glyph();metrics['.notdef']=(610,70)
glyphs['space']=TTGlyphPen(None).glyph();metrics['space']=(290,0)
cmap={32:'space',160:'space'}
for i,r in enumerate(records):
    cmap[0xE000+i]=r['glyph']
    if len(r['token'])==1:
        name=inputs[r['token']];p=TTGlyphPen(glyphs)
        p.addComponent(r['glyph'],(1,0,0,1,0,0));glyphs[name]=p.glyph();metrics[name]=metrics[r['glyph']]
        for c in set(r['token']+r['token'].lower()):cmap[ord(c)]=name
cmap[39]=inputs['’'];cmap[ord('Æ')]=cmap[ord('æ')]=records[31]['glyph']
extra_features,text_overrides=extend(glyphs,metrics,cmap,records)
order=['.notdef','space']+[g for g in glyphs if g not in {'.notdef','space'}]
fb=FontBuilder(1000,isTTF=True);fb.setupGlyphOrder(order);fb.setupCharacterMap(cmap)
fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=1000,descent=-220,lineGap=0)
fb.setupNameTable({'familyName':'Aleria Arcana','styleName':'Regular','uniqueFontIdentifier':'AleriaArcana-Regular-Ritual-3.000','fullName':'Aleria Arcana Regular','psName':'AleriaArcana-Regular','version':'Version 3.000','description':'Alte Ritualrunen. 33 canonical signs plus extended Latin, German, digits and punctuation.','licenseDescription':'Glyph artwork created for Aleria. Use, modification and web embedding permitted.'})
fb.setupOS2(sTypoAscender=1000,sTypoDescender=-220,sTypoLineGap=0,usWinAscent=1000,usWinDescent=220,fsType=0,sxHeight=740,sCapHeight=740)
fb.setupPost();fb.setupMaxp()
addOpenTypeFeaturesFromString(fb.font,(SOURCE/'ligatures.fea').read_text(encoding='utf-8')+extra_features)
(ROOT/'fonts').mkdir(exist_ok=True)
ttf=ROOT/'fonts/AleriaArcana-Regular.ttf';fb.save(ttf)
for ext in ['woff','woff2']:
    f=TTFont(ttf);f.flavor=ext;f.save(ttf.with_suffix('.'+ext))
text=TTFont(ttf)
# The installable text family keeps accent composition and positioning without
# requiring an application to disable the ritual font's letter ligatures.
addOpenTypeFeaturesFromString(
    text,
    'languagesystem DFLT dflt; languagesystem latn dflt;\n'+extra_features
)
for table in text['cmap'].tables:
    if table.isUnicode():table.cmap.update(text_overrides)
for nameid,value in {1:'Aleria Arcana Text',3:'AleriaArcana-Text-Ritual-3.000',4:'Aleria Arcana Text Regular',6:'AleriaArcana-Text'}.items():
    for platform,encoding,language in [(3,1,0x409),(1,0,0)]:text['name'].setName(value,nameid,platform,encoding,language)
textpath=ROOT/'fonts/AleriaArcana-Text.ttf';text.save(textpath)
for ext in ['woff','woff2']:
    f=TTFont(textpath);f.flavor=ext;f.save(textpath.with_suffix('.'+ext))
coverage=[{'character':chr(cp),'codepoint':f'U+{cp:04X}','glyph':g} for cp,g in sorted(cmap.items())]
(ROOT/'zeichensatz.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Built Aleria Arcana 3.0 and Text: {len(cmap)} codepoints, {len(glyphs)} glyphs.')
