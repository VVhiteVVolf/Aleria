import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { legacyNoticeRewards, rewardsOf, rewardFromItem } from '../assets/js/rewards/notice-rewards-model.mjs';
import { buildHerluinMissingNotices } from '../tools/build-herluin-missing-quest.mjs';

const window = {};
vm.runInNewContext(readFileSync(new URL('../assets/js/notes/notice-stacks.js', import.meta.url), 'utf8'), { window });
const stacks = window.TafelNoticeStacks;
const json = value => JSON.parse(JSON.stringify(value));
const records = () => [
  { id: 'quest', typ: 'quest', x: .7, y: .49, comments: [{ text: 'Erste Spur' }] },
  { id: 'person', typ: 'vermisst', x: .7, y: .49, stackId: 'quest', stackOrder: 1, comments: [] },
  { id: 'unrelated', typ: 'handel', x: .2, y: .3, comments: [{ text: 'Eigenes Gespräch' }] },
];

test('different first-class notices share one nail without merging texts or comments', () => {
  const notes = records();
  assert.equal(stacks.groups(notes).length, 2);
  assert.equal(stacks.members(notes, 'quest').length, 2, 'an existing unchanged root can receive new authored attachments');
  assert.equal(stacks.attach(notes, 'unrelated', 'quest'), true);
  assert.equal(stacks.groups(notes).length, 1);
  assert.deepEqual(notes.map(note => note.comments), [[{ text: 'Erste Spur' }], [], [{ text: 'Eigenes Gespräch' }]]);
  assert.equal(stacks.attach(notes, 'person', 'quest'), false, 'no duplicate membership');
});

test('reorder, group drag, anchor detach and deletion keep the other sheets usable', () => {
  const notes = records();
  stacks.attach(notes, 'unrelated', 'quest');
  stacks.move(notes, 'unrelated', -1);
  assert.deepEqual(Array.from(stacks.members(notes, 'quest'), note => note.id), ['quest', 'unrelated', 'person']);
  stacks.position(notes, 'person', .4, .6);
  assert.ok(notes.every(note => note.x === .4 && note.y === .6));
  assert.equal(stacks.detach(notes, 'quest'), true);
  assert.equal(stacks.groups(notes).length, 2, 'detached root must not be reabsorbed via its former ID');
  assert.equal(stacks.members(notes, 'quest').length, 1);
  assert.equal(stacks.members(notes, 'person').length, 2);
  assert.equal(stacks.groups(notes.filter(note => note.id !== 'unrelated')).length, 2);
  assert.deepEqual(json(stacks.members(json(notes), 'person')), json(stacks.members(notes, 'person')));
});

test('moving a former root between stacks and detaching it cannot accidentally reconnect its old sheets', () => {
  const notes = records();
  stacks.attach(notes, 'quest', 'unrelated');
  stacks.detach(notes, 'quest');
  assert.equal(stacks.groups(notes).length, 3);
});

test('secret members cannot leak through public stack counts, titles or member lists', () => {
  const notes = records();
  notes[0].secret = true;
  const publicNotes = stacks.groups(notes);
  assert.deepEqual(Array.from(publicNotes[0].notices, note => note.id), ['person']);
  assert.equal(stacks.members(notes, 'quest').length, 0);
  assert.equal(stacks.members(notes, 'person', { includeSecret: true }).length, 2);
});

test('money recognition uses register parsing and leaves ambiguous promises as prose', () => {
  assert.deepEqual(legacyNoticeRewards('5 Silbertaler'), [{ kind: 'money', currency: 'silver', amount: 5 }]);
  assert.deepEqual(legacyNoticeRewards('1.000 Goldtaler'), [{ kind: 'money', currency: 'gold', amount: 1000 }]);
  assert.deepEqual(legacyNoticeRewards('2,5 KT'), [{ kind: 'money', currency: 'copper', amount: 2.5 }]);
  assert.deepEqual(legacyNoticeRewards('mindestens 5 Silber und ein Schwert'), []);
  assert.deepEqual(legacyNoticeRewards(`${'9'.repeat(80)} Goldtaler`), []);
  assert.deepEqual(rewardsOf({ rewards: [] }, '5 Silbertaler'), []);
  assert.deepEqual(rewardsOf({ rewards: [{ kind: 'money', currency: 'bogus', amount: 5 }, { kind: 'item', itemId: 'x', quantity: -1 }] }), []);
});

test('goods rewards retain register identity, quantity and a durable detail snapshot', () => {
  const catalog = JSON.parse(readFileSync(new URL('../assets/data/notice-reward-catalog.json', import.meta.url), 'utf8'));
  assert.ok(catalog.items.length > 1000);
  assert.equal(new Set(catalog.items.map(item => item.id)).size, catalog.items.length);
  const item = catalog.items.find(item => /Mörser/.test(item.title));
  assert.ok(item?.image && item.description);
  const reward = rewardFromItem(item, 3);
  assert.equal(reward.itemId, item.id);
  assert.equal(reward.quantity, 3);
  assert.equal(reward.description, item.description);
  assert.deepEqual(rewardsOf({ rewards: [reward] }), [reward]);
});

test('Herluin has one quest and three accurate missing-person sheets, with a single total money promise', () => {
  const notes = buildHerluinMissingNotices();
  assert.equal(notes.length, 4);
  assert.equal(stacks.groups(notes).length, 1);
  assert.equal(notes[0].rewards[0].amount, 5);
  assert.ok(notes.slice(1).every(note => note.typ === 'vermisst' && !note.rewards));
  for (const note of notes.slice(1)) assert.ok(existsSync(new URL(note.portrait, new URL('../tafel.html', import.meta.url))), note.title);
});
