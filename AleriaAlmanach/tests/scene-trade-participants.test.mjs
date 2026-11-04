import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSceneTradeParticipants, sceneTradeCommentParticipants, sceneTradeSelectableAccounts } from '../modules/scene-trade/scene-trade-participants.js';
import { createSceneTradeParticipantPreferences, createSceneTradeParticipantSource } from '../modules/scene-trade/scene-trade-participant-state.js';
import { renderSceneTradeActorPicker } from '../modules/scene-trade/scene-trade-actor-picker.js';
import { renderSceneTradePeopleManager } from '../modules/scene-trade/scene-trade-people-manager.js';
import { buildGoettlicheEleganz } from '../modules/goettliche-eleganz/eleganz-module.mjs';

const character = (id, name, extra = {}) => ({ id, name, ...extra });
const characters = [character('g', 'Gawain', { ownerUid: 'u' }), character('y', 'Ylva'),
  character('e', 'Eleonora Cassia Raves', { identity: { worldPersonId: 'person-eleonora' } }), character('f', 'Fremde Person')];

test('suggestions are restricted to exact cast, hierarchy and actual speakers; unrelated archive records stay outside', () => {
  const entry = { sessionCast: ['person-eleonora'], pages: [{ hierarchy: { trees: [{ levels: [{ nodes: [
    { id: 'chart-ylva', title: 'Ylva' }, { id: 'vacancy', title: 'Unbesetzter Posten' }
  ] }] }] } }] };
  const result = resolveSceneTradeParticipants({ characters, entries: [entry], references: sceneTradeCommentParticipants([
    { characterId: 'g', charName: 'Gawain' }, { narrator: true, charName: 'Fremde Person' }
  ]) });
  assert.deepEqual([...result.ids].sort(), ['e', 'g', 'y']);
});

test('ambiguous names and stale explicit identities never choose an unrelated namesake', () => {
  const records = [character('one', 'Morgan'), character('two', 'Morgan')];
  assert.equal(resolveSceneTradeParticipants({ characters: records, references: [{ name: 'Morgan' }] }).ids.size, 0);
  assert.equal(resolveSceneTradeParticipants({ characters, references: [{ id: 'stale', name: 'Gawain' }] }).ids.size, 0);
  assert.deepEqual([...resolveSceneTradeParticipants({ characters: records, includeIds: ['two'] }).ids], ['two']);
});

test('legacy comma-separated aliases resolve without exposing archived character suggestions', () => {
  const records = [character('g', 'Gawain', { aliases: 'Sir Gawain, Der Ritter' }), character('old', 'Alter Ritter', { archived: true })];
  const result = resolveSceneTradeParticipants({ characters: records, references: [{ name: 'Sir Gawain' }], includeIds: ['old'] });
  assert.deepEqual([...result.ids], ['g']);
});

test('manual exclusions override automatic suggestions and a removed preferred actor', () => {
  const result = resolveSceneTradeParticipants({ characters, entries: [{ sessionCast: ['g', 'e'] }],
    preferredActorId: 'g', includeIds: ['y'], excludeIds: ['g'] });
  assert.deepEqual([...result.ids].sort(), ['e', 'y']);
  const accounts = characters.map(record => ({ kind: 'character', id: record.id }));
  accounts.push({ kind: 'group', id: 'eligible-group' });
  assert.deepEqual(sceneTradeSelectableAccounts(accounts, result).map(account => account.id), ['y', 'e', 'eligible-group']);
});

test('real Göttliche Eleganz cast resolves saved inventory identities by world-person ID', () => {
  const entry = buildGoettlicheEleganz();
  const records = entry.sessionCast.map((id, index) => character(`saved-${index}`, `Saved person ${index}`, { identity: { worldPersonId: id } }));
  records.push(character('unrelated', 'Unrelated'));
  const result = resolveSceneTradeParticipants({ characters: records, entries: [entry] });
  assert.equal(result.ids.size, entry.sessionCast.length);
  assert.equal(result.ids.has('unrelated'), false);
});

test('segment speakers and trade actors are collected without parsing prose or narrator text', () => {
  const refs = sceneTradeCommentParticipants([{ narrator: true, charName: 'Fremde Person', text: 'Gawain trifft Ylva',
    commentSegments: [{ characterId: 'g', charName: 'Gawain' }, { kind: 'narrator', charName: 'Fremde Person' }],
    sceneTrade: { actorCharacterId: 'y' } }, { deleted: true, characterId: 'f' }]);
  assert.deepEqual(refs.map(ref => ref.id).sort(), ['g', 'y']);
});

