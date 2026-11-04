import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { PSYCHOLOGICAL_TRAIT_DEFINITIONS } from '../modules/character-development/development-psychological-traits.js';
import { renderDevelopmentTraits, updateDevelopmentSelection } from '../modules/character-development/development-ui.js';
import { previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile, getEffectiveCombatAttribute, getAttributeModifier, getSkillTotal, getSavingThrowTotal, getSpellcastingValues } from '../modules/combat/combat-profile-model.js';
import { buildCombatProfileAiSnapshot } from '../modules/combat/combat-profile-context.js';
import { createCharacterArchiveProfileItem, extractCharacterArchiveEntries } from '../modules/character-archive/character-archive-model.js';
import { resolveAttributeCheckModifier } from '../modules/skill-checks/attribute-check-model.js';
import { sanitizeCharacterCombatProfile as serverSanitize, getEffectiveCombatAttribute as serverAttribute, getSkillTotal as serverSkill } from '../../firebase/functions/src/generated/combat/combat-profile-model.js';

const trait = id => DEVELOPMENT_TRAITS.find(entry => entry.id === `development-trait-${id}`);
const base = () => sanitizeCharacterCombatProfile({ progression: { level: 1, development: { mode: 'purchase' } }, hitPoints: { current: 4, maximumOverride: 30 },
  attributes: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(key => ({ key, score: 11 })),
  magic: { enabled: true, castingAttribute: 'intelligence' } });
const choose = (ids, source = base()) => previewCharacterLevelUp(source, { targetLevel: 1, traitIds: ids.map(id => `development-trait-${id}`) });
const skill = (profile, name, attributeKey = 'intelligence') => getSkillTotal(profile, { name, attributeKey, proficiency: 'none', bonus: 0 });

