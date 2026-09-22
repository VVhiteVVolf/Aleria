import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { database, reset, strike, record, history, commit, undo, threadId, prepareTestAction } from './item-duel-context.mjs';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { withEquippedCombatWeapon } from '../../../../AleriaAlmanach/modules/combat/combat-equipment-state.js';
import { getClassSpecialCurriculum } from '../../../../AleriaAlmanach/modules/classes/class-special-maneuvers.js';
// Read-only production export supplied by the release check. All writes go to
// the strict demo-project emulator guard in item-duel-context.
if (!process.env.COMBAT_TEST_CHARACTER_SNAPSHOT) throw Error('COMBAT_TEST_CHARACTER_SNAPSHOT must point to the read-only character export.');
function decode(value) {
  if (value.mapValue) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k,v])=>[k,decode(v)]));
  if (value.arrayValue) return (value.arrayValue.values || []).map(decode);
  return value.stringValue ?? (value.integerValue != null ? Number(value.integerValue) : undefined) ?? value.doubleValue ?? value.booleanValue ?? null;
}
const actors=JSON.parse(await readFile(process.env.COMBAT_TEST_CHARACTER_SNAPSHOT,'utf8')).map(doc=>({...decode({mapValue:{fields:doc.fields}}),id:doc.name.split('/').at(-1)})).filter(c=>c.combatProfile);
for (const actor of actors) {
  const profile=resolveCombatProfile(actor);
  actor.combatProfile.hitPoints={...actor.combatProfile.hitPoints,current:profile.maximumHitPoints,temporary:0};
  actor.combatProfile.resources=profile.resources.map(resource=>({...resource,current:resource.maximum}));
}
const named=prefix=>{const actor=actors.find(c=>c.name.startsWith(prefix));assert.ok(actor?.combatProfile,`${prefix}: real online combat profile required`);return actor;};
const names=['Asgeir','Ylva','Gais','Nudd','Gawain','Gildas'];
const regularCounts={Asgeir:21,Ylva:21,Gais:14,Nudd:10,Gawain:8,Gildas:10};
after(()=>database.terminate());

for(const name of names) test(`${name}: real sheet, small self preparation and strong special attack use canonical costs online`,async()=>{
  const actor=named(name),other=named(name==='Gawain'?'Gildas':'Gawain');await reset({actors:[actor,other]});
  assert.equal(resolveCombatProfile(actor).techniques.filter(t=>!t.id.startsWith('class-special-')).length,regularCounts[name]);
  const classId=getClassSpecialCurriculum(actor.combatProfile.templateSelections.classId).id;
  const small=await strike({attacker:actor.id,target:actor.id,actionId:`ability:class-special-${classId}-reserve`});
  assert.equal(small.actual.targetId,actor.id);assert.ok(small.actual.targetSnapshot.temporaryHitPointsAfter>0);
  assert.equal(small.actual.actorInventorySnapshot,null);
  assert.equal(small.actual.actorResourceSnapshot.after.find(r=>r.id==='special-action').current,1);
  const strong=await strike({attacker:actor.id,target:other.id,actionId:`technique:class-special-${classId}-strike`});
  assert.ok(strong.actual.damage.total>0);assert.equal(strong.actual.actorResourceSnapshot.after.find(r=>r.id==='special-action').current,0);
  assert.equal((await record(actor.id)).combatProfile.resources.find(r=>r.id==='special-action').current,0);
  const before=await history();
  await assert.rejects(strike({attacker:actor.id,target:other.id,actionId:`technique:class-special-${classId}-strike`}),/nicht genug|Ressourcen/);
  assert.deepEqual(await history(),before);
});

for (const pair of [['Ylva','Asgeir'],['Gais','Nudd'],['Gawain','Gildas']]) test(`${pair.join(' gegen ')}: gegenseitige Angriffe und kritische Würfe bleiben nachvollziehbar`,async()=>{
  const duel=pair.map(named);await reset({actors:duel});
  for (const [index,natural] of [15,1,20,14].entries()) {
    const actor=duel[index%2],target=duel[(index+1)%2];
    const weapon=resolveCombatProfile(actor).weapons.find(w=>w.equipped);
    const before=await history();
    const result=await strike({attacker:actor.id,target:target.id,actionId:`weapon:${weapon.id}`,natural,roll:1});
    assert.equal(result.actual.actorId,actor.id);
    assert.equal(result.actual.targetId,target.id);
    const after=await history();
    for(const comment of before) assert.deepEqual(after.find(entry=>entry.id===comment.id),comment);
  }
});

