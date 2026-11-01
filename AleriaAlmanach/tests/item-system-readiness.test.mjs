import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { materializeInventoryItem } from '../modules/item-definitions/item-definition-resolver.js';
import { createGrantedItem, buildOwnedItems } from '../modules/item-register/item-register-model.js';
import { applyRegisterTrade, resalePrice } from '../modules/item-register/item-register-trade.js';
import { isInventoryPlaceholder } from '../modules/character-inventory/inventory-placeholders.js';
import { inferInventoryUseMode, applyInventoryUseToInventory } from '../modules/inventory-use/inventory-use-model.js';
import { applySceneInventoryTransfer } from '../modules/scene-inventory/scene-inventory-transfer-model.js';
import { synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';

const record = id => ({ id, name: id, inventory: { items: [], moneyState: { totalCopper: 1000000 } },
  combatProfile: { hitPoints: { current: 7, maximumOverride: 30 }, resources: [{ id: 'mana', current: 2, maximum: 10 }] } });

test('every standard weapon and armor can enter an unequipped combat sheet with explicit mechanics', () => {
  for (const template of STANDARD_ITEMS.filter(item => ['waffen', 'ruestungen'].includes(item.category))) {
    const owner = record('owner');
    const item = createGrantedItem(template, { id: 'one', characterId: owner.id, characterName: owner.name, now: '2026-10-31' });
    const resolved = materializeInventoryItem(item);
    assert.ok(resolved.combatDefinition, template.id);
    assert.equal(item.combatDefinition, undefined);
    assert.equal(item.purchase, undefined);
    const result = synchronizeEquipmentFromInventory({ inventory: { items: [item] }, combatProfile: owner.combatProfile, addMissingEquipment: true });
    const profile = sanitizeCharacterCombatProfile(result.combatProfile);
    const entry = [...profile.weapons, ...profile.armorItems].find(entry => entry.inventoryItemId === item.id);
    assert.ok(entry, template.id);
    assert.equal(entry.equipped, false, template.id);
    if (resolved.combatDefinition.kind === 'weapon') assert.equal(entry.damageFormula, resolved.combatDefinition.damageFormula, template.id);
    else assert.equal(entry.baseArmorClass, resolved.combatDefinition.baseArmorClass, template.id);
    assert.equal(profile.hitPoints.current, 7);
    assert.equal(profile.resources.find(resource => resource.id === 'mana').current, 2);
  }
});

test('multiple owners receive identical baseline rules and isolated possession state', () => {
  const template = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const before = structuredClone(template);
  const buy = id => applyRegisterTrade(record(id), template, { direction: 'buy', quantity: 1, unitCopper: template.priceRange.minCopper }, { instanceId: id, now: '2026-10-31' });
  const first = buy('one'), second = buy('two');
  assert.deepEqual(first.inventory.items[0].definitionRef, second.inventory.items[0].definitionRef);
  const firstView = materializeInventoryItem(first.inventory.items[0]);
  firstView.combatDefinition.damageBonus = 9;
  assert.equal(materializeInventoryItem(second.inventory.items[0]).combatDefinition.damageBonus, 0);
  assert.deepEqual(template, before);
  const rowTemplate = { ...template, infoRows: [{ label: 'Zustand', value: 'Neu' }] };
  const grant = createGrantedItem(rowTemplate, { id: 'grant', now: '2026-10-31' });
  const anotherGrant = createGrantedItem(rowTemplate, { id: 'other', now: '2026-10-31' });
  grant.infoRows[0].value = 'Benutzt';
  assert.equal(anotherGrant.infoRows[0].value, 'Neu');
  assert.equal(rowTemplate.infoRows[0].value, 'Neu');
  const moved = applySceneInventoryTransfer({ ...record('one'), ...second }, record('receiver'), { kind: 'item', itemId: 'two', quantity: 1 });
  assert.equal(moved.receiverCombatProfile.weapons[0].damageFormula, '1d8');
  assert.equal(moved.receiverInventory.items[0].templateId, template.id);
});

test('food purchases and explicit laboratory apparatus use survive inventory and register projection', () => {
  const food = STANDARD_ITEMS.find(item => item.category === 'speisen');
  const owner = record('owner');
  const bought = applyRegisterTrade(owner, food, { direction: 'buy', quantity: 2, unitCopper: food.priceRange.minCopper }, { instanceId: 'meal', now: '2026-10-31' });
  const item = bought.inventory.items[0];
  assert.equal(inferInventoryUseMode(item), 'consume');
  const projected = buildOwnedItems([{ ...owner, ...bought }], STANDARD_ITEMS)[0];
  assert.equal(inferInventoryUseMode(projected), 'consume');
  const used = applyInventoryUseToInventory(bought.inventory, { item, mode: 'consume', quantity: 1 });
  assert.equal(used.inventory.items[0].quantity, '1');
  const mortar = STANDARD_ITEMS.find(item => item.id === 'standard:alchemist:labormoerser');
  assert.equal(mortar.inventoryUseMode, 'use');
  assert.equal(STANDARD_ITEMS.find(item => item.id === 'standard:arkanist:zauberschriftrolle').inventoryUseMode, 'consume');
  assert.equal(STANDARD_ITEMS.find(item => item.id === 'standard:arkanist:unverzauberte-schriftrolle').inventoryUseMode, 'use');
});

test('untouched editor examples stay stored but never become catalogue possessions', () => {
  const placeholder = { id: 'example', category: 'weapon', name: 'Hauptwaffe', type: 'Waffe',
    description: 'Beschreibe Material, Zustand und besondere Merkmale.', quantity: '1' };
  assert.equal(isInventoryPlaceholder(placeholder), true);
  for (const changes of [{ combatDefinition: { kind: 'weapon', damageFormula: '1d8' } }, { description: 'Persönliche Klinge.' },
    { templateId: 'standard:weapon' }, { image: '/blade.png' }, { quantity: '2' }, { value: { copper: 1 } }]) {
    assert.equal(isInventoryPlaceholder({ ...placeholder, ...changes }), false);
  }
  const owner = { id: 'owner', inventory: { items: [placeholder] } };
  assert.equal(buildOwnedItems([owner]).length, 0);
  assert.equal(owner.inventory.items.length, 1);
});

test('classic editor retains weapon identity and structured armor mechanics through repeated saves', async () => {
  const context = vm.createContext({ document: { addEventListener() {} }, window: {} });
  vm.runInContext(await readFile(new URL('../modules/module-editor/module-editor-character-inventory.js', import.meta.url), 'utf8'), context);
  context.items = [
    { id: 'w', name: 'Spear', combatDefinition: { kind: 'weapon', damageFormula: '1d6', weaponProfileId: 'spear' }, mechanicsStatus: 'provisional', inventoryUseMode: 'use' },
    { id: 'a', name: 'Armor', combatDefinition: { kind: 'armor', baseArmorClass: 14, armorCategory: 'medium', mechanics: { saveModifiers: [{ kind: 'poison', bonus: 2 }] } } }
  ];
  const saved = JSON.parse(JSON.stringify(vm.runInContext('sanitizeCharacterInventoryItems(sanitizeCharacterInventoryItems(items))', context)));
  assert.equal(saved[0].combatDefinition.weaponProfileId, 'spear');
  assert.equal(saved[0].mechanicsStatus, 'provisional');
  assert.equal(saved[0].inventoryUseMode, 'use');
  assert.equal(saved[1].combatDefinition.armorCategory, 'medium');
  assert.deepEqual(saved[1].combatDefinition.mechanics, context.items[1].combatDefinition.mechanics);
});

test('an explicitly linked goods row resolves aliases without guessing from the display name', () => {
  const template = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const entries = [{ id: 'shop', title: 'Shop', pages: [{ goodsTablePage: true, goodsTable: { tables: [{ rows: [
    { canonicalKey: template.aliases[0], values: { name: 'Andere Beschriftung', kind: 'Schwert', price: '1 GT' } }
  ] }] } }] }];
  const offer = buildModuleOffers(entries, STANDARD_ITEMS)[0];
  assert.equal(offer.templateId, template.id);
  assert.deepEqual(offer.definitionRef, template.definitionRef);
  assert.equal(offer.combatDefinition.damageFormula, template.combatDefinition.damageFormula);
});

test('goods and trade imports retain template identity through sanitization and changed display names', async () => {
  const context = vm.createContext({ window: {}, document: { addEventListener() {} },
    slugify: value => String(value || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
    deepClone: structuredClone, escapeHtml: value => String(value || '').replace(/"/g, '&quot;') });
  for (const path of ['module-editor-data.js', 'module-editor-goods.js', 'module-editor-trade-catalog.js']) {
    vm.runInContext(await readFile(new URL(`../modules/module-editor/${path}`, import.meta.url), 'utf8'), context);
  }
  context.template = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const result = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
    const goods = createGoodsRowFromItemDbItem(template);
    const trade = createTradeCatalogItemFromItemDbItem(template);
    goods.values.name = 'Andere Beschriftung'; trade.title = 'Andere Beschriftung';
    return { goods: sanitizeGoodsRows(sanitizeGoodsRows([goods]))[0], trade: sanitizeTradeCatalogItems(sanitizeTradeCatalogItems([trade]))[0] };
  })()`, context)));
  assert.equal(result.goods.canonicalKey, context.template.id);
  assert.equal(result.trade.canonicalKey, context.template.id);
});

test('new character inventories begin with no template possessions or fictitious companions', async () => {
  const context = vm.createContext({ document: { addEventListener() {} }, window: {}, _editingChar: '' });
  for (const path of ['module-editor/module-editor-character-inventory.js', 'characters/character-inventory-profile.js']) {
    vm.runInContext(await readFile(new URL(`../modules/${path}`, import.meta.url), 'utf8'), context);
  }
  const result = JSON.parse(JSON.stringify(vm.runInContext("createCharacterInventoryDataFromCharacter({ id: 'new', name: 'New' })", context)));
  assert.deepEqual(result.items, []);
  assert.deepEqual(result.companions, []);
});

test('historical reward estimates never become a fictional paid-price resale receipt', () => {
  const reward = { purchase: { sourceKind: 'challenge-reward', unitCopper: 100, paidCopper: 0 } };
  assert.equal(resalePrice(reward), null);
  assert.equal(resalePrice(reward, { section: 'offer', buybackCopper: 12 }), 12);
});
