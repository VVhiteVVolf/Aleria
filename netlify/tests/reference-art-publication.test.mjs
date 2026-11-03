import test from 'node:test';
import assert from 'node:assert/strict';
import { isAuthoringArchive } from '../build/publication-policy.mjs';

test('generated art sources remain in Git while active reference icons remain publishable', () => {
  for (const family of ['combat-technique-icons', 'weapon-standards', 'ability-icons', 'character-origins']) {
    assert.equal(isAuthoringArchive(`AleriaAlmanach/docs/art/${family}/sources/example.png`), true);
    assert.equal(isAuthoringArchive(`AleriaAlmanach/docs/art/${family}/manifest.json`), true);
    assert.equal(isAuthoringArchive(`AleriaAlmanach/public/assets/${family}/example.png`), false);
  }
  assert.equal(isAuthoringArchive('AleriaAlmanach/docs/art/character-style/2026-10-24-approved-house-knight.png'), false);
});
