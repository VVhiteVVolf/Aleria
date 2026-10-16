import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';

const directory = 'Stammbäume/assets/data/published-families/';
const registryPath = directory + 'registry.json';
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const ids = ['haus-gwernhelyd', 'haus-cledrann', 'haus-halenwych'];
const beforeEntries = structuredClone(registry.families);
const updatedAt = new Date().toISOString();
const additions = ids.map(id => {
  const record = FAMILY_REGISTRY.find(entry => entry.id === id);
  assert.ok(record, id);
  assertValidFamily(record.family);
  assert.deepEqual(record.folderPath, ['Cenyr', 'Klaueninsel', 'Sturmklaue', 'Talgarth']);
  assert.ok(['commoner', 'lower-nobility'].includes(record.type));
  assert.ok(existsSync('Stammbäume/' + record.family.document.emblem));
  assert.ok(!registry.families.some(entry => entry.id === id), 'Keine bestehende lokale Familienakte überschreiben: ' + id);
  assert.ok(!existsSync(directory + id + '.json'), id);
  return { record, publication: { schemaVersion: 1, familyId: id, revision: 1, updatedAt, family: record.family } };
});
for (const { record, publication } of additions) {
  writeFileSync(directory + record.id + '.json', JSON.stringify(publication, null, 2) + '\n');
  registry.families.push({
    id: record.id, familyId: record.id, title: record.title,
    motto: record.family.document.motto, emblem: record.family.document.emblem,
    folderPath: [...record.folderPath], houseProfile: record.houseProfile,
    personCount: record.family.persons.length,
    revision: 1, updatedAt, link: record.link, source: 'github'
  });
}
assert.deepEqual(registry.families.slice(0, beforeEntries.length), beforeEntries, 'Alle bisherigen Registereinträge unverändert lassen.');
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
console.log('Drei neue lokale Familienakten und Registereinträge angelegt; keine Online-Schreibzugriffe.');