test('all seven requested psychological traits have their own PNGs, web icons and shared filter', async () => {
  assert.equal(PSYCHOLOGICAL_TRAIT_DEFINITIONS.length, 7);
  const ids = PSYCHOLOGICAL_TRAIT_DEFINITIONS.map(([id]) => id);
  for (const id of ids) {
    assert.ok(trait(id).tags.includes('Psychologische Prägung'));
    await access(new URL(`../assets/development-traits/${id}.png`, import.meta.url));
    await access(new URL(`../assets/development-traits/web/${id}.webp`, import.meta.url));
  }
  const preview = previewCharacterLevelUp(base(), { targetLevel: 1, traitGroup: 'psychological' });
  assert.equal((renderDevelopmentTraits(preview.plan).match(/data-development-trait=/g) || []).length, 7);
});
test('eidetic memory supports known information without raising intelligence or medical training', () => {
  const source = base(), result = choose(['eidetisches-gedaechtnis'], source).profile;
  assert.equal(getEffectiveCombatAttribute(result, 'intelligence').score, 11);
  assert.equal(skill(result, 'Geschichte'), skill(source, 'Geschichte') + 2);
  assert.equal(skill(result, 'Arkane Kunde'), skill(source, 'Arkane Kunde') + 1);
  assert.equal(skill(result, 'Heilkunde', 'wisdom'), skill(source, 'Heilkunde', 'wisdom'));
  assert.deepEqual(result.attributes, source.attributes);
});
test('genius raises intelligence and investigation while leaving physical attributes and unrelated skills alone', () => {
  const source = base(), result = choose(['genie'], source).profile;
  for (const attribute of source.attributes) assert.equal(getEffectiveCombatAttribute(result, attribute.key).score, attribute.score + (attribute.key === 'intelligence' ? 2 : 0));
  for (const entry of source.skills) {
    const before = getAttributeModifier(getEffectiveCombatAttribute(source, entry.attributeKey));
    const after = getAttributeModifier(getEffectiveCombatAttribute(result, entry.attributeKey));
    assert.equal(getSkillTotal(result, entry), getSkillTotal(source, entry) + (entry.name === 'Nachforschungen' ? 1 : 0) + after - before, entry.name);
  }
  for (const key of ['attributes', 'skills', 'weapons', 'armorItems', 'resources', 'abilities', 'techniques', 'templateSelections']) assert.deepEqual(result[key], source[key], key);
  assert.equal(result.hitPoints.current, source.hitPoints.current);
});
test('a hard mental ceiling survives high base scores, bonus traits, conditions and free modifier overrides', () => {
  const source = base();
  for (const attribute of source.attributes) if (['intelligence', 'wisdom'].includes(attribute.key)) { attribute.score = 40; attribute.modifierOverride = 20; }
  const result = choose(['geistig-beschraenkt', 'genie', 'eidetisches-gedaechtnis'], source).profile;
  result.conditions.push({ id: 'temporary-mind', active: true, mechanics: { attributeModifiers: [{ attributeKey: 'intelligence', bonus: 30 }] } });
  for (const key of ['intelligence', 'wisdom']) {
    const effective = getEffectiveCombatAttribute(result, key);
    assert.equal(effective.score, 3); assert.equal(getAttributeModifier(effective), -4);
    assert.equal(result.attributes.find(attribute => attribute.key === key).score, 40);
  }
  const ai = buildCombatProfileAiSnapshot({ id: 'actor', combatProfile: result });
  const intelligence = ai.attributes.find(attribute => attribute.key === 'intelligence');
  assert.equal(intelligence.score, 3); assert.equal(intelligence.modifier, -4); assert.equal(intelligence.modifierOverride, -4);
});
test('cognitive variants do not stack penalties or grant the same restriction twice', () => {
  const result = choose(['geistig-beschraenkt', 'vollidiot']);
  assert.equal(result.ready, true); assert.equal(result.balance.traitCost, -10);
  assert.equal(getEffectiveCombatAttribute(result.profile, 'intelligence').score, 2);
  assert.equal(skill(result.profile, 'Nachforschungen'), -10);
  assert.equal(skill(result.profile, 'Athletik', 'strength'), -6);
  assert.ok(result.balance.warnings.some(warning => warning.includes('Alternative Ausprägungen')));
});
test('removing or deactivating a trait restores base-derived values and repeated normalization never doubles its bonus', () => {
  const first = choose(['genie', 'geistig-beschraenkt']).profile;
  for (let iteration = 0; iteration < 5; iteration++) {
    const current = sanitizeCharacterCombatProfile(first);
    assert.equal(getEffectiveCombatAttribute(current, 'strength').score, 11);
    assert.equal(getEffectiveCombatAttribute(current, 'intelligence').score, 3);
    assert.equal(current.attributes[0].score, 11);
  }
  const inactive = structuredClone(first); inactive.quirks.find(entry => entry.name === 'Geistig beschränkt').active = false;
  assert.equal(getEffectiveCombatAttribute(inactive, 'intelligence').score, 13);
  const removed = previewCharacterLevelUp(first, { targetLevel: 1, traitIds: [] }).profile;
  assert.equal(getEffectiveCombatAttribute(removed, 'intelligence').score, 11);
  assert.deepEqual(removed.attributes, base().attributes);
});
test('emotional and social game traits never grant automatic detective expertise', () => {
  const analytical = choose(['psychopath']).profile, detached = choose(['soziopath']).profile;
  assert.equal(skill(analytical, 'Nachforschungen'), 0);
  assert.equal(skill(analytical, 'Überreden', 'charisma'), 0);
  assert.equal(getSavingThrowTotal(analytical, 'wisdom', { saveTags: ['fear'] }), 1);
  assert.equal(skill(detached, 'Nachforschungen'), 0);
  assert.equal(skill(detached, 'Überreden', 'charisma'), -1);
  assert.equal(skill(detached, 'Motiv erkennen', 'wisdom'), -1);
  assert.equal(skill(detached, 'Auftreten', 'charisma'), 0);
});
test('narcissistic self-assertion and its interpersonal penalties are separate actual modifiers', () => {
  const result = choose(['narzisstisch']).profile;
  assert.equal(skill(result, 'Auftreten', 'charisma'), 1);
  assert.equal(skill(result, 'Einschüchtern', 'charisma'), 0);
  assert.equal(skill(result, 'Überzeugen', 'charisma'), -1);
  assert.equal(getSavingThrowTotal(result, 'charisma'), 1);
});
test('selection replaces the cognitive alternative and warns about capped genius without blocking negative balances', () => {
  const plan = { traitIds: [trait('geistig-beschraenkt').id] };
  updateDevelopmentSelection(plan, { checked: true, dataset: { developmentTrait: trait('vollidiot').id } });
  assert.deepEqual(plan.traitIds, [trait('vollidiot').id]);
  const result = choose(['genie', 'geistig-beschraenkt']);
  assert.equal(result.ready, true); assert.ok(result.balance.warnings.some(warning => warning.includes('Obergrenze')));
  const expensive = choose(['genie']);
  assert.ok(expensive.balance.remaining < 0); assert.equal(expensive.ready, true);
});
test('archive copies preserve cap rules, references and the stronger-variant policy', () => {
  const original = choose(['geistig-beschraenkt', 'vollidiot']).profile;
  const archived = extractCharacterArchiveEntries({ id: 'test', name: 'Test', combatProfile: original })
    .filter(entry => entry.kind === 'trait').map(entry => createCharacterArchiveProfileItem(entry, 'quirks'));
  const result = sanitizeCharacterCombatProfile({ ...base(), quirks: archived });
  assert.equal(getEffectiveCombatAttribute(result, 'intelligence').score, 2);
  assert.equal(skill(result, 'Nachforschungen'), -10);
});
test('mental caps govern spellcasting, attribute checks and saves with the same effective score', () => {
  const source = base(), result = choose(['geistig-beschraenkt'], source).profile;
  assert.equal(getSpellcastingValues(result).attack, getSpellcastingValues(source).attack - 4);
  assert.equal(getSavingThrowTotal(result, 'wisdom'), -4);
  assert.equal(resolveAttributeCheckModifier(result, { id: 'attribute:intelligence', checkType: 'attribute', attributeKey: 'intelligence', attributeLabel: 'Intelligenz' }).modifier, -8);
});
test('new rules survive the server boundary and invalid attribute keys cannot become strength effects', () => {
  for (const [id] of PSYCHOLOGICAL_TRAIT_DEFINITIONS) {
    const source = choose([id]).profile, server = serverSanitize(source);
    assert.deepEqual(server, sanitizeCharacterCombatProfile(source), id);
    for (const attribute of source.attributes) assert.deepEqual(serverAttribute(server, attribute.key), getEffectiveCombatAttribute(source, attribute.key));
    for (const entry of source.skills) assert.equal(serverSkill(server, entry), getSkillTotal(source, entry));
  }
  const invalid = sanitizeCharacterCombatProfile({ ...base(), quirks: [{ id: 'invalid', active: true, mechanics: { attributeCaps: [{ attributeKey: 'invalid', maximum: 1 }, { attributeKey: 'intelligence', maximum: 'bad' }], attributeModifiers: [{ attributeKey: 'invalid', bonus: 30 }] } }] });
  assert.equal(getEffectiveCombatAttribute(invalid, 'strength').score, 11);
  assert.equal(getEffectiveCombatAttribute(invalid, 'intelligence').score, 11);
});
