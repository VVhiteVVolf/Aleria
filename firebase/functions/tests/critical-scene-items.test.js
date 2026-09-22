import test from 'node:test';
import assert from 'node:assert/strict';
import { commitCombatCommentOperation } from '../src/mechanics/commit-combat-comment.js';
import { placeSceneItem } from '../src/mechanics/commit-scene-item.js';
import { undoMechanicalCommentOperation } from '../src/mechanics/commit-undo-mechanical-comment.js';
import { deriveSceneItems } from '../src/generated/scene-items/scene-items-model.js';
import { findLaterMechanicalDependency } from '../src/mechanics/mechanical-comment-dependencies.js';

const copy = value => value == null ? value : JSON.parse(JSON.stringify(value));
function database(initial) {
  const data=new Map(Object.entries(copy(initial)));let id=0,queue=Promise.resolve();
  const doc=path=>({path,id:path.split('/').at(-1)});
  return {data,collection:path=>({doc:key=>doc(`${path}/${key || `comment-${++id}`}`),where:(field,operator,value)=>({collection:path,field,value})}),
    runTransaction(work){const task=queue.catch(()=>{}).then(async()=>{const writes=[];
      const result=await work({async get(ref){assert.equal(writes.length,0,'reads precede writes');
        const snapshot=(path,value)=>({id:path.split('/').at(-1),exists:value!=null,data:()=>copy(value)});
        if(ref.collection)return {docs:[...data].filter(([key,value])=>key.startsWith(ref.collection+'/') && value[ref.field]===ref.value).map(([key,value])=>snapshot(key,value))};
        return snapshot(ref.path,data.get(ref.path));},
        create(ref,value){writes.push(()=>{assert.equal(data.has(ref.path),false);data.set(ref.path,copy(value));});},
        delete(ref){writes.push(()=>data.delete(ref.path));},
        update(ref,value){writes.push(()=>{const current=copy(data.get(ref.path));assert.ok(current);for(const [path,entry]of Object.entries(copy(value))){const parts=path.split('.');let node=current;for(const key of parts.slice(0,-1))node=node[key] ||= {};node[parts.at(-1)]=entry;}data.set(ref.path,current);});}
      });writes.forEach(write=>write());return result;});queue=task;return task;}};
}
const person=id=>({id,name:id,inventory:{items:[{id:'blade',name:'Schwert',quantity:'1',category:'weapon',equipmentLink:{kind:'weapon',combatEntryId:'sword'},combatDefinition:{kind:'weapon',damageFormula:'1d8'}}]},combatProfile:{progression:{level:3},hitPoints:{current:40,maximumOverride:40},armorClass:{override:12},weapons:[{id:'sword',inventoryItemId:'blade',name:'Schwert',weaponType:'sword',damageFormula:'1d8',equipped:true}]}});
const history=version=>({entryId:'scene',serverValidatedMechanics:true,orderKey:1,combatEncounter:{operation:'start',encounterId:'battle',criticalEffectsVersion:version,participants:[{actorId:'actor',partyId:'a'},{actorId:'target',partyId:'b'}]}});
const auth={uid:'editor',token:{aleriaRole:'admin'}};
const attack=(natural=1)=>({commentKind:'combataction',actorId:'actor',text:'Angriff',combatAction:{encounterId:'battle',profileActionId:'weapon:sword'},combatResolution:{resolutionId:'untrusted',actorId:'actor',targetId:'target',actorPersistence:{kind:'character',recordId:'actor'},targetPersistence:{kind:'character',recordId:'target'},profileActionId:'weapon:sword',attack:{naturalRoll:natural,diceResults:[natural]},damage:{diceResults:natural===20?[4,4]:[4],total:999}}});
const request=segments=>({auth,data:{entryId:'scene',text:'Handlung',charName:'actor',metadata:{characterId:'actor',commentSegments:segments}}});
const fixture=version=>database({'comments/start':history(version),'characters/actor':person('actor'),'characters/target':person('target')});
const commit=(db,segments)=>commitCombatCommentOperation(request(segments),{database:db,rollCritical:()=>10,nowClient:100});
const records=db=>[...db.data].filter(([key])=>key.startsWith('comments/')).map(([key,value])=>({id:key.split('/').at(-1),...value})).sort((a,b)=>a.orderKey-b.orderKey);

