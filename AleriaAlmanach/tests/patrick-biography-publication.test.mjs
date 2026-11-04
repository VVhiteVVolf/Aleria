import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeFirestoreFields, decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
import { CADOGAN_CHARACTER_ID, RHIANNON_CHARACTER_ID, GWEN_CHARACTER_ID } from '../modules/patrick-biographies/biography-identities.mjs';
import { PATRICK_READ_PATHS, PATRICK_PET_IDS, PATRICK_PUBLICATION_IDS, preparePatrickPublicationDesired,
  collectPatrickPublicationAssetUrls, buildPatrickPublicationPlan, buildPatrickPublicationWrites,
  validatePatrickPublicationPlan, publicationHash, verifyPatrickPublication,
  canonicalizePatrickRestEmptyContainers, patrickRestWrittenValuesEqual,
  verifyPatrickPublishedRecovery } from '../../firebase/scripts/content/patrick-biography-publication-plan.mjs';
import { applyPreparedPatrickPublication, verifyPreparedPatrickPublication, patrickPrivatePlanPath } from '../../firebase/scripts/content/patrick-biography-publication.mjs';

const NOW='2026-11-03T17:00:00.000Z', BEFORE='2026-11-03T16:00:00.000Z';
const documentName=path=>'projects/test/databases/(default)/documents/'+path;
function fixture() {
  const documents=Object.fromEntries(PATRICK_READ_PATHS.map(path=>[path,null]));
  for(const [id,name] of [[CADOGAN_CHARACTER_ID,'Cadogan Sgrechiwr'],[RHIANNON_CHARACTER_ID,'Rhiannon Draenmelyn']]) {
    const data={name,title:'Original',ownerUid:'owner-'+id,createdBy:'creator-'+id,identity:{worldPersonId:id},updatedAt:BEFORE,
      biography:{schema:'aleria.biography-module',stats:[{label:'Eigenes',value:'Original'}],biography:{biographyText:'<p>Original äöü.</p>',
        historyText:'<p>Originalgeschichte.</p>',abilities:[],connections:[],trivia:['Kein neuer Bonus'],works:['Originalwerk']}},
      inventory:{revision:12,items:[{id:'kept',name:'Original item',quantity:'7',custom:true}],custom:'retain'},
      combatProfile:{hitPoints:{current:1,maximum:30},resources:[{id:'mana',current:0,maximum:20}]},
      imageSets:[{id:'custom',portrait:'/custom.png'}],emotes:[{img:'/emote.png'}],customPrivateField:{retain:true}};
    const fields=encodeFirestoreFields(data);
    fields.inventory.mapValue.fields.items.arrayValue.values[0].mapValue.fields.capturedAt={timestampValue:'2026-10-01T12:34:56.123456789Z'};
    fields.inventory.mapValue.fields.items.arrayValue.values[0].mapValue.fields.reference={referenceValue:documentName('items/keep')};
    fields.rawBytes={bytesValue:'AAECAw=='};
    documents['characters/'+id]={name:documentName('characters/'+id),fields,updateTime:BEFORE};
  }
  const desired=preparePatrickPublicationDesired(documents,NOW);
  const assets=collectPatrickPublicationAssetUrls(desired.desired,desired.creatures).map(url=>({url,sha256:'a'.repeat(64)}));
  const options={documents,nameMatches:[],now:NOW,assets,sourceHashes:{fixture:'b'.repeat(64)}};
  return {...options,plan:buildPatrickPublicationPlan(options)};
}
function fakeClient(initial,{beforeCommit}={}) {
  const documents=structuredClone(initial),events=[];
  function field(fields,parts){let target=fields;for(const part of parts.slice(0,-1)){target[part]||={mapValue:{fields:{}}};target=target[part].mapValue.fields;}return[target,parts.at(-1)];}
  return {documents,events,documentName,async request(path,body){
    if(path===':runQuery')return Object.values(documents).filter(d=>d?.name.includes('/creatures/')).map(document=>({document}));
    if(path!==':commit')return structuredClone(documents[path.slice(1)]||null);
    events.push('commit');beforeCommit?.(documents);
    // Check every precondition before changing any document, as one atomic commit.
    for(const write of body.writes){const key=(write.verify||write.update.name).split('/documents/')[1],current=documents[key];
      if(write.currentDocument.exists===false)assert.equal(current,null,'exists:false');
      if(write.currentDocument.updateTime)assert.equal(current?.updateTime,write.currentDocument.updateTime,'updateTime');}
    const next=structuredClone(documents);
    for(const write of body.writes.filter(w=>w.update)){
      const key=write.update.name.split('/documents/')[1];let fields=structuredClone(next[key]?.fields||{});
      if(!write.updateMask)fields=structuredClone(write.update.fields);
      else for(const mask of write.updateMask.fieldPaths){const parts=mask.split('.'),[input,last]=field(write.update.fields,parts),[target,key]=field(fields,parts);target[key]=structuredClone(input[last]);}
      next[key]={name:write.update.name,fields,updateTime:NOW};
    }
    Object.assign(documents,next);return{commitTime:NOW};
  }};
}
function hooks(events) { return {
  checkSources:async()=>events.push('sources'),checkAssets:async()=>events.push('assets'),
  backup:async(label,documents,newIds)=>{events.push('backup');assert.equal(documents.filter(Boolean).length,2);assert.equal(newIds.length,5);
    assert(documents.filter(Boolean).every(doc=>doc.fields.combatProfile&&doc.fields.imageSets&&doc.fields.rawBytes));},
  confirm:async(plan,documents,committedAt)=>{events.push('confirm');assert.equal(committedAt,NOW);return{verified:true,planId:plan.planId};},
}; }

