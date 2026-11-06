import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { EXPANSION_TALENT_DEFINITIONS } from '../modules/character-development/development-expansion-talents.js';
import { EXPANSION_ABILITY_DEFINITIONS } from '../modules/character-development/development-expansion-abilities.js';
import { developmentTraitEffectSignature, developmentTraitNameKey } from './support/development-trait-distinctness.mjs';

const root = new URL('../../', import.meta.url);
const before = JSON.parse(await readFile(new URL('diagnostics/standard-talents-abilities-20261106/before.json', root), 'utf8'));
const retired = new Set(before.retiredIds);
const replacements = [...EXPANSION_TALENT_DEFINITIONS, ...EXPANSION_ABILITY_DEFINITIONS]
  .map(([id]) => DEVELOPMENT_TRAITS.find(entry => entry.id === `development-trait-${id}`));

test('thirty rejected choices are replaced by thirty new choices while all other definitions stay exact', () => {
  assert.equal(retired.size, 30);
  assert.equal(replacements.length, 30);
  assert.ok(replacements.every(Boolean));
  assert.equal(DEVELOPMENT_TRAITS.length, before.traits.length);
  for (const id of retired) assert.equal(DEVELOPMENT_TRAITS.some(entry => entry.id === id), false, id);
  for (const entry of before.traits.filter(entry => !retired.has(entry.id))) {
    assert.deepEqual(JSON.parse(JSON.stringify(DEVELOPMENT_TRAITS.find(current => current.id === entry.id))), entry, entry.name);
  }
});

test('replacement names and actual effects are new against all prior choices and the retained archive', async () => {
  const archive = JSON.parse(await readFile(new URL('diagnostics/talents-quirks-abilities-20261106/existing-catalog.json', root), 'utf8')).entries;
  const names = new Set([...archive, ...before.traits].map(entry => developmentTraitNameKey(entry.name)));
  const effects = new Set([...archive, ...before.traits].map(developmentTraitEffectSignature));
  for (const entry of replacements) {
    const name = developmentTraitNameKey(entry.name), effect = developmentTraitEffectSignature(entry);
    assert.notEqual(effect, '{}', entry.name);
    assert.equal(names.has(name), false, entry.name);
    assert.equal(effects.has(effect), false, entry.name);
    names.add(name); effects.add(effect);
  }
});

test('all earlier images remain byte-identical as provenance and new choices have new originals', async () => {
  const hashes = new Set();
  for (const entry of before.assets) {
    const hash = createHash('sha256').update(await readFile(new URL(entry.path, root))).digest('hex');
    assert.equal(hash, entry.sha256, entry.path); hashes.add(hash);
  }
  for (const entry of replacements) {
    const id = entry.id.replace('development-trait-', '');
    assert.equal(entry.icon, `/AleriaAlmanach/assets/development-traits/web/${id}.webp`);
    const hash = createHash('sha256').update(await readFile(new URL(`AleriaAlmanach/assets/development-traits/${id}.png`, root))).digest('hex');
    assert.equal(hashes.has(hash), false, entry.name); hashes.add(hash);
  }
});
