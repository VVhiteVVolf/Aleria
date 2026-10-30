import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { normalizeLayout, pinPosition, groupForPoster, moveLayer, unlinkDeletedNotice } from '../assets/js/composition/board-composition-model.mjs';
import { __testables as publisher } from '../../netlify/functions/world-content-publisher.mjs';

const catalog = JSON.parse(readFileSync(new URL('../assets/data/board-art-catalog.json', import.meta.url))).posters;
const preset = JSON.parse(readFileSync(new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/board-layout.json', import.meta.url)));
const window = {};
vm.runInNewContext(readFileSync(new URL('../assets/js/notes/notice-stacks.js', import.meta.url), 'utf8'), { window });
const stacks = window.TafelNoticeStacks;

test('Gwynthor includes 53 original sheets plus the new court paper without creating decorative quests', () => {
  const layout = normalizeLayout(preset.layout, catalog);
  assert.equal(layout.posters.length, 54);
  assert.equal(layout.posters.filter(poster => poster.noticeId).length, 5);
  assert.equal(layout.posters.filter(poster => poster.pin.enabled).length, 5);
  for (const asset of catalog) {
    assert.ok(existsSync(new URL(`../${asset.src}`, import.meta.url)), asset.src);
    assert.ok(asset.aspect > 0 && asset.bounds.w <= asset.width && asset.bounds.h <= asset.height, asset.id);
  }
});

test('an explicitly empty layout stays empty; unknown artwork or duplicate IDs are rejected instead of silently deleted', () => {
  assert.deepEqual(normalizeLayout({ version: 1, posters: [] }, catalog), { version: 1, posters: [] });
  const poster = preset.layout.posters[0];
  assert.equal(normalizeLayout({ version: 1, posters: [{ ...poster, assetId: 'not-installed' }] }, catalog), null);
  assert.equal(normalizeLayout({ version: 1, posters: [poster, poster] }, catalog), null);
});

test('a local nail rotates and moves with its physical paper', () => {
  const poster = { x: .5, y: .5, width: .2, rotation: 90, pin: { x: 0, y: .5 } };
  const asset = { aspect: 1 };
  assert.deepEqual(pinPosition(poster, asset, { w: 1000, h: 1000 }), { x: .5, y: .4 });
  poster.x = .7;
  assert.deepEqual(pinPosition(poster, asset, { w: 1000, h: 1000 }), { x: .7, y: .4 });
});

test('layer moves preserve all entities and allow one-step and extreme ordering', () => {
  const layout = { posters: [{ id: 'a', layer: 20 }, { id: 'b', layer: 40 }, { id: 'c', layer: 60 }] };
  const order = () => [...layout.posters].sort((a, b) => a.layer - b.layer).map(poster => poster.id);
  moveLayer(layout, 'a', 1); assert.deepEqual(order(), ['b', 'a', 'c']);
  moveLayer(layout, 'a', -1, true); assert.deepEqual(order(), ['a', 'b', 'c']);
  moveLayer(layout, 'a', 1, true); assert.deepEqual(order(), ['b', 'c', 'a']);
});

test('secret roots and sheets never leak through a public poster anchor', () => {
  const notices = [{ id: 'root', title: 'Secret', secret: true }, { id: 'public', stackId: 'root', title: 'Visible' }];
  const poster = { noticeId: 'root' };
  assert.deepEqual(Array.from(groupForPoster(poster, notices, stacks).notices, notice => notice.title), ['Visible']);
  notices[1].secret = true;
  assert.equal(groupForPoster(poster, notices, stacks), null);
  assert.equal(groupForPoster(poster, notices, stacks, true).notices.length, 2);
});

test('deleting a root rebinds its paper to remaining sheets while retaining comments and content', () => {
  const notices = [{ id: 'root' }, { id: 'sheet', stackId: 'root', comments: [{ text: 'Bleibt' }] }];
  const layout = { posters: [{ id: 'paper', noticeId: 'root' }] };
  unlinkDeletedNotice(layout, notices, stacks, 'root');
  assert.equal(layout.posters[0].noticeId, 'sheet');
  assert.deepEqual(notices[1].comments, [{ text: 'Bleibt' }]);
  unlinkDeletedNotice(layout, notices.slice(1), stacks, 'sheet');
  assert.equal(layout.posters[0].noticeId, undefined);
});

test('the existing publication validator preserves layout together with old notice metadata', () => {
  const state = { schemaVersion: 2, zettel: [{ id: 'existing', x: .3, y: .4, comments: [{ text: 'Bleibt' }] }], boardLayout: preset.layout, appliedAuthoredNoticeIds: ['existing'] };
  assert.equal(publisher.validateBoardState(state), state);
  assert.deepEqual(state.zettel[0].comments, [{ text: 'Bleibt' }]);
  const invalid = structuredClone(state);
  invalid.boardLayout.posters[0].pin.x = NaN;
  assert.throws(() => publisher.validateBoardState(invalid), /Nageldaten/);
  invalid.boardLayout.posters = [state.boardLayout.posters[0], state.boardLayout.posters[0]];
  assert.throws(() => publisher.validateBoardState(invalid), /Nageldaten/);
});