test('manual choices persist as IDs per account and thread, while blocked storage remains usable in memory', () => {
  const values = new Map(), storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const prefs = createSceneTradeParticipantPreferences({ uid: 'a', threadId: 'module::one', storage });
  prefs.add('g'); prefs.remove('y');
  assert.deepEqual(createSceneTradeParticipantPreferences({ uid: 'a', threadId: 'module::one', storage }).snapshot().includeIds, ['g']);
  assert.deepEqual(createSceneTradeParticipantPreferences({ uid: 'b', threadId: 'module::one', storage }).snapshot().includeIds, []);
  assert.deepEqual(createSceneTradeParticipantPreferences({ uid: 'a', threadId: 'module::two', storage }).snapshot().excludeIds, []);
  assert.equal([...values.values()].some(value => value.includes('ownerUid')), false);
  const blocked = createSceneTradeParticipantPreferences({ uid: 'a', threadId: 'one', storage: { getItem() { throw Error('blocked'); } } });
  blocked.add('g'); assert.deepEqual(blocked.snapshot().includeIds, ['g']); assert.equal(blocked.snapshot().persistent, false);
});

test('module-only history reads share requests, keep identity references and bound concurrent reads', async () => {
  let calls = 0, running = 0, peak = 0;
  const source = createSceneTradeParticipantSource({ cachedComments: id => id === 'cached' ? [{ characterId: 'g' }] : null,
    loadComments: async id => { calls++; peak = Math.max(peak, ++running); await new Promise(resolve => setTimeout(resolve, 2)); running--; return [{ characterId: id, text: 'private prose omitted' }]; } });
  const ids = ['cached', 'one', 'two', 'three', 'four'];
  await Promise.all([source.load(ids), source.load(ids)]);
  assert.equal(calls, 4); assert.ok(peak <= 3);
  assert.equal(JSON.stringify(source.references(ids)).includes('private prose'), false);
  await source.load(ids); assert.equal(calls, 4);
});

test('a live comment update wins over an older in-flight history response', async () => {
  let finish;
  const source = createSceneTradeParticipantSource({ loadComments: () => new Promise(resolve => { finish = resolve; }) });
  const pending = source.load(['one']); await Promise.resolve(); await Promise.resolve();
  source.update('one', [{ characterId: 'g' }, { characterId: 'y' }]);
  finish([{ characterId: 'g' }]); await pending;
  assert.deepEqual(source.references(['one']).map(ref => ref.id), ['g', 'y']);
});

test('an offline history refresh retains the last confirmed people and reports the incomplete update', async () => {
  let now = 0, fail = false;
  const source = createSceneTradeParticipantSource({ now: () => now, maxAgeMs: 10,
    loadComments: async () => { if (fail) throw Error('offline'); return [{ characterId: 'g' }]; } });
  await source.load(['one']); now = 20; fail = true;
  await assert.rejects(source.load(['one']), /Beiträge/);
  assert.deepEqual(source.references(['one']).map(ref => ref.id), ['g']);
});

test('cached history of another module page is refreshed instead of being treated as a permanent live snapshot', async () => {
  let calls = 0;
  const source = createSceneTradeParticipantSource({ cachedComments: () => [{ characterId: 'g' }], isCachedCurrent: () => false,
    loadComments: async () => { calls++; return [{ characterId: 'g' }, { characterId: 'y' }]; } });
  await source.load(['other-page']); await source.load(['other-page']);
  assert.equal(calls, 1); assert.deepEqual(source.references(['other-page']).map(ref => ref.id), ['g', 'y']);
});

test('narrated transfer and gift receipts include real participants but a creature speaker never aliases a person', () => {
  const refs = sceneTradeCommentParticipants([
    { narrator: true, sceneInventoryTransfer: { giver: { id: 'g' }, receiver: { id: 'y' } } },
    { narrator: true, sceneTrade: { actor: { id: 'g' }, participants: [{ id: 'y', kind: 'character' }, { id: 'friends', kind: 'group' }] } },
    { actorType: 'creature', characterId: 'f', charName: 'Fremde Person' }
  ]);
  assert.deepEqual(refs.map(ref => ref.id).sort(), ['g', 'y']);
});

test('closed actor pickers do not embed the archive, and markup escapes names and dangerous portraits', () => {
  const records = Array.from({ length: 1000 }, (_, index) => ({ key: `character:${index}`, id: String(index), kind: 'character', name: `Person ${index}`, record: {} }));
  records[0].name = '<script>bad</script>'; records[0].record.portrait = 'javascript:bad()';
  const markup = renderSceneTradeActorPicker({ accounts: records, selectedKey: 'character:0', field: 'payerKey', label: 'Zahler' });
  assert.ok(markup.length < 2000); assert.doesNotMatch(markup, /Person 999|<option|<script>|src="javascript/);
  assert.match(markup, /&lt;script&gt;/); assert.match(markup, /data-trade-actor-options/);
});

test('people used by cart lines or ordering a group purchase cannot be removed accidentally', () => {
  const accounts = characters.slice(0, 2).map(record => ({ key: `character:${record.id}`, id: record.id, name: record.name, kind: 'character', record }));
  const state = { actorCharacterId: 'g', lines: [{ payerKey: 'group:friends', recipientKey: 'character:y' }] };
  const markup = renderSceneTradePeopleManager({ accounts, selected: accounts, state });
  assert.match(markup, /data-person-id="g"[^>]*disabled/);
  assert.match(markup, /data-person-id="y"[^>]*disabled/);
});
