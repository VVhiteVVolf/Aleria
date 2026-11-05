import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { commitSceneTradeOperation, readMerchantSoldOperation } from '../src/scene-trade/commit-scene-trade.js';
import { commitItemDefinitionOperation } from '../src/items/commit-item-definition.js';
import { STANDARD_ITEMS } from '../src/generated/item-register/item-register-standard.js';
import { ITEM_BACKUP_COLLECTIONS } from '../src/items/item-backup.js';
import { buildModuleOffers } from '../src/generated/item-register/item-register-module-catalog.js';
import { readMerchantAvailabilityOperation } from '../src/scene-trade/scene-trade-availability.js';
import { undoMechanicalCommentOperation } from '../src/mechanics/commit-undo-mechanical-comment.js';
import { commitItemRecordOperation } from '../src/items/commit-item-record.js';

const owner = { uid: 'owner', token: {} }, gm = { uid: 'gm', token: { aleriaRole: 'moderator' } };
const player = { uid: 'independent-player', token: { aleriaRole: 'player' } };
const food = STANDARD_ITEMS.find(item => item.category === 'speisen' && item.priceRange);
const person = (id, ownerUid = 'owner') => ({ id, name: id, ownerUid, inventory: { revision: 1, items: [], moneyState: { totalCopper: 1000 } },
  combatProfile: { revision: 2, hitPoints: { current: 7 }, resources: [{ id: 'mana', current: 2, maximum: 10 }], weapons: [{ id: 'saved', name: 'Alte Klinge', equipped: true, personal: 'keep' }] } });
const entry = () => ({ id: 'adventure', title: 'Abenteuer', pages: [{ sessionPage: true, commentThreadKey: 'shop' }] });
const offer = (extra = {}) => ({ ...food, id: 'offer:food', section: 'offer', listId: 'shop', listName: 'Arkanist', revision: 1, stock: 1, priceRange: { minCopper: 10, maxCopper: 10 }, ...extra });
const seed = () => database({ 'characters/gawain': person('gawain'), 'characters/ylva': person('ylva', 'ylva-owner'),
  'characters/merchant': { ...person('merchant', 'npc'), inventory: { revision: 1, moneyState: { totalCopper: 0 }, items: [] } },
  'module_store_entries/adventure': { entryJson: JSON.stringify(entry()) }, 'item_register_offers/offer:food': offer({ sellerCharacterId: 'merchant' }),
  'char_tabs/config': { moduleStoreManifest: { customSections: [{ tab: 'Abenteuer', entryIds: ['adventure'] }], hiddenModuleIds: {}, entryOverrideIds: [] } } });
const buy = (extra = {}) => ({ id: 'one', direction: 'buy', productId: 'offer:food', offerRevision: 1, quantity: 2,
  payerKey: 'character:gawain', recipientKey: 'character:ylva', priceMode: 'standard', expectedTotalMinor: Number(extra.quantity ?? 2) * 1000, ...extra });
const order = (extra = {}) => ({ action: 'checkout', operationId: 'order', entryId: 'adventure::session:shop', merchantId: 'shop', actorCharacterId: 'gawain',
  expectedRevisions: { 'character:gawain': 1, 'character:ylva': 1 }, lines: [buy()], ...extra });

