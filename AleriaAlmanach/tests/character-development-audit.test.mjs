import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { getDevelopmentTraitTestBatches } from './support/development-trait-batches.mjs';
import { getDevelopmentAttackCatalog, getDevelopmentSummary } from '../modules/character-development/development-purchases.js';
import { findExistingDevelopmentTraitMatches } from '../modules/character-development/development-balance-review.js';
import { previewCharacterLevelUp, createCharacterLevelUpPlan } from '../modules/combat/combat-level-up-model.js';
import { createCharacterCreationDraft, applyCharacterCreationDraft } from '../modules/combat/character-creation-model.js';
import { sanitizeCharacterCombatProfile, getSkillTotal, getSpellcastingValues, getWeaponAttackModifier, getUniversalDamageBonus, getEffectiveSkillProficiency } from '../modules/combat/combat-profile-model.js';
import { resolveSkillModifier } from '../modules/skill-checks/skill-check-model.js';
import { getSkillIdentity } from '../modules/skill-checks/skill-definitions.js';
import { getCombatRollContext } from '../modules/combat/combat-resolution-service.js';
import { resolveTechniqueSecondarySave } from '../modules/combat/combat-technique-secondary-save.js';
import { collectCombatTriggerRules } from '../modules/combat/combat-trigger-rules.js';
import { buildCombatProfileAiSnapshot } from '../modules/combat/combat-profile-context.js';
import { acceptCreationSkillSuggestions, getCreationSkillSuggestions, acceptCreationClassSuggestions } from '../modules/character-development/creation-training-model.js';
import { getDevelopmentAttackCost } from '../modules/character-development/development-purchases.js';
import { renderCreationClassOptions } from '../modules/character-development/creation-training-ui.js';
import { createCharacterArchiveProfileItem, extractCharacterArchiveEntries } from '../modules/character-archive/character-archive-model.js';
import { getDevelopmentTraitId, findDevelopmentArchiveDuplicate } from '../modules/character-development/development-entry-reference.js';
import { resolveCenyrTechniqueWeaponRules } from '../modules/classes/cenyr/cenyr-technique-weapon-rules.js';
import { sanitizeCharacterCombatProfile as serverSanitize, getSpellcastingValues as serverSpells } from '../../firebase/functions/src/generated/combat/combat-profile-model.js';

const base=()=>sanitizeCharacterCombatProfile({templateSelections:{classId:'teulu'},hitPoints:{hitDie:10,current:4}});
const choose=ids=>previewCharacterLevelUp(base(),{targetLevel:1,traitIds:ids.map(id=>`development-trait-${id}`)});
const catalog=getDevelopmentAttackCatalog();

test('only released techniques can be bought; draft catalogues are never promoted to confirmed',()=>{
 assert.equal(catalog.length,193);assert.ok(catalog.every(e=>e.technique.live===true&&e.technique.status==='confirmed'));
 const draft='cenyr-milwr::combat-style-drachentanz-milwr-jungdrache-erster-soldhieb';
 const result=previewCharacterLevelUp(base(),{targetLevel:5,purchaseIds:[draft]});
 assert.equal(result.ready,false);assert.equal(result.profile.techniques.length,0);
});

test('paid training can be restored without replacing its old price or original class receipt',()=>{
 const own=catalog.find(e=>e.classId==='teulu'&&e.minimumLevel===1);
 const first=previewCharacterLevelUp(base(),{targetLevel:1,purchaseIds:[own.id]});
 const removed={...first.profile,techniques:[]};
 const restored=previewCharacterLevelUp(removed,{targetLevel:1,purchaseIds:[own.id],development:{ownClassCost:100}});
 assert.equal(restored.ready,true);assert.equal(restored.profile.techniques.length,1);
 assert.deepEqual(restored.profile.progression.development.purchases,first.profile.progression.development.purchases);
 assert.equal(restored.balance.spent,first.balance.spent);
});

test('skill identities work in character totals, scene checks and AI without changing base training',()=>{
 const profile=choose(['silberzunge','faehrtenleser','gutaussehend']).profile;
 const persuasion=profile.skills.find(s=>getSkillIdentity(s.name)==='persuasion');
 const survival=profile.skills.find(s=>getSkillIdentity(s.name)==='survival');
 assert.equal(persuasion.proficiency,'none');assert.equal(getEffectiveSkillProficiency(profile,persuasion),'expertise');
 assert.equal(getSkillTotal(profile,persuasion),6);assert.equal(getSkillTotal(profile,survival),4);
 assert.equal(resolveSkillModifier({combatProfile:profile},'persuasion').modifier,6);
 const ai=buildCombatProfileAiSnapshot({id:'test',combatProfile:profile});
 assert.equal(ai.skills.find(s=>s.id===persuasion.id).effectiveProficiency,'expertise');
 assert.equal(getSkillIdentity('Überlebenskunst'),getSkillIdentity('Überleben'));
});

