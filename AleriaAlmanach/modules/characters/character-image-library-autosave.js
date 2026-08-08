const DEFAULT_IMAGE_LIBRARY_SAVE_DELAY = 700;

export function createCharacterImageLibraryAutosave({
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

  function clearScheduledTimer(characterId) {
    if (!timerIds.has(characterId)) return;
    clearTimer(timerIds.get(characterId));
    timerIds.delete(characterId);
  }

  function queueCharacterFlush(characterId) {
    clearScheduledTimer(characterId);
    if (!pendingSnapshots.has(characterId)) return writeChain;

    const snapshot = pendingSnapshots.get(characterId);
    pendingSnapshots.delete(characterId);
    const run = async () => {
      try {
        await write(snapshot);
        onSaved(snapshot, { isLatest: snapshot.revision === revisions.get(characterId) });
      } catch (error) {
        onError(error, snapshot, { isLatest: snapshot.revision === revisions.get(characterId) });
      }
    };
    writeChain = writeChain.then(run, run);
    return writeChain;
  }

  function queueFlush(characterId = '') {
    const targetId = String(characterId || '');
    if (targetId) return queueCharacterFlush(targetId);
    Array.from(pendingSnapshots.keys()).forEach(queueCharacterFlush);
    return writeChain;
  }

  function schedule(snapshot) {
    if (!snapshot?.characterId || !snapshot?.images) return false;
    const characterId = String(snapshot.characterId);
    const revision = (revisions.get(characterId) || 0) + 1;
    revisions.set(characterId, revision);
    const pendingSnapshot = { ...snapshot, characterId, revision };
    pendingSnapshots.set(characterId, pendingSnapshot);
    clearScheduledTimer(characterId);
    const timerId = setTimer(() => {
      timerIds.delete(characterId);
      void queueCharacterFlush(characterId);
    }, delay);
    timerIds.set(characterId, timerId);
    onQueued(pendingSnapshot);
    return true;
  }

  function cancel(characterId) {
    const targetId = String(characterId || '');
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

const imageLibraryAutosave = createCharacterImageLibraryAutosave({
  async write(snapshot) {
    if (!globalThis._fb?.saveCharacter) {
      throw new Error('Die Online-Speicherung ist noch nicht bereit.');
    }
    await globalThis._fb.saveCharacter(snapshot.characterId, {
      ...snapshot.images,
      updatedAt: new Date().toISOString()
    });
  },
  onQueued() {
    globalThis.AleriaCharacterProfileMediaPersistence?.showQueued?.();
  },
  onSaved(snapshot, meta) {
    globalThis.AleriaCharacterProfileMediaPersistence?.applySaved?.(snapshot, meta);
  },
  onError(error, snapshot, meta) {
    globalThis.AleriaCharacterProfileMediaPersistence?.showError?.(error, snapshot, meta);
  }
});

globalThis.AleriaCharacterImageLibraryAutosave = Object.freeze({
  schedule(reason = '') {
    const adapter = globalThis.AleriaCharacterProfileMediaPersistence;
    const snapshot = adapter?.capture?.(reason);
    if (!snapshot) {
      adapter?.showDeferred?.();
      return false;
    }
    return imageLibraryAutosave.schedule(snapshot);
  },
  flush: characterId => imageLibraryAutosave.flush(characterId),
  cancel: characterId => imageLibraryAutosave.cancel(characterId)
});
