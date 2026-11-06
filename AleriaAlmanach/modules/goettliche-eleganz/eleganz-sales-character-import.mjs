import assert from 'node:assert/strict';
import { buildAuthoredCharacterImport } from '../../../CharakterDatenbank/lib/authored-character-import.mjs';
import { normalizeCharacterDatabaseKey } from '../../../CharakterDatenbank/lib/character-database-model.mjs';
import { encodeFirestoreFields } from '../../../firebase/scripts/backup/firestore-value-codec.mjs';
import { ELEGANZ_STAFF_CHARACTERS, ELEGANZ_STAFF_CHARACTER_FEATURE, ELEGANZ_STAFF_FAMILY_CANDIDATES } from './eleganz-sales-characters.mjs';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';
import { projectEfaMediaRecordUpdate, ELEGANZ_EFA_ID } from './eleganz-efa-media-update.mjs';

export function assertEleganzStaffCharacterExports(exports, { published = false } = {}) {
  assert.equal(exports.length, 3);
  assert.equal(new Set(exports.map(entry => entry.character?.id)).size, 3);
  for (const person of ELEGANZ_STAFF_CHARACTERS) {
    const entry = exports.find(entry => entry.character?.id === person.id), character = entry?.character;
    assert(entry?.type === 'aleria-character' && entry.assignedTab === 'Göttliche Eleganz', `Figurenquelle fehlt: ${person.name}`);
    assert.equal(character.name, person.name); assert.equal(character.age, person.age);
    assert.equal(character.identity.worldPersonId, person.worldPersonId);
    assert.equal(character.genealogy.worldPersonId, person.worldPersonId);
    assert.equal(character.genealogy.houseId, person.candidate.houseId);
    assert.equal(character.genealogy.birth, person.candidate.birth);
    assert.equal(character.genealogy.sources.length, 1);
    assert.equal(character.genealogy.sources[0].familyId, person.familyId);
    assert.deepEqual(character.genealogy.relationships, person.candidate.relationships);
    assert.equal(character.fraktion, 'Göttliche Eleganz');
    assert.equal(character.inventory, null); assert.equal(character.combatProfile, undefined);
    assert.equal(character.biography.biography.portrait, character.portrait);
    assert.equal(character.emotes.length, 9);
    assert.equal(character.imageSets.length, 2);
    assert(character.imageSets.every(set => set.emotes.length === 9));
    assert(character.imageSets.every(set => set.portrait === character.portrait));
    if (published) {
      assert(character.portrait?.startsWith('https://'), `Öffentliches Porträt fehlt: ${person.name}`);
      assert(character.imageSets.every(set => set.emotes.every(emote => emote.img.startsWith('https://'))));
    }
  }
  return exports;
}

export function buildEleganzStaffCharacterImport(prior, exports) {
  assertEleganzStaffCharacterExports(exports);
  for (const record of prior.registry.records) {
    const person = ELEGANZ_STAFF_CHARACTERS.find(person => record.worldPersonId === person.worldPersonId
      || [record.firestoreDocumentId, ...(record.firestoreDocumentIds || [])].includes(person.id)
      || [record.name, ...(record.aliases || [])].some(name => normalizeCharacterDatabaseKey(name) === normalizeCharacterDatabaseKey(person.name)));
    if (!person) continue;
    const owner = prior.snapshot.characters.find(character => character.id === person.id);
    assert(owner?.localRecord?.authoredFeature === ELEGANZ_STAFF_CHARACTER_FEATURE && record.firestoreDocumentId === person.id, `Identitätskollision im Figurenregister: ${record.recordId}`);
  }
  for (const character of prior.snapshot.characters) {
    const person = ELEGANZ_STAFF_CHARACTERS.find(person =>
      person.id === character.id || [character.identity?.worldPersonId, character.genealogy?.worldPersonId].includes(person.worldPersonId)
      || [character.name, ...(character.aliases || [])].some(name => normalizeCharacterDatabaseKey(name) === normalizeCharacterDatabaseKey(person.name)));
    if (!person) continue;
    assert(character.id === person.id && character.localRecord?.authoredFeature === ELEGANZ_STAFF_CHARACTER_FEATURE, `Identitätskollision mit bestehender Akte: ${character.id}`);
  }
  let result = buildAuthoredCharacterImport(prior, exports, ELEGANZ_STAFF_CHARACTER_FEATURE, ELEGANZ_STAFF_FAMILY_CANDIDATES);
  const efa = projectEfaMediaRecordUpdate(prior, exports.find(entry => entry.character.id === ELEGANZ_EFA_ID));
  if (efa) result = mergeCharacterRecordProjections(prior, result.records.map(item => item.record.character.id === ELEGANZ_EFA_ID ? efa : item), exports, result.snapshot.charTabs);
  assert.equal(result.records.length, 3);
  const ownIds = new Set(ELEGANZ_STAFF_CHARACTERS.map(person => person.id));
  for (const record of prior.registry.records.filter(record => !ownIds.has(record.firestoreDocumentId))) assert.deepEqual(result.registry.records.find(row => row.recordId === record.recordId), record);
  for (const character of prior.snapshot.characters.filter(character => !ownIds.has(character.id))) assert.deepEqual(result.snapshot.characters.find(row => row.id === character.id), character);
  for (const [tab, ids] of Object.entries(prior.snapshot.charTabs?.map || {})) {
    if (tab === 'Göttliche Eleganz') assert.deepEqual(result.snapshot.charTabs.map[tab].filter(id => !ownIds.has(id)), ids.filter(id => !ownIds.has(id)));
    else assert.deepEqual(result.snapshot.charTabs.map[tab], ids);
  }
  for (const item of result.records) {
    const person = ELEGANZ_STAFF_CHARACTERS.find(person => person.id === item.record.character.id);
    assert(item.record.links.familyTree.some(link => link.familyId === person.familyId && link.personId === person.personId && link.url === person.candidate.url), `Stammbaumlink fehlt: ${person.name}`);
    assert(item.record.classification.families.some(link => link.familyId === person.familyId), `Familienklassifikation fehlt: ${person.name}`);
  }
  return result;
}

/** Pure proposal only. A separate coordinator authorizes and executes online creation. */
export function buildEleganzStaffCharacterCreateWrites(exports, documentName) {
  assertEleganzStaffCharacterExports(exports, { published: true });
  return exports.map(entry => ({ update: { name: documentName(`characters/${entry.character.id}`), fields: encodeFirestoreFields(entry.character) }, currentDocument: { exists: false } }));
}
