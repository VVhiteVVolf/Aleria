import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { questsFromBoard, mergeQuestSources } from '../modules/quests/quest-sources.js';
import { questAvailabilityAt } from '../modules/quests/quest-board-availability.js';
import { createQuestStore } from '../modules/quests/quest-store.js';
import { renderQuestDetail } from '../modules/quests/quest-view.js';
import { createQuestRepository } from '../modules/quests/quest-firebase.js';
import { createLandingPage } from '../modules/landing/landing-model.js';
import { mountLandingQuestJournal, unmountLandingQuestJournal } from '../modules/landing/landing-quest-journal.js';
import { mergeAuthoredArchiveState } from '../../Anzeigetafeln/assets/js/archive/notice-archive-model.mjs';
import { buildCompletedTravelNotice, TRAVEL_ARCHIVE_SEED } from '../../Anzeigetafeln/tools/notices/erledigtes-reisegeleit.mjs';

const day = value => ({ year: 1740, month: 3, day: value });
const board = { id: 'board' };
const paper = (fields = {}) => ({ id: 'paper', title: 'Ein Auftrag', typ: 'reise', publishedOn: day(9), ...fields });
const archived = (notices = [paper()]) => ({ zettel: notices, noticeArchive: { version: 1, piles: [], entries: [
  { id: 'archive', noticeIds: ['paper'], archivedOn: day(10), restoredOn: day(12), x: .5, y: .94, variant: 0 }
] } });

test('source dates and archive intervals follow the board exactly, including restoration and the Aleria year boundary', () => {
  const state = archived(), before = structuredClone(state), [quest] = questsFromBoard(board, state);
  for (const [date, expected] of [[day(8), 'not-published'], [day(9), 'available'], [day(10), 'archived'], [day(11), 'archived'], [day(12), 'available']]) {
    assert.equal(questAvailabilityAt(quest, date), expected);
  }
  const [newYear] = questsFromBoard(board, { zettel: [paper({ publishedOn: { year: 1741, month: 1, day: 1 } })] });
  assert.equal(questAvailabilityAt(newYear, { year: 1740, month: 13, day: 36 }), 'not-published');
  assert.equal(questAvailabilityAt(newYear, { year: 1741, month: 1, day: 1 }), 'available');
  assert.deepEqual(state, before);
});

test('the actual completed travel notice seeds the same paper archive without a browser facade and preserves a later restoration', async () => {
  const context = vm.createContext({ window: {} });
  vm.runInContext(await readFile(new URL('../../Anzeigetafeln/assets/js/data/authored-notices.js', import.meta.url), 'utf8'), context);
  const authored = { zettel: [buildCompletedTravelNotice()], archiveEntries: [TRAVEL_ARCHIVE_SEED] };
  const merged = mergeAuthoredArchiveState(context.window.TafelAuthoredNotices.merge({ zettel: [] }, authored), authored.archiveEntries);
  const [quest] = questsFromBoard(board, merged);
  assert.equal(questAvailabilityAt(quest, day(9)), 'available');
  assert.equal(questAvailabilityAt(quest, day(10)), 'archived');
  assert.match(quest.summary, /Llysfaen/);
  merged.noticeArchive.entries[0].restoredOn = day(11);
  const restored = mergeAuthoredArchiveState(merged, authored.archiveEntries);
  assert.equal(restored.noticeArchive.entries.length, 1);
  assert.equal(questAvailabilityAt(questsFromBoard(board, restored)[0], day(11)), 'available');
  const deleted = { ...restored, zettel: [] };
  assert.equal(questsFromBoard(board, mergeAuthoredArchiveState(deleted, authored.archiveEntries)).length, 0);
});

test('publication sheets use their own dated windows and a hidden sheet cannot reopen an archived public paper', () => {
  const state = archived([paper(), paper({ id: 'later-sheet', noticeGroupId: 'paper', publishedOn: day(11) }), paper({ id: 'secret', noticeGroupId: 'paper', secret: true })]);
  const [quest] = questsFromBoard(board, state);
  assert.equal(questAvailabilityAt(quest, day(10)), 'archived');
  assert.equal(questAvailabilityAt(quest, day(11)), 'available');
  assert.equal(quest.boardAvailability.notices.length, 2);
  state.zettel = state.zettel.filter(notice => notice.id !== 'later-sheet');
  assert.equal(questAvailabilityAt(questsFromBoard(board, state)[0], day(11)), 'archived');
});

