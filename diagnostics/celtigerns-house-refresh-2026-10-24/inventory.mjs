import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = process.cwd();
function sources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory()
    ? sources(path.join(dir, e.name)) : e.name === 'haus.content.mjs' ? [path.join(dir, e.name)] : []);
}
const gallery = JSON.parse(readFileSync('Gallerien/krieger/data/catalog.json', 'utf8'));
const contents = await Promise.all(sources('Familien Häuser und Clans/Estryll').map(async file => ({ file, content: (await import(pathToFileURL(path.resolve(file)))).HOUSE_CONTENT })));
const records = FAMILY_REGISTRY.filter(r => r.folderPath.includes('Celtigerns Wacht'));
const houses = records.map(r => {
  const c = contents.find(x => x.content.id === r.id);
  const g = gallery.houses.find(h => h.id === r.id);
  return { id: r.id, name: r.title, folder: r.folderPath, profile: r.houseProfile, file: c?.file,
    prepared: c?.content.prepared, image: c?.content.images.scene,
    bio: !!r.family.extensions?.houseBiographyModule,
    biographyExternal: c?.content.biographyManagedExternally,
    illustrations: (g?.illustrationIds || []).map(id => gallery.illustrations.find(i => i.id === id)).map(i => ({ id: i.id, image: i.image, name: i.name })),
    notes: r.family.document?.description || '',
  };
});
writeFileSync(path.join(root, 'diagnostics/celtigerns-house-refresh-2026-10-24/inventory.json'), JSON.stringify(houses, null, 2) + '\n');
const details = records.filter(r => !contents.find(x => x.content.id === r.id)?.content || contents.find(x => x.content.id === r.id)?.content.prepared).map(r => ({
  id: r.id, document: r.family.document, lineage: r.family.lineage,
  people: r.family.persons.filter(p => !p.extensions?.preparedPlaceholder && !/unknown|unbekannt/i.test(p.id)).map(p => ({ id: p.id, name: p.name, title: p.title, notes: p.notes, portrait: p.portrait, lineageRole: p.lineageRole, death: p.death })),
  sourceNote: r.family.extensions.sourceNote,
}));
writeFileSync('diagnostics/celtigerns-house-refresh-2026-10-24/source-details.json', JSON.stringify(details, null, 2) + '\n');
for (const h of houses) console.log(`${h.id} | ${h.profile?.rankId} | page:${!!h.file} bio:${h.bio} prep:${h.prepared} external:${h.biographyExternal || false} | scene:${!!h.image} gallery:${h.illustrations.length} | ${h.folder.slice(2).join('/')}`);
console.log('TOTAL', houses.length, 'MISSING PAGES', houses.filter(h => !h.file).length, 'MISSING GALLERY', houses.filter(h => !h.illustrations.length).length);
