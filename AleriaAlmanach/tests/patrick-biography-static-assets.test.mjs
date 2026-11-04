import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {encodeFirestoreFields} from '../../firebase/scripts/backup/firestore-value-codec.mjs';
import {PATRICK_STATIC_DOCUMENT_PATHS,PATRICK_STATIC_LOCK_PATHS,PATRICK_STATIC_READ_PATHS,
  validatePatrickStaticAssets,migratePatrickStaticImageFields,buildPatrickStaticAssetPlan,
  buildPatrickStaticAssetWrites,validatePatrickStaticAssetPlan,verifyPatrickStaticAssetPublication} from '../../firebase/scripts/content/patrick-biography-static-assets-plan.mjs';
import {applyPreparedPatrickStaticAssets,verifyPreparedPatrickStaticAssets,assertPatrickStaticAssetsPublished,
  patrickStaticPrivatePath} from '../../firebase/scripts/content/patrick-biography-static-assets.mjs';

const NOW='2026-11-03T19:00:00.000Z',BEFORE='2026-11-03T18:00:00.000Z',COMMIT='2026-11-03T19:01:00.123456Z';
const bytes=Buffer.from('approved-image-original'),sha=createHash('sha256').update(bytes).digest('hex');
const oldIcon='https://firebasestorage.googleapis.com/v0/b/aleriaprojekt.firebasestorage.app/o/family-assets%2Fhaus-sgrechiwr%2Fapproved-trait%2Foriginal.png?alt=media';
const oldPortrait='https://i.imgur.com/Approved.png';
const localIcon='AleriaAlmanach/public/assets/biography-trait-icons/approved-20261103.png';
const localPortrait='AleriaAlmanach/assets/biographies/patrick-20261103/originals/approved.png';
const target=path=>'https://dieweltvonaleria.netlify.app/'+path;
const manifest={schema:'aleria.biography-static-assets',schemaVersion:1,entries:[
  {key:'trait:test',url:target(localIcon),localPath:localIcon,sha256:sha,aliases:[oldIcon]},
  {key:'portrait:test',url:target(localPortrait),localPath:localPortrait,sha256:sha,aliases:[oldPortrait]},
]};
const documentName=path=>'projects/test/databases/(default)/documents/'+path;

function fixture(){
  const documents=Object.fromEntries(PATRICK_STATIC_READ_PATHS.map(path=>[path,null]));
  for(const path of PATRICK_STATIC_DOCUMENT_PATHS){
    const character=path.startsWith('characters/');
    const fields=encodeFirestoreFields({name:'Original',title:'Retain title',portrait:oldPortrait,updatedAt:BEFORE,ownerUid:'owner-retain',
      biography:{biography:{abilities:[{title:'Original card',icon:oldIcon,description:oldIcon}],biographyText:oldPortrait}},
      ...(character?{inventory:{items:[{id:'retain-id',quantity:7,image:oldPortrait}],coins:{copper:19},revision:12},
        combatProfile:{hitPoints:{current:0,maximum:30},resources:[{current:0,maximum:2}]}}:{}),
      imageSets:[{id:oldPortrait,images:[{image:oldPortrait,description:'Keep custom description'}]}],
      unrelated:{imageId:oldIcon,id:oldPortrait,notes:oldIcon}});
    fields.rawTimestamp={timestampValue:'2026-10-31T10:12:13.123456789Z'};
    fields.rawReference={referenceValue:oldPortrait};fields.rawBytes={bytesValue:'AAECAw=='};
    if(character){
      const item=fields.inventory.mapValue.fields.items.arrayValue.values[0].mapValue.fields;
      item.capturedAt={timestampValue:'2026-10-31T10:12:13.123456789Z'};item.reference={referenceValue:oldPortrait};item.bytes={bytesValue:'AAECAw=='};
    }
    documents[path]={name:documentName(path),fields,updateTime:BEFORE};
  }
  const options={documents,manifest,now:NOW,sourceHashes:{fixture:'a'.repeat(64)}};
  return {...options,plan:buildPatrickStaticAssetPlan(options)};
}

