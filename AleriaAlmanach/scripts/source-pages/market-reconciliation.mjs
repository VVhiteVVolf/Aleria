// Reviewed equivalences, not fuzzy title matching: package sizes and variants
// remain separate. Released IDs survive as aliases for existing inventories.
const equivalents = new Map([
  ['standard:arkanist:heiltrank', 'standard:alchemist:heiltrank'],
  ['standard:arkanist:manatrank', 'standard:alchemist:manatrank'],
  ['standard:schwarzmarkt:ahnenbaumsaft', 'standard:alchemist:ahnenbaumsaft']
]);

export function reconcileMarketItems(items) {
  const merged = new Map(items.filter(item => !equivalents.has(item.id)).map(item => [item.id, structuredClone(item)]));
  for (const item of items.filter(item => equivalents.has(item.id))) {
    const target = merged.get(equivalents.get(item.id));
    if (!target) throw new Error(`Die gemeinsame Vorlage für ${item.id} fehlt.`);
    target.aliases = [...new Set([...target.aliases, item.id, ...item.aliases])];
    target.sourceRefs.push(...item.sourceRefs);
    target.tags = [...new Set([...target.tags, ...item.tags])];
    const prose = new Set([target.description, target.details].filter(Boolean));
    for (const text of [item.description, item.details].filter(Boolean)) {
      if (!prose.has(text)) { target.details = [target.details, text].filter(Boolean).join('\n\n'); prose.add(text); }
    }
    target.hiddenMeta.sourceVariants = [...(target.hiddenMeta.sourceVariants || []), {
      id: item.id, type: item.type, priceRange: item.priceRange,
      attributes: item.attributes, metadata: item.hiddenMeta
    }];
  }
  return [...merged.values()];
}
