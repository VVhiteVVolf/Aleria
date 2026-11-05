// An unresolved inventory operation retains its exact identity and payload.
// Feature adapters own request validation and user-facing wording.
const copy = value => structuredClone(value);
const definitive = error => /(?:invalid-argument|permission-denied|unauthenticated|not-found|aborted|failed-precondition|already-exists|resource-exhausted)$/.test(error?.code || '');
export function createInventoryTransactionSubmission(commit, {
  makeId = () => crypto.randomUUID(), namespace, validateRequest,
  storageError, identityError, pendingError, runningError, emptyError,
  requirePersistence = false
}) {
  let pending = null, running = false, persistence = null;
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
    try { persistence.storage.removeItem(persistence.key); } catch { throw storageError(); }
  }
  function bindPersistence({ storage, uid, threadId }) {
    if (!uid || !threadId || !storage?.getItem || !storage?.setItem || !storage?.removeItem) throw storageError();
    const key = `${namespace}:${encodeURIComponent(uid)}:${encodeURIComponent(threadId)}`;
    if (pending && persistence?.key && persistence.key !== key) throw identityError();
    let raw;
    try { raw = storage.getItem(key); } catch { throw storageError(); }
    if (raw) {
      let saved;
      try { saved = JSON.parse(raw); } catch { throw storageError(); }
      const request = saved?.request;
      if (saved?.schemaVersion !== 1 || request?.entryId !== threadId
        || typeof request.operationId !== 'string' || !request.operationId || !validateRequest(request)) throw storageError();
      if (pending && JSON.stringify(pending) !== JSON.stringify(request)) throw storageError();
      pending ||= copy(request);
    }
    persistence = { storage, key };
  }
  const run = async () => {
    if (running) throw runningError();
    if (!pending) throw emptyError();
    storePending(pending); running = true;
    try { const result = await commit(copy(pending)); clearPending(); pending = null; return result; }
    catch (error) { if (definitive(error)) { clearPending(); pending = null; } throw error; }
    finally { running = false; }
  };
  return {
    pending: () => pending ? copy(pending) : null, running: () => running, retry: run, bindPersistence,
    submit(input) {
      if (pending) throw pendingError();
      const request = { ...copy(input), operationId: makeId() };
      storePending(request); pending = request; return run();
    }
  };
}