function fakeClient(initial,{beforeCommit}={}){
  const documents=structuredClone(initial),events=[],requests=[];
  const getParent=(fields,parts)=>{let current=fields;for(const key of parts.slice(0,-1))current=current[key].mapValue.fields;return[current,parts.at(-1)];};
  return {documents,events,requests,documentName,async request(path,body){
    requests.push({path,hasBody:body!==undefined});
    if(path!==':commit'){assert.equal(body,undefined);return structuredClone(documents[path.slice(1)]||null);}
    events.push('commit');beforeCommit?.(documents);
    for(const write of body.writes){
      const key=(write.verify||write.update.name).split('/documents/')[1],document=documents[key];
      if(write.currentDocument.exists===false)assert.equal(document,null,'exists:false');
      if(write.currentDocument.updateTime)assert.equal(document?.updateTime,write.currentDocument.updateTime,'updateTime');
    }
    const next=structuredClone(documents);
    for(const write of body.writes.filter(write=>write.update)){
      const key=write.update.name.split('/documents/')[1],fields=next[key].fields;
      for(const mask of write.updateMask.fieldPaths){
        const parts=mask.split('.'),[input,last]=getParent(write.update.fields,parts),[output,outKey]=getParent(fields,parts);
        output[outKey]=structuredClone(input[last]);
      }
      next[key].updateTime=COMMIT;
    }
    Object.assign(documents,next);return{commitTime:COMMIT};
  }};
}
function hooks(events){return{
  checkSources:async()=>events.push('sources'),checkAssets:async()=>events.push('assets'),
  backup:async(label,documents,newIds)=>{events.push('backup');assert.equal(documents.filter(Boolean).length,7);assert.deepEqual(newIds,[]);},
  confirm:async(plan,documents,verification)=>{events.push('confirm');assert(verification.verified);assert.equal(verification.verifiedDocuments,7);return verification;},
};}

test('only exact approved image-string leaves migrate; IDs, prose and typed raw URL values remain unchanged',()=>{
  const {documents,plan}=fixture();validatePatrickStaticAssetPlan(plan);
  const before=documents[PATRICK_STATIC_DOCUMENT_PATHS[0]].fields;
  const result=migratePatrickStaticImageFields(before,manifest),after=result.fields;
  assert.equal(after.portrait.stringValue,target(localPortrait));
  assert.equal(after.biography.mapValue.fields.biography.mapValue.fields.biographyText.stringValue,oldPortrait);
  const card=after.biography.mapValue.fields.biography.mapValue.fields.abilities.arrayValue.values[0].mapValue.fields;
  assert.equal(card.icon.stringValue,target(localIcon));assert.equal(card.description.stringValue,oldIcon);
  assert.deepEqual(after.unrelated,before.unrelated);assert.deepEqual(after.rawReference,before.rawReference);
  const imageSet=after.imageSets.arrayValue.values[0].mapValue.fields;
  assert.equal(imageSet.id.stringValue,oldPortrait);
  assert.equal(imageSet.images.arrayValue.values[0].mapValue.fields.image.stringValue,target(localPortrait));
  const item=after.inventory.mapValue.fields.items.arrayValue.values[0].mapValue.fields;
  for(const field of ['id','quantity','capturedAt','reference','bytes'])assert.deepEqual(item[field],before.inventory.mapValue.fields.items.arrayValue.values[0].mapValue.fields[field]);
  assert.deepEqual(result.updateMask,['biography.biography.abilities','imageSets','inventory.items','portrait']);
  assert(!result.updateMask.some(mask=>/\.\d+\./.test(mask)));
  const changed=structuredClone(before);changed.portrait.stringValue=oldPortrait+'?unreviewed=1';
  assert.equal(migratePatrickStaticImageFields(changed,manifest).fields.portrait.stringValue,oldPortrait+'?unreviewed=1');
  assert.deepEqual(before,documents[PATRICK_STATIC_DOCUMENT_PATHS[0]].fields);
});

