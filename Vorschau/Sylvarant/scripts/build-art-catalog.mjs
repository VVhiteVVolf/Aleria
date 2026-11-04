/** Build public Sylvarant metadata; prompts and local paths remain in sources. */
import { createCountryArtCatalogSource } from '../../shared/art-catalog-source.mjs';
import { HOUSES as LEUKONIA_HOUSES } from '../../Leukonia/house-data.mjs';
import { WARRIORS as LEUKONIA_WARRIORS } from '../../Leukonia/warrior-data.mjs';
import { SOURCE_HOUSE_SEATS } from '../territory-data.mjs';

const root = new URL('../', import.meta.url);
const { readJson, exists, jobsFrom, artwork, emit } = createCountryArtCatalogSource(root);
const optionalJson = async file => await exists(file) ? readJson(file) : {};

function assertUnique(entries, field, expected, label) {
  if (entries.length !== expected || new Set(entries.map(entry => entry[field])).size !== expected) {
    throw new Error(`Expected ${expected} unique ${label}.`);
  }
}

const supplied = (await readJson('sources/supplied-emblems.json')).suppliedEmblems;
const notes = await readJson('sources/supplied-house-notes.json');
const houseSources = supplied.filter(item => item.kind === 'house');
const newHouseJobs = await jobsFrom('additional-emblem-jobs.json');
assertUnique(houseSources, 'id', 17, 'supplied houses');
assertUnique(newHouseJobs, 'id', 13, 'additional house crests');

const houses = [];
for (const source of houseSources) {
  const facts = notes[source.id];
  if (!facts?.motif || !Array.isArray(facts.palette)) throw new Error(`Missing inspected house facts: ${source.id}`);
  const mede = source.id === 'house-mede';
  const existing = mede && LEUKONIA_HOUSES.find(house => house.id === source.id);
  const seat = SOURCE_HOUSE_SEATS.find(item => item.houseId === source.id);
  houses.push({ id: source.id, name: `Haus ${source.name}`, crest: source.preview, fullsize: source.original,
    original: source.original, ...facts, culture: 'argentum', rank: existing?.rank || null,
    caste: existing?.caste || null, imperialDomain: mede, sourceSeat: seat?.settlementId || null,
    status: 'supplied', ready: await exists(source.original) && await exists(source.preview) });
}
for (const job of newHouseJobs) {
  const art = await artwork('emblems', job.assetStem);
  houses.push({ id: job.id, name: job.name, crest: art.image, fullsize: art.fullsize, original: null,
    motif: job.motif, palette: job.palette, frame: job.frame, culture: 'argentum', rank: null,
    caste: null, sourceSeat: null, status: 'proposal', ready: art.ready });
}
assertUnique(houses, 'id', 30, 'house IDs');

const prototypesJobs = (await Promise.all(['a', 'b', 'root'].map(suffix => jobsFrom(`prototypes-${suffix}-jobs.json`)))).flat();
assertUnique(prototypesJobs, 'id', 7, 'class prototypes');
const prototypeRevisions = await optionalJson('sources/prototype-revisions.json');
const prototypes = [];
for (const original of prototypesJobs.sort((a, b) => a.id.localeCompare(b.id))) {
  const revision = prototypeRevisions[original.id];
  const selected = revision ? (await readJson(revision.sourceJob)).jobs.find(job => job.assetStem === revision.assetStem) : original;
  if (!selected) throw new Error(`Missing selected prototype revision: ${original.id}`);
  const job = { ...selected, id: original.id };
  prototypes.push({ id: job.id, name: job.name, role: job.role, description: job.description,
    equipment: job.equipment, palette: job.palette, mount: job.mount || null,
    exclusiveHouseId: job.exclusiveHouseId || null, ...await artwork('warriors', job.assetStem), status: 'proposal' });
}

