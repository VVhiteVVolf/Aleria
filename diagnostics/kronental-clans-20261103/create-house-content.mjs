// Bounded authoring import. Root runs this only after prose and art are ready.
// Canonical families and existing pages are read; only new house sources are written.
import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createReviewedAldrimarHouseContent } from '../../Familien Häuser und Clans/modules/house-content/reviewed-aldrimar-house-content.mjs';
import { readPreparedHouseFacts, describePreparedHouse } from '../../Familien Häuser und Clans/modules/house-content/prepared-house-facts.mjs';
import { houseBiographyDefaultFingerprint } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-fingerprint.js';

const root = new URL('../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const allowedRoot = new URL('Estryll/Aldrimar/Kronental/', feature);
const outputManifest = new URL('created-house-sources.json', import.meta.url);
const CONTENT_VERSION = '20261103-kronental-v1';
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const json = async name => JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sameIds = (a, b) => same([...a].sort(), [...b].sort());
const graphOf = family => Object.fromEntries(graphKeys.map(key => [key, family[key] || []]));
const safeName = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
const named = person => person?.name && !/Unbekannt|\?\?\?|Platzhalter/i.test(person.name);
const living = person => person.status === 'alive' && !person.death;
const sourceIds = Object.freeze([
  'haus-vaeren', 'haus-riesentod', 'haus-eisenbieger', 'haus-sturmgeborene',
  'haus-frostauge', 'haus-wellenschild', 'haus-gullvig', 'haus-wellensaenger',
  'haus-spindelschlag', 'haus-suedstahl', 'haus-albholz', 'haus-wellenkrone',
  'haus-daemmerrufer', 'haus-frostzorn', 'haus-grimr', 'haus-skaife',
  'haus-holmr', 'haus-isvanyr', 'haus-mac-mamhar'
]);
const preparedIds = Object.freeze([
  'haus-eibenschild', 'haus-donnerblut', 'haus-moorbrand', 'haus-jormung',
  'haus-nidfengr', 'haus-tarbhann', 'haus-bjarnvarg', 'haus-tauwind',
  'haus-morchaon', 'haus-hvelgrson'
]);
const historicalIds = Object.freeze(['haus-grimr', 'haus-skaife', 'haus-holmr', 'haus-isvanyr', 'haus-mac-mamhar']);
const generatedIds = Object.freeze(['haus-frostzorn', ...preparedIds]);
const territory = Object.freeze({
  id: 'jarltum-heldenwacht', name: 'Jarltum Heldenwacht',
  href: '../Kontinente/Estryll/Königreich Aldrimar/Jarltum Heldenwacht/Jarltum Heldenwacht.html'
});
// Titles and existing public page content establish offices. A lineageRole alone
// never establishes that its living holder already holds an office or is an heir.
const memberSelection = Object.freeze({
  'haus-vaeren': { founder: 'odin-vaeren', current: 'sigurd-vaeren', heirs: [] },
  'haus-riesentod': { founder: 'leif-riesentod', current: 'thrainn-riesentod', heirs: [] },
  'haus-eisenbieger': { founder: 'erik-eisenbieger', current: '', heirs: [] },
  'haus-sturmgeborene': { founder: 'asgeir-sturmgeborener', current: 'arnthor-sturmgeborener', heirs: [] },
  'haus-frostauge': { founder: 'thorfinn-frostauge', current: 'aegir-frostauge', heirs: ['gangr-frostauge'] },
  'haus-wellenschild': { founder: 'thord-wellenschild', current: '', heirs: [] },
  'haus-gullvig': { founder: 'sten-gullvig', current: 'nattfar-gullvig', heirs: ['askold-gullvig', 'barni-gullvig'] },
  'haus-wellensaenger': { founder: 'snorri-wellensaenger', current: 'fjorlag-wellensaenger', heirs: ['uthar-wellensaenger', 'njall-wellensaenger'] },
  'haus-eibenschild': { founder: '', current: 'alrik-1681-eibenschild', heirs: [] },
  'haus-suedstahl': { founder: 'salah-suedstahl', current: 'malak-suedstahl', heirs: ['salah-ii-suedstahl'] },
  'haus-albholz': { founder: 'albhric-albholz', current: 'branoc-albholz', heirs: ['albhrin-albholz'] },
  'haus-spindelschlag': { founder: 'aldis-spindelschlag', current: '', heirs: [] },
  'haus-frostzorn': { founder: 'vorn-frostauge', current: 'vorn-1697-frostzorn', heirs: [] }
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

function assertCanonicalBaseline(record, previous) {
  if (!previous || !same(record.family.document.houseProfile, previous.profile)
    || !same(record.houseProfile, previous.profile) || sha(JSON.stringify(previous.profile)) !== previous.profileFingerprint) {
    throw new Error(`Profile drift: ${record.id}`);
  }
  if (sha(JSON.stringify(graphOf(record.family))) !== previous.graphFingerprint || !same(graphOf(record.family), previous.graph)) {
    throw new Error(`Graph drift: ${record.id}`);
  }
  if (!same(record.folderPath, previous.folderPath) || !same(record.additionalPlacements || [], previous.additionalPlacements || [])
    || record.title !== previous.title || record.family.document.title !== previous.documentTitle
    || (record.family.document.motto || '') !== previous.motto || record.family.document.description !== previous.description
    || record.family.extensions.sourceRevision !== previous.sourceRevision) throw new Error(`Identity/revision drift: ${record.id}`);
}

async function inspectArt(art, original) {
  if (!art?.assetPath || art.role !== 'warrior') throw new Error(`Missing warrior illustration: ${art?.id}`);
  const url = new URL(art.assetPath, root);
  requireInside(url, new URL(`Stammbäume/assets/images/references/${art.id}/`, root), 'house illustration path');
  const bytes = await readFile(url);
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(png) || bytes.subarray(12, 16).toString('ascii') !== 'IHDR') {
    throw new Error(`Expected PNG: ${art.id}`);
  }
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  const rgba = bytes[25] === 6;
  if (!original && (!rgba || width * 3 !== height * 2)) throw new Error(`Expected generated RGBA 2:3 figure: ${art.id}`);
  if (original && (width !== art.width || height !== art.height || (art.mode === 'RGBA' && !rgba))) {
    throw new Error(`Original image metadata changed: ${art.id}`);
  }
  const digest = sha(bytes), declared = art.sha256 || art.sha;
  if ((original && !declared) || (declared && declared !== digest)) throw new Error(`Image hash mismatch: ${art.id}`);
  const sourcePath = art.source || art.defaultSource;
  if (!original && !declared && !sourcePath) throw new Error(`Unverifiable generated image: ${art.id}`);
  if (sourcePath && !bytes.equals(await readFile(sourcePath))) throw new Error(`Generated source changed: ${art.id}`);
  return { sha256: digest, width, height, bytes: bytes.length, format: 'PNG', mode: rgba ? 'RGBA' : art.mode };
}

async function inspectSource(source) {
  if (!source) return null;
  if (!source.source?.archive || !source.source.sha256 || !source.source.byteIdentical
    || !Array.isArray(source.decisions) || !source.reviewedSections) throw new Error(`Incomplete reviewed source: ${source.id}`);
  for (const [key, value] of Object.entries(source.reviewedSections)) {
    if (typeof value !== 'string' || /familyTree|genealog|hierarchy/i.test(key)) throw new Error(`Unexpected source section: ${source.id}/${key}`);
  }
  const url = new URL(source.source.archive, root);
  requireInside(url, new URL('sources/', import.meta.url), 'source archive');
  const bytes = await readFile(url);
  if (sha(bytes) !== source.source.sha256 || bytes.length !== source.source.bytes) throw new Error(`Source archive changed: ${source.id}`);
  return bytes;
}

function memberCard(record, id, role) {
  const person = record.family.persons.find(row => row.id === id);
  if (!named(person)) throw new Error(`Unknown canonical member: ${record.id}/${id}`);
  return { id, familyId: record.id, name: person.name, role, detail: person.title || '',
    image: person.portrait ? `../Stammbäume/${person.portrait}` : '', silhouette: person.sex === 'female' ? 'female' : 'male' };
}

function curateMembers(content, record) {
  const selection = memberSelection[record.id] || { founder: '', current: '', heirs: [] };
  const personById = new Map(record.family.persons.map(person => [person.id, person]));
  const own = record.family.persons.filter(person => person.houseId === record.family.lineage.houseId && named(person));
  content.founder = selection.founder ? memberCard(record, selection.founder, 'Überlieferter Ursprung') : null;
  if (selection.founder && !/Gründer|Begründer|Stammvater|Stammmutter/.test(personById.get(selection.founder).title)) {
    throw new Error(`Founder not established by canonical title: ${record.id}`);
  }
  content.heirs = content.extinct ? [] : selection.heirs.map((id, index) => {
    const person = personById.get(id);
    if (!living(person) || !/Erbe|Erbin|Erbfolge/.test(person.title)) throw new Error(`Unconfirmed heir: ${record.id}/${id}`);
    if (selection.heirs.length > 1 && !new RegExp(index === 0 ? 'Erster Erbe' : 'Zweiter Erbe').test(person.title)) {
      throw new Error(`Unconfirmed heir order: ${record.id}/${id}`);
    }
    return memberCard(record, id, 'Erbfolge');
  });
  const officeTitle = /Oberhaupt|Hesir|König von Aldrimar/;
  content.heads = own.filter(person => officeTitle.test(person.title || '') && !/Erbe/.test(person.title || '')
    && !selection.heirs.includes(person.id)).map(person => memberCard(record, person.id, living(person) ? 'Belegter Amtsträger' : 'Historischer Amtsträger'));
  content.currentHead = '';
  if (!content.extinct && selection.current) {
    const person = personById.get(selection.current);
    if (!living(person) || !officeTitle.test(person.title || '')) throw new Error(`Unconfirmed current head: ${record.id}`);
    content.currentHead = person.name;
  }
  content.firstHeir = content.heirs[0]?.name || '';
  content.sections.succession = content.extinct ? 'Die Familie ist erloschen.' : content.heirs.length
    ? `Die bestätigte Erbfolge nennt ${content.heirs.map(person => person.name).join(', ')}${content.heirs.length > 1 ? ' in dieser Reihenfolge' : ''}.`
    : 'Eine gesicherte Erbfolge ist bislang nicht näher überliefert.';
  content.sections.court = content.extinct ? 'Die Familie besitzt keine heutigen Amtsinhaber.' : content.currentHead
    ? `${content.currentHead} führt ${content.name}.` : 'Ein heutiges Familienoberhaupt ist nicht eindeutig belegt.';
  if (record.id === 'haus-vaeren') {
    content.offices = [memberCard(record, 'skjor-vaeren', 'Jarl von Heldenwacht')];
    content.sections.court = 'König Sigurd Vaeren steht an der Spitze des Königshauses. Skjor Vaeren führt als Jarl die Verwaltung des Jarltums Heldenwacht und dessen eigenen Jarlsrat. Königsrat und Jarlsrat sind voneinander zu unterscheiden.';
  }
}

function metadataSummary(record) {
  const facts = readPreparedHouseFacts(record);
  const overview = describePreparedHouse(facts).replace('in der Grafschaft Kronental', 'im Jarltum Heldenwacht')
    .replace('liegt in Jarltümliche Herrschaft – Tal der Helden.', 'liegt im Tal der Helden.')
    .replace('liegt in Klageschild-Inseln.', 'liegt auf den Klageschild-Inseln.');
  return { overview, history: '', character: '', customs: '', holdings: facts.profile.seat ? `Der verzeichnete Sitz ist ${facts.profile.seat}.` : '',
    culture: '', relations: facts.liege ? `Die überlieferte Dienstbindung gilt ${facts.liege}.` : '', trivia: [] };
}

async function readInitialPages(rows) {
  if (!sameIds(rows.map(row => row.id), ['haus-suedstahl', 'haus-albholz'])) throw new Error('Unexpected existing-page scope.');
  const pages = new Map();
  for (const row of rows) {
    const url = new URL(row.archive, root);
    requireInside(url, new URL('initial-house-pages/', import.meta.url), 'initial page archive');
    const bytes = await readFile(url);
    if (sha(bytes) !== row.sha256 || bytes.length !== row.bytes) throw new Error(`Initial page archive changed: ${row.id}`);
    if (!(await readFile(new URL(row.source, root))).equals(bytes)) throw new Error(`Existing public page changed: ${row.id}`);
    const sandbox = { window: {} };
    runInNewContext(bytes.toString('utf8'), sandbox, { timeout: 1000 });
    const data = sandbox.window.HAEUSER_DATA;
    if (data?.meta?.id !== row.id || data.familyTreeEmbed?.familyId && data.familyTreeEmbed.familyId !== row.id) {
      throw new Error(`Initial page identity mismatch: ${row.id}`);
    }
    pages.set(row.id, { receipt: row, data });
  }
  return pages;
}

function mergeInitialPage(content, record, initial, source) {
  if (!initial) return [];
  const old = initial.data;
  content.aliases = [...new Set([...(content.aliases || []), ...(initial.receipt.registryEntry.aliases || [])])];
  const preservedSections = Object.fromEntries(Object.entries(old.sections).filter(([key]) => key !== 'familyTree'));
  content.sections = { ...content.sections, ...preservedSections, ...source.reviewedSections };
  content.sections.classification = content.sections.classification.replace('Königlichen Jarltums Kronental', 'Jarltums Heldenwacht');
  for (const key of ['founding', 'milestoneOne', 'milestoneTwo', 'people', 'wealth', 'religion', 'patronDeities', 'origin', 'allies', 'enemies']) {
    if (old.profile[key]) content.profile[key] = old.profile[key];
  }
  const alternatePortraits = [];
  content.figuresTitle = old.figures.tableTitle;
  content.figures = old.figures.entries.map(entry => {
    const id = entry.imageKey.replace(/^figur-/, '');
    const card = memberCard(record, id, entry.role);
    const asset = old.images[entry.imageKey];
    if (!asset?.src) throw new Error(`Missing preserved figure image: ${record.id}/${id}`);
    const image = decodeURIComponent(asset.src);
    if (!image.startsWith('../Stammbäume/assets/images/portraits/')) throw new Error(`Unexpected preserved portrait path: ${image}`);
    alternatePortraits.push({ id, image });
    const description = entry.description.replace('dient König Sigurd als Schatten des Jarls', 'dient dem Jarl als Schatten')
      .replace('Die Hierarchie der Quelle führt ihn als nächsten Erben des Clans.', 'Er ist als nächster Erbe des Clans vorgesehen.');
    return { ...card, image, detail: entry.group, description };
  });
  const officeIds = record.id === 'haus-suedstahl' ? ['raghan-suedstahl', 'freydis-tauwind'] : ['toran-albholz'];
  content.offices = officeIds.map(id => {
    const figure = content.figures.find(entry => entry.id === id);
    if (!figure) throw new Error(`Missing preserved court role: ${record.id}/${id}`);
    return { ...figure };
  });
  content.trivia = [...new Set([...(old.trivia || []), ...content.trivia])];
  return alternatePortraits;
}

async function validateContent(content, record, alternatePortraits) {
  if (content.id !== record.id || content.page !== 'haus.html' || !content.registerPage
    || content.county !== 'Kronental' || content.territoryId !== territory.id) throw new Error(`Invalid page identity: ${record.id}`);
  for (const key of ['troopStrength', 'tiarna', 'kerns', 'fleet']) {
    if (content.profile[key]) throw new Error(`Military profile populated: ${record.id}`);
  }
  const quantity = '(?:\\d[\\d.,\\u00a0]*(?:\\s+\\d+)*|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwanzig|vierzig|fünfzig|hundert|tausend)';
  const amount = new RegExp(`\\b${quantity}\\s+(?:Mann|Huskarle?n?|Hirdmännern?|Walküren|(?:Waffen)?knecht(?:e|en)?|Stadtwach(?:e|en)|Soldat(?:en)?|Kriegern?|Kriegsschiff(?:e|en)?)\\b`, 'iu');
  if (amount.test(JSON.stringify([content.sections, content.biographySummary, content.figures, content.trivia]))) {
    throw new Error(`Military quantity in prose: ${record.id}`);
  }
  const entries = [content.founder, ...content.heads, ...content.heirs, ...content.offices, ...content.figures].filter(Boolean);
  for (const entry of entries) {
    if (entry.id) {
      const person = record.family.persons.find(row => row.id === entry.id);
      if (entry.familyId !== record.id || !person || person.name !== entry.name) throw new Error(`Unverified member: ${record.id}/${entry.id}`);
      if (entry.image && entry.image !== `../Stammbäume/${person.portrait}`
        && !alternatePortraits.some(row => row.id === entry.id && row.image === entry.image)) throw new Error(`Unverified portrait: ${record.id}/${entry.id}`);
    }
    if (entry.image) await access(new URL(entry.image, feature));
  }
  for (const field of ['crest', 'scene', 'banner']) if (content.images[field]) await access(new URL(content.images[field], feature));
  for (const entry of content.warriorGallery?.entries || []) await access(new URL(entry.image, feature));
  if (content.extinct !== historicalIds.includes(record.id)) throw new Error(`Historical status changed: ${record.id}`);
  if (content.extinct && (content.currentHead || content.firstHeir || content.heirs.length
    || content.profile.highestTitle !== 'Offen' || /Norrnaigh|Glaennath|Ausgestorbene Clans/.test(content.profile.seat))) {
    throw new Error(`Invalid historical presentation: ${record.id}`);
  }
  if (['haus-grimr', 'haus-skaife', 'haus-holmr'].includes(record.id) && content.profile.seat !== 'Torrenheim') {
    throw new Error(`Historical Torrenheim seat lost: ${record.id}`);
  }
  if (['haus-morchaon', 'haus-hvelgrson'].includes(record.id)
    && (content.profile.highestTitle !== 'Bürgerlich' || content.liege || content.profile.liege)) throw new Error(`Civil family assigned rank/liege: ${record.id}`);
  if (record.id === 'haus-spindelschlag' && (content.profile.highestTitle !== 'Bürgerlich' || content.liege !== 'Clan Vaeren')) {
    throw new Error('Spindelschlag must remain a civil family with its existing Vaeren bond.');
  }
  if (record.id === 'haus-frostzorn' && (content.extinct || content.currentHead !== 'Vorn Frostzorn'
    || /seit 1697|ab 1697|1697\s*[–-]/.test(content.sections.court))) throw new Error('Frostzorn birth/office distinction lost.');
}

const baseline = await json('baseline.json');
const review = await json('source-content.json');
const summaries = await json('biography-summaries.json');
const originals = await json('original-images.json');
const generated = await json('generated-images.json');
if (review.status !== 'editorially-reviewed-ready') throw new Error('Editorial review incomplete.');
const authority = JSON.parse(await readFile(new URL('Kontinente/modules/heldenwacht/authority.source.json', root), 'utf8'));
if (authority.chain.find(row => row.office === 'König')?.person !== 'Sigurd Vaeren'
  || authority.chain.find(row => row.office === 'Jarl' && row.territoryId === territory.id)?.person !== 'Skjor Vaeren'
  || authority.reversion?.automaticInheritance !== false) throw new Error('Vaeren authority/office distinction changed.');
const oldById = uniqueRows(baseline, 'baseline');
const sourcesById = uniqueRows(review.houses, 'reviewed sources');
const originalsById = uniqueRows(originals.filter(row => row.primary), 'primary originals');
const generatedById = uniqueRows(generated.filter(row => row.role === 'warrior'), 'generated figures');
const records = FAMILY_REGISTRY.filter(record => record.folderPath?.[0] === 'Aldrimar' && record.folderPath?.[1] === 'Kronental');
if (records.length !== 29 || oldById.size !== 29 || sourcesById.size !== 19 || originals.length !== 19
  || originalsById.size !== 18 || generated.length !== 11 || generatedById.size !== 11) throw new Error('Unexpected Kronental scope.');
if (!sameIds(oldById.keys(), [...sourceIds, ...preparedIds]) || !sameIds(records.map(row => row.id), oldById.keys())
  || !sameIds(sourcesById.keys(), sourceIds) || !sameIds(Object.keys(summaries), sourceIds)
  || !sameIds(originalsById.keys(), sourceIds.filter(id => id !== 'haus-frostzorn'))
  || !sameIds(generatedById.keys(), generatedIds)) throw new Error('Canonical/source/art allowlist mismatch.');
const imagePaths = new Set();
for (const art of originals) {
  if (!oldById.has(art.id) || generatedById.has(art.id) || art.role !== 'warrior' || imagePaths.has(art.assetPath)) {
    throw new Error(`Unexpected/duplicate original: ${art.id}`);
  }
  imagePaths.add(art.assetPath);
}
if (originals.filter(row => row.id === 'haus-wellensaenger').length !== 2
  || originals.some(row => row.id !== 'haus-wellensaenger' && !row.primary)) throw new Error('Original variants changed.');
await requireAbsent(outputManifest);
await access(new URL(territory.href, feature));
const initialPages = await readInitialPages(await json('initial-house-pages.json'));

// Assemble every source and validate all canonical data/assets before any write.
const pending = await Promise.all(records.map(async record => {
  const previous = oldById.get(record.id);
  assertCanonicalBaseline(record, previous);
  const source = sourcesById.get(record.id);
  const summary = source ? summaries[record.id] : metadataSummary(record);
  if (!summary?.overview || Object.values(summary).some(value => value === undefined)) throw new Error(`Missing summary: ${record.id}`);
  const original = originalsById.get(record.id), art = original || generatedById.get(record.id);
  const variants = originals.filter(row => row.id === record.id);
  const artInputs = original ? variants : [art];
  const [imageMetadata, archiveBytes] = await Promise.all([
    Promise.all(artInputs.map(row => inspectArt(row, Boolean(original)))), inspectSource(source)
  ]);
  const segments = [...record.folderPath.slice(2), record.title].map(safeName);
  if (segments.some(value => !value)) throw new Error(`Empty output path: ${record.id}`);
  const relativeDirectory = `Estryll/Aldrimar/Kronental/${segments.join('/')}`;
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
  content.images.sceneAlt = `${content.extinct ? 'Historische' : 'Repräsentative'} Hausdarstellung · ${record.title}`;
  if (variants.length > 1) content.warriorGallery = {
    title: 'Krieger des Clans', description: '',
    entries: variants.map((row, index) => ({ name: `${record.title} · Darstellung ${index + 1}`, image: `../${row.assetPath}`, description: '' }))
  };
  curateMembers(content, record);
  const initial = initialPages.get(record.id);
  const alternatePortraits = mergeInitialPage(content, record, initial, source);
  await validateContent(content, record, alternatePortraits);
  assertCanonicalBaseline(record, previous);
  const manifest = { id: record.id, contentVersion: CONTENT_VERSION, source: source?.source || null,
    initialPage: initial?.receipt || null,
    authority: { familyId: record.id, baselineSourceRevision: previous.sourceRevision, profile: previous.profile, graphFingerprint: previous.graphFingerprint },
    genealogy: { imported: false, familyId: record.id, iframe: true }, militaryStatistics: { imported: false },
    illustration: { ...art, ...imageMetadata[artInputs.indexOf(art)], original: Boolean(original), representative: true, namedPersonId: '' },
    illustrations: artInputs.map((row, index) => ({ ...row, ...imageMetadata[index], original: Boolean(original), representative: true, namedPersonId: '' })),
    decisions: [...(source?.decisions || []),
      ...(source ? [] : ['Nur vorhandene Registermetadaten; keine gelieferte HTML-Vorlage oder neue Hausgeschichte.']),
      ...(initial ? ['Bestehende Kapitel, Hofrollen, Figurenbeschreibungen und lokale Portraits gezielt erhalten. Das alte Genealogiekapitel wird durch den kanonischen Iframe ersetzt.'] : []),
      'Kronental bleibt Register- und Ordnername; der aktuelle Herrschaftsverweis lautet Jarltum Heldenwacht.',
      'Aktuelle IDs, Ränge, Orte, die fünf erloschenen Clans und ihre historischen Sitze bleiben erhalten.',
      'Vorlagenstammbäume und Militärstatistiken vollständig ignoriert; Graphen und Profile bleiben unverändert.',
      'lineageRole allein begründet keine aktuelle Amtsbesetzung oder Erbfolge. Lebensdaten sind keine Amtszeiten.',
      'König Sigurd und Jarl Skjor Vaeren bleiben getrennte Amtsträger; der Jarlsrat ist kein Königsrat.',
      'Die repräsentativen Hausfiguren werden keinen neu benannten Angehörigen zugewiesen.',
      'Spindelschlag bleibt bürgerlich mit Vaeren-Bindung; Morchaon und Hvelgrson bleiben bürgerlich ohne Lehnsherrn.'] };
  return { id: record.id, relativeDirectory, directory, source, archiveBytes, content, manifest, image: art.assetPath, original: Boolean(original) };
}));
if (new Set(pending.map(row => row.directory.href)).size !== 29) throw new Error('Output-directory collision.');
for (const record of records) assertCanonicalBaseline(record, oldById.get(record.id));

for (const row of pending) {
  await mkdir(row.directory, { recursive: true });
  await writeFile(new URL('haus.content.mjs', row.directory), `// Geprüfte redaktionelle Quelle; kanonische Familienakten bleiben maßgeblich.\nexport const HOUSE_CONTENT = ${JSON.stringify(row.content, null, 2)};\n`, { flag: 'wx' });
  if (row.source) await writeFile(new URL('animexx-source-2026-11-03.html', row.directory), row.archiveBytes, { flag: 'wx' });
  await writeFile(new URL('source-manifest.json', row.directory), JSON.stringify(row.manifest, null, 2) + '\n', { flag: 'wx' });
}
await writeFile(outputManifest, JSON.stringify(pending.map(({ id, relativeDirectory, content, image, original, source }) =>
  ({ id, relativeDirectory, image, original, suppliedSource: Boolean(source), extinct: content.extinct, prepared: content.prepared })), null, 2) + '\n', { flag: 'wx' });
console.log(`${pending.length} Kronental-Hausquellen angelegt.`);
