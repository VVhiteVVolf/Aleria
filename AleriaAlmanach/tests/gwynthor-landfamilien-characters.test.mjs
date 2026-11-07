import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { buildLandfamilienCharacterCandidates, buildLandfamilienCharacterExports,
  resolveLandfamilienRuntimeCharacter, LANDFAMILIEN_CHARACTER_FEATURE } from '../modules/gwynthor-landfamilien/landfamilien-characters.mjs';

const candidates = buildLandfamilienCharacterCandidates(FAMILY_REGISTRY);

test('36 named sources keep explicit world identities, full biographies and their actual owning family', () => {
  const exports = buildLandfamilienCharacterExports(FAMILY_REGISTRY);
  assert.equal(exports.length, 36);
  assert.equal(new Set(exports.map(source => source.character.id)).size, 36);
  assert.equal(candidates.length, 36);
  for (const source of exports) {
    const character = source.character;
    assert.equal(character.id, character.identity.worldPersonId);
    assert.equal(character.identity.worldPersonId, character.genealogy.worldPersonId);
    assert.ok(['alive', 'dead'].includes(character.genealogy.status));
    assert.equal(source.assignedTab, 'Gwynthor');
    assert.ok(character.portrait.startsWith('/AleriaAlmanach/assets/gwynthor-landfamilien/portraits/'));
    assert.ok(!Object.hasOwn(character, 'combatProfile'));
    assert.equal(character.inventory, null);
    assert.ok(character.bio.length > 700);
    assert.ok(character.biography.biography.biographyText.includes(character.name));
    assert.ok(character.biography.biography.historyText);
    assert.ok(character.biography.biography.connections.length);
    assert.equal(character.archived, false);
    const candidate = candidates.find(candidate => candidate.worldPersonId === character.identity.worldPersonId);
    assert.equal(character.genealogy.sources[0].familyId, candidate.familyId);
  }
  const ceridwen = exports.find(source => source.character.id.endsWith('--ceridwen-tirfelyn')).character;
  assert.equal(ceridwen.status, 'dead'); assert.equal(ceridwen.genealogy.status, 'dead');
  assert.equal(ceridwen.genealogy.death, '1740'); assert.equal(ceridwen.age, 22);
  assert.equal(ceridwen.genealogy.relationships.partners[0].type, 'engagement');
});

test('an unrelated one-name character with the same age is preserved by the bounded import', () => {
  const source = buildLandfamilienCharacterExports(FAMILY_REGISTRY).find(source => source.character.name === 'Enid');
  assert.ok(source);
  const foreign = { id: 'foreign-enid', name: 'Enid', age: source.character.age,
    identity: { worldPersonId: 'person--foreign-house--enid' }, inventory: { retainedMarker: 'unrelated-inventory' } };
  const row = { recordId: 'character--foreign-enid', firestoreDocumentId: foreign.id, firestoreDocumentIds: [foreign.id],
    name: foreign.name, worldPersonId: foreign.identity.worldPersonId, familyStatus: 'pending',
    primary: { kind: 'place', id: 'foreign-place', label: 'Fremder Ort' }, path: 'records/foreign-enid/character.json' };
  const input = { registry: { records: [row], count: 1, sourceOverlays: [] },
    snapshot: { characters: [foreign], charTabs: { tabs: ['Alle'], map: {} } },
    report: { summary: {}, pending: [] } };
  const result = buildAuthoredCharacterImport(input, [source], LANDFAMILIEN_CHARACTER_FEATURE, candidates);
  assert.equal(result.snapshot.characters.length, 2);
  assert.strictEqual(result.snapshot.characters[0], foreign);
  assert.strictEqual(result.registry.records[0], row);
  assert.equal(result.records[0].record.identity.worldPersonId, source.character.identity.worldPersonId);
  assert.equal(result.records[0].record.classification.families[0].familyId, 'haus-tirfelyn');
  assert.equal(result.records[0].record.links.firestore.documentIds.length, 1);
});

test('a confirmed existing world identity retains its runtime document ID without name matching', () => {
  const candidate = candidates.find(candidate => candidate.personId === 'enid-spouse-tirfelyn');
  const existing = { id: 'retained-runtime-id', name: 'Alter Anzeigename', identity: { worldPersonId: candidate.worldPersonId } };
  const source = buildLandfamilienCharacterExports(FAMILY_REGISTRY, [existing]).find(source => source.character.identity.worldPersonId === candidate.worldPersonId);
  assert.equal(source.character.id, existing.id);
  assert.strictEqual(resolveLandfamilienRuntimeCharacter(candidate, [existing]), existing);
  assert.throws(() => resolveLandfamilienRuntimeCharacter(candidate, [existing, { ...existing, id: 'second-runtime-id' }]), /Mehrere Laufzeitakten/);
  assert.throws(() => resolveLandfamilienRuntimeCharacter(candidate, [{ id: 'wrong-world', identity: { worldPersonId: 'person--another--enid' },
    genealogy: { sources: [{ familyId: candidate.familyId, personId: candidate.personId }] } }]), /Widersprüchliche bestehende Weltperson/);
});
