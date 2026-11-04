import { MAX_TRADE_LINES } from './scene-trade-state.js';

// Only unresolved request metadata enters browser storage; inventories and auth
// remain with their repositories. A reload replays the same server operation.
const copy = value => structuredClone(value);
const definitive = error => /(?:invalid-argument|permission-denied|unauthenticated|not-found|aborted|failed-precondition|already-exists|resource-exhausted)$/.test(error?.code || '');
export function createSceneTradeSubmission(commit, makeId = () => crypto.randomUUID(), { requirePersistence = false } = {}) {
  let pending = null, running = false, persistence = null;
  const storageError = () => {
    const error = Error('Der Browser kann den offenen Handelsauftrag nicht sicher aufbewahren. Bitte den Sitzungsspeicher erlauben, bevor du den Handel abschließt.');
    error.code = 'scene-trade/persistence-unavailable'; return error;
  };
  function storePending(request) {
    if (!persistence) { if (requirePersistence) throw storageError(); return; }
    try {
      const payload = JSON.stringify({ schemaVersion: 1, request });
      persistence.storage.setItem(persistence.key, payload);
      if (persistence.storage.getItem(persistence.key) !== payload) throw storageError();
    } catch { throw storageError(); }
  }
  function clearPending() {
    if (!persistence) return;
    try { persistence.storage.removeItem(persistence.key); }
    catch { throw storageError(); }
  }
  function bindPersistence({ storage, uid, threadId }) {
    if (!uid || !threadId || !storage?.getItem || !storage?.setItem || !storage?.removeItem) throw storageError();
    const key = `aleria:scene-trade:pending:v1:${encodeURIComponent(uid)}:${encodeURIComponent(threadId)}`;
    if (pending && persistence?.key && persistence.key !== key) throw Error('Ein Handel ist unter einer anderen Anmeldung offen. Bitte zuerst zu dieser Anmeldung zurückkehren.');
    let raw;
    try { raw = storage.getItem(key); } catch { throw storageError(); }
    if (raw) {
      let saved;
      try { saved = JSON.parse(raw); } catch { throw storageError(); }
      const request = saved?.request;
      if (saved?.schemaVersion !== 1 || request?.action !== 'checkout' || request.entryId !== threadId
        || typeof request.operationId !== 'string' || !request.operationId || !Array.isArray(request.lines)
        || request.lines.length > MAX_TRADE_LINES || !request.merchantId || !request.actorCharacterId
        || !request.expectedRevisions || typeof request.expectedRevisions !== 'object') throw storageError();
      if (pending && JSON.stringify(pending) !== JSON.stringify(request)) throw storageError();
      pending ||= copy(request);
    }
    persistence = { storage, key };
  }
  const run = async () => {
    if (running) throw Error('Der Handel wird bereits bestätigt.');
    if (!pending) throw Error('Es gibt keinen offenen Handelsauftrag.');
    storePending(pending); running = true;
    try { const result = await commit(copy(pending)); clearPending(); pending = null; return result; }
    catch (error) { if (definitive(error)) { clearPending(); pending = null; } throw error; }
    finally { running = false; }
  };
  return { pending: () => pending ? copy(pending) : null, running: () => running, retry: run, bindPersistence,
    submit(input) {
      if (pending) throw Error('Bitte zuerst den offenen Handel unverändert erneut prüfen.');
      const request = { ...copy(input), operationId: makeId() }; storePending(request); pending = request; return run();
    } };
}
