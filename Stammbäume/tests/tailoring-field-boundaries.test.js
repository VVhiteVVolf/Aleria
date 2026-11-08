import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { withMaerllysTailoringContent } from '../assets/js/data/gwniwr-maerllys-links.js';
const source=id=>FAMILY_REGISTRY.find(row=>row.id===id).family;
const person=(family,id)=>family.persons.find(person=>person.id===id);

test('the new Swyll portraits preserve Rhiannons previously unowned personal portrait',()=>{
 const registered=source('haus-swyll'),saved=structuredClone(registered);
 saved.extensions.sourceRevision=14;
 person(saved,'rhiannon-draenmelyn').portrait='https://example.test/personal-rhiannon.png';
 const upgraded=resolveRegisteredFamilyUpgrade(registered,saved);
 assert.equal(person(upgraded,'rhiannon-draenmelyn').portrait,'https://example.test/personal-rhiannon.png');
 assert.equal(person(registered,'rhiannon-draenmelyn').extensions.registryManagedFieldRevisions.portrait,undefined);
 assert.equal(registered.extensions.registryManagedEntitySourceRevision,14);
});

test('the Gwniwr marriage correction preserves Craigddu structural revision3 and personal names',()=>{
 const registered=source('craigddu'),saved=structuredClone(registered);
 saved.extensions.sourceRevision=3;
 person(saved,'person-28b0e0a3').name='Eigener recherchierter Name';
 person(saved,'person-0774c56b').worldPersonId='person--craigddu--person-0774c56b';
 const upgraded=resolveRegisteredFamilyUpgrade(registered,saved);
 assert.equal(registered.extensions.registryManagedEntitySourceRevision,3);
 assert.equal(person(upgraded,'person-28b0e0a3').name,'Eigener recherchierter Name');
 assert.equal(person(upgraded,'person-0774c56b').worldPersonId,'person--gwniwr--person-cf831497');
});

test('the new counterpart portraits upgrade the actual previously registered Tonnarth5 and Ysgrif6',()=>{
 for(const[id,revision,personId]of[['haus-tonnarth',5,'madoc-tonnarth'],['haus-ysgrif',6,'owain-maerllys']]){
  const registered=source(id),saved=structuredClone(registered);saved.extensions.sourceRevision=revision;
  person(saved,personId).portrait='';
  const upgraded=resolveRegisteredFamilyUpgrade(registered,saved);
  assert(registered.extensions.sourceRevision>revision,id);
  assert(person(registered,personId).extensions.registryManagedFieldRevisions.portrait>revision,id);
  assert.equal(person(upgraded,personId).portrait,person(registered,personId).portrait,id);
  const custom=structuredClone(saved);person(custom,personId).portrait='https://example.test/personal-existing.png';
  assert.equal(person(resolveRegisteredFamilyUpgrade(registered,custom),personId).portrait,'https://example.test/personal-existing.png',id+' fill only');
 }
});

test('the six existing Maerllys portraits receive no new portrait ownership; saved Rhys remains personal',()=>{
 const registered=source('haus-maerllys');
 for(const id of['nia-maerllys','rhys-maerllys','elowen-maerllys','gwenora-maerllys','matteo-veltrane','edern-vann'])
  assert((person(registered,id).extensions?.registryManagedFieldRevisions?.portrait||0)<12,id);
 const saved=structuredClone(registered);saved.extensions.sourceRevision=9;
 person(saved,'rhys-maerllys').portrait='https://example.test/personal-rhys.png';person(saved,'rhys-maerllys').name='Eigener Rhysname';
 const upgraded=resolveRegisteredFamilyUpgrade(registered,saved);
 assert.equal(person(upgraded,'rhys-maerllys').portrait,'https://example.test/personal-rhys.png');
 assert.equal(person(upgraded,'rhys-maerllys').name,'Eigener Rhysname');
});

