import { mountDocumentNotes, createLocalDocumentNotes } from './document-notes-controller.js';
for (const root of document.querySelectorAll('[data-document-id]')) {
  if (root.querySelector('[data-role="document-notes"]')) mountDocumentNotes(root, createLocalDocumentNotes(root.dataset.documentId));
}
