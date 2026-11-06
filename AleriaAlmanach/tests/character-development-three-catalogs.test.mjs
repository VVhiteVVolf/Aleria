import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { EXPANSION_TRAIT_GROUPS, EXPANSION_TRAIT_DEFINITIONS } from '../modules/character-development/development-expansion-categories.js';
import { renderDevelopmentTraits } from '../modules/character-development/development-ui.js';
import { previewCharacterLevelUp, createCharacterLevelUpPlan } from '../modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { createCharacterArchiveProfileItem, extractCharacterArchiveEntries } from '../modules/character-archive/character-archive-model.js';
import { reviewDevelopmentTraitBalance } from '../modules/character-development/development-balance-review.js';
import { developmentTraitEffectSignature, developmentTraitNameKey } from './support/development-trait-distinctness.mjs';
import { sanitizeCharacterCombatProfile as serverSanitize } from '../../firebase/functions/src/generated/combat/combat-profile-model.js';

const root = new URL('../../', import.meta.url);
const output = 'diagnostics/talents-quirks-abilities-20261106/';
const before = JSON.parse(await readFile(new URL(`${output}before.json`, root), 'utf8'));
const previous = JSON.parse(await readFile(new URL(`${output}existing-catalog.json`, root), 'utf8')).entries;
const newIds = new Set(EXPANSION_TRAIT_DEFINITIONS.map(([id]) => `development-trait-${id}`));
const entries = DEVELOPMENT_TRAITS.filter(entry => newIds.has(entry.id));
const base = () => sanitizeCharacterCombatProfile({ progression: { level: 1, development: { mode: 'purchase' } },
  hitPoints: { current: 3 }, resources: [{ id: 'personal', name: 'Persönlicher Vorrat', current: 1, maximum: 4 }],
  quirks: [{ id: 'personal', name: 'Persönliches Altmerkmal', active: true }],
  techniques: [{ id: 'personal-technique', name: 'Persönliche Technik', active: true }] });

test('three clearly separated groups contain fifteen new names and real distinct effects each', () => {
  assert.ok(DEVELOPMENT_TRAITS.length >= before.traits.length + 45);
  assert.equal(entries.length, 45);
  const names = new Set(previous.map(entry => developmentTraitNameKey(entry.name)));
  const effects = new Set(previous.map(developmentTraitEffectSignature).filter(signature => signature !== '{}'));
  for (const [id, group] of Object.entries(EXPANSION_TRAIT_GROUPS)) {
    assert.equal(group.definitions.length, 15, id);
    for (const [slug] of group.definitions) {
      const entry = entries.find(item => item.id === `development-trait-${slug}`);
      assert.ok(entry.tags.split(' · ').includes(group.tag), entry.name);
      const name = developmentTraitNameKey(entry.name), effect = developmentTraitEffectSignature(entry);
      assert.equal(names.has(name), false, `${entry.name}: existing name`);
      assert.notEqual(effect, '{}', `${entry.name}: no real effect`);
      assert.equal(effects.has(effect), false, `${entry.name}: existing or repeated effect`);
      names.add(name); effects.add(effect);
    }
  }
});

test('each new filter survives normalization, displays exactly fifteen entries and retains other selections', () => {
  for (const [id, group] of Object.entries(EXPANSION_TRAIT_GROUPS)) {
    const result = previewCharacterLevelUp(base(), { targetLevel: 1, traitGroup: id, traitIds: [entries[0].id] });
    assert.equal(result.plan.traitGroup, id);
    const markup = renderDevelopmentTraits(result.plan);
    assert.equal((markup.match(/data-development-trait=/g) || []).length, 15, id);
    assert.ok(markup.includes(group.note), id);
    assert.deepEqual(result.plan.traitIds, [entries[0].id]);
  }
});

test('choosing and removing all forty-five preserves personal state, base training and live resources', () => {
  const original = base(), copy = structuredClone(original);
  const result = previewCharacterLevelUp(original, { targetLevel: 1, traitIds: [...newIds] });
  assert.equal(result.ready, true, result.errors.join('; '));
  assert.equal(result.profile.quirks.length, 46);
  for (const key of ['attributes', 'skills', 'weapons', 'armorItems', 'abilities', 'techniques', 'resources', 'hitPoints', 'identity', 'templateSelections']) assert.deepEqual(result.profile[key], original[key], key);
  assert.deepEqual(original, copy);
  assert.deepEqual(serverSanitize(result.profile), sanitizeCharacterCombatProfile(result.profile));
  const removed = previewCharacterLevelUp(result.profile, { targetLevel: 1, traitIds: [] });
  assert.equal(removed.ready, true);
  assert.deepEqual(removed.profile.quirks, original.quirks);
  for (const key of ['attributes', 'skills', 'weapons', 'resources', 'hitPoints']) assert.deepEqual(removed.profile[key], original[key]);
});

test('archive copies retain selection references and repeated skill advantage is priced once', () => {
  const source = previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: [...newIds] }).profile;
  const quirks = extractCharacterArchiveEntries({ id: 'fixture', name: 'Prüffigur', combatProfile: source })
    .filter(entry => entry.kind === 'trait').map(entry => createCharacterArchiveProfileItem(entry, 'quirks'));
  const archived = sanitizeCharacterCombatProfile({ ...base(), quirks });
  const plan = createCharacterLevelUpPlan(archived);
  for (const id of newIds) assert.ok(plan.traitIds.includes(id), id);
  assert.deepEqual(serverSanitize(archived), archived);
  const advantage = entries.find(entry => entry.id === 'development-trait-talent-athlet');
  const review = reviewDevelopmentTraitBalance(base(), [advantage, advantage]);
  assert.equal(review.traitCost, advantage.cost * 2 - 3);
  assert.ok(review.warnings.some(warning => warning.includes('mehrfach')));
});

test('all older definitions and every earlier icon remain exact', async () => {
  for (const entry of before.traits) assert.deepEqual(JSON.parse(JSON.stringify(DEVELOPMENT_TRAITS.find(item => item.id === entry.id))), entry, entry.name);
  for (const entry of before.assets) assert.equal(createHash('sha256').update(await readFile(new URL(entry.path, root))).digest('hex'), entry.sha256, entry.path);
});

test('all forty-five own icons have distinct original bytes and proper individual named web paths', async () => {
  const hashes = new Set(before.assets.map(entry => entry.sha256));
  const paths = new Set();
  for (const entry of entries) {
    const id = entry.id.replace('development-trait-', '');
    assert.equal(entry.icon, `/AleriaAlmanach/assets/development-traits/web/${id}.webp`);
    assert.equal(paths.has(entry.icon), false); paths.add(entry.icon);
    await access(new URL(entry.icon.slice(1), root));
    const original = await readFile(new URL(`AleriaAlmanach/assets/development-traits/${id}.png`, root));
    const hash = createHash('sha256').update(original).digest('hex');
    assert.equal(hashes.has(hash), false, `${entry.name}: reused picture`); hashes.add(hash);
    assert.equal(original.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(original.readUInt32BE(16), original.readUInt32BE(20));
  }
});
