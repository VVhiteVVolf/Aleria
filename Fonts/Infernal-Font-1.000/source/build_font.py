"""Rebuild Nharazim 2.000 from the included traced SVG master outlines.

Dependencies: fonttools[woff], brotli, shapely. Does not require image generation.
"""
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

ROOT=Path(__file__).resolve().parent.parent

def build():
    records=json.loads((ROOT/'alphabet.json').read_text(encoding='utf-8'))
    manifest=json.loads((ROOT/'source/design-manifest.json').read_text(encoding='utf-8'))
    glyphs={};metrics={};cmap={32:'space',160:'space'}
    p=TTGlyphPen(None)
    for contour in [[(70,40),(70,780),(540,780),(540,40)],[(115,85),(495,85),(495,735),(115,735)]]:
        p.moveTo(contour[0])
        for pt in contour[1:]:p.lineTo(pt)
        p.closePath()
    glyphs['.notdef']=p.glyph();metrics['.notdef']=(610,70)
    glyphs['space']=TTGlyphPen(None).glyph();metrics['space']=(300,0)
    for record,m in zip(records,manifest):
        w,h=m['sourcePixels'];scale=min(740/h,720/w);pad=12
        p=TTGlyphPen(None);converter=Cu2QuPen(p,max_err=.5,reverse_direction=True)
        tree=ET.parse(ROOT/m['svg']).getroot()
        for path in tree.iter('{http://www.w3.org/2000/svg}path'):
            if path.attrib.get('fill','').upper() in ['WHITE','#FFFFFF']:continue
            t=re.search(r'translate\(([-.\d]+)[ ,]+([-.\d]+)\)',path.attrib.get('transform',''))
            tx,ty=map(float,t.groups()) if t else (0,0)
            parse_path(path.attrib['d'],TransformPen(converter,(scale,0,0,-scale,70+(tx-pad)*scale,40+(h+pad-ty)*scale)))
        name=record['glyph'];glyphs[name]=p.glyph();metrics[name]=(round(w*scale+140),70)
        for char in {record['token'],record['token'].lower()}:cmap[ord(char)]=name
        cmap[int(record['codepoint'][2:],16)]=name
    cmap[0x1E9E]=cmap[ord('ß')]
    features,overrides=extend(glyphs,metrics,cmap,records)
    cmap.update(overrides)
    # Mathematic and editorial symbols outside the lore are real font glyphs too.
    def svg(name,path,advance):
        p=TTGlyphPen(None);parse_path(path,Cu2QuPen(p,max_err=.5,reverse_direction=True))
        glyphs[name]=p.glyph();metrics[name]=(advance,40);return name
    def comp(name,parts,advance):
        p=TTGlyphPen(None)
        for g,t in parts:glyphs[g].draw(TransformPen(p,t),glyphs)
        glyphs[name]=p.glyph();metrics[name]=(advance,40);return name
    ident=(1,0,0,1,0,0)
    arrow=svg('arrowRight','M60 382 C220 409 393 392 514 395 L432 485 C501 458 557 423 615 376 C550 335 497 304 434 275 L515 361 C361 362 200 350 60 382 Z',680)
    cmap[0x2192]=arrow
    cmap[0x2190]=comp('arrowLeft',[(arrow,(-1,0,0,1,680,0))],680)
    cmap[0x2191]=comp('arrowUp',[(arrow,(0,1,-1,0,570,20))],440)
    cmap[0x2193]=comp('arrowDown',[(arrow,(0,-1,1,0,-185,700))],440)
    cmap[0x2194]=comp('arrowBoth',[(arrow,ident),(arrow,(-1,0,0,1,680,0))],680)
    cmap[0x2212]='hyphen'
    cmap[0x2260]=comp('notEqual',[('equal',ident),('slash',(.7,0,0,.85,40,70))],450)
    cmap[0x2264]=comp('lessEqual',[('less',(.9,0,0,.8,0,120)),('hyphen',(1,0,0,1,0,-260))],455)
    cmap[0x2265]=comp('greaterEqual',[('greater',(.9,0,0,.8,0,120)),('hyphen',(1,0,0,1,0,-260))],455)
    cmap[0x2248]=comp('approximately',[('tilde',ident),('tilde',(1,0,0,1,0,140))],460)
    cmap[0x221E]=comp('infinity',[('digit8',(0,.65,-1,0,820,195))],810)
    cmap[0x2032]='quoteSingle';cmap[0x2033]='quoteDouble'
    cmap[0x2113]=cmap[ord('l')]
    cmap[0x20BA]=svg('turkishLira','M190 760 L257 741 L247 73 C434 86 489 188 499 300 L538 284 C520 113 404 36 189 25 Z M94 410 L387 566 L400 532 L99 370 Z M93 536 L386 691 L397 657 L98 496 Z',590)
    for c,n in [('⁰','0'),('⁴','4'),('⁵','5'),('⁶','6'),('⁷','7'),('⁸','8'),('⁹','9')]:
        cmap[ord(c)]=comp('super'+n,[('digit'+n,(.5,0,0,.5,0,390))],295)
    for n in range(10):cmap[0x2080+n]=comp('sub'+str(n),[('digit'+str(n),(.5,0,0,.5,0,-100))],295)
    for c,n in [('⁺','plus'),('⁻','hyphen'),('⁼','equal'),('⁽','parenLeft'),('⁾','parenRight')]:
        cmap[ord(c)]=comp('super'+n,[(n,(.55,0,0,.55,0,370))],round(metrics[n][0]*.55))
    for c,n in [('₊','plus'),('₋','hyphen'),('₌','equal'),('₍','parenLeft'),('₎','parenRight')]:
        cmap[ord(c)]=comp('sub'+n,[(n,(.55,0,0,.55,0,-100))],round(metrics[n][0]*.55))
    cmap[0x2028]=cmap[0x2029]='zeroWidth'
    # Correct real sidebearings and preserve headroom for marks/descenders.
    for name,g in glyphs.items():
        g.recalcBounds(glyphs)
        adv,_=metrics[name]
        metrics[name]=(max(adv,getattr(g,'xMax',0)+30) if adv else 0,getattr(g,'xMin',0))
    order=['.notdef','space']+[n for n in glyphs if n not in {'.notdef','space'}]
    fb=FontBuilder(1000,isTTF=True);fb.setupGlyphOrder(order);fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=1000,descent=-240,lineGap=0)
    fb.setupNameTable({'familyName':'Nharazim','styleName':'Regular','uniqueFontIdentifier':'Nharazim-Abgrundsigillen-2.000','fullName':'Nharazim Regular','psName':'Nharazim-Regular','version':'Version 2.000','description':'Abgrundsigillen: 30 fictional lore sigils plus extended Latin, German, digits, punctuation and symbols.','licenseDescription':'Artwork created for the Aleria project. Use, modification and web embedding permitted. No third-party font outlines included.'})
    fb.setupOS2(sTypoAscender=1000,sTypoDescender=-240,sTypoLineGap=0,usWinAscent=1000,usWinDescent=240,fsType=0,sxHeight=740,sCapHeight=740)
    fb.setupPost();fb.setupMaxp()
    addOpenTypeFeaturesFromString(fb.font,'languagesystem DFLT dflt;\nlanguagesystem latn dflt;\n'+features)
    (ROOT/'fonts').mkdir(exist_ok=True)
    target=ROOT/'fonts/Nharazim-Regular.ttf';fb.save(target)
    for ext in ('woff','woff2'):
        font=TTFont(target);font.flavor=ext;font.save(target.with_suffix('.'+ext))
    coverage=[{'character':chr(cp),'codepoint':f'U+{cp:04X}','glyph':g} for cp,g in sorted(cmap.items())]
    (ROOT/'zeichensatz.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Nharazim 2.000: {len(cmap)} codepoints, {len(glyphs)} glyphs; TTF, WOFF, WOFF2.')

if __name__=='__main__':build()
