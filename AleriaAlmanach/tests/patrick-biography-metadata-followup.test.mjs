import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeFirestoreFields,decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
import { buildPatrickMetadataPlan,buildPatrickMetadataWrites,verifyPatrickMetadataFollowup,applyPatrickMetadataFollowup } from '../../firebase/scripts/content/patrick-biography-metadata-followup.mjs';
import { preparePatrickBiographyCharacters,getPatrickBiographyCharacterMetadata,buildPatrickBiographyModule } from '../modules/patrick-biographies/biography-source.mjs';
import { planPatrickBiographies } from '../modules/patrick-biographies/biography-plan.mjs';
import { CADOGAN_CHARACTER_ID,RHIANNON_CHARACTER_ID,GWEN_CHARACTER_ID } from '../modules/patrick-biographies/biography-identities.mjs';
import { createPatrickBiographyExports } from '../modules/patrick-biographies/biography-database-projection.mjs';

const BEFORE='2026-11-03T18:00:00.000Z',NOW='2026-11-03T19:00:00.000Z',COMMIT='2026-11-03T19:00:01.123456Z';
const documentName=path=>'projects/test/databases/(default)/documents/'+path;
const TARGET='characters/'+RHIANNON_CHARACTER_ID;
function fixture(){
  const current=[CADOGAN_CHARACTER_ID,RHIANNON_CHARACTER_ID].map(id=>({id,name:id,identity:{worldPersonId:id},updatedAt:BEFORE,
    biography:buildPatrickBiographyModule(id),role:'Keep other role',bio:'Keep other summary',
    inventory:{items:[{id:'personal',name:'Unrelated personal item',quantity:'7'}],coins:{copper:9},revision:7},
    combatProfile:{hitPoints:{current:0},resources:[{current:0}]},ownerUid:'secret-owner'}));
  const prepared=preparePatrickBiographyCharacters(current,{now:BEFORE}),pets=planPatrickBiographies({characters:prepared,now:BEFORE});
  const characters=prepared.map(person=>({...person,...pets.characters.find(row=>row.id===person.id).patch}));
  const rhiannon=characters.find(row=>row.id===RHIANNON_CHARACTER_ID);
  rhiannon.role='Bedienstete des Hauses Draig';rhiannon.bio='Rhiannon Draenmelyn ist eine Bedienstete.';
  const documents=Object.fromEntries([...characters.map(row=>['characters/'+row.id,row]),...pets.creatures.map(row=>['creatures/'+row.id,row])]
    .map(([path,{id,...row}])=>[path,{name:documentName(path),fields:encodeFirestoreFields(row),updateTime:BEFORE}]));
  documents[TARGET].fields.rawStamp={timestampValue:'2026-10-01T12:34:56.123456789Z'};
  documents[TARGET].fields.rawReference={referenceValue:documentName('other/keep')};
  documents[TARGET].fields.rawBytes={bytesValue:'AAECAw=='};
  const sourceHashes={fixture:'a'.repeat(64)};
  return {documents,sourceHashes,plan:buildPatrickMetadataPlan({documents,preparedAt:NOW,previousPlanId:'b'.repeat(64),sourceHashes})};
}
function clientFor(initial){
  const documents=structuredClone(initial),events=[];
  return {documents,events,documentName,async request(path,body){
    if(!body)return structuredClone(documents[path.slice(1)]||null);
    assert.equal(path,':commit');events.push('commit');
    assert.equal(body.writes.length,7);assert.equal(body.writes.filter(write=>write.update).length,1);
    for(const write of body.writes){const key=(write.verify||write.update.name).split('/documents/')[1];assert.equal(documents[key].updateTime,write.currentDocument.updateTime);}
    const write=body.writes.find(row=>row.update);assert.deepEqual(write.updateMask.fieldPaths,['bio','role','updatedAt']);
    documents[TARGET]={...documents[TARGET],fields:{...documents[TARGET].fields,...structuredClone(write.update.fields)},updateTime:COMMIT};
    return {commitTime:COMMIT};
  }};
}
function hooks(client,sourceHashes){return {sourceHashes:async()=>sourceHashes,backup:async(label,documents,newIds)=>{
  assert.equal(documents.length,7);assert.deepEqual(newIds,[]);assert(documents.find(doc=>doc.fields.rawStamp));client.events.push('backup');
},confirm:async(confirmation,proof)=>{client.events.push('confirm');assert.equal(confirmation.committedAt,COMMIT);
  const exports=createPatrickBiographyExports(confirmation),rhiannon=exports.find(row=>row.character.id===RHIANNON_CHARACTER_ID);
  assert.equal(rhiannon.character.role,getPatrickBiographyCharacterMetadata(RHIANNON_CHARACTER_ID).role);
  assert.equal(rhiannon.character.bio,getPatrickBiographyCharacterMetadata(RHIANNON_CHARACTER_ID).bio);
  assert(exports.filter(row=>row.character.id!==RHIANNON_CHARACTER_ID).every(row=>!Object.hasOwn(row.character,'role')&&!Object.hasOwn(row.character,'bio')));
  assert.equal(proof.inventoryWrites,0);assert.equal(proof.combatWrites,0);assert.equal(proof.verifyOnlyDocuments,6);
}};}

