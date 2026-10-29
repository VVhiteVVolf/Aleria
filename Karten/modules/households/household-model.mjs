// Residence is distinct from territorial allegiance: a region's ruler does
// not automatically live at every farm, ruin or tavern inside that region.
export function normalizePlace(value) {
  return String(value || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/\b(?:konigreich|furstentum|jarltum|grafschaft|baronie)\s+(?:von\s+)?/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

const canonicalId = value => String(value || '').replace(/^house-/, 'haus-');
const inactive = /ausgestorben|erloschen|inaktiv|historisch|antike clans/i;
const ranks = ['royal', 'king', 'ard-tiarna', 'ducal', 'prince', 'duke', 'jarl', 'county', 'mor-tiarna', 'freiherr', 'thane', 'barony', 'baron', 'dun-tiarna', 'hesir', 'junker', 'knight-prince', 'laird', 'knightly-order', 'ministerial', 'knight', 'commoner', 'unknown'];
const familyPath = value => /^(?:\/|https?:\/\/)/i.test(value) ? value : '/Stammbäume/' + value;

export function createHouseholdCatalog(records, reviewedPins = {}, sources = {}) {
  const families = records.filter(record => record.status === 'active' && record.family?.document?.emblem)
    .map(record => {
      const source = sources[record.id];
      const profiles = [record.houseProfile, ...(record.additionalPlacements || [])
        .filter(placement => placement.role !== 'origin').map(placement => placement.houseProfile)]
        .filter(profile => profile && !inactive.test(profile.barony || ''));
      return {
        id: record.id, name: record.title,
        crest: familyPath(record.family.document.emblem),
        href: familyPath(record.link),
        status: source?.status || 'active',
        formerSeat: source && source.status !== 'active' ? source.seat || record.houseProfile?.seat || '' : '',
        territories: profiles.filter(profile => profile.barony).map(profile => ({ name: profile.barony, kingdom: profile.kingdom || '', county: profile.county || '' })),
        priority: Math.min(...profiles.map(profile => { const rank = ranks.indexOf(profile.rankId); return rank < 0 ? ranks.length : rank; }), ranks.length),
        residences: source && source.status !== 'active' ? [] : profiles.flatMap((profile, profileIndex) => [profileIndex === 0 && source?.seat ? source.seat : profile.seat, ...(profile.secondarySeats || [])]
          .filter(Boolean).map((seat, index) => ({ seat, role: index === 0 ? 'Hauptsitz' : 'Nebensitz',
            ...(profileIndex === 0 && index === 0 && source?.seat ? { role: source.seatRole } : {}),
            kingdom: profile.kingdom || '', county: profile.county || '', territory: profile.barony || '', rank: profile.rankId || '' }))),
      };
    });
  return { schemaVersion: 1, families, reviewedPins };
}

export function createHouseholdIndex(catalog) {
  const families = catalog.families || [];
  const byId = new Map(families.map(family => [canonicalId(family.id), family]));
  const byName = new Map(families.map(family => [normalizePlace(family.name), family]));
  const bySeat = new Map();
  for (const family of families) for (const residence of family.residences) {
    const key = normalizePlace(residence.seat);
    if (!bySeat.has(key)) bySeat.set(key, []);
    bySeat.get(key).push({ family, ...residence });
  }
  return { families, byId, byName, bySeat, reviewedPins: catalog.reviewedPins || {} };
}

export function matchesHouseholdMap(residence, map) {
  const hierarchy = map.hierarchy || [];
  const kingdom = hierarchy.find(part => part.level === 'kingdom') || hierarchy[0];
  if (!kingdom || normalizePlace(kingdom.title) !== normalizePlace(residence.kingdom)) return false;
  const county = hierarchy.find(part => part.level === 'county');
  return !county || normalizePlace(county.title) === normalizePlace(residence.county);
}

function referencedFamily(pin, index) {
  const link = String(pin.crestLink || '');
  const id = link.match(/[?&](?:family|haus)=([^&#]+)/)?.[1];
  if (id) {
    try { return index.byId.get(canonicalId(decodeURIComponent(id))); } catch { return undefined; }
  }
  return index.byName.get(normalizePlace(pin.house));
}

function namesFamilySeat(pin, family) {
  // Only a named family property, never an incidental mention in prose.
  const name = normalizePlace(family.name).replace(/^(?:haus|clan|familie) /, '');
  return name.length >= 4 && (' ' + normalizePlace(pin.title) + ' ').includes(' ' + name + ' ');
}

export function householdSeatName(pin, dominions = []) {
  const seat = dominions.find(dominion => dominion.id === pin.dominionId)?.seat;
  // An existing dominion can prove a compound-name spelling (Castell Bryn /
  // Castellbryn). It does not relocate other places to the dominion's seat.
  return seat && normalizePlace(seat).replaceAll(' ', '') === normalizePlace(pin.title).replaceAll(' ', '') ? seat : pin.title;
}

export function residentsForPin(pin, map, index, { uniqueTitle = true, seatName = pin.title } = {}) {
  if (pin.kind === 'text') return [];
  const result = new Map();
  const add = (family, role) => { if (family && !result.has(family.id)) result.set(family.id, { ...family, role }); };
  // Presence, including an empty array, is an explicit marker-level override.
  if (Array.isArray(pin.residentFamilyIds)) {
    for (const id of pin.residentFamilyIds) add(index.byId.get(canonicalId(id)), 'Örtliche Zuordnung');
    return [...result.values()];
  }
  if (uniqueTitle) for (const residence of index.bySeat.get(normalizePlace(seatName)) || []) {
    if (matchesHouseholdMap(residence, map)) add(residence.family, residence.role);
  }
  const reference = referencedFamily(pin, index);
  const reviewed = index.reviewedPins[map.id]?.[pin.id];
  if (reference && reference.status === 'active' && (reviewed?.includes(reference.id) || namesFamilySeat(pin, reference))) add(reference, 'Örtliche Zuordnung');
  return [...result.values()].sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name, 'de'));
}

export function householdGroups(pins, map, index, { editMode = false, filter = 'all', dominions = [] } = {}) {
  const places = pins.map(pin => ({ pin, seatName: householdSeatName(pin, dominions) }));
  const titles = new Map();
  for (const { seatName } of places) titles.set(normalizePlace(seatName), (titles.get(normalizePlace(seatName)) || 0) + 1);
  return places.filter(({ pin }) => (editMode || !pin.secret) && (filter === 'all' || pin.cat === filter)
      && Number.isFinite(pin.x) && Number.isFinite(pin.y) && pin.x >= 0 && pin.x <= 1 && pin.y >= 0 && pin.y <= 1)
    .map(({ pin, seatName }) => ({ pin, families: residentsForPin(pin, map, index, { seatName, uniqueTitle: titles.get(normalizePlace(seatName)) === 1 }) }))
    .filter(group => group.families.length);
}
