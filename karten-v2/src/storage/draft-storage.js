// Per-map local editing drafts. The published data/*.json files cannot be
// overwritten by a static site at runtime (see docs/ARCHITECTURE.md), so
// everything created/edited in the browser editor lives here until the
// author exports it and a maintainer commits the export into data/.
import { readJson, writeJson, storageAvailable } from './storage-service.js';

function draftKey(mapId) {
  return `drafts.${mapId}`;
}

/**
 * @param {string} mapId
 * @returns {{ pointFeatures: object[], regionFeatures: object[], routeFeatures: object[], updatedAt: string|null }}
 */
export function loadDraft(mapId) {
  return readJson(draftKey(mapId), {
    pointFeatures: [],
    regionFeatures: [],
    routeFeatures: [],
    updatedAt: null,
  });
}

export function saveDraft(mapId, draft) {
  return writeJson(draftKey(mapId), { ...draft, updatedAt: new Date().toISOString() });
}

export function clearDraft(mapId) {
  writeJson(draftKey(mapId), { pointFeatures: [], regionFeatures: [], routeFeatures: [], updatedAt: null });
}

export function hasDraftStorage() {
  return storageAvailable;
}

export function loadSettings() {
  return readJson('settings', { editorPasswordless: true });
}

export function saveSettings(settings) {
  writeJson('settings', settings);
}

export function loadLastView() {
  return readJson('lastView', null);
}

export function saveLastView(view) {
  writeJson('lastView', view);
}
