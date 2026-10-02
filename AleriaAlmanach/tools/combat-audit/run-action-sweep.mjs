import {readFile,writeFile} from 'node:fs/promises';
import {resolveCombatProfile} from '../../modules/combat/combat-profile-resolver.js';
import {CombatResolutionService} from '../../modules/combat/combat-resolution-service.js';
import {getActionPaymentCosts} from '../../modules/combat/combat-action-economy.js';
import {getCombatDamagePreview} from '../../modules/combat/combat-action-estimates.js';
import {isSelfTargetAction as isCombatActionSelfTargeted} from '../../modules/combat/combat-action-targeting.js';
import {SeededCombatDice} from '../../tests/support/combat-seeded-dice.mjs';
import {canUseCombatOffHand,isPairedCombatWeapon} from '../../modules/combat/combat-weapon-loadout.js';
import {buildDamageNotation} from '../../modules/combat/rules/combat-mvp-rules.js';
const [input, output] = process.argv.slice(2);
if (!input || !output) throw Error('Usage: run-action-sweep.mjs records.json report.json');
const characters=JSON.parse(await readFile(input,'utf8'));
const dummy=resolveCombatProfile({id:'audit-target',name:'Testziel',combatProfile:{hitPoints:{maximumOverride:5000,current:5000},weapons:[{id:'dummy',name:'Testwaffe',damageFormula:'1d8',equipped:true}] }},{includeAiSnapshot:false});
dummy.totalDefense=0;
const problems=[],tested=[],unavailable=[];
class AuditDice extends SeededCombatDice {
 constructor(mode,savingThrow){super(293);this.mode=mode;this.savingThrow=savingThrow;this.damageCalls=[];}
 async rollAttack(options){const n=this.savingThrow?(this.mode==='miss'?20:1):this.mode==='critical'?20:this.mode==='miss'?1:12; const dice=Array(options.rollMode==='normal'?1:2).fill(n);return {id:crypto.randomUUID(),natural:n,dice,keptDice:[n],total:n+options.modifier};}
 async rollSavingThrow(options){const n=this.mode==='miss'?20:1;return {id:crypto.randomUUID(),natural:n,dice:Array(options.rollMode==='normal'?1:2).fill(n),keptDice:[n],total:n+options.modifier};}
 async rollDamage(options){this.damageCalls.push(options);return super.rollDamage(options);}
 forCounter(){return this;}
}
for(const original of characters){
 const c=structuredClone(original),p=c.combatProfile;
 p.hitPoints.current=5000;p.hitPoints.maximumOverride=5000;p.hitPoints.temporary=0;p.conditions=[];
 p.resources?.forEach(r=>r.current=r.maximum);p.abilities?.forEach(a=>{a.usesCurrent=a.usesMaximum;});
 const variants=[{right:null}];
 for(const w of p.weapons||[])variants.push({right:w.id}, {right:w.id,shield:true}, {right:w.id,mounted:true});
 for(const right of (p.weapons||[]).filter(canUseCombatOffHand))for(const left of (p.weapons||[]).filter(canUseCombatOffHand)) {
  if(right.id!==left.id||isPairedCombatWeapon(right))variants.push({right:right.id,left:left.id});
 }
 const candidates=new Map(),known=new Map();
 for(const variant of variants){
  const v=structuredClone(c);
  if(variant.right){v.combatProfile.weapons.forEach(w=>w.equipped=w.id===variant.right);v.combatProfile.combat={...v.combatProfile.combat,offHandWeaponId:variant.left||'',mounted:!!variant.mounted};v.combatProfile.armorItems?.filter(a=>a.kind==='shield').forEach(a=>a.equipped=!!variant.shield);}
  const base=resolveCombatProfile(v,{includeAiSnapshot:false});
  base.resources.forEach(r=>r.current=r.maximum);
  for(const a of base.actions){
   if(['equipment-switch','wait'].includes(a.kind)||a.id==='combat:wait')continue;
   known.set(a.id,a);
   if(a.compatible===false)continue;
   const key=a.id+'|'+base.activeWeaponId+'|'+(base.combat?.offHandWeaponId||'');
   if(candidates.has(key))continue;
   candidates.set(key,{...base,weapon:a.weapon,selectedAction:a,profileActionId:a.id,profileActionKind:a.kind,
    attackModifier:a.attackModifier,damageModifier:a.damageModifier,resourceCosts:getActionPaymentCosts(a,'standard',base),actionCosts:a.costs,
    actionResolutionMode:a.resolutionMode,actionSaveAttribute:a.saveAttribute,actionSpellSaveDc:a.spellSaveDc??base.spellSaveDc,
    actionHalfDamageOnSave:!!a.halfDamageOnSave,forcedRollMode:a.forcedRollMode||'normal'});
  }
 }
 for(const a of known.values())if(![...candidates.values()].some(p=>p.profileActionId===a.id))unavailable.push({character:c.name,id:a.id,name:a.name,reason:a.disabledReason});
 for(const actor of candidates.values())for(const mode of ['normal','miss','critical']){
  const dice=new AuditDice(mode,actor.actionResolutionMode==='saving-throw'), target=isCombatActionSelfTargeted(actor.selectedAction)?actor:dummy;
  try{
   const result=await new CombatResolutionService(dice).resolveAttack({actor,target});
   const preview=getCombatDamagePreview(actor);
   tested.push({character:c.name,id:actor.profileActionId,weapon:actor.activeWeaponId,mode,hit:result.attack.hit,formula:preview?.notation,
    calls:dice.damageCalls.map(d=>({formula:d.damageFormula,bonus:d.bonus,critical:d.critical})),damage:result.damage?.total,followUps:result.followUpAttacks?.length||0});
   if(mode==='normal'&&result.attack.hit&&preview&&!preview.parts&&dice.damageCalls.length===1&&!result.ruleApplications.length) {
    const call=dice.damageCalls[0];
    if(preview.notation!==buildDamageNotation(call.damageFormula,call.bonus))problems.push({character:c.name,id:actor.profileActionId,issue:'preview mismatch',preview:preview.notation,rolled:buildDamageNotation(call.damageFormula,call.bonus)});
   }
   if(!preview&&result.damage&&actor.actionResolutionMode==='automatic')problems.push({character:c.name,id:actor.profileActionId,mode,issue:'support produced damage',damage:result.damage});
  }catch(e){problems.push({character:c.name,id:actor.profileActionId,name:actor.selectedAction.name,weapon:actor.activeWeaponId,mode,error:e.message});}
 }
 console.log(c.name,candidates.size,'variants',problems.length,'findings');
}
await writeFile(output,JSON.stringify({tested,problems,unavailable},null,2));
console.log(JSON.stringify({tested:tested.length,problems,unavailable},null,2));
