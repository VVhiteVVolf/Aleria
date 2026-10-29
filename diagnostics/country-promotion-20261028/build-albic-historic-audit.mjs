import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const outputDirectory = path.join(root, 'diagnostics/country-promotion-20261028');
const registryDirectory = fs.readdirSync(root).find(name => name.startsWith('Stammb'));
const { FAMILY_REGISTRY } = await import(pathToFileURL(path.join(root, registryDirectory, 'assets/js/data/families.registry.js')));
const occupation = await import(pathToFileURL(path.join(root, 'Vorschau/shared/lothir-occupation.mjs')));
const toRelative = filename => path.relative(root, filename).replaceAll('\\', '/');
const digest = filename => crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
const resource = filename => {
  const absolute = path.resolve(root, filename);
  const exists = fs.existsSync(absolute);
  return { path: toRelative(absolute), exists, ...(exists ? { bytes: fs.statSync(absolute).size, sha256: digest(absolute) } : {}) };
};
const referencedHouses = id => FAMILY_REGISTRY.flatMap(record => {
  const house = Object.values(record.family?.houses ?? {}).find(candidate => candidate.id === `house-${id}`);
  if (!house) return [];
  const personReferences = Object.values(record.family?.persons ?? {}).filter(person => person.houseId === house.id).length;
  return [{ familyId: record.id, familyTitle: record.title, houseId: house.id, houseName: house.name,
    emblem: house.emblem || null, personReferenceCount: personReferences,
    primaryFamily: record.family?.lineage?.houseId === house.id || record.family?.document?.primaryHouseId === house.id || record.id === `haus-${id}`,
    familyHref: `Stammbäume/Stammbaum.html?family=${encodeURIComponent(record.id)}&mode=view` }];
});

