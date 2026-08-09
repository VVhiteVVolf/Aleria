import { FamilyRevisionConflictError } from '../family-sync/family-sync-errors.js';

const REGISTRY_URL = 'assets/data/published-families/registry.json';
const PUBLISH_ENDPOINT = '/.netlify/functions/family-publisher';

function familyUrl(familyId) {
  return `assets/data/published-families/${encodeURIComponent(familyId)}.json`;
}

async function readJson(response, fallbackMessage) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Die aussagekräftige HTTP-Meldung wird unten erzeugt.
  }
  if (!response.ok) {
    const error = new Error(payload?.message || fallbackMessage);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function repositoryRecord(envelope) {
  if (!envelope?.family?.document?.id) return null;
  return Object.freeze({
    family: envelope.family,
    revision: Math.max(0, Number(envelope.revision || 0)),
    updatedAt: String(envelope.updatedAt || ''),
    updatedBy: 'github'
  });
}

export function createGitHubFamilyRepository({
  fetchRef = globalThis.fetch?.bind(globalThis),
  endpoint = PUBLISH_ENDPOINT,
  registryUrl = REGISTRY_URL
} = {}) {
  async function fetchJson(url, options = {}) {
    if (!fetchRef) throw new Error('Die GitHub-Registry ist in dieser Umgebung nicht erreichbar.');
    const response = await fetchRef(url, { cache: 'no-store', ...options });
    return readJson(response, 'Die GitHub-Registry konnte nicht geladen werden.');
  }

  async function loadDraft(familyId) {
    if (!fetchRef) return null;
    const response = await fetchRef(`${endpoint}?familyId=${encodeURIComponent(familyId)}`, { cache: 'no-store' });
    if (response.status === 404) return null;
    return repositoryRecord(await readJson(response, 'Die GitHub-Familienakte konnte nicht geladen werden.'));
  }

  async function saveDraftBatch(records, { skipDeploy = true } = {}) {
    const payload = await fetchJson(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        skipDeploy: skipDeploy !== false,
        records: records.map(record => ({
          family: record.family,
          expectedRevision: Math.max(0, Number(record.expectedRevision || 0))
        }))
      })
    }).catch(error => {
      if (error.status === 409 && error.payload?.code === 'revision-conflict') {
        throw new FamilyRevisionConflictError(
          Number(error.payload.expectedRevision || 0),
          Number(error.payload.actualRevision || 0),
          String(error.payload.familyId || '')
        );
      }
      throw error;
    });
    return Object.freeze((payload.records || []).map(record => Object.freeze({
      family: record.family,
      revision: Number(record.revision || 0),
      commitSha: String(payload.commitSha || ''),
      deploySkipped: payload.deploySkipped === true
    })));
  }

  async function saveDraft(record, options) {
    const [saved] = await saveDraftBatch([record], options);
    return saved;
  }

  async function loadPublished(familyId) {
    if (!fetchRef) return null;
    const response = await fetchRef(familyUrl(familyId), { cache: 'no-store' });
    if (response.status === 404) return null;
    return repositoryRecord(await readJson(response, 'Die veröffentlichte Familienakte konnte nicht geladen werden.'));
  }

  async function listPublishedRegistry() {
    if (!fetchRef) return [];
    const response = await fetchRef(registryUrl, { cache: 'no-store' });
    if (response.status === 404) return [];
    const payload = await readJson(response, 'Das veröffentlichte Familienregister konnte nicht geladen werden.');
    return (payload.families || []).map(record => Object.freeze({ ...record, source: 'github' }));
  }

  return Object.freeze({
    kind: 'github',
    loadDraft,
    saveDraft,
    saveDraftBatch,
    loadPublished,
    listPublishedRegistry,
    watchDraftMetadata: async () => () => {}
  });
}
