import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEleganzStaffCharacterExports, ELEGANZ_STAFF_CHARACTERS } from '../modules/goettliche-eleganz/eleganz-sales-characters.mjs';
import { ELEGANZ_GENERAL_EMOTE_LABELS, ELEGANZ_SALES_EMOTE_LABELS, ELEGANZ_HOUSE_SERVICE_EMOTE_LABELS, getEleganzStaffArtworkSets, ELEGANZ_EFA_AVATARS_AUTHORED_AT } from '../modules/goettliche-eleganz/eleganz-sales-artwork.mjs';
import { assertEleganzStaffCharacterExports, buildEleganzStaffCharacterImport, buildEleganzStaffCharacterCreateWrites } from '../modules/goettliche-eleganz/eleganz-sales-character-import.mjs';
import { decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
import {buildAuthoredCharacterImport} from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import {ELEGANZ_STAFF_CHARACTER_FEATURE, ELEGANZ_STAFF_FAMILY_CANDIDATES} from '../modules/goettliche-eleganz/eleganz-sales-characters.mjs';
import {buildEfaMediaFields, withoutEfaMediaFields, ELEGANZ_EFA_ID, ELEGANZ_EFA_MEDIA_FIELDS} from '../modules/goettliche-eleganz/eleganz-efa-media-update.mjs';

const artwork = Object.fromEntries(ELEGANZ_STAFF_CHARACTERS.map((person, personIndex) => [person.id, {
  portrait: { url: `https://example.test/${person.slug}/portrait.png`, sha256: String(personIndex + 90).padStart(64, '0') },
  sets: getEleganzStaffArtworkSets(person.personId).map(({id,name,labels}, setIndex) => ({
    id, name,
    emotes: labels.map((label, index) => ({ label, url: `https://example.test/${person.slug}/${setIndex}/${index}.png`, sha256: String(personIndex * 30 + setIndex * 9 + index + 1).padStart(64, '0') }))
  }))
}]));
const foreign = { id: 'foreign', name: 'Bestehende Figur', inventory: { money: '7 Kupfer', items: [{ id: 'owned' }] }, combatProfile: { hitPoints: { current: 2 } }, custom: 'keep' };
const prior = { registry: { records: [{ recordId: 'old', firestoreDocumentId: 'foreign', familyStatus: 'pending', primary: { kind: 'group' }, path: 'keep' }], sourceOverlays: [], sourceExportedAt: '2026-01-01' },
  snapshot: { characters: [foreign], charTabs: { tabs: ['Alle', 'Göttliche Eleganz', 'Andere'], map: { 'Göttliche Eleganz': ['existing-employee'], Andere: ['foreign'] } } }, report: { summary: { sourceDocuments: 1, total: 1 }, pending: [], other: 'keep' } };

test('three authored employees retain canonical identities, parents, ages and family links without granting items or combat values', () => {
  const source = structuredClone(artwork);
  const exports = buildEleganzStaffCharacterExports(artwork, { published: true });
  assertEleganzStaffCharacterExports(exports, { published: true });
  assert.deepEqual(artwork, source);
  assert.deepEqual(exports.map(entry => entry.character.age), [21, 26, 22]);
  for (const { character } of exports) {
    assert.equal(character.id, character.identity.worldPersonId);
    assert.equal(character.inventory, null); assert.equal(character.combatProfile, undefined); assert.equal(character.race, undefined);
    assert(character.biography.biography.biographyText.includes('Gwynthor'));
  }
  for (const { character } of exports.filter(entry => entry.character.name.endsWith('Gwernant'))) {
    assert.deepEqual(character.genealogy.relationships.parents.map(parent => parent.personId), ['idwal-gwernant', 'gwenllian-spouse-gwernant']);
    assert.deepEqual(character.genealogy.relationships.partners, []);
  }
});

test('standard picker exposes nine general emotes for every employee, seller and house-service sets add nine', () => {
  const exports = buildEleganzStaffCharacterExports(artwork);
  for (const { character } of exports.slice(0, 2)) {
    assert.equal(character.activeImageSetId, 'standard');
    assert.deepEqual(character.emotes.map(emote => emote.label), ELEGANZ_GENERAL_EMOTE_LABELS);
    assert.deepEqual(character.imageSets[1].emotes.map(emote => emote.label), ELEGANZ_SALES_EMOTE_LABELS);
  }
  assert.deepEqual(exports[2].character.emotes.map(emote => emote.label), ELEGANZ_GENERAL_EMOTE_LABELS);
  assert.equal(exports[2].character.imageSets[1].id, 'hausdienst-set-02');
  assert.equal(exports[2].character.imageSets[1].name, 'Hausdienst');
  assert.deepEqual(exports[2].character.imageSets[1].emotes.map(emote => emote.label), ELEGANZ_HOUSE_SERVICE_EMOTE_LABELS);
});

test('bounded local import adds exactly three family-classified records and preserves every foreign field', () => {
  const source = structuredClone(prior);
  const exports = buildEleganzStaffCharacterExports(artwork);
  const result = buildEleganzStaffCharacterImport(prior, exports);
  assert.equal(result.records.length, 3); assert.equal(result.snapshot.characters.length, 4);
  assert.deepEqual(result.snapshot.characters.find(character => character.id === foreign.id), foreign);
  assert.deepEqual(result.registry.records.find(record => record.recordId === 'old'), prior.registry.records[0]);
  for (const item of result.records) assert(item.record.links.familyTree[0].url.includes(`person=${item.record.character.genealogy.sources[0].personId}`));
  assert.deepEqual(prior, source);
  const repeated = buildEleganzStaffCharacterImport(result, exports);
  for (const key of ['registry', 'snapshot', 'report']) assert.deepEqual(repeated[key], result[key]);
});

test('matching names or world identities under another document cannot create duplicate people', () => {
  const exports = buildEleganzStaffCharacterExports(artwork);
  for (const collision of [
    { id: 'different', name: 'Rhys Maerllys' },
    { id: 'different', name: 'Anderer Name', identity: { worldPersonId: ELEGANZ_STAFF_CHARACTERS[1].id } },
    { id: ELEGANZ_STAFF_CHARACTERS[2].id, name: 'Efa Gwernant' }
  ]) assert.throws(() => buildEleganzStaffCharacterImport({ ...prior, snapshot: { ...prior.snapshot, characters: [...prior.snapshot.characters, collision] } }, exports), /Identitätskollision/);
  assert.throws(() => buildEleganzStaffCharacterImport({ ...prior, registry: { ...prior.registry, records: [...prior.registry.records,
    { recordId: 'orphan', name: 'Catrin Gwernant', firestoreDocumentId: 'other-id' }] } }, exports), /Identitätskollision im Figurenregister/);
});

test('malformed or incomplete artwork cannot silently truncate labels, duplicate panels or omit a set', () => {
  for (const mutate of [
    value => { value[ELEGANZ_STAFF_CHARACTERS[0].id].sets.pop(); },
    value => { value[ELEGANZ_STAFF_CHARACTERS[0].id].sets[0].emotes[0].label = 'Ein viel zu langes Emotelabel'; },
    value => { value[ELEGANZ_STAFF_CHARACTERS[0].id].sets[1].emotes[0].sha256 = value[ELEGANZ_STAFF_CHARACTERS[0].id].sets[0].emotes[0].sha256; },
    value => { value[ELEGANZ_STAFF_CHARACTERS[2].id].sets = []; },
    value => { value[ELEGANZ_STAFF_CHARACTERS[2].id].sets[1].emotes[6].label = 'Falsche Reihenfolge'; }
  ]) { const invalid = structuredClone(artwork); mutate(invalid); assert.throws(() => buildEleganzStaffCharacterExports(invalid)); }
  const local = structuredClone(artwork); local[ELEGANZ_STAFF_CHARACTERS[0].id].portrait.url = './local.png';
  assert.throws(() => buildEleganzStaffCharacterExports(local, { published: true }), /Öffentliche Bildadresse/);
});

test('Efa media confirmation preserves local notes, live-value projections, history, siblings and collection mapping', () => {
  const exports = buildEleganzStaffCharacterExports(artwork);
  const legacy = structuredClone(exports);
  const efa = legacy.find(entry => entry.character.id === ELEGANZ_EFA_ID);
  efa.exportedAt = efa.character.updatedAt = '2026-11-06T19:30:00.000Z';
  efa.character.emotes = [];
  efa.character.imageSets = [{...efa.character.imageSets[0], emotes:[], updatedAt:efa.exportedAt}];
  const initial = buildAuthoredCharacterImport(prior, legacy, ELEGANZ_STAFF_CHARACTER_FEATURE, ELEGANZ_STAFF_FAMILY_CANDIDATES);
  const existingRecords = initial.records.map(item => structuredClone(item.record));
  const oldRecord = existingRecords.find(record => record.character.id === ELEGANZ_EFA_ID);
  oldRecord.local.note = 'Notiz erhalten';
  oldRecord.character.inventory = {money:17, items:[{id:'preserve'}]};
  oldRecord.character.combatProfile = {hitPoints:{current:5}};
  const oldPerson = initial.snapshot.characters.find(person => person.id === ELEGANZ_EFA_ID);
  oldPerson.inventory = structuredClone(oldRecord.character.inventory);
  oldPerson.combatProfile = structuredClone(oldRecord.character.combatProfile);
  const input = {...initial, existingRecords};
  const source = structuredClone(input);
  const result = buildEleganzStaffCharacterImport(input, exports);
  const record = result.records.find(item => item.record.character.id === ELEGANZ_EFA_ID).record;
  assert.deepEqual(withoutEfaMediaFields(record.character), withoutEfaMediaFields(oldRecord.character));
  assert.deepEqual(record.local, oldRecord.local);
  assert.equal(record.sources.firestoreExports.length, 2);
  assert.deepEqual(record.sources.firestoreExports[0], oldRecord.sources.firestoreExports[0]);
  assert.deepEqual(result.snapshot.charTabs, initial.snapshot.charTabs);
  for(const id of ELEGANZ_STAFF_CHARACTERS.slice(0,2).map(person=>person.id)) {
    assert.deepEqual(result.records.find(item=>item.record.character.id===id),initial.records.find(item=>item.record.character.id===id));
  }
  assert.deepEqual(input, source);
  const repeated = buildEleganzStaffCharacterImport({...result, existingRecords:result.records.map(item=>item.record)}, exports);
  for(const key of ['registry','snapshot','report','records']) assert.deepEqual(repeated[key],result[key]);
});

test('Efa update owns exactly the seven media/time fields and refuses different existing media or a newer profile', () => {
  const target = buildEleganzStaffCharacterExports(artwork)[2].character;
  const old = structuredClone(target);
  old.updatedAt = '2026-11-06T19:30:00.000Z';old.emotes=[];
  old.imageSets=[{...old.imageSets[0],emotes:[],createdAt:old.updatedAt,updatedAt:old.updatedAt}];
  const patch=buildEfaMediaFields(old,target);
  assert.deepEqual(Object.keys(patch),ELEGANZ_EFA_MEDIA_FIELDS);
  assert.equal(patch.imageSets[0].createdAt,old.imageSets[0].createdAt);
  assert.equal(patch.updatedAt,ELEGANZ_EFA_AVATARS_AUTHORED_AT);
  assert.deepEqual(withoutEfaMediaFields({...old,...patch}),withoutEfaMediaFields(old));
  const changed=structuredClone(old);changed.imageSets[0].emotes=[{img:'https://example.test/custom.png',label:'Eigenes'}];
  assert.throws(()=>buildEfaMediaFields(changed,target),/Different existing emotes/);
  assert.throws(()=>buildEfaMediaFields({...old,updatedAt:'2026-12-01T00:00:00.000Z'},target),/newer Efa/);
  assert.throws(()=>buildEfaMediaFields({...old,portrait:'https://example.test/other.png'},target),/portrait/);
  assert.throws(()=>buildEfaMediaFields({...old,id:'different'},target));
});

test('online proposal is create-only and contains exactly the reviewed export records', () => {
  const exports = buildEleganzStaffCharacterExports(artwork, { published: true });
  const writes = buildEleganzStaffCharacterCreateWrites(exports, path => `projects/example/databases/(default)/documents/${path}`);
  assert.equal(writes.length, 3);
  writes.forEach((write, index) => {
    assert.deepEqual(write.currentDocument, { exists: false });
    assert(write.update.name.endsWith(`/characters/${exports[index].character.id}`));
    assert.deepEqual(decodeFirestoreFields(write.update.fields), exports[index].character);
  });
});