test('Shield switch, repeated attacks and undo restore the actual hand configuration',async()=>{
 const actor=named('Asgeir'),enemy=named('Gawain');await reset({actors:[actor,enemy]});
 const selection={rightWeaponId:'asgeir-axt-rechts',leftWeaponId:'',shieldId:'asgeir-rundschild'};
 const first=await strike({attacker:actor.id,target:enemy.id,actionId:'technique:combat-style-huskarl-skjaldr-grund-5',loadout:selection});
 assert.equal(first.actual.actorEquippedWeaponSnapshot.supportAfter.shieldId,'asgeir-rundschild');
 const second=await strike({attacker:actor.id,target:enemy.id,actionId:'weapon:asgeir-axt-rechts'});
 const state=deriveCombatStateFromComments(await history()).get(actor.id);
 const current=resolveCombatProfile(withEquippedCombatWeapon(await record(actor.id),state.equippedWeaponId,state.offHandWeaponId,state.supportEquipment));
 assert.equal(current.totalDefense,16);
 assert.equal(second.actual.equipmentPreparation,undefined);
 await undo(second.saved.id);await undo(first.saved.id);
 assert.equal(deriveCombatStateFromComments(await history()).get(actor.id)?.supportEquipment,undefined);
});

test('Mounted attacks reject unmounted and foreign mounts, accept owned mount, persist and charge dismount',async()=>{
 const actor=structuredClone(named('Gais')),enemy=named('Gawain');
 actor.inventory.companions=[{id:'test-warhorse',name:'Isoliertes Prüfross',role:'Reittier'}];
 // An existing canonical mounted technique at level 5 is exercised without
 // changing the production character or inventing a mounted attack payload.
 const { getCenyrClassProgression }=await import('../../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-progression.js');
 const mounted=getCenyrClassProgression('uchelwyr',actor.combatProfile.progression.level).attackCatalog.find(t=>t.minimumLevel<=actor.combatProfile.progression.level&&t.cenyrTraining?.requiresMounted);
 assert.ok(mounted,'Uchelwyr has an authored mounted technique at this level');
 actor.combatProfile.techniques.push({...mounted,active:true});
 await reset({actors:[actor,enemy]});
 const actionId=`technique:${mounted.id}`;
 await assert.rejects(strike({attacker:actor.id,target:enemy.id,actionId}),/beritten|Reittier/);
 const selection={rightWeaponId:actor.combatProfile.weapons.find(w=>w.equipped).id,leftWeaponId:'',mountId:'test-warhorse'};
 const first=await strike({attacker:actor.id,target:enemy.id,actionId,loadout:selection});
 assert.equal(first.actual.actorEquippedWeaponSnapshot.supportAfter.mountId,'test-warhorse');
 const state=deriveCombatStateFromComments(await history()).get(actor.id);
 const current=withEquippedCombatWeapon(await record(actor.id),state.equippedWeaponId,state.offHandWeaponId,state.supportEquipment);
 assert.equal(resolveCombatProfile(current,{actionId}).selectedAction.compatible,true);
 const prepared=await prepareTestAction({entryId:threadId,actorRecord:await record(actor.id),targetRecords:[await record(actor.id)],comments:await history(),actionId:'combat:wait',loadout:{...selection,mountId:''}});
 const tampered=structuredClone(prepared.payload);tampered.metadata.commentSegments[0].combatAction.loadout.mountId='foreign-horse';
 const before=await history();await assert.rejects(commit(tampered),/Reittier|Ausrüstung|verfügbar/);assert.deepEqual(await history(),before);
 const saved=await commit(prepared.payload);const result=saved.mechanics.commentSegments[0].combatResolution;
 assert.equal(result.actorResourceSnapshot.after.find(r=>r.id==='bonus-action').current,0);
 assert.equal(result.actorEquippedWeaponSnapshot.supportAfter.mountId,'');
 await assert.rejects(strike({attacker:actor.id,target:enemy.id,actionId}),/beritten|Reittier/);
});
