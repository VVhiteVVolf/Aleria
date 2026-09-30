// Shared payload builder; intentionally independent of emulator/project setup.
export function itemSegment(actorId, entry, { operation = 'pickup', paymentResource = '' } = {}) {
  return { kind: operation === 'consume' ? 'consume' : 'interact', commentKind: operation === 'consume' ? 'consume' : 'interact', actorId, characterId: actorId, text: 'Gegenstandsaktion im Test',
    inventorySource: 'scene', sceneItemId: entry.sceneItemId, inventoryOperation: operation, inventoryPaymentResource: paymentResource,
    inventoryUse: { actorId, actorPersistence: { kind: 'character', recordId: actorId }, item: entry.item, source: 'scene', sceneItemId: entry.sceneItemId, operation, paymentResource } };
}