test('group order gifts preserve unrelated loadout, resources, normal stock and NPC purse', async () => {
  const db = seed(), gawainProfile = structuredClone(db.data.get('characters/gawain').combatProfile), ylvaProfile = structuredClone(db.data.get('characters/ylva').combatProfile);
  const response = await commitSceneTradeOperation(db, owner, order());
  assert.equal(response.receipt.lines[0].recipientKey, 'character:ylva');
  assert.equal(db.data.get('characters/gawain').inventory.moneyState.totalCopper, 980);
  assert.equal(db.data.get('characters/ylva').inventory.moneyState.totalCopper, 1000);
  assert.equal(db.data.get('characters/ylva').inventory.items[0].quantity, '2');
  assert.equal(db.data.get('characters/ylva').inventory.definitionSchemaVersion, 1);
  assert.equal(db.data.get('characters/gawain').inventory.definitionSchemaVersion, undefined);
  assert.deepEqual(db.data.get('characters/gawain').combatProfile, gawainProfile);
  assert.deepEqual(db.data.get('characters/ylva').combatProfile, ylvaProfile);
  assert.equal(db.data.get('item_register_offers/offer:food').stock, 1);
  assert.equal(db.data.get('characters/merchant').inventory.moneyState.totalCopper, 0);
  const comment = db.data.get(`comments/${response.commentId}`);
  assert.equal(comment.sceneTrade.actor.id, 'gawain');
  assert.equal(comment.serverCommitted, true);
  assert.equal(comment.sceneTrade.lines.length, 1);
});

test('signed-in players buy, gift and sell for figures with missing or foreign ownership without changing ownership', async () => {
  for (const unowned of [true, false]) {
    const db = seed();
    if (unowned) for (const id of ['gawain', 'ylva']) delete db.data.get(`characters/${id}`).ownerUid;
    const ownersBefore = ['gawain', 'ylva'].map(id => db.data.get(`characters/${id}`).ownerUid);
    const response = await commitSceneTradeOperation(db, player, order({ lines: [buy({ payerKey: 'character:ylva', recipientKey: 'character:gawain' })] }));
    const gawain = db.data.get('characters/gawain'), ylva = db.data.get('characters/ylva');
    assert.equal(response.receipt.actor.id, 'gawain');
    assert.equal(gawain.inventory.moneyState.totalCopper, 1000);
    assert.equal(ylva.inventory.moneyState.totalCopper, 980);
    assert.equal(gawain.inventory.items[0].quantity, '2');
    const itemId = gawain.inventory.items[0].id;
    await commitSceneTradeOperation(db, player, order({ operationId: 'sale', actorCharacterId: 'ylva',
      expectedRevisions: { 'character:gawain': gawain.inventory.revision },
      lines: [{ id: 'sale', direction: 'sell', sellerKey: 'character:gawain', itemId, quantity: 2, priceMode: 'agreed', agreedTotalMinor: 300 }] }));
    assert.equal(db.data.get('characters/gawain').inventory.moneyState.totalCopper, 1003);
    assert.equal(db.data.get('characters/gawain').inventory.items.length, 0);
    assert.equal(db.data.get('characters/ylva').inventory.moneyState.totalCopper, 980);
    assert.deepEqual(['gawain', 'ylva'].map(id => db.data.get(`characters/${id}`).ownerUid), ownersBefore);
    assert.equal([...db.data.keys()].filter(key => key.startsWith('scene_trade_transactions/independent-player-')).length, 2);
  }
});

test('a referenced purchase protects a legacy recipient inventory without rewriting its existing possessions', async () => {
  const db = seed(), legacy = { id: 'legacy-keepsake', name: 'Persönliches Andenken', quantity: '1', description: 'Unveränderte alte Notiz', custom: { kept: true } };
  db.data.get('characters/ylva').inventory.items.push(legacy);
  assert.equal(db.data.get('characters/ylva').inventory.definitionSchemaVersion, undefined);
  await commitSceneTradeOperation(db, owner, order());
  const inventory = db.data.get('characters/ylva').inventory;
  assert.equal(inventory.definitionSchemaVersion, 1);
  assert.deepEqual(inventory.items.find(item => item.id === legacy.id), legacy);
  assert.ok(inventory.items.find(item => item.id !== legacy.id).definitionRef);
});

