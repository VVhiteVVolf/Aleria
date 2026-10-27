import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { prepareBoardState } from '../assets/js/composition/board-composition-migration.mjs';
import { compositionConfig, DEFAULT_BOARD_BACKGROUND } from '../assets/js/composition/board-composition-config.mjs';
import { pinPosition, normalizeLayout } from '../assets/js/composition/board-composition-model.mjs';

const read = file => JSON.parse(readFileSync(new URL('../' + file, import.meta.url), 'utf8'));
const assets = read('assets/data/board-art-catalog.json').posters;
const context = { window: {}, encodeURIComponent };
vm.runInNewContext(readFileSync(new URL('../assets/js/notes/notice-stacks.js', import.meta.url), 'utf8'), context);
const stacks = context.window.TafelNoticeStacks;
vm.runInNewContext(readFileSync(new URL('../tafeln.registry.js', import.meta.url), 'utf8'), context);
const registry = context.window.TafelRegistry.all();
const byAsset = new Map(assets.map(asset => [asset.id, asset]));

test('all existing boards have a valid composition and future boards use the same default without a special activation flag', () => {
  assert.equal(compositionConfig().enabled, true);
  assert.equal(compositionConfig().background, DEFAULT_BOARD_BACKGROUND);
  assert.equal(compositionConfig({ boardComposition: { enabled: false } }).enabled, false);
  for (const board of registry) {
    const scope = { window: {} };
    vm.runInNewContext(readFileSync(new URL('../' + board.config, import.meta.url), 'utf8'), scope);
    const config = compositionConfig(scope.window.TAFEL_CONFIG);
    assert.equal(config.enabled, true, board.id);
    assert.ok(normalizeLayout(read(config.presetPath).layout, assets), board.id);
  }
});

test('Llysfaen retains every existing content link, coordinate, ID and comment while honoring old draft movements', () => {
  const board = registry.find(item => item.id.includes('llysfaen'));
  const incoming = read(board.dataPath).state;
  const preset = read(board.folder + '/board-layout.json');
  incoming.zettel[0].comments.push({ text: 'Bleibt erhalten', custom: { version: 7 } });
  incoming.zettel[0].x += .025;
  const original = structuredClone(incoming);
  const result = prepareBoardState(incoming, { assets, preset, stacks });
  assert.deepEqual(incoming, original);
  assert.deepEqual(result.zettel, original.zettel);
  assert.equal(result.boardLayout.posters.filter(poster => poster.noticeId).length, 11);
  assert.deepEqual(new Set(result.boardLayout.posters.flatMap(poster => poster.noticeId || [])), new Set(incoming.zettel.map(notice => notice.id)));
  const binding = preset.bindings.find(item => item.noticeId === incoming.zettel[0].id);
  const before = preset.layout.posters.find(item => item.id === binding.posterId);
  const after = result.boardLayout.posters.find(item => item.id === binding.posterId);
  assert.ok(Math.abs(after.x - before.x - .025 * preset.legacyScale.x) < 1e-8);
});

test('unknown Morddyn legacy stacks acquire their actual paper by position without creating quests or altering metadata', () => {
  const board = registry.find(item => item.id.endsWith('morddyn'));
  const preset = read(board.folder + '/board-layout.json');
  const front = preset.pieces.find(piece => piece.id.endsWith('-gesucht'));
  assert.ok(front);
  const rect = front.legacyBounds;
  const incoming = { zettel: [
    { id: 'old-root', typ: 'steckbrief', x: rect.x + rect.w / 2, y: rect.y + rect.h / 4, comments: [{ text: 'Alt' }] },
    { id: 'old-sheet', stackId: 'old-root', stackOrder: 1, secret: true, x: rect.x, y: rect.y },
  ], customField: { retained: true } };
  const original = structuredClone(incoming);
  const result = prepareBoardState(incoming, { assets, preset, stacks });
  assert.deepEqual(incoming, original);
  assert.deepEqual(result.zettel, original.zettel);
  assert.deepEqual(result.customField, original.customField);
  assert.equal(result.boardLayout.posters.length, preset.layout.posters.length);
  const linked = result.boardLayout.posters.filter(poster => poster.noticeId);
  assert.equal(linked.length, 1);
  assert.equal(linked[0].id, front.id);
  const point = pinPosition(linked[0], byAsset.get(linked[0].assetId), { w: 1254, h: 1254 });
  assert.ok(Math.abs(point.x - (incoming.zettel[0].x * preset.normalizedAffine.scaleX + preset.normalizedAffine.offsetX)) < 1e-8);
});

test('unmapped imported content and fresh boards work without a preset; explicit empty layouts never regrow artwork', () => {
  const incoming = { zettel: [{ id: 'imported', typ: 'fund', x: .4, y: .4, comments: ['retained'] }] };
  const result = prepareBoardState(incoming, { assets, stacks });
  assert.equal(result.boardLayout.posters.length, 1);
  const poster = result.boardLayout.posters[0];
  assert.equal(poster.assetId, 'gefunden');
  assert.deepEqual(pinPosition(poster, byAsset.get(poster.assetId), { w: 1254, h: 1254 }), { x: .4, y: .4 });
  assert.deepEqual(prepareBoardState({ ...incoming, boardLayout: { version: 1, posters: [] } }, { assets, stacks }).boardLayout.posters, []);
  assert.deepEqual(prepareBoardState(result, { assets, stacks }), result);
  assert.throws(() => prepareBoardState({ ...incoming, boardLayout: { version: 1, posters: [{ id: 'bad', assetId: 'absent' }] } }, { assets, stacks }), /ungültige/);
});

test('the ten additional general motifs are distinct reusable assets with no personal or regional assignment', () => {
  const ids = ['hochzeit-allgemein', 'unterkunft', 'vermietung', 'geleit', 'lieferung', 'verloren', 'gefunden', 'heilung', 'lehrlinge', 'versammlung'];
  assert.equal(new Set(ids.map(id => byAsset.get(id)?.src)).size, 10);
  for (const id of ids) {
    assert.equal(byAsset.get(id)?.scope, 'general', id);
    assert.equal(byAsset.get(id)?.boardId, undefined);
  }
});
