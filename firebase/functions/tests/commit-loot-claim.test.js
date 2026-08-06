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

test('legt Beute als neuen Inventareintrag an und fasst gleichnamige Gegenstände zusammen', () => {
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
  const arrows = inventory.items.find(item => item.name === 'Pfeile');
  assert.equal(arrows.quantity, '5');
  assert.equal(inventory.items.filter(item => item.name === 'Pfeile').length, 1);
});
