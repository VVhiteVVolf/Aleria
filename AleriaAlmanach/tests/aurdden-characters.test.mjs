import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { AURDDEN_CHARACTER_FEATURE, buildAurddenCharacterCandidates, buildAurddenCharacterExports } from '../modules/loer-hofjuwelier/aurdden-characters.mjs';

const exports = buildAurddenCharacterExports(FAMILY_REGISTRY);
const candidates = buildAurddenCharacterCandidates(FAMILY_REGISTRY);
const ids = new Set(exports.map(entry => entry.character.id));

test('35 authored Aurdden profiles have explicit identities, biographies and no invented gameplay assets', () => {
  assert.equal(exports.length, 35); assert.equal(ids.size, 35); assert.equal(candidates.length, 33);
  for (const { character } of exports) {
    assert.equal(character.id, character.identity.worldPersonId);
    assert.equal(character.genealogy.worldPersonId, character.id);
    assert.ok(character.bio && character.biography.biography.biographyText);
    assert.equal(character.inventory, null);
    assert.ok(!character.combatProfile && !character.playerOwner);
    assert.ok(!character.id.includes('aeron-loer'));
  }
  const bankIds = ['oeneth-aurdden', 'rhewae-spouse-aurdden', 'pereth-aurdden', 'uffyria-spouse-aurdden', 'ellric-aurdden', 'kyria-aurdden', 'neddan-aurdden'];
  assert.equal(exports.filter(entry => entry.character.portrait === null).length, 7);
  for (const id of bankIds) {
    const { character } = exports.find(entry => entry.character.id.endsWith(`--${id}`));
    assert.equal(character.portrait, null);
    assert.ok(character.biography.biography.documents.every(document => !document.link.includes('entry=der-sternenfang-aurdden')));
  }
  for (const { character } of exports.filter(entry => entry.character.id.startsWith('person--aurdden-wachen--'))) {
    assert.deepEqual(character.genealogy.sources, []);
    assert.equal(character.origin, 'Aldrimar');
  }
});

test('bounded author import keeps unrelated same-name and same-age women independent', async () => {
  const root = new URL('../../CharakterDatenbank/', import.meta.url);
  const [registry, snapshot, report] = await Promise.all(['registry.json', 'generated/characters.snapshot.json', 'generated/sync-report.json']
    .map(async path => JSON.parse(await readFile(new URL(path, root), 'utf8'))));
  const previous = {
    registry: { ...registry, records: registry.records.filter(row => !ids.has(row.firestoreDocumentId)) },
    snapshot: { ...snapshot, characters: snapshot.characters.filter(character => !ids.has(character.id)) },
    report: { ...report, pending: report.pending.filter(row => !row.recordId.includes('aurdden')) }, existingRecords: []
  };
  const unrelated = [
    { id: 'unrelated-firwen', name: 'Firwen', age: 49, identity: { worldPersonId: 'person--unrelated--firwen' }, bio: 'Fremde Akte.', inventory: { money: 999 } },
    { id: 'unrelated-avelena', name: 'Avelena', age: 52, bio: 'Einname ohne genealogische Zuordnung.' }
  ];
  previous.snapshot.characters.push(...unrelated);
  const result = buildAuthoredCharacterImport(previous, exports, AURDDEN_CHARACTER_FEATURE, candidates);
  assert.equal(result.records.length, 35);
  assert.deepEqual(result.snapshot.characters.filter(character => !ids.has(character.id)), previous.snapshot.characters);
  assert.deepEqual(result.registry.records.filter(row => !ids.has(row.firestoreDocumentId)), previous.registry.records);
  for (const record of result.records) {
    assert.deepEqual(record.record.links.firestore.documentIds, [record.record.character.id]);
    assert.equal(record.record.classification.familyStatus, record.record.character.id.startsWith('person--aurdden-wachen--') ? 'pending' : 'linked');
    assert.ok(record.record.links.familyTree.every(link => link.familyId === 'haus-aurdden' && link.worldPersonId === record.record.character.id));
  }
  for (const character of unrelated) assert.deepEqual(result.snapshot.characters.find(row => row.id === character.id), character);
});
