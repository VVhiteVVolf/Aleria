import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { planWeaponEconomyRelease } from '../scripts/weapon-economy-release-model.mjs';
import { applyCharacterFieldPatch } from '../scripts/wolfshorn-recovery-release-model.mjs';

const records = JSON.parse(await readFile(new URL('../../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8')).characters;

test('a stale technique is repaired while exhausted resources, wounds and ability uses remain unchanged', () => {
  const record = structuredClone(records.find(character => character.name === 'Asgeir Wolfshorn'));
  const technique = record.combatProfile.techniques.find(entry => entry.id.startsWith('combat-style-'));
  technique.damageFormula = '9d12';
  technique.damageModel = { mode: 'fixed', scalingSteps: [] };
  record.combatProfile.hitPoints.current = 1;
  record.combatProfile.resources.forEach(resource => { resource.current = 0; });
  record.combatProfile.abilities.forEach(ability => { ability.usesCurrent = 0; });
  const patch = planWeaponEconomyRelease(record);
  assert.ok(patch?.['combatProfile.techniques']);
  const after = applyCharacterFieldPatch(record, patch);
  assert.notEqual(after.combatProfile.techniques.find(entry => entry.id === technique.id).damageFormula, '9d12');
  for (const field of ['hitPoints', 'resources', 'conditions', 'abilities', 'weapons', 'armorItems', 'combat']) {
    assert.deepEqual(after.combatProfile[field], record.combatProfile[field], field);
  }
  assert.deepEqual(after.inventory, record.inventory);
  assert.equal(after.id, record.id);
  assert.equal(planWeaponEconomyRelease(after), null);
});
test('weapon economy release changes only arsenal/training and is idempotent for all archived characters', () => {
  for (const record of records.filter(record => record.combatProfile)) {
    const before = structuredClone(record);
    const patch = planWeaponEconomyRelease(record);
    assert.deepEqual(record, before);
    if (!patch) continue;
    assert.ok(Object.keys(patch).every(key => ['combatProfile.techniques', 'combatProfile.classTraining'].includes(key)));
    const after = applyCharacterFieldPatch(record, patch);
    assert.equal(planWeaponEconomyRelease(after), null, record.name);
    for (const key of ['hitPoints', 'resources', 'conditions', 'combat', 'weapons', 'armorItems', 'abilities']) {
      assert.deepEqual(after.combatProfile[key], before.combatProfile[key], `${record.name}: ${key}`);
    }
    assert.deepEqual(after.inventory, before.inventory);
  }
});
