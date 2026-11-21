import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createCombatParty } from './combat-party-context.mjs';
import { actorRecords, database, undo } from './combat-test-context.mjs';
import { createFormOpponent } from './combat-class-form-fixtures.mjs';
import { getCenyrTechniqueChoiceGroups, selectCenyrTechniqueForSlot } from '../../../../AleriaAlmanach/modules/classes/cenyr/cenyr-technique-selection.js';
import { sanitizeCharacterCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-model.js';

after(() => database.terminate());

const resultOf = receipt => receipt.mechanics.commentSegments.at(-1).combatResolution;
const classRules = receipt => receipt.ruleApplications.filter(rule => rule.entryKind === 'class-passive');
const techniqueId = name => `technique:combat-style-drachentanz-jungdrache-${name}`;

test('an older Gawain record earns prepared replies and rank-30 damage through a real commit and undo', async () => {
  const gawain = structuredClone(actorRecords.find(actor => actor.name === 'Gawain Draig'));
  const opponent = actorRecords.find(actor => actor.name === 'Gildas Gafyr');
  assert.ok(gawain && opponent);
  Object.assign(gawain.combatProfile.progression, { level: 20, specialLevels: 10 });
  const party = await createCombatParty([{ key: 'gawain', actor: gawain, team: 'Draig' },
    { key: 'opponent', actor: opponent, team: 'Gafyr' }], 'Teulu-Schwertantwort und Sonderstufe');
  const original = await party.record('gawain');
  const action = (actor, target, actionId) => party.prepare({ actor, targets: [target], actionId, natural: 18 });
  const guard = await party.commit(await action('gawain', 'gawain', techniqueId('geschlossene-schuppe')));
  assert.ok(classRules(resultOf(guard)).some(rule => rule.ruleId.startsWith('guard:')));

  const enemy = await party.commit(await action('opponent', 'gawain', ''));
  assert.ok(classRules(resultOf(enemy)).some(rule => rule.ruleId.startsWith('observe-attack:')));
  const before = await party.snapshot();
  const response = await action('gawain', 'opponent', techniqueId('sicherer-drachenhieb'));
  const committed = await party.commit(response);
  const receipt = resultOf(committed);
  assert.equal(receipt.rulesVersion, 'combat-evaluation-18');
  assert.match(receipt.damage.notation, /1[dW]8\+1[dW]10\+1[dW]6/i);
  assert.equal(classRules(receipt).find(rule => rule.ruleId.startsWith('answer:')).effects.attackModifier, 1);
  assert.equal(classRules(receipt).find(rule => rule.ruleId.startsWith('answer-damage:')).effects.damageModifier, 2);
  assert.deepEqual(receipt.resourceCosts, response.segment.combatResolution.resourceCosts);
  const stored = await party.record('gawain');
  for (const field of ['techniques', 'classTraining', 'templateSelections', 'weapons', 'armorItems', 'magic', 'progression']) {
    assert.deepEqual(stored.combatProfile[field], original.combatProfile[field]);
  }
  assert.deepEqual(stored.inventory, original.inventory);
  await undo(committed.id);
  const restored = await party.assertConsistent();
  assert.equal(restored.profiles.get('opponent').currentHitPoints, before.profiles.get('opponent').currentHitPoints);
  assert.deepEqual(restored.profiles.get('gawain').temporaryConditions, before.profiles.get('gawain').temporaryConditions);
});

test('gespeicherte Schildablenkung verhindert die geschlossene Schwertantwort auf Stufe 10', async () => {
  const party = await createCombatParty([{ key: 'gawain', slug: 'gawain-draig', level: 10, team: 'Draig' },
    { key: 'rhiannon', slug: 'rhiannon-draig', team: 'Gegner' }]);
  const act = async (actor, target, actionId = '') => resultOf(await party.commit(await party.prepare({ actor, targets: [target], actionId, natural: 18 })));
  await act('gawain', 'gawain', techniqueId('geschlossene-schuppe'));
  assert(classRules(await act('rhiannon', 'gawain')).some(rule => rule.ruleId.startsWith('observe-attack:')));
  await act('rhiannon', 'rhiannon', 'spell:rhiannon-schild');
  const response = await act('gawain', 'rhiannon', techniqueId('sicherer-drachenhieb'));
  assert.equal(response.wardResolution?.deflected, true);
  assert.equal(response.attack.hit, false);
  assert.equal(classRules(response).some(rule => rule.ruleId.startsWith('closed-guard:')), false);
  const next = await act('rhiannon', 'gawain');
  assert.equal(next.ruleApplications.some(rule => rule.ruleId === 'cp-teulu-closed-attack'), false);
  await party.assertConsistent();
});

test('gespeicherte Nadelwehr behält bei Ablenkung ihre +2 RK und verleiht keinen Linienschutz', async () => {
  const id = 'combat-style-drachentanz-cantref-schwertdrache-nadelwehr';
  const cantref = createFormOpponent('line-guard');
  cantref.combatProfile = sanitizeCharacterCombatProfile({ ...cantref.combatProfile,
    identity: { ancestry: 'Cenyr', archetype: 'cantref' }, templateSelections: { classId: 'cantref' }, progression: { level: 8 },
    weapons: [{ id: 'speer', name: 'Speer', weaponType: 'spear', damageType: 'stich', range: 'Nahkampf', equipped: true, damageFormula: '1d8' }]
  });
  const group = getCenyrTechniqueChoiceGroups(cantref.combatProfile, 8, { allEarned: true }).find(item => item.options.some(option => option.id === id));
  assert(group);
  const learned = selectCenyrTechniqueForSlot(cantref.combatProfile, { slotId: group.slotId, techniqueId: id, selectedAtLevel: 8 });
  assert(learned.ok, learned.errors.join(' '));
  cantref.combatProfile = learned.profile;
  const party = await createCombatParty([{ key: 'cantref', actor: cantref, team: 'a' },
    { key: 'rhiannon', slug: 'rhiannon-draig', team: 'b' }]);
  const act = async (actor, target, actionId = '') => resultOf(await party.commit(await party.prepare({ actor, targets: [target], actionId, natural: 18 })));
  await act('rhiannon', 'rhiannon', 'spell:rhiannon-schild');
  const thrust = await act('cantref', 'rhiannon', `technique:${id}`);
  assert.equal(thrust.wardResolution?.deflected, true);
  assert.equal(thrust.attack.hit, false);
  assert(thrust.actorConditionSnapshot.after.some(condition => condition.name === 'Nadelwehr' && condition.mechanics.armorClass === 2));
  assert.equal(thrust.actorConditionSnapshot.after.some(condition => condition.sourceConditionId === 'cp-cantref-guard'), false);
  const next = await act('rhiannon', 'cantref');
  assert.equal(classRules(next).some(rule => rule.ruleId.startsWith('line:')), false);
  await party.assertConsistent();
});

test('Rhyfelwyr wendet Fassung unter Druck serverseitig auf eine direkte Furchtrettung an', async () => {
  const caster = createFormOpponent('fear-caster');
  caster.combatProfile.abilities = [{ id: 'fear', name: 'Prüfzauber', active: true, combatUsable: true, delivery: 'spell',
    resolutionType: 'saving-throw', saveAttribute: 'willpower', saveDc: 12, costs: [{ resourceId: 'action', amount: 1 }], effects: [{
      id: 'furcht', type: 'debuff', target: 'target', on: 'save-failure', condition: { id: 'frightened', tags: 'fear', name: 'Furcht' }
    }] }];
  caster.combatProfile.magic = { enabled: true, spellSaveDcOverride: 12 };
  const veteran = createFormOpponent('fear-veteran');
  veteran.combatProfile.identity = { archetype: 'rhyfelwyr' };
  veteran.combatProfile.progression.level = 14;
  const party = await createCombatParty([{ key: 'caster', actor: caster, team: 'a' }, { key: 'veteran', actor: veteran, team: 'b' }]);
  const prepared = await party.prepare({ actor: 'caster', targets: ['veteran'], actionId: 'ability:fear', natural: 10 });
  const saved = await party.commit(prepared);
  const resolution = resultOf(saved);
  assert.equal(resolution.attack.modifier, prepared.segment.combatResolution.attack.modifier);
  assert.equal(classRules(resolution).find(rule => rule.ruleId === 'steadfast:once')?.effects.savingThrowModifier, 2);
  assert.equal(resolution.attack.saveSucceeded, true);
  assert.equal((await party.assertConsistent()).profiles.get('veteran').temporaryConditions.some(condition => condition.name === 'Furcht'), false);
});
