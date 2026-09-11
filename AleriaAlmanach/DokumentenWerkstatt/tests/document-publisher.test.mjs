import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDocument, validateRecord, safeImageUrl, documentLink } from '../js/document-schema.js';
import { createPngArchive } from '../js/export/png-archive.js';
import { parseRecords, publish, handler, __testables } from '../../../netlify/functions/document-publisher.mjs';
import { __testables as cards } from '../../../netlify/functions/karten-publisher.mjs';
import { createGitHubClient } from '../../../netlify/functions/shared/github-publishing.mjs';

const document = normalizeDocument({ title: 'Brief der Königin', slug: 'brief', pages: ['<p>Bewahrt dieses Blatt.</p>'], paperColor: 'sage', paperEdge: 'torn' });
const record = { id: 'brief', expectedRevision: 0, document };
const config = { owner: 'test', repo: 'repo', repository: 'test/repo', branch: 'master', token: 'fake-token' };

test('normalization preserves paper recipe, translation, old media and clamps dimensions', () => {
  const result = normalizeDocument({ ...document, width: Infinity, height: 999999, translation: 'CH steht hier.', signatureImage: 'https://example.com/a.png', media: null, font: "x';background:url(https://bad)" });
  assert.equal(result.paperEdge, 'torn'); assert.equal(result.paperColor, 'sage'); assert.equal(result.width, 820); assert.equal(result.height, 1800);
  assert.equal(result.translation, 'CH steht hier.'); assert.equal(result.media.signature.image, 'https://example.com/a.png'); assert.equal(result.font, "'Eagle Lake'");
});

test('only safe asset URLs and exact Imgur hosts are accepted', () => {
  assert.equal(safeImageUrl('javascript:alert(1)'), ''); assert.equal(safeImageUrl('data:image/svg+xml;base64,abc'), '');
  assert.equal(safeImageUrl('https://imgur.com/abc'), 'https://i.imgur.com/abc.jpg');
  assert.equal(safeImageUrl('https://evilimgur.com/abc'), 'https://evilimgur.com/abc');
  assert.equal(safeImageUrl('//evil.test/a.png'), ''); assert.equal(safeImageUrl('/../secret'), '');
});

test('batch validation rejects traversal, duplicates, mismatched IDs and invalid revisions', () => {
  assert.throws(() => validateRecord({ ...record, id: '../foo' }));
  assert.throws(() => validateRecord({ ...record, id: 'other' }));
  assert.throws(() => validateRecord({ ...record, expectedRevision: -1 }));
  assert.throws(() => validateRecord({ ...record, expectedRevision: 1.5 }));
  assert.throws(() => validateRecord({ ...record, document: null }));
  assert.throws(() => parseRecords(JSON.stringify({ records: [record, record] })));
  assert.throws(() => parseRecords(JSON.stringify({ records: [] })));
  assert.throws(() => parseRecords(JSON.stringify({ records: Array(25).fill(record) })));
  assert.equal(parseRecords(JSON.stringify({ records: [record] }))[0].document.title, document.title);
});

function githubFixture({ revision = 0, race = false } = {}) {
  const requests = [];
  const encode = value => ({ content: Buffer.from(JSON.stringify(value)).toString('base64') });
  const fetchRef = async (url, options = {}) => {
    const path = decodeURIComponent(new URL(url).pathname).replace('/repos/test/repo', '');
    const body = options.body ? JSON.parse(options.body) : null;
    requests.push({ path, body, method: options.method || 'GET', url });
    let status = 200, value;
    if (path === '/git/ref/heads/master') value = { object: { sha: 'head-a' } };
    else if (path === '/git/commits/head-a') value = { tree: { sha: 'tree-a' } };
    else if (path.endsWith('/registry.json')) value = encode({ documents: [{ id: 'existing', title: 'Vorhanden', revision: 4 }] });
    else if (path.includes('/contents/')) { if (revision) value = encode({ revision, document }); else { status = 404; value = {}; } }
    else if (path === '/git/blobs') value = { sha: `blob-${requests.length}` };
    else if (path === '/git/trees') value = { sha: 'tree-b' };
    else if (path === '/git/commits') value = { sha: 'commit-b' };
    else if (path === '/git/refs/heads/master') { status = race ? 422 : 200; value = race ? { message: 'Not a fast forward' } : {}; }
    else throw new Error(`Unexpected request ${path}`);
    return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
  };
  return { requests, fetchRef };
}