test('retry after response loss returns the same receipt and current inventories without another charge or event', async () => {
  const db = seed(), input = order();
  const [first, retry] = await Promise.all([commitSceneTradeOperation(db, owner, input), commitSceneTradeOperation(db, owner, input)]);
  assert.equal(first.commentId, retry.commentId);
  db.data.get('characters/ylva').inventory.items.push({ id: 'later', name: 'Späterer Fund' });
  const replay = await commitSceneTradeOperation(db, owner, input);
  assert.equal(replay.characters.find(record => record.id === 'ylva').inventory.items.at(-1).id, 'later');
  assert.equal([...db.data.keys()].filter(key => key.startsWith('comments/')).length, 1);
  await assert.rejects(commitSceneTradeOperation(db, owner, order({ lines: [buy({ quantity: 3 })] })), /andere Bestellung/);
});

test('missing actor, stale revision, ended scene, unknown merchant and combat lock reject the complete cart', async () => {
  const cases = [
    [() => {}, order({ actorCharacterId: 'missing' })],
    [() => {}, order({ expectedRevisions: { 'character:gawain': 0, 'character:ylva': 1 } })],
    [db => db.data.set('comment_turns/adventure::session:shop', { current: 'ended' }), order()],
    [() => {}, order({ merchantId: 'invented-shop' })],
    [db => db.data.set('combat_profile_locks/characters/records/ylva', { activeEncounterKeys: ['fight'] }), order()]
  ];
  for (const [edit, input] of cases) {
    const db = seed(); edit(db); const before = structuredClone([...db.data]);
    await assert.rejects(commitSceneTradeOperation(db, owner, input));
    assert.deepEqual([...db.data], before);
  }
});

test('explicit agreements including free gifts preserve baseline and exact total while invalid agreements write nothing', async () => {
  const db = seed();
  const response = await commitSceneTradeOperation(db, owner, order({ lines: [buy({ priceMode: 'agreed', agreedTotalMinor: 1 })] }));
  assert.equal(response.receipt.lines[0].baselineTotalMinor, 2000);
  assert.equal(response.receipt.lines[0].totalMinor, 1);
  assert.equal(db.data.get('characters/gawain').inventory.moneyState.totalCopper, 999.99);
  assert.equal(db.data.get('characters/ylva').inventory.items[0].purchase.unitCopper, undefined);
  for (const amount of [-1, 1.1, Number.MAX_SAFE_INTEGER + 1]) {
    const invalid = seed(), before = structuredClone([...invalid.data]);
    await assert.rejects(commitSceneTradeOperation(invalid, owner, order({ lines: [buy({ priceMode: 'agreed', agreedTotalMinor: amount })] })));
    assert.deepEqual([...invalid.data], before);
  }
});

test('separate cart lines for the same unpublished item definition publish one immutable version', async () => {
  const db = seed();
  db.data.set('item_register_offers/offer:food', offer({ definitionRef: null, title: 'Neues Hausgebäck', category: 'speisen' }));
  await commitSceneTradeOperation(db, owner, order({ lines: [buy({ quantity: 1 }), buy({ id: 'two', quantity: 1, recipientKey: 'character:gawain' })] }));
  assert.equal([...db.data.keys()].filter(key => key.startsWith('item_definition_versions/')).length, 1);
  assert.equal(db.data.get('characters/gawain').inventory.items.length, 1);
  assert.equal(db.data.get('characters/ylva').inventory.items.length, 1);
});

