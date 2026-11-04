// Prepared bounded import; Root runs it after editorial and image review.
// Read canonical families, write only new Leitheach house authoring sources.
import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createReviewedLeitheachHouseContent } from '../../Familien Häuser und Clans/modules/house-content/reviewed-leitheach-house-content.mjs';
import { houseBiographyDefaultFingerprint } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-fingerprint.js';

const root = new URL('../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const allowedRoot = new URL('Estryll/Leitheach/', feature);
const outputManifest = new URL('created-house-sources.json', import.meta.url);
const CONTENT_VERSION = '20261103-leitheach-v1';
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const json = async name => JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sameIds = (a, b) => same([...a].sort(), [...b].sort());
const graphOf = family => Object.fromEntries(graphKeys.map(key => [key, family[key] || []]));
const safeName = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
const named = person => person?.name && !/Unbekannt|\?\?\?|Platzhalter/i.test(person.name);
const living = person => person?.status === 'alive' && !person.death;
const historicalIds = Object.freeze(['haus-suileach', 'haus-iomrach', 'haus-dal-t-saor']);
const generatedIds = Object.freeze(['haus-suileach', 'haus-dal-t-saor', 'haus-gruenhand']);
const sourceIds = Object.freeze([
  'haus-mac-ard-cumhaill', 'haus-ua-eirce', 'haus-fiachrach', 'haus-ruin-ua-laoch',
  'haus-ua-gaelach', 'haus-gallchobhair', 'haus-cleir', 'haus-ghaiscioch',
  'haus-dal-ceardaiocht', 'haus-na-mhuir', 'haus-dal-cruthin', 'haus-frisealach',
  'haus-somhairle', 'haus-ard-trodach', 'haus-nic-caoimhe', 'haus-iomrach',
  'haus-suileach', 'haus-fir-an-tarvo', 'haus-ruitheach', 'haus-gortach',
  'haus-mac-airt', 'haus-choinnich', 'haus-nic-blar-leitheach', 'haus-laidir',
  'haus-dal-t-saor', 'haus-tir-an-cuinn', 'haus-airgid', 'haus-amrhan'
]);
// Selection comes from existing titles and identities, never the supplied trees.
// A class founder or an early named lord is not automatically a clan founder.
const members = Object.freeze({
  'haus-mac-ard-cumhaill': { founder: 'fionnbarr-cumhail', current: 'fionn-1686-cumhail', heirs: ['faolan-1714-cumhail', 'oisin-1716-cumhail', 'fiona-cumhail', 'finn-cumhail'] },
  'haus-ua-eirce': { founder: 'sinna-1250-cumhail', current: 'brock-eirce', heirs: ['nechtan-eirce', 'uisdean-eirce'] },
  'haus-fiachrach': { founder: 'seamair-fiachrach', current: 'grada-fiachrach', heirs: ['seamus-fiachrach', 'ultach-fiachrach', 'gadhra-fiachrach', 'connla-fiachrach'] },
  'haus-ruin-ua-laoch': { founder: 'senan-ancient-cumhail', current: 'reamonn-laoch', heirs: ['zadran-laoch', 'eamon-laoch', 'fergal-laoch'] },
  'haus-ua-gaelach': { founder: 'donnchadh-cumhail', current: 'ciaran-gealach', heirs: [] },
  'haus-gallchobhair': { founder: 'utgar-gallchobhair', current: 'faolan-gallchobhair', heirs: [] },
  'haus-cleir': { founder: 'gilleon-gallchobhair', current: 'colm-cleir', heirs: [] },
  'haus-ghaiscioch': { founder: 'taerlach-gallchobhair', current: 'darragh-ua-ghaiscioch', heirs: ['lorghus-ghaiscioch', 'brogan-ghaiscioch', 'ailis-ghaiscioch'] },
  'haus-dal-ceardaiocht': { founder: 'aonghus-gallchobhair', current: 'caibrel-ceardaiocht', heirs: ['rogan-ceardaiocht', 'jocan-ceardaiocht', 'etain-ceardaiocht'] },
  'haus-na-mhuir': { founder: '', current: 'aodhagan-mhuir', heirs: [] },
  'haus-gruenhand': { founder: 'peregrain-gruenhand', current: 'peregrain-gruenhand', heirs: [] },
  'haus-dal-cruthin': { founder: 'fearghus-founder-cruthin', current: 'cathaoir-cruthin', heirs: ['meallchu-cruthin', 'kolman-cruthin'] },
  'haus-suileach': { founder: '', current: '', heirs: [] },
  'haus-frisealach': { founder: 'tadhghan-founder-frisealach', current: 'giollanaimhe-frisealach', heirs: ['koarnach-frisealach', 'yachthar-frisealach', 'nioran-frisealach'] },
  'haus-ard-trodach': { founder: 'fothadh-founder-trodach', current: 'caireall-trodach', heirs: ['haolthan-trodach', 'maithnu-trodach'] },
  'haus-nic-caoimhe': { founder: 'fainne-founder-caoimhe', current: 'ciannait-caoimhe', heirs: ['yllana-caoimhe', 'realtin-caoimhe'] },
  'haus-iomrach': { founder: 'conan-founder-iomrach', current: '', heirs: [] },
  'haus-somhairle': { founder: 'siomhrach-founder-somhairle', current: 'klaihn-somhairle', heirs: ['oisean-somhairle', 'hectan-somhairle'] },
  'haus-fir-an-tarvo': { founder: 'tarvonius-tarvo', current: 'neartan-tarvo', heirs: ['athluan-tarvo', 'uallghus-tarvo', 'crispus-tarvo'] },
  'haus-ruitheach': { founder: 'ruaidhri-founder-ruitheach', current: 'muirinn-ruitheach', heirs: ['troscan-ruitheach', 'nibhn-ruitheach'] },
  'haus-gortach': { founder: 'aodhluan-founder-gortach', current: 'kinneth-gortach', heirs: ['peighneachan-gortach', 'eilis-gortach', 'loicin-gortach'] },
  'haus-mac-airt': { founder: 'colman-founder-airt', current: 'cormac-1664-airt', heirs: ['bairre-airt'] },
  'haus-choinnich': { founder: 'sweeney-founder-choinnich', current: 'tiarnog-choinnich', heirs: [] },
  'haus-nic-blar-leitheach': { founder: 'torlaith-blar', current: 'sceolaith-blar', heirs: ['gobaith-blar', 'sluagh-blar'] },
  'haus-laidir': { founder: 'lughaidh-founder-laidir', current: 'rioghnan-laidir', heirs: [] },
  'haus-dal-t-saor': { founder: 'lorcan-founder-tsaoir', current: '', heirs: [] },
  'haus-tir-an-cuinn': { founder: '', current: 'gofraidh-cuinn', heirs: ['gorm-cuinn', 'brendan-1718-cuinn'] },
  'haus-airgid': { founder: 'tomaltach-founder-airgid', current: 'tomaltach-airgid', heirs: [] },
  'haus-amrhan': { founder: 'nathrachan-cuinn', current: 'fionntan-amrhan', heirs: ['scannlan-amrhan', 'xiston-amrhan', 'muiris-amrhan'] }
});
const survivorDescriptions = Object.freeze({
  'ybhna-iomrach': 'Ybhna Iomrach ist in die Sidhe Somhairle verheiratet und überlebte den Untergang der früheren Hausverwaltung auswärts.',
  'conan-iomrach': 'Cónán Iomrach überlebte den Untergang von Broch an Clais im Jahr 1733, weil er fern der Burg als Mündel Oisean Somhairles aufwuchs. Er wird als Erbe der An’Iomrach erzogen.',
  'quona-tsaoir': 'Quona T’Saoir ist in den Clan Ua’Choinnich verheiratet und überlebte den Untergang der in der Stammburg verbliebenen Hauslinie im Jahr 1735 auswärts.',
  'junaid-tsaoir': 'Junaid T’Saoir ist in die Ruin’Laidir verheiratet und überlebte den Untergang der in der Stammburg verbliebenen Hauslinie im Jahr 1735 auswärts.'
});

async function requireAbsent(url) {
  try { await access(url); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  throw new Error(`Refusing to overwrite existing file: ${fileURLToPath(url)}`);
}

function requireInside(url, parent, label) {
  const rest = relative(fileURLToPath(parent), fileURLToPath(url));
  if (!rest || isAbsolute(rest) || rest === '..' || rest.startsWith(`..${sep}`)) throw new Error(`Invalid ${label}: ${url.href}`);
}

function uniqueRows(rows, label) {
  if (!Array.isArray(rows)) throw new Error(`Expected array: ${label}`);
  const result = new Map();
  for (const row of rows) {
    if (!row.id || result.has(row.id)) throw new Error(`Missing/duplicate ID in ${label}: ${row.id}`);
    result.set(row.id, row);
  }
  return result;
}

function historicalMetadata(record) {
  return { historicalStatus: record.family.extensions.historicalStatus || '', extinctHouse: record.family.extensions.extinctHouse === true,
    ownHouseStatus: record.family.houses.find(house => house.id === record.family.lineage.houseId)?.status || '',
    extinctionEvent: record.family.extensions.extinctionEvent || null };
}

function assertCanonicalBaseline(record, previous) {
  if (!previous || record.folderPath[0] !== 'Leitheach' || record.houseProfile.kingdom !== 'Leitheach'
    || !same(record.family.document.houseProfile, previous.profile) || !same(record.houseProfile, previous.profile)
    || sha(JSON.stringify(previous.profile)) !== previous.profileFingerprint) throw new Error(`Profile drift: ${record.id}`);
  if (sha(JSON.stringify(graphOf(record.family))) !== previous.graphFingerprint || !same(graphOf(record.family), previous.graph)) {
    throw new Error(`Graph drift: ${record.id}`);
  }
  if (!same(record.folderPath, previous.folderPath) || !same(record.additionalPlacements || [], previous.additionalPlacements || [])
    || record.title !== previous.title || record.family.document.title !== previous.documentTitle
    || (record.family.document.motto || '') !== previous.motto || record.family.document.description !== previous.description
    || record.family.extensions.sourceRevision !== previous.sourceRevision
    || !same(historicalMetadata(record), previous.historicalMetadata)) throw new Error(`Identity/history drift: ${record.id}`);
}

async function inspectArt(art, original) {
  if (!art?.assetPath || art.role !== 'warrior') throw new Error(`Missing house figure: ${art?.id}`);
  const url = new URL(art.assetPath, root);
  requireInside(url, new URL(`Stammbäume/assets/images/references/${art.id}/`, root), 'house figure path');
  const bytes = await readFile(url), signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature) || bytes.subarray(12, 16).toString('ascii') !== 'IHDR') {
    throw new Error(`Expected PNG: ${art.id}`);
  }
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), rgba = bytes[25] === 6;
  if (!original && (!rgba || width * 3 !== height * 2)) throw new Error(`Expected generated RGBA 2:3 figure: ${art.id}`);
  if (original && (width !== art.width || height !== art.height || (art.mode === 'RGBA' && !rgba))) {
    throw new Error(`Original metadata changed: ${art.id}`);
  }
  const digest = sha(bytes), declared = art.sha256 || art.sha;
  if ((original && !declared) || declared && declared !== digest) throw new Error(`Image hash mismatch: ${art.id}`);
  const source = art.source || art.defaultSource;
  if (!original && !declared && !source) throw new Error(`Unverifiable generated image: ${art.id}`);
  if (source && !bytes.equals(await readFile(source))) throw new Error(`Generated source changed: ${art.id}`);
  return { sha256: digest, width, height, bytes: bytes.length, format: 'PNG', mode: rgba ? 'RGBA' : art.mode };
}