test('the reviewed diff uses exact masks, household permissions, five create preconditions and three lock verifications',()=>{
  const {plan,documents}=fixture();validatePatrickPublicationPlan(plan);
  const writes=buildPatrickPublicationWrites(plan,documents,documentName);
  assert.equal(writes.length,10);assert.equal(writes.filter(w=>w.verify).length,3);
  assert.equal(writes.filter(w=>w.update&&w.currentDocument.exists===false).length,5);
  const old=plan.characters[0];
  assert(old.updateMask.includes('inventory.items'));assert(old.updateMask.includes('inventory.companions'));
  assert(!old.updateMask.some(mask=>/combatProfile|imageSets|ownerUid|createdBy/.test(mask)));
  const gwen=decodeFirestoreFields(plan.characters.find(c=>c.id===GWEN_CHARACTER_ID).fields);
  assert.equal(gwen.ownerUid,'owner-'+CADOGAN_CHARACTER_ID);assert.equal(gwen.createdBy,'creator-'+CADOGAN_CHARACTER_ID);
  assert.equal(gwen.archived,false);assert.equal(gwen.status,'active');assert.equal(gwen.fraktion,gwen.genealogy.houseName);
  assert(Object.hasOwn(gwen,'origin')&&Object.hasOwn(gwen,'role')&&Object.hasOwn(gwen,'bio'));
  assert.equal(gwen.biography.revision,Date.parse(NOW));
  assert(!gwen.combatProfile&&!gwen.imageSets);
  for(const pet of plan.creatures){const data=decodeFirestoreFields(pet.fields);
    assert(PATRICK_PUBLICATION_IDS.includes(data.itemOrigin.ownerCharacterId));
    const owner=data.itemOrigin.ownerCharacterId===GWEN_CHARACTER_ID?CADOGAN_CHARACTER_ID:data.itemOrigin.ownerCharacterId;
    assert.equal(data.ownerUid,'owner-'+owner);}
});

test('semantically identical REST maps with different recursive key order produce identical masks and plan IDs',()=>{
  const {plan,...options}=fixture();
  const reverseMapOrder=value=>Array.isArray(value)?value.map(reverseMapOrder):value&&typeof value==='object'
    ?Object.fromEntries(Object.entries(value).reverse().map(([key,child])=>[key,reverseMapOrder(child)])):value;
  const reordered=buildPatrickPublicationPlan({...options,documents:reverseMapOrder(options.documents)});
  assert.equal(reordered.planId,plan.planId);
  assert.deepEqual(reordered.characters.map(row=>row.updateMask),plan.characters.map(row=>row.updateMask));
  assert(plan.characters.every(row=>JSON.stringify(row.updateMask)===JSON.stringify([...row.updateMask].sort())));
  assert.deepEqual(reordered,plan);
});

test('unchanged nested REST timestamps, references and every unrelated raw value survive inventory additions byte-for-byte',async()=>{
  const {plan,documents}=fixture(),client=fakeClient(documents);
  const original=documents['characters/'+CADOGAN_CHARACTER_ID].fields.inventory.mapValue.fields.items.arrayValue.values[0];
  const encoded=plan.characters[0].fields.inventory.mapValue.fields.items.arrayValue.values[0];
  assert.deepEqual(encoded,original);
  const result=await applyPreparedPatrickPublication({client,plan,hooks:hooks(client.events)});
  assert(result.verified);assert.deepEqual(client.events,['sources','assets','backup','commit','confirm']);
  verifyPatrickPublication(plan,documents,client.documents);
  for(const id of [CADOGAN_CHARACTER_ID,RHIANNON_CHARACTER_ID]){
    const fields=client.documents['characters/'+id].fields;
    for(const key of ['combatProfile','imageSets','emotes','rawBytes','customPrivateField'])assert.deepEqual(fields[key],documents['characters/'+id].fields[key]);
  }
});