test('unapproved alias hosts, ambiguous aliases, incorrect target paths and plan tampering fail closed',()=>{
  for(const mutate of [
    m=>m.entries[0].aliases.push('https://unreviewed.example/icon.png'),
    m=>m.entries[1].aliases.push(oldIcon),
    m=>m.entries[0].url='https://dieweltvonaleria.netlify.app/private/icon.png',
    m=>m.entries[0].localPath='../outside.png',
  ]){const value=structuredClone(manifest);mutate(value);assert.throws(()=>validatePatrickStaticAssets(value));}
  const {plan}=fixture();plan.records[0].fields.portrait.stringValue='https://unreviewed.example/image.png';
  assert.throws(()=>validatePatrickStaticAssetPlan(plan),/immutable/);
  assert.throws(()=>patrickStaticPrivatePath('diagnostics/public-plan.json'),/privaten/);
});

test('two REST reads with recursively reversed map-entry order produce the same complete plan and ordered change lists',()=>{
  const {plan,...options}=fixture();
  const reverseMaps=value=>Array.isArray(value)?value.map(reverseMaps):value&&typeof value==='object'
    ?Object.fromEntries(Object.entries(value).reverse().map(([key,child])=>[key,reverseMaps(child)])):value;
  const second=buildPatrickStaticAssetPlan({...options,documents:reverseMaps(options.documents)});
  assert.equal(second.planId,plan.planId);
  assert.deepEqual(second,plan);
  assert.deepEqual(second.records.map(row=>row.changes),plan.records.map(row=>row.changes));
  for(const row of plan.records){
    const paths=row.changes.map(change=>JSON.stringify(change.rawPath));
    assert.deepEqual(paths,[...paths].sort());
  }
});

test('all seven updates use version guards, exact masks and existing IDs; three inventory lock verifications precede them',()=>{
  const {plan,documents}=fixture(),writes=buildPatrickStaticAssetWrites(plan,documents,documentName);
  assert.equal(writes.length,10);assert.equal(writes.filter(write=>write.verify).length,3);
  assert.equal(writes.filter(write=>write.update).length,7);
  assert(writes.filter(write=>write.update).every(write=>write.currentDocument.updateTime===BEFORE&&!Object.hasOwn(write.currentDocument,'exists')));
  assert.deepEqual(writes.filter(write=>write.update).map(write=>write.update.name),PATRICK_STATIC_DOCUMENT_PATHS.map(documentName));
  assert(writes.filter(write=>write.update).every(write=>!JSON.stringify(write.updateMask).includes('combatProfile')));
});

test('a successful atomic string migration retains every other raw value and repeats without another commit',async()=>{
  const {plan,documents}=fixture(),client=fakeClient(documents);
  const result=await applyPreparedPatrickStaticAssets({client,plan,hooks:hooks(client.events)});
  assert(result.verified&&result.unrelatedRawFieldsUnchanged);assert.equal(result.changedDocuments,7);
  assert.deepEqual(client.events,['sources','assets','backup','commit','confirm']);
  verifyPatrickStaticAssetPublication(plan,client.documents);
  for(const path of PATRICK_STATIC_DOCUMENT_PATHS){
    const fields=client.documents[path].fields,before=documents[path].fields;
    for(const field of ['name','title','ownerUid','rawBytes','rawTimestamp','rawReference','combatProfile','updatedAt','unrelated'])assert.deepEqual(fields[field],before[field]);
    if(path.startsWith('characters/'))assert.deepEqual(fields.inventory.mapValue.fields.coins,before.inventory.mapValue.fields.coins);
  }
  const repeated=await applyPreparedPatrickStaticAssets({client,plan,hooks:hooks(client.events)});
  assert(repeated.alreadyApplied);assert.equal(client.events.filter(event=>event==='commit').length,1);
});

