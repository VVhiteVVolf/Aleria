import assert from 'node:assert/strict';
import test from 'node:test';
import { ATTRIBUTE_CHECK_DEFINITIONS, SAVING_THROW_DEFINITIONS, getChecksForCommentKind,
  getChallengeAffinityModifier, normalizeSkillChallenge, resolveSkillModifier } from '../modules/skill-checks/skill-check-model.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { getChallengeAttemptChoices, getChallengeAttemptSettings } from '../modules/skill-checks/skill-challenge-attempt.js';
import { normalizeHerausforderungEvent, collectHerausforderungApproaches, getHerausforderungValidationIssues } from '../modules/herausforderung/herausforderung-model.js';
import { createHerausforderungExport, createHerausforderungAiTemplate, parseHerausforderungImport } from '../modules/herausforderung/herausforderung-exchange.js';
import { renderHerausforderungComment } from '../modules/herausforderung/herausforderung-ui.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { getAttributeIconPresentation } from '../modules/skill-checks/attribute-icon-registry.js';
import { CHECK_DEFINITIONS } from '../modules/skill-checks/skill-check-model.js';
import { getCheckDescription } from '../modules/skill-checks/skill-check-guidance.js';

const character={id:'figure',name:'Testfigur',combatProfile:{progression:{level:5},attributes:[{key:'strength',score:16},{key:'wisdom',score:14}],
  skills:[{name:'Wahrnehmung',attributeKey:'wisdom',proficiency:'expertise',bonus:1}],
  savingThrows:[{attributeKey:'strength',proficient:true,bonus:1}], resources:[]}};
const event=normalizeHerausforderungEvent({publicDescription:'Die Decke droht einzustürzen.',approaches:[{approachId:'escape',label:'Reagieren',difficulty:15,
  preferredSkills:['perception','attribute:strength','save:strength'],insight:'Du erkennst einen sicheren Weg.'}]});
const challenge=collectHerausforderungApproaches([{id:'event',herausforderung:event}])[0];

test('all 32 choices have short explanations; insight and perception describe different actions',()=>{
  assert.equal(CHECK_DEFINITIONS.length,32);
  for(const check of CHECK_DEFINITIONS)assert.ok(getCheckDescription(check).length>40,check.id);
  assert.match(getCheckDescription('insight'),/Absichten.*Körpersprache/);
  assert.match(getCheckDescription('perception'),/Sinneseindrücke/);
});

test('all six attributes and saves remain distinct selectable checks, with stable matching icons',()=>{
  assert.equal(ATTRIBUTE_CHECK_DEFINITIONS.length,6);assert.equal(SAVING_THROW_DEFINITIONS.length,6);
  for(const check of [...ATTRIBUTE_CHECK_DEFINITIONS,...SAVING_THROW_DEFINITIONS]){
    const choices=getChallengeAttemptChoices({...challenge,preferredSkills:[check.id]});
    assert.equal(choices[0].id,check.id);assert.equal(choices[0].kind,'interact');
    assert.equal(getChallengeAttemptSettings(challenge,check.id)?.skillId,challenge.preferredSkills.includes(check.id)?check.id:undefined);
    assert.ok(getChecksForCommentKind('interact').some(entry=>entry.id===check.id));
    assert.equal(getAttributeIconPresentation(check).id,check.attributeKey);
  }
  assert.deepEqual(getChallengeAttemptChoices(challenge).map(check=>check.id),['perception','attribute:strength','save:strength']);
});

test('sheet proficiency is counted once; attribute checks remain untrained and saves use their own training',async()=>{
  assert.equal(resolveSkillModifier(character,'perception').modifier,9);
  assert.equal(resolveSkillModifier(character,'attribute:strength').modifier,3);
  assert.equal(resolveSkillModifier(character,'save:strength').modifier,7);
  const service=new SkillResolutionService({rollSkill:async({modifier})=>({natural:10,total:10+modifier,dice:[10]})});
  for(const [skillId,expected]of [['perception',19],['attribute:strength',13],['save:strength',17]]){
    const resolution=await service.resolve({actor:character,settings:{skillId},challenge});
    assert.equal(resolution.total,expected);assert.equal(resolution.affinityModifier,0);
  }
  const legacy=normalizeSkillChallenge({...challenge,preferredModifier:20,alternativeModifier:-20});
  assert.equal(getChallengeAffinityModifier(legacy,'perception'),0);assert.equal(getChallengeAffinityModifier(legacy,'history'),0);
});

test('saving throw conditions, attribute-specific roll modes and rules do not borrow skill-only effects',async()=>{
  const profile=resolveCombatProfile({...character,combatProfile:{...character.combatProfile,conditions:[{id:'condition',name:'Prüfung',active:true,mechanics:{skill:4,savingThrow:2,skillRollMode:'disadvantage',savingThrowAdvantageAttributes:['strength']}}],
    abilities:[{id:'save-rule',name:'Standhaft',active:true,triggerRules:[{id:'save',phase:'pre-roll',actionKinds:[],saveAttributes:['strength'],effects:{savingThrowModifier:2,skillModifier:99}}]}]}});
  const service=new SkillResolutionService({rollSkill:async({modifier,rollMode})=>({natural:10,total:10+modifier,dice:rollMode==='normal'?[10]:[10,9]})});
  const save=await service.resolve({actor:character,settings:{skillId:'save:strength'}},{actorProfile:profile});
  assert.equal(save.profileModifier,9);assert.equal(save.ruleModifier,2);assert.equal(save.total,21);assert.equal(save.rollMode,'advantage');
  const skill=await service.resolve({actor:character,settings:{skillId:'perception'}},{actorProfile:profile});
  assert.equal(skill.profileModifier,13);assert.equal(skill.ruleModifier,0);assert.equal(skill.rollMode,'disadvantage');
});

test('JSON export, AI catalog, import and public rendering preserve mixed options without fabricated bonuses',()=>{
  assert.deepEqual(getHerausforderungValidationIssues(event),[]);
  const imported=parseHerausforderungImport(JSON.stringify(createHerausforderungExport(event))).event;
  assert.deepEqual(imported.approaches[0].preferredSkills,event.approaches[0].preferredSkills);
  const template=createHerausforderungAiTemplate();assert.equal(template.catalog.attributeChecks.length,6);assert.equal(template.catalog.savingThrows.length,6);
  const html=renderHerausforderungComment({id:'event',herausforderung:imported});
  assert.match(html,/data-skill-icon="perception"/);assert.match(html,/Attributswurf/);assert.match(html,/Rettungswurf/);
  assert.doesNotMatch(html,/\+2 auf|mit -2|mit −2/);assert.match(html,/data-herausforderung-action="edit"/);
});

test('pre-roll saving throw rules can force a result and cannot leak into skill outcomes',async()=>{
  const actor={...character,combatProfile:{...character.combatProfile,abilities:[{id:'will',name:'Fester Wille',active:true,
    triggerRules:[{id:'will-save',phase:'pre-roll',actionKinds:[],saveAttributes:['strength'],effects:{outcome:'force-save-success'}}]}]}};
  const service=new SkillResolutionService({rollSkill:async({modifier})=>({natural:2,total:2+modifier,dice:[2]})});
  const save=await service.resolve({actor,settings:{skillId:'save:strength',difficulty:40}});assert.equal(save.outcome,'success');
  const skill=await service.resolve({actor,settings:{skillId:'perception',difficulty:40}});assert.equal(skill.outcome,'failure');
});
