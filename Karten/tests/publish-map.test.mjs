import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { handler } from '../../netlify/functions/karten-publisher.mjs';

const storageSource = fs.readFileSync(new URL('../assets/js/karto-storage.js', import.meta.url), 'utf8');
const uiSource = fs.readFileSync(new URL('../assets/js/core/karto-publish-ui.js', import.meta.url), 'utf8');
const dataPath = 'test-map/data.json';
const draftKey = 'karto.draft.test-map';
const state = { regionTitle: 'Testkarte', pins: [{ id: 'pin', x: 12, y: 34 }], cats: [],
  showMarkers: false, showPinLabels: true, alwaysShowLettering: true };

function githubFixture(t, { publishKey, revision = 2 } = {}) {
  const env = {
    ALERIA_GITHUB_TOKEN: 'server-only-test-token',
    ALERIA_GITHUB_REPOSITORY: 'test-owner/test-repo',
    ALERIA_GITHUB_BRANCH: 'master',
    ALERIA_GITHUB_PUBLISH_KEY: publishKey,
  };
  for (const [key, value] of Object.entries(env)) {
    const original = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
    t.after(() => {
      if (original === undefined) delete process.env[key];
      else process.env[key] = original;
    });
  }
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options = {}) => {
    const path = new URL(url).pathname.replace('/repos/test-owner/test-repo', '');
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ path, method: options.method || 'GET', body });
    assert.equal(options.headers.Authorization, 'Bearer server-only-test-token');
    let payload;
    if (path === '/git/ref/heads/master') payload = { object: { sha: 'head-sha' } };
    else if (path === '/git/commits/head-sha') payload = { tree: { sha: 'base-tree' } };
    else if (path === `/contents/Karten/${dataPath}`) {
      payload = { content: Buffer.from(JSON.stringify({ revision, state })).toString('base64') };
    } else if (path === '/git/blobs') payload = { sha: 'blob-sha' };
    else if (path === '/git/trees') payload = { sha: 'tree-sha' };
    else if (path === '/git/commits') payload = { sha: 'commit-sha' };
    else if (path === '/git/refs/heads/master') payload = {};
    else assert.fail(`Unexpected GitHub request: ${path}`);
    return { ok: true, json: async () => payload };
  });
  return calls;
}

async function browserFixture() {
  const items = new Map([[draftKey, JSON.stringify({ basedOnRevision: 2, state })]]);
  const requests = [];
  const elements = new Map([
    ['publish-mo', { classList: { add() {} } }],
    ['publish-map-title', { textContent: '' }],
    ['publish-result', { style: {}, textContent: '', innerHTML: '' }],
    ['publish-confirm-btn', { disabled: false, focus() {} }],
  ]);
  const window = {
    KARTO_CONFIG: { mapId: 'test-map', storage: { dataPath } },
    dispatchEvent() {},
    KartoRuntime: { state: () => state, flushSave: async () => {}, toast() {} },
  };
  const context = vm.createContext({
    window,
    document: { getElementById: id => elements.get(id) || null },
    localStorage: {
      getItem: key => items.get(key) ?? null,
      setItem: (key, value) => items.set(key, value),
      removeItem: key => items.delete(key),
    },
    Event,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
    console,
    setTimeout: () => 1,
    fetch: async (url, options = {}) => {
      if (url === dataPath) return { ok: true, json: async () => ({ revision: 2, state }) };
      assert.equal(url, '/.netlify/functions/karten-publisher');
      requests.push(options);
      const response = await handler({ httpMethod: options.method, headers: options.headers, body: options.body });
      return { ok: response.statusCode < 400, status: response.statusCode, json: async () => JSON.parse(response.body) };
    },
  });
  vm.runInContext(storageSource, context);
  vm.runInContext(uiSource, context);
  await new Promise(resolve => window._fb.sub(resolve));
  return { window, items, elements, requests };
}

for (const publishKey of [undefined, 'legacy-key-for-other-publishers']) {
  test(`publishes from the dialog without login (${publishKey ? 'legacy key configured' : 'no key configured'})`, async t => {
    const calls = githubFixture(t, { publishKey });
    const f = await browserFixture();
    f.window.openPublishModal();
    assert.equal(f.elements.get('publish-map-title').textContent, 'Testkarte');
    await f.window.publishOnline();
    assert.equal(f.requests.length, 1);
    assert.equal(f.requests[0].method, 'POST');
    assert.deepEqual(Object.keys(f.requests[0].headers), ['Content-Type']);
    assert.equal(f.window.KartoPublish.publishedRevision(), 3);
    assert.equal(f.items.has(draftKey), false);
    assert.match(f.elements.get('publish-result').innerHTML, /Revision 3/);
    assert.equal(f.elements.get('publish-confirm-btn').disabled, false);
    const envelope = JSON.parse(calls.find(call => call.path === '/git/blobs').body.content);
    assert.equal(envelope.revision, 3);
    assert.deepEqual(envelope.state, state);
    assert.deepEqual(calls.at(-1), {
      path: '/git/refs/heads/master', method: 'PATCH', body: { sha: 'commit-sha', force: false },
    });
  });
}

test('a newer published revision keeps the local draft and writes nothing to GitHub', async t => {
  const calls = githubFixture(t, { revision: 3 });
  const f = await browserFixture();
  await f.window.publishOnline();
  assert.equal(f.window.KartoPublish.publishedRevision(), 2);
  assert.equal(f.items.has(draftKey), true);
  assert.ok(calls.every(call => call.method === 'GET'));
  assert.match(f.elements.get('publish-result').textContent, /neuere Fassung/);
  assert.equal(f.elements.get('publish-confirm-btn').disabled, false);
});

test('server failures keep the draft available for another attempt', async t => {
  githubFixture(t);
  const f = await browserFixture();
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false, status: 503, json: async () => ({ message: 'GitHub nicht erreichbar' }),
  }));
  await f.window.publishOnline();
  assert.equal(f.items.has(draftKey), true);
  assert.equal(f.elements.get('publish-confirm-btn').disabled, false);
  assert.match(f.elements.get('publish-result').textContent, /GitHub nicht erreichbar/);
});

test('invalid paths and oversized requests are still rejected before any GitHub call', async t => {
  const calls = githubFixture(t);
  const invalid = await handler({ httpMethod: 'POST', body: JSON.stringify({ dataPath: '../outside/data.json', state }) });
  assert.ok(invalid.statusCode >= 400);
  assert.match(JSON.parse(invalid.body).message, /Datenpfad/);
  const oversized = await handler({ httpMethod: 'POST', body: 'x'.repeat(6 * 1024 * 1024 + 1) });
  assert.equal(oversized.statusCode, 413);
  assert.deepEqual(calls, []);
});
