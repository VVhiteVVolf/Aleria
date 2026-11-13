import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStudRegistrations } from '../modules/gwynthor-horse-studs/stud-module.mjs';
import { buildResaleRegistration } from '../modules/gwynthor-horse-resale/resale-module.mjs';
import { database } from '../../firebase/functions/tests/fixtures/combat-transaction-database.js';
import { commitSceneTradeOperation } from '../../firebase/functions/src/scene-trade/commit-scene-trade.js';
import { readTradeMerchant } from '../../firebase/functions/src/scene-trade/scene-trade-context.js';
import { readMerchantAvailabilityOperation } from '../../firebase/functions/src/scene-trade/scene-trade-availability.js';
const auth = { uid: 'fixture-owner', token: {} };
const cases = [...buildStudRegistrations().map(r => ({ ...r, expectedHorses: 6 })), { ...buildResaleRegistration(), expectedHorses: 4 }];
for (const { entry, expectedHorses } of cases) test(`${entry.id}: all ${expectedHorses} real horses can be bought exactly once in isolated transactions`, async () => {
  const merchantId = `module:${entry.id}`;
  const manifest = { customSections: [{ tab: 'Abenteuer', entryIds: [entry.id] }], hiddenModuleIds: {}, entryOverrideIds: [] };
  const seed = () => database({
    [`module_store_entries/${entry.id}`]: { entryJson: JSON.stringify(entry) }, 'char_tabs/config': { moduleStoreManifest: manifest },
    'characters/buyer': { id: 'buyer', name: 'Fixture', ownerUid: auth.uid,
      inventory: { revision: 1, items: [], moneyState: { totalCopper: 100000000 } }, combatProfile: { revision: 9, hitPoints: { current: 7 } } }
  });
  const catalogDatabase = seed();
  const catalog = await catalogDatabase.runTransaction(transaction => readTradeMerchant(catalogDatabase, transaction, merchantId, manifest));
  const horses = catalog.products.filter(p => p.definitionKind === 'unique'); assert.equal(horses.length, expectedHorses);
  for (const horse of horses) {
    const db = seed(), beforeProfile = structuredClone(db.data.get('characters/buyer').combatProfile);
    const input = { action: 'catalog-checkout', operationId: `first-${horse.id}`, entryId: entry.id, merchantId, actorCharacterId: 'buyer',
      expectedRevisions: { 'character:buyer': 1 }, lines: [{ id: 'horse', direction: 'buy', productId: horse.id, moduleId: entry.id,
        sourceRevision: horse.sourceRevision, quantity: 1, payerKey: 'character:buyer', recipientKey: 'character:buyer', priceMode: 'standard',
        expectedTotalMinor: Math.round(horse.priceRange.minCopper * 100) }] };
    await commitSceneTradeOperation(db, auth, input);
    assert.equal(db.data.get('characters/buyer').inventory.items.length, 1);
    assert.equal(db.data.get('characters/buyer').inventory.items[0].name, horse.title);
    assert.deepEqual(db.data.get('characters/buyer').combatProfile, beforeProfile);
    const availability = await readMerchantAvailabilityOperation(db, auth, { merchantId });
    assert.equal(availability.products.find(p => p.productId === horse.id).available, false);
    const purchased = structuredClone([...db.data]);
    await assert.rejects(commitSceneTradeOperation(db, auth, { ...input, operationId: `second-${horse.id}`,
      expectedRevisions: { 'character:buyer': db.data.get('characters/buyer').inventory.revision } }), error => error.code === 'already-exists');
    assert.deepEqual([...db.data], purchased);
  }
});
