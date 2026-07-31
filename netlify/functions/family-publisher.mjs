import { timingSafeEqual } from 'node:crypto';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { assertMirroredCrossFamilyBatch } from '../../Stammbäume/assets/js/modules/family-sync/cross-family-sync-invariant.js';

const API_VERSION = '2026-03-10';
const DATA_ROOT = 'Stammbäume/assets/data/published-families';
const REGISTRY_PATH = `${DATA_ROOT}/registry.json`;
const MAX_RECORDS_PER_COMMIT = 24;
const MAX_REQUEST_BYTES = 5 * 1024 * 1024;
const DATA_IMAGE = /^data:image\/(png|jpeg|webp);base64,([a-z0-9+/=\s]+)$/i;
const IMAGE_EXTENSIONS = Object.freeze({ png: 'png', jpeg: 'jpg', webp: 'webp' });

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
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
    publishKey: String(process.env.ALERIA_GITHUB_PUBLISH_KEY || '')
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
        'User-Agent': 'Aleria-Family-Publisher',
        ...(options.headers || {})
      }
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
    readContent: (path, ref) => request(`/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`, {}, true)
  });
}

function decodeContent(record, fallback) {
  if (!record?.content) return fallback;
  try {
    return JSON.parse(Buffer.from(record.content.replace(/\s/g, ''), 'base64').toString('utf8'));
  } catch {
    throw new Error('Eine bestehende GitHub-Familienakte enthält ungültiges JSON.');
  }
}

function folderPath(family) {
  const profile = family.document.houseProfile || {};
  return [profile.kingdom, profile.county, profile.barony, profile.seat].map(String).filter(Boolean);
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

function materializeStagedImages(record) {
  const family = JSON.parse(JSON.stringify(record.family));
  const revision = record.expectedRevision + 1;
  const files = [];
  const pathsByDataUrl = new Map();
  const replace = (owner, field, assetId) => {
    const value = String(owner?.[field] || '');
    const match = value.match(DATA_IMAGE);
    if (!match) return;
    if (pathsByDataUrl.has(value)) {
      owner[field] = pathsByDataUrl.get(value);
      return;
    }
    const type = match[1].toLocaleLowerCase('en');
    const base64 = match[2].replace(/\s/g, '');
    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length || buffer.length > 1024 * 1024 || !hasValidImageSignature(buffer, type)) {
      throw new Error(`Das lokal vorgemerkte Bild „${assetId}“ ist ungültig oder größer als 1 MB.`);
    }
    const filename = `${safeAssetSegment(assetId)}-r${revision}.${IMAGE_EXTENSIONS[type]}`;
    const relativePath = `assets/images/published/${family.document.id}/${filename}`;
    pathsByDataUrl.set(value, relativePath);
    owner[field] = relativePath;
    files.push({
      path: `Stammbäume/${relativePath}`,
      content: base64,
      encoding: 'base64'
    });
  };
  replace(family.document, 'emblem', 'document-emblem');
  family.houses.forEach(house => replace(house, 'emblem', `house-${house.id}`));
  family.persons.forEach(person => replace(person, 'portrait', `person-${person.id}`));
  family.cadetBranches.forEach(branch => replace(branch, 'emblem', `branch-${branch.id}`));
  return Object.freeze({
    family: assertValidFamily(family).family,
    expectedRevision: record.expectedRevision,
    assetFiles: Object.freeze(files)
  });
}

function registryEntry(family, revision, updatedAt) {
  const primaryHouse = family.houses.find(house => house.id === family.lineage.houseId) || family.houses[0];
  return {
    id: family.document.id,
    familyId: family.document.id,
    title: family.document.title,
    motto: family.document.motto || '',
    emblem: family.document.emblem || primaryHouse?.emblem || '',
    folderPath: folderPath(family),
    houseProfile: family.document.houseProfile || {},
    personCount: family.persons.length,
    revision,
    updatedAt,
    link: `Stammbaum.html?family=${encodeURIComponent(family.document.id)}&mode=view`,
    source: 'github'
  };
}

