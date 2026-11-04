import test from 'node:test';
import assert from 'node:assert/strict';
import { createCharacterLevelUpPlan, previewCharacterLevelUp, applyManualCharacterLevel } from '../modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile, getSkillTotal, getMaximumHitPoints, getSavingThrowTotal, getWeaponAttackModifier } from '../modules/combat/combat-profile-model.js';
import { getAutofilledCenyrCombatProfile } from '../modules/classes/cenyr/cenyr-combat-profile-autofill.js';
import { reconcileCultureFormArsenal } from '../modules/classes/class-form-arsenal.js';
import { getDevelopmentAttackCatalog, getDevelopmentAttackCost } from '../modules/character-development/development-purchases.js';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { getDevelopmentTraitTestBatches } from './support/development-trait-batches.mjs';
import { applyTypedCombatDamage } from '../modules/combat/combat-effect-model.js';
import { collectCombatTriggerRules, collectApplicableCombatRules, mergeCombatRuleEffects } from '../modules/combat/combat-trigger-rules.js';
import { resolveCenyrTechniqueWeaponRules } from '../modules/classes/cenyr/cenyr-technique-weapon-rules.js';
import { getCombatRollContext } from '../modules/combat/combat-resolution-service.js';
import { sanitizeCharacterCombatProfile as serverSanitize, getSavingThrowTotal as serverSaveTotal } from '../../firebase/functions/src/generated/combat/combat-profile-model.js';

