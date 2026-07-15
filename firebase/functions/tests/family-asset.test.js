import assert from 'node:assert/strict';
import test from 'node:test';
import { hasValidImageSignature } from '../src/assets/upload-family-asset.js';

test('akzeptiert nur passende Bildsignaturen', () => {
  assert.equal(hasValidImageSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/png'), true);
  assert.equal(hasValidImageSignature(Buffer.from([0xff, 0xd8, 0xff, 0x00]), 'image/jpeg'), true);
  assert.equal(hasValidImageSignature(Buffer.from('RIFF0000WEBP'), 'image/webp'), true);
  assert.equal(hasValidImageSignature(Buffer.from('<svg>'), 'image/png'), false);
});