test('arcane focus penalizes weapons only and giant blood does not add spell damage',()=>{
 const ordinary=base(),focus=choose(['arkaner-fokus']).profile,giant=choose(['riesenblut']).profile;
 assert.equal(getSpellcastingValues(focus).attack,getSpellcastingValues(ordinary).attack+1);
 assert.equal(getWeaponAttackModifier(focus,{weaponType:'sword',proficient:false}),getWeaponAttackModifier(ordinary,{weaponType:'sword',proficient:false})-1);
 assert.equal(getUniversalDamageBonus(giant),0);
 assert.deepEqual(serverSanitize(focus),sanitizeCharacterCombatProfile(focus));
 assert.deepEqual(serverSpells(focus),getSpellcastingValues(focus));
});

test('fire phobia recognizes typed damage effects on primary and secondary saves',async()=>{
 const target={...choose(['feuer-phobie']).profile,characterId:'target'};
 const actor={characterId:'actor',profileActionKind:'spell',actionResolutionMode:'saving-throw',actionSaveAttribute:'dexterity',weapon:{damageType:'Magie'},
  selectedAction:{name:'Typed fire',effects:[{type:'damage',damageType:'Feuer'}],secondarySave:{enabled:true,timing:'after-hit',attributeKey:'constitution',dc:12}}};
 assert.equal(getCombatRollContext(actor,target).safeRollMode,'disadvantage');
 let mode='';
 await resolveTechniqueSecondarySave({dice:{rollSavingThrow:async options=>{mode=options.rollMode;return {natural:12,total:12};}},actor,target,attack:{hit:true},timing:'after-hit',
  ruleSources:[{actorId:'target',profile:target,relationToActor:'enemy',relationToTarget:'self'}],ruleProfileState:{actorProfile:actor,targetProfile:target},actionKind:'spell',profileActionId:'spell:fire',rulePeriods:{},usedRuleFrequencyKeys:new Set(),options:{}});
 assert.equal(mode,'disadvantage');
 assert.equal(getCombatRollContext({...actor,actionResolutionMode:'spell-attack'},target).safeRollMode,'normal');
});

test('nonstacking weakness, resistance, expertise and advantage receive only one balance valuation',()=>{
 const cold=choose(['frost-phobie','frostempfindlich']);
 assert.equal(cold.balance.nominalCost,-5);assert.equal(cold.balance.traitCost,-3);assert.ok(cold.balance.warnings.length);
 const fire=choose(['feueraffinitaet','glutgewoehnt']);assert.equal(fire.balance.traitCost,2);
 const cancelled=choose(['feueraffinitaet','feuer-phobie']);assert.equal(cancelled.balance.traitCost,-1);
 const contradictory=choose(['klein','gross','haesslich','gutaussehend']);assert.equal(contradictory.ready,true);assert.ok(contradictory.balance.warnings.length>=2);
});

test('legacy personal traits are not replaced or charged twice merely by opening the level assistant',async()=>{
 // Historical profiles deliberately keep the pre-review traits here. The explicit
 // editorial replacement has its own tests; opening the assistant is not a migration.
 const snapshot=JSON.parse(await readFile(new URL('../../diagnostics/character-trait-review-20261102/local-before.json',import.meta.url),'utf8'));
 const freya=snapshot.profiles.find(c=>c.character.name==='Freya Skald').character,gildas=snapshot.profiles.find(c=>c.character.name==='Gildas Gafyr').character;
 const before=structuredClone(freya.combatProfile);
 const plan=createCharacterLevelUpPlan(freya.combatProfile);plan.targetLevel=freya.combatProfile.progression.level;plan.traitIds=['development-trait-buehnensicher'];
 const result=previewCharacterLevelUp(freya.combatProfile,plan);
 assert.equal(result.balance.traitCost,0);
 assert.ok(result.profile.quirks.some(q=>q.id==='freya-kuenstlerische-ausbildung'));
 assert.deepEqual(freya.combatProfile,before);
 const matches=findExistingDevelopmentTraitMatches(gildas.combatProfile,DEVELOPMENT_TRAITS);
 assert.ok(matches.some(m=>m.traitId==='development-trait-glueckspilz'&&m.sourceNames.includes('Erarbeitete Standfestigkeit')));
});

test('same-level edits keep attacks and resources while updating experience and pool selections',()=>{
 const original=base();const result=previewCharacterLevelUp(original,{targetLevel:1,experience:777,nextLevelExperience:999});
 assert.equal(result.profile.progression.experience,777);assert.equal(result.profile.progression.nextLevelExperience,999);
 assert.deepEqual(result.profile.techniques,original.techniques);
 assert.deepEqual(result.profile.resources,original.resources);
});

