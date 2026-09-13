"""Build the offline font demo and HTML language handbook from package data."""
from pathlib import Path
import html,json,re

ROOT=Path(__file__).resolve().parent.parent
records=json.loads((ROOT/'alphabet.json').read_text(encoding='utf-8'))
coverage=json.loads((ROOT/'zeichensatz.json').read_text(encoding='utf-8'))
language=json.loads((ROOT/'Sprache/morgar.json').read_text(encoding='utf-8'))
count=len(coverage)
css='''*{box-sizing:border-box}body{margin:0;background:#ece3d5;color:#32291f;font:18px/1.65 Georgia,serif}main{max-width:1280px;margin:auto;padding:65px 28px}h1{font-size:clamp(40px,7vw,82px);line-height:1.12;margin:16px 0 23px}h2{margin-top:48px;font-size:30px;color:#77502d}a{color:#805532}code{overflow-wrap:anywhere}.eyebrow{font:12px Arial;letter-spacing:.18em;color:#896c4b}.lead{font-size:22px;color:#806345}textarea{width:100%;min-height:125px;padding:18px;border:1px solid #bba78b;background:#fffcf6;color:#32291f;border-radius:4px;font:18px/1.5 monospace}.controls{display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin:20px 0;font:14px Arial}.preview{min-height:185px;padding:28px 5px;border-block:1px solid #bead92;white-space:pre-wrap;overflow-wrap:anywhere;font-size:44px}.status{font:14px/1.6 Arial;color:#806345}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:13px}.card{padding:20px;background:#fffbf3;border:1px solid #d0bfa5}.sigil{height:132px;font-size:110px;text-align:center}.card h3{font-size:20px;margin:18px 0 5px}.card p{font-size:14px;color:#806345}.card small{font:11px Arial;color:#806345}.coverage{display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:8px;margin-top:20px}.cp{padding:12px 5px;text-align:center;background:#fffbf3;border:1px solid #d0bfa5}.cp .karnrith{display:block;min-height:80px;font-size:45px}.cp code{display:block;font-size:11px}.notes{padding:22px;background:#e1d2b9}summary{cursor:pointer;font-size:22px}button{padding:11px 16px;background:#694728;color:#fff;border:0;border-radius:3px;cursor:pointer}button:focus-visible,summary:focus-visible,input:focus-visible{outline:3px solid #af793b;outline-offset:3px}input{accent-color:#694728}footer{margin-top:55px;border-top:1px solid #bead92;padding-top:20px;color:#806345;font-size:14px}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;margin:20px 0;font:15px/1.55 system-ui,sans-serif}th,td{padding:10px 12px;text-align:left;vertical-align:top;border-bottom:1px solid #ccb89a}th{background:#dfcfb4}tr:nth-child(even){background:#f4ecdf}.doc{max-width:1400px}.doc h1{font-size:52px}.doc p{max-width:1100px}.doc img{width:100%;height:auto}.search{width:min(100%,540px);padding:12px;border:1px solid #bba78b;background:#fffcf6;font:17px Arial}.word-rune{font-size:36px}.book-link{font:15px Arial}@media print{@page{size:A4 landscape;margin:15mm}body{background:white;font-size:11pt}main{padding:0;max-width:none}.controls,textarea,nav{display:none}h1{font-size:28pt!important}h2{font-size:18pt;break-after:avoid}table{font-size:9pt}.table-wrap{overflow:visible}tr,.card{break-inside:avoid}thead{display:table-header-group}}'''

js='''/* Karnrith Tiefenrunen 3.000. Script helpers, not a translator. */
(function(root){
const alphabet=ALPHABET,coverage=COVERAGE,words=WORDS;
const supported=new Set(coverage.map(r=>parseInt(r.codepoint.slice(2),16)));
const tokens=new Map(alphabet.map(r=>[r.token.toLowerCase(),r.char]));
const legacy=new Map(alphabet.map(r=>[r.legacyCharacter,r.char]));
function findUnsupported(text){return [...new Set([...String(text).normalize('NFC')].filter(c=>!'\\n\\r\\t'.includes(c)&&!supported.has(c.codePointAt(0))))];}
function fromLegacy(text){return [...String(text)].map(c=>legacy.get(c)||c).join('');}
function encodeTokens(input){return input.map(token=>{const c=tokens.get(String(token).toLowerCase());if(!c)throw new Error('Unbekanntes Lore-Token: '+token);return c;}).join('');}
root.Karnrith=Object.freeze({version:'3.000',alphabet,coverage,words,findUnsupported,fromLegacy,encodeTokens});
})(window);
'''.replace('ALPHABET',json.dumps(records,ensure_ascii=False)).replace('COVERAGE',json.dumps(coverage,ensure_ascii=False)).replace('WORDS',json.dumps(language['words'],ensure_ascii=False))
(ROOT/'karnrith.js').write_text(js,encoding='utf-8')

