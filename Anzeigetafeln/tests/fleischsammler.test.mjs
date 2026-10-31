import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { buildFleischsammlerNotices, FLEISCHSAMMLER_NOTICE_ID as root, FLEISCHSAMMLER_BOARD_BINDING as binding } from '../tools/quests/fleischsammler-wanted.mjs';
import { buildGwynthorQuestPack } from '../tools/build-gwynthor-quest-notices.mjs';
import { prepareBoardState } from '../assets/js/composition/board-composition-migration.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const json = value => JSON.parse(JSON.stringify(value));
const scope = { window: {} };
for (const file of ['notes/notice-stacks.js', 'data/authored-notices.js']) vm.runInNewContext(read('assets/js/' + file), scope);
const stacks = scope.window.TafelNoticeStacks;
const merge = scope.window.TafelAuthoredNotices.merge;
const pack = await buildGwynthorQuestPack();
const notices = await buildFleischsammlerNotices();
const preset = JSON.parse(read('Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/board-layout.json'));
const assets = JSON.parse(read('assets/data/board-art-catalog.json')).posters;

test('Fleischsammler is one four-page public announcement at the existing Mörder paper', () => {
  assert.equal(notices.length, 4);
  assert.deepEqual(notices.map(note => note.stackOrder), [0, 1, 2, 3]);
  assert.ok(notices.every(note => note.noticeGroupId === root && note.stackId === root && note.secret === false));
  assert.equal(stacks.publications(notices).length, 1);
  const result = prepareBoardState({ zettel: pack.zettel }, { assets, preset, stacks });
  const poster = result.boardLayout.posters.find(poster => poster.id === binding.posterId);
  assert.equal(poster.assetId, 'moerder');
  assert.equal(poster.noticeId, root);
  assert.equal(poster.pin.enabled, true);
  assert.equal(result.boardLayout.posters.length, 55);
});

test('public texts and searchable metadata contain no private perpetrator background or speculative clues', () => {
  const delivered = JSON.stringify(notices);
  assert.doesNotMatch(delivered, /Bettler|Landstreicher|verwahrlost|1720|Geliebte|Skelett|Friedhof|Ritual|Gottheit|Stimmen|vierzigjähr|Erdrossel|Organe|Hautpartien/iu);
  assert.match(notices[0].text, /Seit einem Monat/);
  assert.match(notices[0].text, /innerhalb Gwynthors bislang keinerlei Tätigkeit/);
  assert.match(notices[2].text, /Beides ist unbekannt/);
  assert.match(notices[3].text, /Weder Kapuze noch Hackebeil sind als Merkmal des Täters belegt/);
  assert.match(notices[3].text, /sechzehn bis vierunddreißig/);
  assert.match(notices[3].text, /fast immer allein/);
  assert.equal(notices[3].table.length, 0);
  assert.ok(notices.slice(0, 3).every(note => !note.portrait));
});

test('reward promises and authors use the requested amounts and actual portrait identities', () => {
  assert.deepEqual(notices[1].rewards.map(({ currency, amount }) => ({ currency, amount })),
    [{ currency: 'gold', amount: 3 }, { currency: 'silver', amount: 1 }]);
  assert.doesNotMatch(notices[1].text, /Wachgänge|Schichten|Ermittlung|Fahndung/);
  assert.deepEqual(notices.map(note => note.media.verfasser.personId),
    ['ferydnand-gafyr', 'neithon-1718-draig', 'meredydd-gwyllach', 'meredydd-gwyllach']);
  for (const notice of notices) for (const field of ['verfasser', 'emblem', 'unterschrift', 'siegel', 'portrait']) {
    if (notice[field]) assert.ok(existsSync(new URL(decodeURI(notice[field]), new URL('../tafel.html', import.meta.url))), notice[field]);
  }
});

test('new authored paper binding preserves saved placement and is applied only on first addition', () => {
  const poster = json(preset.layout.posters.find(poster => poster.id === binding.posterId));
  delete poster.noticeId;
  poster.pin.enabled = false;
  poster.x = .71;
  poster.rotation = 19;
  const existing = { id: 'existing', comments: [{ text: 'Bleibt erhalten' }] };
  const incoming = { zettel: [existing], boardLayout: { version: 1, posters: [poster] } };
  const before = json(incoming);
  const source = { zettel: notices, boardBindings: [binding] };
  const merged = merge(incoming, source);
  assert.deepEqual(json(incoming), before, 'immutable input');
  assert.strictEqual(merged.zettel[0], existing);
  assert.equal(merged.boardLayout.posters[0].noticeId, root);
  assert.equal(merged.boardLayout.posters[0].x, .71);
  assert.equal(merged.boardLayout.posters[0].rotation, 19);
  delete merged.boardLayout.posters[0].noticeId;
  merged.boardLayout.posters[0].pin.enabled = false;
  const restored = merge(merged, source);
  assert.equal(restored.boardLayout.posters[0].noticeId, undefined, 'deliberate unlinking survives');
  const deleted = merge({ ...merged, zettel: [existing] }, source);
  assert.equal(deleted.zettel.length, 1, 'deleted sheets stay deleted');
  assert.equal(deleted.boardLayout.posters[0].noticeId, undefined);
});

test('authored binding never replaces another publication, customized artwork, removed papers or an existing placement', () => {
  const poster = json(preset.layout.posters.find(poster => poster.id === binding.posterId));
  const source = { zettel: notices, boardBindings: [binding] };
  for (const posters of [[], [{ ...poster, noticeId: 'own-content' }], [{ ...poster, assetId: 'pamphlet', noticeId: undefined }],
    [{ ...poster, noticeId: undefined }, { ...poster, id: 'own-paper', noticeId: root }]]) {
    const incoming = { zettel: [], boardLayout: { version: 1, posters } };
    const before = json(incoming.boardLayout);
    assert.deepEqual(json(merge(incoming, source).boardLayout), before);
  }
});
