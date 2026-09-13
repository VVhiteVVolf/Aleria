"""Generate real font proofs with Pillow / FreeType / HarfBuzz (libraqm)."""
from pathlib import Path
import json
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parent.parent
records=json.loads((ROOT/'alphabet.json').read_text(encoding='utf-8'))
coverage=json.loads((ROOT/'zeichensatz.json').read_text(encoding='utf-8'))
TTF=ROOT/'fonts/KarnrithTiefenrunen-Regular.ttf'
INK='#302820';MUTED='#866648';PAPER='#f3ecdf'
def label(size,title=False):
    try:return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/'+('DejaVuSerif.ttf' if title else 'DejaVuSans.ttf'),size)
    except OSError:return ImageFont.load_default(size=size)
def rune(size):return ImageFont.truetype(str(TTF),size)
def center(d,text,x,y,font,color=INK):
    b=d.textbbox((0,0),text,font=font);d.text((x-(b[0]+b[2])/2,y-b[1]),text,font=font,fill=color)

im=Image.new('RGB',(1920,1920),PAPER);d=ImageDraw.Draw(im)
d.text((72,40),'KARNRITH · TIEFENRUNEN',font=label(59,True),fill=INK)
d.text((76,130),'VERSION 3.000 / 30 BEDEUTUNGSZEICHEN / MORGAR 1.1',font=label(24),fill=MUTED)
for i,r in enumerate(records):
    x=186+(i%6)*310;y=218+(i//6)*308
    center(d,r['char'],x,y,rune(170))
    center(d,r['token']+' · '+r['name'],x,y+157,label(24))
    center(d,r['ipa'],x,y+196,label(18),MUTED)
    # Short first two semantic fields fit the regular chart cells.
    meaning=', '.join(r['meaning'].split(', ')[:2])
    center(d,meaning,x,y+227,label(17),MUTED)
    center(d,r['clanCode']+' / '+r['codepoint'],x,y+256,label(15),MUTED)
d.text((76,1800),'Aus dem fertigen Font gerendert. Groß- und Kleinbuchstaben verwenden dieselbe Rune.',font=label(22),fill=MUTED)
d.text((76,1844),'C, J, X, Umlaute, Langvokale, ß/ẞ, Ziffern und Satzzeichen sind zusätzlich enthalten.',font=label(22),fill=MUTED)
im.save(ROOT/'Zeichentafel.png')

im=Image.new('RGB',(1920,1640),PAPER);d=ImageDraw.Draw(im)
d.text((70,40),'KARNRITH / TASTATURZEICHEN',font=label(50,True),fill=INK)
d.text((76,118),f'{len(coverage)} Unicode-Adressen einschließlich neuer und bisheriger direkter Runencodes',font=label(23),fill=MUTED)
groups=[('Zusätzliche Buchstaben und Deutsch','CJXÄÖÜßẞ'),('Langvokale der Sprachrevision','ÁÉÍÓÚÝáéíóúý'),('Ziffern','0123456789'),('Akzente und weitere lateinische Zeichen','ÇñĞİıŞŁœ'),('Satzzeichen und Währungen','&@#?!€₺§©%'),('Mathematik und Pfeile','←↑→↓↔≠≤≥≈∞')]
for row,(heading,chars) in enumerate(groups):
    y=190+row*218;d.text((76,y),heading,font=label(22),fill=MUTED)
    width=1760/len(chars)
    for col,c in enumerate(chars):
        x=80+(col+.5)*width;center(d,c,x,y+43,rune(102));center(d,c,x,y+149,label(20),MUTED)
d.text((76,1545),'Alle druckbaren ASCII-Zeichen, Latin-1 ab U+00A0, Latin Extended-A und weitere Zeichen.',font=label(22),fill=MUTED)
d.text((76,1587),'Den exakten Umfang zeigen demo.html und zeichensatz.json.',font=label(22),fill=MUTED)
im.save(ROOT/'Tastaturzeichen.png')

im=Image.new('RGB',(1800,1340),PAPER);d=ImageDraw.Draw(im)
d.text((70,40),'KARNRITH / LESEPROBE',font=label(49,True),fill=INK)
samples=[('Morgar Karnrith',True),('Úrortharn Faurgor Dhaihald Ungrum Yrungrum',True),('NG TH KH GH SH CH DH · N G T H K H G H',True),('König Kök grüßt zwölf Jäger: C J X Q ß ẞ.',False),('ÁÉÍÓÚÝ áéíóúý · ÄÖÜ äöü · 0123456789',False),('„Worte werden Stein.“ & 25 € @ # { } [ ]',False)]
for i,(s,liga) in enumerate(samples):
    y=157+i*186;d.text((73,y),s,font=label(24),fill=MUTED)
    size=68;features=[] if liga else ['-liga']
    while d.textlength(s,font=rune(size),features=features)>1650:size-=1
    d.text((70,y+43),s,font=rune(size),fill=INK,features=features)
im.save(ROOT/'Leseprobe.png')
print('Three proof sheets rendered from the compiled font.')
