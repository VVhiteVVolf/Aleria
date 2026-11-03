import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { checkWeaponStandardArt, validateWeaponStandardImage } from '../scripts/check-weapon-standard-art.mjs';

test('all 35 original weapon sources and prepared 512px RGBA assets match their preparation receipt', async () => {
  assert.deepEqual(await checkWeaponStandardArt(), { count: 35, size: 512 });
});

test('the portable art gate rejects wrong dimensions, RGB and non-PNG assets', async () => {
  const valid = await readFile(new URL('../public/assets/weapon-standards/degen.png', import.meta.url));
  validateWeaponStandardImage(valid);
  const wrongSize = Buffer.from(valid); wrongSize.writeUInt32BE(256, 16);
  assert.throws(() => validateWeaponStandardImage(wrongSize), /512x512/);
  const rgb = Buffer.from(valid); rgb[25] = 2;
  assert.throws(() => validateWeaponStandardImage(rgb), /RGBA/);
  assert.throws(() => validateWeaponStandardImage(Buffer.from('not an image')), /PNG/);
});
