import { DOCUMENT_ROOT, ID_PATTERN, MAX_BATCH_BYTES, validateRecord } from '../document-schema.js';
const ENDPOINT = '/.netlify/functions/document-publisher';

async function jsonResponse(response) {
  const result = await response.json().catch(() => null);
  if (!result) throw new Error('Der GitHub-Dienst ist hier nicht erreichbar. Lokal sammeln und exportieren ist weiterhin möglich.');
  if (!response.ok) throw new Error(result.message || `Speichern fehlgeschlagen (${response.status}).`);
  return result;
}

export async function loadRegistry() {
  const response = await fetch(`${DOCUMENT_ROOT}/registry.json`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Das Dokumentenregister konnte nicht geladen werden.');
  const registry = await response.json();
  if (!Array.isArray(registry.documents)) throw new Error('Ungültiges Dokumentenregister.');
  return registry.documents;
}

export async function loadPublishedDocument(id, { latest = false } = {}) {
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) throw new Error('Ungültige Dokument-ID.');
  const url = latest ? `${ENDPOINT}?id=${encodeURIComponent(id)}` : `${DOCUMENT_ROOT}/data/${id}.json`;
  const response = await fetch(url, { cache: 'no-store' });
  const envelope = await jsonResponse(response);
  if (envelope.id !== id || !Number.isSafeInteger(envelope.revision) || envelope.revision < 1 || !envelope.document) throw new Error('Ungültige veröffentlichte Fassung.');
  return envelope;
}

export async function publishDocuments(records, key) {
  if (!key.trim()) throw new Error('Bitte den Veröffentlichungsschlüssel eingeben.');
  if (!records.length || records.length > 24) throw new Error('Bitte 1 bis 24 Dokumente für diesen Upload vormerken.');
  const body = JSON.stringify({ records: records.map(record => validateRecord({ id: record.id, expectedRevision: record.revision, document: record.document })) });
  if (new TextEncoder().encode(body).length > MAX_BATCH_BYTES) throw new Error('Das Paket ist größer als 4 MB. Bitte weniger Dokumente vormerken oder große Bilder verkleinern.');
  return jsonResponse(await fetch(ENDPOINT, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key.trim()}` }, body
  }));
}
