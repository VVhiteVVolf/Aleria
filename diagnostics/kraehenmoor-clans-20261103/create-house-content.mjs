// Bounded authoring import. Read canonical families; write only new house sources.
// Prepared for Root to run after all images and editorial inputs are complete.
import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createReviewedAldrimarHouseContent } from '../../Familien Häuser und Clans/modules/house-content/reviewed-aldrimar-house-content.mjs';
import { readPreparedHouseFacts, describePreparedHouse } from '../../Familien Häuser und Clans/modules/house-content/prepared-house-facts.mjs';
import { houseBiographyDefaultFingerprint } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-fingerprint.js';

const root = new URL('../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const allowedRoot = new URL('Estryll/Aldrimar/Kraehenmoor/', feature);
const outputManifest = new URL('created-house-sources.json', import.meta.url);
const CONTENT_VERSION = '20261103-kraehenmoor-v1';
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const json = async name => JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const same = (first, second) => JSON.stringify(first) === JSON.stringify(second);
const safeName = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
const graphOf = family => Object.fromEntries(graphKeys.map(key => [key, family[key] || []]));
const sourceIds = Object.freeze([
  'haus-schattenherz', 'haus-blutstahl', 'haus-silberblut', 'haus-varangr',
  'haus-kaltherz', 'haus-feuerherz', 'haus-vragi', 'haus-schwarzblut',
  'haus-goldglanz', 'haus-hjerte', 'haus-jaernblod', 'haus-kaldhrafn',
  'haus-mac-morfhia', 'haus-mac-corcaigh'
]);
const heirOrder = Object.freeze({
  'haus-schattenherz': ['isbrand-schattenherz', 'thjald-schattenherz'],
  'haus-kaltherz': ['njvar-kaltherz', 'hjalmar-kaltherz', 'fjori-kaltherz'],
  'haus-feuerherz': ['rolfur-feuerherz', 'kjalmar-feuerherz', 'frodi-feuerherz'],
  'haus-schwarzblut': ['svanur-schwarzblut']
});
const territory = Object.freeze({
  id: 'jarltum-kraehenmoor', name: 'Jarltum Krähenmoor',
  href: '../Kontinente/Estryll/Königreich Aldrimar/Jarltum Krähenmoor/Jarltum Krähenmoor.html'
});

async function requireAbsent(url) {
  try { await access(url); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  throw new Error(`Refusing to overwrite existing file: ${fileURLToPath(url)}`);
}

function requireInside(url, parent, label) {
  const remainder = relative(fileURLToPath(parent), fileURLToPath(url));
  if (!remainder || isAbsolute(remainder) || remainder === '..' || remainder.startsWith(`..${sep}`)) {
    throw new Error(`Invalid ${label}: ${url.href}`);
  }
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

function assertCanonicalBaseline(record, previous) {
  if (!previous || !same(record.family.document.houseProfile, previous.profile)
    || !same(record.houseProfile, previous.profile)) throw new Error(`Profile drift: ${record.id}`);
  if (sha(JSON.stringify(graphOf(record.family))) !== previous.graphFingerprint
    || !same(graphOf(record.family), previous.graph)) throw new Error(`Graph drift: ${record.id}`);
  if (!same(record.folderPath, previous.folderPath) || record.title !== previous.title
    || record.family.document.title !== previous.documentTitle
    || (record.family.document.motto || '') !== previous.motto) throw new Error(`Identity drift: ${record.id}`);
}

async function inspectArt(art, original) {
  if (!art?.assetPath || art.role !== 'warrior') throw new Error(`Missing warrior illustration: ${art?.id}`);
  const url = new URL(art.assetPath, root);
  requireInside(url, new URL('Stammbäume/assets/images/references/', root), 'illustration path');
  const bytes = await readFile(url);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature)
    || bytes.subarray(12, 16).toString('ascii') !== 'IHDR' || bytes[25] !== 6) {
    throw new Error(`Expected RGBA PNG: ${art.id}`);
  }
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  if (Math.abs(width / height - 2 / 3) > 0.01) throw new Error(`Unexpected figure ratio: ${art.id}`);
  const digest = sha(bytes), declared = art.sha256 || art.sha;
  if ((original && !declared) || (declared && declared !== digest)) throw new Error(`Image hash mismatch: ${art.id}`);
  const sourcePath = art.source || art.defaultSource;
  if (!original && !declared && !sourcePath) throw new Error(`Unverifiable generated image: ${art.id}`);
  if (sourcePath && !bytes.equals(await readFile(sourcePath))) throw new Error(`Generated source changed: ${art.id}`);
  return { sha256: digest, width, height, bytes: bytes.length, format: 'PNG', mode: 'RGBA' };
}

async function inspectSource(source) {
  if (!source) return null;
  if (!source.source?.archive || !source.source.sha256 || !source.source.byteIdentical
    || !Array.isArray(source.decisions) || !source.reviewedSections) throw new Error(`Incomplete reviewed source: ${source.id}`);
  for (const [key, value] of Object.entries(source.reviewedSections)) {
    if (typeof value !== 'string') throw new Error(`Non-text section: ${source.id}/${key}`);
  }
  const url = new URL(source.source.archive, root);
  requireInside(url, new URL('sources/', import.meta.url), 'source archive');
  const bytes = await readFile(url);
  if (sha(bytes) !== source.source.sha256 || bytes.length !== source.source.bytes) {
    throw new Error(`Source archive changed: ${source.id}`);
  }
  return bytes;
}

function metadataSummary(record) {
  const facts = readPreparedHouseFacts(record);
  const overview = describePreparedHouse(facts)
    .replace('in der Grafschaft Krähenmoor', 'im Jarltum Krähenmoor')
    .replace('liegt in Jarltümliche Herrschaft von Nebelmoor.', 'liegt in der jarltümlichen Herrschaft Nebelmoor.')
    .replace('liegt in Hesirentum von Schwarzfjord.', 'liegt im Hesirentum Schwarzfjord.');
  const summary = {
    overview, history: '', character: '', customs: '',
    holdings: facts.profile.seat ? `Der verzeichnete Sitz ist ${facts.profile.seat}.` : '',
    culture: '', relations: facts.liege ? `Die überlieferte Dienstbindung gilt ${facts.liege}.` : '', trivia: []
  };
  if (record.id === 'haus-schwarzstolz') {
    const person = record.family.persons.find(row => row.id === 'sindre-brandstolz');
    if (!person || !/Bootsmann/.test(person.title) || person.lineageRole === 'head') {
      throw new Error('Schwarzstolz: expected Sindre as boatswain, never as clan head.');
    }
    summary.history = 'Sindre Brandstolz stammt aus diesem Clan. Er kehrte ihm den Rücken, nachdem er und seine Mutter dort nicht mehr erwünscht waren.';
    summary.character = `${person.name} ist als ${person.title} bekannt.`;
  }
  return summary;
}

function curateSuccession(content, record) {
  const order = heirOrder[record.id];
  if (!order) return;
  if (!same([...content.heirs.map(person => person.id)].sort(), [...order].sort())) {
    throw new Error(`Unexpected canonical heirs: ${record.id}`);
  }
  const titles = [/Erster Erbe/, /Zweiter Erbe/, /Dritter Erbe/];
  for (let index = 0; index < order.length; index += 1) {
    const person = record.family.persons.find(row => row.id === order[index]);
    if (!person || person.status !== 'alive' || person.death || !titles[index].test(person.title)) {
      throw new Error(`Unconfirmed heir order: ${record.id}/${order[index]}`);
    }
  }
  content.heirs.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  content.firstHeir = content.heirs[0].name;
  content.sections.succession = `Die bestätigte Erbfolge nennt ${content.heirs.map(person => person.name).join(', ')} in dieser Reihenfolge.`;
  // A future heir tagged as a lineage head is not yet an incumbent house head.
  content.heads = content.heads.filter(person => !order.includes(person.id));
  const active = content.heads.filter(card => {
    const person = record.family.persons.find(row => row.id === card.id);
    return person.status === 'alive' && !person.death && !/vormals|ehemalig|Exil/i.test(person.title);
  });
  content.currentHead = active.length === 1 ? active[0].name : '';
  content.sections.court = content.currentHead ? `${content.currentHead} führt ${content.name}.`
    : 'Einzelne Amtsbesetzungen sind bislang nicht näher überliefert.';
}

function curatePreparedMembers(content, record) {
  content.founder = null;
  content.heads = [];
  content.heirs = [];
  content.currentHead = '';
  content.firstHeir = '';
  content.sections.court = 'Namentliche Clanoberhäupter und Amtsbesetzungen sind bislang nicht überliefert.';
  if (record.id === 'haus-schwarzstolz') {
    const person = record.family.persons.find(row => row.id === 'sindre-brandstolz');
    content.figuresTitle = 'Bekannte Angehörige';
    content.figures = [{ id: person.id, familyId: record.id, name: person.name, role: person.title,
      detail: 'Herkunft aus Clan Schwarzstolz',
      description: 'Sindre Brandstolz verließ den Clan und ist heute Bootsmann der Tiefenwyrm.',
      image: person.portrait ? `../Stammbäume/${person.portrait}` : '', silhouette: 'male' }];
  }
  if (record.id === 'haus-goldzunge') {
    if (record.houseProfile.rankId !== 'commoner' || content.liege || content.profile.liege) {
      throw new Error('Goldzunge must remain a civil family without a liege.');
    }
    content.type = 'Bürgerliches Haus';
    content.profile.houseType = 'Bürgerliches Haus';
    content.sections.court = 'Namentliche Familienoberhäupter und Amtsbesetzungen sind bislang nicht überliefert.';
    content.sections.knighthood = 'Die Goldzunge sind eine bürgerliche Familie. Eine eigene adelige Stellung ist nicht überliefert.';
  }
}

async function validateContent(content, record) {
  if (content.id !== record.id || content.page !== 'haus.html' || !content.registerPage) {
    throw new Error(`Invalid page identity: ${record.id}`);
  }
  for (const key of ['troopStrength', 'tiarna', 'kerns', 'fleet']) {
    if (content.profile[key]) throw new Error(`Military statistics populated: ${record.id}`);
  }
  const quantity = '(?:\\d[\\d.,\\u00a0]*(?:\\s+\\d+)*|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwanzig|vierzig|fünfzig|hundert|tausend)';
  const amount = new RegExp(`\\b${quantity}\\s+(?:Mann|Huskarle?n?|Hirdmännern?|Walküren|(?:Waffen)?knecht(?:e|en)?|Stadtwach(?:e|en)|Soldat(?:en)?|Kriegern?|Kriegsschiff(?:e|en)?)\\b`, 'iu');
  if (amount.test(JSON.stringify([content.sections, content.biographySummary, content.trivia]))) {
    throw new Error(`Military quantities in reviewed prose: ${record.id}`);
  }
  const entries = [content.founder, ...content.heads, ...content.heirs, ...content.offices, ...content.figures].filter(Boolean);
  for (const entry of entries) {
    if (entry.id) {
      const person = record.family.persons.find(row => row.id === entry.id);
      if (entry.familyId !== record.id || !person || person.name !== entry.name) {
        throw new Error(`Unverified member card: ${record.id}/${entry.id}`);
      }
      if (entry.image && entry.image !== `../Stammbäume/${person.portrait}`) {
        throw new Error(`Unverified member portrait: ${record.id}/${entry.id}`);
      }
    }
    if (entry.image) await access(new URL(entry.image, feature));
  }
  for (const field of ['crest', 'scene', 'banner']) if (content.images[field]) {
    await access(new URL(content.images[field], feature));
  }
  if (content.extinct && (content.currentHead || content.firstHeir || content.heirs.length
    || /Norrnaigh|Glaennath|Ausgestorbene Clans/.test(content.profile.seat))) {
    throw new Error(`Invalid historical presentation: ${record.id}`);
  }
  if (['haus-hjerte', 'haus-jaernblod'].includes(record.id) && content.profile.highestTitle !== 'Thane') {
    throw new Error(`Historical Thane rank lost: ${record.id}`);
  }
  if (['haus-kaldhrafn', 'haus-mac-morfhia', 'haus-mac-corcaigh'].includes(record.id)
    && content.profile.highestTitle !== 'Offen') throw new Error(`Unknown historical rank changed: ${record.id}`);
  const historicalSeat = { 'haus-jaernblod': 'Silberquell', 'haus-mac-morfhia': 'Silberquell', 'haus-mac-corcaigh': 'Moortal' }[record.id];
  if (historicalSeat && content.profile.seat !== historicalSeat) throw new Error(`Historical seat lost: ${record.id}`);
  if (record.id === 'haus-goldglanz') {
    for (const display of [content.liege, content.profile.liege]) if (!/Clan Blutstahl/.test(display) || !/Clan Silberblut/.test(display)) {
      throw new Error('Goldglanz must display both canonical lieges.');
    }
  }
}

const baseline = await json('baseline.json');
const review = await json('source-content.json');
const summaries = await json('biography-summaries.json');
const originals = await json('original-images.json');
const generated = await json('generated-images.json');
if (review.status !== 'editorially-reviewed-ready') throw new Error('Editorial review incomplete.');
const oldById = uniqueRows(baseline, 'baseline');
const sourcesById = uniqueRows(review.houses, 'reviewed sources');
const originalById = uniqueRows(originals.filter(row => row.primary), 'original illustrations');
const generatedById = uniqueRows(generated.filter(row => row.role === 'warrior'), 'generated illustrations');
const records = FAMILY_REGISTRY.filter(record => record.folderPath?.[0] === 'Aldrimar' && record.folderPath?.[1] === 'Krähenmoor');
if (records.length !== 26 || oldById.size !== 26 || sourcesById.size !== 14
  || originalById.size !== 13 || generatedById.size !== 13) throw new Error('Unexpected Krähenmoor scope.');
if (!same([...sourcesById.keys()].sort(), [...sourceIds].sort())
  || !same(Object.keys(summaries).sort(), [...sourceIds].sort())
  || !same(records.map(row => row.id).sort(), [...oldById.keys()].sort())) throw new Error('Canonical/source allowlist mismatch.');
if (originalById.has('haus-jaernblod') || !generatedById.has('haus-jaernblod')) throw new Error('Järnblod has no supplied original.');
for (const id of [...originalById.keys(), ...generatedById.keys()]) {
  if (!oldById.has(id) || (originalById.has(id) && generatedById.has(id))) throw new Error(`Unexpected/duplicate image assignment: ${id}`);
}
await requireAbsent(outputManifest);
await access(new URL(territory.href, feature));

// Assemble and verify every output before the first authoring-file write.
const pending = await Promise.all(records.map(async record => {
  const previous = oldById.get(record.id);
  assertCanonicalBaseline(record, previous);
  const source = sourcesById.get(record.id);
  const summary = source ? summaries[record.id] : metadataSummary(record);
  if (!summary?.overview || Object.values(summary).some(value => value === undefined)) throw new Error(`Missing summary: ${record.id}`);
  const original = originalById.get(record.id);
  const art = original || generatedById.get(record.id);
  if (!art) throw new Error(`Missing illustration: ${record.id}`);
  const [imageMetadata, archiveBytes] = await Promise.all([inspectArt(art, Boolean(original)), inspectSource(source)]);
  const segments = [...record.folderPath.slice(2), record.title].map(safeName);
  if (segments.some(value => !value)) throw new Error(`Empty output path component: ${record.id}`);
  const relativeDirectory = `Estryll/Aldrimar/Kraehenmoor/${segments.join('/')}`;
  const directory = new URL(`${relativeDirectory}/`, feature);
  requireInside(directory, allowedRoot, 'house source path');
  const targets = [new URL('haus.content.mjs', directory), new URL('source-manifest.json', directory)];
  if (source) targets.push(new URL('animexx-source-2026-11-03.html', directory));
  await Promise.all(targets.map(requireAbsent));
  const content = createReviewedAldrimarHouseContent({ record, territory, image: `../${art.assetPath}`,
    contentVersion: CONTENT_VERSION, sections: source?.reviewedSections || { overview: summary.overview, holdings: summary.holdings },
    biographySummary: summary, trivia: source?.reviewedTrivia || [], prepared: !source });
  content.page = 'haus.html';
  content.biographySourceRevision = previous.sourceRevision + 1;
  content.biographyPreviousDefaultFingerprints = previous.biography ? [houseBiographyDefaultFingerprint(previous.biography)] : [];
  content.images.sceneAlt = `${content.extinct ? 'Historische' : 'Anonyme'} Hausdarstellung · ${record.title}`;
  if (source) curateSuccession(content, record);
  else curatePreparedMembers(content, record);
  await validateContent(content, record);
  assertCanonicalBaseline(record, previous);
  const manifest = { id: record.id, contentVersion: CONTENT_VERSION, source: source?.source || null,
    authority: { familyId: record.id, baselineSourceRevision: previous.sourceRevision, profile: previous.profile, graphFingerprint: previous.graphFingerprint },
    genealogy: { imported: false, familyId: record.id, iframe: true }, militaryStatistics: { imported: false },
    illustration: { ...art, ...imageMetadata, original: Boolean(original), representative: true, namedPersonId: '' },
    decisions: [...(source?.decisions || []),
      ...(source ? [] : ['Nur vorhandene Registermetadaten; keine gelieferte HTML-Vorlage oder neue Hausgeschichte.']),
      'Aktuelle IDs, Ränge, Orte, Historiengruppen und die fünf erloschenen Clans bleiben erhalten.',
      'Vorlagenstammbäume und Militärstatistiken vollständig ignoriert. Die bestehenden Graphen und Profile bleiben unverändert.',
      'Die repräsentative Hausfigur ist keine Darstellung eines neu benannten Angehörigen.',
      'Sindre Brandstolz bleibt Bootsmann und wird kein Clanoberhaupt. Goldzunge bleibt bürgerlich ohne Lehnsherrn.'] };
  return { id: record.id, relativeDirectory, directory, source, archiveBytes, content, manifest, image: art.assetPath, original: Boolean(original) };
}));
if (new Set(pending.map(row => row.directory.href)).size !== 26) throw new Error('Output-directory collision.');

for (const row of pending) {
  await mkdir(row.directory, { recursive: true });
  await writeFile(new URL('haus.content.mjs', row.directory), `// Geprüfte redaktionelle Quelle; kanonische Familienakten bleiben maßgeblich.\nexport const HOUSE_CONTENT = ${JSON.stringify(row.content, null, 2)};\n`, { flag: 'wx' });
  if (row.source) await writeFile(new URL('animexx-source-2026-11-03.html', row.directory), row.archiveBytes, { flag: 'wx' });
  await writeFile(new URL('source-manifest.json', row.directory), JSON.stringify(row.manifest, null, 2) + '\n', { flag: 'wx' });
}
await writeFile(outputManifest, JSON.stringify(pending.map(({ id, relativeDirectory, content, image, original, source }) =>
  ({ id, relativeDirectory, image, original, suppliedSource: Boolean(source), extinct: content.extinct, prepared: content.prepared })), null, 2) + '\n', { flag: 'wx' });
console.log(`${pending.length} Krähenmoor-Hausquellen angelegt.`);