function familyEnvelope(record, updatedAt = record.updatedAt) {
  return {
    schemaVersion: 1,
    familyId: record.family.document.id,
    revision: record.revision,
    updatedAt,
    family: record.family
  };
}

function revisionBackupPath(record, updatedAt = record.updatedAt) {
  const revision = String(record.revision).padStart(8, '0');
  const timestamp = String(updatedAt || '').replace(/[^0-9A-Z]/gi, '');
  return `${DATA_ROOT}/backups/${record.family.document.id}/r${revision}-${timestamp}.json`;
}

function createPublicationFiles({ preparedRecords, saved, registry, updatedAt }) {
  const familyFiles = saved.flatMap(record => {
    const content = JSON.stringify(familyEnvelope(record, updatedAt), null, 2) + '\n';
    return [
      {
        path: `${DATA_ROOT}/${record.family.document.id}.json`,
        content,
        encoding: 'utf-8'
      },
      {
        path: revisionBackupPath(record, updatedAt),
        content,
        encoding: 'utf-8'
      }
    ];
  });
  return [
    ...preparedRecords.flatMap(record => record.assetFiles),
    ...familyFiles,
    { path: REGISTRY_PATH, content: JSON.stringify(registry, null, 2) + '\n', encoding: 'utf-8' }
  ];
}

function parseRecords(body) {
  const parsed = JSON.parse(body || '{}');
  if (!Array.isArray(parsed.records) || !parsed.records.length) {
    throw new Error('Es wurde keine Familienakte zum Speichern übergeben.');
  }
  if (parsed.records.length > MAX_RECORDS_PER_COMMIT) {
    throw new Error(`Höchstens ${MAX_RECORDS_PER_COMMIT} verknüpfte Familien können gemeinsam gespeichert werden.`);
  }
  const records = parsed.records.map(record => ({
    family: assertValidFamily(record.family).family,
    expectedRevision: Math.max(0, Number(record.expectedRevision || 0))
  }));
  const ids = records.map(record => record.family.document.id);
  if (new Set(ids).size !== ids.length) throw new Error('Eine Familienakte wurde im GitHub-Paket doppelt übergeben.');
  assertMirroredCrossFamilyBatch(records);
  return records;
}

