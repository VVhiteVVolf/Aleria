import {
  FAMILY_REGISTRY,
  RETIRED_FAMILY_IDS
} from '../../../Stammbäume/assets/js/data/families.registry.js';

const FIREBASE_READY_TIMEOUT_MS = 3500;
const PUBLISHED_FAMILY_ROOT_URL = new URL(
  /* @vite-ignore */
  '../../../Stammb%C3%A4ume/assets/data/published-families/',
  import.meta.url
);

async function loadCheckedInPublishedFamily(familyId) {
  if (typeof globalThis.fetch !== 'function') return null;
  try {
    const response = await globalThis.fetch(
      new URL(`${encodeURIComponent(familyId)}.json`, PUBLISHED_FAMILY_ROOT_URL),
      { cache: 'no-store' }
    );
    if (!response.ok) return null;
    const envelope = await response.json();
    if (envelope?.family?.document?.id !== familyId) return null;
    return {
      family: envelope.family,
      releaseId: envelope.revision ? `github-r${envelope.revision}` : '',
      publishedAt: String(envelope.updatedAt || ''),
      source: 'github'
    };
  } catch {
    return null;
  }
}

function waitForFirebaseGateway() {
  if (window._fbReady) return Promise.resolve(window._fb || null);
  return new Promise(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener('fb-ready', finish);
      resolve(window._fb || null);
    };
    window.addEventListener('fb-ready', finish, { once: true });
    window.setTimeout(finish, FIREBASE_READY_TIMEOUT_MS);
  });
}

function localFamilyRecord(record) {
  return {
    id: record.id,
    title: record.title,
    folderPath: [...(record.folderPath || [])],
    family: record.family,
    releaseId: '',
    publishedAt: '',
    source: 'project'
  };
}

function mergeRegistryRecords(localRecords, cloudRecords) {
  const byId = new Map(localRecords.map(record => [record.id, record]));
  cloudRecords.forEach(record => {
    const local = byId.get(record.id);
    byId.set(record.id, {
      ...local,
      ...record,
      folderPath: Array.isArray(record.folderPath) && record.folderPath.length
        ? record.folderPath
        : local?.folderPath || [],
      family: local?.family || null,
      source: 'firebase'
    });
  });
  return [...byId.values()].sort((first, second) => {
    const firstPath = [...(first.folderPath || []), first.title || first.id].join(' > ');
    const secondPath = [...(second.folderPath || []), second.title || second.id].join(' > ');
    return firstPath.localeCompare(secondPath, 'de', { sensitivity: 'base' });
  });
}

// Die Projektfassungen sind statisch eingebunden und stehen sofort bereit;
// veröffentlichte Fassungen werden separat im Hintergrund nachgeladen.
export function listGenealogyFamilies() {
  return FAMILY_REGISTRY
    .filter(record => !RETIRED_FAMILY_IDS.includes(record.id))
    .map(localFamilyRecord);
}

export async function refreshGenealogyRegistry(localRecords) {
  const gateway = await waitForFirebaseGateway();
  if (!gateway?.listPublishedFamilyRegistry) return null;
  try {
    const cloud = await gateway.listPublishedFamilyRegistry();
    if (!Array.isArray(cloud) || !cloud.length) return null;
    return mergeRegistryRecords(localRecords, cloud)
      .filter(record => !RETIRED_FAMILY_IDS.includes(record.id));
  } catch (error) {
    console.info('Veröffentlichte Stammbaum-Registry ist derzeit nicht erreichbar.', error);
    return null;
  }
}

export function loadGenealogyFamily(registryRecord) {
  if (!registryRecord?.id) throw new Error('Die ausgewählte Familie besitzt keine gültige ID.');
  if (!registryRecord.family) throw new Error('Für diese Familie ist noch keine lesbare Fassung verfügbar.');
  return { ...registryRecord, source: registryRecord.source || 'project' };
}

export async function loadPublishedGenealogyFamily(registryRecord) {
  if (!registryRecord?.id) return null;
  const gateway = await waitForFirebaseGateway();
  if (gateway?.loadPublishedFamily) {
    try {
      const published = await gateway.loadPublishedFamily(registryRecord.id);
      if (published?.family) {
        return {
          ...registryRecord,
          ...published,
          folderPath: registryRecord.folderPath || [],
          source: 'firebase'
        };
      }
    } catch (error) {
      console.info(`Veröffentlichter Stammbaum ${registryRecord.id} ist derzeit nicht über Firebase erreichbar.`, error);
    }
  }
  const checkedIn = await loadCheckedInPublishedFamily(registryRecord.id);
  return checkedIn ? {
    ...registryRecord,
    ...checkedIn,
    folderPath: registryRecord.folderPath || []
  } : null;
}
