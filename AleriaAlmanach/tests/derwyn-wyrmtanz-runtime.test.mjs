import test from 'node:test';
import assert from 'node:assert/strict';
import { getDerwynExpertTechniques } from '../modules/combat-styles/sirenentanz/derwyn-techniques.js';
import { DERWYN_FORM_IDS as F } from '../modules/combat-styles/sirenentanz/sirenentanz-forms.js';
import { getCenyrTechniqueChoiceGroups, selectCenyrTechniqueForSlot } from '../modules/classes/cenyr/cenyr-technique-selection.js';
import { selectCenyrTrainingOption } from '../modules/classes/cenyr/cenyr-class-training.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';

class Dice {
  constructor() { this.damageRolls = 0; this.attackRolls = 0; }
  async rollAttack({ modifier = 0 }) { this.attackRolls++; return { natural: 15, dice: [15], keptDice: [15], total: 15 + modifier }; }
  async rollDamage({ damageFormula, bonus = 0 }) { this.damageRolls++; return { notation: damageFormula, keptDice: [4], total: 4 + bonus, modifier: bonus }; }
  async rollSavingThrow({ modifier = 0 }) { return { natural: 1, dice: [1], keptDice: [1], total: 1 + modifier }; }
}

function trainedCharacter(formId, slugs, weaponId) {
  const weaponTypes = { sword: 'sword', staff: 'staff', trident: 'spear', morningstar: 'mace' };
  let profile = sanitizeCharacterCombatProfile({
    identity: { archetype: 'Derwyn', ancestry: 'Vennyr' }, templateSelections: { classId: 'derwyn' },
    progression: { level: 20 }, hitPoints: { current: 80, maximumOverride: 80 },
    combat: { mainHandWeaponId: weaponId },
    weapons: Object.entries(weaponTypes).map(([id, weaponType]) => ({ id, name: id, weaponType, weaponProfileId: id,
      damageFormula: '1d8', damageType: 'physisch', equipped: id === weaponId }))
  });
  for (const [kind, selectionId] of [['foundation', F.foundation], ['path', formId]]) {
    const choice = selectCenyrTrainingOption(profile, { kind, selectionId, selectedAtLevel: kind === 'foundation' ? 1 : 9 });
    assert(choice.ok, choice.errors.join(' '));
    profile = choice.profile;
  }
  for (const slug of slugs) {
    const techniqueId = `combat-style-sirenentanz-derwyn-${slug}`;
    const group = getCenyrTechniqueChoiceGroups(profile, 20, { allEarned: true }).find(group => group.slot.band === 'expert'
      && !profile.classTraining.techniqueSelections.some(selection => selection.slotId === group.slotId)
      && group.options.some(option => option.id === techniqueId));
    assert(group, `Available slot for ${slug}`);
    const selection = selectCenyrTechniqueForSlot(profile, { slotId: group.slotId, techniqueId, selectedAtLevel: 20 });
    assert(selection.ok, selection.errors.join(' '));
    profile = selection.profile;
  }
  return { id: 'derwyn-runtime', name: 'Derwyn', combatProfile: profile };
}

const action = (character, slug) => resolveCombatProfile(character, { actionId: `technique:combat-style-sirenentanz-derwyn-${slug}` });

