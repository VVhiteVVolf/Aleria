"""Create local documentation and proof sheets from the compiled font.

Run from any working directory with Python, Pillow and optional system DejaVu fonts.
"""
from pathlib import Path
import html,json,textwrap
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parent.parent
records=json.loads((ROOT/'alphabet.json').read_text(encoding='utf-8'))
coverage=json.loads((ROOT/'zeichensatz.json').read_text(encoding='utf-8'))
count=len(coverage)
TTF=ROOT/'fonts/Rheunwaith-Regular.ttf'
normal='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
serif='/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
def label(size,title=False):
    try:return ImageFont.truetype(serif if title else normal,size)
    except OSError:return ImageFont.load_default(size=size)
def rune(size):return ImageFont.truetype(str(TTF),size)
def center(d,text,x,y,font,color='#153f4c'):
    b=d.textbbox((0,0),text,font=font)
    d.text((x-(b[0]+b[2])/2,y-b[1]),text,font=font,fill=color)

im=Image.new('RGB',(1920,1800),'#f3eee2');d=ImageDraw.Draw(im)
d.text((76,43),'RHEUNWAITH',font=label(63,True),fill='#153f4c')
d.text((80,130),'GEZEITENRUNEN / VERSION 2.000 / DIE 30 LORE-ZEICHEN',font=label(23),fill='#64797a')
for i,r in enumerate(records):
    x=185+(i%6)*310;y=237+(i//6)*275
    center(d,r['char'],x,y,rune(160))
    center(d,('T / Th' if r['token']=='Th' else r['token'])+' · '+r['name'],x,y+153,label(24))
    center(d,r['codepoint'],x,y+199,label(17),'#64797a')
d.text((80,1650),'Aus dem echten Font gerendert. Groß- und Kleinbuchstaben verwenden dieselbe Rune.',font=label(21),fill='#64797a')
d.text((80,1694),'Q, Ä, Ö, ß und weitere technische Zeichen stehen in der Ergänzungsübersicht.',font=label(21),fill='#64797a')
im.save(ROOT/'Zeichentafel.png')

im=Image.new('RGB',(1920,1440),'#f3eee2');d=ImageDraw.Draw(im)
d.text((75,44),'DER ERWEITERTE ZEICHENSATZ',font=label(47,True),fill='#153f4c')
d.text((78,118),f'{count} Unicode-Zeichen / einschließlich der bisherigen 30 Unicode-Adressen',font=label(23),fill='#64797a')
groups=[('Grundbuchstaben und Deutsch','QJKWÄÖÜßẞ'),('Ziffern','0123456789'),('Akzente und weitere lateinische Zeichen','ÉàÇñĞİıŞŁœ'),('Satzzeichen und Währungen','&@#?!€₺§©%'),('Mathematik und Pfeile','←↑→↓↔≠≤≥≈∞')]
for row,(heading,chars) in enumerate(groups):
    y=202+row*216;d.text((78,y),heading,font=label(22),fill='#64797a')
    for col,c in enumerate(chars):
        x=150+col*174;center(d,c,x,y+44,rune(104));center(d,c,x,y+141,label(20),'#64797a')
d.text((78,1320),'Zusätzlich alle druckbaren ASCII-Zeichen, Latin-1, Latin Extended-A, Hoch- und Tiefzahlen.',font=label(22),fill='#64797a')
d.text((78,1364),'Die vollständige Liste findest du in zeichensatz.json und auf der Testseite.',font=label(22),fill='#64797a')
im.save(ROOT/'Erweiterter-Zeichensatz.png')

im=Image.new('RGB',(1800,1120),'#f3eee2');d=ImageDraw.Draw(im)
d.text((70,42),'RHEUNWAITH / LESEPROBE',font=label(48,True),fill='#153f4c')
samples=[('Gawain Tristan Chwerw Llwyd Ngoll Rhyd',True),('Ch Ll Ng Rh Th · C H L L N G R H T H',True),('König Kök grüßt zwölf Jäger.',False),('ÄÖÜ äöü ßẞ · Qq JKjk · 0123456789',False),('„Das Wasser trägt die Namen.“ & 25 €',False)]
for i,(s,ligatures) in enumerate(samples):
    y=155+i*175;d.text((73,y),s,font=label(24),fill='#64797a')
    size=64;features=[] if ligatures else ['-liga']
    while d.textlength(s,font=rune(size),features=features)>1650:size-=1
    d.text((70,y+42),s,font=rune(size),fill='#153f4c',features=features)
im.save(ROOT/'Leseprobe.png')

handbook='''# Rheunwaith: Gezeitenrunen

## Was die Quellen festlegen

Die bereitgestellten Dateien beschreiben Rheunwaith als ein Alphabet aus 30
benannten Runen. Sie enthalten die Tastaturbelegung, fünf Doppelzeichen und
die technischen Regeln der bisherigen Schrift. Version 2 überträgt diese
Angaben in die vom Nutzer gewählte Gestaltung II, Gezeitenrunen.

Die Quellen enthalten keine vollständige Grammatik, Aussprachetabelle,
Wortübersetzungen oder magischen Einzelbedeutungen der Runennamen.
Darum wird hier keine zusätzliche Sprachlehre als überlieferter Inhalt ausgegeben.
Das Handbuch enthält den vollständigen dokumentierten Bestand, nicht eine
erfundene Übersetzungssprache. Gawain und Tristan sind Beispieltexte der Vorlage.

## Die Gestaltung

Gezeitenrunen verbinden kräftige, meist aufrechte Stämme mit breiten Rundungen,
offenen Innenräumen und kurzen keilförmigen Abschlüssen. Die ruhige Wasseranmutung
entsteht in den Formen selbst. Farbe, Pergament und Leuchten sind keine
Bestandteile der Fontdatei.

16 Hauptformen stammen aus der gewählten Stilvorlage. Die zwölf weiteren
Lore-Zeichen und Ersatzformen für N und O wurden passend ergänzt. N und O
waren im Bild nahezu identisch mit anderen Zeichen. Für X, Ng und das zusätzliche
ß wurden einzelne Ergänzungsformen gedreht oder gespiegelt. Q und ß sind zwei
zusätzliche Masterformen außerhalb des kanonischen Alphabets.

## Vollständige Belegung

Die Namen und bisherigen Adressen wurden aus README.md der Version 1 übernommen.
Neue private Unicode-Adressen dienen der eindeutigen Speicherung eigener Runen.

| Eingabe | Runenname | Neue direkte Adresse | Bisherige Adresse |
| --- | --- | --- | --- |
'''
for r in records:handbook+=f'| {"T oder Th" if r["token"]=="Th" else r["token"]} | {r["name"]} | {r["codepoint"]} | {r["legacyCodepoint"]} |\n'
handbook+='''
## Schreibregeln aus der Vorlage

Groß- und Kleinbuchstaben verwenden dieselbe Rune. Die Verbindungen Ch, Ll,
Ng, Rh und Th werden mit aktivierten OpenType-Ligaturen zu jeweils einem Zeichen.
T allein verwendet ebenfalls Thal. Die gemischten Schreibweisen CH, Ch, cH und
ch verhalten sich gleich; entsprechend gilt dies für die anderen Verbindungen.
Leerzeichen trennen die Einzelzeichen. In rein buchstabengetreuem Text kann
die Ligaturfunktion mit der CSS-Klasse `rheunwaith-text` ausgeschaltet werden.

Das Q war zuvor absichtlich unbelegt, weil es nicht zu den 30 Lore-Zeichen gehört.
Die neue technische Schrift stellt Q dar, ohne daraus eine neue kanonische Rune
mit erfundenem Namen zu machen. Ä, Ö und ß sind ebenfalls Ergänzungen. Ü bleibt
Uffyr. ß und ẞ haben dieselbe zusätzliche Form; SS sind weiterhin zwei S-Zeichen.

## Umfang der Erweiterung

Der Font deckt A–Z, a–z, deutsche Umlaute und scharfes S, Ziffern, alle druckbaren
ASCII-Zeichen, Latin-1 ab U+00A0 und Latin Extended-A U+0100 bis U+017F ab.
Dazu kommen kombinierte Akzente, geschützte Leerzeichen, typografische
Satzzeichen, Währungen, ausgewählte mathematische Zeichen, Pfeile sowie
Hoch- und Tiefzahlen. Die exakte Liste steht in `zeichensatz.json`.

Ein Umlaut kann als fertiger Buchstabe oder als Grundbuchstabe plus kombinierter
Markierung eingegeben werden. Beide Schreibweisen ergeben dasselbe Bild.
Insbesondere U + kombinierter Umlaut verwendet die Uffyr-Rune.
Zusätzliche technische Formen erhalten keine neu erfundenen Bedeutungen.

## Alte und neue Unicode-Zeichen

Die bisherigen Adressen U+10C00 bis U+10C1D bleiben im Font erreichbar.
Sie liegen jedoch im Unicode-Block einer anderen Schrift, weshalb deren
Schreibrichtungsregeln in Anwendungen wirken können. Für neue direkt kodierte
Rheunwaith-Texte sind U+E300 bis U+E31D vorgesehen. Die Funktion
`Rheunwaith.toPrivateUse(text)` konvertiert ausschließlich die 30 alten Adressen.
Normale lateinische Eingabe benötigt diese Konvertierung nicht.

`Rheunwaith.encodeTokens(['Ch','Ll','Ng','Rh','Th'])` liefert eine feste Folge
der entsprechenden privaten Runenzeichen. Diese Zeichen werden auch bei aktiver
Ligaturfunktion nicht erneut zusammengeschoben. Unbekannte Lore-Tokens werden
abgewiesen. Q und andere technische Ergänzungen schreibt man als normale Buchstaben.

## Sprache und technische Darstellung

Ein deutscher Satz bleibt ein deutscher Satz, wenn man ihn in Rheunwaith setzt.
Die Schrift ersetzt seine sichtbaren Zeichen. Sie übersetzt und verschlüsselt
keine Inhalte. Kopierter lateinischer Text bleibt lateinisch, direkte Runencodes
bleiben Runencodes. Für wichtige Informationen eine lesbare Klartextfassung
vorsehen. Die Einbindung und Aktualisierung sind in `README.md` beschrieben.

## Enthaltene Unterlagen

Das Hauptpaket enthält Webfonts und TTF, CSS und JavaScript, eine interaktive
Testseite, drei aus dem Font gerenderte PNG-Übersichten, dieses Handbuch als HTML
und Markdown, sämtliche Zuordnungen als JSON, Masterkonturen, Bildvorlagen,
reproduzierbare Buildscripte und einen technischen Prüfbericht. Die alte
Dokumentation bleibt unter `source/original/` als Quellenarchiv erhalten.

Die Herkunfts- und Lizenzhinweise stehen in `LIZENZHINWEISE.md` und `OFL.txt`.
'''
(ROOT/'Handbuch.md').write_text(handbook,encoding='utf-8')

js='''/* Rheunwaith 2.000. Font helpers, not a language translator. */
(function(root){
  const alphabet = ALPHABET;
  const coverage = COVERAGE;
  const supported = new Set(coverage.map(r=>Number.parseInt(r.codepoint.slice(2),16)));
  const tokens = new Map(alphabet.map(r=>[r.token.toLowerCase(),r.char]));
  tokens.set('t',tokens.get('th'));
  const legacy = new Map(alphabet.map(r=>[r.legacyCharacter,r.char]));
  function findUnsupported(text){return [...new Set([...String(text).normalize('NFC')].filter(c=>!'\\n\\r\\t'.includes(c)&&!supported.has(c.codePointAt(0))))];}
  function toPrivateUse(text){return [...String(text)].map(c=>legacy.get(c)||c).join('');}
  function encodeTokens(input){return input.map(token=>{const c=tokens.get(String(token).toLowerCase());if(!c)throw new Error('Unbekanntes Lore-Token: '+token);return c;}).join('');}
  root.Rheunwaith=Object.freeze({version:'2.000',alphabet,coverage,findUnsupported,toPrivateUse,encodeTokens});
})(window);
'''.replace('ALPHABET',json.dumps(records,ensure_ascii=False)).replace('COVERAGE',json.dumps(coverage,ensure_ascii=False))
(ROOT/'rheunwaith.js').write_text(js,encoding='utf-8')

css='''*{box-sizing:border-box}body{margin:0;background:#f3eee2;color:#153f4c;font:17px/1.65 Georgia,serif}main{max-width:1220px;margin:auto;padding:65px 28px}h1{font-size:clamp(40px,7vw,84px);line-height:1.12;margin:16px 0 23px}h2{margin-top:45px;font-size:29px}a{color:#1c6672}code{overflow-wrap:anywhere}.eyebrow{font:12px Arial;letter-spacing:.2em;color:#64797a}.lead{font-size:22px;color:#64797a}textarea{width:100%;min-height:110px;padding:18px;border:1px solid #a6b5b2;background:#fffcf5;color:#153f4c;border-radius:5px;font:18px/1.5 monospace}.controls{display:flex;gap:24px;align-items:center;flex-wrap:wrap;margin:18px 0;font:14px Arial}.preview{min-height:180px;padding:28px 5px;border-block:1px solid #c5cebf;white-space:pre-wrap;overflow-wrap:anywhere;font-size:44px}.status{font:14px/1.6 Arial;color:#627575}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:13px}.card{padding:20px;background:#fffcf5;border:1px solid #d1d3c5;border-radius:5px}.sigil{height:130px;font-size:103px;text-align:center}.card h3{font-size:20px;margin:18px 0 5px}.card p{font-size:14px;color:#64797a}.card small{font:11px Arial;color:#64797a}.coverage{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;margin-top:20px}.cp{padding:12px 5px;text-align:center;background:#fffcf5;border:1px solid #d1d3c5}.cp .rheunwaith{display:block;min-height:80px;font-size:45px}.cp code{display:block;font-size:11px}.notes{padding:22px;background:#e2e8da;border-radius:6px}summary{cursor:pointer;font-size:22px}button{padding:10px 16px;background:#194b57;color:#fff;border:0;border-radius:4px;cursor:pointer}button:focus-visible,summary:focus-visible{outline:3px solid #ad9669;outline-offset:3px}input{accent-color:#194b57}footer{margin-top:60px;border-top:1px solid #c5cebf;padding-top:22px;color:#64797a;font-size:14px}table{border-collapse:collapse;width:100%;margin:24px 0;font:15px/1.6 Arial}th,td{padding:12px 10px;border-bottom:1px solid #c5cebf;text-align:left}th{background:#e2e8da}.doc{max-width:1000px}.doc h1{font-size:54px}.doc .rheunwaith{font-size:50px}.doc img{max-width:100%}@media print{@page{size:A4;margin:18mm}body{background:#fff}main{padding:0;max-width:none}.controls,textarea,nav{display:none}h1{font-size:36px!important}h2{break-after:avoid}tr,.card{break-inside:avoid}thead{display:table-header-group}}'''
cards=''.join(f'<article class="card"><div class="rheunwaith sigil" aria-hidden="true">{r["char"]}</div><h3>{"T / Th" if r["token"]=="Th" else r["token"]} · {r["name"]}</h3><small>{r["codepoint"]}</small></article>' for r in records)
page='''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rheunwaith · Gezeitenrunen</title><link rel="stylesheet" href="rheunwaith.css?v=2-gezeiten"><style>CSS</style></head><body><main>
<header><div class="eyebrow">ALERIA / VERSION 2.000 / GEZEITENRUNEN</div><h1>Rheunwaith</h1><p class="lead">Kräftige Stämme, breite Rundungen und der ruhige Rhythmus der Gezeiten.</p><p>Das überarbeitete Alphabet mit 30 Lore-Zeichen und COUNT unterstützten Unicode-Zeichen. Alle Runen auf dieser Seite werden mit dem echten lokalen Font dargestellt.</p></header>
<h2>Schrift ausprobieren</h2><label for="input">Dein Text</label><textarea id="input" spellcheck="false">Gawain Tristan Chwerw Llwyd Ngoll Rhyd
König Kök grüßt zwölf Jäger: ÄÖÜ äöü ßẞ Qq &amp; 25 €.</textarea>
<div class="controls"><label>Größe <input type="range" id="size" min="22" max="90" value="44"> <output id="sizeValue">44 px</output></label><label>Farbe <input id="color" type="color" value="#153f4c"></label><label><input id="ligatures" type="checkbox" checked> Doppelzeichen verbinden</label><button id="special" type="button">Sonderzeichen testen</button></div>
<div class="rheunwaith preview" id="preview" aria-hidden="true"></div><p class="status" id="status" role="status"></p><p class="status" id="fontStatus" role="status">Font wird geladen …</p>
<p>Ch, Ll, Ng, Rh und Th werden im traditionellen Modus je eine Rune. Für buchstabengetreuen Fließtext die Verbindung ausschalten. T und Th verwenden wie bisher Thal.</p>
<h2>Alle 30 Lore-Zeichen</h2><section class="grid">CARDS</section>
<h2>Mehr als das Lore-Alphabet</h2><div class="notes">Q, Ä, Ö, ß/ẞ, alle Grundbuchstaben, Ziffern und druckbaren ASCII-Zeichen sind ergänzt. Latin-1 und Latin Extended-A sind vollständig enthalten, dazu Akzente, Satzzeichen, Währungen, Pfeile und ausgewählte Rechenzeichen. Ü bleibt Uffyr. Der genaue Umfang steht unten.</div>
<details style="margin-top:25px"><summary>Alle COUNT Unicode-Adressen anzeigen</summary><div id="coverage" class="coverage"></div></details>
<h2>Direkt in HTML verwenden</h2><p><code>&lt;link rel="stylesheet" href="rheunwaith.css?v=2-gezeiten"&gt;</code><br><code>&lt;p class="rheunwaith-text"&gt;König Kök &amp;amp; zwölf Jäger&lt;/p&gt;</code></p><p>Das Stylesheet zusammen mit dem Ordner <code>fonts/</code> kopieren. Alle alten Fontdateien ersetzen und die Seite mit Strg+F5 neu laden.</p>
<p><a href="Handbuch.html">Sprach- und Schrifthandbuch</a> · <a href="README.md">Installation</a> · <a href="Zeichentafel.png">Zeichentafel</a> · <a href="Erweiterter-Zeichensatz.png">Ergänzungen</a> · <a href="Leseprobe.png">Leseprobe</a> · <a href="zeichensatz.json">Zeichensatz JSON</a></p>
<footer>Die Schrift verändert die Darstellung, nicht die Sprache. Keine Übersetzung oder Verschlüsselung. Alte direkte Runencodes werden für die Vorschau automatisch in die neuen privaten Unicode-Zeichen umgewandelt.</footer>
</main><script src="rheunwaith.js"></script><script>
const input=document.getElementById('input'),preview=document.getElementById('preview'),status=document.getElementById('status');
function update(){preview.textContent=Rheunwaith.toPrivateUse(input.value);const bad=Rheunwaith.findUnsupported(input.value);status.textContent=bad.length?'Nicht im Font: '+bad.map(c=>c+' (U+'+c.codePointAt(0).toString(16).toUpperCase()+')').join(', '):'Alle eingegebenen Zeichen sind enthalten.';}
input.addEventListener('input',update);update();
document.getElementById('size').addEventListener('input',e=>{preview.style.fontSize=e.target.value+'px';document.getElementById('sizeValue').textContent=e.target.value+' px';});
document.getElementById('color').addEventListener('input',e=>{preview.style.color=e.target.value;});
document.getElementById('ligatures').addEventListener('change',e=>{preview.className=(e.target.checked?'rheunwaith':'rheunwaith-text')+' preview';});
document.getElementById('special').addEventListener('click',()=>{input.value='Qq JKjk ÄÖÜ äöü ßẞ 0123456789\\nĞİıŞÇç Éé Ññ Łł Ææ Œœ\\n! ? . , : ; „ “ & @ # % [ ] { } ( ) / \\\\ _ + =\\n€ ₺ £ ¥ © ® ™ § ¶ ← ↑ → ↓ ↔ ≠ ≤ ≥ ≈ ∞';update();});
const grid=document.getElementById('coverage');for(const r of Rheunwaith.coverage){const cell=document.createElement('div');cell.className='cp';const glyph=document.createElement('span');glyph.className='rheunwaith';glyph.textContent=Rheunwaith.toPrivateUse(r.character);glyph.setAttribute('aria-hidden','true');const code=document.createElement('code');code.textContent=r.codepoint;const source=document.createElement('code');source.textContent=r.character;cell.append(glyph,code,source);grid.append(cell);}
document.fonts.load('44px "Rheunwaith"','QÄß2€').then(f=>{document.getElementById('fontStatus').textContent=f.length?'Rheunwaith wurde geladen.':'Font nicht geladen. Dateipfade und fonts/-Ordner prüfen.';}).catch(()=>{document.getElementById('fontStatus').textContent='Font konnte nicht geladen werden. Dateipfade prüfen.';});
</script></body></html>'''.replace('CSS',css).replace('CARDS',cards).replace('COUNT',str(count))
(ROOT/'demo.html').write_text(page,encoding='utf-8')

# Small deterministic Markdown-to-HTML renderer for this controlled handbook.
out=[];paragraph=[];table=[];intable=False
def inline(s):
    import re
    return re.sub(r'`([^`]+)`',lambda m:'<code>'+m.group(1)+'</code>',html.escape(s))
def flush():
    if paragraph:out.append('<p>'+inline(' '.join(paragraph))+'</p>');paragraph.clear()
for line in handbook.splitlines():
    if line.startswith('|'):
        flush()
        if not intable:out.append('<table><thead>');intable=True;thead=True
        cols=[s.strip() for s in line.strip('|').split('|')]
        if cols[0].startswith('---'):out.append('</thead><tbody>');thead=False;continue
        tag='th' if thead else 'td';out.append('<tr>'+''.join(f'<{tag}>{inline(c)}</{tag}>' for c in cols)+'</tr>')
        continue
    if intable:out.append('</tbody></table>');intable=False
    if not line:flush()
    elif line.startswith('# '):flush();out.append('<h1>'+inline(line[2:])+'</h1>')
    elif line.startswith('## '):flush();out.append('<h2>'+inline(line[3:])+'</h2>')
    else:paragraph.append(line)
flush()
proof='<h2>Die neuen Formen</h2><img src="Zeichentafel.png" alt="Alle 30 Gezeitenrunen mit Eingabe und Namen">'
doc='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rheunwaith Handbuch</title><style>'+css+'</style></head><body><main class="doc"><nav><a href="demo.html">Zur Testseite</a> · <a href="README.md">Installation</a> · <a href="Handbuch.md">Markdown</a></nav>'+''.join(out)+proof+'</main></body></html>'
(ROOT/'Handbuch.html').write_text(doc,encoding='utf-8')
print('Specimens, HTML/Markdown handbook, JS helpers and font demo created.')
