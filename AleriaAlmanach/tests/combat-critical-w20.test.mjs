import test from 'node:test';
import assert from 'node:assert/strict';
import { createCriticalConsequence } from '../modules/combat-critical/combat-critical-model.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { parseDamageFormula } from '../modules/combat/rules/combat-mvp-rules.js';
import { releaseCriticalTemporaryOwnership } from '../modules/combat-critical/combat-critical-lifecycle.js';
import { renderCombatEvaluation } from '../modules/combat/ui/combat-ui.js';
import { applyTypedCombatDamage } from '../modules/combat/combat-effect-model.js';

const character = id => ({id,name:id,combatProfile:{hitPoints:{current:40,maximumOverride:40},armorClass:{override:12},
 weapons:[{id:'sword',name:'Schwert',weaponType:'sword',damageFormula:'1d8',damageType:'Hieb',equipped:true}],
 techniques:[{id:'chain',name:'Folge',activationType:'action',damageFormula:'1d8',followUpAttack:{enabled:true,afterMiss:true,inheritWeapon:true,repeatCount:3}},
 {id:'save',name:'Wurf',activationType:'action',damageFormula:'1d8',secondarySave:{enabled:true,attributeKey:'dexterity',fixedDc:15,dc:15,
 failureCondition:{id:'test',name:'Test',mechanics:{}}}}]}});