cards=''.join('<article class="card"><div class="karnrith sigil" aria-hidden="true">'+r['char']+'</div><h3>'+html.escape(r['token']+' · '+r['name'])+'</h3><p>'+html.escape(r['meaning'])+'<br>'+html.escape(r['ipa'])+'</p><small>'+r['codepoint']+' / '+r['clanCode']+'</small></article>' for r in records)
body='''<header><div class="eyebrow">ALERIA / KARNRITH 3.000 / MORGAR 1.1</div><h1>Karnrith Tiefenrunen</h1><p class="lead">Die Schrift der steinernen Hallen.</p><p>30 Bedeutungszeichen und COUNT unterstützte Unicode-Adressen. Sämtliche Runen auf dieser Seite werden mit der echten lokalen Schrift dargestellt.</p></header>
<h2>Schrift ausprobieren</h2><label for="input">Dein Text</label><textarea id="input" spellcheck="false">Morgar Karnrith
Úrortharn Faurgor Dhaihald Ungrum Yrungrum</textarea>
<div class="controls"><label>Größe <input id="size" type="range" min="22" max="96" value="44"> <output id="sizeValue">44 px</output></label><label>Farbe <input id="color" type="color" value="#32291f"></label><label><input id="ligatures" type="checkbox" checked> Morgar-Doppellaute verbinden</label><button id="special" type="button">Tastaturzeichen testen</button><button id="legacy" type="button">Alte Karnrith-Codes übernehmen</button></div>
<div id="preview" class="karnrith preview" aria-hidden="true"></div><p id="status" class="status" role="status"></p><p id="fontStatus" class="status" role="status">Font wird geladen …</p>
<p>NG, TH, KH, GH, SH, CH und DH ergeben je ein Zeichen. Für buchstabengetreuen deutschen Text die Verbindung ausschalten. Der Knopf für alte Codes ist ausschließlich für bekannte Karnrith-Texte im bisherigen Bereich U+E300 bis U+E31D bestimmt.</p>
<h2>Die 30 Bedeutungszeichen</h2><section class="grid">CARDS</section>
<h2>Tastatur und Zusatzzeichen</h2><div class="notes">C, J und X besitzen eigene Ergänzungsformen. ÄÖÜ/äöü, ß/ẞ, ÁÉÍÓÚÝ/áéíóúý, Zahlen und alle druckbaren ASCII-Zeichen sind enthalten. Latin-1 ab U+00A0 und Latin Extended-A werden vollständig abgedeckt. Weitere Satzzeichen, Währungen, Rechenzeichen und Pfeile stehen in der Übersicht.</div><details style="margin-top:24px"><summary>Alle COUNT Unicode-Adressen anzeigen</summary><div id="coverage" class="coverage"></div></details>
<h2>Morgar-Wörterbuch</h2><p>100 Grundwörter mit bisheriger Form, neuer Aussprache und Bedeutung. Ein deutscher Satz wird durch den Font allein nicht übersetzt.</p><label for="search">Wort oder Bedeutung suchen</label><br><input id="search" class="search" placeholder="z. B. Schmied, Faurgor oder Faurpargor"><p id="wordCount" class="status"></p><div class="table-wrap"><table><thead><tr><th>Morgar 1.1</th><th>Bisher</th><th>Aussprache</th><th>Bedeutung</th><th>Schrift</th></tr></thead><tbody id="words"></tbody></table></div>
<h2>Einbindung und Sprachbibel</h2><p><code>&lt;link rel="stylesheet" href="karnrith.css?v=3"&gt;</code><br><code>&lt;p class="karnrith"&gt;Úrortharn Faurgor&lt;/p&gt;</code></p><p>Für deutsche Texte die Klasse <code>karnrith-text</code> verwenden. Die CSS-Datei zusammen mit <code>fonts/</code> kopieren.</p>
<p class="book-link"><a href="Sprache/Sprachbibel-Morgar-1.1.html">Sprachbibel mit allen 200 Namen</a> · <a href="README.md">Installation</a> · <a href="Zeichentafel.png">Zeichentafel</a> · <a href="Tastaturzeichen.png">Tastaturzeichen</a> · <a href="Leseprobe.png">Leseprobe</a> · <a href="zeichensatz.json">Unicode-Liste</a></p>
<footer>Karnrith Tiefenrunen 3.000 / Morgar 1.1. Die ursprüngliche Sprachbibel und der Vergleich mit alten Formen sind im Paket enthalten.</footer>'''.replace('COUNT',str(count)).replace('CARDS',cards)
script='''const input=document.getElementById('input'),preview=document.getElementById('preview'),status=document.getElementById('status');
function update(){preview.textContent=input.value;const bad=Karnrith.findUnsupported(input.value);status.textContent=bad.length?'Nicht im Font: '+bad.map(c=>c+' (U+'+c.codePointAt(0).toString(16).toUpperCase()+')').join(', '):'Alle eingegebenen Zeichen sind enthalten.';}
input.addEventListener('input',update);update();
document.getElementById('size').addEventListener('input',e=>{preview.style.fontSize=e.target.value+'px';document.getElementById('sizeValue').textContent=e.target.value+' px';});
document.getElementById('color').addEventListener('input',e=>{preview.style.color=e.target.value;});
document.getElementById('ligatures').addEventListener('change',e=>{preview.className=(e.target.checked?'karnrith':'karnrith-text')+' preview';});
document.getElementById('legacy').addEventListener('click',()=>{input.value=Karnrith.fromLegacy(input.value);update();});
document.getElementById('special').addEventListener('click',()=>{input.value='ABCDEFGHIJKLMNOPQRSTUVWXYZ\\nabcdefghijklmnopqrstuvwxyz\\nÄÖÜ äöü ßẞ ÁÉÍÓÚÝ áéíóúý\\n0123456789 ! ? . , : ; „ “ & @ # % [ ] { } ( ) / \\\\ _ + =\\nĞİıŞÇç Éé Ññ Łł Ææ Œœ € ₺ £ ¥ © ® ™ § ¶ ← ↑ → ↓ ↔ ≠ ≤ ≥ ≈ ∞';update();});
const grid=document.getElementById('coverage');for(const r of Karnrith.coverage){const cell=document.createElement('div');cell.className='cp';const glyph=document.createElement('span');glyph.className='karnrith';glyph.textContent=r.character;glyph.setAttribute('aria-hidden','true');const code=document.createElement('code');code.textContent=r.codepoint;const source=document.createElement('code');source.textContent=r.character;cell.append(glyph,code,source);grid.append(cell);}
function filterWords(){const query=document.getElementById('search').value.toLocaleLowerCase('de');const words=Karnrith.words.filter(w=>[w.new,w.old,w.meaning].join(' ').toLocaleLowerCase('de').includes(query));const tbody=document.getElementById('words');tbody.replaceChildren();for(const w of words){const tr=document.createElement('tr');for(const v of [w.new,w.old,w.reading+' '+w.ipa,w.meaning]){const td=document.createElement('td');td.textContent=v;tr.append(td);}const td=document.createElement('td');td.className='karnrith word-rune';td.textContent=w.new;td.setAttribute('aria-hidden','true');tr.append(td);tbody.append(tr);}document.getElementById('wordCount').textContent=words.length+' von 100 Wörtern';}
document.getElementById('search').addEventListener('input',filterWords);filterWords();
document.fonts.load('44px "Karnrith Tiefenrunen"','CÄßÓ2€').then(f=>{document.getElementById('fontStatus').textContent=f.length?'Karnrith Tiefenrunen wurde geladen.':'Font nicht geladen. Dateipfade und fonts/-Ordner prüfen.';}).catch(()=>{document.getElementById('fontStatus').textContent='Font konnte nicht geladen werden. Dateipfade prüfen.';});'''
head='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Karnrith Tiefenrunen</title><link rel="stylesheet" href="karnrith.css?v=3"><style>'+css+'</style></head><body><main>'
(ROOT/'demo.html').write_text(head+body+'</main><script src="karnrith.js"></script><script>'+script+'</script></body></html>',encoding='utf-8')

