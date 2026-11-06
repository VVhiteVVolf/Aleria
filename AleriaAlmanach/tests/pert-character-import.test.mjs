import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { buildPertCharacterExports, PERT_KEVAN_ID, PERT_EXISTING_CHARACTER_FIELDS } from '../modules/pert/character-content.mjs';
import { projectPertCharacterDatabase } from '../modules/pert/character-database.mjs';
import { buildCharacterDatabase } from '../../CharakterDatenbank/lib/character-database-model.mjs';
import { markReviewedCharacterMetadata, currentReviewedMetadataSources } from '../../CharakterDatenbank/lib/character-reviewed-metadata-overlays.mjs';

const root = new URL('../../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const [registry, snapshot, report] = await Promise.all(['CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'].map(read));
const familyRecord = getRegisteredFamily('pert');
const exports = buildPertCharacterExports(familyRecord);
const ids = new Set(exports.map(entry => entry.character.id));
const existingRecords = await Promise.all(registry.records.filter(row => ids.has(row.firestoreDocumentId)).map(row => read(`CharakterDatenbank/${row.path}`)));
const basis = { registry, snapshot, report, existingRecords };
const result = projectPertCharacterDatabase(basis, familyRecord);
const person = personId => exports.find(entry => entry.source.personId === personId).character;
const omit = (value, keys) => Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));

test('17 named people receive distinct runtime/world identities; founders remain in the tree', () => {
  assert.equal(exports.length, 17); assert.equal(ids.size, 17);
  assert.equal(new Set(exports.map(entry => entry.character.identity.worldPersonId)).size, 17);
  assert.ok(exports.every(entry => !entry.source.personId.startsWith('pert-gruender')));
  assert.equal(person('person-52becf61').id, PERT_KEVAN_ID);
});

test('birth/death/gender and dead status preserve the entire canonical person source', () => {
  for (const entry of exports) {
    const source = familyRecord.family.persons.find(row => row.id === entry.source.personId);
    const char = entry.character;
    assert.equal(char.genealogy.birth, source.birth); assert.equal(char.genealogy.death || '', source.death || '');
    assert.equal(char.genealogy.status, source.status);
    assert.ok(char.genealogy.sex === source.sex || source.sex === 'unknown' && !char.genealogy.sex);
    if (char.id !== PERT_KEVAN_ID) assert.equal(char.status, source.status === 'dead' ? 'dead' : 'active');
  }
  assert.equal(exports.filter(entry => entry.character.genealogy.status === 'dead').length, 4);
  assert.equal(person('person-3a869794').genealogy.sex, 'female');
  assert.ok(['', 'unknown'].includes(person('person-cf926021').genealogy.sex));
});

test('Roísin has Sioned as sole parent; Donnchadh gains no inferred fatherhood', () => {
  const roisin = person('person-618119d8').genealogy.relationships;
  assert.equal(roisin.parents.length, 1); assert.equal(roisin.parents[0].personId, 'person-4ee10c57');
  assert.equal(roisin.parents[0].legitimacy, 'legitimized');
  assert.ok(!person('person-35fdbd7b').genealogy.relationships.children.some(child => child.personId === 'person-618119d8'));
});

test('each profile has substantial individual text, structured biography, tree and house links', () => {
  const bios = exports.map(entry => entry.character.bio);
  assert.equal(new Set(bios).size, 17);
  for (const entry of exports) {
    const char = entry.character;
    assert.ok(char.bio.length > 600, entry.source.personId);
    assert.equal(char.bio.split('\n\n').length, 3);
    assert.equal(char.biography.biography.documents.length, 2);
    assert.ok(char.biography.biography.documents[0].link.includes(entry.source.personId));
    assert.ok(char.biography.biography.documents[1].link.endsWith('?haus=pert'));
  }
});

test('exports contain no inventory, combat snapshot, start grants or invented numerical mechanics', () => {
  for (const entry of exports) {
    assert.equal(entry.assignedTab, 'Gwynthor');
    for (const key of ['inventory', 'combatProfile', 'money', 'equipment', 'stats', 'attributes', 'skills']) assert.ok(!Object.hasOwn(entry.character, key));
    assert.equal(entry.mergeStrategy, 'replace-reviewed-metadata-fields');
    assert.doesNotThrow(() => markReviewedCharacterMetadata(structuredClone(entry.character), entry.exportedAt));
  }
});

