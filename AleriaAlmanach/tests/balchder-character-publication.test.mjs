import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { BALCHDER_PROFILE_IDS, planBalchderCharacters } from '../../firebase/scripts/content/balchder-character-plan.mjs';
const exports = await Promise.all(BALCHDER_PROFILE_IDS.map(id => readFile(new URL(`../../Charakter Archiv Exporte/balchder-vertragsstube-2026-10-29/${id}.json`, import.meta.url), 'utf8').then(JSON.parse)));
const records = ['haus-balchder', 'haus-gelyn'].map(getRegisteredFamily);
const old = { ...exports[0].character, biography: null, title: '', role: '', bio: '', ownerUid: 'owner', createdBy: 'creator',
  inventory: { items: [{ id: 'keep' }], coins: { gold: 7 } }, combatProfile: { hitPoints: { current: 4 } }, custom: 'keep' };
const config = { tabs: ['Alle', 'Privat'], map: { Privat: ['untouched'] }, subtabs: {}, subtabMap: {}, unrelated: 'keep' };
const input = { records, exports, existingCharacters: [old], config, now: '2026-10-30T19:00:00.000Z' };
test('three unique biographies, two additions, exact field scope and existing inventory/identity preservation', () => {
  const plan = planBalchderCharacters(input);
  assert.equal(plan.entries.filter(e => e.create).length, 2);
  const father = plan.entries[0];
  assert.equal(father.id, old.id);
  assert(!Object.hasOwn(father.patch, 'inventory'));
  assert(!Object.hasOwn(father.patch, 'combatProfile'));
  assert(!Object.hasOwn(father.patch, 'portrait'));
  assert(!Object.hasOwn(father.patch, 'identity'));
  for (const entry of plan.entries) {
    const data = entry.data || entry.patch;
    assert(data.biography.biography.biographyText);
    assert(data.biography.biography.portrait);
    assert(data.biography.stats.every(row => !Array.isArray(row)));
    if (entry.create) { assert.equal(data.ownerUid, old.ownerUid); assert(!Object.hasOwn(data, 'inventory')); }
  }
  assert.deepEqual(plan.config.map.Privat, config.map.Privat);
  assert.equal(new Set(plan.config.map.Gwynthor).size, 3);
  assert.equal(old.biography, null);
});
test('repeat publication is a no-op and ambiguous or newly edited profiles are rejected', () => {
  const plan = planBalchderCharacters(input);
  const existingCharacters = plan.entries.map(e => e.create ? { id: e.id, ...e.data } : {
    ...old, ...e.patch, genealogy: { ...old.genealogy, sources: e.patch.genealogy?.sources || old.genealogy.sources }
  });
  const repeat = planBalchderCharacters({ ...input, existingCharacters, config: plan.config, now: '2026-10-31T19:00:00.000Z' });
  assert(repeat.entries.every(e => !e.create && !e.patch));
  assert.deepEqual(repeat.config, plan.config);
  assert.throws(() => planBalchderCharacters({ ...input, existingCharacters: [old, { ...old, id: 'duplicate' }] }), /Doppelte Online/);
  assert.throws(() => planBalchderCharacters({ ...input, existingCharacters: [{ ...old, biography: { biography: { biographyText: 'Neue Online-Biografie' } } }] }), /inzwischen online/);
});
