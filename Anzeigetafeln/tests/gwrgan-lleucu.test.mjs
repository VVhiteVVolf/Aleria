import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { buildGwrganLleucuNotices, COURT_BOARD_BINDING, COURT_NOTICE_ID, COURT_TERM } from '../tools/notices/gwrgan-gegen-lleucu.mjs';
import { buildGwynthorQuestPack } from '../tools/build-gwynthor-quest-notices.mjs';

const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const catalog = read('assets/data/board-art-catalog.json');
const asset = catalog.posters.find(a => a.id === COURT_BOARD_BINDING.assetId);
const pages = buildGwrganLleucuNotices(asset);
const copy = value => JSON.parse(JSON.stringify(value));
const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('../assets/js/data/authored-notices.js', import.meta.url), 'utf8'), context);
const merge = context.window.TafelAuthoredNotices.merge;

test('the hearing is one four-page civil announcement with three attributed voices', async () => {
  assert.equal(pages.length, 4);
  assert.deepEqual(pages.map(p => p.stackOrder), [0, 1, 2, 3]);
  assert.ok(pages.every(p => p.stackId === COURT_NOTICE_ID && p.noticeGroupId === COURT_NOTICE_ID && !p.secret));
  assert.ok(pages.every(p => ['ankuendigung', 'erlass'].includes(p.typ) && !p.rewards));
  assert.deepEqual(pages.map(p => p.media.verfasser.personId), ['neithon-1718-draig', 'gethin-falchdyn', 'valeriano-falto', 'neithon-1718-draig']);
  assert.equal(pages[0].table.find(r => r.k === 'Verhandlung').v, COURT_TERM);
  assert.equal(COURT_TERM, 'In zwei Tagen, zur dritten Morgenstunde');
  const pack = await buildGwynthorQuestPack();
  assert.deepEqual(pack.zettel.filter(p => p.noticeGroupId === COURT_NOTICE_ID), pages);
  assert.ok(pack.boardBindings.some(b => b.noticeId === COURT_NOTICE_ID));
  for (const name of ['Meurig Draig', 'Derwen Wyrm', 'Hywel Gafyr', 'Morwenna Saethwyr', 'Ceridwen Wyrm', 'Neithon Draig', 'Godwyn Sgrechiwr', 'Tegan Draig']) {
    assert.ok(JSON.stringify(pages[3]).includes(name), name);
  }
});

test('the public account distinguishes demands from findings and retains both parties’ strongest grounds', () => {
  assert.match(pages[0].text, /Keine dieser streitigen Forderungen ist/);
  assert.match(pages[1].text, /nur darüber verfügen, was diesem selbst zustand/);
  assert.match(pages[1].text, /nicht freiwillige|keine freiwillige/);
  assert.match(pages[2].text, /Testament|letzter Wille/);
  assert.match(pages[2].text, /anerkannten Ehe geboren/);
  assert.doesNotMatch(JSON.stringify(pages), /Pflichtverteidiger|Kopfgeld|Abenteurer|Quest|Schuldige gefunden/);
});

test('all supplied icons, signatures, author portraits and poster derivatives exist', () => {
  for (const p of pages) for (const field of ['verfasser', 'emblem', 'unterschrift', 'siegel']) {
    assert.ok(existsSync(new URL(p[field], new URL('../tafel.html', import.meta.url))), p[field]);
    assert.equal(p.media[field].src, p[field]);
  }
  assert.ok(existsSync(new URL('../' + asset.src, import.meta.url)));
  assert.ok(existsSync(new URL('../' + asset.thumbnail.src, import.meta.url)));
});

test('new court paper is added once to a saved layout without changing existing positions or comments', () => {
  const previous = { zettel: [{ id: 'old', comments: [{ text: 'Mein Beitrag' }] }], boardLayout: { version: 1,
    posters: [{ id: 'custom', assetId: 'pamphlet', x: .1, y: .9, rotation: 17, layer: 9, pin: { enabled: false } }] } };
  const before = copy(previous);
  const source = { zettel: pages, boardBindings: [COURT_BOARD_BINDING] };
  const first = merge(previous, source);
  assert.deepEqual(previous, before);
  assert.deepEqual(first.boardLayout.posters[0], before.boardLayout.posters[0]);
  assert.equal(first.boardLayout.posters.length, 2);
  assert.equal(first.boardLayout.posters[1].noticeId, COURT_NOTICE_ID);
  assert.equal(merge(first, source).boardLayout.posters.length, 2);
  const removed = { ...first, boardLayout: { version: 1, posters: first.boardLayout.posters.slice(0, 1) } };
  assert.equal(merge(removed, source).boardLayout.posters.length, 1, 'removed paper stays removed');
  const empty = merge({ zettel: [], boardLayout: { version: 1, posters: [] } }, source);
  assert.equal(empty.boardLayout.posters.length, 0, 'an intentionally empty layout stays empty');
});
