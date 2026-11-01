import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const read=name=>readFile(new URL(name,import.meta.url),'utf8').then(JSON.parse);
// The first browser run exposed unrelated profile normalization. Preserve those
// original files as evidence; this repeat exercises the corrected operation.
const before=await read('browser-stability-before-state.json'),after=await read('browser-stability-after-state.json');
const rows=state=>[...state.characters,...state.creatures];
const money=state=>[state.account,...rows(state)].reduce((sum,row)=>sum+Number(row.inventory?.moneyState?.totalCopper||0),0);
const quantity=(state,id)=>[state.account,...rows(state)].flatMap(row=>row.inventory?.items||[])
  .filter(item=>item.definitionRef?.id===id).reduce((sum,item)=>sum+Number(item.quantity||1),0);
const actorChecks=rows(before).map(original=>{
  const current=rows(after).find(row=>row.id===original.id);
  assert.deepEqual(current.combatProfile,original.combatProfile,`${original.name}: unrelated combat profile changed`);
  return {id:original.id,name:original.name,combatProfileUnchanged:true};
});
assert.equal(money(after),money(before));
assert.equal(after.account.inventory.moneyState.totalCopper,45);
const ylvaBefore=before.characters.find(row=>row.name==='Ylva Wolfshorn'),ylvaAfter=after.characters.find(row=>row.id===ylvaBefore.id);
assert.equal(ylvaAfter.inventory.moneyState.totalCopper-ylvaBefore.inventory.moneyState.totalCopper,2);
for(const id of ['standard:gemischtwarenhandler:rationen','standard:alchemist:heiltrank'])assert.equal(quantity(after,id),quantity(before,id));
const freki=after.creatures.find(row=>row.id==='companion-ylva-freki');
assert.equal(freki.inventory.items.filter(item=>item.definitionRef?.id==='standard:gemischtwarenhandler:rationen').reduce((sum,item)=>sum+Number(item.quantity),0),1);
assert.equal(quantity(after,'standard:waffen-rustungen:ritterschwert'),quantity(before,'standard:waffen-rustungen:ritterschwert'));
assert.equal(after.account.revision-before.account.revision,2);
const report={project:'demo-aleria-group-ui',operations:2,actors:actorChecks,moneyConserved:true,groupCopper:{before:47,after:45},
  ylvaCopperReceived:2,rationConserved:true,rationTransferredToFreki:true,unrelatedItemQuantitiesPreserved:true,
  canonicalDefinitionRevision:after.standardVersion,groupRevision:{before:before.account.revision,after:after.account.revision}};
await writeFile(new URL('browser-transfer-verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
