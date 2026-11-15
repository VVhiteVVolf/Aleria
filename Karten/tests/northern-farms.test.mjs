import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {projectNorthernFarmOriginalPins} from './support/northern-farms-pin-history.mjs';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const source=read('Cenyr/celtigerns-wacht/llamrais-ankunft/northern-farms.source.json');
const gwynthor=read(source.maps.gwynthor),bronhir=read(source.maps.bronhir);
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('Caehelyg replaces one unnamed farm while the other 169 entries remain intact',()=>{
 assert.equal(gwynthor.state.pins.length,170);
 const original=source.publicProjection.originalPins[0];
 const farm=gwynthor.state.pins.find(pin=>pin.id===original.id);
 assert.deepEqual(farm,source.publicProjection.admittedPins[0]);
 assert.equal(farm.title,'Hof Caehelyg');assert.equal(farm.secret,false);
 assert.deepEqual({...farm,title:original.title,text:original.text,table:original.table},original);
 const changed=farm.table.filter((field,index)=>field.v!==original.table[index].v);
 assert.deepEqual(changed.map(field=>field.k),['Name','Typ','Bewirtschaftung']);
 assert.equal(hash(gwynthor.state.pins.filter(pin=>pin.id!==original.id)),source.publicProjection.untouchedGwynthorPinsSHA256);
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
