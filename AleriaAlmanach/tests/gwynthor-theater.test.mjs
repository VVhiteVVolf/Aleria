import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { buildGwynthorTheater } from '../modules/gwynthor-theater/theater-module.mjs';
import { THEATER_PATRON, THEATER_DIRECTOR, THEATER_ENSEMBLE, THEATER_PEOPLE } from '../modules/gwynthor-theater/theater-people.mjs';
import { THEATER_PRODUCTIONS } from '../modules/gwynthor-theater/theater-program.mjs';
import { planTheaterCharacters } from '../modules/gwynthor-theater/theater-characters.mjs';
import { HOUSE_DRAIG_FAMILY } from '../../Stammbäume/assets/js/data/house-draig-family.js';

const entry=buildGwynthorTheater();
const json=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));

test('theater has the requested page order, four departments and six usable rooms',()=>{
  assert.equal(entry.pages.length,11);
  assert.ok(entry.pages[1].guildPage);
  assert.ok(entry.pages[2].biographyPage);
  assert.ok(entry.pages[3].hierarchyPage);
  assert.ok(entry.pages[4].theatreProgramPage);
  assert.equal(entry.pages.slice(5).filter(p=>p.sessionPage&&p.sessionIntro).length,6);
  assert.equal(new Set(entry.pages.map(p=>p.commentThreadKey)).size,11);
  const trees=entry.pages[3].hierarchy.trees;
  assert.deepEqual(trees.map(t=>t.id),['fuehrung','ensemble','verwaltung','hauswache']);
  const nodes=trees.flatMap(t=>t.levels.flatMap(l=>l.nodes));
  assert.equal(new Set(nodes.map(n=>n.id)).size,nodes.length);
  for(const tree of trees.slice(2))for(const node of tree.levels.flatMap(l=>l.nodes)){
    assert.equal(node.portrait,'');assert.equal(node.title,'Freier Posten');
  }
});

test('the thirteen first-name actors include Sabjorn and all are human',()=>{
  assert.equal(THEATER_ENSEMBLE.length,13);
  for(const person of THEATER_ENSEMBLE){
    assert.ok(!person.name.includes(' '));
    assert.equal(person.race,'Mensch');
    assert.doesNotMatch(person.appearance,/\belf\b|elven|pointed ears/i);
  }
  assert.equal(THEATER_ENSEMBLE.filter(p=>p.origin==='Cenyr').length,4);
  assert.equal(THEATER_ENSEMBLE.filter(p=>p.origin==='Weisenfluh').length,2);
  assert.equal(THEATER_ENSEMBLE.filter(p=>p.origin==='Albischer Herkunft').length,3);
  for(const origin of ['Mathringen','Istharan'])assert.equal(THEATER_ENSEMBLE.filter(p=>p.origin===origin).length,1);
  assert.equal(THEATER_ENSEMBLE.filter(p=>p.origin==='Aldrimar').length,2);
  const sabjorn=THEATER_ENSEMBLE.find(p=>p.key==='sabjorn');
  assert.equal(sabjorn.birth,'1717');
  assert.match(sabjorn.appearance,/muscular/);
  for(const person of THEATER_ENSEMBLE.filter(p=>p.origin==='Cenyr'))assert.ok(1740-Number(person.birth)>=20&&1740-Number(person.birth)<=40);
});

test('the director stands out and her family remains a deferred origin rather than an invented tree',()=>{
  assert.equal(THEATER_DIRECTOR.birth,'1675');
  assert.match(THEATER_DIRECTOR.role,/Inhaberin und Intendantin/);
  assert.match(THEATER_DIRECTOR.appearance,/voluminous silver-grey/);
  assert.match(THEATER_DIRECTOR.appearance,/OPEN.*fan/);
  assert.match(THEATER_DIRECTOR.bio,/Arrogant/);
  assert.equal(THEATER_DIRECTOR.familyOrigin.developed,false);
  assert.equal(THEATER_DIRECTOR.familyOrigin.seat,'Lynthor');
});

