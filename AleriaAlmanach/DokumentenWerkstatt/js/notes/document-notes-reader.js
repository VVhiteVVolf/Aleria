import { mountDocumentNotes, createLocalDocumentNotes } from './document-notes-controller.js';
import { normalizeDocumentNotesContext } from '../../../modules/inventory-documents/document-notes-model.js';

export async function mountReaderDocumentNotes(root, meta, search = location.search) {
  if (!Number.isInteger(meta.notesPage)) return null;
  const query = new URLSearchParams(search);
  let repository;
  if (query.has('holder') || query.has('item')) {
    try {
      const context = normalizeDocumentNotesContext({ documentId: meta.slug, kind: query.get('kind') || 'characters', holderId: query.get('holder'), instanceId: query.get('item') });
      const { connectDocumentNotes } = await import('./document-notes-firebase.js');
      repository = await connectDocumentNotes(context, root);
    } catch (error) {
      repository = { mode: 'Am Inventarbuch gespeichert.', load: async () => { throw Error('Die Online-Notizen sind gerade nicht erreichbar. Dein Text kann erst nach dem Laden gespeichert werden.'); } };
    }
  } else repository = createLocalDocumentNotes(meta.slug);
  return mountDocumentNotes(root, repository);
}
