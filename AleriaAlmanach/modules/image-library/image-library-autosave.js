const DEFAULT_IMAGE_LIBRARY_SAVE_DELAY = 700;

export function createImageLibraryAutosave({
  write,
  onQueued = () => {},
  onSaved = () => {},
  onError = () => {},
  delay = DEFAULT_IMAGE_LIBRARY_SAVE_DELAY,
  setTimer = globalThis.setTimeout.bind(globalThis),
  clearTimer = globalThis.clearTimeout.bind(globalThis)
} = {}) {
  if (typeof write !== 'function') throw new TypeError('write muss eine Funktion sein.');

  const timerIds = new Map();
  const pendingSnapshots = new Map();
  const revisions = new Map();
  let writeChain = Promise.resolve();

  function clearScheduledTimer(recordId) {
    if (!timerIds.has(recordId)) return;
    clearTimer(timerIds.get(recordId));
    timerIds.delete(recordId);
  }

  function queueCharacterFlush(recordId) {
    clearScheduledTimer(recordId);
    if (!pendingSnapshots.has(recordId)) return writeChain;

    const snapshot = pendingSnapshots.get(recordId);
    pendingSnapshots.delete(recordId);
    const run = async () => {
      try {
        await write(snapshot);
        onSaved(snapshot, { isLatest: snapshot.revision === revisions.get(recordId) });
      } catch (error) {
        onError(error, snapshot, { isLatest: snapshot.revision === revisions.get(recordId) });
      }
    };
    writeChain = writeChain.then(run, run);
    return writeChain;
  }

  function queueFlush(recordId = '') {
    const targetId = String(recordId || '');
    if (targetId) return queueCharacterFlush(targetId);
    Array.from(pendingSnapshots.keys()).forEach(queueCharacterFlush);
    return writeChain;
  }

  function schedule(snapshot) {
    if (!(snapshot?.recordId || snapshot?.characterId) || !snapshot?.images) return false;
    const recordId = String(snapshot.recordId || snapshot.characterId);
    const revision = (revisions.get(recordId) || 0) + 1;
    revisions.set(recordId, revision);
    const pendingSnapshot = { ...snapshot, recordId, revision };
    pendingSnapshots.set(recordId, pendingSnapshot);
    clearScheduledTimer(recordId);
    const timerId = setTimer(() => {
      timerIds.delete(recordId);
      void queueCharacterFlush(recordId);
    }, delay);
    timerIds.set(recordId, timerId);
    onQueued(pendingSnapshot);
    return true;
  }

  function cancel(recordId) {
    const targetId = String(recordId || '');
    if (targetId) {
      if (!pendingSnapshots.has(targetId)) return false;
      pendingSnapshots.delete(targetId);
      clearScheduledTimer(targetId);
      return true;
    }
    if (!pendingSnapshots.size) return false;
    Array.from(pendingSnapshots.keys()).forEach(id => {
      pendingSnapshots.delete(id);
      clearScheduledTimer(id);
    });
    return true;
  }

  return Object.freeze({
    schedule,
    flush: queueFlush,
    cancel
  });
}
