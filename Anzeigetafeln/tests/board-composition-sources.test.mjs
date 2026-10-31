import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBoardCompositionSources } from '../assets/js/composition/board-composition-sources.mjs';

const oldAsset = { id: 'old', aspect: 1 };
const newAsset = { id: 'new', aspect: 1 };
const preset = { layout: { version: 1, posters: [{ id: 'paper', assetId: 'new', x: .5, y: .5, width: .1 }] } };

test('fresh layouts never use an old cached artwork catalog', async () => {
  const calls = [];
  const result = await loadBoardCompositionSources({ presetPath: 'preset.json' }, async (path, options) => {
    calls.push({ path, ...options });
    const catalog = { posters: options?.cache === 'no-store' ? [oldAsset, newAsset] : [oldAsset] };
    return { ok: true, json: async () => path === 'preset.json' ? preset : catalog };
  });
  assert.equal(result.assets.length, 2);
  assert.equal(result.preset, preset);
  assert.ok(calls.every(call => call.cache === 'no-store'));
});

test('missing sources and invalid layouts still reject without changing their data', async () => {
  const before = JSON.stringify(preset);
  await assert.rejects(loadBoardCompositionSources({}, async () => ({ ok: false })), /fehlt/);
  await assert.rejects(loadBoardCompositionSources({ presetPath: 'preset.json' }, async path => ({ ok: true,
    json: async () => path === 'preset.json' ? preset : { posters: [oldAsset] } })), /Ungültige/);
  assert.equal(JSON.stringify(preset), before);
});
