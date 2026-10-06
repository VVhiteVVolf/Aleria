import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { buildRegistryFolderTree } from '../../Stammbäume/assets/js/modules/family-registry/registry-folder-tree.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const slug = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const mirrors = JSON.parse(await readFile(resolve(root, 'AleriaAlmanach/public/assets/regional-equipment/heraldry/sources.json'), 'utf8')).assets;
const asset = value => {
  const source = value ? new URL(value, 'https://aleria.invalid/Stammbäume/').href.replace('https://aleria.invalid', '') : '';
  return mirrors.find(entry => entry.source === source)?.file || source;
};
const houses = FAMILY_REGISTRY.map(record => ({ id: record.id, name: record.title,
  image: asset(record.emblem || record.family?.document?.emblem || record.family?.houses?.[0]?.emblem || ''),
  path: record.folderPath || [], tree: `/Stammbäume/Stammbaum.html?family=${encodeURIComponent(record.id)}&mode=view` }));
const nodes = [];
function visit(node, path = []) {
  const id = path.length ? path.map(slug).join('/') : '';
  const current = { id, parentId: path.slice(0, -1).map(slug).join('/'), name: node.name, path, image: asset(node.icon),
    countryId: path[0] ? slug(path[0]) : '', regionId: path[1] ? slug(path[1]) : '',
    children: [], houseIds: [...new Set(node.records.map(record => record.id))] };
  nodes.push(current);
  for (const child of node.folders.values()) {
    const entry = visit(child, [...path, child.name]);
    current.children.push(entry.id); current.houseIds.push(...entry.houseIds);
  }
  current.houseIds = [...new Set(current.houseIds)];
  return current;
}
// Include linked-only lines as well: this catalog must expose every registered house.
visit(buildRegistryFolderTree(FAMILY_REGISTRY.map(record => ({ ...record, listing: 'listed' }))));
if (new Set(nodes.map(node => node.id)).size !== nodes.length) throw Error('Doppelte Gebietsschlüssel.');
for (const entry of [...nodes, ...houses]) {
  if (entry.image && !entry.image.startsWith('http')) await access(resolve(root, '.' + decodeURIComponent(entry.image)));
}
const output = `// Generated from the family-tree registry and its existing heraldry.\nexport const REGIONAL_EQUIPMENT_TERRITORIES = ${JSON.stringify(nodes, null, 2)};\nexport const REGIONAL_EQUIPMENT_HOUSES = ${JSON.stringify(houses, null, 2)};\n`;
const target = resolve(root, 'AleriaAlmanach/modules/regional-equipment/regional-equipment-catalog.js');
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== output) throw Error('Länder- und Bannerverzeichnis ist veraltet.');
} else await writeFile(target, output);
console.log(`${nodes[0].children.length} Länder, ${nodes.length - 1} Gebiete, ${houses.length} Häuser aus den Stammbäumen.`);
