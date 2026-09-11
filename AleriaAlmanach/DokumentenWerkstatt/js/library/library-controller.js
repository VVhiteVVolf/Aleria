import { openDocumentRepository } from './document-repository.js';
import { loadRegistry, loadPublishedDocument, publishDocuments } from './document-publisher.js';
import { renderLibrary } from './library-view.js';
import { documentLink, normalizeDocument } from '../document-schema.js';

export async function initLibrary(root, { getDocument, setDocument, setStatus }) {
  const repository = await openDocumentRepository();
  let local = await repository.all();
  let published = [];
  let busy = false;
  let active = null;
  const dialog = root.querySelector('dialog');
  const refresh = async () => { local = await repository.all(); renderLibrary(root, local, published); };
  const run = async action => {
    if (busy) return;
    busy = true; root.setAttribute('aria-busy', 'true');
    try { await action(); } catch (error) { setStatus(error.message); root.querySelector('[data-role="library-message"]').textContent = error.message; }
    finally { busy = false; root.removeAttribute('aria-busy'); await refresh(); }
  };
  const save = async queued => {
    const document = normalizeDocument(getDocument());
    const existing = local.find(record => record.id === document.slug);
    const revision = active?.id === document.slug ? active.revision : existing?.revision || 0;
    await repository.put({ id: document.slug, document, revision, queued: queued || existing?.queued || false, updatedAt: new Date().toISOString() });
    active = { id: document.slug, revision };
    setStatus(queued ? 'Dokument gespeichert und für den Upload vorgemerkt.' : 'Dokument in deiner lokalen Sammlung gespeichert.');
  };
  const copyLink = async id => {
    const link = documentLink(id, location.href);
    const output = root.querySelector('[data-role="document-link"]'); output.value = link;
    try { await navigator.clipboard.writeText(link); setStatus('Dokumentenlink kopiert.'); }
    catch { output.focus(); output.select(); setStatus('Link zum Kopieren markiert.'); }
  };
  root.addEventListener('input', event => { if (event.target.matches('[data-role="library-search"]')) renderLibrary(root, local, published); });
  root.addEventListener('change', event => { if (event.target.matches('[data-role="library-filter"]')) renderLibrary(root, local, published); });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-library-action]');
    if (!button || !root.contains(button)) return;
    const id = button.dataset.id;
    run(async () => {
      const record = local.find(entry => entry.id === id);
      switch (button.dataset.libraryAction) {
        case 'save': await save(false); break;
        case 'save-queue': await save(true); break;
        case 'edit': if (record) { setDocument(record.document); active = record; setStatus('Dokument aus der Sammlung geladen.'); } break;
        case 'duplicate': {
          if (!record) break;
          let index = 1, copyId;
          do { copyId = `${record.id.slice(0, 66)}-kopie-${index++}`; } while (local.some(entry => entry.id === copyId) || published.some(entry => entry.id === copyId));
          const copy = { id: copyId, revision: 0, queued: false, updatedAt: new Date().toISOString(), document: { ...record.document, slug: copyId, title: `${record.document.title} (Kopie)` } };
          await repository.put(copy); active = copy; setDocument(copy.document); setStatus('Eine unabhängige Kopie wurde angelegt.'); break;
        }
        case 'queue': if (record) await repository.put({ ...record, queued: !record.queued }); break;
        case 'remove': if (record && confirm(`„${record.document.title}“ aus der lokalen Sammlung entfernen?`)) await repository.remove(id); break;
        case 'link': await copyLink(id); break;
        case 'refresh': published = await loadRegistry(); break;
        case 'load-online': {
          let result;
          try { result = await loadPublishedDocument(id, { latest: true }); }
          catch { result = await loadPublishedDocument(id); }
          setDocument(result.document); active = { id, revision: result.revision };
          setStatus(`Veröffentlichte Revision ${result.revision} geladen. Lokale Fassungen bleiben in der Sammlung.`);
          break;
        }
        case 'publish': {
          const queued = local.filter(entry => entry.queued);
          root.querySelector('[data-role="publish-summary"]').textContent = queued.map(entry => `${entry.document.title} (Revision ${entry.revision} → ${entry.revision + 1})`).join('\n');
          root.querySelector('[data-role="publish-message"]').textContent = '';
          dialog.showModal(); break;
        }
      }
    });
  });
  root.querySelector('[data-role="publish-form"]').addEventListener('submit', event => {
    event.preventDefault();
    run(async () => {
      const keyInput = root.querySelector('[data-role="publish-key"]');
      const submit = root.querySelector('[data-role="publish-submit"]');
      const message = root.querySelector('[data-role="publish-message"]');
      const submitted = local.filter(record => record.queued);
      submit.disabled = true; message.textContent = 'Dokumente werden gemeinsam nach GitHub hochgeladen …';
      try {
        const result = await publishDocuments(submitted, keyInput.value);
        await repository.acknowledge(submitted, result.records);
        for (const saved of result.records) {
          published = published.filter(entry => entry.id !== saved.id);
          published.push({ id: saved.id, title: saved.document.title, category: saved.document.category, revision: saved.revision });
          if (active?.id === saved.id) active = { id: saved.id, revision: saved.revision };
        }
        message.textContent = `${result.records.length} Dokument(e) auf GitHub gespeichert. Die Links werden nach dem Website-Deployment erreichbar.`;
        root.querySelector('[data-role="library-message"]').textContent = message.textContent;
        setStatus(message.textContent); keyInput.value = '';
      } catch (error) { message.textContent = error.message; throw error; }
      finally { submit.disabled = false; }
    });
  });
  root.querySelector('[data-role="publish-close"]').addEventListener('click', () => { if (!busy) dialog.close(); });
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  dialog.addEventListener('close', () => { root.querySelector('[data-role="publish-key"]').value = ''; });
  document.querySelectorAll('[data-collection-action]').forEach(button => button.addEventListener('click', () => run(() => save(button.dataset.collectionAction === 'queue'))));
  await refresh();
  try { published = await loadRegistry(); } catch (error) { root.querySelector('[data-role="library-message"]').textContent = error.message; }
  renderLibrary(root, local, published);
  const editId = new URLSearchParams(location.search).get('document');
  if (editId) await run(async () => {
    const existing = local.find(record => record.id === editId);
    const record = existing || await loadPublishedDocument(editId);
    setDocument(record.document); active = { id: editId, revision: record.revision };
    setStatus(existing ? 'Lokale Fassung geladen.' : 'Veröffentlichtes Dokument zur Bearbeitung geladen.');
  });
}
