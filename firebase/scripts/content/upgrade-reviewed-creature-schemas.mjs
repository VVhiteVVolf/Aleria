import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { REVIEWED_CREATURE_SCHEMA_IDS, planCreatureSheetSchemaUpgrade } from '../../../AleriaAlmanach/modules/combat-sheet/combat-sheet-schema-upgrade.mjs';
const client=await createContentPublicationClient(),now=new Date().toISOString();
const raw=await Promise.all(REVIEWED_CREATURE_SCHEMA_IDS.map(id=>client.request(`/creatures/${id}`)));
const decode=raw=>({...decodeFirestoreFields(raw.fields),id:raw.name.split('/').at(-1)});
const plans=raw.map(raw=>planCreatureSheetSchemaUpgrade(decode(raw),now));
if(process.argv.includes('--verify')){assert(plans.every(plan=>!plan.changed));console.log(JSON.stringify({verified:true,profiles:2}));}
else if(!process.argv.includes('--apply'))console.log(JSON.stringify({dryRun:true,profiles:2,changed:plans.filter(plan=>plan.changed).length}));
else{
 const locks=await Promise.all(REVIEWED_CREATURE_SCHEMA_IDS.map(id=>client.request(`/combat_profile_locks/creatures/records/${id}`)));
 locks.forEach(lock=>assert(!lock||!decodeFirestoreFields(lock.fields).activeEncounterKeys?.length,'Aktiver Kampf.'));
 const writes=[];
 plans.forEach((plan,index)=>{if(!plan.changed)return;
  writes.push({verify:client.documentName(`combat_profile_locks/creatures/records/${plan.character.id}`),currentDocument:locks[index]?{updateTime:locks[index].updateTime}:{exists:false}});
  writes.push({update:{name:raw[index].name,fields:encodeFirestoreFields({combatProfile:{schemaVersion:plan.character.combatProfile.schemaVersion,revision:plan.character.combatProfile.revision},updatedAt:now})},
   updateMask:{fieldPaths:plan.fieldPaths},currentDocument:{updateTime:raw[index].updateTime}});
 });
 if(writes.length){
  await backupContentPublication('creature-sheet-schema-20261102',[...raw,...locks],[],now);
  const commit=await client.request(':commit',{writes});
  const after=await Promise.all(REVIEWED_CREATURE_SCHEMA_IDS.map(id=>client.request(`/creatures/${id}`)));
  after.forEach((raw,index)=>assert.deepEqual(decode(raw),plans[index].character));
  await writeFile(new URL('../../../diagnostics/combat-sheets-20261102/creature-schema-after.json',import.meta.url),JSON.stringify({verified:true,committedAt:commit.commitTime,before:raw.map(decode),characters:after.map(decode)},null,2)+'\n');
 }
 console.log(JSON.stringify({applied:true,profiles:2,changed:plans.filter(plan=>plan.changed).length}));
}
