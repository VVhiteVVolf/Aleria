import { createImageLibraryAutosave as createCharacterImageLibraryAutosave } from '../image-library/image-library-autosave.js?v=20260919-creature-pages-v1';
export { createCharacterImageLibraryAutosave };

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