def inline(s):return re.sub(r'`([^`]+)`',r'<code>\1</code>',html.escape(s))
def render(md):
    out=[];paragraph=[];table=[]
    def flushp():
        if paragraph:out.append('<p>'+inline(' '.join(paragraph))+'</p>');paragraph.clear()
    def flusht():
        if not table:return
        out.append('<div class="table-wrap"><table><thead>')
        for i,row in enumerate(table):
            if i==1:out.append('</thead><tbody>');continue
            tag='th' if i==0 else 'td'
            out.append('<tr>'+''.join(f'<{tag}>'+inline(c.strip())+f'</{tag}>' for c in row.strip('|').split('|'))+'</tr>')
        out.append('</tbody></table></div>');table.clear()
    for line in md.splitlines():
        if line.startswith('|'):flushp();table.append(line);continue
        flusht()
        if line.startswith('#'):
            flushp();level=len(line)-len(line.lstrip('#'));out.append(f'<h{level}>'+inline(line[level:].strip())+f'</h{level}>')
        elif not line:flushp()
        else:paragraph.append(line)
    flushp();flusht();return '\n'.join(out)
md=(ROOT/'Sprache/Sprachbibel-Morgar-1.1.md').read_text(encoding='utf-8')
bible='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Morgar Sprachbibel 1.1</title><style>'+css+'</style></head><body><main class="doc"><nav><a href="../demo.html">Font ausprobieren</a> · <a href="Sprachbibel-Morgar-1.1.md">Markdown</a></nav>'+render(md)+'<h2>Die fertige Schrift</h2><img src="../Zeichentafel.png" alt="Die 30 Karnrith-Bedeutungszeichen als echte Fontrenderings"></main></body></html>'
(ROOT/'Sprache/Sprachbibel-Morgar-1.1.html').write_text(bible,encoding='utf-8')
print('Offline demo, 100-word dictionary, JavaScript helpers and full HTML language handbook built.')