const base=()=>sanitizeCharacterCombatProfile({templateSelections:{classId:'teulu'},progression:{level:1},hitPoints:{current:5,hitDie:10},techniques:[{id:'personal',name:'Persönliche Attacke',active:true}]});
const catalog=getDevelopmentAttackCatalog();
test('multi-level preview preserves source, existing attacks and spent resources without automatic techniques',()=>{
 const before=base(), copy=structuredClone(before);
 const result=previewCharacterLevelUp(before,{targetLevel:5});
 assert.equal(result.ready,true); assert.equal(result.after.level,5);assert.equal(result.after.proficiencyBonus,3);
 assert.deepEqual(result.profile.techniques.map(t=>t.id),['personal']);assert.deepEqual(before,copy);
 assert.equal(getMaximumHitPoints(result.profile),34);assert.equal(result.attributePointAllowance,2);
 assert.equal(result.balance.earned,15);
 assert.deepEqual(getAutofilledCenyrCombatProfile(result.profile).techniques,result.profile.techniques);
 assert.deepEqual(reconcileCultureFormArsenal({...result.profile,templateSelections:{classId:'skytte'}}).techniques,result.profile.techniques);
 assert.equal(sanitizeCharacterCombatProfile(result.profile).progression.development.mode,'purchase');
});
test('own and foreign attacks use configurable costs and negative balances never gate purchases',()=>{
 const profile=base();const own=catalog.find(e=>e.classId==='teulu'&&e.minimumLevel===1);
 const foreign=catalog.find(e=>e.classId==='helwyr'&&e.minimumLevel<=5&&e.technique.id!==own.technique.id);
 assert.ok(own&&foreign);assert.equal(getDevelopmentAttackCost(profile,own),2);assert.ok(getDevelopmentAttackCost(profile,foreign)>=4);
 const result=previewCharacterLevelUp(profile,{targetLevel:5,purchaseIds:[own.id,foreign.id],development:{startingPoints:0,pointsPerLevel:0}});
 assert.equal(result.ready,true);assert.ok(result.balance.remaining<0);assert.equal(result.profile.progression.development.purchases.length,2);
 const again=previewCharacterLevelUp(result.profile,{targetLevel:5,purchaseIds:[own.id,foreign.id]});
 assert.equal(again.profile.progression.development.purchases.length,2);assert.equal(again.balance.remaining,result.balance.remaining);
 assert.equal(again.profile.techniques.filter(t=>t.id===own.technique.id).length,1);
 assert.equal(resolveCenyrTechniqueWeaponRules(result.profile,foreign.technique,{weaponType:'bow',weaponProfileId:'longbow'}).disabledReason.includes('Technikpool'),false);
});
test('unknown or premature attacks are rejected independently of the balance',()=>{
 assert.equal(previewCharacterLevelUp(base(),{purchaseIds:['missing']}).ready,false);
 const high=catalog.find(e=>e.minimumLevel>5);
 assert.equal(previewCharacterLevelUp(base(),{targetLevel:2,purchaseIds:[high.id]}).ready,false);
});
test('traits are reversible, do not mutate base skill training, and persist mechanics',()=>{
 const profile=base();const selected=previewCharacterLevelUp(profile,{targetLevel:1,traitIds:['development-trait-naturkind']});
 const nature=selected.profile.skills.find(s=>s.name==='Naturkunde');const animals=selected.profile.skills.find(s=>s.name==='Mit Tieren umgehen');
 assert.equal(getSkillTotal(selected.profile,nature),1);assert.equal(getSkillTotal(selected.profile,animals),1);
 assert.equal(nature.proficiency,'none');assert.equal(selected.profile.quirks[0].icon.includes('naturkind'),true);
 const removed=previewCharacterLevelUp(selected.profile,{targetLevel:1,traitIds:[]});
 assert.equal(getSkillTotal(removed.profile,nature),0);assert.equal(getSkillTotal(removed.profile,animals),0);
});
test('fire phobia affects actual fire saving throws without changing physical damage susceptibility',()=>{
 const profile=previewCharacterLevelUp(base(),{targetLevel:1,traitIds:['development-trait-feuer-phobie']}).profile;
 assert.equal(applyTypedCombatDamage({current:30,maximum:30},4,profile,{damageType:'Feuer'}).after.current,26);
 assert.equal(applyTypedCombatDamage({current:30,maximum:30},4,profile,{damageType:'Kälte'}).after.current,26);
 const rules=collectCombatTriggerRules({...profile,characterId:'target'});
 const mode=(saving,damage)=>getCombatRollContext({characterId:'actor',profileActionKind:'spell',actionResolutionMode:saving?'saving-throw':'weapon-attack',actionSaveAttribute:'dexterity',weapon:{damageType:damage}}, {...profile,characterId:'target'}).safeRollMode;
 assert.equal(mode(true,'Feuer'),'disadvantage');assert.equal(mode(true,'Kälte'),'normal');assert.equal(mode(false,'Feuer'),'normal');
 assert.equal(rules.length,2);assert.ok(rules.every(r=>r.saveAttributes?.length===6&&r.damageTypes.includes('feuer')));
});
test('every catalogue trait survives a profile roundtrip; conditional penalties and weapon bonuses work',()=>{
 assert.equal(new Set(DEVELOPMENT_TRAITS.map(t=>t.id)).size,DEVELOPMENT_TRAITS.length);
 for (const batch of getDevelopmentTraitTestBatches()) {
  const result=previewCharacterLevelUp(base(),{targetLevel:1,traitIds:batch.map(t=>t.id)});
  assert.equal(result.ready,true,result.errors.join(' '));
  assert.equal(sanitizeCharacterCombatProfile(result.profile).quirks.length,batch.length);
 }
 const afraid=previewCharacterLevelUp(base(),{targetLevel:1,traitIds:['development-trait-aengstlich']}).profile;
 assert.equal(getSavingThrowTotal(afraid,'wisdom',{saveTags:['fear']}),-2);
 const archer=previewCharacterLevelUp(base(),{targetLevel:1,traitIds:['development-trait-scharfschuetze']}).profile;
 assert.equal(getWeaponAttackModifier(archer,{weaponType:'bow',attackAttribute:'dexterity',proficient:false}),1);
});
test('manual level changes and editing at maximum level do not acquire attacks',()=>{
 const result=applyManualCharacterLevel(base(),5);assert.deepEqual(result.profile.techniques.map(t=>t.id),['personal']);
 const capped=previewCharacterLevelUp({...base(),progression:{level:20,specialLevels:10}},{targetLevel:30,traitIds:['development-trait-zaeh']});
 assert.equal(capped.ready,true);assert.equal(capped.after.level,30);assert.equal(capped.profile.quirks.length,1);
});
test('twenty physical traits include the requested ten and use the same body mechanics on browser and server',()=>{
 const physical=DEVELOPMENT_TRAITS.filter(t=>t.tags.includes('Körper'));
 assert.equal(physical.length,20);
 for(const name of ['Vollbusig','Hässlich','Gutaussehend','Fit','Fragil','Schmächtig','Klein','Groß','Hünenhaft','Riesenblut'])assert.ok(physical.some(t=>t.name===name));
 const fragile=previewCharacterLevelUp(base(),{targetLevel:1,traitIds:['development-trait-fragil']}).profile;
 assert.equal(getMaximumHitPoints(fragile),6);assert.equal(getSavingThrowTotal(fragile,'constitution'),-1);assert.equal(getSavingThrowTotal(fragile,'wisdom'),0);
 const lung=previewCharacterLevelUp(base(),{targetLevel:1,traitIds:['development-trait-eiserne-lunge']}).profile;
 assert.equal(getSavingThrowTotal(lung,'constitution'),1);
 assert.equal(serverSaveTotal(serverSanitize(fragile),'constitution'),-1);
 for (const batch of getDevelopmentTraitTestBatches()) {
  const all=previewCharacterLevelUp(base(),{targetLevel:5,traitIds:batch.map(t=>t.id)}).profile;
  assert.deepEqual(serverSanitize(all),sanitizeCharacterCombatProfile(all));
 }
});
test('same-level edits apply custom resource changes and can reactivate a selected trait',()=>{
 const source={...base(),resources:[...base().resources,{id:'stamina',name:'Ausdauer',current:2,maximum:5}],quirks:[{...DEVELOPMENT_TRAITS[1],active:false}]};
 const result=previewCharacterLevelUp(source,{targetLevel:1,resourceIncreases:{stamina:{current:-1,maximum:2}},traitIds:['development-trait-naturkind']});
 assert.equal(result.profile.resources.find(r=>r.id==='stamina').current,1);assert.equal(result.profile.resources.find(r=>r.id==='stamina').maximum,7);
 assert.equal(result.profile.quirks.find(q=>q.id==='development-trait-naturkind').active,true);
});
test('additional phobias, talents, affinities and vulnerabilities use actual save and damage contexts',()=>{
 const choose=ids=>previewCharacterLevelUp(base(),{targetLevel:1,traitIds:ids.map(id=>`development-trait-${id}`)}).profile;
 const frost=choose(['frost-phobie']);
 const mode=(profile,kind,type)=>getCombatRollContext({characterId:'actor',profileActionKind:kind,actionResolutionMode:'saving-throw',actionSaveAttribute:'dexterity',weapon:{damageType:type}},{...profile,characterId:'target'}).safeRollMode;
 assert.equal(mode(frost,'spell','Kälte'),'disadvantage');assert.equal(mode(frost,'spell','Feuer'),'normal');
 assert.equal(mode(choose(['magie-phobie']),'spell','Feuer'),'disadvantage');assert.equal(mode(choose(['magie-phobie']),'weapon','Feuer'),'normal');
 const damage=(profile,type,magical=false)=>applyTypedCombatDamage({current:30,maximum:30},8,profile,{damageType:type,magical}).after.current;
 assert.equal(damage(choose(['blitzaffinitaet']),'Blitz'),26);assert.equal(damage(choose(['blitzaffinitaet']),'Lightning'),26);
 assert.equal(damage(choose(['saeureempfindlich']),'Säure'),14);
 assert.equal(damage(choose(['magische-resonanz']),'Hieb',true),14);assert.equal(damage(choose(['magische-resonanz']),'Hieb',false),22);
 const healer=choose(['heilerhaende']);assert.equal(getSkillTotal(healer,healer.skills.find(s=>s.name==='Heilkunde')),2);
});
