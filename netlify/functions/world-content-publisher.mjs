import { timingSafeEqual } from 'node:crypto';

const API_VERSION = '2026-03-10';
const MAX_REQUEST_BYTES = 5 * 1024 * 1024;
const SCOPES = Object.freeze({
  anzeigetafeln: Object.freeze({ root: 'Anzeigetafeln', validate: validateBoardState }),
  kontinente: Object.freeze({ root: 'Kontinente', validate: validateDocumentState }),
  haeuser: Object.freeze({ root: 'Familien Häuser und Clans', validate: validateDocumentState }),
  orte: Object.freeze({ root: 'Orte', validate: validateDocumentState }),
});

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
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

function assertRelativeDataPath(value) {
  const path = String(value || '').trim();
  if (!path || path.startsWith('/') || path.includes('..') || path.includes('\\') || !path.endsWith('/data.json')) {
    throw new Error('Ungültiger Datenpfad. Erwartet wird ein relativer Pfad auf data.json.');
  }
  if (path.split('/').some(segment => !segment || segment === '.')) throw new Error('Ungültiger Datenpfad.');
  return path;
}

function validateDocumentState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw new Error('Der Dokumentzustand muss ein Objekt sein.');
  return state;
}

function validateBoardState(state) {
  validateDocumentState(state);
  for (const field of ['pins', 'zettel', 'cats']) {
    if (!Array.isArray(state[field])) throw new Error(`Der Tafelzustand benötigt ein ${field}-Array.`);
  }
  return state;
}

function decodeContent(record, fallback) {
  if (!record?.content) return fallback;
  try {
    return JSON.parse(Buffer.from(record.content.replace(/\s/g, ''), 'base64').toString('utf8'));
  } catch {
    throw new Error('Die bestehende GitHub-Datei enthält ungültiges JSON.');
  }
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
        'User-Agent': 'Aleria-World-Content-Publisher',
        ...(options.headers || {}),
      },
    });
    if (allowMissing && response.status === 404) return null;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.message || `GitHub antwortete mit HTTP ${response.status}.`);
      error.status = response.status;
      throw error;
    }
    return payload;
  }
  return Object.freeze({
    request,
    readContent: (path, ref) => request(`/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`, {}, true),
  });
}

async function publish({ scopeName, dataPath, state, expectedRevision }, config, fetchRef = fetch) {
  const scope = SCOPES[scopeName];
  if (!scope) throw new Error('Unbekannter Veröffentlichungsbereich.');
  if (!config.token) throw new Error('ALERIA_GITHUB_TOKEN ist in Netlify noch nicht gesetzt.');
  const relativePath = assertRelativeDataPath(dataPath);
  const validatedState = scope.validate(state);
  const repositoryPath = `${scope.root}/${relativePath}`;
  const github = createGitHubClient(config, fetchRef);
  const current = await github.readContent(repositoryPath, config.branch);
  const currentEnvelope = decodeContent(current, { revision: 0 });
  const actualRevision = Math.max(0, Number(currentEnvelope.revision || 0));
  if (actualRevision !== expectedRevision) return { conflict: { expectedRevision, actualRevision } };

  const envelope = {
    schemaVersion: 1,
    scope: scopeName,
    dataPath: relativePath,
    revision: actualRevision + 1,
    updatedAt: new Date().toISOString(),
    state: validatedState,
  };
  const body = {
    message: `${scope.root} online speichern: ${relativePath}`,
    content: Buffer.from(`${JSON.stringify(envelope, null, 2)}\n`, 'utf8').toString('base64'),
    branch: config.branch,
  };
  if (current?.sha) body.sha = current.sha;
  const saved = await github.request(`/contents/${encodePath(repositoryPath)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ...envelope, commitSha: saved.commit?.sha || '' };
}

export async function handler(event) {
  try {
    const config = repositoryConfig();
    if (!config.publishKey || !secureEqual(bearerToken(event.headers), config.publishKey)) {
      return json(401, { code: 'unauthorized', message: 'Der Veröffentlichungsschlüssel ist nicht korrekt.' });
    }
    if (event.httpMethod === 'GET') return json(200, { repository: config.repository, branch: config.branch });
    if (event.httpMethod !== 'POST') return json(405, { message: 'Diese Methode wird nicht unterstützt.' });
    if (Buffer.byteLength(event.body || '', 'utf8') > MAX_REQUEST_BYTES) return json(413, { message: 'Das Speicherpaket ist zu groß.' });
    const body = JSON.parse(event.body || '{}');
    const result = await publish({
      scopeName: String(body.scope || ''),
      dataPath: body.dataPath,
      state: body.state,
      expectedRevision: Math.max(0, Number(body.expectedRevision || 0)),
    }, config);
    if (result.conflict) return json(409, { code: 'revision-conflict', ...result.conflict, message: 'Auf GitHub liegt bereits eine neuere Fassung.' });
    return json(200, {
      revision: result.revision,
      updatedAt: result.updatedAt,
      commitSha: result.commitSha,
      commitUrl: `https://github.com/${config.repository}/commit/${result.commitSha}`,
    });
  } catch (error) {
    const statusCode = error instanceof SyntaxError ? 400 : error.status === 409 || error.status === 422 ? 409 : 500;
    return json(statusCode, { code: statusCode === 409 ? 'github-conflict' : 'publish-failed', message: error.message || 'Veröffentlichung fehlgeschlagen.' });
  }
}

export const __testables = Object.freeze({
  SCOPES,
  secureEqual,
  assertRelativeDataPath,
  validateDocumentState,
  validateBoardState,
  decodeContent,
  publish,
});
