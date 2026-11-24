import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {projectNorthernFarmOriginalPins} from './support/northern-farms-pin-history.mjs';
import {projectChamoisOriginalPin} from './support/chamois-estate-pin-history.mjs';
import {projectTirfelynOriginalPins} from './support/tirfelyn-hof-pin-history.mjs';
import {projectPriorHalenrhydCover} from './support/halenrhyd-pin-history.mjs';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { NORTHERN_FARMS } from '../../shared/gwynthor-northern-farms/northern-farms.mjs';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const source=read('Cenyr/celtigerns-wacht/llamrais-ankunft/northern-farms.source.json');
const gwynthor=read(source.maps.gwynthor),bronhir=read(source.maps.bronhir);
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('Caehelyg replaces one unnamed farm while the other 169 entries remain intact',()=>{
 assert.equal(gwynthor.state.pins.length,170);
 const original=source.publicProjection.originalPins[0];
 const farm=source.publicProjection.admittedPins[0];
 assert.equal(farm.title,'Hof Caehelyg');assert.equal(farm.secret,false);
 assert.deepEqual({...farm,title:original.title,text:original.text,table:original.table},original);
 const changed=farm.table.filter((field,index)=>field.v!==original.table[index].v);
 assert.deepEqual(changed.map(field=>field.k),['Name','Typ','Bewirtschaftung']);
 const beforeNewFamilies = projectNorthernFarmOriginalPins(gwynthor.state.pins);
 const priorToChamois = projectTirfelynOriginalPins(projectChamoisOriginalPin(projectPriorHalenrhydCover(beforeNewFamilies)))
  .map(pin => pin.id !== 'gwynthor-marking-157' ? pin : {
   ...pin,
   img: '/Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Pert/assets/pert-bauer.png',
   imgLink: '/Familien Häuser und Clans/kleinehaeuser.html?haus=pert'
  });
 assert.equal(hash(priorToChamois.filter(pin=>pin.id!==original.id)),source.publicProjection.untouchedGwynthorPinsSHA256);
});

test('each northern farm has a distinct coat and a linked commoner family with the agreed service', () => {
 assert.deepEqual(NORTHERN_FARMS.map(farm => farm.liegeName), ['Haus Gafyr','Haus Gafyr','Haus Draig','Haus Draig']);
 assert.equal(new Set(NORTHERN_FARMS.map(farm => farm.emblem)).size, 4);
 for (const farm of NORTHERN_FARMS) {
  const pin = gwynthor.state.pins.find(pin => pin.id === farm.pinId);
  const { family, houseProfile } = getRegisteredFamily(farm.familyId);
  assert.deepEqual(pin.residentFamilyIds, [farm.familyId]);
  assert.match(pin.crestLink, new RegExp(`haus=${farm.familyId}$`));
  assert.ok(pin.text.includes(`family=${farm.familyId}&mode=view`));
  assert.equal(pin.table.find(row => row.k === 'Dienstbindung').v, farm.liegeName);
  assert.equal(houseProfile.liegeHouseName, farm.liegeName);
  assert.equal(houseProfile.rankId, 'commoner');
  assert.equal(houseProfile.seat, farm.seat);
  assert.equal(pin.crest, '/Stammbäume/' + family.document.emblem);
  assert(existsSync(new URL('../../' + pin.crest.slice(1), import.meta.url)));
  assert.equal(family.persons.length, 2);
  assert.deepEqual(family.timeJumps[0].childIds, []);
 }
});

test('Maesrudd occupies a northern Bronhir location without changing previous regional data',()=>{
 assert.equal(bronhir.state.pins.length,1);
 assert.deepEqual(bronhir.state.pins,source.publicProjection.admittedBronhirPins);
 const farm=bronhir.state.pins[0];
 assert.equal(farm.id,'bronhir-maesrudd-hof');assert.equal(farm.title,'Maesrudd-Hof');
 assert.equal(farm.templateId,'landwirtschaft');assert.equal(farm.region,'Bronhir');
 assert.equal(farm.secret,false);assert(farm.y<0.1);
 assert.deepEqual(bronhir.state.cats,[source.publicProjection.category]);
 const restored=structuredClone(bronhir);
 restored.revision=source.publicProjection.originalBronhir.revision;
 restored.updatedAt=source.publicProjection.originalBronhir.updatedAt;
 restored.state.pins=[];delete restored.state.cats;
 assert.deepEqual(restored,source.publicProjection.originalBronhir);
 assert(existsSync(new URL('../../'+farm.crest.slice(1),import.meta.url)));
});

test('older pin invariants accept only the complete reviewed entry',()=>{
 const restored=projectNorthernFarmOriginalPins(gwynthor.state.pins);
 assert.deepEqual(restored.find(pin=>pin.id==='gwynthor-marking-042'),source.publicProjection.originalPins[0]);
 const modified=structuredClone(gwynthor.state.pins);
 modified.find(pin=>pin.id==='gwynthor-marking-042').text+=' Additional text';
 assert.throws(()=>projectNorthernFarmOriginalPins(modified));
 const moved=structuredClone(gwynthor.state.pins);
 moved.find(pin=>pin.id==='gwynthor-marking-042').x+=0.001;
 assert.throws(()=>projectNorthernFarmOriginalPins(moved));
});
