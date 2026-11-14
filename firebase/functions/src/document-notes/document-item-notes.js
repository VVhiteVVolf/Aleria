import { createHash } from 'node:crypto';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { normalizeDocumentNotesContext, normalizeDocumentNotes, documentNotesIdentity } from '../generated/inventory-documents/document-notes-model.js';
import { normalizeItemDocumentRef } from '../generated/item-definitions/item-definition-model.js';
import { readItemDefinition } from '../items/item-definition-repository.js';

const publicNotes = value => normalizeDocumentNotes(value || { text: '', revision: 0 });
export async function documentItemNotesOperation(request, { db = getFirestore(), now = () => new Date().toISOString() } = {}) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Bitte melde dich an, um die Buchnotizen zu lesen oder zu speichern.');
  const input = request.data || {};
  let context;
  try { context = normalizeDocumentNotesContext(input); }
  catch (error) { throw new HttpsError('invalid-argument', error.message); }
  if (!['load', 'save'].includes(input.action)) throw new HttpsError('invalid-argument', 'Unbekannte Notizaktion.');
  if (input.action === 'save') {
    try { normalizeDocumentNotes({ text: input.text, revision: input.expectedRevision }); }
    catch (error) { throw new HttpsError('invalid-argument', error.message); }
    if (typeof input.mutationId !== 'string' || !/^[\w-]{8,120}$/.test(input.mutationId)) throw new HttpsError('invalid-argument', 'Die Speicherkennung fehlt.');
  }
  const role = request.auth.token?.aleriaRole || 'player';
  const reference = db.collection(context.kind).doc(context.holderId);
  const identity = documentNotesIdentity(context);
  const notesRef = db.collection('item_document_notes').doc(createHash('sha256').update(identity).digest('hex'));
  return db.runTransaction(async transaction => {
    const holder = await transaction.get(reference);
    if (!holder.exists) throw new HttpsError('not-found', 'Die Inventarquelle ist nicht verfügbar.');
    const record = holder.data();
    if (record.ownerUid !== request.auth.uid && !['editor', 'moderator', 'admin'].includes(role)) throw new HttpsError('permission-denied', 'Nur der Besitzer des Inventars und die Spielleitung können diese Buchnotizen öffnen.');
    const matches = (record.inventory?.items || []).filter(item => (item.instanceId || item.id) === context.instanceId && Number(item.quantity ?? 1) > 0);
    if (matches.length !== 1) throw new HttpsError('failed-precondition', 'Dieses Buch befindet sich nicht mehr in diesem Inventar. Öffne es beim aktuellen Besitzer.');
    const item = matches[0];
    const definition = item.definitionRef ? await readItemDefinition(db, transaction, item.definitionRef) : null;
    const documentRef = normalizeItemDocumentRef(definition?.documentRef || item.documentRef);
    if (documentRef?.id !== context.documentId) throw new HttpsError('failed-precondition', 'Die Dokumentverknüpfung gehört nicht zu diesem Buch.');
    const snapshot = await transaction.get(notesRef);
    const stored = snapshot.exists ? snapshot.data() : null;
    if (stored && (stored.documentId !== context.documentId || stored.instanceId !== context.instanceId)) throw new HttpsError('failed-precondition', 'Widersprüchliche Buchidentität.');
    const current = publicNotes(stored);
    if (input.action === 'load') return { notes: current };
    const hash = createHash('sha256').update(JSON.stringify([request.auth.uid, input.mutationId, identity, input.expectedRevision, input.text])).digest('hex');
    if (stored?.lastMutationId === input.mutationId) {
      if (stored.lastMutationHash !== hash) throw new HttpsError('already-exists', 'Diese Speicherkennung wurde mit anderem Inhalt verwendet.');
      return { notes: current };
    }
    if (current.revision !== input.expectedRevision) throw new HttpsError('aborted', 'Die Notizen wurden inzwischen geändert. Lade den aktuellen Stand; dein ungespeicherter Text bleibt erhalten.');
    if (!Number.isSafeInteger(current.revision + 1)) throw new HttpsError('failed-precondition', 'Die Notizrevision ist ungültig.');
    const notes = { text: input.text, revision: current.revision + 1, updatedAt: now() };
    // Notes follow the physical instance across transfers. This operation writes
    // no character, inventory, money, equipment, combat or document source field.
    transaction.set(notesRef, { ...notes, documentId: context.documentId, instanceId: context.instanceId,
      lastMutationId: input.mutationId, lastMutationHash: hash });
    return { notes };
  });
}

export const documentItemNotes = onCall({ region: 'europe-west1', maxInstances: 3, concurrency: 20, timeoutSeconds: 30, enforceAppCheck: false }, request => documentItemNotesOperation(request));