test('different Wyrm guards refresh one real defense effect, pay costs and expire on the next own comment', async () => {
  const character = trainedCharacter(F.flowing, ['wartende-klinge', 'unbewegte-schwerthut'], 'sword');
  const firstActor = action(character, 'wartende-klinge');
  const dice = new Dice();
  const service = new CombatResolutionService(dice);
  const first = await service.resolveAttack({ actor: firstActor, target: firstActor });
  const firstComments = [{ id: 'first-guard', commentSegments: [{ combatResolution: first }] }];
  const firstState = deriveCombatStateFromComments(firstComments).get(character.id);
  assert.equal(firstState.temporaryConditions.length, 1);
  assert.equal(firstState.temporaryConditions[0].mechanics.armorClass, 1);
  assert.equal(firstState.temporaryConditions[0].sourceConditionId, 'wyrmtanz-derwyn-guard');
  const secondBase = action(character, 'unbewegte-schwerthut');
  const secondActor = overlayCombatHitPointState(secondBase, firstState);
  const second = await service.resolveAttack({ actor: secondActor, target: secondActor });
  assert.equal(second.targetConditionSnapshot.after.length, 1, 'Second named guard replaces the shared source instead of stacking');
  assert.equal(second.targetConditionSnapshot.after[0].mechanics.armorClass, 2);
  assert.equal(dice.attackRolls, 0, 'A guard does not perform a concealed attack roll');
  assert.equal(dice.damageRolls, 0);
  assert(first.actorResourceSnapshot.changes.some(change => change.resourceId === 'reaction' || change.id === 'reaction'));
  assert(second.actorResourceSnapshot.changes.length >= 2, 'Preparation costs reaction and bonus action');
  const comments = [{ id: 'one-own-contribution', commentSegments: [{ combatResolution: first }, { combatResolution: second }] }];
  let state = deriveCombatStateFromComments(comments).get(character.id);
  assert.equal(overlayCombatHitPointState(secondBase, state).totalDefense, secondBase.totalDefense + 2);
  comments.push({ id: 'other-comment', characterId: 'someone-else' });
  assert.equal(deriveCombatStateFromComments(comments).get(character.id).temporaryConditions.length, 1);
  comments.push({ id: 'next-own-comment', characterId: character.id });
  state = deriveCombatStateFromComments(comments).get(character.id);
  assert.equal(state.temporaryConditions.length, 0);
  assert.equal(overlayCombatHitPointState(secondBase, state).totalDefense, secondBase.totalDefense);
});

test('all four Wyrm weapons execute one damaging attack with real resource use and no additional spell', async () => {
  const cases = [
    [F.flowing, 'fliessende-antwort', 'sword'], [F.breaking, 'drang-der-zinken', 'trident'],
    [F.rising, 'saphirkreis', 'staff'], [F.whipping, 'peitschender-auftakt', 'morningstar']
  ];
  const target = resolveCombatProfile({ id: 'wyrm-target', name: 'Ziel', combatProfile: {
    hitPoints: { current: 80, maximumOverride: 80 }, armorClass: { override: 8 }
  } });
  for (const [formId, slug, weaponId] of cases) {
    const character = trainedCharacter(formId, [slug], weaponId);
    const actor = action(character, slug);
    const dice = new Dice();
    const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
    assert.equal(result.attack.hit, true, slug);
    assert.equal(dice.attackRolls, 1, slug);
    assert.equal(dice.damageRolls, 1, slug);
    assert(result.actorResourceSnapshot.changes.length > 0, slug);
    assert(result.damage.total > 0, slug);
    assert.equal(getDerwynExpertTechniques().find(attack => attack.id.endsWith(slug)).followUpAttack.enabled, false);
    if (slug === 'drang-der-zinken') {
      const comments = [{ id: 'binding-hit', commentSegments: [{ combatResolution: result }] }];
      const state = deriveCombatStateFromComments(comments).get(target.characterId);
      assert.equal(state.temporaryConditions[0].sourceConditionId, 'wyrmtanz-derwyn-rhythm-penalty');
      assert.equal(overlayCombatHitPointState(target, state).attackModifier, target.attackModifier - 1);
      comments.push({ id: 'attacker-continues', characterId: actor.characterId });
      assert.equal(deriveCombatStateFromComments(comments).get(target.characterId).temporaryConditions.length, 1);
      comments.push({ id: 'target-contributes', characterId: target.characterId });
      assert.equal(deriveCombatStateFromComments(comments).get(target.characterId).temporaryConditions.length, 0);
    }
  }
});