async function inspectSource(source) {
  if (!source) return null;
  if (!source.source?.archive || !source.source.sha256 || !source.source.byteIdentical || !Array.isArray(source.decisions)
    || !source.reviewedSections) throw new Error(`Incomplete reviewed source: ${source.id}`);
  for (const [key, text] of Object.entries(source.reviewedSections)) {
    if (typeof text !== 'string' || /familyTree|genealog|hierarchy/i.test(key)) throw new Error(`Unexpected source section: ${source.id}/${key}`);
  }
  const url = new URL(source.source.archive, root);
  requireInside(url, new URL('sources/', import.meta.url), 'source archive');
  const bytes = await readFile(url);
  if (sha(bytes) !== source.source.sha256 || bytes.length !== source.source.bytes) throw new Error(`Source archive changed: ${source.id}`);
  return bytes;
}

async function inspectTerritory(row, pages, catalog) {
  const page = pages.get(row.territoryId), territory = catalog.get(row.territoryId);
  if (!page || !territory || !row.href.startsWith('/Kontinente/Estryll/Fürstentum Leitheach/')
    || row.href !== territory.href || row.territoryName !== territory.name || row.territoryType !== page.type
    || !same(row.hierarchy, page.hierarchy)) throw new Error(`Territorial mapping drift: ${row.id}`);
  const url = new URL(row.href.slice(1), root);
  requireInside(url, new URL('Kontinente/Estryll/Fürstentum Leitheach/', root), 'territorial page');
  await access(url);
  return { id: row.territoryId, name: row.territoryName, href: `..${row.href}`, hierarchy: row.hierarchy,
    banner: territory.banner ? `..${territory.banner}` : '' };
}

