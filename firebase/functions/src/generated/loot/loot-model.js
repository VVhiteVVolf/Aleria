// Beute-Ansprüche gegen besiegte Kampfgegner. Append-only, wie der Rest der Kampf-Historie:
// ein Anspruch ist ein eigener Kommentar, der eine Kreaturinstanz je Kampf genau einmal freigibt.
export const LOOT_CLAIM_EVENT_KIND = 'loot-claim-event';
export const LOOT_CLAIM_SCHEMA_VERSION = 1;

function text(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

function integer(value, fallback = 0, minimum = 0, maximum = 9999) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

export function normalizeLootClaimItem(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    id: text(source.id, 120) || `loot-${index + 1}`,
    name: text(source.name || 'Gegenstand', 140),
    quantity: integer(source.quantity, 1, 1, 9999),
    notes: text(source.notes, 800)
  };
}

export function normalizeLootClaimEvent(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    kind: LOOT_CLAIM_EVENT_KIND,
    schemaVersion: LOOT_CLAIM_SCHEMA_VERSION,
    encounterId: text(source.encounterId, 180),
    actorId: text(source.actorId, 180),
    actorName: text(source.actorName, 180),
    receiverId: text(source.receiverId, 180),
    receiverName: text(source.receiverName, 180),
    items: (Array.isArray(source.items) ? source.items : []).slice(0, 80).map(normalizeLootClaimItem)
  };
}

export function isLootClaimComment(comment = {}) {
  return !!(comment.lootClaim || comment.commentKind === LOOT_CLAIM_EVENT_KIND || comment.commentMode === 'loot-claim');
}

export function collectClaimedLootActorIds(comments = [], encounterId = '') {
  const targetEncounterId = text(encounterId, 180);
  const claimed = new Set();
  (Array.isArray(comments) ? comments : []).forEach(comment => {
    if (!isLootClaimComment(comment)) return;
    const event = normalizeLootClaimEvent(comment.lootClaim || comment);
    if (!targetEncounterId || event.encounterId === targetEncounterId) claimed.add(event.actorId);
  });
  return claimed;
}

export const lootModelInternals = Object.freeze({ text, integer });