test('publication commits documents and merged registry atomically without forcing the branch', async () => {
  const fixture = githubFixture();
  const result = await publish([record], config, fixture.fetchRef);
  assert.equal(result.records[0].revision, 1);
  const patch = fixture.requests.find(request => request.method === 'PATCH'); assert.deepEqual(patch.body, { sha: 'commit-b', force: false });
  const tree = fixture.requests.find(request => request.path === '/git/trees');
  assert.deepEqual(tree.body.tree.map(entry => entry.path), ['Dokumente aus der Werkstatt/data/brief.json', 'Dokumente aus der Werkstatt/registry.json']);
  const registry = fixture.requests.filter(request => request.path === '/git/blobs').map(request => JSON.parse(request.body.content)).find(value => value.documents);
  assert.equal(registry.documents.length, 2); assert.equal(registry.documents.find(entry => entry.id === 'existing').revision, 4);
  assert.ok(fixture.requests.filter(request => request.path.includes('/contents/')).every(request => new URL(request.url).searchParams.get('ref') === 'head-a'));
});

test('one stale document stops the entire batch before any writes', async () => {
  const fixture = githubFixture({ revision: 3 });
  await assert.rejects(publish([record], config, fixture.fetchRef), error => error.status === 409);
  assert.ok(fixture.requests.every(request => request.method === 'GET'));
});

test('concurrent GitHub branch changes reject publication', async () => {
  const fixture = githubFixture({ race: true });
  await assert.rejects(publish([record], config, fixture.fetchRef), error => error.status === 422);
});

test('image assets are validated, materialized and referenced from the published document', () => {
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==';
  const { saved, files } = __testables.documentFiles({ ...record, document: normalizeDocument({ ...document, media: { main: { image: png }, signature: { image: png } } }) }, 'today');
  assert.equal(files.length, 2); assert.match(saved.document.media.main.image, /^\/Dokumente%20aus%20der%20Werkstatt\/assets\/brief\//);
  assert.equal(saved.document.media.main.image, saved.document.media.signature.image);
  assert.throws(() => __testables.validateAsset('data:image/png;base64,YmFk', 'image'));
  assert.throws(() => __testables.validateAsset('data:font/woff2;base64,YmFk', 'font'));
});

test('publisher rejects unauthenticated writes before contacting GitHub', async () => {
  const response = await handler({ httpMethod: 'POST', headers: {}, body: JSON.stringify({ records: [record] }) });
  assert.equal(response.statusCode, 401);
});

test('shared transport preserves Karten key comparison and validation', () => {
  assert.equal(cards.secureEqual('key', 'key'), true); assert.equal(cards.secureEqual('key', 'other'), false);
  assert.equal(cards.validateDataPath('Cenyr/test/data.json'), 'Cenyr/test/data.json');
  assert.throws(() => cards.validateDataPath('../data.json'));
});

test('documents above the Contents API inline limit load through the immutable Git blob', async () => {
  const calls = [], sha = 'a'.repeat(40);
  const client = createGitHubClient(config, async url => {
    calls.push(url);
    return new Response(JSON.stringify(calls.length === 1 ? { encoding: 'none', sha } : { encoding: 'base64', content: 'e30=' }));
  });
  const result = await client.readContent('Dokumente aus der Werkstatt/data/brief.json', 'head');
  assert.equal(result.content, 'e30='); assert.ok(calls[1].endsWith(`/git/blobs/${sha}`));
});

test('stable reader links and ZIP directory reference the intended files', async () => {
  assert.equal(documentLink('brief', 'https://aleria.test/anything'), 'https://aleria.test/Dokumente%20aus%20der%20Werkstatt/dokument.html?id=brief');
  assert.throws(() => documentLink('../secret'));
  const blob = await createPngArchive([{ name: 'brief-001.png', blob: new Blob(['test-png']) }]);
  const bytes = new Uint8Array(await blob.arrayBuffer()), view = new DataView(bytes.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50); assert.equal(view.getUint32(bytes.length - 22, true), 0x06054b50);
  assert.equal(view.getUint16(bytes.length - 14, true), 1); assert.ok(new TextDecoder().decode(bytes).includes('brief-001.png'));
});
