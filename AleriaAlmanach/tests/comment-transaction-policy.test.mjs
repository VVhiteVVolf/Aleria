import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../modules/comments/comments-transaction-policy.js', import.meta.url), 'utf8');

function loadPolicy() {
  const window = {};
  vm.runInContext(source, vm.createContext({ window }));
  return window.AleriaCommentTransactions;
}

test('normale Kommentare bleiben bearbeitbar und löschbar', () => {
  const policy = loadPolicy();
  const comment = { commentMode: 'character', commentSegments: [{ kind: 'speech', text: 'Hallo' }] };
  assert.equal(policy.isImmutable(comment), false);
  assert.doesNotThrow(() => policy.assertMutable(comment, 'gelöscht'));
});

test('Profiltransaktionen werden als unveränderlicher Szenenverlauf erkannt', () => {
  const policy = loadPolicy();
  const samples = [
    { combatTransaction: { transactionId: 'combat-1' } },
    { inventoryTransaction: { transactionId: 'inventory-1' } },
    { restTransaction: { transactionId: 'rest-1' } },
    { sceneRest: { type: 'long' } },
    { commentSegments: [{ combatResolution: { resolutionId: 'resolution-1' } }] },
    { commentSegments: [{ inventoryUse: { usageId: 'usage-1' } }] }
  ];
  samples.forEach(comment => assert.equal(policy.isImmutable(comment), true));
});

test('Würfel- und Fertigkeitsbeiträge bleiben als Mechanikbeleg erhalten', () => {
  const policy = loadPolicy();
  assert.deepEqual(Array.from(policy.getKinds({ sceneDiceRoll: { total: 12 } })), ['dice']);
  assert.deepEqual(Array.from(policy.getKinds({ commentSegments: [{ skillResolution: { resolutionId: 'skill-1' } }] })), ['skill']);
});

test('reine Szenenzeit-Einträge bleiben klassifiziert, sind aber löschbar', () => {
  const policy = loadPolicy();
  const comment = { sceneTimeEvent: { anchorDay: 2 } };
  assert.deepEqual(Array.from(policy.getKinds(comment)), ['time']);
  assert.equal(policy.isImmutable(comment), false);
  assert.doesNotThrow(() => policy.assertMutable(comment, 'gelöscht'));
});

test('Szenenzeit hebt den Schutz einer verbundenen Zustandsänderung nicht auf', () => {
  const policy = loadPolicy();
  const comment = {
    sceneTimeEvent: { anchorDay: 2 },
    inventoryTransaction: { transactionId: 'inventory-1' }
  };
  assert.deepEqual(Array.from(policy.getKinds(comment)), ['inventory', 'time']);
  assert.equal(policy.isImmutable(comment), true);
});

test('Sperrfehler erklärt die notwendige Gegenbuchung', () => {
  const policy = loadPolicy();
  assert.throws(
    () => policy.assertMutable({ combatTransaction: { transactionId: 'combat-1' } }, 'gelöscht'),
    error => error.code === 'immutable-mechanical-comment' && /Gegenbuchung/.test(error.message)
  );
});
