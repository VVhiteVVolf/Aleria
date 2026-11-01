import test from 'node:test';
import assert from 'node:assert/strict';
import { assertItemQuantity, isItemDefinitionStackable, normalizeItemDefinition, itemDefinitionContent, definitionTemplate } from '../modules/item-definitions/item-definition-model.js';
import { createForm } from '../modules/item-register/item-register-forms.js';
import { applySceneInventoryTransfer } from '../modules/scene-inventory/scene-inventory-transfer-model.js';
import { planItemMigration } from '../modules/item-definitions/item-migration-model.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';

test('quantity validation preserves immutable content and supports ordinary consumable stacks', () => {
  const charged = normalizeItemDefinition({ id: 'item:charged', title: 'Werkzeug', revision: 'old', stackable: true, useDefinition: { chargesMaximum: 3 } });
  const before = itemDefinitionContent(charged);
  assert.equal(isItemDefinitionStackable(charged), false);
  assert.equal(assertItemQuantity(charged, 1), 1);
  assert.throws(() => assertItemQuantity(charged, 2), /Menge/);
  assert.equal(itemDefinitionContent(charged), before);
  assert.equal(charged.stackable, true);
  assert.equal(assertItemQuantity({ stackable: true, category: 'speisen' }, 20), 20);
});

test('register purchase form offers individual quantities for charged items', () => {
  const definition = normalizeItemDefinition({ id: 'item:form', title: 'Werkzeug', revision: 'one', useDefinition: { chargesMaximum: 3 } });
  const product = { ...definitionTemplate(definition), priceRange: { minCopper: 2, maxCopper: 2 } };
  const form = createForm('buy', product, { characters: [{ id: 'owner', ownerUid: 'owner', inventory: { items: [] } }] }, { uid: 'owner', authenticated: true });
  assert.match(form.content, /name="quantity"[^>]*max="1"/);
});

test('partial transfers cannot duplicate a single charge state from a malformed legacy stack', () => {
  const definition = normalizeItemDefinition({ id: 'item:transfer', title: 'Werkzeug', revision: 'one', useDefinition: { chargesMaximum: 3 } });
  const item = { id: 'old', name: definition.title, definitionRef: definition, quantity: '2', itemState: { chargesCurrent: 2 } };
  const giver = { id: 'giver', inventory: { items: [item] } }, receiver = { id: 'receiver', inventory: { items: [] } };
  const before = structuredClone(giver);
  assert.throws(() => applySceneInventoryTransfer(giver, receiver, { kind: 'item', itemId: item.id, quantity: 1 }, {
    definitions: new Map([[`${definition.id}@${definition.revision}`, definition]])
  }), /Menge/);
  assert.deepEqual(giver, before);
});

test('migration preview keeps non-stackable legacy quantities out of the safe bulk selection', () => {
  const sword = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const plan = planItemMigration({ inventory: { items: [{ id: 'old', name: 'Schwerter', templateId: sword.id, quantity: '3' }] } });
  assert.equal(plan.safe.length, 0);
  assert.equal(plan.review[0].reason, 'incompatible-quantity');
});
