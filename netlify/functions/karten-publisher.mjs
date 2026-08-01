// Replaces Firebase Firestore as the write path for Karten/: the browser
// still edits everything locally (see Karten/assets/js/karto-storage.js),
// but "Online speichern" commits the map's data.json straight onto the
// master branch via the GitHub API instead of writing to a database.
//
// Deliberately mirrors netlify/functions/family-publisher.mjs (same repo,
// same env vars, same GitHub blob/tree/commit approach, same
// bearer-publish-key gate) so both features share one Netlify
// configuration - if ALERIA_GITHUB_TOKEN / ALERIA_GITHUB_PUBLISH_KEY are
// already set for the Stammbäume publisher, this works without any new
// Netlify setup.
import { timingSafeEqual } from 'node:crypto';

const API_VERSION = '2026-03-10';
// Netlify/Lambda synchronous functions cap request bodies well under this,
// so this is really about failing fast with a clear message rather than
// timing out - it's NOT meant for full-resolution hand-painted map layer
// images (those are tens of MB; keep using an Imgur/hosted URL for those).
// This path is for icons/markers/small layer thumbnails.
const MAX_REQUEST_BYTES = 6 * 1024 * 1024;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
// dataPath is relative to Karten/ (matches the existing `folder`/`config`/
// `images` path convention in karten.registry.js) - must end in data.json,
// no leading slash, no parent-directory traversal.
const DATA_PATH_PATTERN = /^[^./][^\n]*\/data\.json$/;
const DATA_IMAGE = /^data:image\/(png|jpeg|webp);base64,([a-z0-9+/=\s]+)$/i;
const IMAGE_EXTENSIONS = Object.freeze({ png: 'png', jpeg: 'jpg', webp: 'webp' });

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function secureEqual(first, second) {
  const left = Buffer.from(String(first || ''));
  const right = Buffer.from(String(second || ''));
  return left.length === right.length && timingSafeEqual(left, right);
}

function bearerToken(headers = {}) {
  const value = String(headers.authorization || headers.Authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

function repositoryConfig() {
  const repository = String(process.env.ALERIA_GITHUB_REPOSITORY || 'VVhiteVVolf/Aleria').trim();
  const [owner, repo, ...rest] = repository.split('/');
  if (!owner || !repo || rest.length) throw new Error('ALERIA_GITHUB_REPOSITORY muss als OWNER/REPOSITORY gesetzt sein.');
  return {
    owner,
    repo,
    repository,
    branch: String(process.env.ALERIA_GITHUB_BRANCH || 'master').trim() || 'master',
    token: String(process.env.ALERIA_GITHUB_TOKEN || ''),
    publishKey: String(process.env.ALERIA_GITHUB_PUBLISH_KEY || ''),
  };
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function createGitHubClient(config, fetchRef = fetch) {
  const root = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`;

  async function request(path, options = {}, allowMissing = false) {
    const response = await fetchRef(`${root}${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
        'X-GitHub-Api-Version': API_VERSION,
        'User-Agent': 'Aleria-Karten-Publisher',
        ...(options.headers || {}),
      },
    });
    if (allowMissing && response.status === 404) return null;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.message || `GitHub antwortete mit HTTP ${response.status}.`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  return Object.freeze({
    request,
    readContent: (path, ref) => request(`/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`, {}, true),
  });
}

function decodeContent(record, fallback) {
  if (!record?.content) return fallback;
  try {
    return JSON.parse(Buffer.from(record.content.replace(/\s/g, ''), 'base64').toString('utf8'));
  } catch {
    throw new Error('Eine bestehende Kartendatei enthält ungültiges JSON.');
  }
}

function hasValidImageSignature(buffer, type) {
  if (type === 'png') {
    return buffer.length >= 8
      && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
      && buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a;
  }
  if (type === 'jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === 'webp') {
    return buffer.length >= 12
      && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
      && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  return false;
}

function safeAssetSegment(value) {
  return String(value || 'asset').toLocaleLowerCase('de')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '') || 'asset';
}

// Walks the whole map state looking for data:image/... strings staged by
// the browser (see karto-storage.js's KartoPublish.stageImage) - covers
// pin.pinMarker / category.marker today, and any future image field (e.g.
// a custom layer's image) without needing to know its name in advance.
// Mirrors family-publisher.mjs's materializeStagedImages, but generic
// instead of enumerating fixed fields, since Karten's shape keeps growing
// (layers, marker catalog, ...).
function materializeStagedImages(state, mapId, revision) {
  const clone = JSON.parse(JSON.stringify(state));
  const files = [];
  const pathsByDataUrl = new Map();
  let counter = 0;

  function materialize(dataUrl, fieldHint) {
    if (pathsByDataUrl.has(dataUrl)) return pathsByDataUrl.get(dataUrl);
    const match = dataUrl.match(DATA_IMAGE);
    const type = match[1].toLocaleLowerCase('en');
    const base64 = match[2].replace(/\s/g, '');
    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length || buffer.length > MAX_IMAGE_BYTES || !hasValidImageSignature(buffer, type)) {
      throw new Error(`Ein lokal hochgeladenes Bild ("${fieldHint}") ist ungültig oder größer als 4 MB.`);
    }
    counter += 1;
    const relativePath = `assets/uploads/${mapId}/${safeAssetSegment(fieldHint)}-r${revision}-${counter}.${IMAGE_EXTENSIONS[type]}`;
    pathsByDataUrl.set(dataUrl, relativePath);
    files.push({ path: `Karten/${relativePath}`, content: base64, encoding: 'base64' });
    return relativePath;
  }

  function visit(node) {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (typeof value === 'string' && DATA_IMAGE.test(value)) {
        node[key] = materialize(value, key);
      } else if (value && typeof value === 'object') {
        visit(value);
      }
    }
  }

  visit(clone);
  return { state: clone, files };
}