const moNames = {
  adruinna: 'Nic Adruinna', kerlaouen: 'Nic Kerlaouen', caddach: 'Ard Caddach', rowak: 'Mac Rowak',
  barrex: 'An Barrex', cethrenn: 'Tir An Cethrenn', damona: 'Dál Damona', avernax: 'Ard Avernax',
  brigantex: 'Ua Brigantex', keravel: 'Na Keravel', nemetex: 'Ord Nemetex',
};
const ranks = {
  Moinneach: {
    cethrenn: { rank: 'Fürst', evidence: 'Explicit user correction; princely house in Gergonax.' },
    barrex: { rank: 'Laird', evidence: 'Explicit user correction; shares Gergonax with princely clan.' },
  },
  Iathneach: {
    cetchathach: { rank: 'Fürst', evidence: 'Explicit user correction and existing house-data role.' },
    deaghaide: { rank: 'Laird', cadetBranchOf: 'cetchathach', evidence: 'The export places Ua Deaghaide as the only other clan in Botharin; user identifies that clan as the princely cadet clan. No founder or genealogy inferred.' },
    farraigeach: { rank: 'Mor Tiarna', historicalRank: true, evidence: 'Existing source role: former Mor Tiarna of Cuansioda; current refuge seat Sgeir Tearmainn. Do not downgrade solely because present seat is an island.' },
  },
  Deitheach: {
    'ard-roth': { rank: 'Fürst', historicalRank: true, evidence: 'Explicit user correction; Lann Ailseag and princely Mor Tiarnatum.' },
    neill: { rank: 'Mor Tiarna', historicalRank: true, evidence: 'Only clan at Braigh Beartain, own Dun and principal seat of Sliabh Dorrain.' },
    caolan: { rank: 'Mor Tiarna', historicalRank: true, evidence: 'User names Nic Caolan ruler of Srath Dreasail; own Dun and principal seat of Coill Fhasgair.' },
    duach: { rank: 'Mor Tiarna', historicalRank: true, evidence: 'Only clan at Gleann Carthain, own Dun and principal seat of Magh Eirceann.' },
    ardmhair: { rank: 'Laird', historicalRank: true, evidence: 'Only clan at Coire Uamhar; explicit Lairdtum.' },
    trodach: { rank: 'Laird', historicalRank: true, evidence: 'Only clan at Bealach Sceolan; explicit Lairdtum.' },
    torcmhar: { rank: 'Laird', historicalRank: true, evidence: 'Only clan at Rinn Loscarn; explicit Lairdtum.' },
    snaith: { rank: 'Laird', historicalRank: true, evidence: 'Export places only clan at Cladach Muirdean; explicit Lairdtum.' },
    drisach: { rank: 'Laird', historicalRank: true, evidence: 'User says other clans in Lann Ailseag were Lairds.' },
    tuairne: { rank: 'Dun Tiarna', historicalRank: true, evidence: 'Export places only clan at Achadh Orsagail; explicit Dun Tiarnatum distinct from Mor-Tiarna-own Dun.' },
    seilgair: { rank: 'Laird', historicalRank: true, evidence: 'Explicit user correction; the other clan in Srath Dreasail.' },
    eatharn: { rank: 'Laird', historicalRank: true, evidence: 'User says other clans in Lann Ailseag were Lairds.' },
  },
  Triarchie: {
    taghan: { rank: 'Dun Tiarna', evidence: 'Single clan at Dorchain; explicit Dún Tiarnatum, within formerly Iathneacher Cuansioda.' },
    guilbneach: { rank: 'Laird', evidence: 'Single clan at Fiorail; explicit Lairdtum.' },
    coilleach: { rank: 'Laird', evidence: 'Single clan at Doire Fionn; explicit Lairdtum.' },
    hammerstein: { rank: 'Baron', evidence: 'Single house at Wernheim; explicit Baronie.' },
    segelbrecht: { rank: 'Baron', evidence: 'Single house at Erlensund; explicit Baronie.' },
    riemann: { rank: 'Ritterherr', evidence: 'Single house at Segelwacht; explicit Herrschaft.' },
    steinmetz: { rank: 'Baron', evidence: 'Single house at Hammertal; explicit Baronie.' },
    hufschlag: { rank: 'Graf', evidence: 'Single house at Rottendorf; explicit gräfliche Baronie and principal seat of Wernmark.' },
    stahlwart: { rank: 'Baron', evidence: 'Single house at Dornheim; explicit Baronie.' },
    reiff: { rank: 'Baron', evidence: 'Single house at Rothen; explicit Baronie.' },
    sattler: { rank: 'Graf', evidence: 'Single house at Hohenreede; explicit gräfliche Baronie and principal seat of county Hohenreede.' },
  },
};

