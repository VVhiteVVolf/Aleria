import { validateWeddingId, validateWeddingEnvelope } from './wedding-schema.mjs';

const ENDPOINT = '/.netlify/functions/wedding-publisher';
async function responseJson(response) {
  const result = await response.json().catch(() => null);
  if (!result) throw new Error('Der Veröffentlichungsdienst ist hier nicht erreichbar. Euer lokaler Entwurf bleibt erhalten.');
  if (!response.ok) throw Object.assign(new Error(result.message || `Anfrage fehlgeschlagen (${response.status}).`), { status: response.status });
  return result;
}
export function createWeddingRepository({ eventsBase, fetchRef = fetch } = {}) {
  const read = async path => responseJson(await fetchRef(new URL(path, eventsBase), { cache: 'no-store' }));
  return Object.freeze({
    async registry() {
      const data = await read('Hochzeiten/registry.json');
      if (data.schemaVersion !== 1 || !Array.isArray(data.weddings)) throw new Error('Das Hochzeitsregister ist ungültig.');
      data.weddings.forEach(entry => validateWeddingId(entry.id));
      return data.weddings;
    },
    async load(id) { return validateWeddingEnvelope(await read(`Hochzeiten/data/${validateWeddingId(id)}.json`)); },
    async template() { return validateWeddingEnvelope(await read('Hochzeiten/templates/hochzeit.json')); },
    async latest(id) { return validateWeddingEnvelope(await responseJson(await fetchRef(`${ENDPOINT}?id=${encodeURIComponent(validateWeddingId(id))}`, { cache: 'no-store' }))); },
    async publish(envelope, key) {
      if (!key.trim()) throw new Error('Bitte den Veröffentlichungsschlüssel eingeben.');
      const record = validateWeddingEnvelope(envelope);
      const result = await responseJson(await fetchRef(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key.trim()}` }, body: JSON.stringify({ id: record.id, expectedRevision: record.revision, wedding: record.wedding }) }));
      return { ...result, envelope: validateWeddingEnvelope(result.envelope) };
    }
  });
}