function memberCard(record, id, role) {
  const person = record.family.persons.find(row => row.id === id);
  if (!named(person)) throw new Error(`Unknown canonical member: ${record.id}/${id}`);
  return { id, familyId: record.id, name: person.name, role, detail: person.title || '',
    image: person.portrait ? `../Stammbäume/${person.portrait}` : '', silhouette: person.sex === 'female' ? 'female' : 'male' };
}

function heirPosition(title) {
  const numeric = title.match(/\b([1-9])\.\s*Stelle/);
  if (numeric) return Number(numeric[1]);
  return [/\bErst(?:er|e)\b/, /\bZweit(?:er|e)\b/, /\bDritt(?:er|e)\b/, /\bViert(?:er|e)\b/]
    .findIndex(pattern => pattern.test(title)) + 1;
}

function curateMembers(content, record) {
  const selection = members[record.id], byId = new Map(record.family.persons.map(person => [person.id, person]));
  if (!selection) throw new Error(`Missing curated member selection: ${record.id}`);
  const founder = byId.get(selection.founder);
  if (selection.founder && (!named(founder) || !/Gründ|Begründer|Ahnherr/.test(founder.title || ''))) {
    throw new Error(`Founder not established by canonical title: ${record.id}`);
  }
  content.founderTitle = 'Überlieferter Ursprung';
  content.founder = founder ? memberCard(record, founder.id, /Angenommen|Legendär|Sagenhaft/i.test(founder.title)
    ? 'Überlieferter Ahnherr' : 'Begründung der Familie') : null;
  const officeProof = /Laird|Tiarna|Ard Mac Cumhaill|Oberhaupt|Septoberhaupt/;
  content.heads = record.family.persons.filter(person => named(person) && person.lineageRole === 'head'
    && (person.houseId === record.family.lineage.houseId || person.id === selection.founder)
    && officeProof.test(person.title || '') && !/Erbfolge|Erbe/.test(person.title || ''))
    .map(person => memberCard(record, person.id, living(person) ? 'Belegtes Oberhaupt' : 'Historisches Oberhaupt'));
  content.currentHead = '';
  if (selection.current) {
    const person = byId.get(selection.current);
    if (content.extinct || !living(person) || !officeProof.test(person.title || '')) throw new Error(`Unconfirmed current office: ${record.id}`);
    content.currentHead = person.name;
  }
  content.heirs = content.extinct ? [] : selection.heirs.map((id, index) => {
    const person = byId.get(id);
    if (!living(person) || !/Erbfolge|Erbe/.test(person.title || '') || heirPosition(person.title) !== index + 1) {
      throw new Error(`Unconfirmed heir/order: ${record.id}/${id}`);
    }
    return memberCard(record, id, 'Überlieferte Erbfolge');
  });
  content.firstHeir = content.heirs[0]?.name || '';
  if (!content.extinct) {
    content.sections.court = content.currentHead ? `${content.currentHead} führt ${content.name}.` : 'Ein heutiges Familienoberhaupt ist nicht eindeutig belegt.';
    content.sections.succession = content.heirs.length ? `Die bestätigte Erbfolge nennt ${content.heirs.map(person => person.name).join(', ')}${content.heirs.length > 1 ? ' in dieser Reihenfolge' : ''}.`
      : 'Eine gesicherte Erbfolge ist bislang nicht näher überliefert.';
  }
  const survivors = record.family.extensions.extinctionEvent?.survivorIds || [];
  if (survivors.length) {
    content.figuresTitle = 'Auswärts lebende Angehörige';
    content.figures = survivors.map(id => {
      const person = byId.get(id);
      if (!living(person) || !survivorDescriptions[id]) throw new Error(`Unconfirmed survivor/context: ${record.id}/${id}`);
      return { ...memberCard(record, id, person.sex === 'female' ? 'Überlebende Angehörige' : 'Überlebender Angehöriger'),
        detail: 'Auswärts lebend', description: survivorDescriptions[id] };
    });
  }
  if (record.id === 'haus-iomrach') {
    content.sections.succession = 'Die Hausverwaltung erlosch 1733. Cónán Iomrach überlebte auswärts und wird als Erbe des Hauses erzogen; eine heutige Herrschaftsausübung ist damit nicht verbunden.';
  }
}

