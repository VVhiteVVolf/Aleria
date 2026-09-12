import test from 'node:test';
import assert from 'node:assert/strict';
import { commitItemRegisterOperation } from '../src/mechanics/commit-item-register.js';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../src/generated/item-register/item-register-standard.js';

const clone = value => value == null ? value : structuredClone(value);
// Transaction harness rejects reads after writes and publishes only successful
// transactions. Concurrent calls serialize just like a retried conflicting write.
function database(initial = {}) {
  const data = new Map(Object.entries(initial));
  let queue = Promise.resolve(); let nextId = 0;
  const doc = path => ({ path, id: path.split('/').at(-1) });
  return { data, doc, collection: path => ({ doc: id => doc(`${path}/${id || `new-${++nextId}`}`) }),
    runTransaction(callback) {
      const task = queue.catch(() => {}).then(async () => {
        const writes = [];
        const result = await callback({
          async get(ref) {
            assert.equal(writes.length, 0, 'all reads precede all writes');
            const value = clone(data.get(ref.path));
            return { exists: value != null, id: ref.id, data: () => value };
          },
          set(ref, value) { writes.push(() => data.set(ref.path, clone(value))); },
          update(ref, value) { writes.push(() => { assert.ok(data.has(ref.path)); data.set(ref.path, { ...data.get(ref.path), ...clone(value) }); }); },
          create(ref, value) { writes.push(() => { assert.ok(!data.has(ref.path)); data.set(ref.path, clone(value)); }); }
        });
        writes.forEach(write => write()); return result;
      });
      queue = task; return task;
    }
  };
}
const horse = STANDARD_ITEMS.find(item => item.title === 'Afol');
const auth = { uid: 'owner', token: { aleriaRole: 'player' } };
const record = () => ({ id: 'gawain', name: 'Gawain', ownerUid: 'owner', inventory: { revision: 1, items: [], moneyState: { totalCopper: 3000 } }, combatProfile: {} });
const purchase = (overrides = {}) => ({ action: 'buy', operationId: 'purchase-1', standardVersion: STANDARD_VERSION,
  characterId: 'gawain', expectedRevision: 1, productId: horse.id, quantity: 1, unitCopper: 400, ...overrides });

test('backend commits inventory and wallet exactly once on a retried purchase', async () => {
  const db = database({ 'characters/gawain': record() });
  const input = purchase();
  const first = await commitItemRegisterOperation(db, auth, input);
  const second = await commitItemRegisterOperation(db, auth, input);
  assert.equal(first.receipt.itemId, second.receipt.itemId);
  assert.equal(db.data.get('characters/gawain').inventory.items.length, 1);
  assert.equal(db.data.get('characters/gawain').inventory.moneyState.totalCopper, 2600);
  await assert.rejects(commitItemRegisterOperation(db, auth, { ...input, unitCopper: 500 }), /bereits verwendet/);
});
test('backend rejects stale records, unauthorized owners, outdated standards and active combat without any write', async () => {
  const db = database({ 'characters/gawain': record() });
  await assert.rejects(commitItemRegisterOperation(db, null, purchase()), /Anmeldung/);
  await assert.rejects(commitItemRegisterOperation(db, { uid: 'other', token: {} }, purchase()), /Besitzer/);
  await assert.rejects(commitItemRegisterOperation(db, auth, purchase({ expectedRevision: 0 })), /zwischenzeitlich/);
  await assert.rejects(commitItemRegisterOperation(db, auth, purchase({ standardVersion: 'old' })), /aktualisiert/);
  db.data.set('combat_profile_locks/characters/records/gawain', { activeEncounterKeys: ['battle'] });
  await assert.rejects(commitItemRegisterOperation(db, auth, purchase()), /Kampf/);
  assert.equal(db.data.get('characters/gawain').inventory.moneyState.totalCopper, 3000);
});
test('concurrent buyers cannot oversell a provider', async () => {
  const offer = { ...horse, id: 'offer:last-horse', templateId: horse.id, section: 'offer', stock: 1, revision: 1 };
  const db = database({ 'characters/gawain': record(), 'characters/other': { ...record(), id: 'other' }, 'item_register_offers/offer:last-horse': offer });
  const first = purchase({ productId: offer.id, offerRevision: 1 });
  const results = await Promise.allSettled([commitItemRegisterOperation(db, auth, first), commitItemRegisterOperation(db, auth, { ...first, characterId: 'other', operationId: 'purchase-2' })]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(db.data.get('item_register_offers/offer:last-horse').stock, 0);
});
test('horse purchase, creature creation, rename and sale preserve identity and update both records', async () => {
  const db = database({ 'characters/gawain': record() });
  const bought = await commitItemRegisterOperation(db, auth, purchase());
  const itemId = bought.receipt.itemId;
  const operation = (action, id, extra = {}) => ({ action, operationId: id, characterId: 'gawain', inventoryItemId: itemId,
    expectedRevision: db.data.get('characters/gawain').inventory.revision, ...extra });
  const linked = await commitItemRegisterOperation(db, auth, operation('link-creature', 'link-1'));
  assert.equal(linked.creature.itemOrigin.instanceId, itemId);
  await commitItemRegisterOperation(db, auth, operation('customize', 'rename-1', { name: 'Morgenwind', description: 'Treue Stute' }));
  assert.equal(db.data.get(`creatures/${linked.creature.id}`).name, 'Morgenwind');
  assert.equal(db.data.get('characters/gawain').inventory.items[0].name, 'Morgenwind');
  await commitItemRegisterOperation(db, auth, operation('sell', 'sell-1', { standardVersion: STANDARD_VERSION, productId: horse.id, quantity: 1, unitCopper: 200 }));
  assert.equal(db.data.get('characters/gawain').inventory.items.length, 0);
  assert.equal(db.data.get('characters/gawain').inventory.moneyState.totalCopper, 2800);
  assert.equal(db.data.get(`creatures/${linked.creature.id}`).itemOrigin.disposition, 'sold');
  assert.equal(db.data.get(`creatures/${linked.creature.id}`).itemOrigin.ownerCharacterId, '');
});
test('provider edits require editorial role and current revision; standards cannot be overwritten', async () => {
  const db = database();
  const offer = { id: 'offer:custom', title: 'Mein Afol', templateId: horse.id, listId: 'list:one', listName: 'Rossmarkt', priceRange: { minCopper: 500, maxCopper: 800 } };
  const input = { action: 'save-offer', operationId: 'edit-1', offer, expectedRevision: 0 };
  await assert.rejects(commitItemRegisterOperation(db, auth, input), /Redaktion/);
  const editor = { uid: 'editor', token: { aleriaRole: 'editor' } };
  const saved = await commitItemRegisterOperation(db, editor, input);
  assert.equal(saved.offer.revision, 1);
  await assert.rejects(commitItemRegisterOperation(db, editor, { ...input, operationId: 'edit-2' }), /zwischenzeitlich/);
  await assert.rejects(commitItemRegisterOperation(db, editor, { ...input, operationId: 'edit-3', offer: { ...offer, id: horse.id } }), /eigene ID/);
});
