import test from 'node:test';
import assert from 'node:assert/strict';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { getSkillRollContext, SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { normalizeSkillCheckSettings } from '../modules/skill-checks/skill-check-model.js';
import { ProvidedDiceAdapter } from '../../firebase/functions/src/mechanics/provided-dice-adapter.js';

const actor = (...ids) => resolveCombatProfile({ id: 'roller', name: 'Würfelnde Figur', combatProfile: {
  quirks: ids.map(id => DEVELOPMENT_TRAITS.find(entry => entry.id === `development-trait-${id}`)),
  weapons: [{ name: 'Eigene Flammenklinge', damageType: 'feuer', equipped: true }]
} });
function context(profile, saveContext = {}, options = {}) {
  return getSkillRollContext({ actor: profile, settings: { skillId: 'save:dexterity', saveContext } }, { actorProfile: profile, ...options });
}
test('standalone elemental saves use their stated danger, never the roller weapon', () => {
  const profile = actor('feuer-phobie');
  assert.equal(context(profile).rollMode, 'normal');
  assert.equal(context(profile, { damageType: 'feuer' }).rollMode, 'disadvantage');
  assert.equal(context(profile, { damageType: 'kälte' }).rollMode, 'normal');
  assert.equal(context(profile, { damageType: 'feuer' }, { ruleSources: [{ actorId: 'roller', profile,
    sourceRole: 'actor', relationToActor: 'self', relationToTarget: 'enemy', distanceToActor: 0 }] }).rollMode, 'disadvantage');
});
test('magic phobia applies to magical standalone saves and never to a non-save check', () => {
  const profile = actor('magie-phobie');
  for (const actionKind of ['spell', 'prayer', 'song']) assert.equal(context(profile, { actionKind }).rollMode, 'disadvantage');
  assert.equal(context(profile, { actionKind: 'weapon' }).rollMode, 'normal');
  const skill = getSkillRollContext({ actor: profile, settings: { skillId: 'investigation', saveContext: { actionKind: 'spell' } } }, { actorProfile: profile });
  assert.equal(skill.rollMode, 'normal');
});
test('fear, poison, bleeding, prone and movement save modifiers use typed context', () => {
  const profile = actor('mutig', 'giftfest');
  const base = context(profile).skill.modifier;
  assert.equal(context(profile, { saveTags: ['fear'] }).skill.modifier - base, 2);
  assert.equal(context(profile, { damageType: 'gift' }).skill.modifier - base, 1);
  const custom = resolveCombatProfile({ id: 'custom', combatProfile: { quirks: [{ name: 'Gezielte Rettung', active: true,
    mechanics: { saveModifiers: [{ kind: 'bleeding', bonus: -2 }, { kind: 'prone', bonus: 2 }, { kind: 'forced-movement', bonus: 2 }] } }] } });
  const customBase = context(custom).skill.modifier;
  assert.equal(context(custom, { saveTags: ['bleeding'] }).skill.modifier - customBase, -2);
  assert.equal(context(custom, { saveTags: ['prone', 'forced-movement'] }).skill.modifier - customBase, 2);
});
test('fire familiarity changes only the appropriate save and is not damage resistance', () => {
  const profile = actor('glutgewoehnt');
  assert.equal(context(profile).preEffects.savingThrowModifier, 0);
  assert.equal(context(profile, { damageType: 'feuer' }).preEffects.savingThrowModifier, 1);
  assert.equal(profile.damageAffinities.some(entry => entry.response === 'resistant'), false);
});
test('standalone save context persists in the receipt and replays identically on the server', async () => {
  const profile = actor('feuer-phobie', 'mutig');
  const settings = { skillId: 'save:dexterity', saveContext: { actionKind: 'spell', damageType: 'feuer', saveTags: ['fear'] }, difficulty: 10 };
  const dice = { async rollSkill({ modifier, rollMode }) {
    assert.equal(rollMode, 'disadvantage');
    return { id: 'save', natural: 8, dice: [8, 14], keptDice: [8], total: 8 + modifier };
  } };
  const result = await new SkillResolutionService(dice).resolve({ actor: profile, settings }, { actorProfile: profile });
  assert.deepEqual(result.saveContext, settings.saveContext);
  const replay = await new SkillResolutionService(new ProvidedDiceAdapter(result)).resolve({ actor: profile, settings }, { actorProfile: profile });
  assert.equal(replay.total, result.total);
  assert.equal(replay.outcome, result.outcome);
});
test('save context normalizes only supported typed causes and deduplicates tags', () => {
  assert.deepEqual(normalizeSkillCheckSettings({ saveContext: { actionKind: 'invented', damageType: 'invented', saveTags: ['fear', 'fear', 'invented'] } }).saveContext,
    { actionKind: '', damageType: '', saveTags: ['fear'] });
});