test('stale live versions, resource drift, missing records and active combat locks fail before backup or commit',async()=>{
  for(const mutate of [
    docs=>docs[PATRICK_STATIC_DOCUMENT_PATHS[0]].updateTime='2026-11-03T18:01:00Z',
    docs=>docs[PATRICK_STATIC_DOCUMENT_PATHS[0]].fields.combatProfile.mapValue.fields.hitPoints.mapValue.fields.current={integerValue:'1'},
    docs=>docs[PATRICK_STATIC_DOCUMENT_PATHS[6]]=null,
    docs=>docs[PATRICK_STATIC_LOCK_PATHS[0]]={fields:encodeFirestoreFields({activeEncounterKeys:['active']}),updateTime:BEFORE},
  ]){
    const {plan,documents}=fixture();mutate(documents);const client=fakeClient(documents);
    await assert.rejects(()=>applyPreparedPatrickStaticAssets({client,plan,hooks:hooks(client.events)}));
    assert(!client.events.includes('commit')&&!client.events.includes('backup'));
  }
});

test('every target must serve HTTP200 image bytes with the frozen SHA before backup and commit',async()=>{
  const {plan,documents}=fixture();
  for(const [status,content]of [[403,bytes],[200,Buffer.from('wrong image')]]){
    const client=fakeClient(documents),dependency=hooks(client.events);
    dependency.checkAssets=p=>assertPatrickStaticAssetsPublished(p,{request:async()=>new Response(content,{status,headers:{'Content-Type':'image/png'}})});
    await assert.rejects(()=>applyPreparedPatrickStaticAssets({client,plan,hooks:dependency}));
    assert(!client.events.includes('commit')&&!client.events.includes('backup'));
  }
  const checked=[];await assertPatrickStaticAssetsPublished(plan,{request:async url=>{checked.push(url);return new Response(bytes,{status:200,headers:{'Content-Type':'image/png'}});}});
  assert.deepEqual(checked.sort(),manifest.entries.map(entry=>entry.url).sort());
});

test('a concurrent edit is rejected atomically by commit preconditions without overwriting another profile',async()=>{
  const {plan,documents}=fixture(),client=fakeClient(documents,{beforeCommit:docs=>{
    docs[PATRICK_STATIC_DOCUMENT_PATHS[1]].updateTime='2026-11-03T19:00:30Z';
  }});
  await assert.rejects(()=>applyPreparedPatrickStaticAssets({client,plan,hooks:hooks(client.events)}),/updateTime/);
  for(const path of PATRICK_STATIC_DOCUMENT_PATHS)assert.deepEqual(client.documents[path].fields,documents[path].fields);
  assert(!client.events.includes('confirm'));
});

test('post-commit verification performs ten GETs and no external writes; later unrelated drift is never restored',async()=>{
  const {plan,documents}=fixture(),applied=fakeClient(documents);
  await applyPreparedPatrickStaticAssets({client:applied,plan,hooks:hooks(applied.events)});
  const client=fakeClient(applied.documents),result=await verifyPreparedPatrickStaticAssets({client,plan,hooks:hooks(client.events)});
  assert(result.readOnlyRecovery);assert.equal(result.externalWrites,0);assert.equal(client.requests.length,10);
  assert(client.requests.every(request=>request.path.startsWith('/')&&!request.hasBody));
  client.documents[PATRICK_STATIC_DOCUMENT_PATHS[0]].fields.rawBytes={stringValue:'AAECAw=='};
  await assert.rejects(()=>verifyPreparedPatrickStaticAssets({client,plan,hooks:hooks(client.events)}),/exakten Bildplan/);
  assert(!client.events.includes('commit'));
});
