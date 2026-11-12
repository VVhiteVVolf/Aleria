import { createInventoryTransactionSubmission } from '../inventory-transactions/inventory-transaction-submission.js';

export function createCatalogPurchaseSubmission(commit, makeId) {
  return createInventoryTransactionSubmission(commit, {
    makeId, requirePersistence: true, namespace: 'aleria:catalog-purchase:pending:v1',
    validateRequest: request => request.action === 'catalog-checkout'
      && request.merchantId === `module:${request.entryId}` && !!request.actorCharacterId
      && Array.isArray(request.lines) && request.lines.length === 1
      && request.lines[0].direction === 'buy' && request.lines[0].priceMode === 'standard'
      && !!request.expectedRevisions && typeof request.expectedRevisions === 'object',
    storageError: () => Error('Der offene Kauf kann nicht sicher im Sitzungsspeicher aufbewahrt werden. Bitte den Sitzungsspeicher erlauben.'),
    identityError: () => Error('Unter einer anderen Anmeldung ist noch ein Kauf offen. Bitte zuerst zu dieser Anmeldung zurückkehren.'),
    pendingError: () => Error('Bitte zuerst das Ergebnis des offenen Kaufs erneut prüfen.'),
    runningError: () => Error('Der Kauf wird bereits bestätigt.'),
    emptyError: () => Error('Es gibt keinen offenen Kauf.')
  });
}
