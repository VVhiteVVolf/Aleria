function nonEmptyText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

const NEUTRAL_CREST = 'assets/images/placeholders/neutral-crest.png';

function hasIndividualEmblem(emblem) {
  return Boolean(emblem && emblem !== NEUTRAL_CREST);
}

function rememberHouse(index, house, { primary = false } = {}) {
  const houseId = nonEmptyText(house?.id);
  if (!houseId) return;
  const previous = index.get(houseId);
  const emblem = nonEmptyText(house?.emblem);
  const shouldReplaceEmblem = hasIndividualEmblem(emblem)
    && (primary || !hasIndividualEmblem(previous?.emblem));
  index.set(houseId, Object.freeze({
    id: houseId,
    name: primary
      ? nonEmptyText(house?.name) || previous?.name || ''
      : previous?.name || nonEmptyText(house?.name),
    emblem: shouldReplaceEmblem ? emblem : previous?.emblem || emblem,
    status: nonEmptyText(house?.status) || previous?.status || 'active'
  }));
}

function rememberFamilyHouses(index, family) {
  (family?.houses || []).forEach(house => {
    rememberHouse(index, house);
  });
}

function rememberPrimaryHouse(index, family) {
  const houseId = nonEmptyText(family?.lineage?.houseId);
  if (!houseId) return;
  const house = (family.houses || []).find(entry => entry.id === houseId);
  rememberHouse(index, {
    ...house,
    id: houseId,
    name: house?.name || family?.document?.title || '',
    emblem: family?.document?.emblem || house?.emblem || ''
  }, { primary: true });
}

/**
 * Builds the canonical house lookup used by family charts. A family's own
 * document data wins over incidental copies in other trees. An actual crest
 * also always wins over a neutral placeholder, even if an older primary record
 * still contains that placeholder.
 */
export function buildRegisteredHouseIndex(records = []) {
  const index = new Map();
  const families = records.map(record => record?.family).filter(Boolean);
  families.forEach(family => rememberFamilyHouses(index, family));
  families.forEach(family => rememberPrimaryHouse(index, family));
  return index;
}

export function buildRegisteredHouseEmblemIndex(records = []) {
  return new Map([...buildRegisteredHouseIndex(records)]
    .filter(([, house]) => house.emblem)
    .map(([houseId, house]) => [houseId, house.emblem]));
}
