// Thin, versioned localStorage wrapper. All keys are namespaced under
// "aleria.maps.v2.*" so this module can never collide with the legacy
// Karten module (which uses Firebase, not localStorage) or other Aleria
// sub-projects sharing the same origin.
const NAMESPACE = 'aleria.maps.v2';

function key(name) {
  return `${NAMESPACE}.${name}`;
}

function isStorageAvailable() {
  try {
    const testKey = key('__probe__');
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const storageAvailable = typeof window !== 'undefined' && isStorageAvailable();

export function readJson(name, fallback = null) {
  if (!storageAvailable) return fallback;
  try {
    const raw = window.localStorage.getItem(key(name));
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage-service] Konnte "${name}" nicht lesen:`, error);
    return fallback;
  }
}

export function writeJson(name, value) {
  if (!storageAvailable) return false;
  try {
    window.localStorage.setItem(key(name), JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage-service] Konnte "${name}" nicht speichern:`, error);
    return false;
  }
}

export function remove(name) {
  if (!storageAvailable) return;
  window.localStorage.removeItem(key(name));
}
