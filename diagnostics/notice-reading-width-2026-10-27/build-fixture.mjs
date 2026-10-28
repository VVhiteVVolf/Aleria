import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const root=new URL('../../',import.meta.url);
const context=vm.createContext({window:{},document:{baseURI:'http://127.0.0.1:8881/Anzeigetafeln/tafel.html'},URL,URLSearchParams});
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
context.window.TafelRuntime={esc};
context.window.TafelZettelRichText={renderHtml:value=>String(value||'')};
for(const file of ['media/notice-media-model.js','notes/notice-text-layout.js','notes/zettel-config.js','notes/zettel-document-views.js','notes/zettel-scroll-views.js']){
 vm.runInContext(await readFile(new URL('Anzeigetafeln/assets/js/'+file,root),'utf8'),context);
}
const app=context.window;
const text=Array.from({length:28},(_,i)=>`<p>Absatz ${i+1}: Wir hatten die letzte Rate schon abgezählt. Gemeinsam suchen wir nach der Wahrheit und bitten unsere Nachbarn um Hilfe. Der Wortlaut bleibt vollständig erhalten und soll die verfügbare Breite nutzen.</p>`).join('');
const cases=[];
for(const type of app.ZETTEL_TYPES){
 for(const image of [false,true]){
  const id=`${type.id}-${image?'image':'text'}`;
  const notice=app.TafelZettelConfig.createDraft(type.id,{x:.5,y:.5},()=>id);
  notice.title=`${type.label} – Prüfbeispiel`;notice.text=text;
  notice.table=type.table.map((row,i)=>({...row,v:i%2?'Gwynthor · Hafenviertel':'Verlässliche Nachforscher'}));
  notice.artikel=[{titel:'Aus der Stadt',text}];notice.personen=[];
  if(image)notice.bild='/Anzeigetafeln/assets/images/board-posters/arbeit-v1.png';
  cases.push({id,type:type.id,image,label:`${type.label} – ${image?'mit':'ohne'} Bild`,html:app.TafelZettelViews.renderByType(notice)});
 }
}
const version=process.argv[2]||'before';
const styles=['tafel','notice-board','notice-documents','notice-media','notice-theme','notice-reader','notice-rewards','notice-variants'];
const html=`<!doctype html><html lang="de"><meta charset="utf-8"><title>Aushang-Lesebereich · Layoutprüfung</title>
${styles.map(s=>`<link rel="stylesheet" href="../../Anzeigetafeln/assets/css/${s}.css?qa=${version}">`).join('')}
<style>body{background:#eee5d2;overflow:auto!important}main{max-width:1100px;margin:20px auto;padding:12px}nav{display:flex;flex-wrap:wrap;gap:8px}section{margin:30px 0}.qa-label{font:20px Georgia;margin:16px 0}img{max-width:100%}</style>
<main><h1>Lokale Layoutprüfung · alle 16 Vorlagen</h1><nav>${cases.map(c=>`<a href="#${c.id}">${esc(c.label)}</a>`).join('')}</nav>
${cases.map(c=>`<section id="${c.id}" data-qa-type="${c.type}" data-qa-image="${c.image}"><h2 class="qa-label">${esc(c.label)}</h2>${c.html}</section>`).join('')}</main>
<script>document.querySelectorAll('[data-notice-scroll]').forEach(e=>e.style.setProperty('--notice-text-height','220px'));</script></html>`;
await writeFile(new URL('fixture.html',import.meta.url),html);
console.log(JSON.stringify({cases:cases.length,version}));
