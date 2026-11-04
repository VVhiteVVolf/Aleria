import { assertServerModuleStoreSnapshot } from './module-store-online-source.js';
import { getFirebaseModuleStoreRevision, parseModuleStoreRevision } from './module-store-revision.js';

function configurationKey(data) {
  const revision = getFirebaseModuleStoreRevision(data);
  if (!revision) return null;
  const ordered = value => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])])) : value;
  const timestamp = data.moduleStoreUpdatedAt;
  const serverRevision = Number.isFinite(timestamp?.seconds) && Number.isFinite(timestamp?.nanoseconds)
    ? [timestamp.seconds, timestamp.nanoseconds] : parseModuleStoreRevision(timestamp);
  return JSON.stringify({ revision, serverRevision, manifest: ordered(data.moduleStoreManifest) });
}

// A fresh server configuration remains the authority. Its matching split read
// is shared with the first live snapshot and concurrent readers, never with a
// local/pending configuration. Only one configuration is retained in memory.
export function createServerModuleStoreLoader({ loadSplit }) {
  let current = null;
  return async function load(snapshot) {
    assertServerModuleStoreSnapshot(snapshot);
    if (!snapshot.exists()) { current = null; return null; }
    const data = snapshot.data();
    if (data?.moduleStoreManifest?.format !== 'split-v1') {
      current = null;
      return typeof data?.moduleStoreData === 'string' ? { data: data.moduleStoreData } : data?.moduleStore || null;
    }
    const key = configurationKey(data);
    if (key && current?.key === key) return current.promise;
    const read = { key, promise: null };
    read.promise = Promise.resolve().then(() => loadSplit(data, { serverOnly: true })).catch(error => {
      if (current === read) current = null;
      throw error;
    });
    current = key ? read : null;
    return read.promise;
  };
}
