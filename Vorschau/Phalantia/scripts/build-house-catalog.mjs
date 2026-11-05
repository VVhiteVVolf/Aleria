import { readFile,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createCountryArtCatalogSource } from '../../shared/art-catalog-source.mjs';
const root = new URL('../',import.meta.url);
const {readJson,artwork} = createCountryArtCatalogSource(root);
const source = await readJson('sources/house-plan.json');
const rows = Array.isArray(source) ? source : source.houses;
if (!Array.isArray(rows) || rows.length !== 9) throw Error('Expected two royal and seven Perioikic house proposals.');
const houses = await Promise.all(rows.map(async entry => {
  const art = await artwork('emblems',entry.id);
  const crest = art.image || `assets/emblems/previews/${entry.id}.webp`;
  const fullsize = art.fullsize || `assets/emblems/production/${entry.id}.png`;
  return Object.fromEntries(Object.entries({
    id:entry.id,name:entry.name,rank:entry.rank,localTitle:entry.localTitle,
    sourceSeat:entry.sourceSeat,motif:entry.motif,palette:entry.palette,frame:entry.frame,
    note:entry.note,prototypeId:entry.prototypeId,head:entry.head,
    royal:entry.rank === 'König' || entry.royal === true,
    crest,fullsize,ready:art.ready,status:'proposal',
  }).filter(([,value]) => value !== undefined));
}));
if (new Set(houses.map(house => house.id)).size !== houses.length) throw Error('Duplicate house ID.');
const output = '/** Runtime house proposals. Original naming and heraldic direction remain in sources/house-plan.json. */\nexport const HOUSES = '+JSON.stringify(houses,null,2)+';\n';
const destination = new URL('house-data.mjs',root);
if (process.argv.includes('--check')) {
  if (await readFile(destination,'utf8') !== output) throw Error('Phalantia house catalog is stale.');
} else await writeFile(destination,output);
console.log(JSON.stringify({houses:houses.length,ready:houses.filter(house => house.ready).length,file:fileURLToPath(destination)}));
