/** Solestia owns its artwork facts; shared authoring IO owns file handling. */
import { createCountryArtCatalogSource } from '../../shared/art-catalog-source.mjs';
import { SOURCE_HOUSE_SEATS, SETTLEMENTS } from '../territory-data.mjs';

const { readJson, exists, jobsFrom, artwork, emit } = createCountryArtCatalogSource(new URL('../', import.meta.url));
const supplied = (await readJson('sources/supplied-emblems.json')).suppliedEmblems;
const original = supplied.find(item => item.id === 'realm-solestia');
if (!original) throw new Error('Missing supplied Solestia crest.');
const nameSource = await exists('sources/name-assignments.json') ? await readJson('sources/name-assignments.json') : { houses: [] };
const names = new Map(nameSource.houses.map(item => [item.houseId, item.name]));
const estateFacts = await readJson('sources/estate-facts.json');
const estateById = new Map(estateFacts.estates.map(estate => [estate.id,estate]));
const houseEstates = new Map();
for (const assignment of estateFacts.houseAssignments) {
  const estate = estateById.get(assignment.estateId);
  if (!estate?.present) throw new Error(`Invalid Solestia house estate: ${assignment.estateId}`);
  for (const houseId of assignment.houseIds) {
    if (houseEstates.has(houseId)) throw new Error(`Duplicate Solestia house estate: ${houseId}`);
    houseEstates.set(houseId,{ rank:estate.commonTitle,localTitle:estate.name,estateId:estate.id });
  }
}
if (houseEstates.size !== SOURCE_HOUSE_SEATS.length
    || SOURCE_HOUSE_SEATS.some(seat => !houseEstates.has(seat.houseId))) throw new Error('Incomplete Solestia house estates.');
const crestJobs = await jobsFrom('additional-emblem-jobs.json');
const crestCaptions = await readJson('sources/emblem-captions.json');
const crestRevisions = await exists('sources/house-emblem-revisions.json') ? await readJson('sources/house-emblem-revisions.json') : {};
if (crestJobs.length !== SETTLEMENTS.length + 1 || new Set(crestJobs.map(job => job.id)).size !== crestJobs.length) {
  throw new Error('Expected one supplied ducal crest, one house per town and two extra capital houses.');
}
const seatFor = id => SOURCE_HOUSE_SEATS.find(item => item.houseId === id)?.settlementId || null;
const houses = [{ id: 'house-ducal', name: names.get('house-ducal') ? `Haus ${names.get('house-ducal')}` : 'Herzogshaus · Name offen',
  crest: original.preview, fullsize: original.original, original: original.original, ready: await exists(original.original) && await exists(original.preview),
  motif: 'Ein schwarzer Stierkopf vor einer goldenen Strahlensonne, in einem dunkelgrün-goldenen Blumenrahmen.',
  palette: ['Schwarz', 'Gold', 'Dunkelgrün', 'Rot', 'Elfenbein'], frame: 'Dunkelgrün-goldener Blumenrahmen',
  culture: 'solestia', ...houseEstates.get('house-ducal'), sourceSeat: seatFor('house-ducal'), status: 'supplied' }];