test('sales always pay from unlimited merchant journal and preserve exact sold quantities outside the catalogue', async () => {
  const db = seed();
  db.data.get('characters/gawain').inventory.items.push({ id: 'apples', instanceId: 'apples-instance', name: 'Persönliche Äpfel', quantity: '5', image: 'apple.webp',
    category: 'other', purchase: { unitCopper: 4 }, description: 'Aus dem Garten', tags: 'persönlich', ownerUid: 'private-owner', privateLegacySecret: 'only-local', origin: { email: 'private@example.test' } });
  const input = order({ lines: [{ id: 'sale', direction: 'sell', sellerKey: 'character:gawain', itemId: 'apples', quantity: 2, priceMode: 'standard', expectedTotalMinor: 400 }] });
  const response = await commitSceneTradeOperation(db, owner, input);
  assert.equal(db.data.get('characters/gawain').inventory.items[0].quantity, '3');
  assert.equal(db.data.get('characters/gawain').inventory.moneyState.totalCopper, 1004);
  assert.equal(db.data.get('characters/merchant').inventory.moneyState.totalCopper, 0);
  const journal = [...db.data].find(([key]) => key.startsWith('item_vendor_wallets/'))[1];
  assert.equal(journal.netMinor, -400);
  const sold = (await readMerchantSoldOperation(db, owner, { merchantId: 'shop' })).items[0];
  assert.equal(sold.item.quantity, '2');
  assert.equal(sold.quantity, 2);
  assert.equal(sold.item.description, undefined);
  assert.notEqual(sold.item.instanceId, 'apples-instance');
  assert.equal(sold.sourceKey, undefined);
  assert.equal(sold.item.ownerUid, undefined); assert.equal(sold.item.origin, undefined); assert.equal(sold.item.privateLegacySecret, undefined); assert.equal(sold.item.purchase, undefined);
  assert.equal([...db.data].find(([key]) => key.startsWith('item_merchant_sold/'))[1].item.ownerUid, 'private-owner');
  assert.equal([...db.data].find(([key]) => key.startsWith('item_merchant_sold/'))[1].item.privateLegacySecret, 'only-local');
  assert.equal(response.receipt.lines[0].totalMinor, 400);
});

test('a named linked horse keeps the original creature and instance when sold', async () => {
  const db = seed();
  db.data.get('characters/gawain').inventory.items.push({ id: 'horse', instanceId: 'named-horse', name: 'Morgenwind', quantity: '1', creatureId: 'horse-creature' });
  db.data.set('creatures/horse-creature', { name: 'Morgenwind', itemOrigin: { inventoryItemId: 'horse', instanceId: 'named-horse', ownerCharacterId: 'gawain' } });
  await commitSceneTradeOperation(db, owner, order({ lines: [{ id: 'sale', direction: 'sell', sellerKey: 'character:gawain', itemId: 'horse', quantity: 1, priceMode: 'agreed', agreedTotalMinor: 500 }] }));
  const sold = (await readMerchantSoldOperation(db, owner, { merchantId: 'shop' })).items[0];
  assert.equal(sold.item.instanceId, 'named-horse'); assert.equal(sold.item.creatureId, undefined);
  assert.equal([...db.data].find(([key]) => key.startsWith('item_merchant_sold/'))[1].item.creatureId, 'horse-creature');
  assert.equal(db.data.get('creatures/horse-creature').itemOrigin.ownerMerchantId, 'shop');
  assert.equal(db.data.get('creatures/horse-creature').itemOrigin.disposition, 'sold');
});

test('unique claims prevent duplicate checkout and move the same possession into the merchant sold pile', async () => {
  const db = seed();
  const defined = await commitItemDefinitionOperation(db, gm, { action: 'save', operationId: 'define', definition: { id: 'unique:shop-sword', title: 'Abendklinge', kind: 'unique', category: 'waffen' } });
  db.data.set('item_register_offers/offer:sword', offer({ id: 'offer:sword', title: 'Abendklinge', category: 'waffen', definitionRef: { id: defined.definition.id, revision: defined.definition.revision } }));
  const input = order({ lines: [buy({ productId: 'offer:sword', quantity: 1, recipientKey: 'character:gawain' })] });
  const bought = await commitSceneTradeOperation(db, owner, input), item = db.data.get('characters/gawain').inventory.items[0];
  const before = structuredClone([...db.data]);
  await assert.rejects(commitSceneTradeOperation(db, owner, order({ operationId: 'again', expectedRevisions: { 'character:gawain': bought.characters[0].inventory.revision }, lines: input.lines })), /existiert bereits/);
  assert.deepEqual([...db.data], before);
  await commitSceneTradeOperation(db, owner, order({ operationId: 'sale', expectedRevisions: { 'character:gawain': db.data.get('characters/gawain').inventory.revision },
    lines: [{ id: 'sale', direction: 'sell', sellerKey: 'character:gawain', itemId: item.id, quantity: 1, priceMode: 'standard', expectedTotalMinor: 500 }] }));
  const claim = db.data.get('item_unique_claims/unique:shop-sword');
  assert.equal(claim.instanceId, item.instanceId); assert.equal(claim.holder.kind, 'vendor'); assert.equal(claim.holder.recordId, 'shop');
  assert.equal((await readMerchantSoldOperation(db, owner, { merchantId: 'shop' })).items[0].item.id, item.id);
});

