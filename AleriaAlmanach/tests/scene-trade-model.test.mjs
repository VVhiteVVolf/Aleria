import assert from 'node:assert/strict';
import test from 'node:test';
import { applySceneTradeOrder, sceneTradeLinePrice } from '../modules/scene-trade/scene-trade-model.js';

const merchant = { id: 'arkaneum', name: 'Arkanist von Gwynthor' };
const potion = { id: 'healing', title: 'Heiltrank', category: 'alchemie', priceRange: { minCopper: 10, maxCopper: 20 } };
const weapon = { id: 'sword', title: 'Schwert', category: 'waffen', priceRange: { minCopper: 100, maxCopper: 150 },
  combatDefinition: { kind: 'weapon', damageFormula: '1d8', damageType: 'Hieb' } };
const character = (id, copper = 100, items = []) => ({ key: `character:${id}`, id, kind: 'character', name: id,
  inventory: { moneyState: { totalCopper: copper }, items: structuredClone(items) }, combatProfile: { resources: [{ id: 'mana', current: 3 }] } });
const group = (copper = 100) => ({ key: 'group:companions', id: 'companions', kind: 'group', name: 'Gefährten',
  inventory: { moneyState: { totalCopper: copper }, items: [] } });
const buy = (id, overrides = {}) => ({ id, direction: 'buy', productId: potion.id, product: structuredClone(potion),
  quantity: 1, payerKey: 'character:gawain', recipientKey: 'character:gawain', priceMode: 'standard', ...overrides });
const sale = (id, itemId, overrides = {}) => ({ id, direction: 'sell', itemId, quantity: 1, sellerKey: 'character:gawain',
  priceMode: 'standard', product: {}, ...overrides });
const order = (records, lines) => applySceneTradeOrder({ records, lines, merchant, operationId: 'shopping', now: '1740-03-09' });
const record = (result, key) => result.records.find(entry => entry.key === key);

test('one order supports separate payers, gifts and group funds without mutating inputs', () => {
  const records = [character('gawain'), character('ylva'), group()];
  const before = structuredClone(records);
  const result = order(records, [buy('own'), buy('gift', { recipientKey: 'character:ylva' }),
    buy('ylva', { payerKey: 'character:ylva', recipientKey: 'character:ylva' }),
    buy('group', { payerKey: 'group:companions', recipientKey: 'group:companions', quantity: 2 })]);
  assert.deepEqual(records, before);
  assert.equal(record(result, 'character:gawain').inventory.moneyState.totalCopper, 80);
  assert.equal(record(result, 'character:ylva').inventory.moneyState.totalCopper, 90);
  assert.equal(record(result, 'character:ylva').inventory.items.length, 2);
  assert.equal(record(result, 'group:companions').inventory.moneyState.totalCopper, 80);
  assert.equal(record(result, 'group:companions').inventory.items[0].ownerGroupId, 'companions');
  assert.equal(result.receipt.lines.length, 4);
  assert.deepEqual(result.receipt.totals, { buyMinor: 5000, sellMinor: 0, netMinor: 5000 });
  assert.deepEqual(result.receipt.accounts.find(entry => entry.key === 'character:gawain'), {
    key: 'character:gawain', debitMinor: 2000, creditMinor: 0, netMinor: -2000 });
});

test('ordinary products remain repeatable despite exhausted finite legacy stock', () => {
  const product = { ...potion, stock: 0 };
  const result = order([character('gawain')], [buy('one', { product, quantity: 3 })]);
  assert.equal(result.records[0].inventory.items[0].quantity, '3');
  assert.equal(product.stock, 0);
  assert.throws(() => order([character('gawain')], [buy('no', { product: { ...product, available: false } })]), /nicht mehr verfügbar/);
  assert.throws(() => order([character('gawain')], [buy('no', { product: { ...product, archived: true } })]), /nicht mehr verfügbar/);
  assert.throws(() => order([character('gawain')], [buy('no', { product: { ...product, status: 'unavailable' } })]), /nicht mehr verfügbar/);
});

