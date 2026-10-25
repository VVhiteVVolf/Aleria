// Einmaliger Quellenabgleich; keine Laufzeit-Datenquelle.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { houseBiographyDefaultFingerprint } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-fingerprint.js';

const work = 'diagnostics/vortigerns-house-refresh-2026-10-24';
const records = FAMILY_REGISTRY.filter(record => record.folderPath.includes('Vortigerns Ruh'));
const filesIn = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
  ? filesIn(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const contents = new Map();
for (const file of filesIn('Familien Häuser und Clans/Estryll').filter(file => path.basename(file) === 'haus.content.mjs')) {
  const { HOUSE_CONTENT } = await import(pathToFileURL(path.resolve(file)));
  contents.set(HOUSE_CONTENT.id, { file, content: HOUSE_CONTENT });
}
const catalog = JSON.parse(readFileSync('Gallerien/krieger/data/catalog.json', 'utf8'));
const inventory = records.map(record => {
  const source = contents.get(record.id);
  const gallery = catalog.houses.find(house => house.id === record.id);
  return {
    id: record.id, title: record.title, folder: record.folderPath, profile: record.houseProfile,
    source: source?.file || '', content: source?.content || null,
    document: record.family.document, lineage: record.family.lineage,
    sourceRevision: record.family.extensions.sourceRevision || 0,
    sourceNote: record.family.extensions.sourceNote,
    people: record.family.persons.map(person => ({ id: person.id, name: person.name, title: person.title,
      notes: person.notes, portrait: person.portrait, birth: person.birth, death: person.death,
      status: person.status, lineageRole: person.lineageRole, extensions: person.extensions })),
    illustrations: (gallery?.illustrationIds || []).map(id => catalog.illustrations.find(image => image.id === id))
  };
});
writeFileSync(`${work}/inventory.json`, JSON.stringify(inventory, null, 2) + '\n');
const baseline = `${work}/previous-defaults.json`;
if (!existsSync(baseline)) writeFileSync(baseline, JSON.stringify(Object.fromEntries(records.map(record => [record.id, {
  sourceRevision: record.family.extensions.sourceRevision || 0,
  biography: record.family.extensions.houseBiographyModule || null,
  fingerprint: record.family.extensions.houseBiographyModule
    ? houseBiographyDefaultFingerprint(record.family.extensions.houseBiographyModule) : '',
  graphFingerprint: createHash('sha256').update(JSON.stringify(Object.fromEntries(
    ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches']
      .map(key => [key, record.family[key]])))).digest('hex')
}])), null, 2) + '\n');
for (const house of inventory) console.log(`${house.id} | ${house.profile.rankId} | source:${!!house.source} | images:${house.illustrations.length} | motto:${house.document.motto || '-'} | crest:${house.document.emblem}`);