function validateDataPath(dataPath) {
  const value = String(dataPath || '').trim();
  if (!DATA_PATH_PATTERN.test(value) || value.includes('..') || value.includes('\\')) {
    throw new Error('Ungültiger Datenpfad.');
  }
  return value;
}

// Light-weight shape check, not a full schema validator (see
// docs/KNOWN_LIMITATIONS.md-equivalent note in the accompanying report) -
// rejects obviously malformed payloads without re-implementing every field
// karto-app.js's state object can carry.
function validateState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    throw new Error('Ungültiger Kartenzustand (kein Objekt).');
  }
  if (!Array.isArray(state.pins)) throw new Error('Kartenzustand ohne gültiges pins-Array.');
  if (!Array.isArray(state.cats)) throw new Error('Kartenzustand ohne gültiges cats-Array.');
  for (const pin of state.pins) {
    if (typeof pin?.id !== 'string' || typeof pin?.x !== 'number' || typeof pin?.y !== 'number') {
      throw new Error(`Pin "${pin?.title || pin?.id || '?'}" hat keine gültige id/x/y.`);
    }
  }
  return state;
}

async function publish({ dataPath, state, expectedRevision }, config, fetchRef = fetch) {
  if (!config.token) throw new Error('ALERIA_GITHUB_TOKEN ist in Netlify noch nicht gesetzt.');
  const github = createGitHubClient(config, fetchRef);
  const repoPath = `Karten/${dataPath}`;
  const mapId = dataPath.replace(/\/data\.json$/, '');

  const reference = await github.request(`/git/ref/heads/${encodeURIComponent(config.branch)}`);
  const headSha = reference.object.sha;
  const headCommit = await github.request(`/git/commits/${encodeURIComponent(headSha)}`);
  const current = await github.readContent(repoPath, headSha);
  const currentEnvelope = decodeContent(current, { revision: 0 });
  const actualRevision = Math.max(0, Number(currentEnvelope.revision || 0));

  if (actualRevision !== expectedRevision) {
    return { conflict: { expectedRevision, actualRevision } };
  }

  const revision = actualRevision + 1;
  const { state: materializedState, files: assetFiles } = materializeStagedImages(state, mapId, revision);

  const updatedAt = new Date().toISOString();
  const envelope = {
    schemaVersion: 1,
    dataPath,
    revision,
    updatedAt,
    state: materializedState,
  };
  const content = JSON.stringify(envelope, null, 2) + '\n';

  const files = [
    ...assetFiles,
    { path: repoPath, content, encoding: 'utf-8' },
  ];
  const blobs = await Promise.all(files.map(file => github.request('/git/blobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: file.content, encoding: file.encoding }),
  })));
  const tree = await github.request('/git/trees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base_tree: headCommit.tree.sha,
      tree: files.map((file, index) => ({ path: file.path, mode: '100644', type: 'blob', sha: blobs[index].sha })),
    }),
  });
  const commit = await github.request('/git/commits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Karte online speichern: ${dataPath}`,
      tree: tree.sha,
      parents: [headSha],
    }),
  });
  await github.request(`/git/refs/heads/${encodeURIComponent(config.branch)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  return { revision: envelope.revision, updatedAt, commitSha: commit.sha };
}

export async function handler(event) {
  try {
    const config = repositoryConfig();
    if (!config.publishKey || !secureEqual(bearerToken(event.headers), config.publishKey)) {
      return json(401, { code: 'unauthorized', message: 'Der Veröffentlichungsschlüssel ist nicht korrekt.' });
    }
    if (event.httpMethod === 'GET') {
      return json(200, { repository: config.repository, branch: config.branch });
    }
    if (event.httpMethod !== 'POST') return json(405, { message: 'Diese Methode wird nicht unterstützt.' });
    if (Buffer.byteLength(event.body || '', 'utf8') > MAX_REQUEST_BYTES) {
      return json(413, { message: 'Das Speicherpaket ist zu groß (max. 6 MB). Für sehr große Kartenbilder bitte weiterhin eine HTTPS-Adresse einbinden statt eines lokalen Uploads.' });
    }
    const body = JSON.parse(event.body || '{}');
    const dataPath = validateDataPath(body.dataPath);
    const state = validateState(body.state);
    const expectedRevision = Math.max(0, Number(body.expectedRevision || 0));

    const result = await publish({ dataPath, state, expectedRevision }, config);
    if (result.conflict) {
      return json(409, {
        code: 'revision-conflict',
        ...result.conflict,
        message: 'Auf GitHub liegt bereits eine neuere Fassung dieser Karte.',
      });
    }
    return json(200, {
      revision: result.revision,
      updatedAt: result.updatedAt,
      commitSha: result.commitSha,
      commitUrl: `https://github.com/${config.repository}/commit/${result.commitSha}`,
    });
  } catch (error) {
    const statusCode = error instanceof SyntaxError ? 400 : error.status === 422 ? 409 : 500;
    return json(statusCode, {
      code: statusCode === 409 ? 'github-conflict' : 'publish-failed',
      message:
        statusCode === 409
          ? 'Der Master-Branch wurde während des Speicherns verändert. Bitte erneut speichern.'
          : error.message || 'Die Karte konnte nicht nach GitHub gespeichert werden.',
    });
  }
}

export const __testables = Object.freeze({
  secureEqual,
  validateDataPath,
  validateState,
  decodeContent,
  hasValidImageSignature,
  safeAssetSegment,
  materializeStagedImages,
  publish,
});
