import assert from 'node:assert/strict';
import test from 'node:test';

import { lootClaimCommitInternals } from '../src/mechanics/commit-loot-claim.js';

test('leitet die Kreatur-Datensatz-ID je nach Persistenzart ab', () => {
  assert.equal(
    lootClaimCommitInternals.creatureRecordIdForPersistence({ kind: 'scene-creature', sourceCreatureId: 'draig-waffenknecht' }),
    'draig-waffenknecht'
  );
  assert.equal(
    lootClaimCommitInternals.creatureRecordIdForPersistence({ kind: 'creature', recordId: 'creature-42' }),
    'creature-42'
  );
  assert.equal(lootClaimCommitInternals.creatureRecordIdForPersistence({ kind: 'character', recordId: 'gawain' }), '');
  assert.equal(lootClaimCommitInternals.creatureRecordIdForPersistence({}), '');
});

test('summiert doppelt angeforderte Gegenstands-IDs zu einer Menge', () => {
  const merged = lootClaimCommitInternals.mergeRequestedItemQuantities([
    { id: 'sword', quantity: 1 },
    { id: 'sword', quantity: 5 },
    { id: 'coin', quantity: 3 }
  ]);
  assert.equal(merged.get('sword'), 6);
  assert.equal(merged.get('coin'), 3);
});

test('validiert angeforderte Gegenstände gegen die serverseitige Beute-Tabelle und kappt auf das Maximum', () => {
  const lootTable = [
    { id: 'sword', name: 'Kurzschwert', quantity: 1, notes: '' },
    { id: 'arrows', name: 'Pfeile', quantity: 5, notes: 'Bündel' }
  ];
  const items = lootClaimCommitInternals.validateRequestedItems([
    { id: 'sword', quantity: 9999 },
    { id: 'arrows', quantity: 2 }
  ], lootTable);
  assert.equal(items.find(item => item.id === 'sword').quantity, 1);
  assert.equal(items.find(item => item.id === 'arrows').quantity, 2);
});

test('lehnt eine angeforderte Gegenstands-ID ab, die nicht zur Beute-Tabelle gehört', () => {
  assert.throws(
    () => lootClaimCommitInternals.validateRequestedItems([{ id: 'unbekannt', quantity: 1 }], [{ id: 'sword', name: 'Kurzschwert', quantity: 1 }]),
    error => {
      assert.equal(error.code, 'failed-precondition');
      return true;
    }
  );
});

test('lehnt eine leere Auswahl ab', () => {
  assert.throws(
    () => lootClaimCommitInternals.validateRequestedItems([], [{ id: 'sword', name: 'Kurzschwert', quantity: 1 }]),
    error => {
      assert.equal(error.code, 'invalid-argument');
      return true;
    }
  );
});

test('legt Beute mit eigener Besitzidentität an und erhält gleichnamigen Altbesitz', () => {
  const now = new Date('2026-08-07T12:00:00.000Z');
  const receiver = { id: 'gawain', name: 'Gawain Draig', inventory: { items: [{ id: 'old-1', name: 'Pfeile', quantity: '2' }] } };
  const inventory = lootClaimCommitInternals.applyLootToInventory(receiver, [
    { id: 'sword', name: 'Kurzschwert', quantity: 1, notes: '' },
    { id: 'arrows', name: 'Pfeile', quantity: 3, notes: 'Bündel' }
  ], now);
  const sword = inventory.items.find(item => item.name === 'Kurzschwert');
  assert.ok(sword);
  assert.equal(sword.quantity, '1');
  assert.equal(sword.ownerCharacterId, 'gawain');
  const arrows = inventory.items.filter(item => item.name === 'Pfeile');
  assert.deepEqual(arrows.map(item => item.quantity), ['2', '3']);
  assert.equal(arrows[1].instanceId, arrows[1].id);
  assert.equal(arrows[1].description, 'Bündel');
  assert.equal(receiver.inventory.items.length, 1);
});

test('leere Beute erzeugt keinen Gegenstand durch Aufrundung auf eins', () => {
  assert.throws(() => lootClaimCommitInternals.validateRequestedItems([{ id: 'empty', quantity: 1 }],
    [{ id: 'empty', name: 'Leer', quantity: 0 }]), /nicht mehr verfügbar/);
});

test('gleichnamige Beute verändert niemals den Statblock vorhandener Ausrüstung', () => {
  const receiver = { id: 'owner', inventory: { items: [{ id: 'unique', name: 'Schwert', quantity: '1',
    combatDefinition: { kind: 'weapon', damageFormula: '1d8', damageBonus: 1 } }] } };
  const before = structuredClone(receiver);
  const inventory = lootClaimCommitInternals.applyLootToInventory(receiver, [{ name: 'Schwert', quantity: 1, notes: 'Gewöhnlich' }], new Date());
  assert.deepEqual(receiver, before);
  assert.deepEqual(inventory.items[0], before.inventory.items[0]);
  assert.equal(inventory.items.length, 2);
});
