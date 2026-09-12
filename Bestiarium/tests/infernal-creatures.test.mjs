import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BESTIARY_CHAPTERS,BESTIARY_ENTRIES} from '../modules/catalog/catalog-data.js';
import {filterEntries} from '../modules/catalog/catalog-model.js';
import {INFERNAL_CREATURE_ENTRIES} from '../modules/catalog/infernal-creatures.js';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));

test('only the retained named creatures appear within existing infernal groups',()=>{
  assert.deepEqual(BESTIARY_CHAPTERS.find(c=>c.id==='infernale').groups.map(g=>g.id),['infernale-linien','einzelne-infernale']);
  assert.deepEqual(INFERNAL_CREATURE_ENTRIES.map(e=>e.id),['gorgonen','gargoyles','steinriesen','formwandler','fluesterlinge','echogeister','mimikschreier','harpyien','oblex','tengu','lamia','korrigan','fachan']);
  for(const [query,id] of [['Gorgonnen','gorgonen'],['Harpyie','harpyien'],['Fluesterlinge','fluesterlinge'],['Felsriesen','steinriesen']])assert(filterEntries(BESTIARY_ENTRIES,{query,kind:'infernale'}).some(e=>e.id===id));
  for(const query of ['Trolle','Insekten','Mahr','Schwellenlose','Leerwanderer','Heimwehlichter','Sternverlorene','Nachtweber','Traumwandler','Erinnerungsdiebe'])assert.equal(filterEntries(BESTIARY_ENTRIES,{query,kind:'infernale'}).length,0,query);
});

test('neutral creatures keep their original dossiers while Formwandler belong to Maelach',()=>{
  assert.equal(BESTIARY_ENTRIES.find(e=>e.id==='trolle').kind,'kreaturen');
  assert.equal(BESTIARY_ENTRIES.find(e=>e.id==='insekten').kind,'tiere');
  const trolls=read('../wesen/gruppen/trolle/profil.json');
  const insects=read('../tiere/insekten/art.json');
  const mahr=read('../wesen/geister/mahr/profil.json');
  assert.doesNotMatch(JSON.stringify([trolls,insects]),/Syressa|umkreise/);
  assert.doesNotMatch(JSON.stringify(mahr),/Nymhra|umkreise/);
  const group=read('../wesen/gruppen/inferniiden/profil.json');
  assert.deepEqual(group.related.branches.find(b=>b.id==='maelach').levels.flatMap(l=>l.entryIds),['formwandler']);
  assert(!group.related.branches.find(b=>b.id==='sanguine').levels.flatMap(l=>l.entryIds).includes('formwandler'));
});