test('published rules activate only future attacks in a legacy duel and protect earlier undo snapshots',async()=>{
  const db=fixture(0);
  const old=await commit(db,[attack()]);
  const previous=copy(db.data.get(`comments/${old.id}`));
  db.data.set('comments/release',{entryId:'scene',orderKey:101,commentKind:'combat-rules-release',
    serverValidatedMechanics:true,combatRulesRelease:{version:1,encounterId:'battle',equipmentSnapshots:[]}});
  for(const force of [false,true])await assert.rejects(undoMechanicalCommentOperation({auth,data:{entryId:'scene',commentId:old.id,force}},{database:db}),/Regelumstellung/);
  await assert.rejects(undoMechanicalCommentOperation({auth,data:{entryId:'scene',commentId:'release',force:true}},{database:db}),/Regelumstellung/);
  const next=await commit(db,[attack()]);
  assert.equal(next.mechanics.commentSegments[0].combatResolution.criticalConsequence.roll,10);
  assert.deepEqual(db.data.get(`comments/${old.id}`),previous);
  await undoMechanicalCommentOperation({auth,data:{entryId:'scene',commentId:next.id}},{database:db});
  assert.ok(!db.data.has(`comments/${next.id}`),'new contributions remain reversible');
  assert.deepEqual(db.data.get(`comments/${old.id}`),previous);
});

test('active legacy combat gets no new effects; a new combat stores a server-selected disarm and rejects a later attack',async()=>{
  const old=fixture(0);const before=await commit(old,[attack()]);
  assert.equal(before.mechanics.commentSegments[0].combatResolution.criticalConsequence,undefined);
  const db=fixture(1);const result=await commit(db,[attack()]);
  const effect=result.mechanics.commentSegments[0].combatResolution.criticalConsequence;
  assert.equal(effect.roll,10);assert.equal(effect.sceneItemEvent.item.id,'blade');
  assert.equal(deriveSceneItems(records(db)).size,1);
  const snapshot=copy([...db.data]);
  await assert.rejects(commit(db,[attack(15)]),/Entwaffnet/);
  assert.deepEqual(copy([...db.data]),snapshot);
});

test('pickup followed by attack in one contribution is atomic, spends one bonus action and prevents double pickup',async()=>{
  const db=fixture(1);await commit(db,[attack()]);
  const entry=[...deriveSceneItems(records(db)).values()][0];
  const pickup={commentKind:'interact',actorId:'actor',text:'Hebt das Schwert auf.',inventoryUse:{item:entry.item,source:'scene',sceneItemId:entry.sceneItemId,operation:'pickup',actorId:'actor',actorPersistence:{kind:'character',recordId:'actor'},paymentResource:'bonus-action'}};
  const saved=await commit(db,[pickup,attack(15)]);
  assert.equal(saved.mechanics.commentSegments[0].inventoryUse.resourceSnapshot.after.find(resource=>resource.id==='bonus-action').current,0);
  assert.equal(saved.mechanics.commentSegments[1].combatResolution.actorResourceSnapshot.after.find(resource=>resource.id==='bonus-action').current,0);
  assert.equal([...deriveSceneItems(records(db)).values()][0].available,false);
  const snapshot=copy([...db.data]);await assert.rejects(commit(db,[pickup]),/nicht mehr verfügbar/);assert.deepEqual(copy([...db.data]),snapshot);
  const comments=records(db);assert.ok(findLaterMechanicalDependency(comments,comments[1].id));
});

