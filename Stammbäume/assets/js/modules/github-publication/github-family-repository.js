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
  let sessionKey = '';

  async function fetchJson(url, options = {}) {
    if (!fetchRef) throw new Error('Die GitHub-Registry ist in dieser Umgebung nicht erreichbar.');
    const response = await fetchRef(url, { cache: 'no-store', ...options });
    return readJson(response, 'Die GitHub-Registry konnte nicht geladen werden.');
  }

  async function authenticate(key) {
    const candidate = String(key || '').trim();
    if (!candidate) throw new Error('Bitte den Veröffentlichungsschlüssel eingeben.');
    const payload = await fetchJson(endpoint, {
      method: 'GET',
      headers: { Authorization: `Bearer ${candidate}` }
    });
    sessionKey = candidate;
    return Object.freeze({
      repository: String(payload.repository || ''),
      branch: String(payload.branch || 'master')
    });
  }

  async function loadDraft(familyId) {
    if (!fetchRef) return null;
    if (sessionKey) {
      const url = `${endpoint}?familyId=${encodeURIComponent(familyId)}`;
      const response = await fetchRef(url, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${sessionKey}` }
      });
      if (response.status === 404) return null;
      return repositoryRecord(await readJson(response, 'Die GitHub-Familienakte konnte nicht geladen werden.'));
    }
    const response = await fetchRef(familyUrl(familyId), { cache: 'no-store' });
    if (response.status === 404) return null;
    return repositoryRecord(await readJson(response, 'Die veröffentlichte Familienakte konnte nicht geladen werden.'));
  }

  async function saveDraftBatch(records) {
    if (!sessionKey) throw new Error('Zum GitHub-Speichern ist eine Anmeldung erforderlich.');
    const payload = await fetchJson(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
      commitSha: String(payload.commitSha || '')
    })));
  }

  async function saveDraft(record) {
    const [saved] = await saveDraftBatch([record]);
    return saved;
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
    authenticate,
    clearSession: () => { sessionKey = ''; },
    hasSession: () => Boolean(sessionKey),
    loadDraft,
    saveDraft,
    saveDraftBatch,
    loadPublished: loadDraft,
    listPublishedRegistry,
    watchDraftMetadata: async () => () => {}
  });
}
