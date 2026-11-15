import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=JSON.parse(readFileSync(new URL('../../Cenyr/celtigerns-wacht/llamrais-ankunft/northern-farms.source.json',import.meta.url),'utf8'));

export function projectNorthernFarmOriginalPins(pins,admission=source){
 const id='gwynthor-marking-042';
 const {originalPins,admittedPins}=admission.publicProjection;
 assert.deepEqual(originalPins.map(pin=>pin.id),[id]);
 assert.deepEqual(admittedPins.map(pin=>pin.id),[id]);
 const current=pins.filter(pin=>pin.id===id);
 assert.equal(current.length,1);
 assert.deepEqual(current[0],admittedPins[0],id+': only the reviewed farm entry is projectable');
 assert.deepEqual([current[0].x,current[0].y,current[0].cat,current[0].templateId],
  [originalPins[0].x,originalPins[0].y,originalPins[0].cat,originalPins[0].templateId]);
 return pins.map(pin=>pin.id===id?structuredClone(originalPins[0]):pin);
}