const report = {
  schemaVersion: 1,
  createdDate: '2026-10-28',
  scope: 'Bounded public-source audit only; no production or Firebase mutations, no generated art, no private character data or new genealogy.',
  instructionSources: ['AGENTS.md', 'Vorschau/COUNTRY_PREPARATION_TEMPLATE.md', 'Kontinente/AGENTS.md', 'Kontinente/HERRSCHAFTSSEITEN-VORGEHEN.md'],
  precedence: 'Latest user corrections and accepted JSON exports supersede earlier draft/reset defaults. Stable preview IDs and referenced house IDs must survive visible renaming.',
  countries: {},
  issues: [
    { id: 'moinneach-variant-number', severity: 'note', finding: 'Variante 1 is number 1, id original, ten separate city territories. alternative-1 is number 2 and has three regions. Do not confuse the visible variant number with the suffix of alternative-1.' },
    { id: 'rank-evidence-moinneach', severity: 'source-gap', finding: 'Except Cethrenn and Barrex, no Moinneach rank or liege is encoded. The chosen original map identifies ten separate city territories, but no Mor/Dun/Laird labels. Existing README explicitly refrains from inferring ranks from colors or city size. Latest explicit instruction may authorize a rank policy, but the source audit does not supply a distinction.' },
    { id: 'rank-evidence-iathneach', severity: 'source-gap', finding: 'Iathneach has four colors, two seats per region, and no internal boundaries or Mor/Dun/Laird marks. Apart from princely Botharin, Ua Deaghaide correction and historical Mac Farraigeach, county principal/subordinate seats are not identified in sources. Do not silently turn the first array member into Mor Tiarna.' },
    { id: 'deitheach-spelling', severity: 'note', finding: 'Stable id seilgair currently displays Ruin Seilgair. Parent task spells Ruin Seilgeir. Preserve id; treat any requested spelling update as visible-name-only.' },
    { id: 'related-source-placeholder-ids', severity: 'important', finding: 'Several clans already occur as house-<id> placeholders inside other public families. Apart from the distinct Ard Trodach collision noted below, none has a primary family record in the current FAMILY_REGISTRY. Reconcile compatible counterpart IDs and placeholder metadata; do not create duplicate people or turn secondary appearances into a primary family.' },
    { id: 'droch-vs-ard-trodach', severity: 'identity-collision', finding: 'Deitheach Droch Trodach (stable preview id trodach) is not Leitheach Ard Trodach. Existing canonical house-trodach is the latter, with primary family haus-ard-trodach and its own genealogy. The qualified clans must remain distinct. Preserve preview id trodach, introduce an explicit canonical adapter for Droch Trodach, and leave all Ard Trodach people and crosslinks unchanged.' },
    { id: 'old-draft-language', severity: 'expected-change', finding: 'Current context/README/reset labels still describe unassigned clans and proposals; accepted exports now fill all placements. Promote content deliberately rather than publishing those outdated draft assertions as current facts.' },
  ],
};

