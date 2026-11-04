/** Compact runtime metadata only; prompts and generator paths stay in sources. */
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const realm = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async relative => JSON.parse(await readFile(path.join(realm, relative), 'utf8'));
const exists = async relative => { try { await access(path.join(realm, relative)); return true; } catch { return false; } };
const emit = (file, exports) => writeFile(path.join(realm, file),
  '/** Generated compact runtime metadata. Source prompts are not runtime data. */\n' +
  exports.map(([name, data]) => `export const ${name} = ${JSON.stringify(data, null, 2)};`).join('\n') + '\n', 'utf8');

const houseManifests = ['heraldry-colony-jobs.json', 'heraldry-tlapanui-a-jobs.json', 'heraldry-tlapanui-b-jobs.json'];
const houseJobs = (await Promise.all(houseManifests.map(file => readJson('sources/' + file)))).flatMap(source => source.jobs);
const emblemRevisions = await exists('sources/house-emblem-revisions.json') ? await readJson('sources/house-emblem-revisions.json') : {};
if (houseJobs.length !== 28 || new Set(houseJobs.map(job => job.id)).size !== 28
  || houseJobs.filter(job => job.culture === 'argentum').length !== 11
  || houseJobs.filter(job => job.culture === 'tlapanui').length !== 17) throw new Error('Incomplete Calidaria heraldry scope.');
const nameSource = await readJson('sources/house-name-assignments.json');
const houseJobsById = new Map(houseJobs.map(job => [job.id, job]));
const assignedNames = new Map();
for (const entry of nameSource.entries) {
  const job = houseJobsById.get(entry.houseId);
  if (!job || assignedNames.has(entry.houseId) || entry.culture !== job.culture
    || typeof entry.name !== 'string' || !entry.name.trim()) {
    throw new Error('Invalid Calidaria house name assignment: ' + entry.houseId);
  }
  assignedNames.set(entry.houseId, entry.name.trim());
}
if (assignedNames.size !== houseJobs.length) throw new Error('Incomplete Calidaria house name assignments.');

async function artwork(category, stem) {
  const image = `assets/${category}/previews/${stem}.webp`;
  const fullsize = `assets/${category}/production/${stem}.png`;
  const ready = await exists(image) && await exists(fullsize);
  return { image: ready ? image : null, fullsize: ready ? fullsize : null, ready };
}
async function selectedJob(job, revisions) {
  const revision = revisions[job.id];
  const selected = revision?.sourceJob
    ? (await readJson(revision.sourceJob)).jobs.find(item => item.assetStem === revision.assetStem)
    : job;
  if (!selected) throw new Error('Missing selected emblem revision: ' + job.id);
  return { ...selected, id: job.id, name: job.name, assetStem: revision?.assetStem || job.assetStem };
}
const houses = [];
const { HOUSES: leukoniaHouses } = await import('../../Leukonia/house-data.mjs');
const { WARRIORS: leukoniaWarriors } = await import('../../Leukonia/warrior-data.mjs');
const { SOURCE_HOUSE_SEATS } = await import(pathToFileURL(path.join(realm, 'territory-data.mjs')).href);
const sourceMede = leukoniaHouses.find(house => house.id === 'house-mede');
const medeSeat = SOURCE_HOUSE_SEATS.find(seat => seat.houseId === 'house-mede');
if (!sourceMede || !medeSeat) throw new Error('Missing confirmed Mede source or capital assignment.');
const medePath = relative => relative ? '../Leukonia/' + relative : null;
houses.push({ id: sourceMede.id, name: sourceMede.name, crest: medePath(sourceMede.crest),
  fullsize: medePath(sourceMede.fullsize), original: medePath(sourceMede.original),
  motif: sourceMede.motif, palette: sourceMede.palette, frame: sourceMede.frame,
  culture: 'argentum', rank: sourceMede.rank, caste: sourceMede.caste,
  sourceSeat: medeSeat.settlementId, imperialDomain: true, status: 'supplied', ready: sourceMede.ready });