test('stale reviewed documents, occupied create IDs and combat locks stop before any backup or commit',async()=>{
  for(const mutate of [
    docs=>docs['characters/'+CADOGAN_CHARACTER_ID].updateTime='2026-11-03T16:01:00Z',
    docs=>docs['creatures/'+PATRICK_PET_IDS[0]]={name:documentName('creatures/'+PATRICK_PET_IDS[0]),fields:encodeFirestoreFields({name:'Existing'}),updateTime:BEFORE},
    docs=>docs['characters/'+GWEN_CHARACTER_ID]={name:documentName('characters/'+GWEN_CHARACTER_ID),fields:encodeFirestoreFields({name:'Existing'}),updateTime:BEFORE},
    docs=>docs['combat_profile_locks/characters/records/'+CADOGAN_CHARACTER_ID]={fields:encodeFirestoreFields({activeEncounterKeys:['active']}),updateTime:BEFORE},
  ]){const {plan,documents}=fixture();mutate(documents);const client=fakeClient(documents);
    await assert.rejects(()=>applyPreparedPatrickPublication({client,plan,hooks:hooks(client.events)}));
    assert(!client.events.includes('commit')&&!client.events.includes('backup'));}
});

test('asset verification fails before the encrypted backup and atomic commit',async()=>{
  const {plan,documents}=fixture(),client=fakeClient(documents),dependency=hooks(client.events);
  dependency.checkAssets=async()=>{throw Error('HTTP/hash mismatch');};
  await assert.rejects(()=>applyPreparedPatrickPublication({client,plan,hooks:dependency}),/HTTP\/hash/);
  assert.deepEqual(client.events,['sources']);
});

test('a concurrent create at commit is rejected atomically without changing either original character',async()=>{
  const {plan,documents}=fixture(),client=fakeClient(documents,{beforeCommit:docs=>{
    docs['creatures/'+PATRICK_PET_IDS[1]]={fields:encodeFirestoreFields({name:'Concurrent'}),updateTime:NOW};
  }});
  await assert.rejects(()=>applyPreparedPatrickPublication({client,plan,hooks:hooks(client.events)}),/exists:false/);
  assert.deepEqual(client.documents['characters/'+CADOGAN_CHARACTER_ID],documents['characters/'+CADOGAN_CHARACTER_ID]);
  assert.deepEqual(client.documents['characters/'+RHIANNON_CHARACTER_ID],documents['characters/'+RHIANNON_CHARACTER_ID]);
  assert(!client.events.includes('confirm'));
});

test('reapplying the stable plan makes no second write and never restores subsequently spent resources',async()=>{
  const {plan,documents}=fixture(),client=fakeClient(documents);
  await applyPreparedPatrickPublication({client,plan,hooks:hooks(client.events)});
  const second=await applyPreparedPatrickPublication({client,plan,hooks:hooks(client.events)});
  assert(second.alreadyApplied);assert.equal(client.events.filter(e=>e==='commit').length,1);
  client.documents['characters/'+CADOGAN_CHARACTER_ID].fields.combatProfile.mapValue.fields.hitPoints.mapValue.fields.current={integerValue:'0'};
  client.documents['characters/'+CADOGAN_CHARACTER_ID].updateTime='2026-11-03T17:01:00Z';
  await assert.rejects(()=>applyPreparedPatrickPublication({client,plan,hooks:hooks(client.events)}));
  assert.equal(client.documents['characters/'+CADOGAN_CHARACTER_ID].fields.combatProfile.mapValue.fields.hitPoints.mapValue.fields.current.integerValue,'0');
  assert.equal(client.events.filter(e=>e==='commit').length,1);
});