for (const country of ['Moinneach', 'Iathneach', 'Deitheach', 'Triarchie']) {
  const base = `Vorschau/${country}`;
  const directory = path.join(root, base);
  const importLocal = name => import(pathToFileURL(path.join(directory, name)));
  const { warriors } = await importLocal('warrior-data.mjs');
  let houses, settlements, counties, territoryArt, context, exportRecord = null;
  if (country === 'Moinneach') {
    const { sourceProposals } = await importLocal('proposal-data.mjs');
    const selected = sourceProposals.find(proposal => proposal.number === 1);
    houses = selected.clans.map(clan => ({ ...clan, crest: `assets/${clan.crest}`, fullsize: `assets/${clan.crest}`, sourceSeat: clan.seat }));
    settlements = selected.settlements;
    counties = selected.regions;
    territoryArt = selected.regions.map(region => ({ id: region.id, name: region.label, image: region.design.banner, kind: 'Stadtgebiet' }));
    context = { geography: 'Unwirtliches Sumpfland, Mangroven, Pilze; gallisch-keltischer Kulturauftrag, begrenztes Metall.', capital: 'gergonax' };
    report.countries[country] = {
      selectedVariant: { id: selected.id, number: selected.number, label: selected.label, regionCount: selected.regions.length },
      alternatives: sourceProposals.map(proposal => ({ id: proposal.id, number: proposal.number, regions: proposal.regions.length })),
      seatSwap: { before: { barrex: 'tarvex', cethrenn: 'tarvex', rowak: 'gergonax' }, after: { barrex: 'gergonax', cethrenn: 'gergonax', rowak: 'tarvex' } },
    };
  } else {
    ({ houses } = await importLocal('house-data.mjs'));
    ({ settlements, counties, territoryArt } = await importLocal('territory-data.mjs'));
    ({ context } = await importLocal('realm-context.mjs'));
    const exportPath = `C:/Users/fhg_r/Downloads/${country.toLowerCase()}-entwurf.json`;
    exportRecord = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    report.countries[country] = { acceptedExport: { path: exportPath, sha256: digest(exportPath), schemaVersion: exportRecord.schemaVersion, realm: exportRecord.realm, placements: exportRecord.placements } };
  }
  const target = report.countries[country];
  const seatFor = house => country === 'Moinneach'
    ? target.seatSwap.after[house.id] ?? house.sourceSeat
    : exportRecord.placements[house.id];
  target.counts = { houses: houses.length, settlements: settlements.length, regions: counties.length, territoryImages: territoryArt.length, warriors: warriors.length };
  target.context = context;
  target.sources = ['warrior-data.mjs', ...(country === 'Moinneach'
    ? ['proposal-data.mjs', 'regional-designs.mjs', 'warrior-art-direction.mjs', 'README.md']
    : ['house-data.mjs', 'territory-data.mjs', 'realm-context.mjs', 'source-import.json', 'README.md'])]
    .filter(filename => fs.existsSync(path.join(directory, filename))).map(filename => resource(`${base}/${filename}`));
  target.counties = counties;
  target.settlements = settlements.map(settlement => ({ ...settlement, assignedHouseIds: houses.filter(house => seatFor(house) === settlement.id).map(house => house.id) }));
  target.territoryArt = territoryArt.map(art => ({ ...art, imageResource: resource(`${base}/${art.image}`), ...(art.fullsize ? { fullsizeResource: resource(`${base}/${art.fullsize}`) } : {}) }));
  target.houses = houses.map(house => {
    const warrior = warriors.find(candidate => candidate.id === house.id);
    const seat = seatFor(house);
    const references = referencedHouses(house.id);
    const identityCollision = country === 'Deitheach' && house.id === 'trodach';
    return {
      ...house,
      stablePreviewId: house.id,
      existingCounterpartHouseId: references.length && !identityCollision ? `house-${house.id}` : null,
      identityStatus: identityCollision ? 'distinct-qualified-clan-collides-with-existing-slug' : references.length ? 'generic-counterpart-id-found' : 'no-existing-counterpart-id-found',
      visibleName: country === 'Moinneach' ? moNames[house.id] : house.name,
      acceptedSeatId: seat,
      acceptedSettlement: settlements.find(settlement => settlement.id === seat)?.name ?? null,
      acceptedRegion: settlements.find(settlement => settlement.id === seat)?.regionName ?? null,
      rankDecision: ranks[country][house.id] ?? { rank: null, evidence: 'Not distinguished by current public source; see source-gap issue.' },
      primaryFamilyRecords: identityCollision ? [] : references.filter(reference => reference.primaryFamily).map(reference => reference.familyId),
      unrelatedPrimaryFamilyRecords: identityCollision ? references.filter(reference => reference.primaryFamily).map(reference => reference.familyId) : [],
      publicCounterpartReferences: references,
      crestResource: resource(`${base}/${house.crest}`),
      fullsizeResource: resource(`${base}/${house.fullsize}`),
      warrior: { ...warrior, imageResource: resource(`${base}/${warrior.image}`), fullsizeResource: resource(`${base}/${warrior.fullsize}`),
        classResource: resource(country === 'Moinneach' ? 'Klassenordner/Klassenseite.html' : path.join(base, warrior.classHref).split('#')[0]),
        ...(warrior.creatureHref ? { creatureResource: resource(path.join(base, warrior.creatureHref)) } : {}) },
      recommendedContentCorrections: country === 'Moinneach' && ['barrex', 'cethrenn', 'rowak'].includes(house.id)
        ? ['Update seat-related warrior resourceBasis prose after the Gergonax/Tarvex swap; reuse existing art unchanged.'] : [],
    };
  });
  const assetResources = [...target.territoryArt.flatMap(art => [art.imageResource, art.fullsizeResource].filter(Boolean)),
    ...target.houses.flatMap(house => [house.crestResource, house.fullsizeResource, house.warrior.imageResource, house.warrior.fullsizeResource, house.warrior.classResource, house.warrior.creatureResource].filter(Boolean))];
  target.validation = {
    uniqueHouseIds: new Set(houses.map(house => house.id)).size === houses.length,
    uniqueSettlementIds: new Set(settlements.map(settlement => settlement.id)).size === settlements.length,
    allAcceptedSeatsExist: houses.every(house => settlements.some(settlement => settlement.id === seatFor(house))),
    acceptedExportExactCoverage: !exportRecord || Object.keys(exportRecord.placements).length === houses.length && Object.keys(exportRecord.placements).every(id => houses.some(house => house.id === id)),
    allHousesHaveWarrior: houses.every(house => warriors.some(warrior => warrior.id === house.id)),
    checkedAssetCount: assetResources.length,
    missingAssets: assetResources.filter(asset => !asset.exists),
  };
}

