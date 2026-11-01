import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { STANDARD_TOOL_ARTWORK, resolveStandardItemImage } from '../modules/item-register/item-register-standard-artwork.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { resolveEquipmentImage } from '../modules/character-equipment/equipment-artwork.js';
import { resolveInventoryItem } from '../modules/character-inventory/character-inventory-identity.js';
import { itemDefinitionRegistry } from '../modules/item-definitions/item-definition-registry.js';
import { itemImage } from '../modules/item-register/item-register-view.js';
import { mountRegisterTemplatePicker } from '../modules/item-register/item-register-template-picker.js';
import { groupAccountItemCard, renderGroupAccount } from '../modules/landing/group-account-view.js';

const fallback = 'https://i.imgur.com/UbjFi5T.png';
const id = 'standard:gemischtwarenhandler:rucksack';
const image = STANDARD_TOOL_ARTWORK[id];
const oldReference = { id, revision: '5c9c4e52669ce242894944c5' };
const possession = () => ({ id: 'owned-backpack', name: 'Mein Rucksack', definitionRef: oldReference, image: fallback,
  category: 'equipment', quantity: '1', instanceId: 'my-backpack', equipped: false });

test('all 43 exact tool standards reuse matching previously validated transparent inventory art; no names infer identity', async () => {
  const actual = STANDARD_ITEMS.filter(item => ['werkzeuge', 'sonstiges'].includes(item.category));
  assert.equal(actual.length, 43);
  assert.deepEqual(Object.keys(STANDARD_TOOL_ARTWORK).sort(), actual.map(item => item.id).sort());
  const manifest = JSON.parse(await readFile(new URL('../assets/pendrwn-general-store/image-validation.json', import.meta.url), 'utf8'));
  const goods = await readdir(new URL('../assets/pendrwn-general-store/goods/', import.meta.url));
  assert.equal(goods.filter(file => file.endsWith('.png')).length, 57);
  assert.equal(manifest.transparentItems, 57);
  for (const [id, path] of Object.entries(STANDARD_TOOL_ARTWORK)) {
    assert.equal(actual.find(item => item.id === id).image, path, `Current standard head: ${id}`);
    assert.equal(itemDefinitionRegistry.current(id).image, path, `Current definition head: ${id}`);
    const bytes = await readFile(new URL(`../../${path.slice(1)}`, import.meta.url));
    const entry = manifest.images.find(row => row.id === id.split(':').at(-1));
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20), bytes[25]], [1254, 1254, 6], id);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, id);
    assert.deepEqual(entry.alphaRange, [0, 255], id);
    assert.equal(resolveStandardItemImage({ id, image: fallback }), path);
  }
  assert.equal(resolveStandardItemImage({ name: 'Rucksack', image: fallback }), fallback);
  assert.equal(resolveStandardItemImage({ id: 'standard:other:rucksack', image: fallback }), fallback);
});

test('pinned old inventory gets a read-only image projection while custom pictures, custom definitions and old rules remain intact', () => {
  const old = itemDefinitionRegistry.get(oldReference), stored = possession(), before = structuredClone(stored);
  assert.equal(old.image, fallback, 'The historical definition itself remains unchanged.');
  assert.equal(resolveEquipmentImage(stored), image);
  const projected = resolveInventoryItem(stored);
  assert.equal(projected.image, image);
  assert.deepEqual(projected.definitionRef, oldReference);
  assert.deepEqual(projected.combatDefinition, old.combatDefinition);
  assert.deepEqual(stored, before);
  assert.deepEqual(itemDefinitionRegistry.get(oldReference), old);
  for (const custom of ['https://example.test/my-backpack.png', '/my-art/backpack.png', 'data:image/png;base64,AA==']) {
    assert.equal(resolveEquipmentImage({ ...stored, image: custom }), custom);
  }
  assert.equal(resolveEquipmentImage({ ...stored, definitionRef: { id: 'unique:personal-backpack', revision: 'v1' }, templateId: id }), fallback);
  for (const key of ['templateId', 'itemDbKey', 'originItemDbKey', 'canonicalKey']) {
    assert.equal(resolveEquipmentImage({ id: 'legacy-owner-item', [key]: id, image: fallback }), image);
  }
});

test('register, template picker, individual and communal cards share the exact standard image without altering stored inventories', () => {
  const stored = possession(), before = structuredClone(stored);
  assert.ok(itemImage(stored).includes(image));
  const fields = new Map();
  const root = { classList: { add() {} }, addEventListener() {}, closest: () => null,
    querySelector(selector) { if (!fields.has(selector)) fields.set(selector, {}); return fields.get(selector); } };
  mountRegisterTemplatePicker(root, { items: [{ ...stored, id, title: stored.name, category: 'werkzeuge' }] });
  assert.ok(fields.get('[data-rt-role="results"]').innerHTML.includes(image));
  assert.ok(groupAccountItemCard(stored).includes(image));
  const account = { revision: 1, inventory: { items: [stored] } };
  assert.ok(renderGroupAccount(account, { preview: true }).includes(image));
  assert.deepEqual(stored, before);
});

test('the existing classic item picker delegates only image projection to the shared register API', async () => {
  const source = await readFile(new URL('../modules/item-database/item-db-ui.js', import.meta.url), 'utf8');
  const context = { window: { AleriaItemRegister: { resolveImage: resolveEquipmentImage } },
    itemDbSanitizeImage: value => value, itemDbEscapeHtml: value => String(value),
    itemDbEnsureGlobalSync: () => Promise.resolve(), document: { addEventListener() {} } };
  vm.createContext(context); vm.runInContext(source, context);
  assert.ok(context.itemDbRenderImage(possession()).includes(image));
});