async function publish(records, config, fetchRef = fetch) {
  if (!config.token) throw new Error('ALERIA_GITHUB_TOKEN ist in Netlify noch nicht gesetzt.');
  const github = createGitHubClient(config, fetchRef);
  const reference = await github.request(`/git/ref/heads/${encodeURIComponent(config.branch)}`);
  const headSha = reference.object.sha;
  const headCommit = await github.request(`/git/commits/${encodeURIComponent(headSha)}`);
  const registryFile = await github.readContent(REGISTRY_PATH, headSha);
  const currentRegistry = decodeContent(registryFile, { schemaVersion: 1, families: [] });

  const preparedRecords = records.map(materializeStagedImages);
  assertMirroredCrossFamilyBatch(preparedRecords);
  const currentEnvelopes = await Promise.all(preparedRecords.map(async record => {
    const path = `${DATA_ROOT}/${record.family.document.id}.json`;
    const current = await github.readContent(path, headSha);
    return [record.family.document.id, decodeContent(current, null)];
  }));
  const currentById = new Map(currentEnvelopes);
  for (const record of preparedRecords) {
    const actualRevision = Math.max(0, Number(currentById.get(record.family.document.id)?.revision || 0));
    if (actualRevision !== record.expectedRevision) {
      return {
        conflict: {
          familyId: record.family.document.id,
          expectedRevision: record.expectedRevision,
          actualRevision
        }
      };
    }
  }

  const updatedAt = new Date().toISOString();
  const saved = preparedRecords.map(record => ({
    family: record.family,
    revision: record.expectedRevision + 1,
    updatedAt
  }));
  const registryById = new Map((currentRegistry.families || []).map(entry => [String(entry.familyId || entry.id), entry]));
  saved.forEach(record => registryById.set(
    record.family.document.id,
    registryEntry(record.family, record.revision, updatedAt)
  ));
  const registry = {
    schemaVersion: 1,
    families: [...registryById.values()].sort((first, second) => String(first.title).localeCompare(String(second.title), 'de'))
  };
  const files = createPublicationFiles({ preparedRecords, saved, registry, updatedAt });
  const blobs = await Promise.all(files.map(file => github.request('/git/blobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: file.content, encoding: file.encoding })
  })));
  const tree = await github.request('/git/trees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base_tree: headCommit.tree.sha,
      tree: files.map((file, index) => ({ path: file.path, mode: '100644', type: 'blob', sha: blobs[index].sha }))
    })
  });
  const commit = await github.request('/git/commits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: saved.length === 1
        ? `Stammbaum online speichern: ${saved[0].family.document.title}`
        : `${saved.length} verknüpfte Stammbäume online speichern`,
      tree: tree.sha,
      parents: [headSha]
    })
  });
  await github.request(`/git/refs/heads/${encodeURIComponent(config.branch)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha: commit.sha, force: false })
  });
  return { saved, commitSha: commit.sha };
}

async function loadPublishedFamily(familyId, config, fetchRef = fetch) {
  if (!config.token) throw new Error('ALERIA_GITHUB_TOKEN ist in Netlify noch nicht gesetzt.');
  if (!/^[a-z0-9-]{2,120}$/.test(familyId)) throw new Error('Die Familien-ID ist ungültig.');
  const github = createGitHubClient(config, fetchRef);
  const current = await github.readContent(`${DATA_ROOT}/${familyId}.json`, config.branch);
  return decodeContent(current, null);
}

export async function handler(event) {
  try {
    const config = repositoryConfig();
    if (!config.publishKey || !secureEqual(bearerToken(event.headers), config.publishKey)) {
      return json(401, { code: 'unauthorized', message: 'Der Veröffentlichungsschlüssel ist nicht korrekt.' });
    }
    if (event.httpMethod === 'GET') {
      const familyId = String(event.queryStringParameters?.familyId || '').trim();
      if (familyId) {
        const envelope = await loadPublishedFamily(familyId, config);
        return envelope
          ? json(200, envelope)
          : json(404, { code: 'not-found', message: 'Die Familienakte ist auf GitHub noch nicht vorhanden.' });
      }
      return json(200, { repository: config.repository, branch: config.branch });
    }
    if (event.httpMethod !== 'POST') return json(405, { message: 'Diese Methode wird nicht unterstützt.' });
    if (Buffer.byteLength(event.body || '', 'utf8') > MAX_REQUEST_BYTES) {
      return json(413, { message: 'Das Speicherpaket ist zu groß. Bilder bitte als HTTPS-Adresse einbinden.' });
    }
    const records = parseRecords(event.body);
    const result = await publish(records, config);
    if (result.conflict) {
      return json(409, { code: 'revision-conflict', ...result.conflict, message: 'Die GitHub-Fassung ist inzwischen neuer.' });
    }
    return json(200, {
      records: result.saved,
      commitSha: result.commitSha,
      commitUrl: `https://github.com/${config.repository}/commit/${result.commitSha}`
    });
  } catch (error) {
    const statusCode = error instanceof SyntaxError ? 400 : error.status === 422 ? 409 : 500;
    return json(statusCode, {
      code: statusCode === 409 ? 'github-conflict' : 'publish-failed',
      message: statusCode === 409
        ? 'Der Master-Branch wurde während des Speicherns verändert. Bitte erneut speichern.'
        : error.message || 'Die Familienakte konnte nicht nach GitHub gespeichert werden.'
    });
  }
}

export const __testables = Object.freeze({
  decodeContent,
  folderPath,
  registryEntry,
  familyEnvelope,
  revisionBackupPath,
  createPublicationFiles,
  materializeStagedImages,
  secureEqual,
  parseRecords,
  publish,
  loadPublishedFamily
});