function preparedSeptSummary(record) {
  const profile = record.family.document.houseProfile;
  if (record.id !== 'haus-gruenhand' || profile.rankId !== 'sept-head') throw new Error(`Unexpected prepared family: ${record.id}`);
  return {
    overview: `Die Grünhand aus Leith bilden ein bürgerliches Sept mit Sitz in ${profile.seat}, im Herrschaftsgebiet ${profile.barony} der Oberherrschaft ${profile.county}. Sie stammen aus dem Druidenhain und dienen dem Laird des Clans Na’Mhuir.`,
    history: 'Peregráin Grünhand ist als Gründervater und erstes überliefertes Septoberhaupt bekannt.',
    character: '', customs: '', holdings: `Der Lebensmittelpunkt des Septs liegt in ${profile.seat}.`, culture: '',
    relations: `Die bestehende Dienstbindung gilt ${profile.liegeHouseName}.`, trivia: []
  };
}

async function validateContent(content, record, territory) {
  if (content.id !== record.id || content.page !== 'haus.html' || !content.registerPage || content.countyLabel !== 'Oberherrschaft'
    || content.territoryId !== territory.id || content.territoryHref !== territory.href) throw new Error(`Invalid page identity: ${record.id}`);
  if (content.hierarchy.some(row => /Königreich|Grafschaft|Jarltum/.test(row.type))
    || content.hierarchy.some(row => /Ceitheach|Aldrimar/.test(row.name))) throw new Error(`Foreign cultural hierarchy: ${record.id}`);
  if (content.profile.seat !== record.houseProfile.seat) throw new Error(`Seat changed: ${record.id}`);
  for (const key of ['troopStrength', 'tiarna', 'kerns', 'fleet']) if (content.profile[key]) throw new Error(`Military profile populated: ${record.id}`);
  const quantity = '(?:\\d[\\d.,\\u00a0]*(?:\\s+\\d+)*|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwanzig|vierzig|fünfzig|hundert|tausend)';
  const amount = new RegExp(`\\b${quantity}\\s+(?:Mann|Huskarle?n?|Tiarna(?:s)?|Kern(?:s|en)?|(?:Waffen)?knecht(?:e|en)?|Soldat(?:en)?|Kriegern?|Kriegsschiff(?:e|en)?)\\b`, 'iu');
  if (amount.test(JSON.stringify([content.sections, content.biographySummary, content.figures, content.trivia]))) throw new Error(`Military quantities in prose: ${record.id}`);
  for (const entry of [content.founder, ...content.heads, ...content.heirs, ...content.offices, ...content.figures].filter(Boolean)) {
    const person = record.family.persons.find(row => row.id === entry.id);
    if (!person || entry.familyId !== record.id || person.name !== entry.name) throw new Error(`Unverified person card: ${record.id}/${entry.id}`);
    if (entry.image) {
      if (entry.image !== `../Stammbäume/${person.portrait}`) throw new Error(`Unverified portrait: ${record.id}/${entry.id}`);
      await access(new URL(entry.image, feature));
    }
  }
  for (const name of ['crest', 'scene', 'banner']) if (content.images[name]) await access(new URL(content.images[name], feature));
  if (content.extinct !== historicalIds.includes(record.id)) throw new Error(`Historical classification changed: ${record.id}`);
  if (content.extinct && (content.currentHead || content.firstHeir || content.heirs.length
    || !/Hausverwaltung/.test(content.extinctionText))) throw new Error(`Historical administration treated as current: ${record.id}`);
  if (record.id === 'haus-gruenhand' && (record.houseProfile.rankId !== 'sept-head' || content.type !== 'Bürgerliches Haus'
    || !/bürgerlich/.test(content.profile.highestTitle) || content.liege !== 'Clan Na’Mhuir')) throw new Error('Grünhand must remain a civil sept under Na’Mhuir.');
  if (record.id !== 'haus-gruenhand' && content.sectionTitles.knighthood !== '4. Tiarnatum') throw new Error(`Tiarnatum label lost: ${record.id}`);
}

