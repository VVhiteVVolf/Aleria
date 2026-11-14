import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { SCENE_ELEMENT_TYPES } from '../modules/scene-elements/scene-element-model.js';
import { getSceneElementIconUrl, renderSceneElementIcon } from '../modules/scene-elements/scene-element-icon-view.js';

const root = new URL('../../', import.meta.url);
test('all five custom icons retain exact originals and valid manifested web assets', async () => {
  const manifest = JSON.parse(await readFile(new URL('AleriaAlmanach/assets/scene-elements/art-manifest.json', root), 'utf8'));
  assert.deepEqual(manifest.icons.map(icon => icon.elementType).sort(), SCENE_ELEMENT_TYPES.map(type => type.id).sort());
  for (const entry of manifest.icons) {
    const original = await readFile(new URL(entry.original, root)), web = await readFile(new URL(entry.file, root));
    assert.equal(createHash('sha256').update(original).digest('hex'), entry.originalSha256);
    assert.equal(createHash('sha256').update(web).digest('hex'), entry.sha256);
    assert.equal(original.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.equal(original.readUInt32BE(16), original.readUInt32BE(20));
    assert.equal(web.toString('ascii', 0, 4), 'RIFF'); assert.equal(web.toString('ascii', 8, 12), 'WEBP');
    assert.ok(web.length < 60000);
    assert.equal('AleriaAlmanach/' + getSceneElementIconUrl(entry.elementType).slice(2), entry.file);
    assert.match(renderSceneElementIcon(entry.elementType), /alt=""/);
  }
});
