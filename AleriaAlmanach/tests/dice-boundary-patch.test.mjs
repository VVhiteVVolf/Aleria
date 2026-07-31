import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { patchDiceBoxBoundarySource } from '../scripts/dice-box-boundary-patch.mjs';

test('replaces the rectangular Dice Box boundary with Aleria ellipse segments', async () => {
  const packageSource = await readFile('node_modules/@3d-dice/dice-box/dist/dice-box.es.js', 'utf8');
  const patchedSource = patchDiceBoxBoundarySource(packageSource);
  const workerBase64 = patchedSource.match(/const ml = "([A-Za-z0-9+/=]+)"/)?.[1];

  assert.ok(workerBase64);
  const workerSource = Buffer.from(workerBase64, 'base64').toString('utf8');
  assert.match(workerSource, /ALERIA_ELLIPSE_BOUNDARY="v1"/);
  assert.match(workerSource, /boundarySegments/);
  assert.match(workerSource, /boundaryInsetX/);
  assert.match(workerSource, /boundaryInsetY/);
});