test('unrelated verification drift and unapproved fields cannot silently pass a completed plan',()=>{
  const {plan,documents}=fixture();
  const after=structuredClone(documents);
  for(const row of plan.characters)after['characters/'+row.id]={fields:{...(row.create?{}:documents['characters/'+row.id].fields),...row.fields}};
  for(const row of plan.creatures)after['creatures/'+row.id]={fields:row.fields};
  after['characters/'+CADOGAN_CHARACTER_ID].fields.customPrivateField={stringValue:'changed'};
  assert.throws(()=>verifyPatrickPublication(plan,documents,after),/unbeteiligte/i);
  plan.characters[0].fields.combatProfile={mapValue:{fields:{}}};delete plan.planId;plan.planId=publicationHash(plan);
  assert.throws(()=>validatePatrickPublicationPlan(plan),/Unerlaubtes/);
  assert.throws(()=>patrickPrivatePlanPath('diagnostics/not-private.json'),/privaten/);
  if(process.platform==='win32')assert.throws(()=>patrickPrivatePlanPath('C:/outside-private-plan.json'),/privaten/);
});

test('only Firestore empty REST array/map containers compare equivalently without erasing Value types',()=>{
  assert(patrickRestWrittenValuesEqual({arrayValue:{}},{arrayValue:{values:[]}}));
  assert(patrickRestWrittenValuesEqual({mapValue:{}},{mapValue:{fields:{}}}));
  const nested={mapValue:{fields:{list:{arrayValue:{}},record:{mapValue:{}}}}};
  assert.deepEqual(canonicalizePatrickRestEmptyContainers(nested),{
    mapValue:{fields:{list:{arrayValue:{values:[]}},record:{mapValue:{fields:{}}}}}
  });
  for(const [actual,expected] of [
    [{arrayValue:{}},{mapValue:{}}],
    [{stringValue:'0'},{integerValue:'0'}],
    [{stringValue:'2026-11-03T17:00:00Z'},{timestampValue:'2026-11-03T17:00:00Z'}],
    [{stringValue:'reference'},{referenceValue:'reference'}],
    [{stringValue:'AAECAw=='},{bytesValue:'AAECAw=='}],
    [{arrayValue:{values:[{nullValue:null}]}},{arrayValue:{}}],
    [{arrayValue:{values:null}},{arrayValue:{}}],
  ])assert.equal(patrickRestWrittenValuesEqual(actual,expected),false);
});

test('post-commit recovery performs only ten reads, checks the atomic time and writes no external data',async()=>{
  const {plan,documents}=fixture(),applied=fakeClient(documents);
  await applyPreparedPatrickPublication({client:applied,plan,hooks:hooks(applied.events)});
  const shortenEmpty=value=>Array.isArray(value)?value.map(shortenEmpty):value&&typeof value==='object'
    ? Object.fromEntries(Object.entries(value).filter(([key,child])=>!(key==='values'&&Array.isArray(child)&&child.length===0)
      &&!(key==='fields'&&child&&typeof child==='object'&&Object.keys(child).length===0)).map(([key,child])=>[key,shortenEmpty(child)])):value;
  const after=shortenEmpty(applied.documents),reads=[],events=[];
  // Untouched REST fields are deliberately exact, rather than normalized.
  for(const row of plan.characters.filter(row=>!row.create))for(const [key,value] of Object.entries(documents['characters/'+row.id].fields)) {
    if(!Object.hasOwn(row.fields,key))after['characters/'+row.id].fields[key]=structuredClone(value);
  }
  const client={async request(path,body){assert.equal(body,undefined);assert(path.startsWith('/'));reads.push(path);return structuredClone(after[path.slice(1)]);}};
  const result=await verifyPreparedPatrickPublication({client,plan,hooks:{
    checkSources:async()=>events.push('sources'),confirm:async(p,docs,time,proof)=>{
      events.push('local-confirm');assert.equal(p.planId,plan.planId);assert.equal(time,NOW);assert.equal(proof.externalWrites,0);return {verified:true};
    }
  }});
  assert(result.verified&&result.readOnlyRecovery);assert.equal(result.externalWrites,0);
  assert.equal(reads.length,10);assert.deepEqual(reads.map(path=>path.slice(1)).sort(),[...PATRICK_READ_PATHS].sort());
  assert.deepEqual(events,['sources','local-confirm']);
  const drift=structuredClone(after);drift['creatures/'+PATRICK_PET_IDS[0]].updateTime='2026-11-03T17:01:00Z';
  assert.throws(()=>verifyPatrickPublishedRecovery(plan,drift),/gemeinsamen Commitzeitpunkt/);
  drift['creatures/'+PATRICK_PET_IDS[0]].updateTime=NOW;
  drift['characters/'+CADOGAN_CHARACTER_ID].fields.rawBytes={stringValue:'AAECAw=='};
  assert.throws(()=>verifyPatrickPublishedRecovery(plan,drift),/Unbeteiligte REST/);
});
