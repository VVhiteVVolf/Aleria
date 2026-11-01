import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { database } from './fixtures/combat-transaction-database.js';
import { commitQuestOperation } from '../src/quests/commit-quest.js';
import { commitItemAwardOperation } from '../src/items/commit-item-award.js';
import { questsFromBoard } from '../../../AleriaAlmanach/modules/quests/quest-sources.js';
const read = async path => JSON.parse(await readFile(new URL(`../../../${path}`, import.meta.url), 'utf8'));
const catalog = await read('AleriaAlmanach/modules/quests/quest-catalog.json');
const noticeId = 'gwynthor-der-staedter-und-sein-pferd';
const horse = catalog.quests.find(quest => quest.links.notices.some(link => link.noticeId === noticeId));
assert.ok(horse, 'Die tatsächlich veröffentlichte Pferdequest fehlt.');
const board = catalog.boards.find(board => horse.links.boards.includes(board.id));
const stateSource = catalog.boardStates.find(source => source.boardId === board.id);
const authored = await read(`Anzeigetafeln/${stateSource.authoredPath}`);
const notice = authored.zettel.find(notice => notice.id === noticeId);
const sourceKey = `notice:${board.id}:${notice.noticeGroupId || notice.stackId || notice.id}`;
const auth = { uid: 'owner', token: { aleriaRole: 'moderator' } };
const stamp = { date: { year: 1740, month: 3, day: 9 }, time: '08:00' };
const seed = () => database({ 'characters/owner': { id: 'owner', name: 'Prüffigur', ownerUid: 'owner',
  inventory: { revision: 1, items: [], moneyState: { totalCopper: 0 } }, combatProfile: { revision: 1, hitPoints: { current: 7 } } } });
async function ready(db, quest = horse, id = 'horse-run', rewards = horse.rewards) {
  await commitQuestOperation(db, auth, { action: 'start', id, operationId: `start-${id}`, quest,
    party: [{ kind: 'character', recordId: 'owner' }], stamp });
  await commitQuestOperation(db, auth, { action: 'finish', id, operationId: `finish-${id}`, expectedRevision: 1, stamp,
    rewardPlan: [{ recordId: 'owner', rewards }] });
}
const award = db => commitItemAwardOperation(db, auth, { sourceKey, operationId: 'board-award', recordId: 'owner',
  expectedRevision: db.data.get('characters/owner').inventory.revision, rewards: notice.rewards });
const claim = (db, id = 'horse-run') => commitQuestOperation(db, auth, { action: 'claim', id, operationId: `claim-${id}`, expectedRevision: 2 });

test('actual authored notice, board configuration and static/dynamic horse quest use the same publication reward identity', async () => {
  const config = await readFile(new URL(`../../../Anzeigetafeln/${board.config}`, import.meta.url), 'utf8');
  assert.equal(config.match(/boardId:\s*["']([^"']+)["']/)?.[1], board.id);
  assert.equal(horse.id, sourceKey);
  assert.equal(questsFromBoard(board, { zettel: [notice] }, catalog.maps)[0].id, sourceKey);
  assert.equal(catalog.quests.some(quest => quest.id === noticeId), false, 'Die nackte Dossier-ID ist keine zweite Questakte.');
  assert.equal(notice.noticeGroupId, noticeId);
});

test('the actual horse reward pays once across board and quest in either order, including all items and exact profiles', async () => {
  for (const questFirst of [true, false]) {
    const db = seed(), profile = structuredClone(db.data.get('characters/owner').combatProfile);
    await ready(db);
    if (questFirst) { await claim(db); await assert.rejects(award(db), /bereits vergeben/); }
    else { await award(db); await assert.rejects(claim(db), /bereits.*vergeben/); }
    const record = db.data.get('characters/owner');
    assert.equal(record.inventory.moneyState.totalCopper, 50);
    assert.equal(record.inventory.items.length, 2);
    assert.deepEqual(record.inventory.items.map(item => item.definitionRef.id).sort(), horse.rewards.filter(reward => reward.kind === 'item').map(reward => reward.definitionRef.id).sort());
    assert.deepEqual(record.combatProfile, profile);
    assert.equal([...db.data.keys()].filter(path => path.startsWith('item_award_claims/')).length, 1);
    assert.equal(db.data.get('quest_runs/horse-run').rewardStatus, questFirst ? 'claimed' : 'ready');
  }
});

test('independent repeatable quests are not made once-only merely by links to the same board and notice', async () => {
  const db = seed(); await award(db);
  const free = { id: 'repeatable:courier-training', title: 'Freier Übungsauftrag', links: horse.links };
  for (const id of ['training-one', 'training-two']) {
    await ready(db, free, id, [{ kind: 'money', currency: 'copper', amount: 3 }]);
    await claim(db, id);
  }
  assert.equal(db.data.get('characters/owner').inventory.moneyState.totalCopper, 56);
  assert.equal([...db.data.keys()].filter(path => path.startsWith('item_award_claims/')).length, 1);
});
