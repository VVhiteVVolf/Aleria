import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { calendar, NOTICE_START_DATE, withNoticeDate, hasAppeared, isNoticeDate, commentsAtDate } from '../assets/js/timeline/notice-dates.mjs';
import { createBoardDateState } from '../assets/js/timeline/board-date-state.mjs';
import { emptyArchive, archiveNotices, restoreArchiveEntry, isArchivedAt, normalizeArchive,
  archiveFloorObjects, mergeArchiveObjects, moveArchiveObject, assertArchiveState, visibleArchiveEntries, mergeAuthoredArchiveState } from '../assets/js/archive/notice-archive-model.mjs';
import { buildCompletedTravelNotice, TRAVEL_ARCHIVE_SEED } from '../tools/notices/erledigtes-reisegeleit.mjs';
import { createWorldDateReadRepository } from '../../AleriaAlmanach/modules/world-date/world-date-read-repository.mjs';
import { __testables as publisher } from '../../netlify/functions/world-content-publisher.mjs';

const day = day => ({ year: 1740, month: 3, day });
const note = (id, extra = {}) => withNoticeDate({ id, x: .3, y: .4, typ: 'notiz', title: id,
  comments: [{ name: 'Zeuge', text: 'Diese Spur bleibt erhalten.' }], ...extra });
const notices = [note('a'), note('a-page-2', { noticeGroupId: 'a' }), note('b'), note('c'), note('d')];
const archive = (state, ids, id, date = day(10)) => archiveNotices(state, notices, ids, { id, date, position: { x: .4, y: .94 } });

test('publication defaults to Play start, respects future dates and the 13 × 36 calendar', () => {
  assert.deepEqual(NOTICE_START_DATE, day(9));
  assert.deepEqual(note('old').publishedOn, day(9));
  assert.equal(hasAppeared(note('later', { publishedOn: day(12) }), day(11)), false);
  assert.equal(hasAppeared(note('later', { publishedOn: day(12) }), day(12)), true);
  assert.deepEqual(calendar.shift({ year: 1740, month: 13, day: 36 }, 1), { year: 1741, month: 1, day: 1 });
  assert.deepEqual(calendar.shift(day(36), 1), { year: 1740, month: 4, day: 1 });
  assert.equal(isNoticeDate(day(37)), false);
  assert.equal(isNoticeDate({ year: 1740, month: 3.1, day: 1 }), false);
});

test('day browsing stays independent of incoming world-date changes, Today resumes following', () => {
  const dates = createBoardDateState(day(10));
  dates.receive(day(11));
  assert.deepEqual(dates.get().viewed, day(11));
  dates.step(3);
  dates.receive(day(12));
  assert.deepEqual(dates.get(), { today: day(12), viewed: day(14), following: false });
  const copy = dates.get(); copy.today.day = 1;
  assert.equal(dates.get().today.day, 12);
  dates.follow(); assert.deepEqual(dates.get().viewed, day(12));
});

test('archiving references all pages without moving or changing text and comments', () => {
  const before = structuredClone(notices);
  const result = archive(emptyArchive(), ['a', 'a-page-2'], 'first');
  assert.deepEqual(notices, before);
  assert.deepEqual(result.entries[0].noticeIds, ['a', 'a-page-2']);
  assert.equal(isArchivedAt(result, 'a', day(9)), false);
  assert.equal(isArchivedAt(result, 'a', day(10)), true);
  assert.equal(isArchivedAt(result, 'b', day(10)), false, 'another announcement at the same nail is unaffected');
  assert.deepEqual(normalizeArchive(JSON.parse(JSON.stringify(result)), notices), result);
  assert.doesNotThrow(() => publisher.validateBoardState({ zettel: notices, noticeArchive: result }));
});

test('restoring and rearchiving retain exact historical intervals', () => {
  let result = archive(emptyArchive(), ['a'], 'first');
  result = restoreArchiveEntry(result, 'first', day(12));
  assert.equal(isArchivedAt(result, 'a', day(11)), true);
  assert.equal(isArchivedAt(result, 'a', day(12)), false);
  result = archive(result, ['a'], 'second', day(14));
  assert.equal(isArchivedAt(result, 'a', day(13)), false);
  assert.equal(isArchivedAt(result, 'a', day(14)), true);
  assert.doesNotThrow(() => assertArchiveState(result, notices));
  assert.throws(() => archive(result, ['a'], 'overlap', day(13)), /überlappende/);
  assert.throws(() => archive(result, ['b'], 'first'), /abgelegt/);
});

test('piles require three archived units, grow by content count and persist their positions', () => {
  const many = Array.from({ length: 12 }, (_, i) => note(`p${i}`));
  let result = emptyArchive();
  const add = i => { result = archiveNotices(result, many, [`p${i}`], { id: `e${i}`, date: day(10) }); };
  add(0); add(1);
  assert.throws(() => mergeArchiveObjects(result, archiveFloorObjects(result, many, day(10)), 'e0', 'e1', 'pile'), /Ab drei/);
  add(2);
  result = mergeArchiveObjects(result, archiveFloorObjects(result, many, day(10)), 'e0', 'e1', 'pile');
  for (let i = 2; i < 12; i++) {
    if (i > 2) add(i);
    result = mergeArchiveObjects(result, archiveFloorObjects(result, many, day(10)), `e${i}`, 'pile', 'unused');
    const size = archiveFloorObjects(result, many, day(10)).find(object => object.id === 'pile').size;
    assert.equal(size, i + 1 < 5 ? 'small' : i + 1 < 10 ? 'medium' : 'large');
  }
  result = moveArchiveObject(result, 'pile', { x: -10, y: 100 });
  assert.deepEqual(result.piles, [{ id: 'pile', x: .08, y: .97 }]);
  assert.doesNotThrow(() => assertArchiveState(result, many));
});