test('a referenced purchase activates canonical inventory protection without rewriting legacy possessions', () => {
  const legacy = { id: 'legacy', name: 'Altes Erbstück', quantity: '1', description: 'Persönlich',
    combatDefinition: { kind: 'weapon', damageFormula: '1d8', damageBonus: 3 }, custom: { keep: true } };
  const records = [character('gawain'), character('ylva', 50, [legacy])];
  const definition = { id: 'item:healing', revision: 'v1', kind: 'shared', category: 'alchemie' };
  const result = order(records, [buy('protected', { recipientKey: 'character:ylva', definition,
    product: { ...potion, definitionRef: { id: definition.id, revision: definition.revision } } })]);
  assert.equal(record(result, 'character:ylva').inventory.definitionSchemaVersion, 1);
  assert.deepEqual(record(result, 'character:ylva').inventory.items[0], legacy);
  assert.equal(Object.hasOwn(record(result, 'character:gawain').inventory, 'definitionSchemaVersion'), false);
  assert.equal(Object.hasOwn(records[1].inventory, 'definitionSchemaVersion'), false);
});

test('agreed prices override both price-range limits and require exact integer minor totals', () => {
  for (const agreedTotalMinor of [0, 1, 9999]) {
    const result = order([character('gawain')], [buy('deal', { priceMode: 'agreed', agreedTotalMinor })]);
    assert.equal(result.receipt.lines[0].totalMinor, agreedTotalMinor);
    assert.equal(result.receipt.lines[0].baselineTotalMinor, 1000);
    assert.equal(result.records[0].inventory.moneyState.totalCopper, (10000 - agreedTotalMinor) / 100);
  }
  for (const agreedTotalMinor of [-1, 0.5, NaN, Infinity, '100', Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => sceneTradeLinePrice({ direction: 'buy', product: potion, priceMode: 'agreed', agreedTotalMinor }), /Preis/);
  }
});

test('a negotiated horse sale needs no earlier purchase receipt and preserves named identity and provenance', () => {
  const horse = { id: 'horse-item', instanceId: 'horse-instance', creatureId: 'named-horse', name: 'Abendstern', quantity: '1',
    registerCategory: 'pferde', description: 'Die alte Narbe bleibt.', acquiredAt: '1738', sourceRefs: ['old'] };
  const definition = { id: 'unique:abendstern', kind: 'unique', category: 'pferde' };
  const result = order([character('gawain', 0, [horse])], [sale('horse', horse.id, { definition,
    priceMode: 'agreed', agreedTotalMinor: 123456 })]);
  assert.equal(result.receipt.lines[0].baselineTotalMinor, null);
  assert.equal(result.records[0].inventory.items.length, 0);
  assert.equal(result.records[0].inventory.moneyState.totalCopper, 1234.56);
  assert.deepEqual(result.soldItems[0].item, horse);
  assert.deepEqual(result.claims[0], { definition, instanceId: 'horse-instance', quantity: 1,
    holder: { kind: 'vendor', recordId: merchant.id, itemId: horse.id },
    previousHolder: { kind: 'characters', recordId: 'gawain', itemId: horse.id } });
});

test('sales have unlimited NPC funding and source purchase metadata remains unchanged', () => {
  const item = { id: 'old', instanceId: 'original', name: 'Erbstück', quantity: '1', purchase: { unitCopper: 25, at: '1739' } };
  const result = order([character('gawain', 0, [item])], [sale('sell', 'old')]);
  assert.equal(result.records[0].inventory.moneyState.totalCopper, 12.5);
  assert.deepEqual(result.soldItems[0].item.purchase, item.purchase);
  assert.equal(result.receipt.lines[0].baselineTotalMinor, 1250);
  assert.equal(Object.hasOwn(merchant, 'moneyState'), false);
});

test('standard resale falls back to authoritative valuation, while unknown prices require agreement', () => {
  const item = { id: 'old', name: 'Buch', quantity: '1', valuation: { minCopper: 2.03 } };
  assert.equal(order([character('gawain', 0, [item])], [sale('sell', 'old')]).receipt.lines[0].totalMinor, 101);
  assert.throws(() => order([character('gawain', 0, [{ ...item, valuation: null }])], [sale('sell', 'old')]), /Preis vereinbaren/);
});