const baseline = await json('baseline.json'), review = await json('source-content.json');
const summaries = await json('biography-summaries.json'), originals = await json('original-images.json');
const generated = await json('generated-images.json'), mapping = await json('attachment-mapping.json');
const territoryMap = await json('territory-map.json');
const pages = uniqueRows(JSON.parse(await readFile(new URL('Kontinente/modules/leitheach/pages.source.json', root), 'utf8')).pages, 'Leitheach pages');
const catalog = uniqueRows(JSON.parse(await readFile(new URL('Karten/Leitheach/territories.import.json', root), 'utf8')).territories, 'Leitheach territories');
if (review.status !== 'editorially-reviewed-ready') throw new Error('Editorial review incomplete.');
const oldById = uniqueRows(baseline, 'baseline'), sourcesById = uniqueRows(review.houses, 'reviewed sources');
const originalsById = uniqueRows(originals, 'original figures'), generatedById = uniqueRows(generated, 'generated figures');
const territoriesByHouse = uniqueRows(territoryMap.rows, 'house territory map');
const records = FAMILY_REGISTRY.filter(record => record.folderPath?.[0] === 'Leitheach');
if (records.length !== 29 || oldById.size !== 29 || sourcesById.size !== 28 || originalsById.size !== 26
  || generatedById.size !== 3 || territoriesByHouse.size !== 29) throw new Error('Unexpected Leitheach scope.');