test('Rhiannon role and flat introduction derive from her authored opening while other profiles expose no replacement',()=>{
  const metadata=getPatrickBiographyCharacterMetadata(RHIANNON_CHARACTER_ID);
  assert.match(metadata.role,/Wappen- und Zeichenmeisterin/);assert.match(metadata.bio,/Gemahlin von Iestyn Swyll und Mutter dreier Kinder/);
  assert(!metadata.bio.includes('<'));assert(!metadata.bio.includes('Bedienstete'));
  assert.deepEqual(getPatrickBiographyCharacterMetadata(CADOGAN_CHARACTER_ID),{});
  assert.deepEqual(getPatrickBiographyCharacterMetadata(GWEN_CHARACTER_ID),{});
});

test('metadata commit has one exact three-field mask, six version verifications and encrypted complete backup before writing',async()=>{
  const {plan,documents,sourceHashes}=fixture(),before=structuredClone(documents),client=clientFor(documents);
  const writes=buildPatrickMetadataWrites(plan,documents,documentName);
  assert.equal(writes.filter(row=>row.verify).length,6);assert(!JSON.stringify(writes.find(row=>row.update)).includes('inventory'));
  const proof=await applyPatrickMetadataFollowup({client,plan,hooks:hooks(client,sourceHashes)});
  assert.deepEqual(client.events,['backup','commit','confirm']);assert.equal(proof.verified,true);
  assert.equal(verifyPatrickMetadataFollowup(plan,before,client.documents),true);
  const after=decodeFirestoreFields(client.documents[TARGET].fields),prior=decodeFirestoreFields(before[TARGET].fields);
  for(const key of ['biography','inventory','combatProfile','ownerUid'])assert.deepEqual(after[key],prior[key]);
  for(const key of ['rawStamp','rawReference','rawBytes'])assert.deepEqual(client.documents[TARGET].fields[key],before[TARGET].fields[key]);
});

test('changed source, any concurrent public edit, missing pet ownership or altered plan stops before backup and commit',async()=>{
  for(const mutate of [
    input=>{input.sourceHashes.fixture='c'.repeat(64);},
    input=>{input.documents[TARGET].updateTime='2026-11-03T18:01:00Z';},
    input=>{const pet=Object.keys(input.documents).find(path=>path.startsWith('creatures/'));input.documents[pet].fields.notes={stringValue:'Changed'};},
    input=>{input.documents[TARGET].fields.inventory.mapValue.fields.companions.arrayValue.values=[];},
    input=>{input.plan.fields.role={stringValue:'Wrong role'};},
  ]){
    const input=fixture();mutate(input);const client=clientFor(input.documents);
    await assert.rejects(applyPatrickMetadataFollowup({client,plan:input.plan,hooks:hooks(client,input.sourceHashes)}));
    assert.deepEqual(client.events,[]);
  }
});

test('post-write proof refuses changed raw types or another person rather than accepting matching decoded strings',()=>{
  const {plan,documents}=fixture(),after=structuredClone(documents);
  after[TARGET].fields={...after[TARGET].fields,...plan.fields};
  assert.equal(verifyPatrickMetadataFollowup(plan,documents,after),true);
  after[TARGET].fields.rawReference={stringValue:documents[TARGET].fields.rawReference.referenceValue};
  assert.throws(()=>verifyPatrickMetadataFollowup(plan,documents,after),/REST-Felder/);
  const other=structuredClone(documents);other[TARGET].fields={...other[TARGET].fields,...plan.fields};
  other['characters/'+CADOGAN_CHARACTER_ID].fields.bio={stringValue:'Unreviewed replacement'};
  assert.throws(()=>verifyPatrickMetadataFollowup(plan,documents,other),/andere Personen/);
});
