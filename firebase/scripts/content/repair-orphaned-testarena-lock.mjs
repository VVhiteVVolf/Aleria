// One-time repair of an evidenced orphan, never an age-based lock bypass.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
const client=await createContentPublicationClient(),path='combat_profile_locks/creatures/records/catalog-draig-lehensritter';
const expected='test-testarena-sparring::session:testarena-sparring:88d3305b-435d-4a89-b7b4-be5d518f9ac2';
const raw=await client.request('/'+path),before=decodeFirestoreFields(raw.fields);
if(!before.activeEncounterKeys?.length){console.log(JSON.stringify({verified:true,idempotent:true}));process.exit(0);}
assert.deepEqual(before.activeEncounterKeys,[expected],'Eine andere oder zusätzliche Kampfsperre bleibt geschützt.');
const queries=[];
for(const entryId of ['test-testarena-sparring','test-testarena-sparring::session:testarena-sparring']){
 const rows=await client.request(':runQuery',{structuredQuery:{from:[{collectionId:'comments'}],where:{fieldFilter:{field:{fieldPath:'entryId'},op:'EQUAL',value:{stringValue:entryId}}},limit:1}});
 assert(!rows.some(row=>row.document),'Die referenzierte Szene enthält noch Kommentare; keine automatische Entsperrung.');
 queries.push({entryId,documents:0,readTimes:rows.map(row=>row.readTime).filter(Boolean)});
}
const now=new Date().toISOString(),writes=[{update:{name:raw.name,fields:{...encodeFirestoreFields({activeEncounterKeys:[]}),updatedAt:{timestampValue:now}}},
 updateMask:{fieldPaths:['activeEncounterKeys','updatedAt']},currentDocument:{updateTime:raw.updateTime}}];
if(!process.argv.includes('--apply'))console.log(JSON.stringify({dryRun:true,orphanVerified:true,queries}));
else{
 await backupContentPublication('orphaned-testarena-profile-lock-20261102',[raw],[],now);
 const commit=await client.request(':commit',{writes});
 const after=await client.request('/'+path);assert.deepEqual(decodeFirestoreFields(after.fields).activeEncounterKeys,[]);
 await writeFile(new URL('../../../diagnostics/combat-sheets-20261102/orphan-lock-repair.json',import.meta.url),JSON.stringify({verified:true,committedAt:commit.commitTime,path,queries,before,after:decodeFirestoreFields(after.fields),profileWrites:0,historyWrites:0},null,2)+'\n');
 console.log(JSON.stringify({applied:true,verified:true,profileWrites:0,historyWrites:0}));
}
