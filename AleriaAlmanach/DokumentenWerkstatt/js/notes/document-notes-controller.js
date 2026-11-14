import { normalizeDocumentNotes, DOCUMENT_NOTES_LIMIT } from '../../../modules/inventory-documents/document-notes-model.js';

export function createLocalDocumentNotes(documentId, instanceId = 'personal', storage = localStorage) {
  const key = `aleria:document-notes:${documentId}:${instanceId}`;
  const read = () => {
    const value = storage.getItem(key);
    return value ? normalizeDocumentNotes(JSON.parse(value)) : { text: '', revision: 0, updatedAt: '' };
  };
  return { mode: 'Nur in diesem Browser gespeichert.',
    async load() { return read(); },
    async save({ text, expectedRevision }) {
      const current = read();
      if (current.revision !== expectedRevision) throw Error('Die Notizen wurden in einem anderen Fenster geändert. Dein Text bleibt erhalten. Lade den aktuellen Stand vor einem neuen Versuch.');
      const next = normalizeDocumentNotes({ text, revision: current.revision + 1, updatedAt: new Date().toISOString() });
      storage.setItem(key, JSON.stringify(next)); return next;
    }
  };
}

export function mountDocumentNotes(root, repository) {
  const lifetime = new AbortController();
  let draft = '', saved = '', revision = 0, busy = false, loaded = false, message = '', generation = 0;
  const controls = selector => [...root.querySelectorAll(`[data-role="document-notes"] ${selector}`)];
  function render() {
    for (const field of controls('textarea')) {
      if (field.value !== draft) field.value = draft;
      if (field.defaultValue !== draft) field.defaultValue = draft;
      field.maxLength = DOCUMENT_NOTES_LIMIT;
    }
    controls('[data-notes-action="save"]').forEach(button => { button.disabled = busy || !loaded || draft === saved; });
    controls('[data-notes-action="reload"]').forEach(button => { button.disabled = busy; });
    controls('[data-role="document-notes-current"]').forEach(node => { node.hidden = !loaded || draft === saved; });
    controls('[data-role="document-notes-saved"]').forEach(node => { if (node.textContent !== saved) node.textContent = saved; });
    controls('[data-role="document-notes-status"]').forEach(node => {
      const next = message || (draft !== saved ? 'Ungespeicherte Änderungen.' : 'Gespeichert.');
      const text = `${next} ${repository.mode || ''}`;
      if (node.textContent !== text) node.textContent = text;
    });
  }
  async function load(replace = false) {
    const current = ++generation; busy = true; message = 'Notizen werden geladen …'; render();
    try {
      const value = normalizeDocumentNotes(await repository.load());
      if (current !== generation) return;
      if (replace || draft === saved) draft = value.text;
      saved = value.text; revision = value.revision; loaded = true;
      message = draft === saved ? (revision ? 'Gespeicherte Notizen geladen.' : 'Noch keine Notizen gespeichert.') : 'Aktueller Stand geladen. Dein ungespeicherter Text bleibt erhalten; prüfe ihn vor dem Speichern.';
    } catch (error) { if (current === generation) message = error.message || 'Die Notizen konnten nicht geladen werden.'; }
    finally { if (current === generation) { busy = false; render(); } }
  }
  root.addEventListener('input', event => {
    if (!event.target.matches('[data-role="document-notes-text"]')) return;
    draft = event.target.value; message = 'Ungespeicherte Änderungen.'; render();
  }, { signal: lifetime.signal });
  root.addEventListener('click', async event => {
    const action = event.target.closest('[data-notes-action]');
    if (!action || busy) return;
    if (action.dataset.notesAction === 'reload') return load(false);
    if (action.dataset.notesAction !== 'save' || !loaded) return;
    busy = true; const text = draft; message = 'Notizen werden gespeichert …'; render();
    try {
      const value = normalizeDocumentNotes(await repository.save({ text, expectedRevision: revision, mutationId: crypto.randomUUID() }));
      saved = value.text; revision = value.revision; message = draft === saved ? 'Notizen gespeichert.' : 'Gespeichert; neuere Eingaben sind noch ungespeichert.';
    } catch (error) { message = `${error.message || 'Speichern fehlgeschlagen.'} Dein Text bleibt im Schreibfeld erhalten.`; }
    finally { busy = false; render(); }
  }, { signal: lifetime.signal });
  window.addEventListener('beforeunload', event => { if (draft !== saved) { event.preventDefault(); event.returnValue = ''; } }, { signal: lifetime.signal });
  const observer = new MutationObserver(render); observer.observe(root, { childList: true, subtree: true });
  const ready = load();
  return { ready, destroy() { generation++; lifetime.abort(); observer.disconnect(); } };
}