test('future and secret pages do not leak through floor or archive views', () => {
  const source = [note('private', { secret: true }), note('future', { publishedOn: day(15) })];
  let result = archiveNotices(emptyArchive(), source, ['private'], { id: 'private-entry', date: day(10) });
  assert.throws(() => archiveNotices(result, source, ['future'], { id: 'bad', date: day(10) }));
  result = archiveNotices(result, source, ['future'], { id: 'later', date: day(15) });
  assert.deepEqual(visibleArchiveEntries(result, source, day(10)), []);
  assert.equal(visibleArchiveEntries(result, source, day(10), { includeSecret: true }).length, 1);
  assert.deepEqual(archiveFloorObjects(result, source, day(9)), []);
});

test('server rejects malformed archive references, dates, overlapping intervals and lost legacy metadata', () => {
  const state = { zettel: notices, noticeArchive: archive(emptyArchive(), ['a'], 'first') };
  assert.throws(() => publisher.validateBoardState({ zettel: [{ ...note('bad'), publishedOn: day(37) }] }));
  const dangling = structuredClone(state); dangling.noticeArchive.entries[0].noticeIds.push('missing');
  assert.throws(() => publisher.validateBoardState(dangling));
  const duplicate = structuredClone(state); duplicate.noticeArchive.entries.push({ ...duplicate.noticeArchive.entries[0], id: 'overlap' });
  assert.throws(() => publisher.validateBoardState(duplicate), /überlappende/);
  assert.throws(() => publisher.assertBoardArchiveContinuity(state, { zettel: notices }), /Papierarchiv/);
  assert.doesNotThrow(() => publisher.assertBoardArchiveContinuity(state, { zettel: notices.filter(note => note.id !== 'a') }));
  assert.doesNotThrow(() => publisher.assertBoardArchiveContinuity(state, { ...state, noticeArchive: restoreArchiveEntry(state.noticeArchive, 'first', day(11)) }));
});

test('shared world-date repository only reads and subscribes; it never creates or writes a clock', async () => {
  const calls = [], snapshot = { exists: () => true, data: () => day(10) };
  const repo = createWorldDateReadRepository({ db: 'db', sdk: {
    doc: (...args) => { calls.push(args); return 'ref'; },
    getDoc: async ref => { assert.equal(ref, 'ref'); return snapshot; },
    onSnapshot: (ref, next) => { next(snapshot); return () => calls.push('unsubscribed'); },
  } });
  assert.deepEqual(await repo.load(), day(10));
  let seen; const stop = repo.subscribe(value => { seen = value; }); stop();
  assert.deepEqual(seen, day(10));
  assert.deepEqual(calls, [['db', 'almanach_settings', 'current-date'], 'unsubscribed']);
  assert.deepEqual(Object.keys(repo), ['load', 'subscribe']);
});

test('all authored Gwynthor sheets carry the confirmed default publication date', async () => {
  const pack = JSON.parse(await readFile(new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/authored-notices.json', import.meta.url)));
  assert.equal(pack.zettel.length, 31);
  assert.ok(pack.zettel.every(notice => JSON.stringify(notice.publishedOn) === JSON.stringify(day(9))));
});

test('completed travel example is seeded once; its closing replies only appear on completion day', () => {
  const notice = withNoticeDate(buildCompletedTravelNotice());
  const before = { zettel: [notice] };
  const merged = mergeAuthoredArchiveState(before, [TRAVEL_ARCHIVE_SEED]);
  assert.equal(before.noticeArchive, undefined);
  assert.equal(merged.noticeArchive.entries.length, 1);
  assert.equal(isArchivedAt(merged.noticeArchive, notice.id, day(9)), false);
  assert.equal(isArchivedAt(merged.noticeArchive, notice.id, day(10)), true);
  assert.equal(commentsAtDate(notice.comments, day(9)).length, 2);
  assert.equal(commentsAtDate(notice.comments, day(10)).length, 4);
  assert.match(notice.comments[2].text, /Herzlichen Dank an den Söldner Raban/);
  assert.deepEqual(mergeAuthoredArchiveState(merged, [TRAVEL_ARCHIVE_SEED]), merged);
  const restored = { ...merged, noticeArchive: restoreArchiveEntry(merged.noticeArchive, TRAVEL_ARCHIVE_SEED.id, day(11)) };
  assert.deepEqual(mergeAuthoredArchiveState(restored, [TRAVEL_ARCHIVE_SEED]), restored);
  const deleted = { ...restored, zettel: [], noticeArchive: emptyArchive() };
  assert.deepEqual(mergeAuthoredArchiveState(deleted, [TRAVEL_ARCHIVE_SEED]), deleted);
  const custom = { zettel: [{ ...notice, publishedOn: day(12) }] };
  assert.equal(mergeAuthoredArchiveState(custom, [TRAVEL_ARCHIVE_SEED]).noticeArchive, undefined, 'custom dates prevail');
});
