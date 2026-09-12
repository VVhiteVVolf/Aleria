import { normalizeOffer } from './item-register-model.js';
import { parsePrice } from './item-register-money.js';

function legacyId(key) {
  const encoded = Array.from(String(key)).map(char => char.codePointAt(0).toString(16)).join('-');
  // Old canonical keys are already bounded names. A hash suffix keeps long keys distinct.
  let hash = 2166136261;
  for (const char of encoded) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `offer:legacy:${encoded.slice(0, 160)}-${(hash >>> 0).toString(16)}`;
}

/** A read-only compatibility projection. Never rewrites or uploads the old database. */
export function legacyOffers(payload = {}, standards = []) {
  const templates = new Map(standards.flatMap(item => [item.id, ...(item.aliases || [])].map(key => [key, item])));
  const deleted = new Set(payload.deletedKeys || []);
  const rows = new Map();
  for (const item of [...(payload.scanCache || []), ...(payload.customItems || [])]) {
    const key = item.canonicalKey;
    if (!key || deleted.has(key)) continue;
    const template = templates.get(key);
    const override = payload.overrides?.[key];
    if (template && !override) continue;
    if (item.sourceRefs?.every(ref => ref.kind === 'market-folder') && !override) continue;
    const value = { ...item, ...override, hiddenMeta: { ...item.hiddenMeta, ...override?.hiddenMeta } };
    // Real ownership is read from characters; a historic duplicate is not stock.
    if (value.hiddenMeta?.ownerCharacterId) continue;
    const source = item.sourceRefs?.find(ref => ref.moduleId || ref.moduleTitle);
    try {
      rows.set(key, { ...normalizeOffer({ ...value, id: legacyId(key),
        templateId: template?.id || '', listId: source?.moduleId || 'legacy',
        listName: source?.moduleTitle || 'Bisherige eigene Einträge',
        priceRange: parsePrice(value.price, value.currency), stock: null }, standards),
        aliases: [key], legacy: true, revision: 0 });
    } catch { /* A malformed historic entry stays in its original export. */ }
  }
  return [...rows.values()];
}
