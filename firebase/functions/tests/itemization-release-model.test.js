import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEquipmentRelease, buildNewWolfshornSheet } from '../scripts/itemization-release-model.mjs';

test('equipment release preserves live health, resources, ownership and quantities and never creates missing possessions', () => {
  const current = { inventory: { money: { copper: 9 }, items: [{ id: 'sword', quantity: '1', equipped: false, ownerCharacterId: 'live', combatDefinition: { damageBonus: 0 } }] },
    combatProfile: { hitPoints: { current: 7 }, resources: [{ id: 'special-action', current: 0 }], lastMechanicalCommentId: 'old', weapons: [{ id: 'sword', equipped: false, inventoryItemId: 'sword', damageBonus: 0 }], armorItems: [] } };
  const authored = { inventory: { items: [{ id: 'sword', quantity: '9', equipped: true, ownerCharacterId: 'stale', combatDefinition: { damageBonus: 1 } }, { id: 'missing-ring' }] }, combatProfile: { weapons: [{ id: 'sword', damageBonus: 1, equipped: true }], armorItems: [] } };
  const before = structuredClone(current), next = buildEquipmentRelease(current, authored, 42);
  assert.deepEqual(current, before);
  assert.deepEqual(next.combatProfile.hitPoints, before.combatProfile.hitPoints);
  assert.deepEqual(next.combatProfile.resources, before.combatProfile.resources);
  assert.equal(next.combatProfile.lastMechanicalCommentId, 'old');
  assert.equal(next.inventory.items.length, 1);
  assert.equal(next.inventory.items[0].quantity, '1');
  assert.equal(next.inventory.items[0].ownerCharacterId, 'live');
  assert.equal(next.combatProfile.weapons[0].equipped, false);
  assert.equal(next.combatProfile.weapons[0].damageBonus, 1);
  assert.deepEqual(next.inventory.money, { copper: 9 });
});
test('ambiguous duplicate quantities and existing Wolfshorn sheets abort the release', () => {
  assert.throws(() => buildEquipmentRelease({ inventory: { items: [{ id: 'x', quantity: 1 }, { id: 'x', quantity: 2 }] } }, {}, 1), /quantity/);
  assert.throws(() => buildNewWolfshornSheet({ combatProfile: { hitPoints: { current: 10 } } }, {}, 1), /Existing combat sheet/);
  assert.throws(() => buildNewWolfshornSheet({ inventory: { items: [{ name: 'Real sword', quantity: 1 }] } }, {}, 1), /real possessions/);
});