const profile=(id,actionId='weapon:sword')=>resolveCombatProfile(character(id),{actionId});
const encounter={encounterId:'battle',criticalEffectsVersion:1};
function history(roll,failure=false){
 const a=profile('a'),b=profile('b');
 const r={actionType:'attack',resolutionMode:'weapon-attack',profileActionKind:'weapon',actorId:'a',targetId:'b',
 attack:failure?{criticalFailure:true,hit:false}:{criticalSuccess:true,hit:true}};
 r.criticalConsequence=createCriticalConsequence(r,{encounter,roll,id:'effect',actor:a,target:b});
 return [{id:'critical',characterId:'a',commentSegments:[{combatResolution:r}]}];
}
function dice(rolls=[15]){
 let index=0;const requests=[];
 return {requests,async rollAttack(o){requests.push(o);const n=rolls[Math.min(index++,rolls.length-1)];return {natural:n,total:n+o.modifier,dice:[n],keptDice:[n]};},
 async rollDamage(o){const f=parseDamageFormula(o.damageFormula);const values=(f.terms || [f]).flatMap(t=>Array(t.diceCount*(o.critical?2:1)).fill(4));
 return {total:Math.max(0,values.reduce((a,b)=>a+b,0)+f.fixedModifier+o.bonus),modifier:f.fixedModifier+o.bonus,keptDice:values};},
 async rollSavingThrow(o){return {natural:12,total:12+o.modifier,dice:[12],keptDice:[12]};}};
}
async function evaluate(h,{attacker='a',defender='b',action='weapon:sword',rolls=[15],changeActor=p=>p,changeTarget=p=>p}={}){
 const states=deriveCombatStateFromComments(h),d=dice(rolls);
 const actor=changeActor(overlayCombatHitPointState(profile(attacker,action),states.get(attacker)));
 const target=changeTarget(overlayCombatHitPointState(profile(defender),states.get(defender)));
 const result=await new CombatResolutionService(d).resolveAttack({actor,target},{rulePeriods:{comment:'next'}});
 return {result,requests:d.requests};
}
test('W20 receipts are versioned; all forty results serialize and invalid rolls are rejected',()=>{
 for(const fail of [false,true])for(let roll=1;roll<=20;roll++){
 const h=history(roll,fail),c=h[0].commentSegments[0].combatResolution.criticalConsequence;
 assert.equal(c.version,2);assert.equal(c.dieSides,20);
 assert.deepEqual(deriveCombatStateFromComments(JSON.parse(JSON.stringify(h))),deriveCombatStateFromComments(h));
 }
 for(const value of [0,21,1.5,NaN])assert.throws(()=>history(value),/W20/);
});
for(const fail of [false,true])test(`prone ${fail} costs only the next own bonus action`,()=>{
 const h=history(11,fail),id=fail?'a':'b';
 const p=overlayCombatHitPointState(profile(id),deriveCombatStateFromComments(h).get(id));
 assert.equal(p.resources.find(r=>r.id==='bonus-action').current,0);
 assert.equal(p.resources.find(r=>r.id==='action').current,1);
 assert.equal(p.resources.find(r=>r.id==='reaction').current,1);
 assert.equal(deriveCombatStateFromComments([...h,{characterId:id}]).get(id).temporaryConditions.length,0);
});
test('fixed HP losses tick once per whole own post, skip other actors and administration, stop after two/one posts',()=>{
 for(const fail of [false,true]){
 const h=history(12,fail),id=fail?'a':'b';
 assert.equal(deriveCombatStateFromComments([...h,{characterId:'c'}]).get(id).current,40);
 const own={characterId:id,commentSegments:[{characterId:id},{characterId:id},{characterId:id}]};
 assert.equal(deriveCombatStateFromComments([...h,own]).get(id).current,39);
 assert.equal(deriveCombatStateFromComments([...h,own,own,own]).get(id).current,fail?39:38);
 assert.equal(deriveCombatStateFromComments([...h,{combatEncounter:{operation:'end',encounterId:'battle'}},own]).get(id).current,40);
 }
});
test('next-roll modes are consumed by a miss and by only one roll in a four-attack sequence',async()=>{
 for(const [roll,fail,attacker,defender,mode]of [[13,false,'b','a','disadvantage'],[14,false,'a','b','advantage'],[13,true,'b','a','advantage']]){
 const {result}=await evaluate(history(roll,fail),{attacker,defender,action:'technique:chain',rolls:[1,15,15,15]});
 assert.equal(result.attack.rollMode,mode);assert.equal(result.followUpAttacks.length,3);
 assert.ok(result.followUpAttacks.every(r=>r.attack.rollMode==='normal'));
 }
});
test('target-bound advantage ignores unrelated opponents without consuming itself',async()=>{
 const {result}=await evaluate(history(14),{defender:'c'});
 assert.equal(result.attack.rollMode,'normal');assert.equal(result.actorConditionSnapshot,null);
});
test('prevent-advantage preserves existing disadvantage and applies only once',async()=>{
 const {result}=await evaluate(history(14,true),{action:'technique:chain',changeActor:p=>({...p,forcedRollMode:'advantage',conditions:[...p.conditions,{active:true,mechanics:{attackRollMode:'disadvantage'}}]})});
 assert.equal(result.attack.rollMode,'disadvantage');
 assert.ok(result.followUpAttacks.every(r=>r.attack.rollMode==='normal'));
});
for(const [roll,fail,attacker,defender,delta]of [[15,false,'a','b',2],[16,false,'b','a',-2],[17,true,'a','b',-2],[18,true,'a','b',-2]]){
 test(`one-hit damage ${roll}/${fail} is not doubled and affects only the first successful hit`,async()=>{
 const base=await evaluate([],{attacker,defender,action:'technique:chain',rolls:[1,20,15,15]});
 const {result}=await evaluate(history(roll,fail),{attacker,defender,action:'technique:chain',rolls:[1,20,15,15]});
 assert.equal(result.followUpAttacks[0].damage.total,base.result.followUpAttacks[0].damage.total+delta);
 assert.equal(result.followUpAttacks[1].damage.total,base.result.followUpAttacks[1].damage.total);
 });
}
test('protection bypass ignores exactly one point, cannot add damage without protection',async()=>{
 for(const amount of [0,2]){
 const changeTarget=p=>({...p,armorItems:[{id:'plate',kind:'armor',equipped:true,damageProtection:{amount,damageTypes:['hieb']}}]});
 const base=await evaluate([],{changeTarget});const {result}=await evaluate(history(17),{changeTarget});
 assert.equal(result.damage.total,base.result.damage.total+(amount?1:0));
 }
});
test('protection bypass reduces full protection before capping it to incoming damage, including layered guards',()=>{
 const armor={armorItems:[{equipped:true,damageProtection:{amount:2,damageTypes:['hieb']}}]};
 const guard={id:'brace',active:true,damageGuard:{charges:1,reduction:4}};
 const state={current:40,maximum:40,temporary:0};
 for(const [incoming,conditions,loss]of [[1,[],0],[2,[],1],[3,[guard],0],[5,[guard],0],[6,[guard],1]]){
  const applied=applyTypedCombatDamage(state,incoming,armor,{damageType:'hieb',conditions,reductionBypass:1});
  assert.equal(applied.after.current,40-loss);
 }
});
for(const [roll,fail,attacker,defender,delta]of [[18,false,'a','b',-2],[20,false,'b','a',2],[15,true,'b','a',-2],[20,true,'a','b',2]]){
 test(`saving throw ${roll}/${fail} changes the actual roll and consumes its condition`,async()=>{
 const base=await evaluate([],{attacker,defender,action:'technique:save'});
 const {result}=await evaluate(history(roll,fail),{attacker,defender,action:'technique:save'});
 assert.equal(result.secondarySaves[0].modifier,base.result.secondarySaves[0].modifier+delta);
 assert.ok(!result.targetConditionSnapshot.after.some(c=>c.criticalConsequence));
 });
}
test('critical save modifiers survive other attributes, spells and attacks without saves',async()=>{
 const h=history(18);
 for(const changeActor of [p=>({...p,selectedAction:{...p.selectedAction,secondarySave:null}}),
 p=>({...p,profileActionKind:'spell'}),p=>({...p,selectedAction:{...p.selectedAction,secondarySave:{...p.selectedAction.secondarySave,attributeKey:'constitution'}}})]){
 const {result}=await evaluate(h,{action:'technique:save',changeActor});
 assert.ok(!result.targetConditionSnapshot || result.targetConditionSnapshot.after.some(c=>c.criticalConsequence));
 }
});
test('temporary HP does not stack, expires on own post/end and a larger new pool keeps its HP',()=>{
 const h=history(19);
 assert.equal(deriveCombatStateFromComments(h).get('a').temporary,2);
 assert.equal(deriveCombatStateFromComments([...h,{characterId:'b'}]).get('a').temporary,2);
 assert.equal(deriveCombatStateFromComments([...h,{characterId:'a'}]).get('a').temporary,0);
 assert.equal(deriveCombatStateFromComments([...h,{combatEncounter:{operation:'end',encounterId:'battle'}}]).get('a').temporary,0);
 const state=deriveCombatStateFromComments(h).get('a');
 assert.equal(releaseCriticalTemporaryOwnership(state.temporaryConditions,{temporary:2},{temporary:8})[0].criticalTemporaryOwned,false);
 const c=h[0].commentSegments[0].combatResolution.criticalConsequence;c.hitPointBase.temporary=8;
 assert.equal(deriveCombatStateFromComments([...h,{characterId:'a'}]).get('a').temporary,8);
});
test('fumble 16 adds two only to this opponent’s next attack',async()=>{
 const {result}=await evaluate(history(16,true),{attacker:'b',defender:'a',action:'technique:chain'});
 assert.equal(result.attack.modifier,profile('b','technique:chain').attackModifier+2);
 assert.ok(result.followUpAttacks.every(r=>r.attack.modifier===profile('b','technique:chain').attackModifier));
});
test('counter blocker leaves the prepared stance and reaction intact',async()=>{
 const {result}=await evaluate(history(19,true),{attacker:'b',defender:'a',rolls:[1],changeTarget:p=>({...p,
 temporaryConditions:[...p.temporaryConditions,{id:'counter',name:'Konter',active:true,counterAttack:{enabled:true}}]})});
 assert.equal(result.counterAttacks,undefined);
 assert.ok(result.targetConditionSnapshot.after.some(c=>c.id==='counter'));
 assert.match(result.mechanicNotes.join(' '),/Konter.*gesperrt/);
});

