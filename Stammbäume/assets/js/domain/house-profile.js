// Rangfolge in Cenyr: König > Graf > Baron > Ritterfürst > Ritterherr > einfacher Ritter > Bürger.
const RANK_DEFINITIONS = Object.freeze({
  unknown: Object.freeze({ id: 'unknown', label: 'Nicht vermerkt', order: 99 }),
  royal: Object.freeze({ id: 'royal', label: 'Königsgeschlecht', order: 10 }),
  ducal: Object.freeze({ id: 'ducal', label: 'Herzogsgeschlecht', order: 20 }),
  county: Object.freeze({ id: 'county', label: 'Grafengeschlecht', order: 30 }),
  barony: Object.freeze({ id: 'barony', label: 'Baronengeschlecht', order: 40 }),
  'knight-prince': Object.freeze({ id: 'knight-prince', label: 'Ritterfürstengeschlecht', order: 50 }),
  knight: Object.freeze({ id: 'knight', label: 'Niederes Rittergeschlecht', order: 60 }),
  'knight-simple': Object.freeze({ id: 'knight-simple', label: 'Einfache Ritterfamilie', order: 70 }),
  commoner: Object.freeze({ id: 'commoner', label: 'Bürgerfamilie', order: 80 })
});

export const HOUSE_RANKS = RANK_DEFINITIONS;

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeRegionEmblems(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    seat: cleanText(source.seat),
    barony: cleanText(source.barony),
    county: cleanText(source.county),
    kingdom: cleanText(source.kingdom)
  };
}

function normalizeTextList(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map(cleanText)
    .filter(Boolean))];
}

export function listHouseRanks() {
  return Object.values(RANK_DEFINITIONS).sort((first, second) => first.order - second.order);
}

export function getHouseRank(rankId) {
  return RANK_DEFINITIONS[rankId] || RANK_DEFINITIONS.unknown;
}

export function normalizeHouseProfile(profile = {}) {
  const source = profile && typeof profile === 'object' ? profile : {};
  return {
    rankId: getHouseRank(cleanText(source.rankId)).id,
    seat: cleanText(source.seat),
    barony: cleanText(source.barony),
    county: cleanText(source.county),
    kingdom: cleanText(source.kingdom),
    secondarySeats: normalizeTextList(source.secondarySeats),
    liegeHouseId: cleanText(source.liegeHouseId),
    liegeHouseName: cleanText(source.liegeHouseName),
    regionEmblems: normalizeRegionEmblems(source.regionEmblems)
  };
}

export function createHouseProfileFromFolderPath(folderPath = [], overrides = {}) {
  const path = Array.isArray(folderPath) ? folderPath.map(cleanText).filter(Boolean) : [];
  const current = normalizeHouseProfile(overrides);
  const nextKingdom = path[0] || current.kingdom;
  const nextCounty = path[1] || current.county;
  const nextBarony = path[2] || current.barony;
  return normalizeHouseProfile({
    ...current,
    kingdom: nextKingdom,
    county: nextCounty,
    barony: nextBarony,
    seat: path[3] || current.seat,
    regionEmblems: {
      seat: current.seat && current.seat !== (path[3] || current.seat) ? '' : current.regionEmblems.seat,
      kingdom: current.kingdom && current.kingdom !== nextKingdom ? '' : current.regionEmblems.kingdom,
      county: current.county && current.county !== nextCounty ? '' : current.regionEmblems.county,
      barony: current.barony && current.barony !== nextBarony ? '' : current.regionEmblems.barony
    }
  });
}

export function createFolderPathFromHouseProfile(profile = {}) {
  const normalized = normalizeHouseProfile(profile);
  return [normalized.kingdom, normalized.county, normalized.barony, normalized.seat].filter(Boolean);
}

export function isHouseProfileEmpty(profile = {}) {
  const normalized = normalizeHouseProfile(profile);
  return normalized.rankId === 'unknown'
    && !normalized.seat
    && !normalized.barony
    && !normalized.county
    && !normalized.kingdom
    && !normalized.secondarySeats.length
    && !normalized.liegeHouseId
    && !normalized.liegeHouseName;
}

export function formatHouseProfile(profile = {}, separator = ' · ') {
  const normalized = normalizeHouseProfile(profile);
  const location = [
    normalized.seat ? `Stammsitz: ${normalized.seat}` : '',
    normalized.barony ? `Baronie: ${normalized.barony}` : '',
    normalized.county ? `Grafschaft: ${normalized.county}` : '',
    normalized.kingdom ? `Königreich: ${normalized.kingdom}` : '',
    normalized.secondarySeats.length ? `Weitere Sitze: ${normalized.secondarySeats.join(', ')}` : '',
    normalized.liegeHouseName ? `Lehnshaus: ${normalized.liegeHouseName}` : ''
  ].filter(Boolean);
  const rank = getHouseRank(normalized.rankId);
  return [rank.id === 'unknown' ? '' : rank.label, ...location].filter(Boolean).join(separator);
}

export function getHouseProfileSearchTerms(profile = {}) {
  const normalized = normalizeHouseProfile(profile);
  return [
    getHouseRank(normalized.rankId).label,
    normalized.seat,
    normalized.barony,
    normalized.county,
    normalized.kingdom,
    ...normalized.secondarySeats,
    normalized.liegeHouseName
  ].filter(Boolean);
}
