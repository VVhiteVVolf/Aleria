"""Latin text extensions drawn from the existing ritual outlines.

No new lore values are assigned. All graphic components are original to this
package. Supports German, Latin-1, Latin Extended-A, digits and punctuation.
"""
import math,unicodedata as ud
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path
from shapely.geometry import Polygon
from shapely.ops import unary_union

def extend(glyphs,metrics,cmap,records):
    def put(name,g,adv,lsb=40):
        glyphs[name]=g;metrics[name]=(round(adv),lsb);return name
    def svg(name,path,adv):
        p=TTGlyphPen(None);parse_path(path,Cu2QuPen(p,max_err=.6,reverse_direction=True))
        return put(name,p.glyph(),adv)
    def comp(name,parts,adv):
        p=TTGlyphPen(None)
        def drawg(g,target):
            if glyphs[g].isComposite():
                for component in glyphs[g].components:
                    child,transform=component.getComponentInfo()
                    drawg(child,TransformPen(target,transform))
            else:glyphs[g].draw(target,glyphs)
        for g,t in parts:drawg(g,TransformPen(p,t))
        return put(name,p.glyph(),adv)
    def ribbon(name,lines,adv,width=44):
        polygons=[]
        for points in lines:
            left=[];right=[]
            for i,(x,y) in enumerate(points):
                a=points[max(0,i-1)];b=points[min(len(points)-1,i+1)]
                dx,dy=b[0]-a[0],b[1]-a[1];n=math.hypot(dx,dy) or 1
                t=i/max(1,len(points)-1)
                w=width*(.18+.82*math.sin(math.pi*t)**.5)/2
                left.append((x-dy/n*w,y+dx/n*w));right.append((x+dy/n*w,y-dx/n*w))
            polygons.append(Polygon(left+right[::-1]).buffer(0))
        geom=unary_union(polygons);p=TTGlyphPen(None)
        def ring(coords,clockwise):
            pts=list(coords)[:-1];area=sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(pts,pts[1:]+pts[:1]))
            if (area<0)!=clockwise:pts.reverse()
            p.moveTo(pts[0])
            for q in pts[1:]:p.lineTo(q)
            p.closePath()
        for poly in ([geom] if geom.geom_type=='Polygon' else geom.geoms):
            if poly.area<.1:continue
            ring(poly.exterior.coords,True)
            for hole in poly.interiors:ring(hole.coords,False)
        return put(name,p.glyph(),adv)
    def curve(a,b,c,d,n=44):
        return [tuple((1-t)**3*a[j]+3*(1-t)**2*t*b[j]+3*(1-t)*t*t*c[j]+t**3*d[j] for j in (0,1)) for t in [i/n for i in range(n+1)]]
    def straight(a,b):return [(a[0]+(b[0]-a[0])*i/20,a[1]+(b[1]-a[1])*i/20) for i in range(21)]
    def dia(name,x,y,rx=23,ry=32,adv=240):return svg(name,f'M{x} {y+ry} L{x+rx} {y} L{x} {y-ry} L{x-rx} {y} Z',adv)
    def charmap(chars,g):
        for c in chars:cmap[ord(c)]=g
    ident=(1,0,0,1,0,0)
    def base(c):return cmap[ord(c)]
    # All 30 Nharazim main sigils already exist, including J/K/Q/W and umlauts.
    svg('extensionDot','M0 25 C34 25 34 -25 0 -25 C-34 -25 -34 25 0 25 Z',0)
    charmap('ẞ',base('ß'))

    # Accent marks have zero advance. Anchors retain identical NFC/NFD shapes.
    marks={}
    markdefs={
        0x300:('grave','M-74 90 L-32 100 L54 13 L32 0 Z'),
        0x301:('acute','M-54 13 L32 100 L74 90 L-32 0 Z'),
        0x302:('circumflex','M-88 0 L0 100 L88 0 L40 12 L0 59 L-40 12 Z'),
        0x303:('tilde','M-90 30 C-42 120 -15 -20 38 63 L84 80 C35 -27 0 86 -43 36 L-90 30 Z'),
        0x304:('macron','M-88 20 L88 35 L78 64 L-78 56 Z'),
        0x306:('breve','M-90 93 C-80 -13 80 -13 90 93 C46 22 -46 22 -90 93 Z'),
        0x307:('dot','M0 70 C35 70 35 10 0 10 C-35 10 -35 70 0 70 Z'),
        0x308:('dieresis','M-51 73 C-16 73 -16 13 -51 13 C-86 13 -86 73 -51 73 Z M51 73 C86 73 86 13 51 13 C16 13 16 73 51 73 Z'),
        0x30A:('ring','M0 100 C-65 100 -65 0 0 0 C65 0 65 100 0 100 Z M0 76 C35 76 35 24 0 24 C-35 24 -35 76 0 76 Z'),
        0x30B:('doubleacute','M-94 5 L-40 98 L-5 82 L-66 0 Z M10 5 L65 98 L99 82 L38 0 Z'),
        0x30C:('caron','M-88 100 L0 0 L88 100 L40 88 L0 41 L-40 88 Z'),
        0x327:('cedilla','M-12 -4 L24 -4 L0 -55 C70 -65 35 -145 -35 -113 L-45 -80 C10 -100 39 -79 -17 -77 Z'),
        0x328:('ogonek','M12 0 L47 0 C-39 -28 -35 -97 29 -66 L27 -102 C-76 -133 -76 -36 12 0 Z')}
    for cp,(name,path) in markdefs.items():
        g=svg('mark_'+name,path,0);metrics[g]=(0,0);cmap[cp]=g;marks[cp]=g
    anchors={g:(metrics[g][0]/2,810) for g in set(cmap.values()) if metrics[g][0]>0}
    compose_rules={(base(c),marks[0x308]):base(u) for c,u in [('A','Ä'),('O','Ö'),('U','Ü')]}
    lower_aliases={}
    def accented(cp):
        c=chr(cp);decomp=ud.normalize('NFD',c)
        if len(decomp)!=2 or ord(decomp[0]) not in cmap or ord(decomp[1]) not in marks:return False
        baseg=base(decomp[0]);mark=marks[ord(decomp[1])]
        key=(baseg,mark)
        if key not in compose_rules:
            name=f'latin{cp:04X}';adv=metrics[baseg][0]
            my=25 if ud.combining(decomp[1]) in [202,220] else 810
            comp(name,[(baseg,ident),(mark,(1,0,0,1,adv/2,my))],adv)
            compose_rules[key]=name;anchors[name]=(adv/2,810)
        cmap[cp]=compose_rules[key];return True
    for cp in list(range(0xC0,0x100))+list(range(0x100,0x180)):accented(cp)

    # Non-decomposing Latin letters, built as explicit variants or pairs.
    def bar_variant(chars,b,diagonal=False):
        bg=base(b);adv=metrics[bg][0];name='variant'+hex(ord(chars[0]))[2:]
        line=svg(name+'Bar',f'M60 {310 if diagonal else 400} L{adv-45} {570 if diagonal else 440} L{adv-50} {610 if diagonal else 475} L65 {350 if diagonal else 435} Z',adv)
        comp(name,[(bg,ident),(line,ident)],adv);charmap(chars,name);anchors[name]=(adv/2,810)
    for chars,b,diag in [('ÐðĐđ','D',False),('Ħħ','H',False),('Øø','O',True),('Łł','L',True),('Ŧŧ','T',False)]:bar_variant(chars,b,diag)
    charmap('ı',base('I'));charmap('ſ',base('S'));charmap('ĸ',base('K'))
    def pair(chars,a,b):
        ga,gb=base(a),base(b);wa,wb=metrics[ga][0],metrics[gb][0]
        n='pair'+str(ord(chars[0]));comp(n,[(ga,(.72,0,0,1,0,0)),(gb,(.72,0,0,1,wa*.72-30,0))],(wa+wb)*.72-30);charmap(chars,n);anchors[n]=(metrics[n][0]/2,810)
    pair('Ææ','A','E');pair('Œœ','O','E');pair('Ĳĳ','I','J')
    pair('Ŋŋ','N','G');pair('Þþ','T','H')
    # Middle dot L and apostrophe N are editorial forms of existing letters.
    for chars,b in [('Ŀŀ','L'),('ŉ','N')]:
        bg=base(b);adv=metrics[bg][0];n='latin'+str(ord(chars[0]));comp(n,[(bg,ident),('extensionDot',(1,0,0,1,adv-10,600))],adv+50);charmap(chars,n)

    # Original numeric outlines: legible numerals in a tapered ritual hand.
    digitlines={
        '0':[curve((270,715),(15,620),(35,90),(270,50))+curve((270,50),(495,105),(515,620),(270,715))[1:]],
        '1':[curve((95,540),(180,580),(220,665),(270,720)),curve((270,720),(300,500),(215,170),(225,55))],
        '2':[curve((95,560),(140,835),(580,730),(407,470))+curve((407,470),(280,310),(140,160),(88,76))[1:],curve((88,76),(220,170),(425,-20),(470,135))],
        '3':[curve((85,620),(245,800),(555,710),(276,393))+curve((276,393),(615,410),(460,-40),(92,130))[1:]],
        '4':[curve((395,730),(310,600),(160,410),(82,315)),straight((82,315),(472,315)),curve((385,650),(370,430),(352,200),(350,48))],
        '5':[curve((464,708),(330,653),(240,710),(144,680)),straight((144,680),(104,380)),curve((104,380),(590,510),(555,-60),(90,117))],
        '6':[curve((417,720),(104,695),(35,235),(142,100))+curve((142,100),(365,-100),(590,252),(352,367))[1:]+curve((352,367),(185,429),(70,226),(166,134))[1:]],
        '7':[curve((75,620),(165,813),(340,618),(468,716)),curve((468,716),(270,427),(185,145),(155,50))],
        '8':[curve((268,393),(17,517),(69,743),(274,705))+curve((274,705),(488,667),(503,459),(268,393))[1:]+curve((268,393),(-13,227),(103,30),(278,55))[1:]+curve((278,55),(510,62),(520,232),(268,393))[1:]],
    }
    for n,lines in digitlines.items():ribbon('digit'+n,lines,560,width=64);charmap(n,'digit'+n)
    comp('digit9',[('digit6',(-1,0,0,-1,550,770))],560);charmap('9','digit9')

    # Punctuation retains familiar function, but shares the font's wedges.
    svg('period','M115 115 C160 115 160 45 115 45 C70 45 70 115 115 115 Z',230);charmap('.','period')
    svg('comma','M145 145 L105 180 L78 135 L109 102 C109 60 84 34 62 11 C128 36 157 81 145 145 Z',230);charmap(',','comma')
    comp('colon',[('period',ident),('period',(1,0,0,1,0,360))],230);charmap(':','colon')
    comp('semicolon',[('comma',ident),('period',(1,0,0,1,0,360))],230);charmap(';','semicolon')
    ribbon('questionTop',[curve((70,595),(137,840),(472,725),(331,498))+curve((331,498),(231,397),(200,389),(218,259))[1:]],450,56)
    comp('question',[('questionTop',ident),('period',(1,0,0,1,104,0))],450);charmap('?','question')
    svg('exclamation','M110 735 L179 695 L145 245 L126 220 Z M135 119 C183 119 183 47 135 47 C87 47 87 119 135 119 Z',280)
    svg('quoteSingle','M70 740 L108 700 L90 640 L62 616 L78 676 L48 706 Z',175)
    comp('quoteDouble',[('quoteSingle',ident),('quoteSingle',(1,0,0,1,125,0))],300);charmap('"','quoteDouble')
    comp('quoteLeft',[('quoteSingle',(-1,0,0,1,175,0))],175)
    comp('quotesLeft',[('quoteLeft',ident),('quoteLeft',(1,0,0,1,125,0))],300)
    comp('quotesLow',[('quoteDouble',(1,0,0,1,0,-600))],300)
    comp('quoteLow',[('quoteSingle',(1,0,0,1,0,-600))],175)
    charmap('“','quotesLeft');charmap('”','quoteDouble');charmap('„','quotesLow');charmap('‘','quoteLeft');charmap('‚','quoteLow')
    svg('hyphen','M55 380 L370 405 L385 360 L64 345 Z',440);charmap('-‐‑','hyphen')
    comp('endash',[('hyphen',(1.5,0,0,1,0,0))],650);charmap('–','endash')
    comp('emdash',[('hyphen',(2.2,0,0,1,0,0))],920);cmap[0x2014]='emdash'
    svg('underscore','M28 25 L520 45 L535 15 L33 0 Z',565);charmap('_','underscore')
    ribbon('slash',[straight((58,30),(390,746))],450,45);charmap('/','slash')
    comp('backslash',[('slash',(-1,0,0,1,450,0))],450);charmap('\\','backslash')
    ribbon('parenLeft',[curve((255,800),(50,690),(49,136),(260,-42))],320,49);charmap('(','parenLeft')
    comp('parenRight',[('parenLeft',(-1,0,0,1,320,0))],320);charmap(')','parenRight')
    svg('bracketLeft','M258 785 L85 765 L85 -30 L258 -48 L251 -7 L130 6 L130 726 L251 744 Z',320);charmap('[','bracketLeft')
    comp('bracketRight',[('bracketLeft',(-1,0,0,1,320,0))],320);charmap(']','bracketRight')
    ribbon('braceLeft',[curve((276,790),(62,813),(215,480),(74,390))+curve((74,390),(210,320),(57,-32),(277,-40))[1:]],330,50);charmap('{','braceLeft')
    comp('braceRight',[('braceLeft',(-1,0,0,1,330,0))],330);charmap('}','braceRight')
    ribbon('bar',[straight((135,-45),(135,790))],270,44);charmap('|','bar')
    ribbon('less',[straight((365,650),(80,370)),straight((80,370),(365,100))],455,48);charmap('<‹','less')
    comp('greater',[('less',(-1,0,0,1,455,0))],455);charmap('>›','greater')
    comp('guillemotLeft',[('less',(.55,0,0,.65,0,130)),('less',(.55,0,0,.65,190,130))],475);charmap('«','guillemotLeft')
    comp('guillemotRight',[('guillemotLeft',(-1,0,0,1,475,0))],475);charmap('»','guillemotRight')
    comp('equal',[('hyphen',ident),('hyphen',(1,0,0,1,0,150))],440);charmap('=','equal')
    comp('plus',[('hyphen',ident),('hyphen',(0,1,-1,0,595,155))],440);charmap('+','plus')
    comp('asterisk',[('hyphen',(.7,0,0,.7,50,300)),('hyphen',(0,.7,-.7,0,465,407)),('hyphen',(.5,.5,-.5,.5,330,280)),('hyphen',(.5,-.5,.5,.5,-40,492))],440);charmap('*','asterisk')
    comp('ellipsis',[('period',ident),('period',(1,0,0,1,190,0)),('period',(1,0,0,1,380,0))],610);charmap('…','ellipsis')
    comp('middleDot',[('period',(1,0,0,1,0,285))],230);charmap('·•','middleDot')
    # Traditional editorial signs, drawn with the same tapered pen.
    ribbon('ampersand',[curve((443,526),(127,876),(46,605),(226,357))+curve((226,357),(464,22),(475,32),(487,76))[1:],curve((258,468),(35,335),(5,75),(240,63))+curve((240,63),(453,59),(443,392),(465,449))[1:]],570,56);charmap('&','ampersand')
    ribbon('at',[curve((480,60),(-89,-109),(-82,775),(327,703))+curve((327,703),(686,608),(609,140),(404,169))[1:],curve((398,498),(133,567),(107,119),(298,173))+curve((298,173),(410,215),(419,425),(398,498))[1:]],650,50);charmap('@','at')
    ribbon('hash',[straight((160,65),(247,720)),straight((340,65),(427,720)),straight((78,277),(482,325)),straight((97,486),(501,528))],585,45);charmap('#','hash')
    ribbon('dollar',[curve((440,615),(221,833),(16,558),(258,388))+curve((258,388),(622,208),(384,-98),(71,140))[1:],straight((299,793),(228,-21))],550,51);charmap('$','dollar')
    comp('percent',[('digit0',(.32,0,0,.32,25,478)),('digit0',(.32,0,0,.32,348,20)),('slash',(1.25,0,0,1,20,0))],590);charmap('%','percent')
    comp('degree',[('digit0',(.35,0,0,.3,0,540))],240);charmap('°','degree')
    comp('circumflex',[('mark_circumflex',(1.5,0,0,1.5,180,580))],360);charmap('^','circumflex')
    comp('tilde',[('mark_tilde',(2,0,0,1.3,230,330))],460);charmap('~','tilde')
    comp('grave',[('mark_grave',(1,0,0,1,110,610))],230);charmap('`','grave')
    comp('acute',[('mark_acute',(1,0,0,1,110,610))],230);charmap('´','acute')
    comp('dieresis',[('mark_dieresis',(1,0,0,1,110,610))],230);charmap('¨','dieresis')
    comp('macron',[('mark_macron',(2,0,0,1,230,610))],460);charmap('¯','macron')
    comp('cedilla',[('mark_cedilla',(1,0,0,1,110,10))],230);charmap('¸','cedilla')
    ribbon('euro',[curve((510,620),(45,1017),(-79,-180),(518,152)),straight((47,449),(384,449)),straight((60,288),(356,288))],590,56);charmap('€','euro')
    ribbon('pound',[curve((420,670),(256,832),(103,634),(192,401))+curve((192,401),(265,214),(201,38),(83,83))[1:],curve((83,83),(251,244),(381,-57),(466,133)),straight((85,366),(376,366))],540,54);charmap('£','pound')
    ribbon('yen',[straight((65,720),(277,390)),straight((490,720),(277,390)),straight((277,390),(277,47)),straight((104,381),(450,381)),straight((110,260),(435,260))],555,48);charmap('¥','yen')
    comp('cent',[('euro',(.75,0,0,.75,10,70)),('bar',(1,0,0,.95,110,0))],470);charmap('¢','cent')
    comp('plusminus',[('plus',(1,0,0,1,0,100)),('hyphen',(1,0,0,1,0,-205))],440);charmap('±','plusminus')
    ribbon('multiply',[straight((82,120),(435,650)),straight((82,650),(435,120))],520,50);charmap('×','multiply')
    comp('divide',[('hyphen',ident),('period',(1,0,0,1,104,130)),('period',(1,0,0,1,104,485))],440);charmap('÷','divide')
    comp('currency',[('digit0',(.66,0,0,.66,62,145)),('multiply',(.9,0,0,.9,13,40))],510);charmap('¤','currency')
    comp('section',[('digit3',(.7,0,0,.75,0,0)),('digit3',(-.7,0,0,-.75,455,715))],530);charmap('§','section')
    ribbon('paragraph',[curve((374,700),(48,788),(29,315),(286,382)),straight((295,695),(295,20)),straight((388,700),(388,20))],500,52);charmap('¶','paragraph')
    comp('copyright',[('digit0',(1.25,0,0,1,0,0)),('rune02',(.55,0,0,.55,156,170))],710);charmap('©','copyright')
    comp('registered',[('digit0',(1.25,0,0,1,0,0)),(base('R'),(.55,0,0,.55,180,170))],710);charmap('®','registered')
    comp('trademark',[(base('T'),(.5,0,0,.5,0,375)),(base('M'),(.5,0,0,.5,235,375))],545);charmap('™','trademark')
    comp('negation',[('hyphen',ident),('bar',(.8,0,0,.25,250,168))],440);charmap('¬','negation')
    comp('brokenbar',[('bar',(1,0,0,.42,0,436)),('bar',(1,0,0,.42,0,-29))],270);charmap('¦','brokenbar')
    charmap('µ',base('U'))
    for n,c in [('1','¹'),('2','²'),('3','³')]:
        comp('super'+n,[('digit'+n,(.5,0,0,.5,0,390))],295);charmap(c,'super'+n)
    for c,a,b in [('¼','1','4'),('½','1','2'),('¾','3','4')]:
        name='fraction'+str(ord(c));comp(name,[('digit'+a,(.5,0,0,.5,0,390)),('slash',(1,0,0,.9,80,30)),('digit'+b,(.5,0,0,.5,390,0))],720);charmap(c,name)
    for c,b in [('ª','A'),('º','O')]:
        name='ordinal'+str(ord(c));comp(name,[(base(b),(.5,0,0,.5,0,390))],metrics[base(b)][0]*.5);charmap(c,name)
    comp('questionInverted',[('question',(-1,0,0,-1,450,755))],450);charmap('¿','questionInverted')
    comp('exclamationInverted',[('exclamation',(-1,0,0,-1,280,755))],280);charmap('¡','exclamationInverted')
    comp('dagger',[('bar',ident),('hyphen',(.72,0,0,1,-27,150))],325);charmap('†','dagger')
    comp('doubleDagger',[('dagger',ident),('hyphen',(.72,0,0,1,-27,-160))],325);charmap('‡','doubleDagger')
    comp('permille',[('percent',ident),('digit0',(.32,0,0,.32,530,20))],770);charmap('‰','permille')
    # Spacing, discretionary hyphens and invisible format characters.
    empty=TTGlyphPen(None).glyph()
    put('zeroWidth',empty,0,0)
    for cp in [0xAD,0x200B,0x200C,0x200D,0x2060,0xFEFF]:cmap[cp]='zeroWidth'
    for cp,adv in [(0x2000,500),(0x2001,1000),(0x2002,500),(0x2003,1000),(0x2004,333),(0x2005,250),(0x2006,166),(0x2007,560),(0x2008,230),(0x2009,180),(0x200A,90),(0x202F,180)]:
        n='space'+hex(cp)[2:];put(n,TTGlyphPen(None).glyph(),adv,0);cmap[cp]=n
    # Complete base plus mark composition and fallback positioning.
    fea='\nfeature ccmp {\n'+''.join(f'  sub {b} {m} by {g};\n' for (b,m),g in compose_rules.items())+'} ccmp;\n'
    for cp,g in marks.items():fea+=f'markClass {g} <anchor 0 0> @{g};\n'
    fea+='feature mark {\n'
    for bg,(x,y) in anchors.items():
        for cp,mg in marks.items():
            my=25 if cp in [0x327,0x328] else y
            fea+=f'pos base {bg} <anchor {round(x)} {round(my)}> mark @{mg};\n'
    fea+='} mark;\n'
    text_overrides={ord('!'):'exclamation',ord("'"):'quoteSingle',ord('’'):'quoteSingle'}
    return fea,text_overrides