for (const job of houseJobs) {
  const selected = await selectedJob(job, emblemRevisions);
  const art = await artwork('emblems', selected.assetStem);
  houses.push({ id: job.id, name: 'Haus ' + assignedNames.get(job.id), crest: art.image, fullsize: art.fullsize, original: null,
    motif: selected.motif, palette: selected.palette, frame: selected.frame, culture: job.culture,
    rank: null, sourceSeat: null, status: 'proposal', ready: art.ready });
}
if (new Set(houses.map(house => house.name.normalize('NFKC').toLowerCase())).size !== houses.length) {
  throw new Error('Duplicate displayed house names in Calidaria.');
}
const prototypeJobs = (await Promise.all(['a', 'b', 'root'].map(suffix => readJson(`sources/prototypes-${suffix}-jobs.json`)))).flatMap(source => source.jobs);
const captions = await readJson('sources/prototype-captions.json');
const revisions = await exists('sources/prototype-revisions.json') ? await readJson('sources/prototype-revisions.json') : {};
if (prototypeJobs.length !== 5 || new Set(prototypeJobs.map(job => job.id)).size !== 5) throw new Error('Expected five unique Tlapanui prototypes.');
const prototypes = [];
for (const job of prototypeJobs.sort((a, b) => a.id.localeCompare(b.id))) {
  const caption = captions[job.id];
  if (!caption) throw new Error('Missing concise prototype caption: ' + job.id);
  prototypes.push({ id: job.id, name: caption.role, ...caption, ...await artwork('warriors', revisions[job.id]?.assetStem || job.assetStem),
    mount: null, status: 'proposal' });
}
const artworks = [];
if (await exists('sources/province-heraldry-jobs.json')) {
  const source = await readJson('sources/province-heraldry-jobs.json');
  const revisions = await exists('sources/artwork-revisions.json') ? await readJson('sources/artwork-revisions.json') : {};
  for (const job of source.jobs) {
    const selected = await selectedJob(job, revisions);
    const kind = selected.kind || (job.id === 'province-calidaria' ? 'province' : 'ancient');
    artworks.push({ id: job.id, name: job.name, kind, ...await artwork('emblems', selected.assetStem),
      description: selected.description || selected.motif, motif: selected.motif, palette: selected.palette,
      frame: selected.frame, status: 'proposal' });
  }
}
await emit('house-data.mjs', [['HOUSES', houses]]);
const sourceMedeWarrior = leukoniaWarriors.find(warrior => warrior.houseId === 'house-mede');
const warriors = sourceMedeWarrior ? [{ ...sourceMedeWarrior, prototypeId: null,
  image: medePath(sourceMedeWarrior.image), fullsize: medePath(sourceMedeWarrior.fullsize), status: 'supplied' }] : [];
const warriorManifests = ['house-warriors-colony-jobs.json', 'house-warriors-tlapanui-a-jobs.json', 'house-warriors-tlapanui-b-jobs.json'];
const warriorJobs = [];
for (const file of warriorManifests) {
  if (await exists('sources/' + file)) warriorJobs.push(...(await readJson('sources/' + file)).jobs);
}
const seenWarriorHouses = new Set();
for (const job of warriorJobs) {
  if (!houseJobsById.has(job.houseId) || seenWarriorHouses.has(job.houseId)
    || typeof job.description !== 'string' || !job.description.trim() || job.description.length > 1000
    || typeof job.role !== 'string' || !Array.isArray(job.equipment)
    || !job.equipment.every(item => typeof item === 'string' && item.length < 120)) {
    throw new Error('Invalid concise Calidaria house warrior metadata: ' + job.houseId);
  }
  seenWarriorHouses.add(job.houseId);
  const art = await artwork('warriors', job.assetStem);
  if (!art.ready) continue;
  warriors.push({ id: job.houseId, houseId: job.houseId, prototypeId: job.prototypeId || null,
    ...art, description: job.description, reason: job.description,
    equipment: job.equipment, palette: job.palette, mount: job.mount || null,
    role: job.role, status: 'proposal' });
}
await emit('warrior-data.mjs', [['CLASS_PROTOTYPES', prototypes], ['WARRIORS', warriors]]);
await emit('art-data.mjs', [['ARTWORKS', artworks]]);
console.log(JSON.stringify({ houses: houses.length, readyHouses: houses.filter(house => house.ready).length,
  prototypes: prototypes.length, readyPrototypes: prototypes.filter(prototype => prototype.ready).length,
  provinceAndAncientEmblems: artworks.length, readyProvinceAndAncientEmblems: artworks.filter(item => item.ready).length,
  houseWarriors: warriors.length }));
