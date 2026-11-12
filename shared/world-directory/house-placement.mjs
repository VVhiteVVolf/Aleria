// Geographic matching only: service and liege relationships never assign a residence.
export const geographicKey = value => String(value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .replace(/Æ/g, 'Ae').replace(/æ/g, 'ae').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z0-9]/g, '');
const namedKey = value => geographicKey(String(value || '').replace(/^(?:Haus|Familie|Clan|Sept)\s+/i, ''));
const same = (a, b) => geographicKey(a) === geographicKey(b);

export function familyAtPlace(family, place) {
  const names = [place.name, place.id, ...(place.aliases || [])];
  const trail = (place.hierarchy || []).map(part => part.name);
  const placement = family.placements.find(({ profile, folderPath }) => {
    const kingdom = profile.kingdom || folderPath?.[0];
    if (!kingdom || !trail.some(name => same(name, kingdom))) return false;
    if (profile.county && !trail.some(name => same(name, profile.county))) return false;
    const seats = [profile.seat, ...(profile.secondarySeats || []), folderPath?.at(-1)];
    return seats.some(seat => names.some(name => same(name, seat)));
  });
  if (!placement) return null;
  const secondary = (placement.profile.secondarySeats || []).find(seat => names.some(name => same(name, seat)));
  return { ...family, profile: secondary ? { ...placement.profile, seat: `${place.name} (weiterer Sitz)` } : placement.profile,
    rank: placement.rank ?? family.rank };
}

export const familyBelongsToPlace = (family, place) => Boolean(familyAtPlace(family, place));

export function familyAtScope(family, scope) {
  if (!scope) return null;
  const placement = family.placements.find(({ profile }) => ['kingdom', 'county', 'barony', 'seat']
    .every(key => !scope[key] || same(scope[key], profile[key])));
  return placement ? { ...family, profile: placement.profile, rank: placement.rank ?? family.rank } : null;
}

export const familyBelongsToScope = (family, scope) => Boolean(familyAtScope(family, scope));

// Only a geographic leaf may infer its own scope. Counties and countries retain
// their authored selection instead of flattening every subordinate jurisdiction.
export function territoryFamilyScope(territory) {
  if (territory.content?.view?.familyScope) return territory.content.view.familyScope;
  const trail = territory.hierarchy || [];
  const leaf = trail.at(-1);
  if (!/^(?:Baronie|Herrschaft|Lehensherrschaft)$/i.test(leaf?.type || '')) return null;
  const ancestors = trail.slice(0,-1);
  const kingdom = ancestors.find(part => /^(?:Königreich|Land|Fürstentum|Reiktum|Kaiserreich)$/i.test(part.type))?.name;
  if (!kingdom) return null;
  const county = ancestors.find(part => /^(?:Grafschaft|Jarltum|Oberherrschaft)$/i.test(part.type))?.name;
  return { kingdom, ...(county ? { county } : {}), barony: leaf.name };
}

export function canonicalHouseCard(family) {
  return { id: family.id, name: family.name, rank: family.rank, seat: family.profile.seat,
    liege: family.profile.liegeHouseName || '', imageSrc: family.emblem, imageAlt: `Wappen ${family.name}`, href: family.href };
}

// Preserve authored sections and intentional unknown entries. Match an idless old
// card by name only among the independently proven residents of this exact place.
export function reconcileHouseGroups(groups, residents, { kind = 'places', knownFamilies = [], misplacedIds = new Set() } = {}) {
  const byId = new Map(knownFamilies.map(family => [family.id, family]));
  const residentsById = new Map(residents.map(family => [family.id, family]));
  const aliases = new Map();
  for (const family of knownFamilies) for (const alias of family.aliases || []) {
    if (!byId.has(alias)) aliases.set(alias, aliases.has(alias) && aliases.get(alias)?.id !== family.id ? null : family);
  }
  for (const [alias, family] of aliases) if (family) byId.set(alias, family);
  const seen = new Set();
  const output = groups.map(group => ({ ...group, cards: (group.cards || group.items || []).flatMap(card => {
    let id = card.id || card.familyId || '';
    if (byId.has(id)) id = byId.get(id).id;
    if (id && misplacedIds.has(id)) return [];
    if (!id) {
      const matches = residents.filter(family => namedKey(family.name) === namedKey(card.name));
      if (matches.length === 1) id = matches[0].id;
    }
    if (id && seen.has(id)) return [];
    if (id) seen.add(id);
    const family = residentsById.get(id) || byId.get(id);
    // Existing curated facts can be more specific (e.g. a named inn or manor).
    // Canonical identity and direct links replace only obsolete/idless bindings.
    const needsLiege = !card.liege || /^(?:\.{3}|…)$/.test(card.liege.trim());
    return [{ ...card, ...(id ? { id } : {}), ...(family ? { href: family.href,
      ...(needsLiege && family.profile.liegeHouseName ? { liege: family.profile.liegeHouseName } : {}),
      imageSrc: card.imageSrc || card.emblem || family.emblem } : {}) }];
  }) }));
  for (const family of residents) {
    if (seen.has(family.id)) continue;
    seen.add(family.id);
    const isCommoner = ['commoner', 'sept-head', 'mercantian', 'plebeian'].includes(family.profile.rankId);
    const isKnight = ['knight', 'huskarl', 'ministerial', 'knight-simple', 'sept-lord', 'magnarian'].includes(family.profile.rankId);
    const rankOpen = !family.profile.rankId || family.profile.rankId === 'unknown';
    const title = rankOpen ? 'Weitere Häuser' : isCommoner ? 'Bürgerliche Häuser' : isKnight ? 'Ritterhäuser' : 'Adelshäuser';
    let group = output.find(group => !group.variant && (rankOpen ? group.title === title : (isCommoner ? /bürger/i : isKnight ? /ritterh[äa]user/i : /adelsh[äa]user/i).test(group.title)));
    if (!group) { group = { title, cards: [] }; output.push(group); }
    group.cards.push(canonicalHouseCard(family));
  }
  return output.filter(group => group.cards.length).map(group => {
    if (kind === 'territories') return group;
    const { cards, ...rest } = group;
    return { ...rest, items: cards.map(({ id, imageSrc, imageAlt, ...card }) => ({ ...card, familyId: id || '', emblem: imageSrc || card.emblem || '' })) };
  });
}
