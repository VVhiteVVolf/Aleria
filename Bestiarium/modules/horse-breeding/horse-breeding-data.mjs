import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parsePrice } from '../../../AleriaAlmanach/modules/item-register/item-register-money.js';
import {
  extractRossmarktBreedingCrossings,
  extractRossmarktEntries
} from '../../../AleriaAlmanach/scripts/source-pages/rossmarkt-source.mjs';
import { horsePairKey } from './horse-breeding-model.mjs';
import {
  HORSE_BREEDING_BREEDS,
  HORSE_BREEDING_CROSS_ENRICHMENTS,
  HORSE_BREEDING_LORE_CROSSINGS
} from './horse-breeding-registry.mjs';

const normalizeName = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('de-DE')
  .replace(/[^a-z0-9]+/g, '');

function parseAgeRange(label) {
  const values = [...String(label || '').matchAll(/\d+/g)].map(match => Number(match[0]));
  assert(values.length >= 1, `Lebensspanne fehlt: ${label}`);
  const minimum = values[0];
  const maximum = values[1] ?? values[0];
  assert(minimum > 0 && maximum >= minimum, `Lebensspanne ist ungültig: ${label}`);
  return [minimum, maximum];
}

function createCrossing(entry, enrichment = {}) {
  return {
    mareId: entry.mareId,
    sireId: entry.sireId,
    name: entry.name,
    source: entry.source,
    note: entry.note || enrichment.note || '',
    establishedBreed: entry.establishedBreed || enrichment.establishedBreed || ''
  };
}

export async function loadHorseBreedingData() {
  const rossmarktHtml = await readFile(new URL('../../../Markt/Rossmarkt/Rossmarkt.html', import.meta.url), 'utf8');
  const marketEntries = extractRossmarktEntries(rossmarktHtml)
    .filter(entry => entry.section === 'roesser' || entry.section === 'ponys');
  const marketById = new Map(marketEntries.map(entry => [entry.id, entry]));

  const breeds = await Promise.all(HORSE_BREEDING_BREEDS.map(async registryEntry => {
    const profileUrl = new URL(`../../tiere/pferde/${registryEntry.id}/profil.json`, import.meta.url);
    const profile = JSON.parse(await readFile(profileUrl, 'utf8'));
    const market = marketById.get(registryEntry.rossmarktId);
    assert(market, `Rossmarkt-Rasse fehlt: ${registryEntry.rossmarktId}`);
    assert(profile.performance?.values?.length === 6, `Rossmarktwerte fehlen: ${registryEntry.id}`);
    const priceRange = parsePrice(market.price, market.currency);
    assert(priceRange, `Rossmarktpreis ist nicht lesbar: ${registryEntry.id}`);

    return {
      id: registryEntry.id,
      rossmarktId: registryEntry.rossmarktId,
      name: profile.name,
      continent: profile.continent,
      region: profile.region,
      summary: profile.summary,
      stats: profile.performance.values,
      statLabels: profile.performance.labels,
      ageRange: parseAgeRange(profile.market.age),
      ageLabel: profile.market.age,
      priceRange,
      profileHref: `../${registryEntry.id}/index.html`,
      image: profile.hero
    };
  }));

  const profileIdByMarketName = new Map();
  for (const registryEntry of HORSE_BREEDING_BREEDS) {
    const market = marketById.get(registryEntry.rossmarktId);
    profileIdByMarketName.set(normalizeName(market.name), registryEntry.id);
    profileIdByMarketName.set(normalizeName(registryEntry.rossmarktId), registryEntry.id);
  }

  const rossmarktCrossings = extractRossmarktBreedingCrossings(rossmarktHtml).map(entry => ({
    mareId: profileIdByMarketName.get(normalizeName(entry.mare)),
    sireId: profileIdByMarketName.get(normalizeName(entry.sire)),
    name: entry.name,
    source: entry.source
  }));
  const rawCrossings = [...rossmarktCrossings, ...HORSE_BREEDING_LORE_CROSSINGS];
  const crossings = rawCrossings.map(entry => {
    assert(entry.mareId && entry.sireId, `Kreuzung kann keiner Rasse zugeordnet werden: ${entry.name}`);
    const key = horsePairKey(entry.mareId, entry.sireId);
    return createCrossing(entry, HORSE_BREEDING_CROSS_ENRICHMENTS[key]);
  });

  assert.equal(breeds.length, 27, 'Das Zuchtbuch benötigt alle 27 Rossmarkt-Rassen');
  assert.equal(crossings.length, 7, 'Die sieben bisher benannten Kreuzungen sind unvollständig');
  assert.equal(new Set(crossings.map(entry => horsePairKey(entry.mareId, entry.sireId))).size, crossings.length, 'Doppelte benannte Kreuzung');

  return {
    generatedFrom: ['Markt/Rossmarkt/Rossmarkt.html', 'Bestiarium/tiere/pferde/*/profil.json'],
    breeds,
    crossings
  };
}