test('the task wrapper never materializes metadata on unrelated people or relationship entities',()=>{
 const before=structuredClone(source('haus-swyll'));
 person(before,'rhiannon-draenmelyn').extensions.registryManagedFields.push('customResearch');
 person(before,'rhiannon-draenmelyn').extensions.customResearch={notes:'Eigene Forschung',revision:91};
 const after=withMaerllysTailoringContent(before);
 const targeted=new Set(['bronwen-swyll','iorwerth-maerllys']);
 for(const entity of before.persons.filter(entity=>!targeted.has(entity.id)))
  assert.deepEqual(person(after,entity.id),entity,entity.id);
 for(const collection of['partnerships','parentages','cadetBranches','timeJumps'])assert.deepEqual(after[collection],before[collection],collection);
 for(const house of before.houses.filter(house=>house.id!=='house-maerllys'))assert.deepEqual(after.houses.find(h=>h.id===house.id),house,house.id);
});

test('saved Maerllys9 and11 receive the origin and new house without reopening personal genealogy or biography',()=>{
 const registered=source('haus-maerllys');
 for(const revision of[9,11]){
  const saved=structuredClone(registered);saved.extensions.sourceRevision=revision;
  saved.lineage.originHouse={...saved.lineage.originHouse,enabled:false};
  saved.houses=saved.houses.filter(house=>house.id!=='house-gwniwr');
  person(saved,'cadfan-maerllys').notes='Eigene erhaltene Familienforschung';
  person(saved,'rhys-maerllys').name='Persönlicher Rhysname';
  saved.extensions.houseBiographyModule.quote='Eigene Hausbiografie';
  const biography=structuredClone(saved.extensions.houseBiographyModule);
  const parentages=structuredClone(saved.parentages),partnerships=saved.partnerships.map(edge=>({...structuredClone(edge),extensions:structuredClone(edge.extensions||{})}));
  const upgraded=resolveRegisteredFamilyUpgrade(registered,saved);
  assert.equal(upgraded.extensions.registryManagedEntitySourceRevision,8);
  assert.equal(upgraded.lineage.originHouse.enabled,true);
  const house=upgraded.houses.find(house=>house.id==='house-gwniwr');assert(house);
  assert.equal(house.extensions.registryManagedSourceRevision,registered.extensions.sourceRevision);
  assert.equal(person(upgraded,'cadfan-maerllys').notes,'Eigene erhaltene Familienforschung');
  assert.equal(person(upgraded,'rhys-maerllys').name,'Persönlicher Rhysname');
  assert.deepEqual(upgraded.extensions.houseBiographyModule,biography);
  assert.deepEqual(upgraded.parentages,parentages);assert.deepEqual(upgraded.partnerships,partnerships);
 }
});

test('all ten constructor-seeded new Maerllys portraits upgrade saved9,11 and12 while personal images stay local',()=>{
 const registered=source('haus-maerllys');
 const ids=['cadfan-maerllys','eira-spouse-maerllys','owain-maerllys','gwenllian-ysgrif','geraint-maerllys','llio-falchdyn','rhoswen-maerllys','madoc-tonnarth','iorwerth-maerllys','bronwen-swyll'];
 for(const revision of[9,11,12]){
  const saved=structuredClone(registered);saved.extensions.sourceRevision=revision;
  for(const id of ids)person(saved,id).portrait='';
  const upgraded=resolveRegisteredFamilyUpgrade(registered,saved);
  for(const id of ids){assert.equal(person(upgraded,id).portrait,person(registered,id).portrait,id);assert(person(registered,id).extensions.registryManagedFieldRevisions.portrait>12,id);}
  const personal=structuredClone(saved);for(const id of ids)person(personal,id).portrait=`https://example.test/own-${id}.png`;
  const retained=resolveRegisteredFamilyUpgrade(registered,personal);for(const id of ids)assert.equal(person(retained,id).portrait,person(personal,id).portrait,id+' personal image');
 }
});
