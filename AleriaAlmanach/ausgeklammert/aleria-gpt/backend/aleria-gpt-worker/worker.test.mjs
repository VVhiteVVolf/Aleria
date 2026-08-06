import assert from 'node:assert/strict';
import test from 'node:test';
import { workerInternals } from './worker.js';

test('chat origins require an explicit allow-list match', () => {
  const env = { ALERIA_GPT_ALLOWED_ORIGINS: 'https://dieweltvonaleria.netlify.app' };
  assert.equal(workerInternals.isOriginAllowed('', env), false);
  assert.equal(workerInternals.isOriginAllowed('https://evil.example', env), false);
  assert.equal(workerInternals.isOriginAllowed('https://dieweltvonaleria.netlify.app', env), true);
});

test('rate limiting denies the next request until the rolling window expires', () => {
  const first = workerInternals.nextUsageState({}, { now: 100000, windowMs: 60000, maximumRequests: 2 });
  const second = workerInternals.nextUsageState(first.state, { now: 100100, windowMs: 60000, maximumRequests: 2 });
  const denied = workerInternals.nextUsageState(second.state, { now: 100200, windowMs: 60000, maximumRequests: 2 });
  assert.equal(denied.allowed, false);
  assert.equal(denied.reason, 'rate');
  assert.ok(denied.retryAfterSeconds > 0);
});

test('daily token reservation is conservative and resets on the next UTC day', () => {
  const dayOne = Date.parse('2026-08-03T10:00:00Z');
  const first = workerInternals.nextUsageState({}, { now: dayOne, tokenReservation: 700, dailyTokenBudget: 1000 });
  const denied = workerInternals.nextUsageState(first.state, { now: dayOne + 1000, tokenReservation: 400, dailyTokenBudget: 1000 });
  const nextDay = workerInternals.nextUsageState(denied.state, { now: Date.parse('2026-08-04T00:00:01Z'), tokenReservation: 400, dailyTokenBudget: 1000 });
  assert.equal(denied.allowed, false);
  assert.equal(denied.reason, 'budget');
  assert.equal(nextDay.allowed, true);
  assert.equal(nextDay.state.usedTokens, 400);
});

test('response budgets cap every requested answer style', () => {
  const env = { ALERIA_GPT_MAX_TOKENS: '5000' };
  assert.equal(workerInternals.getResponseTokenLimit(env, { answerStyle: 'short' }), 320);
  assert.equal(workerInternals.getResponseTokenLimit(env, { answerStyle: 'normal' }), 620);
  assert.equal(workerInternals.getResponseTokenLimit(env, { answerStyle: 'deep' }), 3000);
});

test('response budgets still respect a lower configured ceiling than the style default', () => {
  const env = { ALERIA_GPT_MAX_TOKENS: '1500' };
  assert.equal(workerInternals.getResponseTokenLimit(env, { answerStyle: 'deep' }), 1500);
});

test('model chain puts the primary model first and appends configured fallbacks in order', () => {
  const env = {
    ALERIA_GPT_MODEL: 'sao10k/l3.3-euryale-70b',
    ALERIA_GPT_FALLBACK_MODELS: 'anthracite-org/magnum-v4-72b, nousresearch/hermes-4-70b'
  };
  assert.deepEqual(workerInternals.getModelChain(env), [
    'sao10k/l3.3-euryale-70b',
    'anthracite-org/magnum-v4-72b',
    'nousresearch/hermes-4-70b'
  ]);
});

test('model chain works with no fallbacks configured', () => {
  assert.deepEqual(workerInternals.getModelChain({ ALERIA_GPT_MODEL: 'sao10k/l3.3-euryale-70b' }), ['sao10k/l3.3-euryale-70b']);
});

function encodePart(value) {
  return Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
}

// Google liefert das Standard-JWKS-Format { keys: [{kid, ...}, ...] }, keine flache kid->JWK-Map.
function jwksResponse(entries = []) {
  return new Response(JSON.stringify({ keys: entries }), { headers: { 'cache-control': 'public, max-age=300' } });
}

async function makeFirebaseToken(overrides = {}) {
  const keys = await crypto.subtle.generateKey({
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256'
  }, true, ['sign', 'verify']);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = encodePart({ alg: 'RS256', typ: 'JWT', kid: 'test-key' });
  const payload = encodePart({
    aud: 'aleriaprojekt',
    iss: 'https://securetoken.google.com/aleriaprojekt',
    sub: 'anonymous-user-1',
    iat: nowSeconds - 5,
    exp: nowSeconds + 3600,
    ...overrides
  });
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keys.privateKey,
    new TextEncoder().encode(`${header}.${payload}`)
  );
  const publicJwk = await crypto.subtle.exportKey('jwk', keys.publicKey);
  return { token: `${header}.${payload}.${Buffer.from(signature).toString('base64url')}`, publicJwk };
}

