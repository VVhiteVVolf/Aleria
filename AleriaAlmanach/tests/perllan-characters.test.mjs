import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyCandidates } from '../modules/character-genealogy/genealogy-mapping.js';
import { inventoryCompanionViews } from '../modules/character-inventory/character-inventory-identity.js';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { buildCharacterDatabase } from '../../CharakterDatenbank/lib/character-database-model.mjs';
import { parseBiographyImportPayload } from '../../js/biography/biography-transfer.mjs';
import { buildPerllanCharacterExports, PERLLAN_CHARACTER_FEATURE } from '../modules/perllan/character-content.mjs';

const root = new URL('../../', import.meta.url);
const family = FAMILY_REGISTRY.find(record => record.id === 'perllan');
const candidates = createFamilyCandidates(family);
const exports = buildPerllanCharacterExports(family);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));

test('Perllan imports exactly the 27 named source identities and retains all 44 people in the family', async () => {
  const source = await readJson('Stammbäume/assets/data/source-inventories/perllan-20261104/family.json');
  assert.equal(family.family.persons.length, 44);
  assert.equal(exports.length, 27);
  assert.equal(new Set(exports.map(entry => entry.character.id)).size, 27);
  for (const entry of exports) {
    const sourcePerson = source.persons.find(person => person.id === entry.source.personId);
    assert.equal(entry.character.id, sourcePerson.worldPersonId);
    assert.equal(entry.character.identity.worldPersonId, sourcePerson.worldPersonId);
    assert.equal(entry.character.genealogy.birth, sourcePerson.birth);
    assert.equal(entry.character.genealogy.sex, sourcePerson.sex);
    assert.equal(entry.character.genealogy.status, sourcePerson.status);
    assert.equal(entry.character.genealogy.death, sourcePerson.death);
    assert.equal(entry.character.genealogy.sources[0].familyId, 'perllan');
    assert.equal(entry.source.documentId, 'perllan');
    assert(!/^(?:\?+|Unbekannt)/.test(entry.character.name));
    await access(new URL(entry.character.portrait, new URL('AleriaAlmanach/', root)));
  }
});

test('Perllan biographies preserve genealogy and leave unknown training and game rules empty', () => {
  for (const entry of exports) {
    const candidate = candidates.find(candidate => candidate.personId === entry.source.personId);
    assert.deepEqual(entry.character.genealogy.relationships, candidate.relationships);
    const biography = parseBiographyImportPayload(entry.character.biography);
    assert.match(biography.biography.biographyText, new RegExp(candidate.birth));
    assert.deepEqual(biography.biography.abilities, []);
    assert.deepEqual(biography.biography.knightMentors, []);
    assert.equal(entry.character.combatProfile, undefined);
    assert.equal(entry.character.age, undefined);
    assert.equal(entry.character.race, undefined);
  }
  const onnen = exports.find(entry => entry.character.name === 'Onnen Perllan');
  assert.match(onnen.character.biography.biography.biographyText, /ist verstorben; das Todesjahr ist nicht überliefert/);
  const ywen = exports.find(entry => entry.character.name === 'Ywen Perllan');
  assert.match(ywen.character.biography.biography.biographyText, /vermutete Abstammungsverbindung.*Zeitsprung/);
  assert.match(ywen.character.biography.biography.biographyText, /direkte biologische Elternschaft ist damit nicht belegt/);
  assert(ywen.character.biography.biography.connections.filter(connection => connection.name.startsWith('Unbekannt'))
    .every(connection => connection.detail.startsWith('Vermutete Abstammungsverbindung')));
});

