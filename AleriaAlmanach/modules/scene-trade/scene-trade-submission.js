import { MAX_TRADE_LINES } from './scene-trade-state.js';
import { createInventoryTransactionSubmission } from '../inventory-transactions/inventory-transaction-submission.js';

// Only unresolved request metadata enters browser storage; inventories and auth
// remain with their repositories. A reload replays the same server operation.
export function createSceneTradeSubmission(commit, makeId = () => crypto.randomUUID(), { requirePersistence = false } = {}) {
  return createInventoryTransactionSubmission(commit, {
    makeId, requirePersistence, namespace: 'aleria:scene-trade:pending:v1',
    validateRequest: request => request.action === 'checkout' && Array.isArray(request.lines)
      && request.lines.length <= MAX_TRADE_LINES && !!request.merchantId && !!request.actorCharacterId
      && !!request.expectedRevisions && typeof request.expectedRevisions === 'object',
    storageError: () => {
      const error = Error('Der Browser kann den offenen Handelsauftrag nicht sicher aufbewahren. Bitte den Sitzungsspeicher erlauben, bevor du den Handel abschließt.');
      error.code = 'scene-trade/persistence-unavailable'; return error;
    },
    identityError: () => Error('Ein Handel ist unter einer anderen Anmeldung offen. Bitte zuerst zu dieser Anmeldung zurückkehren.'),
    pendingError: () => Error('Bitte zuerst den offenen Handel unverändert erneut prüfen.'),
    runningError: () => Error('Der Handel wird bereits bestätigt.'),
    emptyError: () => Error('Es gibt keinen offenen Handelsauftrag.')
  });
}
