import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=JSON.parse(readFileSync(new URL('../../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/halenrhyd.source.json',import.meta.url),'utf8'));
// Reconstruct only the separately authorized admission for older map invariants.
// Current complete pins must still equal their retained, reviewed admission.
export function projectHalenrhydOriginalPins(pins,admission=source){
 const ids=['gwynthor-marking-063','gwynthor-marking-066'];
 const {originalPins,admittedPins}=admission.publicProjection;
 assert.deepEqual(originalPins.map(p=>p.id).sort(),ids);assert.deepEqual(admittedPins.map(p=>p.id).sort(),ids);
 for(const id of ids){const current=pins.filter(p=>p.id===id),original=originalPins.find(p=>p.id===id),expected=admittedPins.find(p=>p.id===id);
  assert.equal(current.length,1);assert.deepEqual(current[0],expected,id+': only the reviewed admission is projectable');
  assert.deepEqual([expected.x,expected.y,expected.cat,expected.templateId],[original.x,original.y,original.cat,original.templateId]);}
 return pins.map(p=>ids.includes(p.id)?structuredClone(originalPins.find(o=>o.id===p.id)):p);
}
