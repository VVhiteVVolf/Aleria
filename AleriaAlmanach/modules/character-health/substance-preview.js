import { resolveItemDefinition } from '../item-definitions/item-definition-resolver.js';
import { getConsumedSubstanceExposure } from './substance-item-effects.js';
import { applySubstanceExposure } from './substance-state.js';

// Draft projection only. The transaction repeats this against actual ownership.
export function previewSubstanceItem(segment, character, state = {}, { item, quantity, seconds, sceneId } = {}) {
  if (String(segment.kind || segment.commentKind) !== 'consume') return state;
  const inventory = state.inventory || character.inventory || {};
  const owned = item || inventory.items?.find(entry => entry.id === (segment.inventoryItemId || segment.inventoryUse?.item?.id));
  if (!owned) return state;
  const definition = resolveItemDefinition(owned);
  const count = quantity || definition?.useDefinition?.quantity || 1;
  const exposure = getConsumedSubstanceExposure(owned, definition, count);
  if (!exposure) return state;
  if (!item && Number(owned.quantity ?? 1) < count) throw Error('Das Rauschmittel ist nicht in ausreichender Menge vorhanden.');
  const result = applySubstanceExposure({ ...(character.combatProfile || {}), ...state }, exposure,
    { actorId: character.id, sceneId, seconds });
  return { ...state, temporaryConditions: result.conditions, ...(!item ? { inventory: { ...inventory,
    items: inventory.items.map(entry => entry.id === owned.id ? { ...entry, quantity: String(Number(entry.quantity ?? 1) - count) } : entry) } } : {}) };
}