test('Kevan is updated in place with only approved character fields and all history retained', () => {
  const prior = existingRecords.find(record => record.character.id === PERT_KEVAN_ID);
  const next = result.records.find(item => item.record.character.id === PERT_KEVAN_ID);
  const beforeRow = registry.records.find(row => row.firestoreDocumentId === PERT_KEVAN_ID);
  assert.equal(next.path, beforeRow.path); assert.equal(next.record.recordId, prior.recordId);
  assert.deepEqual(omit(next.record.character, PERT_EXISTING_CHARACTER_FIELDS), omit(prior.character, PERT_EXISTING_CHARACTER_FIELDS));
  assert.deepEqual(next.record.classification.primary, prior.classification.primary);
  assert.deepEqual(next.record.local, prior.local);
  assert.deepEqual(next.record.sources.firestoreExports.slice(0, prior.sources.firestoreExports.length), prior.sources.firestoreExports);
  assert.ok(next.record.character.bio.includes('Goronvy und Lowri'));
  assert.ok(next.record.character.bio.includes('Iorwerth und Gwerfyl'));
  assert.ok(next.record.character.bio.includes('östliche Straße'));
  assert.ok(!next.record.character.bio.includes('Seren und Emry'));
  assert.equal(next.record.character.portrait, '../Stammbäume/assets/images/portraits/pert/person-52becf61.png');
  assert.ok(!next.record.character.imageSets?.length && !next.record.character.activeImageSetId);
  assert.ok(next.record.sources.firestoreExports.some(source => source.portrait === 'https://i.imgur.com/Sl4ntci.png'));
});

test('all foreign registry/snapshot rows and classification metadata stay identical', () => {
  assert.deepEqual(result.registry.records.filter(row => !ids.has(row.firestoreDocumentId)), registry.records.filter(row => !ids.has(row.firestoreDocumentId)));
  assert.deepEqual(result.snapshot.characters.filter(row => !ids.has(row.id)), snapshot.characters.filter(row => !ids.has(row.id)));
  assert.deepEqual(result.report.pending.filter(row => !result.records.some(item => item.record.recordId === row.recordId)),
    report.pending.filter(row => !result.records.some(item => item.record.recordId === row.recordId)));
  assert.ok(result.records.every(item => item.record.classification.familyStatus === 'linked'));
});

test('projector is idempotent and retains an independent public-basis inventory', () => {
  const rerun = projectPertCharacterDatabase({ registry: result.registry, snapshot: result.snapshot, report: result.report,
    existingRecords: result.records.map(item => item.record) }, familyRecord);
  assert.deepEqual(rerun.registry, result.registry); assert.deepEqual(rerun.snapshot, result.snapshot); assert.deepEqual(rerun.records, result.records);
  const own = structuredClone(basis);
  const kevan = own.existingRecords.find(record => record.character.id === PERT_KEVAN_ID);
  kevan.character.inventory = { independentPublicBasis: ['do-not-copy-main'] };
  own.snapshot.characters.find(row => row.id === PERT_KEVAN_ID).inventory = structuredClone(kevan.character.inventory);
  const projected = projectPertCharacterDatabase(own, familyRecord);
  assert.deepEqual(projected.records.find(item => item.record.character.id === PERT_KEVAN_ID).record.character.inventory, kevan.character.inventory);
});

test('identity collisions fail closed; matching portraits do not merge Geraint and Donnchadh', () => {
  const collision = structuredClone(basis);
  collision.snapshot.characters.push({ id: 'foreign-record', name: 'Geraint Pert' });
  assert.throws(() => projectPertCharacterDatabase(collision, familyRecord), /Fremde Namens/);
  assert.notEqual(person('person-4506547d').id, person('person-35fdbd7b').id);
  const grouped = buildCharacterDatabase({ characters: [...exports.map(entry => entry.character), ...snapshot.characters.filter(row => !ids.has(row.id))], exportedAt: exports[0].exportedAt }, []);
  assert.ok(exports.every(entry => grouped.records.some(item => item.record.character.id === entry.character.id)));
});

test('later full online archive remains authoritative over reviewed metadata', () => {
  const entry = exports.find(row => row.character.id === PERT_KEVAN_ID);
  const receipt = markReviewedCharacterMetadata(structuredClone(entry.character), entry.exportedAt);
  const later = { id: PERT_KEVAN_ID, updatedAt: '2026-11-07T00:00:00.000Z', inventory: {}, biography: null, genealogy: {} };
  assert.deepEqual(currentReviewedMetadataSources([receipt, later]), [later]);
});
