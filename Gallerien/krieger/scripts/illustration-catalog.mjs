import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { appendLocalIllustrations } from './local-illustrations.mjs';

const FAMILY_ROOT = 'Familien Häuser und Clans';
const cleanPath = value => decodeURI(value.split(/[?#]/)[0]).replaceAll('\\', '/');

function filesIn(root, relative) {
  return readdirSync(new URL(`${relative}/`, root), { withFileTypes: true }).flatMap(entry => {
    const name = `${relative}/${entry.name}`;
    return entry.isDirectory() ? filesIn(root, name) : [name];
  });
}

export async function collectIllustrations(root, houseCatalog, selection) {
  const entries = new Map();
  function add({ file, houseId = '', name, category = 'Hausdarstellung', affiliation = '', source, original = '', note = '' }) {
    file = cleanPath(file);
    const absolute = new URL(file, root);
    if (!existsSync(absolute)) throw new Error(`Bild fehlt: ${file}`);
    const hash = createHash('sha256').update(readFileSync(absolute)).digest('hex');
    let entry = entries.get(hash);
    if (!entry) {
      entry = { id: `bild-${hash.slice(0, 16)}`, name, category, affiliation, image: file, sha256: hash, houseIds: [], sources: [], copies: [], note };
      entries.set(hash, entry);
    }
    if (houseId && !houseCatalog.houses.some(h => h.id === houseId)) throw new Error(`Unbekanntes Haus: ${houseId}`);
    if (houseId && !entry.houseIds.includes(houseId)) entry.houseIds.push(houseId);
    if (!entry.copies.includes(file)) entry.copies.push(file);
    if (source && !entry.sources.some(s => s.path === source && s.original === original)) entry.sources.push({ path: source, original });
    return entry;
  }
  const excluded = new Map(selection.excludedHouses.map(h => [h.id, h.reason]));
  const houseFiles = filesIn(root, FAMILY_ROOT);
  for (const file of houseFiles.filter(file => file.endsWith('/haus.content.mjs'))) {
    const { HOUSE_CONTENT: content } = await import(pathToFileURL(fileURLToPath(new URL(file, root))));
    const houseId = houseCatalog.resolveHouse(content.id, content.name);
    if (!houseId || excluded.has(houseId)) continue;
    if (content.images?.scene) {
      add({ file: path.posix.normalize(`${FAMILY_ROOT}/${content.images.scene}`), houseId, name: `${content.name} · Hausdarstellung`, source: file });
    }
    for (const entry of content.warriorGallery?.entries || []) {
      const item = add({ file: `${FAMILY_ROOT}/${entry.image}`, houseId, name: entry.name, category: /Knappe|Page/.test(entry.name) ? 'Ausbildung & Gefolge' : 'Hausdarstellung', source: file, note: entry.description });
      // The source gallery supplies the more specific label when the main illustration is identical.
      item.name = entry.name;
    }
  }
  // Source inventories preserve full warrior illustrations separately from cropped portraits.
  const referenceFiles = filesIn(root, 'Stammbäume/assets/images/references').filter(file => file.endsWith('/krieger.png'));
  const inventories = filesIn(root, 'Stammbäume/assets/data/source-inventories').filter(file => file.endsWith('.json'));
  const provenance = new Map();
  function visit(value, source) {
    if (!value || typeof value !== 'object') return;
    if (value.role === 'warrior' && value.path) {
      const file = value.path.startsWith('Stammbäume/') ? value.path : `Stammbäume/${value.path}`;
      provenance.set(file, { source, original: value.url || '' });
    }
    for (const child of Object.values(value)) if (typeof child === 'object') visit(child, source);
  }
  for (const file of inventories) visit(JSON.parse(readFileSync(new URL(file, root), 'utf8')), file);
  for (const file of referenceFiles) {
    const houseId = houseCatalog.resolveHouse(file.split('/').at(-2));
    if (!houseId) throw new Error(`Referenz ohne Haus: ${file}`);
    add({ file, houseId, name: `${houseCatalog.houses.find(h => h.id === houseId).name} · Kriegerreferenz`, category: 'Archivierte Kriegerreferenz', ...provenance.get(file), source: provenance.get(file)?.source || file });
  }
  for (const entry of selection.additionalImages) add(entry);
  // Paladins belong to their religious tradition, never implicitly to a noble house.
  for (const file of filesIn(root, 'BilderRüstungen').filter(file => /_paladin\.png$/.test(file))) {
    const slug = path.posix.basename(file).replace('_paladin.png', '');
    const name = slug[0].toUpperCase() + slug.slice(1);
    add({ file, name: `Paladin · ${name}`, category: 'Paladine', affiliation: `Klerus · ${name}`, source: `Religionen/klerus/gottheiten/${slug}/index.html` });
  }
  for (const file of filesIn(root, 'Orte').filter(file => /\/assets\/([^/]*stadtwache|wache|cochllamwyr-v1)\.png$/.test(file))) {
    const place = file.split('/').at(-3).replaceAll('_', ' ');
    add({ file, name: file.includes('cochllamwyr') ? 'Cochllamwyr' : `Wache · ${place}`, category: 'Stadt- & Ortswachen', affiliation: `Stadt / Ort · ${place}`, source: file, note: 'Örtlicher Wachdienst. Eine Lage im Herrschaftsgebiet begründet keine persönliche Hauszugehörigkeit.' });
  }
  appendLocalIllustrations(root, entries, add);
  return [...entries.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}