report.historicalTopology = {
  source: resource('Vorschau/shared/lothir-occupation.mjs'),
  houseSource: resource('Vorschau/shared/lothir-occupation-houses.mjs'),
  principle: 'Historic homeland membership and present occupation are independent. The Triarchie is an occupier; no allegiance edge to native families follows from present control.',
  countries: {
    iathneach: { freeRegionIds: report.countries.Iathneach.counties.map(county => county.id), lostRegionIds: ['cuansioda'], capitalId: 'botharin' },
    aldingen: { lostRegionIds: ['wernmark', 'hohenreede'] },
    deitheach: { continent: 'aldervan', entireFormerRealmOccupied: true, oldRegionIds: report.countries.Deitheach.counties.map(county => county.id), historicalNarration: 'past tense' },
  },
  occupiedCounties: occupation.occupationCounties.map(county => ({ ...county,
    formerCanonicalCounterpartHouseId: county.formerHouseId ? `house-${county.formerHouseId}` : null,
    occupiedHouseIds: report.countries.Triarchie.houses.filter(house => county.seats.includes(house.acceptedSeatId)).map(house => house.id),
    previewHref: 'Vorschau/Triarchie/', authoritativeCanonicalHref: null,
  })),
  occupiedSettlements: occupation.occupiedSettlements.map(settlement => ({ ...settlement,
    assignedHouseIds: report.countries.Triarchie.houses.filter(house => house.acceptedSeatId === settlement.id).map(house => house.id),
    formerCanonicalCounterpartHouseId: settlement.formerHouseId ? `house-${settlement.formerHouseId}` : null,
    authoritativeCanonicalHref: null,
  })),
  formerHouseCrosslinks: [{ stablePreviewHouseId: 'farraigeach', existingCounterpartHouseId: 'house-farraigeach', originRealm: 'iathneach',
    formerCountyId: 'cuansioda', formerSettlementId: 'cuansioda', currentSettlementId: 'sgeir-tearmainn',
    currentPreviewHref: 'Vorschau/Iathneach/', formerSeatPreviewHref: 'Vorschau/Triarchie/',
    primaryFamilyHref: null, note: 'Only explicitly named former ruling house in the shared occupation source. Wernmark and Hohenreede have no named formerHouseId; export assigns Hufschlag and Sattler to their gräfliche seats, but do not invent a displaced former ruling house.' }],
};
report.summary = {
  houseCount: Object.values(report.countries).reduce((sum, country) => sum + country.counts.houses, 0),
  warriorCount: Object.values(report.countries).reduce((sum, country) => sum + country.counts.warriors, 0),
  missingAssetCount: Object.values(report.countries).reduce((sum, country) => sum + country.validation.missingAssets.length, 0),
  primaryFamilyCount: Object.values(report.countries).flatMap(country => country.houses.flatMap(house => house.primaryFamilyRecords)).length,
  unprovenRankIds: Object.fromEntries(Object.entries(report.countries).map(([country, data]) => [country, data.houses.filter(house => !house.rankDecision.rank).map(house => house.id)])),
};
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, 'albic-historic.audit.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.summary, null, 2));