test('partial sales preserve the original stack and give the sold segment a new identity and exact quantity', () => {
  const original = { id: 'stack', instanceId: 'stack-instance', name: 'Tränke', quantity: '5', purchase: { unitCopper: 2 },
    itemState: { condition: 'excellent' }, description: 'Gleiche Charge' };
  const result = order([character('gawain', 0, [original])], [sale('split', 'stack', { quantity: 2, instanceId: 'sold-stack' })]);
  assert.equal(result.records[0].inventory.items[0].quantity, '3');
  assert.equal(result.records[0].inventory.items[0].instanceId, original.instanceId);
  assert.equal(result.soldItems[0].item.quantity, '2');
  assert.equal(result.soldItems[0].item.id, 'sold-stack');
  assert.equal(result.soldItems[0].item.instanceId, 'sold-stack');
  assert.deepEqual(result.soldItems[0].item.purchase, original.purchase);
  assert.deepEqual(result.soldItems[0].item.itemState, original.itemState);
});

test('multiple nonstackable items and charged items become separate possessions with exact package-price allocation', () => {
  const charged = { ...potion, useDefinition: { chargesMaximum: 3 } };
  for (const product of [weapon, charged]) {
    const result = order([character('gawain')], [buy('three', { product, definition: product, quantity: 3,
      priceMode: 'agreed', agreedTotalMinor: 1 })]);
    const items = result.records[0].inventory.items;
    assert.equal(items.length, 3);
    assert.equal(new Set(items.map(item => item.instanceId)).size, 3);
    assert.ok(items.every(item => item.quantity === '1'));
    assert.equal(items.reduce((sum, item) => sum + item.purchase.totalMinor, 0), 1);
    if (product === charged) assert.ok(items.every(item => item.itemState.chargesCurrent === 3));
  }
});

test('indivisible stack package prices preserve exact total without inventing a rounded unit price', () => {
  const result = order([character('gawain')], [buy('tiny', { quantity: 3, priceMode: 'agreed', agreedTotalMinor: 1 })]);
  const purchase = result.records[0].inventory.items[0].purchase;
  assert.equal(purchase.quantity, 3);
  assert.equal(purchase.totalMinor, 1);
  assert.equal(Object.hasOwn(purchase, 'unitCopper'), false);
});

test('unique purchases have one stable holder claim and cannot be stacked or repeated within the cart', () => {
  const definition = { id: 'unique:focus', kind: 'unique', category: 'arkanes' };
  const line = buy('unique', { definition, instanceId: 'focus', product: { ...potion, definitionKind: 'unique' } });
  const result = order([character('gawain')], [line]);
  assert.deepEqual(result.claims[0], { definition, instanceId: 'focus', quantity: 1,
    holder: { kind: 'characters', recordId: 'gawain', itemId: 'focus' } });
  assert.throws(() => order([character('gawain')], [{ ...line, quantity: 2 }]), /Unikat/);
  assert.throws(() => order([character('gawain')], [line, { ...line, id: 'second', instanceId: 'focus-copy' }]), /Unikat/);
});

test('compact referenced possessions require the exact immutable definition before a sale', () => {
  const source = { id: 'focus', instanceId: 'focus-instance', name: 'Fokus', quantity: '1',
    definitionRef: { id: 'unique:focus', revision: 'v1' } };
  const definition = { ...source.definitionRef, kind: 'unique', category: 'arkanes' };
  const line = sale('focus-sale', source.id, { priceMode: 'agreed', agreedTotalMinor: 100 });
  assert.throws(() => order([character('gawain', 0, [source])], [line]), /Itemversion/);
  assert.throws(() => order([character('gawain', 0, [source])], [{ ...line, definition: { ...definition, revision: 'v2' } }]), /Itemversion/);
  assert.equal(order([character('gawain', 0, [source])], [{ ...line, definition }]).claims.length, 1);
});

test('quantity, duplicate identity and record validation cannot mint invalid possessions', () => {
  for (const count of [0, -1, 1.5, 10000, Infinity]) assert.throws(() => order([character('gawain')], [buy('bad', { quantity: count })]), /Menge/);
  assert.throws(() => order([character('gawain')], [buy('same'), buy('same')]), /eindeutige Kennung/);
  assert.throws(() => order([character('gawain', 100, [{ id: 'already', instanceId: 'existing' }])], [buy('one', { instanceId: 'existing' })]), /Besitzinstanz/);
  assert.throws(() => order([character('gawain'), character('gawain')], [buy('one')]), /Kennung/);
  assert.throws(() => order([character('gawain')], [buy('one', { payerKey: 'character:unknown' })]), /nicht gefunden/);
});

