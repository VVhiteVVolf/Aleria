// Preserve local-only characters without downloading the 10 MB full snapshot.
// The existing registry owns identities and paths; no parallel generated index.
import { CHARACTER_DIRECTORY_FIELDS } from './character-directory-firebase.mjs';

const root = new URL('../../../CharakterDatenbank/', import.meta.url);
const worldId = record => record?.identity?.worldPersonId || record?.genealogy?.worldPersonId || '';

export function projectLocalDirectoryRecord(record) {
  const summary = { id: record.id, _directorySummary: true };
  for (const path of CHARACTER_DIRECTORY_FIELDS) {
    const parts = path.split('.');
    let value = record;
    for (const part of parts) value = value?.[part];
    if (value === undefined) continue;
    let target = summary;
    for (const part of parts.slice(0, -1)) target = target[part] ||= {};
    target[parts.at(-1)] = structuredClone(value);
  }
  return summary;
}

export function createLocalCharacterDirectory({ fetch: read = globalThis.fetch } = {}) {
  const full = new Map();
  const entriesById = new Map();
  async function readJson(url) {
    const response = await read(url, { method: 'GET', cache: 'no-cache' });
    if (!response.ok) throw new Error('Der lokale Figurenbestand konnte nicht vollständig abgeglichen werden.');
    return response.json();
  }
  async function loadEntry(entry) {
    const id = String(entry.firestoreDocumentId || '');
    if (full.has(id)) return full.get(id);
    if (!/^records\/(?:[a-zA-Z0-9_ -]+\/)*character\.json$/.test(entry.path || '')) throw new Error('Die lokale Figurenakte besitzt keinen gültigen Quellpfad.');
    const payload = await readJson(new URL(entry.path, root));
    if (payload.schema !== 'aleria.character-record' || !payload.character || payload.recordId !== entry.recordId) throw new Error('Die lokale Figurenakte stimmt nicht mit dem Index überein.');
    const recordId = id || String(payload.character.id || '');
    if (!recordId) throw new Error('Eine lokale Figur besitzt keine stabile Kennung.');
    const record = { ...payload.character, id: recordId, localRecord: { ...(payload.character.localRecord || {}),
      recordId: entry.recordId, path: entry.path, schemaVersion: payload.schemaVersion, contentHash: entry.contentHash,
      classification: payload.classification, firestoreDocumentIds: [...new Set(entry.firestoreDocumentIds || [])] } };
    full.set(recordId, record);
    return record;
  }
  async function loadMissing(online, onRecord = () => {}) {
    const registry = await readJson(new URL('registry.json', root));
    if (registry.schema !== 'aleria.character-registry' || !Array.isArray(registry.records)) throw new Error('Der lokale Figurenindex ist nicht lesbar.');
    const onlineIds = new Set(online.map(record => String(record.id)));
    const onlinePeople = new Set(online.map(worldId).filter(Boolean));
    const byId = new Map(online.map(record => [String(record.id), record]));
    const byPerson = new Map(online.filter(worldId).map(record => [worldId(record), record]));
    for (const entry of registry.records) {
      for (const id of [entry.firestoreDocumentId, ...(entry.firestoreDocumentIds || []), entry.worldPersonId].filter(Boolean)) {
        entriesById.set(String(id), entry);
      }
      const matches = [...new Set([entry.firestoreDocumentId, ...(entry.firestoreDocumentIds || [])].map(id => byId.get(String(id))).filter(Boolean))];
      if (!matches.length && entry.worldPersonId && byPerson.has(entry.worldPersonId)) matches.push(byPerson.get(entry.worldPersonId));
      for (const record of matches) {
        entriesById.set(String(record.id), entry);
        onRecord({ ...record,
          identity: { ...record.identity, worldPersonId: worldId(record) || entry.worldPersonId || '' },
          genealogy: { ...record.genealogy, houseName: record.genealogy?.houseName || (entry.primary?.kind === 'family' ? entry.primary.label : '') },
          aliases: [...new Set([...(Array.isArray(record.aliases) ? record.aliases : []), ...(entry.aliases || [])])],
          localRecord: { ...record.localRecord, firestoreDocumentIds: [...new Set(entry.firestoreDocumentIds || [])] }, _directorySummary: true
        });
      }
    }
    const missing = registry.records.filter(entry => ![entry.firestoreDocumentId, ...(entry.firestoreDocumentIds || [])].some(id => onlineIds.has(String(id)))
      && !(entry.worldPersonId && onlinePeople.has(entry.worldPersonId)));
    for (let offset = 0; offset < missing.length; offset += 4) {
      await Promise.all(missing.slice(offset, offset + 4).map(async entry => {
        const record = await loadEntry(entry);
        onRecord(projectLocalDirectoryRecord(record));
      }));
    }
  }
  async function mergeRecord(online, local) {
    const repository = await import('../../../CharakterDatenbank/assets/js/character-database-client.mjs');
    return repository.mergeOnlineAndLocalCharacter(online, local);
  }
  function loadSnapshot(records) {
    return records.filter(record => record?.id).map(record => {
      full.set(String(record.id), record);
      return projectLocalDirectoryRecord(record);
    });
  }
  return Object.freeze({ loadMissing, loadSnapshot, getFull: id => full.get(String(id)), mergeRecord,
    async loadFull(id) {
      const entry = entriesById.get(String(id));
      return entry ? loadEntry(entry) : full.get(String(id));
    }
  });
}
