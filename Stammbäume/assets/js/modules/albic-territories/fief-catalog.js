import review from './fiefs.source.json' with { type: 'json' };

export const ALBIC_TERRITORIAL_REVIEW = review;
export const reviewedFiefs = Object.freeze(review.fiefs.map(fief => Object.freeze(fief)));
const byId = new Map(reviewedFiefs.map(fief => [fief.id, fief]));

export function reviewedFief(id) { return byId.get(id) || null; }

export function applyFiefReview(territory) {
  const fief = reviewedFief(territory.id);
  if (!fief) return territory;
  return { ...territory, name: fief.name, extent: fief.extent,
    ...(fief.meaning ? { gloss: fief.meaning } : {}),
    ...(fief.banner ? { banner: fief.banner, bannerAlt: `Banner ${fief.name}` } : {}),
    ...(fief.seat ? { seat: fief.seat } : {}),
    territorialReview: { version: 1, rationale: fief.rationale,
      ...(fief.lexicalSource ? { lexicalSource: fief.lexicalSource } : {}) } };
}

export function territoryChain(territory, territories) {
  const byId = new Map(territories.map(entry => [entry.id, entry]));
  const chain = [], seen = new Set();
  for (let current = territory; current; current = byId.get(current.parentId)) {
    if (seen.has(current.id)) throw new Error(`Zyklische albische Herrschaft: ${current.id}`);
    seen.add(current.id); chain.unshift(current);
    if (current.parentId && !byId.has(current.parentId)) throw new Error(`Fehlende Oberherrschaft: ${current.parentId}`);
  }
  return chain;
}