test('equipped items, overselling, and splitting linked animals are rejected without input mutations', () => {
  const source = { id: 'source', name: 'Besitz', quantity: '1', purchase: { unitCopper: 5 } };
  const cases = [character('gawain', 0, [{ ...source, equipped: true }]),
    { ...character('gawain', 0, [source]), combatProfile: { weapons: [{ inventoryItemId: 'source', equipped: true }] } },
    character('gawain', 0, [{ ...source, creatureId: 'animal', quantity: '2' }])];
  for (const input of cases) {
    const before = structuredClone(input);
    assert.throws(() => order([input], [sale('no', 'source')]), /ablegen|geteilt/);
    assert.deepEqual(input, before);
  }
  assert.throws(() => order([character('gawain', 0, [source])], [sale('no', 'source', { quantity: 2 })]), /Nur 1/);
});

test('capacity and wallet checks consider the complete atomic order, including sale proceeds', () => {
  const items = Array.from({ length: 80 }, (_, index) => ({ id: `item-${index}`, name: 'Buch', quantity: '1', purchase: { unitCopper: 20 } }));
  const input = character('gawain', 0, items), before = structuredClone(input);
  const result = order([input], [buy('potion'), sale('old', 'item-0')]);
  assert.equal(result.records[0].inventory.items.length, 80);
  assert.equal(result.records[0].inventory.moneyState.totalCopper, 0);
  assert.deepEqual(input, before);
  assert.throws(() => order([character('gawain', 100, items)], [buy('potion')]), /80/);
  assert.throws(() => order([character('gawain', 10)], [buy('one'), buy('two')]), /nicht genug Geld/);
  assert.throws(() => order([character('gawain', 0, items)], [buy('one', { quantity: 2 }), sale('old', 'item-0')]), /nicht genug Geld/);
});

test('equipment registration and sales affect only their exact possessions and preserve live resources', () => {
  const existing = { id: 'old-sword', name: 'Alt', quantity: '1', purchase: { unitCopper: 10 } };
  const input = character('gawain', 100, [existing]);
  input.combatProfile.weapons = [{ id: 'old-binding', inventoryItemId: 'old-sword', equipped: false, notes: 'Individuell' },
    { id: 'unrelated', inventoryItemId: 'other', equipped: true, notes: 'Unverändert', damageBonus: 7 }];
  const untouched = structuredClone(input.combatProfile.weapons[1]);
  const result = order([input], [buy('new', { product: weapon, definition: weapon }), sale('old', 'old-sword')]);
  const profile = result.records[0].combatProfile;
  assert.deepEqual(profile.resources, input.combatProfile.resources);
  assert.deepEqual(profile.weapons.find(entry => entry.id === 'unrelated'), untouched);
  assert.equal(profile.weapons.some(entry => entry.id === 'old-binding'), false);
  assert.equal(profile.weapons.find(entry => entry.inventoryItemId === 'trade:shopping:new').equipped, false);
});

test('money multiplication, credit accumulation and the final balance remain within safe integer bounds', () => {
  assert.throws(() => sceneTradeLinePrice({ direction: 'buy', product: { priceRange: { minCopper: Number.MAX_SAFE_INTEGER / 100 } }, quantity: 2 }), /groß/);
  const source = { id: 'old', name: 'Alt', quantity: '1' };
  assert.throws(() => order([character('gawain', 1, [source])], [sale('large', 'old', {
    priceMode: 'agreed', agreedTotalMinor: Number.MAX_SAFE_INTEGER })]), /groß/);
  const half = Math.floor(Number.MAX_SAFE_INTEGER / 2) + 1;
  assert.throws(() => order([character('gawain', half / 100), character('ylva', half / 100)], [
    buy('large-gawain', { priceMode: 'agreed', agreedTotalMinor: half }),
    buy('large-ylva', { payerKey: 'character:ylva', recipientKey: 'character:ylva', priceMode: 'agreed', agreedTotalMinor: half })
  ]), /groß/);
});
