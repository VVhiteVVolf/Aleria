export const HORSE_STAT_LABELS = Object.freeze([
  'Schnelligkeit',
  'Ausdauer',
  'Stärke',
  'Agilität',
  'Sozialverhalten',
  'Robustheit'
]);

const TRAIT_LABELS = Object.freeze([
  ['Blitzschnell', 'Träge'],
  ['Ausdauernd', 'Kurzatmig'],
  ['Kräftig', 'Schwächlich'],
  ['Wendig', 'Schwerfällig'],
  ['Sanftmütig', 'Schwierig'],
  ['Zäh', 'Empfindlich']
]);

const clampStat = value => Math.max(1, Math.min(10, Math.round(value)));
const average = values => values.reduce((sum, value) => sum + value, 0) / values.length;

export function horsePairKey(firstId, secondId) {
  if (!firstId || !secondId || firstId === secondId) return '';
  return [String(firstId), String(secondId)].sort((left, right) => left.localeCompare(right, 'de')).join('|');
}

export function indexHorseCrossings(crossings) {
  return new Map(crossings.map(crossing => [horsePairKey(crossing.mareId, crossing.sireId), crossing]));
}

const normalizeLegacyBreedName = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('de-DE')
  .replace(/[^a-z0-9]+/g, '');

export function normalizeLegacyHorseCrossings(value, breeds) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const breedIdByName = new Map();
  for (const breed of breeds) {
    [breed.id, breed.rossmarktId, breed.name].filter(Boolean).forEach(name => {
      breedIdByName.set(normalizeLegacyBreedName(name), breed.id);
    });
  }
  const migrated = {};
  for (const [legacyPair, legacyName] of Object.entries(value)) {
    const [firstName, secondName, ...remainder] = legacyPair.split('|');
    if (remainder.length || !firstName || !secondName) continue;
    const firstId = breedIdByName.get(normalizeLegacyBreedName(firstName));
    const secondId = breedIdByName.get(normalizeLegacyBreedName(secondName));
    const pairKey = horsePairKey(firstId, secondId);
    const name = String(legacyName || '').trim().slice(0, 80);
    if (pairKey && name && !migrated[pairKey]) migrated[pairKey] = name;
  }
  return migrated;
}

export function expectedFoalStats(mare, sire) {
  return HORSE_STAT_LABELS.map((_, index) => Number(((mare.stats[index] + sire.stats[index]) / 2).toFixed(1)));
}

export function rollFoalStats(mare, sire, random = Math.random) {
  const expected = expectedFoalStats(mare, sire);
  const stats = expected.map(value => clampStat(value + (random() * 2 - 1) + (random() * 2 - 1)));
  const talentRoll = random();
  const talentIndex = talentRoll < 0.05 ? Math.floor(random() * HORSE_STAT_LABELS.length) : -1;
  if (talentIndex >= 0 && stats[talentIndex] < 10) stats[talentIndex] += 1;
  return { expected, stats, talentIndex };
}

export function deriveFoalTraits(stats) {
  const traits = [];
  stats.forEach((value, index) => {
    if (value >= 9) traits.push({ label: TRAIT_LABELS[index][0], tone: 'strong' });
    if (value <= 2) traits.push({ label: TRAIT_LABELS[index][1], tone: 'weak' });
  });
  const totalAverage = average(stats);
  if (totalAverage >= 8) traits.unshift({ label: 'Außerordentlich', tone: 'strong' });
  else if (totalAverage >= 7) traits.unshift({ label: 'Überdurchschnittlich', tone: 'strong' });
  else if (totalAverage <= 3) traits.unshift({ label: 'Unterdurchschnittlich', tone: 'weak' });
  return traits.length ? traits : [{ label: 'Ausgeglichen', tone: 'neutral' }];
}

function averageAgeRange(mare, sire) {
  const minimum = Math.round((mare.ageRange[0] + sire.ageRange[0]) / 2);
  const maximum = Math.round((mare.ageRange[1] + sire.ageRange[1]) / 2);
  return { minimum, maximum, label: `${minimum}–${maximum} Jahre` };
}

function estimatePriceRange(mare, sire, stats) {
  const baseMinimum = Math.round(Math.sqrt(mare.priceRange.minCopper * sire.priceRange.minCopper));
  const baseMaximum = Math.round(Math.sqrt(mare.priceRange.maxCopper * sire.priceRange.maxCopper));
  const parentAverage = (average(mare.stats) + average(sire.stats)) / 2;
  const qualityRatio = average(stats) / parentAverage;
  const minimum = Math.max(50, Math.round(baseMinimum * qualityRatio * 0.6 / 50) * 50);
  const maximum = Math.max(minimum + 100, Math.round(baseMaximum * qualityRatio * 0.85 / 50) * 50);
  const quality = qualityRatio >= 1.15
    ? 'Überdurchschnittlich'
    : qualityRatio >= 0.95
      ? 'Rassentypisch'
      : qualityRatio >= 0.8
        ? 'Leicht unterdurchschnittlich'
        : 'Unterdurchschnittlich';
  return { minCopper: minimum, maxCopper: maximum, quality, qualityRatio };
}

export function calculateFoal(mare, sire, { random = Math.random, crossing = null } = {}) {
  if (!mare || !sire) throw new TypeError('Stute und Hengst müssen gewählt werden.');
  if (mare.id === sire.id) throw new RangeError('Für eine Kreuzung werden zwei verschiedene Rassen benötigt.');
  if (mare.stats.length !== HORSE_STAT_LABELS.length || sire.stats.length !== HORSE_STAT_LABELS.length) {
    throw new RangeError('Beide Rassen benötigen sechs Rossmarktwerte.');
  }
  const rolled = rollFoalStats(mare, sire, random);
  return {
    mareId: mare.id,
    sireId: sire.id,
    pairKey: horsePairKey(mare.id, sire.id),
    crossing,
    expectedStats: rolled.expected,
    stats: rolled.stats,
    talentIndex: rolled.talentIndex,
    traits: deriveFoalTraits(rolled.stats),
    lifespan: averageAgeRange(mare, sire),
    priceRange: estimatePriceRange(mare, sire, rolled.stats)
  };
}

export function formatHorseCurrency(copper) {
  const amount = Number(copper);
  if (!Number.isFinite(amount)) return '???';
  if (amount >= 1000) return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(amount / 1000)} G`;
  if (amount >= 100) return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(amount / 100)} S`;
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(amount)} K`;
}
