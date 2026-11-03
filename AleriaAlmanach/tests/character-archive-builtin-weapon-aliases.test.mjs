import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildBuiltinStarterWeaponArchiveEntry } from '../modules/character-archive/character-archive-standard-weapons.js';
import { CHARACTER_CLASS_TEMPLATES } from '../modules/combat/character-creation-templates.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';

const aliases = {
  Dolch: 'dolch', Dreizack: 'dreizack', Enteraxt: 'enteraxt', Großschwert: 'ritterschwert',
  Handaxt: 'handaxt', Harpunenspeer: 'harpunenspeer', Kampfstab: 'kampfstab',
  Kurzbogen: 'kurzbogen', Kurzschwert: 'kurzschwert', Langbogen: 'langbogen',
  Langschwert: 'langschwert', Lanze: 'lanze', Morgenstern: 'morgenstern',
  Partisane: 'partisane', Rapier: 'rapier', Säbel: 'saebel', Speer: 'speer',
  Streitaxt: 'streitaxt', Streitkolben: 'streitkolben'
};
const source = { kind: 'class', id: 'test-class', name: 'Testklasse' };

test('the nineteen explicit builtin aliases use current standard rules without mutating starter definitions', () => {
  for (const [name, id] of Object.entries(aliases)) {
    const starter = { id: 'starter-reviewed-fixture', name, damageFormula: '1d2', proficient: true };
    const before = structuredClone(starter);
    const entry = buildBuiltinStarterWeaponArchiveEntry(starter, source);
    const standard = STANDARD_ITEMS.find(item => item.id === `standard:waffen-rustungen:${id}`);
    assert.equal(entry.data.archiveStandardWeaponId, standard.id, name);
    assert.equal(entry.data.damageFormula, standard.combatDefinition.damageFormula, name);
    assert.equal(entry.data.weaponProfileId, standard.combatDefinition.weaponProfileId, name);
    assert.equal(entry.data.equipped, false);
    assert.ok(entry.sources.some(row => row.id === source.id));
    assert.ok(entry.sources.some(row => row.id === standard.id));
    assert.deepEqual(starter, before);
  }
});

test('personal weapons and unknown starter names never become a standard by name alone', () => {
  assert.equal(buildBuiltinStarterWeaponArchiveEntry({ id: 'personal-weapon', name: 'Langschwert' }, source), null);
  assert.equal(buildBuiltinStarterWeaponArchiveEntry({ id: 'starter-personal', name: 'Langschwert' }, { kind: 'character', id: 'person' }), null);
  assert.equal(buildBuiltinStarterWeaponArchiveEntry({ id: 'starter-unknown', name: 'Langschwert (persönlich)' }, source), null);
  assert.equal(buildBuiltinStarterWeaponArchiveEntry({ id: 'starter-unknown', name: 'Unbekannte Klinge' }, source), null);
});

test('the built-in catalog aggregates class provenance on one standard card and preserves creation templates', async () => {
  const before = structuredClone(CHARACTER_CLASS_TEMPLATES);
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async url => ({ ok: true, json: async () => JSON.parse(await readFile(url, 'utf8')) });
  try {
    const { loadBuiltinCharacterArchiveEntries } = await import('../modules/character-archive/character-archive-catalog.js');
    const catalog = await loadBuiltinCharacterArchiveEntries();
    const longswords = catalog.filter(entry => entry.kind === 'attack' && entry.name === 'Langschwert');
    assert.equal(longswords.length, 1);
    assert.equal(longswords[0].data.archiveStandardWeaponId, 'standard:waffen-rustungen:langschwert');
    for (const classId of ['teulu', 'uchelwyr', 'rhyfelwyr', 'cateran']) {
      assert.ok(longswords[0].sources.some(row => row.kind === 'class' && row.id === classId), classId);
    }
    assert.equal(catalog.filter(entry => entry.kind === 'attack' && entry.name === 'Dreizack').length, 1);
    assert.deepEqual(CHARACTER_CLASS_TEMPLATES, before);
  } finally { globalThis.fetch = previousFetch; }
});
