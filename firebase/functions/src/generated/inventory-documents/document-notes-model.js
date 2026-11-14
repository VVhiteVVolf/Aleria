import { normalizeItemDocumentRef } from '../item-definitions/item-definition-model.js';
export const DOCUMENT_NOTES_LIMIT = 10000;
const identity = value => typeof value === 'string' && /^[\w:.-]{1,220}$/.test(value);

export function normalizeDocumentNotesContext(input) {
  const documentRef = normalizeItemDocumentRef({ id: input?.documentId });
  if (!documentRef || !identity(input.holderId) || !identity(input.instanceId) || !['characters', 'creatures'].includes(input.kind)) throw Error('Das konkrete Inventarbuch ist nicht eindeutig verknüpft.');
  return { documentId: documentRef.id, kind: input.kind, holderId: input.holderId, instanceId: input.instanceId };
}
export function normalizeDocumentNotes(input = {}) {
  if (typeof input.text !== 'string' || input.text.length > DOCUMENT_NOTES_LIMIT || !Number.isSafeInteger(input.revision) || input.revision < 0) throw Error('Ungültige Notizfassung.');
  return { text: input.text, revision: input.revision, updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : '' };
}
export function documentNotesIdentity(context) {
  return `${context.documentId}:${context.instanceId}`;
}