test('live dates and board updates change available offers while source history, authored overrides and active runs remain intact', async () => {
  const state = archived(), [source] = questsFromBoard(board, state), manual = { ...source, id: 'manual', links: { ...source.links, boards: [] }, boardAvailability: undefined };
  const store = createQuestStore({ quests: [source, manual], boards: [board], maps: [], modules: [] }, { worldDate: day(9) });
  let next, disposed = 0;
  store.connect({ subscribe(callback) { next = callback; return () => disposed++; }, watchAccess() { return () => disposed++; } });
  const run = { id: 'run', questId: source.id, status: 'active', revision: 1 };
  await next({ source: 'legacy', runs: [run], quests: [{ ...source, title: 'Eigener Titel', boardAvailability: undefined }] });
  assert.equal(store.snapshot().availableQuests.length, 2);
  store.setWorldDate(day(10));
  assert.deepEqual(store.snapshot().availableQuests.map(quest => quest.id), ['manual']);
  assert.equal(store.snapshot().quests.find(quest => quest.id === source.id).title, 'Eigener Titel');
  assert.deepEqual(store.snapshot().runs, [run]);
  assert.equal(questAvailabilityAt(mergeQuestSources([source], [{ ...source, boardAvailability: undefined }])[0], day(10)), 'archived');
  store.setWorldDate(day(12)); assert.equal(store.snapshot().availableQuests.length, 2);
  await next({ source: 'boards', boards: [{ id: board.id, state: { ...state, noticeArchive: { version: 1, piles: [], entries: [] } } }] });
  store.setWorldDate(day(10)); assert.equal(store.snapshot().availableQuests.length, 2);
  assert.deepEqual(store.snapshot().runs, [run]);
  store.destroy(); assert.equal(disposed, 2);
});

test('historic source details stay readable without offering a new start, while an active run still accepts journal entries', () => {
  const [quest] = questsFromBoard(board, archived()), options = { calendar: globalThis.AleriaCalendar, catalog: { boards: [], maps: [], modules: [] }, access: { role: 'moderator' } };
  const historic = renderQuestDetail(quest, { ...options, availability: 'archived' });
  assert.match(historic, /Aushang wurde abgelegt/); assert.doesNotMatch(historic, /data-action="start"/);
  assert.match(historic, /data-action="edit"/);
  assert.match(renderQuestDetail(quest, { ...options, availability: 'not-published' }), /noch nicht ausgehängt/);
  const run = { ...quest, status: 'active', groupName: 'Boten', party: [], started: { date: day(9), time: '08:00' } };
  assert.match(renderQuestDetail(run, { ...options, run: true, availability: 'archived' }), /data-action="log"/);
});

test('world-date subscription reads the existing shared document and owns its unsubscribe', () => {
  let path, receive, disposed = 0, result;
  const repository = createQuestRepository({ db: {}, sdk: { doc: (_db, ...parts) => parts.join('/'), onSnapshot(reference, next) { path = reference; receive = next; return () => disposed++; } },
    functions: {}, httpsCallable: () => () => {} });
  const stop = repository.watchWorldDate(next => result = next, assert.fail);
  assert.equal(path, 'almanach_settings/current-date');
  receive({ exists: () => true, data: () => day(10) }); assert.deepEqual(result, day(10));
  receive({ exists: () => false }); assert.equal(result, null);
  stop(); assert.equal(disposed, 1);
});

test('landing context labels archived source papers, follows live dates, and ignores late callbacks after unmount', async () => {
  const [source] = questsFromBoard(board, archived()); source.links.modules = ['crew'];
  const content = { innerHTML: '' }, host = { querySelector: () => content, addEventListener() {} };
  const context = { root: { querySelector: () => host }, entry: { id: 'crew' }, page: createLandingPage() };
  let dateNext, contextNext, disposed = 0;
  mountLandingQuestJournal(context, { catalog: async () => ({ quests: [source] }), client: async () => ({
    context(_request, next) { contextNext = next; next({ quests: [{ ...source, boardAvailability: undefined }], runs: [] }); return () => disposed++; },
    watchWorldDate(next) { dateNext = next; next(day(10)); return () => disposed++; }
  }) });
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.match(content.innerHTML, /Aushang abgelegt/); assert.match(content.innerHTML, /Ein Auftrag/);
  dateNext(day(12)); assert.doesNotMatch(content.innerHTML, /Aushang abgelegt/);
  unmountLandingQuestJournal(context); const html = content.innerHTML;
  dateNext(day(10)); contextNext({ quests: [], runs: [] });
  assert.equal(content.innerHTML, html); assert.equal(disposed, 2);
});