for (const originalJob of crestJobs) {
  const revision = crestRevisions[originalJob.id];
  const selected = revision ? (await readJson(revision.sourceJob)).jobs.find(job => job.assetStem === revision.assetStem) : originalJob;
  if (!selected) throw new Error(`Missing Solestia crest revision: ${originalJob.id}`);
  const job = { ...selected, id: originalJob.id };
  const art = await artwork('emblems', job.assetStem);
  houses.push({ id: job.id, name: names.has(job.id) ? `Haus ${names.get(job.id)}` : job.name,
    crest: art.image, fullsize: art.fullsize, original: null, ready: art.ready,
    motif: crestCaptions[job.id] || job.motif, palette: job.palette, frame: job.frame, culture: 'solestia',
    ...houseEstates.get(job.id), sourceSeat: seatFor(job.id), status: 'proposal' });
}
if (new Set(houses.map(house => house.id)).size !== houses.length || (names.size && names.size !== houses.length)) {
  throw new Error('Invalid house names or IDs.');
}
const prototypes = [];
const prototypeJobs = await jobsFrom('prototypes-jobs.json');
if (prototypeJobs.length !== 5 || new Set(prototypeJobs.map(job => job.id)).size !== 5) throw new Error('Expected five Solestia prototypes.');
for (const job of prototypeJobs.sort((a,b) => a.id.localeCompare(b.id))) {
  prototypes.push({ id: job.id, name: job.name || job.role, role: job.role, description: job.description,
    equipment: job.equipment, palette: job.palette, mount: job.mount || null, ...await artwork('warriors', job.assetStem), status: 'proposal' });
}
const warriors = [];
const warriorJobs = (await Promise.all(['house-warriors-a-jobs.json', 'house-warriors-root-jobs.json'].map(jobsFrom))).flat();
const revisionJobs = await exists('sources/house-warrior-revisions.json') ? (await readJson('sources/house-warrior-revisions.json')).jobs : [];
const revisions = new Map(revisionJobs.map(job => [job.houseId, job]));
if (revisions.size !== revisionJobs.length || revisionJobs.some(job => !warriorJobs.some(original =>
  original.houseId === job.houseId && original.assetStem === job.supersedesAssetStem && original.prototypeId === job.prototypeId))) {
  throw new Error('Invalid Solestia figure revision.');
}
const houseIds = new Set(houses.map(house => house.id));
if (warriorJobs.length !== houses.length || new Set(warriorJobs.map(job => job.houseId)).size !== houses.length) throw new Error('Incomplete Solestia house warriors.');
for (const original of warriorJobs) {
  const job = revisions.get(original.houseId) || original;
  if (!houseIds.has(job.houseId) || !prototypes.some(item => item.id === job.prototypeId)
      || !job.description || job.description.length > 1000 || !Array.isArray(job.equipment)
      || Boolean(job.mount) !== (job.prototypeId === 'prototype-05')) {
    throw new Error(`Invalid Solestia warrior metadata: ${job.houseId}`);
  }
  const art = await artwork('warriors', job.assetStem);
  if (art.ready) warriors.push({ id: job.houseId, houseId: job.houseId, prototypeId: job.prototypeId,
    role: job.role, description: job.description, reason: job.description, equipment: job.equipment,
    palette: job.palette, mount: job.mount || null, ...art, status: 'proposal' });
}
const artworks = [{ id: 'realm-solestia', name: 'Herzogtum Solestia', kind: 'realm', image: original.preview,
  fullsize: original.original, original: original.original, ready: await exists(original.original) && await exists(original.preview),
  description: 'Das gelieferte Landeswappen mit schwarzem Stierkopf und goldener Strahlensonne.', status: 'supplied' }];
for (const job of await jobsFrom('ancient-emblem-jobs.json')) {
  artworks.push({ id: job.id, name: job.name, kind: 'ancient', description: job.description || job.motif,
    motif: job.motif, palette: job.palette, frame: job.frame, ...await artwork('emblems', job.assetStem), status: 'proposal' });
}
await emit('house-data.mjs', [['HOUSES', houses]]);
await emit('warrior-data.mjs', [['CLASS_PROTOTYPES', prototypes], ['WARRIORS', warriors]]);
await emit('art-data.mjs', [['ARTWORKS', artworks]]);
console.log(JSON.stringify({ houses: houses.length, readyHouses: houses.filter(item => item.ready).length,
  prototypes: prototypes.length, readyPrototypes: prototypes.filter(item => item.ready).length,
  artworks: artworks.length, readyArtworks: artworks.filter(item => item.ready).length, houseWarriors: warriors.length, namedHouses: names.size }));
