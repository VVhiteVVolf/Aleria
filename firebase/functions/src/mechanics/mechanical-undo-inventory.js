import { createHash } from 'node:crypto';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort()
    .filter(key => value[key] !== undefined).map(key => [key, canonical(value[key])]));
  return value;
}

// Undo increments revisions itself. Compare possessions and wallet contents so
// sequential undos remain valid while later purchases/grants cannot be erased.
export function undoInventoryFingerprint(inventory) {
  if (!inventory || typeof inventory !== 'object') return '';
  const { revision, ...contents } = inventory;
  return createHash('sha256').update(JSON.stringify(canonical(contents))).digest('hex');
}

export function getUndoInventoryFingerprint(comment, entry) {
  if (entry.afterInventoryFingerprint) return entry.afterInventoryFingerprint;
  // Historical receipts already retain the resulting inventory; read them
  // without modifying or regenerating any saved resolution.
  let after = null;
  const matches = persistence => persistence?.kind === entry.kind && persistence.recordId === entry.recordId;
  for (const participant of comment.sceneRest?.participants || []) {
    if (matches(participant.persistence) && participant.inventorySnapshot?.after) after = participant.inventorySnapshot.after;
  }
  for (const segment of [comment, ...(comment.commentSegments || [])]) {
    if (matches(segment.inventoryUse?.actorPersistence) && segment.inventoryUse?.inventorySnapshot?.after) after = segment.inventoryUse.inventorySnapshot.after;
    const resolutions = Array.isArray(segment.combatResolutions) ? segment.combatResolutions : [segment.combatResolution];
    for (const resolution of resolutions.filter(Boolean)) {
      if (matches(resolution.actorPersistence) && resolution.actorInventorySnapshot?.after) after = resolution.actorInventorySnapshot.after;
      if (matches(resolution.targetPersistence) && resolution.targetInventorySnapshot?.after) after = resolution.targetInventorySnapshot.after;
    }
  }
  return undoInventoryFingerprint(after);
}
