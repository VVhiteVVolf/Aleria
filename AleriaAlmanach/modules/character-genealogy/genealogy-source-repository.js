import {
  FAMILY_REGISTRY,
  RETIRED_FAMILY_IDS
} from '../../../Stammbäume/assets/js/data/families.registry.js';

const FIREBASE_READY_TIMEOUT_MS = 3500;

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

export async function listGenealogyFamilies() {
  const local = FAMILY_REGISTRY.map(localFamilyRecord);
  const gateway = await waitForFirebaseGateway();
  if (!gateway?.listPublishedFamilyRegistry) return local;
  try {
    const cloud = await gateway.listPublishedFamilyRegistry();
    return mergeRegistryRecords(local, Array.isArray(cloud) ? cloud : [])
      .filter(record => !RETIRED_FAMILY_IDS.includes(record.id));
  } catch (error) {
    console.info('Veröffentlichte Stammbaum-Registry ist derzeit nicht erreichbar.', error);
    return local;
  }
}

export async function loadGenealogyFamily(registryRecord) {
  if (!registryRecord?.id) throw new Error('Die ausgewählte Familie besitzt keine gültige ID.');
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
      console.info(`Veröffentlichter Stammbaum ${registryRecord.id} ist derzeit nicht erreichbar.`, error);
    }
  }
  if (!registryRecord.family) throw new Error('Für diese Familie ist noch keine lesbare Fassung verfügbar.');
  return { ...registryRecord, source: 'project' };
}
