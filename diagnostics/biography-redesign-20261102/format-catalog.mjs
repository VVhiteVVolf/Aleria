import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyPersonCandidate } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
const root=new URL('../../',import.meta.url);
const source=new URL('js/biography/sources/public-biographies.json',root);
const catalog=JSON.parse(await readFile(source,'utf8'));
const training=JSON.parse(await readFile(new URL('js/biography/sources/knight-training.json',root),'utf8'));
const portraits=new Map(FAMILY_REGISTRY.flatMap(f=>(f.family?.persons||[]).map(p=>{const c=createFamilyPersonCandidate(f,p);return[c.worldPersonId,c.portrait];})));
for(const row of catalog.entries){
 const mentors=training.entries[row.key];if(!mentors)continue;
 row.biography.biography.knightMentors=mentors.map(({worldPersonId,...item})=>{
  const connection=(row.biography.biography.connections||[]).find(c=>c.name?.replace(/^(?:Sir|Lady) /,'')===item.name.replace(/^(?:Sir|Lady) /,''));
  const image=portraits.get(worldPersonId)||connection?.image;
  if(!image)throw Error('Missing verified portrait: '+item.name);
  return{...item,image};
 });
}
const idwal=catalog.entries.find(r=>r.key==='person--haus-draig--idwal-draig');
idwal.biography.biography.biographyText=idwal.biography.biography.biographyText.replace('Mit achtzehn Jahren kehrte er nach Gwynthor zurück.', 'An diese erste Mündelschaft schloss sich eine zweite bei <strong>Sir Parzifal Arth</strong> an, bei dem Idwal seine Knappenzeit fortsetzte. Mit achtzehn Jahren kehrte er nach Gwynthor zurück.');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();
 await page.addScriptTag({content:await readFile(new URL('AleriaAlmanach/modules/core/content-safety.js',root),'utf8')});
 await page.addScriptTag({content:await readFile(new URL('AleriaAlmanach/modules/biography/biography-card-rendering.js',root),'utf8')});
 catalog.entries=await page.evaluate(entries=>{
  const headings={
   'Oweta Draig':{biographyText:[['Ihre ritterliche Ausbildung begann','Lehrjahre bei Heledd'],['Gleichzeitig führten ausgerechnet','Die Bindung an Gwynthor'],['Eigentlich würde sie','Eigene Wünsche und Zukunft']],historyText:[['Nach ihrem Ritterschlag','Ein neuer Abschnitt'],['Zu Owetas engstem','Menschen an ihrer Seite']]},
   'Heledd Gafyr':{biographyText:[['Entsprechend ernst nahm Heledd','Ausbildung bei Melyn'],['Als junge Frau kämpfte sie','Krieg gegen Ceitheach'],['Heledd besitzt bis heute','Eine fahrende Ritterin'],['Mit der Zeit übernahm Heledd','Owetas Rittermutter'],['Auch mit vierundvierzig','Ein selbstbestimmtes Leben']]},
   'Anwyll Saethwyr':{biographyText:[['Sein Rittervater wurde','Padrigs Knappe'],['Schon früh fiel zugleich','Der Weg zum Herold'],['Seine Ehe mit','Maelys und die Familie'],['Im Krieg gegen Ceitheach','Pflicht ohne Ruhm'],['Heute verbringt Anwyll','Zwischen Hof und Hafen']]},
   'Melyn Arth':{biographyText:[['Melyn blieb währenddessen','Rittermutter und Kampfgefährtin'],['Über die folgenden Jahrzehnte','Kommandantin der Saethwyr'],['Auch privat bleibt','Fürsorge auf ihre Weise']]},
   'Gildas Gafyr':{biographyText:[['Zwei Männer prägten','Ritterliche Vorbilder'],['Entsprechend ernst nahm','Der eigene Weg']]},
   'Hywel Craigddu':{biographyText:[['Außerhalb seines Dienstes','Ehemann und Familienvater']],historyText:[['Hywel wurde bereits','Verantwortung im Alltag'],['Auch gegenüber gesellschaftlichen','Stand und Selbstachtung']]},
   'Maredudd Draig':{biographyText:[['Seine Ehefrau war','Alawyn und die Familie'],['Trotz seines Alters','Der Feldmarschall heute']]},
   'Nudd Saethwyr':{historyText:[['Besonderes Gewicht besitzt','Glaube und Familie']]}
  };
  for(const row of entries){
   const b=row.biography.biography;
   const format=(value,key)=>{
    if(!value)return value;
    const box=document.createElement('div');box.innerHTML=AleriaBiographyCards.formatCopy(sanitizeContentHtml(value));
    for(const [starts,title]of headings[row.name]?.[key]||[]){
     const paragraph=Array.from(box.children).find(p=>p.textContent.trim().startsWith(starts));
     if(paragraph&&paragraph.previousElementSibling?.tagName!=='H4'){const h=document.createElement('h4');h.textContent=title;paragraph.before(h);}
    }
    return box.innerHTML;
   };
   for(const key of ['biographyText','historyText'])b[key]=format(b[key],key);
   for(const s of b.extraSections||[])if(s.mode!=='list')s.text=format(s.text,'extra');
  }
  return entries;
 },catalog.entries);
}finally{await browser.close();}
await writeFile(source,JSON.stringify(catalog,null,2)+'\n');
console.log(JSON.stringify({biographies:catalog.entries.length,mentored:catalog.entries.filter(r=>r.biography.biography.knightMentors?.length).length}));
