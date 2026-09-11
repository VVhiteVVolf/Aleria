import { json, secureEqual, bearerToken, repositoryConfig, createGitHubClient } from './shared/github-publishing.mjs';
import { validateRecord, ID_PATTERN, MAX_BATCH_BYTES, IMAGE_DATA, FONT_DATA } from '../../AleriaAlmanach/DokumentenWerkstatt/js/document-schema.js';

const ROOT = 'Dokumente aus der Werkstatt';
const REGISTRY_PATH = `${ROOT}/registry.json`;
function badRequest(message) { return Object.assign(new Error(message), { status: 400 }); }

function decodeContent(record, fallback) {
  if (!record) return fallback;
  if (!record.content) throw new Error('Die GitHub-Datei kann nicht gelesen werden.');
  return JSON.parse(Buffer.from(record.content.replace(/\s/g, ''), 'base64').toString('utf8'));
}

export function parseRecords(body) {
  const payload = JSON.parse(body || '{}');
  if (!Array.isArray(payload.records) || !payload.records.length || payload.records.length > 24) throw badRequest('Bitte 1 bis 24 Dokumente übergeben.');
  let records;
  try { records = payload.records.map(validateRecord); } catch (error) { throw badRequest(error.message); }
  if (new Set(records.map(record => record.id)).size !== records.length) throw badRequest('Eine Dokument-ID kommt im Paket doppelt vor.');
  return records;
}

function validateAsset(data, type) {
  const buffer = Buffer.from(data.split(',')[1], 'base64');
  const signature = buffer.subarray(0, 4).toString('latin1');
  if (buffer.length > 2000000) throw badRequest('Ein eingebundenes Bild oder eine Schrift ist zu groß.');
  if (type === 'font') {
    if (!FONT_DATA.test(data) || !['wOF2', 'wOFF', 'OTTO', '\x00\x01\x00\x00', 'true'].includes(signature)) throw badRequest('Ungültige Schriftdatei.');
  } else {
    const png = data.startsWith('data:image/png;') && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = data.startsWith('data:image/jpeg;') && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
    const webp = data.startsWith('data:image/webp;') && signature === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    if (!png && !jpeg && !webp) throw badRequest('Ungültige Bilddatei.');
  }
}

function documentFiles(record, updatedAt) {
  const document = structuredClone(record.document);
  const revision = record.expectedRevision + 1;
  // Embedded fonts stay in the JSON so downloads/imports remain self-contained.
  if (document.customFont) validateAsset(document.customFont.data, 'font');
  const files = [], images = new Map();
  const materialize = (owner, field, label) => {
    const data = owner[field];
    if (!IMAGE_DATA.test(data || '')) return;
    validateAsset(data, 'image');
    if (!images.has(data)) {
      const type = data.slice('data:image/'.length).split(';')[0];
      const path = `assets/${record.id}/${label}-r${revision}.${type === 'jpeg' ? 'jpg' : type}`;
      images.set(data, `/${encodeURIComponent(ROOT)}/${path}`);
      files.push({ path: `${ROOT}/${path}`, content: data.split(',')[1], encoding: 'base64' });
    }
    owner[field] = images.get(data);
  };
  Object.entries(document.media).forEach(([key, slot]) => materialize(slot, 'image', key));
  materialize(document, 'texture', 'texture'); document.image = document.media.main.image;
  const saved = { schemaVersion: 2, id: record.id, revision, updatedAt, document };
  const content = JSON.stringify(saved, null, 2) + '\n';
  files.push({ path: `${ROOT}/data/${record.id}.json`, content, encoding: 'utf-8' });
  return { saved, files };
}

