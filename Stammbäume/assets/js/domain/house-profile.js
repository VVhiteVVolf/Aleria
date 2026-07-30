// Rangfolge in Cenyr: König > Graf > Baron > Ritterfürst > Ritterherr > einfacher Ritter > Bürger.
// Albische Clans (Crannath) verwenden eigene Titel: Laird=Ritterfürst, Dún Tiarna=Baron,
// Mor Tiarna=Graf, Ard Tiarna=Herzog/Fürst, Ri Tiarna=König/Kaiser. Die verdrahteten
// albischen Titel teilen sich jeweils die Rangstufe ihres Cenyr-Äquivalents.
// Rangstufe (order) ihres Cenyr-Äquivalents.
const RANK_DEFINITIONS = Object.freeze({
  unknown: Object.freeze({ id: 'unknown', label: 'Nicht vermerkt', order: 99 }),
  royal: Object.freeze({ id: 'royal', label: 'Königsgeschlecht', order: 10 }),
  patrician: Object.freeze({ id: 'patrician', label: 'Patrizierhaus', order: 15 }),
  ducal: Object.freeze({ id: 'ducal', label: 'Herzogsgeschlecht', order: 20 }),
  county: Object.freeze({ id: 'county', label: 'Grafengeschlecht', order: 30 }),
  'mor-tiarna': Object.freeze({ id: 'mor-tiarna', label: 'Mór Tiarna (Graf)', order: 30 }),
  barony: Object.freeze({ id: 'barony', label: 'Baronengeschlecht', order: 40 }),
  'dun-tiarna': Object.freeze({ id: 'dun-tiarna', label: 'Dún Tiarna (Baron)', order: 40 }),
  'ard-tiarna': Object.freeze({ id: 'ard-tiarna', label: 'Ard Tiarna (Herzog/Fürst)', order: 20 }),
  'knight-prince': Object.freeze({ id: 'knight-prince', label: 'Ritterfürstengeschlecht', order: 50 }),
  knight: Object.freeze({ id: 'knight', label: 'Niederes Rittergeschlecht', order: 60 }),
  magnarian: Object.freeze({ id: 'magnarian', label: 'Magnarierhaus', order: 60 }),
  'knight-simple': Object.freeze({ id: 'knight-simple', label: 'Einfache Ritterfamilie', order: 70 }),
  commoner: Object.freeze({ id: 'commoner', label: 'Bürgerfamilie', order: 80 }),
  mercantian: Object.freeze({ id: 'mercantian', label: 'Mercantierhaus', order: 80 }),
  plebeian: Object.freeze({ id: 'plebeian', label: 'Plebejerfamilie', order: 90 })
});

export const HOUSE_RANKS = RANK_DEFINITIONS;

// Stand-Icons zeigen den Rang eines Hauses; nicht jeder Rang hat bislang ein eigenes Icon.
const RANK_ICONS = Object.freeze({
  county: 'assets/images/ranks/graf.png',
  'mor-tiarna': 'assets/images/ranks/graf.png',
  barony: 'assets/images/ranks/baron.png',
  // Kein eigenes Albisch-Icon vorhanden; teilt sich das Baron-Icon der gleichen Rangstufe.
  'dun-tiarna': 'assets/images/ranks/baron.png',
  'knight-prince': 'assets/images/ranks/ritterfuerst.png',
  knight: 'assets/images/ranks/ritterherr.png',
  'knight-simple': 'assets/images/ranks/ritter.png',
  // Platzhalter, bis ein eigenes Bürgerlich-Icon vorliegt.
  commoner: 'assets/images/ranks/page.png'
});

export function getHouseRankIcon(rankId) {
  return RANK_ICONS[getHouseRank(rankId).id] || '';
}

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
  const venalysRank = ['patrician', 'magnarian', 'mercantian', 'plebeian'].includes(normalized.rankId);
  const labels = venalysRank
    ? {
        seat: 'Sitz',
        barony: 'Stadtbezirk',
        county: 'Region',
        kingdom: 'Stadtrepublik',
        secondarySeats: 'Weitere Sitze',
        liegeHouse: 'Patrizierhaus'
      }
    : {
        seat: 'Stammsitz',
        barony: 'Baronie',
        county: 'Grafschaft',
        kingdom: 'Königreich',
        secondarySeats: 'Weitere Sitze',
        liegeHouse: 'Lehnshaus'
      };
  const location = [
    normalized.seat ? `${labels.seat}: ${normalized.seat}` : '',
    normalized.barony ? `${labels.barony}: ${normalized.barony}` : '',
    normalized.county ? `${labels.county}: ${normalized.county}` : '',
    normalized.kingdom ? `${labels.kingdom}: ${normalized.kingdom}` : '',
    normalized.secondarySeats.length ? `${labels.secondarySeats}: ${normalized.secondarySeats.join(', ')}` : '',
    normalized.liegeHouseName ? `${labels.liegeHouse}: ${normalized.liegeHouseName}` : ''
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