test('competing buyers cannot clone an explicit unique item even with unlimited stock', async () => {
  const db = seed();
  const defined = await commitItemDefinitionOperation(db, gm, { action: 'save', operationId: 'define', definition: { id: 'unique:last', title: 'Einzelstück', kind: 'unique', category: 'arkanes' } });
  db.data.set('item_register_offers/offer:food', offer({ definitionRef: defined.definition, category: 'arkanes', stock: null }));
  const results = await Promise.allSettled([
    commitSceneTradeOperation(db, gm, order({ lines: [buy({ quantity: 1, recipientKey: 'character:gawain' })] })),
    commitSceneTradeOperation(db, gm, order({ operationId: 'competing', actorCharacterId: 'ylva', lines: [buy({ quantity: 1, payerKey: 'character:ylva' })] }))
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal([...db.data.keys()].filter(key => key.startsWith('scene_trade_transactions/')).length, 1);
  assert.equal(db.data.get('characters/gawain').inventory.items.length + db.data.get('characters/ylva').inventory.items.length, 1);
});

test('signed-in players use group money and stock regardless of managers while membership and scene links remain required', async () => {
  const db = seed(), group = entry();
  group.id = 'crew';
  group.pages.push({ hierarchyPage: true, hierarchy: { trees: [{ label: 'Aktive', levels: [{ nodes: [{ title: 'Ritter', subtitle: 'gawain' }] }] }] } });
  group.pages.push({ landingPage: true, landing: { group: { members: [{ id: 'hierarchy:gawain', characterId: 'gawain' }], guests: [], sceneThreads: ['adventure::session:shop'] } } });
  db.data.set('module_store_entries/crew', { entryJson: JSON.stringify(group) });
  db.data.set('group_quest_accounts/crew', { id: 'crew', name: 'Gruppe', managerUids: ['other-manager'], revision: 1,
    inventory: { revision: 1, items: [{ id: 'supplies', name: 'Vorräte', quantity: '2', purchase: { unitCopper: 4 } }], moneyState: { totalCopper: 50 } } });
  const input = order({ expectedRevisions: { 'group:crew': 1, 'character:ylva': 1 }, lines: [buy({ payerKey: 'group:crew' }),
    { id: 'sale', direction: 'sell', sellerKey: 'group:crew', itemId: 'supplies', quantity: 1, priceMode: 'standard', expectedTotalMinor: 200 }] });
  const response = await commitSceneTradeOperation(db, player, input);
  assert.equal(response.groups[0].inventory.moneyState.totalCopper, 32);
  assert.equal(response.groups[0].revision, 2);
  assert.equal(response.groups[0].inventory.items[0].quantity, '1');
  assert.deepEqual(response.groups[0].managerUids, ['other-manager']);
  assert.equal(db.data.get('characters/gawain').inventory.moneyState.totalCopper, 1000);
  db.data.get('group_quest_accounts/crew').managerUids = [];
  await commitSceneTradeOperation(db, player, order({ operationId: 'without-managers',
    expectedRevisions: { 'group:crew': 2, 'character:ylva': db.data.get('characters/ylva').inventory.revision },
    lines: [buy({ payerKey: 'group:crew', quantity: 1 })] }));
  assert.equal(db.data.get('group_quest_accounts/crew').inventory.moneyState.totalCopper, 22);
  assert.deepEqual(db.data.get('group_quest_accounts/crew').managerUids, []);
  for (const mutate of [
    state => { const source = JSON.parse(state.data.get('module_store_entries/crew').entryJson); source.pages[1].hierarchy.trees[0].levels[0].nodes[0].subtitle = 'ylva'; source.pages[2].landing.group.members[0] = { id: 'hierarchy:ylva', characterId: 'ylva' }; state.data.set('module_store_entries/crew', { entryJson: JSON.stringify(source) }); },
    state => { const source = JSON.parse(state.data.get('module_store_entries/crew').entryJson); source.pages[2].landing.group.sceneThreads = []; state.data.set('module_store_entries/crew', { entryJson: JSON.stringify(source) }); }
  ]) {
    const state = database(Object.fromEntries(structuredClone([...db.data])));
    mutate(state); const before = structuredClone([...state.data]);
    const rejected = { ...input, operationId: 'rejected', expectedRevisions: { 'group:crew': 3, 'character:ylva': state.data.get('characters/ylva').inventory.revision } };
    await assert.rejects(commitSceneTradeOperation(state, player, rejected));
    assert.deepEqual([...state.data], before);
  }
});

test('trade collections are included in backups and sold-pile reads require authentication and a real merchant', async () => {
  assert.ok(ITEM_BACKUP_COLLECTIONS.includes('scene_trade_transactions'));
  assert.ok(ITEM_BACKUP_COLLECTIONS.includes('item_merchant_sold'));
  const unauthenticated = seed(), before = structuredClone([...unauthenticated.data]);
  await assert.rejects(commitSceneTradeOperation(unauthenticated, null, order()), /Anmeldung/);
  assert.deepEqual([...unauthenticated.data], before);
  await assert.rejects(readMerchantSoldOperation(seed(), null, { merchantId: 'shop' }), /Anmeldung/);
  await assert.rejects(readMerchantSoldOperation(seed(), owner, { merchantId: 'unknown' }), /nicht gefunden/);
});

test('merchant names may contain spaces and accents; the sold projection shows the newest hundred entries', async () => {
  const db = seed(), merchantId = 'Arkanist Gwynthör';
  db.data.get('item_register_offers/offer:food').listId = merchantId;
  for (let index = 0; index < 103; index++) db.data.set(`item_merchant_sold/item-${index}`, { merchantId, item: { name: `Fund ${index}` }, quantity: 1,
    totalMinor: 1, status: 'sold', at: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(), sourceKey: 'character:gawain' });
  const sold = await readMerchantSoldOperation(db, owner, { merchantId });
  assert.equal(sold.items.length, 100); assert.equal(sold.limited, true);
  assert.equal(sold.items[0].item.name, 'Fund 102'); assert.equal(sold.items.at(-1).item.name, 'Fund 3');
  assert.equal(sold.items[0].sourceKey, undefined);
  const older = await readMerchantSoldOperation(db, owner, { merchantId, cursor: sold.nextCursor });
  assert.equal(older.items.length, 3); assert.equal(older.items[0].item.name, 'Fund 2'); assert.equal(older.nextCursor, null);
  await commitSceneTradeOperation(db, owner, order({ merchantId }));
});

test('sold pagination covers tied timestamps once and rejects malformed cursors', async () => {
  const db = seed(), at = '2026-11-04T12:00:00.000Z';
  for (let index = 0; index < 105; index++) db.data.set(`item_merchant_sold/item-${String(index).padStart(3, '0')}`, { merchantId: 'shop', item: { name: `Fund ${index}` }, quantity: 1, totalMinor: 1, status: 'sold', at });
  const first = await readMerchantSoldOperation(db, owner, { merchantId: 'shop' });
  const second = await readMerchantSoldOperation(db, owner, { merchantId: 'shop', cursor: first.nextCursor });
  assert.equal(first.items.length, 100); assert.equal(second.items.length, 5); assert.equal(second.nextCursor, null);
  assert.equal(new Set([...first.items, ...second.items].map(item => item.id)).size, 105);
  assert.equal(first.items[0].id, 'item-104'); assert.equal(second.items.at(-1).id, 'item-000');
  for (const cursor of [{ at, id: '../secret' }, { at: 'bad-date', id: 'one' }, { at, id: 3 }]) await assert.rejects(readMerchantSoldOperation(db, owner, { merchantId: 'shop', cursor }), /Seitenzeiger/);
  db.data.set('item_merchant_sold/foreign-cursor', { merchantId: 'other-shop', at });
  await assert.rejects(readMerchantSoldOperation(db, owner, { merchantId: 'shop', cursor: { at, id: 'foreign-cursor' } }), /Händlerablage/);
});

test('module merchant source is resolved authoritatively and hidden or stale source rejects without writes', async () => {
  const db = seed(), merchant = { id: 'arkanist', title: 'Arkanist Gwynthors', pages: [{ goodsTablePage: true, goodsTable: { tables: [{ id: 'goods', columns: [], rows: [
    { id: 'chalk', values: { name: 'Arkane Kreide', kind: 'Werkzeug', price: '3 KT' } }
  ] }] } }] };
  db.data.set('module_store_entries/arkanist', { entryJson: JSON.stringify(merchant) });
  db.data.get('char_tabs/config').moduleStoreManifest.customSections[0].entryIds.push('arkanist');
  const product = buildModuleOffers([merchant], STANDARD_ITEMS)[0];
  const input = order({ merchantId: 'module:arkanist', lines: [buy({ productId: product.id, moduleId: 'arkanist', sourceRevision: product.sourceRevision, expectedTotalMinor: 600 })] });
  for (const mutate of [
    state => { state.data.get('char_tabs/config').moduleStoreManifest.hiddenModuleIds.arkanist = true; },
    state => { state.data.set('module_store_entries/arkanist', { entryJson: JSON.stringify({ ...merchant, title: 'Neuer Name' }) }); }
  ]) {
    const state = database(Object.fromEntries(structuredClone([...db.data]))); mutate(state); const before = structuredClone([...state.data]);
    await assert.rejects(commitSceneTradeOperation(state, owner, input)); assert.deepEqual([...state.data], before);
  }
  await commitSceneTradeOperation(db, owner, input);
  assert.equal(db.data.get('characters/gawain').inventory.moneyState.totalCopper, 994);
  assert.equal(db.data.get('characters/ylva').inventory.items[0].name, 'Arkane Kreide');
});

test('availability is read-only and follows unique possession claims through catalogue revisions and sale', async () => {
  const db = seed();
  db.data.set('item_register_offers/offer:food', offer({ definitionRef: null, definitionKind: 'unique', category: 'arkanes', title: 'Einmaliger Kristall', stock: null }));
  const before = structuredClone([...db.data]);
  const initial = await readMerchantAvailabilityOperation(db, owner, { merchantId: 'shop' });
  assert.equal(initial.products[0].unique, true); assert.equal(initial.products[0].status, 'available');
  assert.deepEqual([...db.data], before);
  const bought = await commitSceneTradeOperation(db, owner, order({ lines: [buy({ quantity: 1, recipientKey: 'character:gawain' })] }));
  const possession = db.data.get('characters/gawain').inventory.items[0];
  db.data.get('item_register_offers/offer:food').title = 'Kristall mit neuem Preis';
  db.data.get('item_register_offers/offer:food').priceRange.minCopper = 20;
  db.data.get('item_register_offers/offer:food').definitionRef = possession.definitionRef;
  const after = structuredClone([...db.data]);
  const owned = await readMerchantAvailabilityOperation(db, { uid: 'other-user', token: {} }, { merchantId: 'shop' });
  assert.equal(owned.products[0].status, 'owned'); assert.equal(owned.products[0].available, false);
  assert.deepEqual([...db.data], after);
  await commitSceneTradeOperation(db, owner, order({ operationId: 'sale', expectedRevisions: { 'character:gawain': bought.characters[0].inventory.revision },
    lines: [{ id: 'sale', direction: 'sell', sellerKey: 'character:gawain', itemId: possession.id, quantity: 1, priceMode: 'standard', expectedTotalMinor: 500 }] }));
  assert.equal((await readMerchantAvailabilityOperation(db, owner, { merchantId: 'shop' })).products[0].status, 'sold');
});

test('trade receipts cannot be deleted by generic combat undo even with administrative force', async () => {
  const db = seed(), response = await commitSceneTradeOperation(db, owner, order()), before = structuredClone([...db.data]);
  for (const auth of [owner, gm]) await assert.rejects(undoMechanicalCommentOperation({ auth,
    data: { entryId: order().entryId, commentId: response.commentId, force: auth === gm } }, { database: db }), /Gegenbuchung/);
  assert.deepEqual([...db.data], before);
});

test('sold creature edits honor the merchant binding while ordinary owned creature edits remain available', async () => {
  const db = seed(), original = { name: 'Morgenwind', ownerUid: 'owner', createdBy: 'original-author', combatProfile: { revision: 1, hitPoints: { current: 7 } },
    itemOrigin: { inventoryItemId: 'horse', instanceId: 'horse-instance', ownerCharacterId: '', ownerMerchantId: 'shop', disposition: 'sold' } };
  db.data.set('creatures/horse', original);
  const before = structuredClone([...db.data]);
  for (const data of [{ name: 'Gefälschter Name' }, { itemOrigin: { disposition: 'owned', ownerCharacterId: 'gawain' } }, { combatProfile: { hitPoints: { current: 100 } } }]) {
    await assert.rejects(commitItemRecordOperation(db, owner, { id: 'horse', kind: 'creatures', operationId: 'edit-sold', data }), /verkauftes Tier/);
    assert.deepEqual([...db.data], before);
  }
  await commitItemRecordOperation(db, gm, { id: 'horse', kind: 'creatures', operationId: 'gm-note', data: { notes: 'Geprüfte Händlernotiz' } });
  assert.equal(db.data.get('creatures/horse').ownerUid, 'owner'); assert.equal(db.data.get('creatures/horse').createdBy, 'original-author');
  assert.deepEqual(db.data.get('creatures/horse').itemOrigin, original.itemOrigin); assert.equal(db.data.get('creatures/horse').combatProfile.hitPoints.current, 7);
  db.data.set('creatures/ordinary', { name: 'Gewöhnliches Tier', ownerUid: 'owner', createdBy: 'owner' });
  await commitItemRecordOperation(db, owner, { id: 'ordinary', kind: 'creatures', operationId: 'ordinary-edit', data: { notes: 'Weiterhin editierbar' } });
  assert.equal(db.data.get('creatures/ordinary').notes, 'Weiterhin editierbar');
  await assert.rejects(commitItemRecordOperation(db, owner, { id: 'ordinary', kind: 'creatures', operationId: 'forge-binding', data: { itemOrigin: original.itemOrigin } }), /ausschließlich/);
});

test('changed authoritative buyback aborts a reviewed standard sale instead of silently changing proceeds', async () => {
  const db = seed();
  db.data.get('characters/gawain').inventory.items.push({ id: 'food', instanceId: 'food-instance', offerId: 'offer:food', name: 'Gebäck', quantity: '1', purchase: { unitCopper: 10 } });
  db.data.get('item_register_offers/offer:food').buybackCopper = 3;
  const input = order({ expectedRevisions: { 'character:gawain': 1 }, lines: [{ id: 'sale', direction: 'sell', sellerKey: 'character:gawain', itemId: 'food', quantity: 1, priceMode: 'standard', expectedTotalMinor: 500 }] });
  const before = structuredClone([...db.data]);
  await assert.rejects(commitSceneTradeOperation(db, owner, input), error => error.code === 'aborted');
  assert.deepEqual([...db.data], before);
  await commitSceneTradeOperation(db, owner, { ...input, lines: [{ ...input.lines[0], expectedTotalMinor: 300 }] });
  assert.equal(db.data.get('characters/gawain').inventory.moneyState.totalCopper, 1003);
});
