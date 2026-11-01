import { resolveItemDefinition } from '../item-definitions/item-definition-resolver.js';
export function recoverItemCharges(inventory = {}, restType, dayKey, definitions) {
  let changed = false;
  const next = structuredClone(inventory);
  next.items = (next.items || []).map(item => {
    const use = resolveItemDefinition(item, definitions)?.useDefinition;
    if (!use?.chargesMaximum) return item;
    const recovers = use.recovery === 'short-rest' || use.recovery === 'long-rest' && restType === 'long'
      || use.recovery === 'day' && dayKey && item.itemState?.recoveryDayKey !== dayKey;
    if (!recovers) return item;
    const state = { ...item.itemState, chargesCurrent: use.chargesMaximum,
      ...(use.recovery === 'day' ? { recoveryDayKey: dayKey } : {}) };
    if (JSON.stringify(state) !== JSON.stringify(item.itemState)) changed = true;
    return { ...item, itemState: state };
  });
  return { inventory: next, changed };
}
