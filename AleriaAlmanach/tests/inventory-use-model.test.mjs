import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyInventoryUseAbilityEffects,
  applyInventoryUseToInventory,
  inferInventoryUseMode,
  prepareInventoryUse,
  resolveInventoryUseMode
} from '../modules/inventory-use/inventory-use-model.js';

const character = {
  id: 'character-1',
  name: 'Gawain',
  inventory: {
    items: [
      { id: 'potion-1', category: 'potions', name: 'Heiltrank', type: 'Trinktur', quantity: '2' },
      { id: 'sword-1', category: 'weapon', name: 'Langschwert', type: 'Waffe', quantity: '1' }
    ]
  }
};

test('consumable inventory types are inferred while reusable equipment stays available', () => {
  assert.equal(inferInventoryUseMode(character.inventory.items[0]), 'consume');
  assert.equal(inferInventoryUseMode(character.inventory.items[1]), 'use');
  assert.equal(inferInventoryUseMode({ ...character.inventory.items[1], description: 'Wird mit zwanzig Pfeilen im Köcher getragen.' }), 'use');
  assert.equal(resolveInventoryUseMode(character.inventory.items[0], 'use'), 'use');
});

test('consuming decrements the inventory and stores the exact transition', () => {
  const prepared = prepareInventoryUse({ character, itemId: 'potion-1', requestedMode: 'auto' });
  const result = applyInventoryUseToInventory(character.inventory, prepared);

  assert.equal(result.inventoryUse.mode, 'consume');
  assert.equal(result.inventoryUse.quantityBefore, 2);
  assert.equal(result.inventoryUse.quantityAfter, 1);
  assert.equal(result.inventory.items.find(item => item.id === 'potion-1').quantity, '1');
  assert.equal(character.inventory.items.find(item => item.id === 'potion-1').quantity, '2');
});

test('the final consumed item is removed while ordinary use keeps it', () => {
  const onePotion = { items: [{ ...character.inventory.items[0], quantity: '1' }] };
  const consumed = applyInventoryUseToInventory(onePotion, {
    ...prepareInventoryUse({ character: { ...character, inventory: onePotion }, itemId: 'potion-1' }),
    mode: 'consume'
  });
  assert.equal(consumed.inventory.items.length, 0);
  assert.equal(consumed.inventoryUse.quantityAfter, 0);

  const used = applyInventoryUseToInventory(character.inventory, prepareInventoryUse({
    character,
    itemId: 'sword-1',
    requestedMode: 'auto'
  }));
  assert.equal(used.inventory.items.find(item => item.id === 'sword-1').quantity, '1');
  assert.equal(used.inventoryUse.quantityAfter, 1);
});

test('a stale online quantity cannot be consumed', () => {
  assert.throws(() => applyInventoryUseToInventory({ items: [] }, {
    ...prepareInventoryUse({ character, itemId: 'potion-1' }),
    mode: 'consume'
  }), /online nicht mehr/);
});

test('Liebt Duefte stellt eine Besondere Aktion wieder her und ist nur einmal pro Tag nutzbar', () => {
  const profile = {
    resources: [{ id: 'special-action', name: 'Besondere Aktion', current: 1, maximum: 2 }],
    abilities: [{
      id: 'loves-scents', name: 'Liebt Duefte', active: true,
      usesCurrent: 1, usesMaximum: 1, recovery: 'day', recoveryDayKey: 'day-1',
      inventoryUseTrigger: {
        enabled: true,
        itemTags: ['Duft', 'Parfum'],
        restoreResources: [{ resourceId: 'special-action', amount: 1 }],
        requireActualRecovery: true
      }
    }]
  };
  const use = {
    actorId: 'gawain', item: { id: 'rose-scent', name: 'Rosenduft', category: 'consumable', tags: 'Duft' }, mode: 'use'
  };
  const first = applyInventoryUseAbilityEffects(profile, use, 'day-1');
  assert.equal(first.changed, true);
  assert.equal(first.resources[0].current, 2);
  assert.equal(first.abilities[0].usesCurrent, 0);
  assert.equal(first.inventoryUse.abilityEffects[0].amount, 1);

  const second = applyInventoryUseAbilityEffects({ resources: first.resources, abilities: first.abilities }, use, 'day-1');
  assert.equal(second.changed, false);
  assert.equal(second.abilities[0].usesCurrent, 0);

  const nextDay = applyInventoryUseAbilityEffects({
    resources: [{ ...first.resources[0], current: 1 }],
    abilities: first.abilities
  }, use, 'day-2');
  assert.equal(nextDay.changed, true);
  assert.equal(nextDay.abilities[0].recoveryDayKey, 'day-2');
});

test('Liebt Duefte verbraucht die Tagesnutzung nicht bei bereits voller Ressource', () => {
  const result = applyInventoryUseAbilityEffects({
    resources: [{ id: 'special-action', name: 'Besondere Aktion', current: 2, maximum: 2 }],
    abilities: [{
      id: 'loves-scents', name: 'Liebt Duefte', usesCurrent: 1, usesMaximum: 1, recovery: 'day',
      inventoryUseTrigger: {
        enabled: true,
        itemTags: ['Parfum'],
        restoreResources: [{ resourceId: 'special-action', amount: 1 }],
        requireActualRecovery: true
      }
    }]
  }, { item: { id: 'perfume', name: 'Parfum' }, mode: 'use' }, 'day-1');
  assert.equal(result.changed, false);
  assert.equal(result.abilities[0].usesCurrent, 1);
});
