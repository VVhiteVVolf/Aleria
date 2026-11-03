import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { planCharacterTraitPublication, selectReviewedCombatWrite } from '../modules/character-trait-review/character-trait-publication-plan.mjs';
import { reconcileClassDamageRevisions } from '../modules/classes/class-damage-revisions.js';
import { REVIEWED_CHARACTER_TRAITS } from '../modules/character-trait-review/reviewed-character-traits.js';
import { detectStaleCharacterFields } from '../modules/characters/character-save-guard.js';
const snapshot=JSON.parse(await readFile(new URL('../../diagnostics/combat-sheets-20261102/online-before.json',import.meta.url),'utf8'));
const records=snapshot.collections.characters.records,now='2026-11-03T00:00:00.000Z';
test('Every online character above level one has an explicit reviewed assignment; the bounded plan preserves live resources',()=>{
 const higher=records.filter(character=>character.combatProfile.progression?.level>1);
 assert.equal(higher.length,14);
 for(const character of higher){
  const assignment=REVIEWED_CHARACTER_TRAITS.find(assignment=>assignment.onlineId===character.id);assert(assignment,character.name);
  const baseline=structuredClone(character),plan=planCharacterTraitPublication({character,assignment,baseline,now});
  assert(plan.changed);assert(plan.character.combatProfile.revision>character.combatProfile.revision);
  assert.deepEqual(detectStaleCharacterFields(plan.character,character),['Kampfprofil']);
  for(const field of ['inventory','portrait','imageSets','identity','genealogy'])assert.deepEqual(plan.character[field],character[field],`${character.name}: ${field}`);
  for(const field of ['attributes','progression','resources','hitPoints','weapons','armorItems','classTraining','aura'])assert.deepEqual(plan.character.combatProfile[field],character.combatProfile[field],`${character.name}: ${field}`);
  const canonical=reconcileClassDamageRevisions(character.combatProfile);
  for(const field of ['techniques','magic'])assert.deepEqual(plan.character.combatProfile[field],canonical[field],`${character.name}: ${field}`);
  assert.deepEqual(character,baseline);
  assert.equal(planCharacterTraitPublication({character:plan.character,assignment,baseline,now}).changed,false);
 }
});
test('Rhiannons 23 spells receive their shared canonical revision through a correctly nested, narrow patch',()=>{
 const character=records.find(character=>character.name==='Rhiannon Draig'),assignment=REVIEWED_CHARACTER_TRAITS.find(a=>a.onlineId===character.id);
 const plan=planCharacterTraitPublication({character,assignment,baseline:character,now}),patch=selectReviewedCombatWrite(plan);
 assert.equal(patch.combatProfile.magic.spells.length,23);
 assert.equal(Object.hasOwn(patch.combatProfile,'magic.spells'),false);
 assert.deepEqual(patch.combatProfile.magic.spells.map(spell=>spell.id),character.combatProfile.magic.spells.map(spell=>spell.id));
 assert.deepEqual(Object.keys(patch.combatProfile.magic),['spells']);
 assert.equal(patch.inventory,undefined);assert.equal(patch.combatProfile.hitPoints,undefined);assert.equal(patch.combatProfile.resources,undefined);
});
test('Gawain loses only the explicitly obsolete personality malus while his scent ability and used resources survive',()=>{
 const character=records.find(character=>character.name==='Gawain Draig'),assignment=REVIEWED_CHARACTER_TRAITS.find(a=>a.onlineId===character.id);
 const plan=planCharacterTraitPublication({character,assignment,baseline:character,now});
 assert.deepEqual(plan.character.combatProfile.quirks.map(trait=>trait.name),['Neugier vor Vorsicht','Eigensinn']);
 assert(!plan.character.combatProfile.abilities.some(ability=>ability.id==='gawain-muttersoehnchen'));
 assert.deepEqual(plan.character.combatProfile.abilities.find(ability=>ability.id==='gawain-liebt-duefte'),character.combatProfile.abilities.find(ability=>ability.id==='gawain-liebt-duefte'));
 assert(!plan.character.combatProfile.conditions.some(condition=>condition.id==='gawain-strenge-gerueche'));
});
test('Gildas keeps his actual personal ring effect and stable ability identity with Gafyr labels and artwork',()=>{
 const character=records.find(character=>character.name==='Gildas Gafyr'),assignment=REVIEWED_CHARACTER_TRAITS.find(a=>a.onlineId===character.id);
 const plan=planCharacterTraitPublication({character,assignment,baseline:character,now});
 const before=character.combatProfile.abilities.find(ability=>ability.id==='gildas-gafyr-draig-knight-signet');
 const after=plan.character.combatProfile.abilities.find(ability=>ability.id===before.id);
 assert.equal(after.name,'Gildas Siegelring');assert.match(after.icon,/haus-gafyr/);
 assert.doesNotMatch(after.description+after.requirements+after.tags,/Draig/);
 assert.deepEqual(after.mechanics,before.mechanics);
 assert.deepEqual(after.triggerRules.map(rule=>rule.effects),before.triggerRules.map(rule=>rule.effects));
});
test('An intervening unreviewed trait edit is not silently overwritten',()=>{
 const assignment=REVIEWED_CHARACTER_TRAITS[0],baseline=records.find(character=>character.id===assignment.onlineId),character=structuredClone(baseline);
 character.combatProfile.quirks.push({id:'new-user-choice',name:'Eigene neue Wahl'});
 assert.throws(()=>planCharacterTraitPublication({character,assignment,baseline,now}),/inzwischen|seit der/);
});

test('Already reviewed leaves with the old pre-review revision receive a one-time confirmation',()=>{
 const assignment=REVIEWED_CHARACTER_TRAITS.find(a=>a.name==='Gawain Draig');
 const baseline=records.find(record=>record.id===assignment.onlineId);
 const first=planCharacterTraitPublication({character:baseline,assignment,baseline,now});
 const unstamped={...first.character,combatProfile:{...first.character.combatProfile,revision:baseline.combatProfile.revision}};
 const confirmation=planCharacterTraitPublication({character:unstamped,assignment,baseline,now});
 assert.deepEqual(confirmation.fieldPaths,['combatProfile.revision','updatedAt']);
 assert(confirmation.character.combatProfile.revision>baseline.combatProfile.revision);
 assert.equal(planCharacterTraitPublication({character:confirmation.character,assignment,baseline,now}).changed,false);
});
