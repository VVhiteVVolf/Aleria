import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';

const directory = new URL('../../Stammbäume/assets/data/published-families/', import.meta.url);
const registryPath = new URL('registry.json', directory);
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const ids = ['haus-mathgraig', 'haus-morgwynt', 'haus-morglan'];
const targetPath = ['Cenyr', 'Klaueninsel', 'Sturmklaue', 'Talgarth'];
for (const id of ids) {
  const registered = FAMILY_REGISTRY.find(record => record.id === id);
  assert.deepEqual(registered.folderPath, targetPath);
  const file = new URL(`${id}.json`, directory);
  const publication = JSON.parse(readFileSync(file, 'utf8'));
  const before = publication.family;
  const upgraded = resolveRegisteredFamilyUpgrade(registered.family, before);
  assert.deepEqual(upgraded.persons, before.persons, `${id}: persons must be unchanged`);
  assert.deepEqual(upgraded.parentages, before.parentages);
  assert.deepEqual(upgraded.partnerships, before.partnerships);
  assert.equal(upgraded.document.houseProfile.rankId, before.document.houseProfile.rankId);
  assert.equal(upgraded.document.houseProfile.seat, 'Talgarth');
  // Remove only the former template's now-resolved question; retain every other question.
  const pending = upgraded.extensions.pendingFamilySituation;
  if (pending?.openQuestions) pending.openQuestions = pending.openQuestions.filter(value => value !== 'Genauer Familiensitz');
  publication.family = upgraded;
  publication.revision += 1;
  publication.updatedAt = new Date().toISOString();
  const entry = registry.families.find(record => record.id === id);
  entry.folderPath = [...targetPath];
  entry.houseProfile = structuredClone(upgraded.document.houseProfile);
  entry.revision = publication.revision;
  entry.updatedAt = publication.updatedAt;
  writeFileSync(file, JSON.stringify(publication, null, 2) + '\n');
  console.log(id, 'local placement updated; identities and genealogy unchanged');
}
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
