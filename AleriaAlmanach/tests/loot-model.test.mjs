import assert from 'node:assert/strict';
import test from 'node:test';

import {
  collectClaimedLootActorIds,
  isLootClaimComment,
  LOOT_CLAIM_EVENT_KIND,
  normalizeLootClaimEvent,
  normalizeLootClaimItem
} from '../modules/loot/loot-model.js';

test('normalisiert einen Beute-Gegenstand mit Standardwerten', () => {
  const item = normalizeLootClaimItem({ name: 'Kurzschwert', quantity: '2', notes: 'leicht angerostet' }, 0);
  assert.equal(item.name, 'Kurzschwert');
  assert.equal(item.quantity, 2);
  assert.equal(item.notes, 'leicht angerostet');
  assert.ok(item.id);
});

test('normalisiert ein Beute-Anspruchsereignis vollständig', () => {
  const event = normalizeLootClaimEvent({
    encounterId: 'encounter-1',
    actorId: 'draig-waffenknecht-II',
    actorName: 'Draig Waffenknecht II',
    receiverId: 'char-gawain',
    receiverName: 'Gawain Draig',
    items: [{ id: 'loot-1', name: 'Kurzschwert', quantity: 1 }]
  });
  assert.equal(event.kind, LOOT_CLAIM_EVENT_KIND);
  assert.equal(event.encounterId, 'encounter-1');
  assert.equal(event.actorId, 'draig-waffenknecht-II');
  assert.equal(event.receiverId, 'char-gawain');
  assert.equal(event.items.length, 1);
  assert.equal(event.items[0].name, 'Kurzschwert');
});

test('erkennt einen Beute-Anspruch-Kommentar anhand von Kind, Modus oder Nutzlast', () => {
  assert.equal(isLootClaimComment({ commentKind: LOOT_CLAIM_EVENT_KIND }), true);
  assert.equal(isLootClaimComment({ commentMode: 'loot-claim' }), true);
  assert.equal(isLootClaimComment({ lootClaim: { encounterId: 'x' } }), true);
  assert.equal(isLootClaimComment({ text: 'Ein normaler Kommentar' }), false);
});

test('sammelt bereits beanspruchte Kreatur-Instanzen je Kampf', () => {
  const comments = [
    { commentKind: LOOT_CLAIM_EVENT_KIND, lootClaim: { encounterId: 'encounter-1', actorId: 'draig-I' } },
    { commentKind: LOOT_CLAIM_EVENT_KIND, lootClaim: { encounterId: 'encounter-2', actorId: 'draig-II' } },
    { commentKind: 'combataction', text: 'Ein Angriff' }
  ];
  const claimed = collectClaimedLootActorIds(comments, 'encounter-1');
  assert.equal(claimed.size, 1);
  assert.ok(claimed.has('draig-I'));
  assert.equal(claimed.has('draig-II'), false);
});

test('sammelt Beute-Ansprüche über alle Kämpfe, wenn keine Kampfkennung übergeben wird', () => {
  const comments = [
    { commentKind: LOOT_CLAIM_EVENT_KIND, lootClaim: { encounterId: 'encounter-1', actorId: 'draig-I' } },
    { commentKind: LOOT_CLAIM_EVENT_KIND, lootClaim: { encounterId: 'encounter-2', actorId: 'draig-II' } }
  ];
  const claimed = collectClaimedLootActorIds(comments, '');
  assert.equal(claimed.size, 2);
});
