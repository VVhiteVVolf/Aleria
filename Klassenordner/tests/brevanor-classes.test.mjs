import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {BREVANOR_CLASS_IDS,getBrevanorClassDefinitions} from '../../AleriaAlmanach/modules/classes/brevanor/brevanor-class-registry.js';
import {BREVANOR_CULTURE} from '../Brevanor/kultur.js';
import {resolveCultureClassDocument} from '../modules/culture/culture-class-content.js';
import {getCultureClassPageHref} from '../modules/culture/culture-class-registry.js';
import {isClassArtSource} from '../modules/pages/class-art-source.js';
import {CLASS_LORE} from '../modules/lore/class-lore-data.js';
import {ARCHIVE_PAGE_CLASSES} from '../../AleriaAlmanach/modules/character-archive/character-archive-page-data.js';
const workspace=new URL('../../',import.meta.url),classes=new URL('../',import.meta.url);

test('Brevanor besitzt sieben leere Klassen ohne vorweggenommene Kampfmechanik',async()=>{
 assert.deepEqual(BREVANOR_CLASS_IDS,['kerant','breval','hastrel','cantrel','havren','silvain','cabrant']);
 for(const d of getBrevanorClassDefinitions()){
  assert.equal(d.status,'draft');assert.equal(d.progressionStatus,'not-authored');assert.deepEqual(d.combatStyleGrants,[]);
  const raw=JSON.parse(await readFile(new URL(`Brevanor/${d.classId}/klasse.json`,classes),'utf8'));
  const doc=resolveCultureClassDocument(raw,BREVANOR_CULTURE);
  assert.equal(doc.contentStatus,'not-authored');assert.equal(doc.facts.length,0);assert.equal(doc.sections.length,10);
  assert.ok(doc.sections.every(s=>s.status==='pending'&&s.html===''));
  const falseDraft=structuredClone(raw);falseDraft.sections[0].status='written';falseDraft.sections[0].html='<p>Erfundener Inhalt</p>';
  assert.throws(()=>resolveCultureClassDocument(falseDraft,BREVANOR_CULTURE),/ausschließlich leere/);
 }
});

test('Alle Seiten, Registerkarten, Sprungmarken und lokalen Bildpfade sind erreichbar; Belgrant ist entfernt',async()=>{
 const catalog=await readFile(new URL('Klassenseite.html',classes),'utf8');
 assert.equal((catalog.match(/data-entry-id="brevanor-/g)||[]).length,7);
 assert.doesNotMatch(catalog,/klasse-brevanor-belgrant/);
 for(const d of getBrevanorClassDefinitions()){
  assert.equal(getCultureClassPageHref('brevanor',d.classId),`Brevanor/${d.classId}/index.html`);
  const url=new URL(d.pagePath,workspace),html=await readFile(url,'utf8');
  assert.match(catalog,new RegExp(`href="Brevanor/${d.classId}/index.html"`));
  assert.doesNotMatch(html,/Belgrant|ausbildungsplan|data-culture-class=|data-role="training-level"/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
   if(/^https?:/.test(m[1]))continue;
   if(m[1].startsWith('#'))assert.ok(ids.includes(m[1].slice(1)),m[1]);
   else {const target=new URL(m[1],url);target.search='';target.hash='';await access(target);}
  }
 }
 assert.equal(getCultureClassPageHref('brevanor','belgrant'),'');
 assert.equal(getBrevanorClassDefinitions().filter(d=>d.militia).map(d=>d.classId).join(','),'kerant');
});

test('Die vorgegebenen elf Adelsränge besitzen eine gemeinsame Quelle für Register und Klassenseiten',()=>{
 const expected=['Riël','Arduen','Arvor','Comteyr','Vicon','Brenor','Chastor','Bannor','Cavalier','Gentry','Pajet'];
 assert.deepEqual(BREVANOR_CULTURE.orderOverview.hierarchy,expected);
 assert.deepEqual(CLASS_LORE.brevanor.hierarchy.map(r=>r.rank),expected);
 assert.equal(BREVANOR_CULTURE.orderOverview.nobleRanks[8].subtitle,'Einfacher Ritter');
 assert.match(CLASS_LORE.brevanor.society,/Cabrant/);
});

test('Lokale Klassenbilder bleiben auf die Bildbibliothek begrenzt',()=>{
 assert.ok(isClassArtSource('../../assets/images/brevanor/icons/breval.webp'));
 assert.ok(isClassArtSource('https://i.imgur.com/ocBxSrC.png'));
 for(const p of ['../../assets/images/../secret.png','../../../private/image.png','https://example.invalid/image.png','data:image/png;base64,a','../../assets/images/%2e%2e/image.png'])assert.equal(isClassArtSource(p),false,p);
});

test('Comicicons und normale Krieger haben getrennte Presets; alle finalen Icons sind nachweisbar',async()=>{
 const presets=JSON.parse(await readFile(new URL('AleriaAlmanach/docs/art/image-style-presets.json',workspace),'utf8')).presets;
 assert.equal(presets['fantasy-class-icon'].separateFrom,'fantasy-rpg-character');
 assert.match(presets['fantasy-rpg-character'].approvedReferenceImage,/approved-house-knight/);
 const config=JSON.parse(await readFile(new URL('Brevanor/icon-prompts.json',classes),'utf8'));
 assert.equal(config.jobs.length,7);assert.equal(config.stylePreset,'fantasy-class-icon');
 assert.ok(config.jobs.every(j=>j.references.every(p=>!p.includes('approved-house-knight'))));
 const manifest=JSON.parse(await readFile(new URL('assets/images/brevanor/icons/manifest.json',classes),'utf8'));
 assert.equal(manifest.entries.length,7);
 for(const e of manifest.entries){
  assert.equal(e.rgbUnchanged,true);assert.equal(e.metrics.touchesCanvas,false);
  for(const field of ['source','production','preview'])assert.equal(createHash('sha256').update(await readFile(new URL(e[field],workspace))).digest('hex'),e[field+'Sha256']);
 }
 const source=config.realmSource;
 assert.equal(createHash('sha256').update(await readFile(new URL(source.archive,workspace))).digest('hex'),source.sha256);
});

test('Das Charakterarchiv übernimmt genau die sieben neuen Seiten und stabile öffentliche Iconpfade',async()=>{
 const entries=ARCHIVE_PAGE_CLASSES.filter(e=>e.cultures.includes('Brevanor'));
 assert.equal(entries.length,7);assert.ok(!entries.some(e=>e.name==='Belgrant'));
 for(const entry of entries){
  assert.match(entry.icon,/^\/Klassenordner\/assets\/images\/brevanor\/icons\/[a-z]+\.webp$/);
  assert.equal(entry.pageLinks.length,1);await access(new URL(entry.pageLinks[0].path,workspace));
 }
});
