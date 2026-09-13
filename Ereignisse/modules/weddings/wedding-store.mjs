import { validateWedding, validateWeddingEnvelope } from './wedding-schema.mjs';

export function createWeddingStore(initial, { storage } = {}) {
  let published = validateWeddingEnvelope(initial), draft = null, error = '';
  if (storage === undefined) {
    try { storage = globalThis.localStorage; }
    catch { error = 'Der lokale Speicher ist gesperrt. Das Festbuch kann gelesen, aber kein Entwurf gespeichert werden.'; }
  }
  const key = `aleria.weddings.v1.${published.id}`, listeners = new Set();
  try {
    const saved = JSON.parse(storage?.getItem(key) || 'null');
    if (saved?.published?.id === published.id && saved.published.revision > published.revision) published = validateWeddingEnvelope(saved.published);
    if (saved?.draft?.id === published.id) draft = validateWeddingEnvelope(saved.draft);
  } catch { error = 'Der gespeicherte Entwurf konnte nicht geladen werden. Die veröffentlichte Fassung wird angezeigt.'; }
  const state = () => ({ published: structuredClone(published), draft: draft ? structuredClone(draft) : null, envelope: structuredClone(draft || published), dirty: !!draft || published.revision === 0, conflict: !!draft && draft.revision !== published.revision, error });
  function persist(nextPublished, nextDraft) {
    try {
      if (!storage?.setItem) throw new Error('Speicher nicht verfügbar.');
      storage.setItem(key, JSON.stringify({ published: nextPublished, draft: nextDraft }));
    }
    catch { throw new Error('Der lokale Speicher ist nicht verfügbar oder voll. Die Änderung wurde nicht gespeichert.'); }
  }
  function emit() { listeners.forEach(fn => fn(state())); }
  return Object.freeze({
    getState: state,
    subscribe(fn) { listeners.add(fn); fn(state()); return () => listeners.delete(fn); },
    edit(wedding) {
      const next = { ...(draft || published), wedding: validateWedding(wedding) };
      persist(published, next); draft = next; error = ''; emit();
    },
    discard() { persist(published, null); draft = null; error = ''; emit(); },
    acceptPublished(input) {
      const next = validateWeddingEnvelope(input);
      if (next.id !== published.id || next.revision < published.revision) throw new Error('Die Online-Fassung ist veraltet oder gehört zu einer anderen Hochzeit.');
      // Ein erfolgreicher GitHub-Commit bleibt erfolgreich, auch wenn der lokale Cache voll ist.
      try { persist(next, null); error = ''; } catch { error = 'Veröffentlicht. Der lokale Cache konnte nicht aktualisiert werden; bitte die Online-Fassung neu laden.'; }
      published = next; draft = null; emit();
    }
  });
}