const suppliedRealm = supplied.find(item => item.kind === 'realm');
if (!suppliedRealm) throw new Error('Missing supplied imperial crest.');
const artworks = [{ id: suppliedRealm.id, name: 'Kaiserreich Argentum', kind: 'realm',
  image: suppliedRealm.preview, fullsize: suppliedRealm.original, original: suppliedRealm.original,
  description: 'Das unverändert übernommene Reichswappen des Kaiserreiches Argentum.', status: 'supplied',
  ready: await exists(suppliedRealm.original) && await exists(suppliedRealm.preview) }];
const revisions = await readJson('sources/artwork-revisions.json');
for (const originalJob of await jobsFrom('province-emblem-job.json')) {
  const revision = revisions[originalJob.id];
  const selected = revision ? (await readJson(revision.sourceJob)).jobs.find(job => job.assetStem === revision.assetStem) : originalJob;
  if (!selected) throw new Error(`Missing selected province revision: ${originalJob.id}`);
  artworks.push({ id: originalJob.id, name: selected.name, kind: selected.kind,
    description: selected.description || selected.motif, motif: selected.motif, palette: selected.palette,
    frame: selected.frame, ...await artwork('emblems', selected.assetStem), status: 'proposal' });
}

const mede = LEUKONIA_WARRIORS.find(warrior => warrior.houseId === 'house-mede');
if (!mede?.ready) throw new Error('The existing approved imperial Mede warrior is missing.');
const medePath = value => value ? `../Leukonia/${value}` : null;
const warriors = [{ ...mede, prototypeId: null, image: medePath(mede.image), fullsize: medePath(mede.fullsize), status: 'supplied' }];
const warriorJobs = (await Promise.all(['house-warriors-supplied-jobs.json', 'house-warriors-additional-jobs.json'].map(jobsFrom))).flat();
const pullo = prototypesJobs.find(job => job.id === 'prototype-07');
warriorJobs.push({ ...pullo, id: pullo.houseId, prototypeId: pullo.id });
assertUnique(warriorJobs, 'houseId', 29, 'new house warriors');
const warriorRevisions = (await optionalJson('sources/house-warrior-revisions.json')).jobs || [];
const revisedByHouse = new Map(warriorRevisions.map(job => [job.houseId, job]));
if (revisedByHouse.size !== warriorRevisions.length) throw new Error('Duplicate house warrior revisions.');
for (const revision of warriorRevisions) {
  const original = warriorJobs.find(job => job.houseId === revision.houseId);
  if (!original || revision.supersedesAssetStem !== original.assetStem || revision.prototypeId !== original.prototypeId
      || revision.assetStem === original.assetStem) throw new Error(`Invalid house warrior revision: ${revision.houseId}`);
}
const houseIds = new Set(houses.map(house => house.id));
for (const original of warriorJobs) {
  const job = revisedByHouse.get(original.houseId) || original;
  if (!houseIds.has(job.houseId) || !prototypes.some(prototype => prototype.id === job.prototypeId)
      || (job.prototypeId === 'prototype-07' && job.houseId !== 'house-pullo')
      || typeof job.description !== 'string' || !job.description.trim() || job.description.length > 1000
      || !Array.isArray(job.equipment) || !job.equipment.every(item => typeof item === 'string' && item.length < 120)) {
    throw new Error(`Invalid public house warrior metadata: ${job.houseId}`);
  }
  const art = await artwork('warriors', job.assetStem);
  if (!art.ready) continue;
  warriors.push({ id: job.houseId, houseId: job.houseId, prototypeId: job.prototypeId, role: job.role,
    description: job.description, reason: job.description, equipment: job.equipment, palette: job.palette,
    mount: job.mount || null, ...art, status: 'proposal' });
}

await emit('house-data.mjs', [['HOUSES', houses]]);
await emit('warrior-data.mjs', [['CLASS_PROTOTYPES', prototypes], ['WARRIORS', warriors]]);
await emit('art-data.mjs', [['ARTWORKS', artworks]]);
console.log(JSON.stringify({ houses: houses.length, readyHouses: houses.filter(item => item.ready).length,
  prototypes: prototypes.length, readyPrototypes: prototypes.filter(item => item.ready).length,
  artworks: artworks.length, readyArtworks: artworks.filter(item => item.ready).length, houseWarriors: warriors.length }));