test('Rhianna reuses her canonical identity and portrait, and import plans preserve existing profiles',()=>{
  const canonical=HOUSE_DRAIG_FAMILY.persons.find(p=>p.id==='rihanna-ceirwynn');
  assert.equal(THEATER_PATRON.worldPersonId,canonical.worldPersonId);
  assert.equal(THEATER_PATRON.portrait,`../Stammbäume/${canonical.portrait}`);
  const prior={id:'existing-rhianna',identity:{worldPersonId:canonical.worldPersonId},name:'Originalname',bio:'Eigene Beschreibung',portrait:'eigenes-bild.png',hp:{current:7,max:35},inventory:[{id:'owned-item'}]};
  const before=structuredClone(prior);
  const plan=planTheaterCharacters([prior],{},'2026-10-17T12:00:00Z');
  assert.deepEqual(prior,before);
  assert.equal(plan.entries.length,15);
  assert.equal(new Set(plan.entries.map(p=>p.id)).size,15);
  const patron=plan.entries.find(p=>p.key==='rhianna');
  assert.equal(patron.id,prior.id);assert.equal(patron.create,false);
  assert.ok(Object.keys(patron.patch||{}).every(key=>['genealogy','updatedAt'].includes(key)));
  assert.equal(plan.entries.filter(p=>p.create).length,14);
});

test('repertoire retains four vacancies and the specified historical story facts',()=>{
  const works=entry.pages[4].theatreProgram.items;
  assert.equal(works.filter(p=>p.title).length,4);
  assert.equal(works.filter(p=>!p.title).length,4);
  const text=works.map(p=>JSON.stringify(p));
  assert.match(text[0],/Lehrling/);assert.match(text[0],/rotes Haar/);
  assert.match(text[1],/Sigrun.*Freydis Frostauge/);assert.match(text[1],/Sabjorn.*Sigurd Vaeren/);
  assert.match(text[1],/zwölf schwere Prüfungen/);assert.match(text[1],/Cadfan.*blonder Perücke/);
  assert.match(text[1],/Njörd Frostauge/);
  assert.doesNotMatch(text[1],/1720|Rochraide|Gae Bolg|Roten Berg/);
  assert.deepEqual(THEATER_PRODUCTIONS[1].actors,['sigrun','sabjorn','cadfan']);
  assert.match(text[3],/1247–1266/);assert.match(text[3],/1248–1265/);
  assert.match(text[3],/niemand an Bord überlebt/);assert.match(text[3],/Ein Jahr nach/);
  for(const work of THEATER_PRODUCTIONS){
    assert.doesNotMatch(work.visual,/elven|\belf\b/);
    for(const key of work.actors)assert.ok(THEATER_ENSEMBLE.some(p=>p.key===key));
  }
});

test('repertoire sanitation handles null input, is idempotent and does not cap expansion at eight',async()=>{
  const context=vm.createContext({getRomanPageLabel:()=> 'I.'});
  vm.runInContext(await readFile(new URL('../modules/theatre-program/theatre-program-data.js',import.meta.url),'utf8'),context);
  const sanitize=value=>JSON.parse(JSON.stringify(context.sanitizeTheatreProgramData(value)));
  assert.equal(sanitize(null).items.length,0);
  const data=sanitize({title:'  Programm  ',items:[null,{},...Array.from({length:10},(_,i)=>({title:`Stück ${i}`,unknown:'discard'}))]});
  assert.equal(data.title,'Programm');assert.equal(data.items.length,12);
  assert.equal(data.items[0].title,'');assert.equal(data.items[1].title,'');
  assert.ok(!('unknown' in data.items[2]));assert.deepEqual(sanitize(data),data);
});

test('all twenty-nine active project assets and reused portraits exist and match the saved generation records',async()=>{
  const manifest=await json('../assets/gwynthor-theater/image-prompts.json');
  const results=await json('../assets/gwynthor-theater/image-results.json');
  assert.equal(manifest.entries.length,29);assert.equal(results.images.length,29);
  for(const job of manifest.entries){
    const bytes=await readFile(new URL(`../../${job.destination}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),results.images.find(r=>r.id===job.id)?.sha256,job.id);
  }
  for(const person of THEATER_PEOPLE)await access(new URL(`../${person.portrait}`,import.meta.url));
  for(const job of manifest.entries.filter(j=>j.id.startsWith('production-')))assert.match(job.prompt,/ordinary rounded HUMAN ears/);
});
