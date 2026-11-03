/** Emit compact public image metadata; prompts and generator paths stay sources. */
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const realm = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (relative, fallback) => {
  try { return JSON.parse(await readFile(path.join(realm, relative), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
};
const exists = async relative => { try { await access(path.join(realm, relative)); return true; } catch { return false; } };
const emit = async (file, exports) => writeFile(path.join(realm, file),
  '/** Generated compact runtime metadata. Sources and full prompts stay outside the runtime. */\n' +
  exports.map(([name, data]) => `export const ${name} = ${JSON.stringify(data, null, 2)};`).join('\n'), 'utf8');

const heraldry = await readJson('sources/heraldry-generation-jobs.json', { jobs: [] });
const casteJobs = await readJson('sources/caste-generation-jobs.json', { jobs: [] });
let territories = { ARCHONATES: [], SETTLEMENTS: [], SOURCE_HOUSE_SEATS: {} };
if (await exists('territory-data.mjs')) territories = await import(pathToFileURL(path.join(realm, 'territory-data.mjs')).href);
const seatSource = await readJson('sources/house-seat-proposal.json', { records: [] });
const seatRows = Array.isArray(seatSource) ? seatSource : seatSource.records || [];
const seats = new Map(seatRows.map(item => [item.houseId, item.settlementId]));
const sourceSeats = territories.SOURCE_HOUSE_SEATS;
if (Array.isArray(sourceSeats)) for (const row of sourceSeats) seats.set(row.houseId, row.settlementId || row.seatId);
else if (sourceSeats) for (const [id, value] of Object.entries(sourceSeats)) seats.set(id, typeof value === 'string' ? value : value.settlementId || value.seatId);
const zaphias = territories.SETTLEMENTS?.find(city => city.name === 'Zaphias');
if (zaphias) seats.set('house-mede', zaphias.id);

async function imagePaths(category, stem) {
  const image = `assets/${category}/previews/${stem}.webp`;
  const fullsize = `assets/${category}/production/${stem}.png`;
  const ready = await exists(image) && await exists(fullsize);
  return { image: ready ? image : null, fullsize: ready ? fullsize : null, ready };
}

const originals = [
  ['apinia','Apinia','Eine große silberweiße Feder mit goldenen und kupferorangenen Akzenten auf dunklem Feld.',['Schwarz','Silberweiß','Kupferorange'],'Silber'],
  ['bolar','Bolar','Ein elfenbeinweißer Oktopus auf dunkelgrünem Feld.',['Dunkelgrün','Elfenbein','Gold'],'Gold'],
  ['lex','Lex','Ein silberner antiker Helm mit weißem Kamm zwischen Lorbeerzweigen.',['Schwarz','Silber'],'Silber'],
  ['orania','Orania','Ein steigendes silberweißes Pferd auf dunklem violettem Feld.',['Dunkelviolett','Silberweiß','Bronze'],'Bronze'],
  ['pelagia','Pelagia','Ein goldenes heraldisches Seepferd zwischen azurblauen Wellenranken.',['Nachtblau','Gold','Azur'],'Gold'],
  ['tremelia','Tremelia','Zwei einander zugewandte goldene Seepferdchen auf petrolgrünem Feld.',['Petrolgrün','Elfenbein','Gold'],'Gold'],
  ['mede','Mede','Ein goldener aufrechter Olivenzweig mit seitlichen Zweigen auf petrolfarbenem Feld.',['Petrol','Gold','Elfenbein'],'Gold']
];
const houses = [];
for (const [stem, name, motif, palette, frame] of originals) {
  const ready = await exists(`assets/originals/${stem}.png`) && await exists(`assets/originals/previews/${stem}.webp`);
  houses.push({ id:'house-'+stem, name:'Haus '+name, crest:ready ? `assets/originals/previews/${stem}.webp` : null,
    fullsize:ready ? `assets/originals/${stem}.png` : null, original:ready ? `assets/originals/${stem}.png` : null,
    motif, palette, frame, rank:stem==='mede' ? 'Kaiserliche Linie' : 'Archon', caste:stem==='mede' ? 'Illustris' : 'Patrizier',
    sourceSeat:seats.get('house-'+stem) || null, archonateId:territories.ARCHONATES?.find(item=>item.houseId==='house-'+stem)?.id || null,
    status:'supplied', ready, imperialDomain:stem==='mede' });
}
for (const job of heraldry.jobs.filter(item => item.kind === 'house' && item.active !== false)) {
  const art = await imagePaths(job.category, job.assetStem);
  houses.push({ id:job.id, name:job.name, crest:art.image, fullsize:art.fullsize, original:null,
    motif:job.motif, palette:job.palette, frame:job.frame, rank:null, sourceSeat:null, status:'proposal', ready:art.ready });
}

const artworks = [{ id:'realm-argentum', name:'Das Kaiserreich Argentum', kind:'realm',
  image:'assets/originals/previews/argentum.webp', fullsize:'assets/originals/argentum.png', original:'assets/originals/argentum.png',
  description:'Das gelieferte Zeichen des Silbernen Kaiserreichs. Leukonia ist eine seiner drei großen Provinzen.',
  palette:['Nachtblau','Gold'], ready:await exists('assets/originals/argentum.png'), status:'supplied' }];
for (const job of heraldry.jobs.filter(item => item.kind !== 'house' && item.active !== false)) {
  artworks.push({ id:job.id, name:job.name, kind:job.kind, ...await imagePaths(job.category, job.assetStem),
    description:job.motif, motif:job.motif, palette:job.palette, frame:job.frame || null, houseId:job.houseId || null,
    archonateId:territories.ARCHONATES?.find(item=>item.houseId===job.houseId)?.id || null, status:'proposal' });
}
for (const job of casteJobs.jobs) artworks.push({ id:job.assetStem, name:job.name, kind:'caste',
  ...await imagePaths(job.category, job.assetStem), status:'illustration' });

const warriorJobs = await readJson('sources/house-warrior-generation-jobs.json', { jobs: [] });
const warriors = [];
for (const job of warriorJobs.jobs) {
  const art = await imagePaths('warriors', job.assetStem);
  if (!art.ready) continue;
  warriors.push({ id:job.houseId, houseId:job.houseId, prototypeId:job.prototypeId, ...art,
    description:job.description, reason:job.description, equipment:job.equipment, palette:job.palette,
    mount:job.mount || null, role:job.role, status:'proposal' });
}
await emit('house-data.mjs', [['HOUSES', houses]]);
await emit('art-data.mjs', [['ARTWORKS', artworks]]);
await writeFile(path.join(realm, 'warrior-data.mjs'),
  `export { CLASS_PROTOTYPES } from './class-prototype-data.mjs';\nexport const WARRIORS = ${JSON.stringify(warriors, null, 2)};\n`, 'utf8');
console.log(JSON.stringify({ houses:houses.length, readyHouseEmblems:houses.filter(x=>x.ready).length, artworks:artworks.length,
  readyArtworks:artworks.filter(x=>x.ready).length, houseWarriors:warriors.length }));