test('the static tree biography projection contains exactly the same 27 person biographies', async () => {
  const { PERLLAN_PERSON_BIOGRAPHIES } = await import('../../Stammbäume/assets/js/data/perllan-person-biographies.generated.js');
  assert.deepEqual(PERLLAN_PERSON_BIOGRAPHIES,
    Object.fromEntries(exports.map(entry => [entry.source.personId, entry.character.biography])));
  for (const entry of exports) assert.deepEqual(family.family.persons.find(person => person.id === entry.source.personId)
    .extensions.biographyModule, entry.character.biography);
  assert(family.family.persons.filter(person => !exports.some(entry => entry.source.personId === person.id))
    .every(person => !person.extensions?.biographyModule));
});

test('four pictured animals appear once as narrative companions with their actual person and inventory instance', () => {
  const animalOwners = exports.filter(entry => entry.source.picturedCompanions.length);
  assert.deepEqual(animalOwners.map(entry => entry.source.personId), ['person-b758cea4', 'person-f3cccc1a']);
  assert.equal(animalOwners.flatMap(entry => entry.character.inventory.companions).length, 4);
  for (const { character } of animalOwners) {
    const inventory = character.inventory;
    const views = inventoryCompanionViews(inventory, []);
    assert.equal(views.length, 2);
    for (const card of inventory.companions) {
      const items = inventory.items.filter(item => item.id === card.inventoryItemId);
      assert.equal(items.length, 1);
      assert.equal(items[0].ownerCharacterId, character.id);
      assert.equal(items[0].instanceId, items[0].id);
      assert.equal(items[0].sourceEvidence.worldPersonId, character.id);
      assert.equal(items[0].sourceEvidence.image, character.portrait);
      assert.match(card.name, /^Unbenannt/);
      assert.equal(card.status, 'Nicht festgelegt');
      assert.equal(card.creatureId, undefined);
      assert.deepEqual(card.attributes, []);
      assert(views.every(view => !view.infoRows.some(row => ['Lebenspunkte', 'Rüstungsklasse', 'Bewegung'].includes(row.label))));
    }
  }
});

test('bounded Perllan import preserves unrelated people, inventory and classification and is reproducible', () => {
  const prior = {
    registry: { records: [{ recordId: 'old', firestoreDocumentId: 'old', firestoreDocumentIds: ['old'],
      familyStatus: 'pending', primary: { kind: 'group' }, path: 'keep' }], sourceOverlays: [], sourceExportedAt: '2026-01-01' },
    snapshot: { characters: [{ id: 'old', inventory: { items: [{ id: 'owned' }] },
      combatProfile: { hitPoints: { current: 2 } }, custom: 'keep' }], charTabs: { tabs: ['Alle'], map: {} } },
    report: { summary: { sourceDocuments: 1, total: 1 }, pending: [], other: 'keep' }
  };
  const result = buildAuthoredCharacterImport(prior, exports, PERLLAN_CHARACTER_FEATURE, candidates);
  assert.deepEqual(result.snapshot.characters[0], prior.snapshot.characters[0]);
  assert.deepEqual(result.registry.records[0], prior.registry.records[0]);
  assert.equal(result.report.other, 'keep');
  assert(result.records.every(row => row.record.classification.familyStatus === 'linked'
    && row.record.classification.primary.id === 'perllan'));
  assert.deepEqual(buildAuthoredCharacterImport(result, exports, PERLLAN_CHARACTER_FEATURE, candidates), result);
});

test('all named Perllan figures remain separate during a later archive grouping pass', async () => {
  const snapshot = await readJson('CharakterDatenbank/generated/characters.snapshot.json');
  const ids = new Set(exports.map(entry => entry.character.id));
  const external = snapshot.characters.filter(character => !ids.has(character.id));
  // Existing namesakes elsewhere cannot absorb a Perllan record by given name.
  const projected = buildCharacterDatabase({ characters: [...external, ...exports.map(entry => entry.character)] }, candidates);
  const projectedPerllan = projected.records.filter(row => ids.has(row.record.character.id));
  assert.equal(projectedPerllan.length, 27);
  assert(projectedPerllan.every(row => row.record.sync.sourceDocumentIds.length === 1));
});
