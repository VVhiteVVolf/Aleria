import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { GENERAL_TRAIT_DEFINITIONS } from '../modules/character-development/development-general-traits.js';
import { FAMILY_TRAIT_DEFINITIONS } from '../modules/character-development/development-family-traits.js';
import { ORDINARY_BACKGROUND_TEMPLATES } from '../modules/character-development/creation-background-templates.js';
import { CHARACTER_BACKGROUND_TEMPLATES } from '../modules/combat/character-creation-templates.js';

const root = new URL('../../', import.meta.url);
const folder = 'diagnostics/creation-icons-20261106/';
const before = JSON.parse(await readFile(new URL(`${folder}before.json`, root), 'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const traitIds = [...FAMILY_TRAIT_DEFINITIONS, ...GENERAL_TRAIT_DEFINITIONS].map(([id]) => id);
const ids = [...traitIds, ...ORDINARY_BACKGROUND_TEMPLATES.map(entry => `background-${entry.id}`)];
const newTraits = DEVELOPMENT_TRAITS.filter(entry => traitIds.includes(entry.id.replace('development-trait-', '')));
const icons = [...newTraits.map(entry => entry.icon), ...ORDINARY_BACKGROUND_TEMPLATES.map(entry => entry.icon)];

test('all 42 new traits and 24 new backgrounds own distinct named image assets', async () => {
  assert.equal(ids.length, 66);
  assert.equal(newTraits.length, 42);
  assert.equal(new Set(icons).size, 66);
  for (const id of ids) {
    assert.ok(icons.includes(`/AleriaAlmanach/assets/development-traits/web/${id}.webp`), id);
    for (const path of [`AleriaAlmanach/assets/development-traits/${id}.png`, `AleriaAlmanach/assets/development-traits/web/${id}.webp`]) await access(new URL(path, root));
  }
});

test('each image is a new distinct original rather than a copied or renamed existing icon', async () => {
  // Generators run independently; the initial inventory already captured a few
  // completed assets from this task. Exclude their own named paths, not hashes.
  const protectedHashes = new Set(before.existingAssets.filter(entry =>
    !ids.includes(entry.path.split('/').at(-1).replace(/\.(png|webp)$/, ''))).map(entry => entry.sha256));
  const hashes = new Set();
  for (const id of ids) {
    const original = await readFile(new URL(`AleriaAlmanach/assets/development-traits/${id}.png`, root));
    assert.equal(original.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', id);
    assert.equal(original.readUInt32BE(16), original.readUInt32BE(20), `${id}: square original`);
    const hash = digest(original);
    assert.equal(protectedHashes.has(hash), false, `${id}: existing artwork reused`);
    assert.equal(hashes.has(hash), false, `${id}: duplicate newly generated artwork`);
    hashes.add(hash);
  }
});

test('new art references preserve every rule, choice identity and background suggestion', () => {
  assert.ok(DEVELOPMENT_TRAITS.length >= before.traits.length);
  assert.equal(CHARACTER_BACKGROUND_TEMPLATES.length, before.backgrounds.length);
  // Compare the same JSON representation as the retained baseline (-0 becomes 0).
  const omitIcon = ({ icon, ...entry }) => JSON.parse(JSON.stringify(entry));
  for (const previous of before.traits) {
    const current = DEVELOPMENT_TRAITS.find(entry => entry.id === previous.id);
    assert.deepEqual(omitIcon(current), omitIcon(previous), previous.name);
    if (!traitIds.includes(previous.id.replace('development-trait-', ''))) assert.equal(current.icon, previous.icon, previous.name);
  }
  for (const previous of before.backgrounds) assert.deepEqual(omitIcon(CHARACTER_BACKGROUND_TEMPLATES.find(entry => entry.id === previous.id)), omitIcon(previous), previous.label);
});

test('all previously admitted icon originals and web derivatives remain byte-for-byte intact', async () => {
  for (const entry of before.existingAssets) assert.equal(digest(await readFile(new URL(entry.path, root))), entry.sha256, entry.path);
});
