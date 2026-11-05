import { getFirebaseClientContext } from '../auth/firebase-client-context.js';
import { createInventoryTransactionSubmission } from '../inventory-transactions/inventory-transaction-submission.js';
import { sceneMoneyAmountMinor } from './scene-inventory-money.js';

let current;
export function buildSceneMoneyRequest({ threadId, giver, receiver = null, transfer }) {
  const targetKind = transfer.targetKind || 'character';
  const request = {
    giverId: giver.id, receiverId: targetKind === 'sink' ? '' : receiver?.id || '', entryId: threadId,
    expectedRevisions: { [`character:${giver.id}`]: Number(giver.inventory?.revision || 0),
      ...(targetKind === 'character' && receiver ? { [`character:${receiver.id}`]: Number(receiver.inventory?.revision || 0) } : {}) },
    sceneEvent: { transfer: { object: { kind: 'money', targetKind, currency: transfer.currency, quantity: transfer.quantity } } }
  };
  if (!validSceneMoneyRequest(request)) throw Error('Bitte Geber, Ziel und einen gültigen Geldbetrag wählen.');
  return request;
}
export function validSceneMoneyRequest(request) {
  const object = request?.sceneEvent?.transfer?.object;
  const validId = value => typeof value === 'string' && value.trim() === value && value.length > 0 && value.length <= 240 && !value.includes('/');
  if (object?.kind !== 'money' || !['character', 'sink'].includes(object.targetKind)
    || !validId(request.giverId) || typeof request.entryId !== 'string' || !request.entryId.trim() || request.entryId.length > 240
    || !request.expectedRevisions || typeof request.expectedRevisions !== 'object' || Array.isArray(request.expectedRevisions)
    || (object.targetKind === 'character' && (!validId(request.receiverId) || request.receiverId === request.giverId))
    || (object.targetKind === 'sink' && request.receiverId)) return false;
  const expectedKeys = [`character:${request.giverId}`, ...(object.targetKind === 'character' ? [`character:${request.receiverId}`] : [])].sort();
  if (JSON.stringify(Object.keys(request.expectedRevisions).sort()) !== JSON.stringify(expectedKeys)
    || expectedKeys.some(key => !Number.isSafeInteger(request.expectedRevisions[key]) || request.expectedRevisions[key] < 0)) return false;
  try { sceneMoneyAmountMinor(object); return true; } catch { return false; }
}
export async function getSceneMoneyTransferSession(threadId) {
  const context = await getFirebaseClientContext(), user = await context.requireUser();
  const identity = `${user.uid}:${threadId}`;
  if (current?.identity === identity) return current.session;
  const callable = context.httpsCallable(context.functions, 'commitInventoryTransfer', { timeout: 30000 });
  const session = createInventoryTransactionSubmission(async request => {
    const activeUser = await context.requireUser();
    if (activeUser.uid !== user.uid) {
      const error = Error('Die Anmeldung hat gewechselt. Bitte die Geldbewegung mit der ursprünglichen Anmeldung erneut öffnen.');
      error.code = 'scene-money/identity-changed'; throw error;
    }
    return (await callable(request)).data;
  }, {
    namespace: 'aleria:scene-money:pending:v1', requirePersistence: true, validateRequest: validSceneMoneyRequest,
    storageError: () => {
      const error = Error('Der Browser kann die offene Geldbewegung nicht sicher aufbewahren. Bitte den Sitzungsspeicher erlauben.');
      error.code = 'scene-money/persistence-unavailable'; return error;
    },
    identityError: () => Error('Bitte die offene Geldbewegung mit der ursprünglichen Anmeldung erneut prüfen.'),
    pendingError: () => Error('Bitte zuerst die offene Geldbewegung unverändert erneut prüfen.'),
    runningError: () => Error('Die Geldbewegung wird bereits gebucht.'),
    emptyError: () => Error('Es gibt keine offene Geldbewegung.')
  });
  let storage;
  try { storage = globalThis.sessionStorage; } catch { /* The adapter reports persistence failure. */ }
  session.bindPersistence({ storage, uid: user.uid, threadId });
  current = { identity, session };
  return session;
}
