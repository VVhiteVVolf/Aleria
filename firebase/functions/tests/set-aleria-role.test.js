import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAleriaRole } from '../src/access/set-aleria-role.js';

test('globale Aleria-Rollen sind eng begrenzt', () => {
  assert.equal(validateAleriaRole('Moderator'), 'moderator');
  assert.throws(() => validateAleriaRole('root'));
  assert.throws(() => validateAleriaRole(''));
});
