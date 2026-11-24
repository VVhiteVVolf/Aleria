import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { NORTHERN_FARMS } from '../../../shared/gwynthor-northern-farms/northern-farms.mjs';
import { projectNorthernFarmPin } from '../../modules/northern-farms/northern-farm-pins.mjs';
const source=JSON.parse(readFileSync(new URL('../../Cenyr/celtigerns-wacht/llamrais-ankunft/northern-farms.source.json',import.meta.url),'utf8'));
const previous = JSON.parse(readFileSync(new URL('./northern-families.previous.json', import.meta.url), 'utf8'));

export function projectNorthernFarmOriginalPins(pins,admission=source){
 const id='gwynthor-marking-042';
 const {originalPins,admittedPins}=admission.publicProjection;
 assert.deepEqual(originalPins.map(pin=>pin.id),[id]);
 assert.deepEqual(admittedPins.map(pin=>pin.id),[id]);
 const restored = pins.map(pin => {
  const farm = NORTHERN_FARMS.find(item => item.pinId === pin.id);
  if (!farm) return pin;
  const prior = priorFarmPin(farm);
  assert.deepEqual(pin, projectNorthernFarmPin(prior, farm), `${farm.seat}: reviewed farm projection`);
  return structuredClone(prior);
 });
 const current=restored.filter(pin=>pin.id===id);
 assert.equal(current.length,1);
 assert.deepEqual(current[0],admittedPins[0],id+': only the reviewed farm entry is projectable');
 assert.deepEqual([current[0].x,current[0].y,current[0].cat,current[0].templateId],
  [originalPins[0].x,originalPins[0].y,originalPins[0].cat,originalPins[0].templateId]);
 return restored.map(pin=>pin.id===id?structuredClone(originalPins[0]):pin);
}

function priorFarmPin(farm) {
 return farm.slug === 'caehelyg' ? source.publicProjection.admittedPins[0] : previous.find(pin => pin.id === farm.pinId);
}