test('stored W10 and new W20 evaluations keep distinct die labels without modifying either receipt',async()=>{
 const {result}=await evaluate([]);
 const c=history(20)[0].commentSegments[0].combatResolution.criticalConsequence;
 const modern={...result,criticalConsequence:c},old={...result,criticalConsequence:{...c,version:1,roll:1,dieSides:10}};
 const before=JSON.stringify([modern,old]);
 assert.match(renderCombatEvaluation({combatResolution:modern}),/W20 · 20/);
 assert.match(renderCombatEvaluation({combatResolution:old}),/W10 · 1/);
 assert.equal(JSON.stringify([modern,old]),before);
});

test('a deflected attack does not consume the next-hit bonus; the first actual follow-up hit does',async()=>{
 const options={action:'technique:chain',changeTarget:p=>({...p,temporaryConditions:[...(p.temporaryConditions || []),
 {id:'ward',active:true,name:'Abwehr',ward:{enabled:true,charges:1,deflectChance:100}}]})};
 const base=await evaluate([],options),{result}=await evaluate(history(15),options);
 assert.equal(result.attack.hit,false);
 assert.equal(result.followUpAttacks[0].damage.total,base.result.followUpAttacks[0].damage.total+2);
 assert.equal(result.followUpAttacks[1].damage.total,base.result.followUpAttacks[1].damage.total);
});