export async function publish(records, config, fetchRef = fetch) {
  if (!config.token) throw new Error('ALERIA_GITHUB_TOKEN ist in Netlify noch nicht gesetzt.');
  const github = createGitHubClient(config, fetchRef);
  const ref = await github.request(`/git/ref/heads/${encodeURIComponent(config.branch)}`);
  const head = ref.object.sha;
  const commit = await github.request(`/git/commits/${encodeURIComponent(head)}`);
  const registry = decodeContent(await github.readContent(REGISTRY_PATH, head), { schemaVersion: 2, documents: [] });
  if (!Array.isArray(registry.documents)) throw new Error('Ungültige Dokumentenregistry auf GitHub.');
  // Validate every revision before creating any blobs. One stale record blocks the whole batch.
  for (const record of records) {
    const current = decodeContent(await github.readContent(`${ROOT}/data/${record.id}.json`, head), null);
    const actual = current?.revision || 0;
    if (actual !== record.expectedRevision) throw Object.assign(new Error(`„${record.document.title}“ hat online Revision ${actual}. Bitte die Online-Fassung laden, Änderungen abgleichen und erneut vormerken.`), { status: 409 });
  }
  const updatedAt = new Date().toISOString();
  const prepared = records.map(record => documentFiles(record, updatedAt));
  const entries = new Map(registry.documents.map(entry => [entry.id, entry]));
  for (const { saved } of prepared) entries.set(saved.id, {
    id: saved.id, title: saved.document.title, template: saved.document.template, category: saved.document.category,
    revision: saved.revision, updatedAt, pageCount: saved.document.pages.length,
    link: `dokument.html?id=${saved.id}`
  });
  const files = prepared.flatMap(record => record.files);
  files.push({ path: REGISTRY_PATH, content: JSON.stringify({ schemaVersion: 2, documents: [...entries.values()].sort((a, b) => a.title.localeCompare(b.title, 'de')) }, null, 2) + '\n', encoding: 'utf-8' });
  const post = (path, body, method = 'POST') => github.request(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const blobs = await Promise.all(files.map(file => post('/git/blobs', { content: file.content, encoding: file.encoding })));
  const tree = await post('/git/trees', { base_tree: commit.tree.sha, tree: files.map((file, index) => ({ path: file.path, mode: '100644', type: 'blob', sha: blobs[index].sha })) });
  const created = await post('/git/commits', { message: `${records.length} Dokument(e) aus der Werkstatt veröffentlichen`, tree: tree.sha, parents: [head] });
  await post(`/git/refs/heads/${encodeURIComponent(config.branch)}`, { sha: created.sha, force: false }, 'PATCH');
  return { records: prepared.map(record => record.saved), commitSha: created.sha, commitUrl: `https://github.com/${config.repository}/commit/${created.sha}` };
}

export async function handler(event) {
  try {
    if (!['GET', 'POST'].includes(event.httpMethod)) return json(405, { message: 'Diese Methode wird nicht unterstützt.' });
    const config = repositoryConfig();
    if (event.httpMethod === 'GET') {
      const id = event.queryStringParameters?.id;
      if (!id) return json(200, { repository: config.repository, branch: config.branch, configured: Boolean(config.token && config.publishKey) });
      if (!ID_PATTERN.test(id)) return json(400, { message: 'Ungültige Dokument-ID.' });
      if (!config.token) return json(503, { message: 'Der GitHub-Dienst ist noch nicht konfiguriert.' });
      const result = decodeContent(await createGitHubClient(config).readContent(`${ROOT}/data/${id}.json`, config.branch), null);
      return result ? json(200, result) : json(404, { message: 'Dieses Dokument wurde noch nicht veröffentlicht.' });
    }
    if (!config.publishKey || !secureEqual(bearerToken(event.headers), config.publishKey)) return json(401, { message: 'Der Veröffentlichungsschlüssel fehlt oder ist ungültig.' });
    const body = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '';
    if (Buffer.byteLength(body, 'utf8') > MAX_BATCH_BYTES) return json(413, { message: 'Das Paket ist größer als 4 MB. Bitte weniger Dokumente vormerken.' });
    return json(200, await publish(parseRecords(body), config));
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : [409, 422].includes(error.status) ? 409 : error.status === 400 ? 400 : 500;
    return json(status, { code: status === 409 ? 'revision-conflict' : 'publish-failed', message: status === 409 && error.status === 422 ? 'Der GitHub-Branch wurde während des Uploads verändert. Die Sammlung bleibt vorgemerkt. Bitte erneut versuchen.' : error.message });
  }
}

export const __testables = { documentFiles, decodeContent, validateAsset };
