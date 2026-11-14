import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { getSpiritualTraitOrigin, SPIRITUAL_TRAIT_DEFINITIONS } from '../modules/character-development/development-spiritual-traits.js';
import { renderDevelopmentTraits, updateDevelopmentSelection } from '../modules/character-development/development-ui.js';
import { createCharacterLevelUpPlan, previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { applyDevelopmentChoices } from '../modules/character-development/development-purchases.js';
import { createCharacterArchiveProfileItem, extractCharacterArchiveEntries } from '../modules/character-archive/character-archive-model.js';
import { buildSceneRestParticipant } from '../modules/scene-rest/scene-rest-model.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';

const entries = DEVELOPMENT_TRAITS.filter(getSpiritualTraitOrigin);
const id = rank => `development-trait-spirituelle-dissonanz-${rank}`;
const oath = 'development-trait-eidbruch';
const base = () => sanitizeCharacterCombatProfile({ progression: { level: 1, development: { mode: 'purchase' } },
  hitPoints: { current: 3 }, magic: { enabled: true }, resources: [{ id: 'personal', current: 1, maximum: 6, name: 'Eigener Vorrat' }] });

test('six numbered stages and one shared oathbreaking state have seven individual admitted images and no effects', async () => {
  assert.equal(SPIRITUAL_TRAIT_DEFINITIONS.length, 7);
  assert.equal(entries.length, 7);
  assert.deepEqual(entries.slice(0, 6).map(entry => getSpiritualTraitOrigin(entry).rank), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(entries.slice(0, 6).map(entry => entry.name), ['I', 'II', 'III', 'IV', 'V', 'VI'].map(roman => `Spirituelle Dissonanz ${roman}`));
  for (const entry of entries) {
    assert.deepEqual(entry.mechanics, {});
    assert.deepEqual(entry.triggerRules, []);
    assert.equal(entry.cost, 0);
    assert.match(entry.description, /keine Boni, Mali, Kraftsperren oder Balancekosten/);
    await access(new URL(`../../${entry.icon.slice(1)}`, import.meta.url));
  }
  const receipt = JSON.parse(await readFile(new URL('../../diagnostics/trait-balance-spiritual-20261112/unique-traits-art-receipt.json', import.meta.url), 'utf8'));
  assert.equal(new Set(receipt.entries.map(entry => entry.sha256)).size, 7);
  assert.equal(new Set(receipt.entries.map(entry => entry.webSha256)).size, 7);
  assert.match(entries.find(entry => entry.id === oath).tags, /Eiferer · Paladin · Schwurritter/);
});

test('each stage and oathbreaking alter only the selected descriptive traits and cost no points', () => {
  for (const entry of entries) {
    const original = base(), result = previewCharacterLevelUp(original, { targetLevel: 1, traitIds: [entry.id] });
    assert.equal(result.ready, true);
    assert.equal(result.balance.traitCost, 0);
    assert.equal(result.balance.remaining, 3);
    const { quirks, ...profile } = result.profile, { quirks: originalQuirks, ...unchanged } = original;
    assert.deepEqual(profile, unchanged, entry.name);
    assert.equal(quirks.length, 1);
    assert.deepEqual(quirks[0].mechanics, sanitizeCharacterCombatProfile({ quirks: [{ id: 'neutral' }] }).quirks[0].mechanics);
  }
});

test('both assistants share a seven-entry spiritual filter and replace a selected stage in either direction', () => {
  const preview = previewCharacterLevelUp(base(), { targetLevel: 1, traitGroup: 'spiritual' });
  assert.equal(preview.plan.traitGroup, 'spiritual');
  const markup = renderDevelopmentTraits(preview.plan);
  assert.equal((markup.match(/data-development-trait=/g) || []).length, 7);
  assert.match(markup, /Buße/);
  assert.match(markup, /Auch Stufe VI sperrt derzeit keine Kräfte/);
  const plan = { traitIds: [oath, id(1)] };
  for (const rank of [6, 2, 4, 1]) {
    updateDevelopmentSelection(plan, { dataset: { developmentTrait: id(rank) }, checked: true });
    assert.deepEqual(plan.traitIds, [oath, id(rank)]);
  }
  updateDevelopmentSelection(plan, { dataset: { developmentTrait: id(1) }, checked: false });
  assert.deepEqual(plan.traitIds, [oath]);
});

test('malformed multi-stage plans keep only the highest and a later conscious downgrade stays possible', () => {
  const original = base(), all = [id(2), oath, id(6), id(1), id(4)];
  const result = previewCharacterLevelUp(original, { targetLevel: 1, traitIds: all });
  assert.deepEqual(result.plan.traitIds, [oath, id(6)]);
  assert.deepEqual(new Set(result.profile.quirks.map(entry => entry.id)), new Set([oath, id(6)]));
  assert.deepEqual(new Set(applyDevelopmentChoices(original, { traitIds: all }).profile.quirks.map(entry => entry.id)), new Set([oath, id(6)]));
  const lower = previewCharacterLevelUp(result.profile, { targetLevel: 1, traitIds: [oath, id(2)] });
  assert.deepEqual(new Set(lower.profile.quirks.map(entry => entry.id)), new Set([oath, id(2)]));
});

test('archive instances and reloads preserve identities, the selected stage and unrestricted magic', () => {
  const original = previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: [id(6), oath] }).profile;
  const quirks = extractCharacterArchiveEntries({ id: 'local', name: 'Lokal', combatProfile: original })
    .filter(entry => entry.kind === 'trait').map(entry => createCharacterArchiveProfileItem(entry, 'quirks'));
  const loaded = sanitizeCharacterCombatProfile({ ...original, quirks });
  assert.deepEqual(new Set(createCharacterLevelUpPlan(loaded).traitIds), new Set([id(6), oath]));
  assert.equal(loaded.magic.enabled, true);
  assert.deepEqual(loaded.magic, base().magic);
});

test('short and long rests never reduce a spiritual stage or clear oathbreaking', () => {
  const profile = previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: [id(6), oath] }).profile;
  for (const type of ['short', 'long']) {
    const participant = buildSceneRestParticipant({ ...profile, characterId: 'local', currentHitPoints: 3, maximumHitPoints: 10 }, type);
    const states = deriveCombatStateFromComments([{ id: 'local-rest', sceneRest: { type, participants: [participant] } }]);
    const rested = overlayCombatHitPointState(profile, states.get('local'));
    assert.deepEqual(rested.quirks, profile.quirks);
    assert.deepEqual(rested.magic, profile.magic);
  }
});