test('narrator placement is authorized, idempotent, and concurrent claims cannot duplicate one item',async()=>{
  const db=fixture(0);
  const input={entryId:'scene',operationId:'neutral-potion-1',name:'Heiltrank',description:'Eine kleine Flasche liegt im Gras.',category:'potions'};
  await assert.rejects(placeSceneItem({database:db,auth:{uid:'guest',token:{aleriaRole:'player'}},input}),/Spielleitung/);
  const placed=await placeSceneItem({database:db,auth,input,now:2});await placeSceneItem({database:db,auth,input,now:3});
  assert.equal(deriveSceneItems(records(db)).size,1);
  const use=actorId=>({commentKind:'consume',actorId,inventoryUse:{item:{id:placed.sceneItemEvent.item.id},source:'scene',sceneItemId:placed.sceneItemEvent.sceneItemId,operation:'consume',actorId,actorPersistence:{kind:'character',recordId:actorId}}});
  const results=await Promise.allSettled([commit(db,[use('actor')]),commit(db,[use('target')])]);
  assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
  assert.equal([...deriveSceneItems(records(db)).values()][0].available,false);
});

test('client supplied consequences and resource snapshots are not accepted as authoritative scene state',async()=>{
  const db=fixture(0);const segment=attack(15);
  segment.combatResolution.criticalConsequence={sceneItemEvent:{operation:'place',sceneItemId:'forged',item:{id:'gold',name:'Gold'}}};
  const result=await commit(db,[segment,{commentKind:'speech',inventoryUse:{sceneItemEvent:{operation:'place',sceneItemId:'forged2'}}}]);
  assert.equal(deriveSceneItems(records(db)).size,0);
  assert.equal(result.mechanics.commentSegments[1].inventoryUse,undefined);
});

test('foreign pickup transfers equipment and undo restores both inventories and the scene item',async()=>{
  const db=fixture(1);await commit(db,[attack()]);
  const beforeActor=copy(db.data.get('characters/actor')),beforeTarget=copy(db.data.get('characters/target'));
  const entry=[...deriveSceneItems(records(db)).values()][0];
  const pickup={commentKind:'interact',actorId:'target',text:'Hebt das gegnerische Schwert auf.',inventoryUse:{item:entry.item,source:'scene',sceneItemId:entry.sceneItemId,operation:'pickup',actorId:'target',actorPersistence:{kind:'character',recordId:'target'}}};
  const result=await commit(db,[pickup]);
  assert.equal(db.data.get('characters/actor').inventory.items.length,0);
  assert.equal(db.data.get('characters/actor').combatProfile.weapons.length,0);
  assert.equal(db.data.get('characters/target').inventory.items.length,2);
  const transferredWeapons=result.profileUpdates.find(update=>update.recordId==='target').equipment.weapons;
  assert.equal(transferredWeapons.filter(weapon=>weapon.inventoryItemId===`scene:${entry.sceneItemId}`).length,1);
  assert.equal(transferredWeapons.find(weapon=>weapon.inventoryItemId===`scene:${entry.sceneItemId}`).equipped,false);
  const comments=records(db),originalDrop=comments[1],claim=comments.at(-1);
  await assert.rejects(undoMechanicalCommentOperation({auth,data:{entryId:'scene',commentId:originalDrop.id}},{database:db}),/neuere Handlung/);
  await undoMechanicalCommentOperation({auth,data:{entryId:'scene',commentId:claim.id}},{database:db});
  for(const [id,before]of [['actor',beforeActor],['target',beforeTarget]]){
    const { revision, ...restoredInventory }=db.data.get('characters/'+id).inventory;
    const { revision: previousRevision, ...previousInventory }=before.inventory;
    assert.deepEqual(restoredInventory,previousInventory);
    assert.ok(revision > (previousRevision || 0));
    assert.deepEqual(db.data.get('characters/'+id).combatProfile.weapons,before.combatProfile.weapons);
  }
  assert.equal([...deriveSceneItems(records(db)).values()][0].available,true);
});

test('own weapons cannot be consumed through a forged consumable selection',async()=>{
  const db=fixture(0);
  const use={commentKind:'consume',actorId:'actor',inventoryUse:{item:{id:'blade'},actorId:'actor',actorPersistence:{kind:'character',recordId:'actor'},mode:'consume'}};
  await assert.rejects(commit(db,[use]),/Verbrauchsgüter/);
  assert.equal(db.data.get('characters/actor').inventory.items.length,1);
});
