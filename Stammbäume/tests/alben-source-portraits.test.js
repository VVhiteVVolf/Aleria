import { BRANN_SOURCE_COUNTER_PATCHES } from '../assets/js/data/brann-source-counter-patches.js';
import { MATHGHAM_SOURCE_COUNTER_PATCHES } from '../assets/js/data/mathgham-source-counter-patches.js';
import { FAERNA_SOURCE_COUNTER_PATCHES } from '../assets/js/data/faerna-source-counter-patches.js';
import { FAELAORN_SOURCE_COUNTER_PATCHES } from '../assets/js/data/faelaorn-source-counter-patches.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { ALBEN_SOURCE_PORTRAITS as portraits, ALBEN_SOURCE_PORTRAIT_FAMILIES as updates } from '../assets/js/data/alben-source-portraits.js';
import { withAlbenSourcePortraitUpgrade } from '../assets/js/data/alben-source-portrait-upgrade.js';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { resolvePortraitSource, PORTRAIT_PLACEHOLDERS } from '../assets/js/config/portrait-placeholders.js';
import { portraitInvariantFamily } from './alben-portrait-invariants.js';

const read = path => JSON.parse(fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const audit = read('assets/data/source-inventories/alben-portraits-2026-10-08.json');
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('all 153 recovered portraits are verified originals in 165 cards, including Nessa and Haeghra', () => {
  assert.equal(audit.scope.familyIds.length, 86);
  assert.equal(audit.scope.personsChecked, 3063);
  assert.equal(Object.keys(portraits).length, 153);
  assert.equal(Object.keys(updates).length, 52);
  assert.equal(Object.values(updates).reduce((n, entry) => n + entry.personIds.length, 0), 165);
  assert.equal(updates['haus-nessa'].personIds.length, 7);
  assert.equal(updates['haus-haeghra'].personIds.length, 4);
  for (const asset of audit.portraitAssets) {
    const bytes = fs.readFileSync(new URL('../' + asset.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.personId);
    assert.equal(portraits[asset.personId], asset.path);
  }
  for (const [familyId, update] of Object.entries(updates)) {
    const family = getRegisteredFamily(familyId).family;
    assert.equal(family.extensions.sourceRevision, FAERNA_SOURCE_COUNTER_PATCHES[familyId]?.revision || MATHGHAM_SOURCE_COUNTER_PATCHES[familyId]?.revision || FAELAORN_SOURCE_COUNTER_PATCHES[familyId]?.revision || update.revision);
    for (const id of update.personIds) {
      const person = family.persons.find(p => p.id === id);
      assert.equal(person.portrait, portraits[id], familyId + '/' + id);
      assert.equal(resolvePortraitSource(person), portraits[id]);
    }
  }
});

test('all genealogy and all 427 unaffected family records remain unchanged', () => {
  const fingerprints = read('scripts/alben-portrait-reconciliation/baseline-fingerprints.json');
  const invariants = read('scripts/alben-portrait-reconciliation/invariant-fingerprints.json');
  // Later territorial preparations are outside this dated portrait baseline.
  const originalRecords = FAMILY_REGISTRY.filter(r => Object.hasOwn(fingerprints, r.id));
  assert.equal(originalRecords.filter(r => !updates[r.id]).length, 427);
  const laterPatches = read('assets/data/source-inventories/faelaorn-families-audit-2026-10-08.json').counterpartPatches;
  // The subsequent Faelaorn field changes are covered by its preservation tests.
  for (const record of originalRecords.filter(r => !laterPatches[r.id] && !MATHGHAM_SOURCE_COUNTER_PATCHES[r.id] && !FAERNA_SOURCE_COUNTER_PATCHES[r.id] && !BRANN_SOURCE_COUNTER_PATCHES[r.id])) {
    assert.equal(digest(portraitInvariantFamily(record.family)), invariants[record.id], record.id);
    if (!updates[record.id]) assert.equal(digest(normalizeFamily(record.family)), fingerprints[record.id], record.id);
  }
});

test('saved families receive missing portraits without overwriting local research, views or custom pictures', () => {
  for (const [familyId, update] of Object.entries(updates)) {
    const registered = normalizeFamily(getRegisteredFamily(familyId).family);
    const local = structuredClone(registered);
    local.extensions.sourceRevision = update.revision - 1;
    local.view.orientation = 'horizontal';
    local.persons.forEach(p => { p.notes = 'Eigene Recherche'; p.title = 'Eigener Titel'; });
    for (const id of update.personIds) local.persons.find(p => p.id === id).portrait = '';
    const upgraded = resolveRegisteredFamilyUpgrade(registered, local);
    for (const id of update.personIds) assert.equal(upgraded.persons.find(p => p.id === id).portrait, portraits[id]);
    assert.ok(upgraded.persons.every(p => p.notes === 'Eigene Recherche' && p.title === 'Eigener Titel'), familyId);
    assert.equal(upgraded.view.orientation, 'horizontal');
    assert.deepEqual(upgraded.parentages, local.parentages);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, upgraded), upgraded);
    assert.equal(withAlbenSourcePortraitUpgrade(getRegisteredFamily(familyId).family), getRegisteredFamily(familyId).family);
    const customized = structuredClone(local);
    const customId = update.personIds[0];
    customized.persons.find(p => p.id === customId).portrait = 'assets/images/own-research.png';
    assert.equal(resolveRegisteredFamilyUpgrade(registered, customized).persons.find(p => p.id === customId).portrait, 'assets/images/own-research.png');
  }
});

test('source corrections after a fill-only revision can still replace a portrait', () => {
  const registered = normalizeFamily(getRegisteredFamily('haus-nessa').family);
  const local = structuredClone(registered);
  const id = updates['haus-nessa'].personIds[0];
  const person = registered.persons.find(p => p.id === id);
  registered.extensions.sourceRevision++;
  person.extensions.registryManagedFieldRevisions.portrait = registered.extensions.sourceRevision;
  person.portrait = 'assets/images/later-verified-source.png';
  assert.equal(resolveRegisteredFamilyUpgrade(registered, local).persons.find(p => p.id === id).portrait, person.portrait);
});

test('the nine children without supplied individual images retain their child fallback', () => {
  assert.equal(audit.unpicturedChildren.length, 9);
  for (const entry of audit.unpicturedChildren) {
    const person = getRegisteredFamily(entry.familyId).family.persons.find(p => p.id === entry.personId);
    assert.equal(person.portrait, '');
    assert.equal(resolvePortraitSource(person), PORTRAIT_PLACEHOLDERS.child);
  }
});
