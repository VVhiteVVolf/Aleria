import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeItemDefinition, itemDefinitionKey } from '../modules/item-definitions/item-definition-model.js';
import { applyInventoryUseToInventory, applyInventoryUseAbilityEffects, inferInventoryUseMode } from '../modules/inventory-use/inventory-use-model.js';
import { recoverItemCharges } from '../modules/inventory-use/item-charge-recovery.js';
import { deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';
const definition = normalizeItemDefinition({ id: 'item:wand', title: 'Heilfokus', category: 'arkanes', useDefinition: { mode: 'use', chargesMaximum: 2, chargesPerUse: 1, recovery: 'short-rest',
  costs: [{ resourceId: 'bonus-action', amount: 1 }], effects: [{ type: 'healing', amount: 5 }, { type: 'restore-resource', resourceId: 'mana-focus', amount: 2 }] } });
const definitions = new Map([[itemDefinitionKey(definition), definition]]);
const item = { id: 'owned', name: 'Fokus', definitionRef: { id: definition.id, revision: definition.revision }, quantity: '1' };
test('authoritative use spends charges and costs once, applies self effects and records replayable snapshots', () => {
  const inventory = { items: [item] };
  const used = applyInventoryUseToInventory(inventory, { item, mode: 'consume', quantity: 99 }, { definitions });
  assert.equal(used.inventory.items.length, 1); assert.equal(used.inventory.items[0].itemState.chargesCurrent, 1);
  const result = applyInventoryUseAbilityEffects({ currentHitPoints: 7, maximumHitPoints: 10, resources: [{ id: 'bonus-action', current: 1, maximum: 1 }, { id: 'mana-focus', current: 0, maximum: 10 }] }, used.inventoryUse, '', { definitions });
  assert.equal(result.hitPoints.current, 10); assert.equal(result.resources[0].current, 0); assert.equal(result.resources[1].current, 2);
  const state = deriveCombatStateFromComments([{ commentSegments: [{ inventoryUse: { ...result.inventoryUse, actorId: 'actor' } }] }]).get('actor');
  assert.equal(state.current, 10); assert.equal(state.resources[1].current, 2);
  assert.equal(state.inventory.items[0].itemState.chargesCurrent, 1);
  assert.equal(inventory.items[0].itemState, undefined);
});
test('depleted charges, unaffordable costs and unresolved references cannot perform a mechanical use', () => {
  assert.throws(() => applyInventoryUseToInventory({ items: [{ ...item, itemState: { chargesCurrent: 0 } }] }, { item }, { definitions }), /Ladungen/);
  assert.throws(() => applyInventoryUseToInventory({ items: [item] }, { item }, { definitions: new Map() }), /Regelversion/);
  assert.throws(() => applyInventoryUseAbilityEffects({ resources: [{ id: 'bonus-action', current: 0 }] }, { item }, '', { definitions }), /Verwendungskosten/);
});
test('rest recovery refills only the configured charge pool and does not refill on projection', () => {
  const inventory = { items: [{ ...item, itemState: { chargesCurrent: 0 } }], moneyState: { totalCopper: 5 } };
  const rest = recoverItemCharges(inventory, 'short', 'day-1', definitions);
  assert.equal(rest.inventory.items[0].itemState.chargesCurrent, 2); assert.equal(inventory.items[0].itemState.chargesCurrent, 0);
  assert.equal(rest.inventory.moneyState.totalCopper, 5);
  assert.equal(inferInventoryUseMode({ ...item, category: 'potions' }, definitions), 'use');
});
