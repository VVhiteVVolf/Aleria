import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { createOwnedItem } from '../modules/item-register/item-register-model.js';
import { moneyState, moneyTotal } from '../modules/item-register/item-register-money.js';
import { createRegisterStore } from '../modules/item-register/item-register-store.js';
import { prepareInventoryCompanionWrites, saveLinkedCreature } from '../modules/item-register/item-register-companion-firebase.js';
import { extractItemRegisterArchiveEntries } from '../modules/character-archive/character-archive-model.js';
import { saveCharacterArchiveEntry } from '../modules/character-archive/character-archive-store.js';

const horse = STANDARD_ITEMS.find(item => item.title === 'Afol');
const item = () => ({ ...createOwnedItem(horse, { id: 'horse', characterId: 'gawain', characterName: 'Gawain', unitCopper: 1200.6, now: '2026-09-12' }), creatureId: 'mount' });
const doc = (_db, ...parts) => parts.join('/');
const origin = { inventoryItemId: 'horse', instanceId: 'horse', ownerCharacterId: 'gawain' };

test('the classic inventory sanitizer preserves ownership, payment, images and creature identity across repeated saves', async () => {
  const context = vm.createContext({ window: { AleriaItemRegister: { moneyState, moneyTotal } }, document: { addEventListener() {} } });
  vm.runInContext(await readFile(new URL('../modules/module-editor/module-editor-character-inventory.js', import.meta.url), 'utf8'), context);
  context.purchased = item();
  const saved = JSON.parse(JSON.stringify(vm.runInContext('sanitizeCharacterInventoryItems(sanitizeCharacterInventoryItems([purchased]))[0]', context)));
  for (const key of ['id', 'instanceId', 'templateId', 'templateName', 'creatureId', 'image', 'purchase', 'valuation']) assert.deepEqual(saved[key], item()[key], key);
  assert.equal(saved.value.totalCopper, 1200.6);
});

test('archive projection includes every goods category and cannot overwrite register-owned data', async () => {
  const previous = globalThis.itemDbBuildIndex;
  globalThis.itemDbBuildIndex = () => STANDARD_ITEMS;
  try {
    const entries = extractItemRegisterArchiveEntries();
    assert.equal(entries.length, STANDARD_ITEMS.length);
    assert.equal(new Set(entries.map(entry => entry.data.id)).size, STANDARD_ITEMS.length);
    await assert.rejects(saveCharacterArchiveEntry(entries[0]), /Güterregister/);
  } finally { if (previous) globalThis.itemDbBuildIndex = previous; else delete globalThis.itemDbBuildIndex; }
});

test('local legacy records survive first connection; explicit remote deletion and adoption do not duplicate them', () => {
  const store = createRegisterStore();
  const legacy = { customItems: [{ canonicalKey: 'custom:one', title: 'Lokale Klinge', category: 'waffen' }] };
  store.setLocalLegacy(legacy);
  store.setLegacy({});
  assert.equal(store.snapshot().offers.length, 1);
  store.setLegacy(legacy);
  assert.equal(store.snapshot().offers.length, 1);
  store.setLegacy({ deletedKeys: ['custom:one'] });
  assert.equal(store.snapshot().offers.length, 0);
});

test('character saves prepare the corresponding companion update and reject active combat or duplicated linkage', async () => {
  const before = { name: 'Gawain', inventory: { items: [item()] } };
  const after = structuredClone(before); after.inventory.items[0].name = 'Morgenwind';
  let locked = false;
  const transaction = { async get(ref) { return { data: () => ref === 'creatures/mount' ? { name: 'Afol', portrait: horse.image, itemOrigin: origin } : { activeEncounterKeys: locked ? ['combat'] : [] } }; } };
  const args = { transaction, doc, characterId: 'gawain', before, after };
  const writes = await prepareInventoryCompanionWrites(args);
  assert.equal(writes[0].data.name, 'Morgenwind');
  assert.equal(writes[0].data.itemOrigin.instanceId, 'horse');
  locked = true;
  await assert.rejects(prepareInventoryCompanionWrites(args), /Kampf/);
  after.inventory.items.push(item());
  await assert.rejects(prepareInventoryCompanionWrites(args), /mehrfach/);
});

test('editing the linked creature updates its inventory identity while keeping the paid price; stale links fail without writes', async () => {
  const creature = { id: 'mount', name: 'Afol', itemOrigin: origin };
  const character = { inventory: { revision: 1, items: [item()] } };
  let writes = [];
  const runTransaction = async (_db, callback) => callback({
    async get(ref) { assert.equal(writes.length, 0); return { data: () => ref === 'creatures/mount' ? creature : ref === 'characters/gawain' ? character : {} }; },
    update(ref, data) { writes.push({ ref, data }); }, set(ref, data) { writes.push({ ref, data }); }
  });
  const args = { doc, runTransaction, id: 'mount', data: { name: 'Silberwind', notes: 'Angepasst', portrait: horse.image } };
  await saveLinkedCreature(args);
  assert.equal(writes[0].data.inventory.items[0].name, 'Silberwind');
  assert.equal(writes[0].data.inventory.items[0].purchase.unitCopper, 1200.6);
  assert.equal(writes[1].data.itemOrigin.instanceId, 'horse');
  writes = []; character.inventory.items = [];
  await assert.rejects(saveLinkedCreature(args), /nicht mehr/);
  assert.equal(writes.length, 0);
});
