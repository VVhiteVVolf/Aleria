import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { completeLetzteRast } from '../modules/letzte-rast/rast-module.mjs';
import { VANN_PEOPLE, VANN_MARRIAGES, vannPerson } from '../modules/letzte-rast/rast-people.mjs';
import { RAST_STAFF } from '../modules/letzte-rast/rast-staff.mjs';
import { RAST_DISHES } from '../modules/letzte-rast/rast-menu.mjs';
import { HOUSE_VANN_FAMILY as vann } from '../../Stammbäume/assets/js/data/vann-family-records.js';
import { HOUSE_MAERLLYS_FAMILY as maerllys } from '../../Stammbäume/assets/js/data/house-maerllys-family.js';
import { HOUSE_PENDRWN_FAMILY as pendrwn } from '../../Stammbäume/assets/js/data/house-pendrwn-family.js';
import { HOUSE_RAVES_FAMILY as raves } from '../../Stammbäume/assets/js/data/eleganz-family-records.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { assertMirroredCrossFamilyBatch } from '../../Stammbäume/assets/js/modules/family-sync/cross-family-sync-invariant.js';
import { auditFamilyChartLayoutPolicy } from '../../Stammbäume/assets/js/adapters/family-chart-layout-policy.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { planRastCharacters } from '../modules/letzte-rast/rast-characters.mjs';
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const source=(await read('../modules/letzte-rast/sources/module-before.json')).entry;
const teyrngarch=await read('../modules/krumme-kanne/source/teyrngarch.json');
const imports=await read('../modules/lachende-nixe/sources/drink-catalogs.json');
const entry=completeLetzteRast(source,[teyrngarch.entry||teyrngarch,...imports.map(i=>i.entry||i)]);

test('recorded ownership starts in 1334 and the historic gap does not claim direct parenthood',()=>{
  for(const family of [vann,maerllys,pendrwn,raves]) assertValidFamily(family);
  assert.equal(vann.timeJumps.length,1);
  assert.equal(vann.timeJumps[0].parentPartnershipId,'marriage-iestyn-efa-vann');
  assert.deepEqual(vann.timeJumps[0].childIds,['tudwal-vann']);
  assert.deepEqual(auditFamilyChartLayoutPolicy(vann).issues,[]);
  const gap=vann.parentages.find(p=>p.childId==='tudwal-vann');
  assert.equal(gap.certainty,'unknown');
  assert.equal(vannPerson('brenn').birth,'1673');
  assert.equal(vannPerson('brenn').portrait,'./assets/letzte-rast/references/brenn.png');
});
test('ages, marriages and known Vann relationships remain plausible',()=>{
  for(const m of VANN_MARRIAGES){for(const key of m.keys) assert.ok(Number(m.start)-Number(vannPerson(key).birth)>=18,m.id);
    for(const key of m.children)for(const parent of m.keys)assert.ok(Number(vannPerson(key).birth)-Number(vannPerson(parent).birth)>=18,`${parent}/${key}`);}
  for(const [parent,children]of [['brenn',['cadeyrn','owain']],['madoc',['edern','eirlys']]])for(const key of children)assert.ok(vann.parentages.find(p=>p.childId===vannPerson(key).id).parentIds.includes(vannPerson(parent).id));
});
test('three freely selected marriages preserve identities and continue children only at the destination',()=>{
  assertMirroredCrossFamilyBatch([vann,maerllys,pendrwn,raves].map(family=>({family,baseFamily:family})));
  for(const [key,family]of [['elowen',maerllys],['enid',pendrwn],['orestian',raves]])assert.equal(family.persons.find(p=>p.id===vannPerson(key).id).worldPersonId,vannPerson(key).worldPersonId);
  for(const key of ['celyn','iolo']){assert.ok(vann.persons.some(p=>p.id===vannPerson(key).id));assert.ok(!maerllys.persons.some(p=>p.id===vannPerson(key).id));}
  for(const key of ['cassian','elena']){assert.ok(raves.persons.some(p=>p.id===vannPerson(key).id));assert.ok(!vann.persons.some(p=>p.id===vannPerson(key).id));}
});
test('staff have six departments, first names, individual vacancies and no married-away relatives or small children',()=>{
  const hierarchy=entry.pages[3].hierarchy;
  assert.equal(hierarchy.trees.length,6);
  const nodes=hierarchy.trees.flatMap(t=>t.levels.flatMap(l=>l.nodes));
  assert.ok(!nodes.some(n=>/Eirlys|Orestian|Cassian|Elena/.test(n.title)));
  for(const p of RAST_STAFF)assert.ok(!p.name.includes(' '));
  for(const p of VANN_PEOPLE.filter(p=>p.staff&&p.resident&&!p.death))assert.ok(nodes.some(n=>n.title===p.name));
  for(const p of VANN_PEOPLE.filter(p=>1740-Number(p.birth)<12))assert.ok(!nodes.some(n=>n.title===p.name));
  assert.equal(new Set(nodes.map(n=>n.id)).size,nodes.length);
});
test('all old own dishes become premium illustrated goods and original comment threads survive insertion',()=>{
  assert.equal(entry.pages.length,14);
  for(const p of source.pages)assert.ok(entry.pages.some(q=>q.commentThreadKey===p.commentThreadKey));
  assert.ok(!entry.pages.some(p=>p.goodsTablePage));
  assert.equal(RAST_DISHES.length,27);
  const originals=source.pages[3].goodsTable.tables.flatMap(t=>t.rows).filter(r=>r.category==='besonderes-menu');
  assert.deepEqual(RAST_DISHES.map(d=>d.name),originals.map(r=>r.values.name));
  assert.equal(entry.pages[4].tradeCatalog.items.length,58);
  assert.equal(buildModuleOffers([entry],[]).length,62);
  assert.equal(entry.pages[5].guildServices.services.length,12);
  assert.equal(entry.pages[6].guestRegister.sections.flatMap(s=>s.guests).length,24);
  for(const p of entry.pages.filter(p=>p.sessionPage))assert.ok(!p.sessionIntro.includes('Einleitung der Szene'));
});
test('character plan keeps genealogy candidates and separates outside relatives from employees',()=>{
  const plan=planRastCharacters([],{},'2026-10-16T22:00:00Z');
  assert.equal(plan.entries.length,33);
  assert.equal(new Set(plan.entries.map(p=>p.id)).size,33);
});
test('all generated and preserved project artwork is present',async()=>{
  const manifest=await read('../assets/letzte-rast/image-prompts.json');
  for(const job of manifest.entries)await access(new URL(`../../${job.destination}`,import.meta.url));
  for(const person of VANN_PEOPLE)await access(new URL(`../${person.portrait.slice(2)}`,import.meta.url));
});