test('existing characters open creation in preserve mode; fresh resets remain explicit',()=>{
 const original=sanitizeCharacterCombatProfile({templateSelections:{classId:'teulu'},progression:{level:5,experience:700},hitPoints:{current:4},attributes:[{key:'strength',score:18}]});
 const draft=createCharacterCreationDraft(original);
 assert.equal(draft.resetLevelOne,false);assert.equal(draft.developmentPlan.targetLevel,5);assert.equal(draft.attributeMethod,'free');
 const result=applyCharacterCreationDraft(original,draft);
 assert.equal(result.profile.hitPoints.current,4);assert.equal(result.profile.progression.level,5);
 assert.deepEqual(result.profile.attributes,original.attributes);
});

test('class foundation preserves spell/focus/pact/celestial routing without adding equipment or spells',()=>{
 for(const [id,expected] of [['asket',{focusEnabled:true,focusResourceId:'focus'}],['hexer',{manaResourceId:'pact-points'}],['kleriker',{bypassResourceId:'celestial-points'}],['magier',{casterTier:'full'}]]){
  const draft=createCharacterCreationDraft({});draft.selections.classId=id;
  const result=applyCharacterCreationDraft({},draft);assert.equal(result.ok,true,result.errors.join(' '));
  for(const [key,value]of Object.entries(expected))assert.equal(result.profile.magic[key],value,`${id}.${key}`);
  assert.equal(result.profile.magic.spells.length,0);assert.equal(result.profile.weapons.some(w=>w.id.startsWith('starter-')),false);
 }
});

test('every catalogue trait has source and web images and survives the browser/server profile boundary',async()=>{
 for (const batch of getDevelopmentTraitTestBatches()) {
  const profile=sanitizeCharacterCombatProfile({quirks:batch});
  assert.equal(profile.quirks.length,batch.length);assert.deepEqual(serverSanitize(profile),profile);
  assert.equal(getDevelopmentSummary(profile).traitCost,choose(batch.map(t=>t.id.replace('development-trait-',''))).balance.traitCost);
 }
 for(const trait of DEVELOPMENT_TRAITS){await access(new URL(`../../${trait.icon.slice(1)}`,import.meta.url));if(trait.icon.startsWith('/AleriaAlmanach/assets/development-traits/'))await access(new URL(`../../${trait.icon.slice(1).replace('/web/','/').replace(/\.webp$/,'.png')}`,import.meta.url));}
});

test('class skills are suggestions; only explicit manual choices or accepting suggestions applies them',()=>{
 const draft=createCharacterCreationDraft({});draft.selections={classId:'helwyr',ancestryId:'cenyr',backgroundId:'ritter'};
 const before=applyCharacterCreationDraft({},draft).profile;
 assert.ok(getCreationSkillSuggestions(draft).length>0);
 assert.ok(before.skills.every(skill=>skill.proficiency==='none'));
 draft.skillChoices.perception='expertise';draft.skillChoices.athletics='trained';
 const manual=applyCharacterCreationDraft({},draft).profile;
 assert.equal(manual.skills.find(skill=>getSkillIdentity(skill.name)==='perception').proficiency,'expertise');
 assert.equal(manual.skills.find(skill=>getSkillIdentity(skill.name)==='persuasion').proficiency,'none');
 acceptCreationSkillSuggestions(draft);
 const accepted=applyCharacterCreationDraft({},draft).profile;
 assert.equal(accepted.skills.find(skill=>getSkillIdentity(skill.name)==='persuasion').proficiency,'trained');
 assert.equal(accepted.skills.find(skill=>getSkillIdentity(skill.name)==='perception').proficiency,'expertise');
});

