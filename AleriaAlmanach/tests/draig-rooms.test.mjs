import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { DRAIG_ROOM_ART } from '../modules/castell-draig-rooms/room-art.mjs';
import { DRAIG_ROOMS, planDraigRoomRefresh, planDraigRoomCorrection } from '../modules/castell-draig-rooms/room-pages.mjs';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

const directory = new URL('../assets/castell-draig/wohntrakte-zimmer-2026-11-01-v2/', import.meta.url);
const root = new URL('../../', import.meta.url);
const before = JSON.parse(await readFile(new URL('module-before.json', directory), 'utf8')).entry;
const images = Object.fromEntries(DRAIG_ROOMS.map(room => [room.id, `/review/${room.id}.png`]));

test('room refresh preserves all unrelated module/page fields, existing thread identities and scene dates', () => {
  const source = structuredClone(before), after = planDraigRoomRefresh(before, images);
  assert.deepEqual(before, source, 'pure plan leaves its input intact');
  const { pages: ignoredBefore, ...entryBefore } = before;
  const { pages: ignoredAfter, ...entryAfter } = after;
  assert.deepEqual(entryAfter, entryBefore);
  assert.equal(after.pages.length, 11);
  assert.deepEqual(after.pages.slice(0, 3), before.pages.slice(0, 3));
  const oldGawain = before.pages.find(page => page.commentThreadKey === 'wohntrakte-gawain');
  const newGawain = after.pages.find(page => page.commentThreadKey === 'wohntrakte-gawain');
  for (const [key, value] of Object.entries(oldGawain)) {
    if (!['image', 'imageWidth', 'sessionIntro'].includes(key)) assert.deepEqual(newGawain[key], value, key);
  }
  assert.equal(after.pages.some(page => /Verlauf/.test(page.pageTitle)), false);
  assert.equal(new Set(after.pages.map(page => page.commentThreadKey)).size, after.pages.length);
});

test('reapplying the room plan never duplicates scenes or resets existing participants, dates and status', () => {
  const first = planDraigRoomRefresh(before, images);
  const room = first.pages.find(page => page.commentThreadKey === 'wohntrakte-anaraut');
  room.sessionDateAleria = { year: 1740, month: 3, day: 13 };
  room.sessionStatus = 'paused'; room.sessionParticipants = ['Eigener Gast'];
  room.sessionCast.push('existing-guest-id');
  const after = planDraigRoomRefresh(first, images);
  assert.deepEqual(after, first);
  assert.throws(() => planDraigRoomRefresh({ ...before, id: 'other-module' }, images), /Falsches/);
  const duplicate = structuredClone(before);
  duplicate.pages.push(structuredClone(duplicate.pages.find(page => page.commentThreadKey === 'wohntrakte-gawain')));
  assert.throws(() => planDraigRoomRefresh(duplicate, images), /Doppelter Zimmerthread/);
});

test('room artwork hashes match the selected originals and the corrected Anaraut room has no dog', async () => {
  const results = JSON.parse(await readFile(new URL('image-results.json', directory), 'utf8'));
  assert.equal(results.images.length, 8);
  const art = DRAIG_ROOM_ART.find(art => art.id === 'anaraut');
  assert.equal(art.version, 3);
  assert.equal(art.references.length, 1);
  assert.ok(art.references[0].endsWith('/anaraut-gemach-v2.png'));
  assert.doesNotMatch(DRAIG_ROOMS.find(room => room.id === 'anaraut').intro, /Gwrgi|Hund|Pfoten/);
  for (const art of DRAIG_ROOM_ART) {
    const bytes = await readFile(new URL(art.destination, root));
    assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), results.images.find(image => image.id === art.id).sha256);
    assert.deepEqual(await readFile(new URL(art.original, root)), bytes);
    assert.equal(shouldPublish(art.original), false);
    assert.equal(shouldPublish(art.destination), true);
  }
});

test('a single-room correction changes only its illustration and matching introduction', async () => {
  const current = JSON.parse(await readFile(new URL('anaraut-without-dog-v3/module-before.json', directory), 'utf8')).entry;
  const after = planDraigRoomCorrection(current, 'anaraut', '/corrected.png');
  const restored = structuredClone(after);
  const index = current.pages.findIndex(page => page.commentThreadKey === 'wohntrakte-anaraut');
  restored.pages[index].image = current.pages[index].image;
  restored.pages[index].sessionIntro = current.pages[index].sessionIntro;
  assert.deepEqual(restored, current);
  assert.equal(after.pages.length, 11);
  assert.equal(after.pages[index].image, '/corrected.png');
});
