import test from 'node:test';
import assert from 'node:assert/strict';
import { undoMechanicalCommentOperation } from '../src/mechanics/commit-undo-mechanical-comment.js';
import { database } from './fixtures/combat-transaction-database.js';

test('group-account receipts cannot be deleted as combat undo, including administrative force', async () => {
  for (const [role, force] of [['player', false], ['moderator', false], ['admin', true]]) {
    const db = database({
      'comments/group-transfer': { entryId: 'crew::session:camp', serverValidatedMechanics: true,
        inventoryTransaction: { schemaVersion: 3, validatedBy: 'commitGroupInventory', group: true },
        sceneInventoryTransfer: { transferId: 'paid-once' } },
      'group_quest_accounts/crew': { revision: 2, inventory: { moneyState: { totalCopper: 29 } } },
      'characters/recipient': { inventory: { revision: 2, moneyState: { totalCopper: 11 } } }
    });
    const before = structuredClone([...db.data]);
    await assert.rejects(undoMechanicalCommentOperation({ auth: { uid: 'tester', token: { aleriaRole: role } },
      data: { entryId: 'crew::session:camp', commentId: 'group-transfer', force }
    }, { database: db }), error => error.code === 'failed-precondition' && /Gegenbuchung/.test(error.message));
    assert.deepEqual([...db.data], before);
  }
});