test('Firebase token verification parses the real Google JWKS array shape, not a flat kid map', async () => {
  // Regression guard: Google's live endpoint returns { keys: [{kid, ...}, ...] }, not { [kid]: jwk }.
  // Mixing this up meant jwks[header.kid] could never match anything, ever - every token failed.
  const originalFetch = globalThis.fetch;
  const { token, publicJwk } = await makeFirebaseToken();
  workerInternals.resetFirebaseJwksCache();
  const decoyJwk = { ...publicJwk, kid: 'decoy-key', alg: 'RS256', use: 'sig' };
  globalThis.fetch = async () => jwksResponse([decoyJwk, { ...publicJwk, kid: 'test-key', alg: 'RS256', use: 'sig' }]);
  try {
    const identity = await workerInternals.verifyFirebaseIdToken(token, {
      ALERIA_FIREBASE_PROJECT_ID: 'aleriaprojekt'
    });
    assert.equal(identity.uid, 'anonymous-user-1');
  } finally {
    globalThis.fetch = originalFetch;
    workerInternals.resetFirebaseJwksCache();
  }
});

test('Firebase token verification checks signature, project and identity', async () => {
  const originalFetch = globalThis.fetch;
  const { token, publicJwk } = await makeFirebaseToken();
  workerInternals.resetFirebaseJwksCache();
  globalThis.fetch = async () => jwksResponse([{ ...publicJwk, kid: 'test-key', alg: 'RS256', use: 'sig' }]);
  try {
    const identity = await workerInternals.verifyFirebaseIdToken(token, {
      ALERIA_FIREBASE_PROJECT_ID: 'aleriaprojekt'
    });
    assert.equal(identity.uid, 'anonymous-user-1');
    await assert.rejects(
      workerInternals.verifyFirebaseIdToken(token, { ALERIA_FIREBASE_PROJECT_ID: 'another-project' }),
      error => error.status === 401
    );
  } finally {
    globalThis.fetch = originalFetch;
    workerInternals.resetFirebaseJwksCache();
  }
});

test('Firebase token verification force-refreshes the key set once if the kid is missing from the cache', async () => {
  const originalFetch = globalThis.fetch;
  const { token, publicJwk } = await makeFirebaseToken();
  workerInternals.resetFirebaseJwksCache();
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    const entries = calls === 1 ? [] : [{ ...publicJwk, kid: 'test-key', alg: 'RS256', use: 'sig' }];
    return jwksResponse(entries);
  };
  try {
    const identity = await workerInternals.verifyFirebaseIdToken(token, {
      ALERIA_FIREBASE_PROJECT_ID: 'aleriaprojekt'
    });
    assert.equal(identity.uid, 'anonymous-user-1');
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
    workerInternals.resetFirebaseJwksCache();
  }
});

test('Firebase token verification still fails cleanly if the key is missing even after a forced refresh', async () => {
  const originalFetch = globalThis.fetch;
  const { token } = await makeFirebaseToken();
  workerInternals.resetFirebaseJwksCache();
  globalThis.fetch = async () => jwksResponse([]);
  try {
    await assert.rejects(
      workerInternals.verifyFirebaseIdToken(token, { ALERIA_FIREBASE_PROJECT_ID: 'aleriaprojekt' }),
      error => error.status === 401
    );
  } finally {
    globalThis.fetch = originalFetch;
    workerInternals.resetFirebaseJwksCache();
  }
});

test('Firebase token verification rejects a modified signature', async () => {
  const originalFetch = globalThis.fetch;
  const { token, publicJwk } = await makeFirebaseToken();
  workerInternals.resetFirebaseJwksCache();
  globalThis.fetch = async () => jwksResponse([{ ...publicJwk, kid: 'test-key', alg: 'RS256', use: 'sig' }]);
  const parts = token.split('.');
  const head = parts[2].startsWith('a') ? 'b' : 'a';
  const tampered = `${parts[0]}.${parts[1]}.${head}${parts[2].slice(1)}`;
  try {
    await assert.rejects(
      workerInternals.verifyFirebaseIdToken(tampered, { ALERIA_FIREBASE_PROJECT_ID: 'aleriaprojekt' }),
      error => error.status === 401
    );
  } finally {
    globalThis.fetch = originalFetch;
    workerInternals.resetFirebaseJwksCache();
  }
});