test('multiple classes and a custom education persist, supply own-class prices and never supply gear',()=>{
 assert.ok(renderCreationClassOptions('teulu').includes('Eigene Ausbildung'));
 const draft=createCharacterCreationDraft({});draft.selections.classId='teulu';draft.additionalClassIds=['helwyr'];
 draft.includeCustomClass=true;draft.customClass={name:'Hafenwächterin',description:'Eigene Ausbildung an der Küste.'};
 draft.trainingChoices.hitDieOverride=8;draft.trainingChoices.savingThrows=['dexterity'];
 draft.trainingChoices.proficiencies.weapons=['bow','spear'];draft.trainingChoices.proficiencies.armor=['medium'];
 draft.trainingChoices.magicMode='focus';
 const result=applyCharacterCreationDraft({},draft);assert.equal(result.ok,true,result.errors.join(' '));
 assert.deepEqual(result.profile.templateSelections.classIds,['teulu','helwyr','custom']);
 assert.equal(result.profile.templateSelections.customClass.name,'Hafenwächterin');assert.equal(result.profile.hitPoints.hitDie,8);
 assert.equal(result.profile.magic.focusEnabled,true);
 assert.deepEqual(result.profile.proficiencies.weapons,['bow','spear']);
 assert.ok(result.profile.savingThrows.find(save=>save.attributeKey==='dexterity').proficient);
 assert.equal(result.profile.weapons.some(weapon=>weapon.id.startsWith('starter-')),false);assert.equal(result.profile.armorItems.length,0);
 for(const id of ['teulu','helwyr'])assert.equal(getDevelopmentAttackCost(result.profile,catalog.find(entry=>entry.classId===id&&entry.minimumLevel===1)),2);
 assert.deepEqual(serverSanitize(result.profile),result.profile);
 const reopen=createCharacterCreationDraft(result.profile);
 assert.deepEqual(reopen.additionalClassIds,['helwyr']);assert.equal(reopen.customClass.name,'Hafenwächterin');
 acceptCreationClassSuggestions(reopen);
 assert.ok(reopen.trainingChoices.proficiencies.armor.includes('heavy'));
});

test('archived catalogue traits retain their identity and exact duplicates consolidate visibly',()=>{
 const trait=DEVELOPMENT_TRAITS.find(t=>t.id==='development-trait-naturkind');
 const copy=createCharacterArchiveProfileItem({kind:'trait',name:trait.name,data:trait},'quirks');
 assert.notEqual(copy.id,trait.id);assert.equal(copy.developmentTraitId,trait.id);
 const original=sanitizeCharacterCombatProfile({...base(),quirks:[copy]});
 assert.deepEqual(serverSanitize(original),original);
 assert.equal(findDevelopmentArchiveDuplicate(original,'quirks',trait).id,copy.id);
 const plan=createCharacterLevelUpPlan(original);plan.targetLevel=1;
 assert.deepEqual(plan.traitIds,[trait.id]);
 const result=previewCharacterLevelUp(original,plan);
 assert.equal(result.profile.quirks.length,1);assert.equal(result.profile.quirks[0].id,copy.id);
 assert.equal(result.balance.traitCost,trait.cost);
 const oldCopy={...copy};delete oldCopy.developmentTraitId;
 assert.equal(getDevelopmentTraitId(oldCopy),trait.id);
 const doubled=previewCharacterLevelUp({...original,quirks:[copy,{...copy,id:'second-copy'}]},plan);
 assert.equal(doubled.profile.quirks.length,1);assert.ok(doubled.changes.some(change=>change.key==='duplicate-second-copy'));
 const removed=previewCharacterLevelUp(original,{...plan,traitIds:[]});assert.equal(removed.profile.quirks.length,0);
});

test('archived techniques retain paid class requirements and multi-class archive entries stay separate',()=>{
 const entry=catalog.find(e=>e.classId==='helwyr'&&e.minimumLevel===1);
 assert.ok(entry);
 const paid=previewCharacterLevelUp(base(),{targetLevel:1,purchaseIds:[entry.id]}).profile;
 const copy=createCharacterArchiveProfileItem({kind:'technique',name:entry.technique.name,data:entry.technique},'techniques');
 paid.techniques=[copy];const normalized=sanitizeCharacterCombatProfile(paid);
 assert.equal(copy.catalogTechniqueId,entry.technique.id);assert.deepEqual(serverSanitize(normalized),normalized);
 assert.equal(findDevelopmentArchiveDuplicate(normalized,'techniques',entry.technique).id,copy.id);
 const retry=previewCharacterLevelUp(normalized,{targetLevel:1,purchaseIds:[entry.id]});
 assert.equal(retry.profile.techniques.length,1);assert.deepEqual(retry.profile.progression.development.purchases,paid.progression.development.purchases);
 const weapon={name:'Langbogen',weaponType:'bow',weaponProfileId:'longbow'};
 assert.deepEqual(resolveCenyrTechniqueWeaponRules(paid,copy,weapon),resolveCenyrTechniqueWeaponRules(paid,entry.technique,weapon));
 normalized.templateSelections={classId:'teulu',classIds:['teulu','helwyr','custom'],customClass:{name:'Hafenwächterin'}};
 normalized.identity.archetype='Teulu / Helwyr / Hafenwächterin';
 const entries=extractCharacterArchiveEntries({id:'archive-test',name:'Test',combatProfile:normalized}).filter(e=>e.kind==='class');
 assert.deepEqual(entries.map(e=>e.name).sort(),['Teulu','Helwyr','Hafenwächterin'].sort());
});
