import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { verifyPublisherToken, checkPublisherAccess } from '../../netlify/functions/shared/publisher-access.mjs';

test('publisher identity requires a valid Google-style signature, project, issuer and timestamps', async () => {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const claims = { aud: 'aleriaprojekt', iss: 'https://securetoken.google.com/aleriaprojekt', sub: 'editor-uid', exp: 200, iat: 90, auth_time: 90, aleriaRole: 'editor' };
  const token = (overrides = {}, header = {}) => {
    const encoded = [JSON.stringify({ alg: 'RS256', kid: 'test-key', ...header }), JSON.stringify({ ...claims, ...overrides })].map(value => Buffer.from(value).toString('base64url')).join('.');
    return `${encoded}.${sign('RSA-SHA256', Buffer.from(encoded), privateKey).toString('base64url')}`;
  };
  const options = { keys: async () => ({ 'test-key': publicKey.export({ type: 'spki', format: 'pem' }) }), now: () => 100 };
  assert.deepEqual(await verifyPublisherToken(token(), options), { uid: 'editor-uid', role: 'editor' });
  for (const overrides of [{ aud: 'other' }, { iss: 'https://attacker.test' }, { exp: 100 }, { iat: 101 }, { auth_time: 101 }, { sub: '' }]) await assert.rejects(verifyPublisherToken(token(overrides), options));
  await assert.rejects(verifyPublisherToken(token({}, { alg: 'none' }), options));
  const valid = token();
  await assert.rejects(verifyPublisherToken(valid.slice(0, -5) + 'AAAAA', options));
});
test('observe preserves existing publication; enforce allows only verified editorial roles and logs no credentials', async () => {
  const logs = [];
  const options = { log: value => logs.push(value), verifyToken: async token => token === 'valid-editor' ? { role: 'editor', uid: 'private-uid' } : { role: 'player' } };
  assert.equal(await checkPublisherAccess({ headers: {} }, 'map', options), null);
  assert.equal((await checkPublisherAccess({ headers: {} }, 'map', { ...options, mode: 'enforce' })).statusCode, 401);
  assert.equal((await checkPublisherAccess({ headers: { authorization: 'Bearer player-token' } }, 'family', { ...options, mode: 'enforce' })).statusCode, 403);
  assert.equal(await checkPublisherAccess({ headers: { authorization: 'Bearer valid-editor' } }, 'family', { ...options, mode: 'enforce' }), null);
  assert.equal(logs.join('').includes('valid-editor'), false);
  assert.equal(logs.join('').includes('private-uid'), false);
});
