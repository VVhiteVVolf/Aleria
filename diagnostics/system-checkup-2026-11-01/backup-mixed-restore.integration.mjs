// Diagnostic reproduction of the current mixed full-backup restore contract.
// No production modules or restore behavior are changed by this probe.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { itemBackup } from '../../firebase/functions/src/items/item-backup.js';
import { questBackup } from '../../firebase/functions/src/quests/quest-backup.js';
import { importBackupRecords } from '../../firebase/functions/src/backup/import-backup-records.js';

const host = '127.0.0.1:8187', projectId = 'demo-aleria-backup-checkup';
if (process.env.FIRESTORE_EMULATOR_HOST !== host) throw Error('Only the isolated backup-checkup emulator at 127.0.0.1:8187 is allowed.');
if (process.env.GCLOUD_PROJECT && process.env.GCLOUD_PROJECT !== projectId) throw Error('A different project environment is not allowed.');
const require = createRequire(new URL('../../firebase/functions/package.json', import.meta.url));
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp({ projectId });
const db = getFirestore();
const auth = { uid: 'local-backup-checkup', token: { aleriaRole: 'moderator' } };
const oldAt = '2026-10-30T08:00:00.000Z', newAt = '2026-11-01T08:00:00.000Z';
const personId = 'backup-checkup-person', runId = 'backup-checkup-run', groupId = 'backup-checkup-group', awardId = 'backup-checkup-award';
const inventory = (totalCopper, revision) => ({ revision, items: [], moneyState: { totalCopper } });
const currentPerson = { name: 'Backup checkup test figure', ownerUid: auth.uid, updatedAt: newAt, inventory: inventory(37, 7), combatProfile: { revision: 7, hitPoints: { current: 6, maximumOverride: 12 } } };
const currentAward = { actorUid: auth.uid, operationId: 'new-award', sourceKey: 'notice:backup-checkup:one', at: newAt, result: { recordId: personId, copper: 20 }, fingerprint: 'new-item-receipt' };
const currentRun = { id: runId, status: 'completed', rewardStatus: 'claimed', revision: 7, updatedAt: newAt };
const currentClaim = { runId, actorUid: auth.uid, at: newAt, allocations: [{ recordId: personId, copper: 20 }] };
const currentGroup = { id: groupId, schemaVersion: 1, revision: 7, updatedAt: newAt, inventory: inventory(50, 7), receipts: [{ runId, title: 'Latest payout', copper: 50, at: newAt }] };
const oldBackup = {
  characters: [{ id: personId, ...currentPerson, updatedAt: oldAt, inventory: inventory(100, 1), combatProfile: { revision: 1, hitPoints: { current: 12, maximumOverride: 12 } } }],
  itemSystem: { schemaVersion: 1, collections: { item_award_claims: [{ id: awardId, data: { ...currentAward, operationId: 'old-award', at: oldAt, result: { recordId: personId, copper: 5 }, fingerprint: 'old-item-receipt' } }] } },
  questSystem: { schemaVersion: 1, collections: {
    quest_runs: [{ id: runId, data: { ...currentRun, status: 'active', rewardStatus: 'pending', revision: 1, updatedAt: oldAt } }],
    quest_reward_claims: [{ id: runId, data: { ...currentClaim, at: oldAt, allocations: [{ recordId: personId, copper: 5 }] } }],
    group_quest_accounts: [{ id: groupId, data: { ...currentGroup, revision: 1, updatedAt: oldAt, inventory: inventory(5, 1), receipts: [] } }]
  } }
};
const read = async path => (await db.doc(path).get()).data();
after(async () => db.terminate());

test('diagnostic: full restore overwrites the figure but retains newer item and quest receipts and group account', async () => {
  // Explicit app project and document paths only; no emulator reset endpoint.
  const batch = db.batch();
  for (const [path, value] of [
    [`characters/${personId}`, currentPerson], [`item_award_claims/${awardId}`, currentAward],
    [`quest_runs/${runId}`, currentRun], [`quest_reward_claims/${runId}`, currentClaim],
    [`group_quest_accounts/${groupId}`, currentGroup]
  ]) batch.set(db.doc(path), value);
  await batch.commit();
  assert.equal((await read(`characters/${personId}`)).inventory.moneyState.totalCopper, 37);

  // Keep the diagnostic aligned with the real full-import client ordering.
  const source = await readFile(new URL('../../AleriaAlmanach/modules/backup/almanach-backup.js', import.meta.url), 'utf8');
  const apply = source.slice(source.indexOf('async function applyFullAlmanachBackup('));
  const itemPosition = apply.indexOf('window._fb.itemDefinitions.restoreBackup(backup.itemSystem)');
  const questPosition = apply.indexOf('window._fb.quests.restoreBackup(backup.questSystem)');
  const characterPosition = apply.indexOf("window._fb.importBackupRecords('characters'");
  assert.ok(itemPosition >= 0 && itemPosition < questPosition && questPosition < characterPosition);

  const operations = [];
  for (const [name, callable, payload] of [['items', itemBackup, oldBackup.itemSystem], ['quests', questBackup, oldBackup.questSystem]]) {
    const { collections } = await callable.run({ auth, data: { action: 'collections' } });
    for (const collection of collections) {
      const records = payload.collections[collection] || [];
      if (!records.length) continue;
      const result = await callable.run({ auth, data: { action: 'restore', collection, records } });
      operations.push({ section: name, collection, result });
      assert.deepEqual(result, { restored: 0, retained: 1 });
    }
  }
  const imported = await importBackupRecords.run({ auth, data: { kind: 'characters', records: oldBackup.characters } });
  operations.push({ section: 'characters', result: imported });
  assert.equal(imported.imported, 1);

  const result = {
    character: await read(`characters/${personId}`), itemAward: await read(`item_award_claims/${awardId}`),
    questRun: await read(`quest_runs/${runId}`), questClaim: await read(`quest_reward_claims/${runId}`),
    groupAccount: await read(`group_quest_accounts/${groupId}`)
  };
  assert.equal(result.character.inventory.moneyState.totalCopper, 100, 'old figure money overwrites current 37');
  assert.equal(result.character.inventory.revision, 1, 'the old inventory revision returns with the figure');
  assert.equal(result.character.combatProfile.hitPoints.current, 12, 'the old profile snapshot also returns');
  assert.deepEqual(result.itemAward, currentAward, 'newer item receipt is retained');
  assert.deepEqual(result.questRun, currentRun, 'newer completed/paid run is retained');
  assert.deepEqual(result.questClaim, currentClaim, 'newer quest payout receipt is retained');
  assert.deepEqual(result.groupAccount, currentGroup, 'newer group money remains 50 instead of old 5');
  const evidence = {
    scope: { projectId, host, liveWrites: false, globalDelete: false, syntheticFixtures: true },
    findingConfirmed: true, operations, before: { character: currentPerson, itemAward: currentAward, questRun: currentRun, questClaim: currentClaim, groupAccount: currentGroup },
    backup: oldBackup, after: result,
    conclusion: 'A successful current full restore can combine an older figure/profile/inventory snapshot with retained newer transaction receipts, completed quest state and group balances. This probe documents the current contract; it does not propose or apply a restore migration.'
  };
  await writeFile(new URL('./backup-mixed-restore-result.json', import.meta.url), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log('Confirmed: figure money 37 -> 100, current item/quest receipts retained, current group balance 50 retained; no global emulator deletion.');
});