if (!sameIds(oldById.keys(), [...sourceIds, 'haus-gruenhand']) || !sameIds(records.map(row => row.id), oldById.keys())
  || !sameIds(sourcesById.keys(), sourceIds) || !sameIds(Object.keys(summaries), sourceIds)
  || !sameIds(mapping.rows.map(row => row.canonicalId), sourceIds) || !sameIds(Object.keys(members), oldById.keys())
  || !sameIds(territoriesByHouse.keys(), oldById.keys()) || !sameIds(generatedById.keys(), generatedIds)
  || !sameIds(originalsById.keys(), sourceIds.filter(id => !generatedIds.includes(id)))) throw new Error('Canonical/source/art allowlist mismatch.');
for (const art of [...originals, ...generated]) {
  if (art.role !== 'warrior' || !oldById.has(art.id) || originalsById.has(art.id) && generatedById.has(art.id)) throw new Error(`Unexpected art assignment: ${art.id}`);
}
if (originals.some(row => !row.primary) || new Set([...originals, ...generated].map(row => row.assetPath)).size !== 29) throw new Error('Duplicate/missing primary image assignment.');
await requireAbsent(outputManifest);

// Verify the complete batch before the first write to an authoring directory.
const pending = await Promise.all(records.map(async record => {
  const previous = oldById.get(record.id);
  assertCanonicalBaseline(record, previous);
  const source = sourcesById.get(record.id), original = originalsById.get(record.id), art = original || generatedById.get(record.id);
  const summary = source ? summaries[record.id] : preparedSeptSummary(record);
  if (!summary?.overview || Object.values(summary).some(value => value === undefined)) throw new Error(`Missing summary: ${record.id}`);
  const mappingRow = mapping.rows.find(row => row.canonicalId === record.id);
  if (source && (source.source.attachmentId !== mappingRow.attachmentId || source.source.sha256 !== mappingRow.sourceSha256)) {
    throw new Error(`Attachment identity/hash mismatch: ${record.id}`);
  }
  const [imageMetadata, archiveBytes, territory] = await Promise.all([
    inspectArt(art, Boolean(original)), inspectSource(source), inspectTerritory(territoriesByHouse.get(record.id), pages, catalog)
  ]);
  const segments = [...record.folderPath.slice(1), record.title].map(safeName);
  if (segments.some(value => !value)) throw new Error(`Empty output path: ${record.id}`);
  const relativeDirectory = `Estryll/Leitheach/${segments.join('/')}`, directory = new URL(`${relativeDirectory}/`, feature);
  requireInside(directory, allowedRoot, 'house source path');
  const targets = [new URL('haus.content.mjs', directory), new URL('source-manifest.json', directory)];
  if (source) targets.push(new URL('animexx-source-2026-11-03.html', directory));
  await Promise.all(targets.map(requireAbsent));
  const content = createReviewedLeitheachHouseContent({ record, territory, image: `../${art.assetPath}`,
    contentVersion: CONTENT_VERSION, sections: source?.reviewedSections || { overview: summary.overview, history: summary.history, holdings: summary.holdings },
    biographySummary: summary, trivia: source?.reviewedTrivia || [], prepared: !source });
  content.biographySourceRevision = previous.sourceRevision + 1;
  content.biographyPreviousDefaultFingerprints = previous.biography ? [houseBiographyDefaultFingerprint(previous.biography)] : [];
  if (territory.banner) content.images.banner = territory.banner;
  curateMembers(content, record);
  await validateContent(content, record, territory);
  assertCanonicalBaseline(record, previous);
  const manifest = { id: record.id, contentVersion: CONTENT_VERSION, source: source?.source || null,
    authority: { familyId: record.id, baselineSourceRevision: previous.sourceRevision, profile: previous.profile,
      graphFingerprint: previous.graphFingerprint, historicalMetadata: previous.historicalMetadata },
    territory: territoriesByHouse.get(record.id), genealogy: { imported: false, familyId: record.id, iframe: true }, militaryStatistics: { imported: false },
    illustration: { ...art, ...imageMetadata, original: Boolean(original), representative: true, namedPersonId: '' },
    decisions: [...(source?.decisions || []), ...(source ? [] : ['Nur belegter Sept-, Orts-, Herkunfts- und Dienstkontext aus der bestehenden Akte; keine neue Hausgeschichte.']),
      'Leitheach ist ein eigenes Fürstentum; Aldrimar und Ceitheach sind keine kulturellen oder geografischen Vorlagen.',
      'Aktuelle IDs, Rangstufen, Sitze, Dienstbindungen und kanonische Personenidentitäten bleiben erhalten.',
      'Suileach, Iomrach und Dal T’Saor sind historische Hausverwaltungen. Lebende auswärtige Angehörige behalten ihren Lebensstatus.',
      'Grünhand bleibt ein bürgerliches Sept ohne adeligen Rang; vorhandene Heraldik wird nicht erfunden oder ersetzt.',
      'Vorlagenstammbäume und Militärstatistiken vollständig ignoriert; bestehende Graphen und Profile unverändert.',
      'Amts- und Erbfolge nur durch vorhandene konkrete Titel belegt; lineageRole und Lebensdaten allein begründen keine Ämter.',
      'Die Hausdarstellungen bleiben repräsentativ und werden keinen neu benannten Personen zugewiesen.'] };
  return { id: record.id, directory, relativeDirectory, source, archiveBytes, content, manifest, image: art.assetPath, original: Boolean(original) };
}));
if (new Set(pending.map(row => row.directory.href)).size !== 29) throw new Error('Output-directory collision.');
for (const record of records) assertCanonicalBaseline(record, oldById.get(record.id));
for (const row of pending) {
  await mkdir(row.directory, { recursive: true });
  await writeFile(new URL('haus.content.mjs', row.directory), `// Geprüfte Leitheach-Quelle; kanonische Familienakten bleiben maßgeblich.\nexport const HOUSE_CONTENT = ${JSON.stringify(row.content, null, 2)};\n`, { flag: 'wx' });
  if (row.source) await writeFile(new URL('animexx-source-2026-11-03.html', row.directory), row.archiveBytes, { flag: 'wx' });
  await writeFile(new URL('source-manifest.json', row.directory), JSON.stringify(row.manifest, null, 2) + '\n', { flag: 'wx' });
}
await writeFile(outputManifest, JSON.stringify(pending.map(({ id, relativeDirectory, content, image, original, source }) =>
  ({ id, relativeDirectory, image, original, suppliedSource: Boolean(source), extinct: content.extinct, prepared: content.prepared })), null, 2) + '\n', { flag: 'wx' });
console.log(`${pending.length} Leitheach-Hausquellen angelegt.`);
