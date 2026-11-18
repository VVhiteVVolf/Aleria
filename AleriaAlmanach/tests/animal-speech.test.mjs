import assert from 'node:assert/strict';
import test from 'node:test';
import { ANIMAL_SPEECH_TRAIT_ID, canSpeakWithAnimals } from '../modules/character-development/development-animal-speech.js';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { getChecksForCommentKind, getCheckCommentKind } from '../modules/skill-checks/skill-check-model.js';
import { getSkillRollContext, SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';

const trait = DEVELOPMENT_TRAITS.find(item => item.id === ANIMAL_SPEECH_TRAIT_ID);
const actor = (quirks = []) => ({ id: 'local-speaker', name: 'Lokale Testfigur', combatProfile: {
  attributes: [{ key: 'wisdom', score: 14 }], skills: [{ name: 'Mit Tieren umgehen', attributeKey: 'wisdom', proficiency: 'trained' }], quirks
} });

test('the catalog trait is selectable and only an active matching identity grants animal speech', () => {
  assert(trait); assert.equal(trait.name, 'Kann mit Tieren sprechen');
  assert.match(trait.icon, /kann-mit-tieren-sprechen\.webp$/);
  assert.equal(canSpeakWithAnimals(actor([trait])), true);
  assert.equal(canSpeakWithAnimals(actor([{ ...trait, active: false }])), false);
  assert.equal(canSpeakWithAnimals(actor([{ name: trait.name, id: 'a-different-trait' }])), false);
  assert.equal(canSpeakWithAnimals(null), false);
});

test('speech, whisper and shout permit ordinary animal handling without the speech trait', () => {
  for (const commentKind of ['speech', 'whisper', 'shout']) {
    assert(getChecksForCommentKind(commentKind).some(check => check.id === 'animal-handling'));
    const context = getSkillRollContext({ actor: actor(), settings: { skillId: 'animal-handling' } }, { commentKind });
    assert.equal(context.rollMode, 'normal');
  }
  assert.equal(getCheckCommentKind('animal-handling'), 'speech');
});

test('the character sheet can select, save, reload and remove the new trait through its existing development flow', () => {
  const original = sanitizeCharacterCombatProfile({ progression:{ level:1 }, quirks:[] });
  const before = structuredClone(original);
  const selected = previewCharacterLevelUp(original, { targetLevel:1, traitIds:[ANIMAL_SPEECH_TRAIT_ID] });
  assert.equal(selected.ready, true);
  const restored = sanitizeCharacterCombatProfile(JSON.parse(JSON.stringify(selected.profile)));
  assert.equal(canSpeakWithAnimals(restored), true);
  const removed = previewCharacterLevelUp(restored, { targetLevel:1, traitIds:[] });
  assert.equal(removed.ready, true); assert.equal(canSpeakWithAnimals(removed.profile), false);
  assert.deepEqual(original, before);
});

test('Tiersprache requires the trait and grants advantage only to its animal handling check', () => {
  assert.throws(() => getSkillRollContext({ actor: actor(), settings: { skillId: 'animal-handling' } }, { commentKind: 'animal' }), /Merkmal/);
  const speaker = actor([trait]);
  const context = getSkillRollContext({ actor: speaker, settings: { skillId: 'animal-handling' } }, { commentKind: 'animal' });
  assert.equal(context.rollMode, 'advantage');
  assert.equal(context.animalSpeechAdvantage, true);
  assert.equal(getSkillRollContext({ actor: speaker, settings: { skillId: 'animal-handling' } }, { commentKind: 'speech' }).rollMode, 'normal');
  assert.equal(getSkillRollContext({ actor: speaker, settings: { skillId: 'medicine' } }, { commentKind: 'animal' }).animalSpeechAdvantage, false);
});

test('a real Tiersprache resolution rolls with advantage and retains an auditable reason', async () => {
  const modes = [];
  const service = new SkillResolutionService({ async rollSkill({ modifier, rollMode }) {
    modes.push(rollMode);
    return { id: 'local-roll', natural: 17, dice: [4, 17], keptDice: [17], total: 17 + modifier };
  } });
  const result = await service.resolve({ actor: actor([trait]), settings: { skillId: 'animal-handling', difficulty: 12 } }, { commentKind: 'animal' });
  assert.deepEqual(modes, ['advantage']);
  assert.equal(result.animalSpeechAdvantage, true);
  assert.equal(result.rollMode, 'advantage');
  assert.equal(result.natural, 17);
  assert.deepEqual(result.diceResults, [4, 17]);
});
