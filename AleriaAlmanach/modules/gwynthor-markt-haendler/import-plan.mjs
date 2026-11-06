import assert from 'node:assert/strict';
import { buildAuthoredCharacterImport } from '../../../CharakterDatenbank/lib/authored-character-import.mjs';
import { normalizeCharacterDatabaseKey } from '../../../CharakterDatenbank/lib/character-database-model.mjs';
import { MARKET_CHARACTERS, MARKET_CHARACTER_FEATURE } from './characters.mjs';
import { encodeFirestoreFields } from '../../../firebase/scripts/backup/firestore-value-codec.mjs';

export function assertMarketCharacterExports(exports, { requireArtwork = false } = {}) {
  assert.equal(exports.length, 3);
  for (const person of MARKET_CHARACTERS) {
    const entry = exports.find(entry => entry.character?.id === person.id), character = entry?.character;
    assert(entry && entry.type === 'aleria-character' && entry.assignedTab === 'Gwynthor', `Figurenquelle fehlt: ${person.name}`);
    assert.equal(character.name, person.name); assert.equal(character.age, person.age); assert.equal(character.origin, person.origin);
    assert.equal(character.currentLocation, 'Gwynthor · Marktplatz');
    assert.equal(character.inventory, null); assert.equal(character.combatProfile, undefined);
    assert(!character.identity?.worldPersonId && !character.genealogy?.worldPersonId && !character.genealogy?.houseId);
    assert.deepEqual(character.genealogy.sources, []);
    assert.deepEqual(character.genealogy.relationships, { parents: [], partners: [], children: [] });
    assert.equal(character.biography.biography.portrait, character.portrait || '');
    if (requireArtwork) assert(character.portrait?.startsWith('https://'), `Geprüftes Bild fehlt: ${person.name}`);
  }
  return exports;
}

export function buildMarketCharacterImport(prior, exports) {
  assertMarketCharacterExports(exports);
  const names = new Set(MARKET_CHARACTERS.map(person => normalizeCharacterDatabaseKey(person.name)));
  for (const character of prior.snapshot.characters) {
    if (![character.name, ...(character.aliases || [])].some(name => names.has(normalizeCharacterDatabaseKey(name)))) continue;
    const own = exports.find(entry => entry.character.id === character.id);
    assert(own && character.localRecord?.authoredFeature === MARKET_CHARACTER_FEATURE, `Namenskollision mit vorhandener Akte: ${character.id}`);
    for (const key of Object.keys(own.character)) assert.deepEqual(character[key], own.character[key], `Bereits bearbeitete eigene Akte: ${character.id}/${key}`);
  }
  const result = buildAuthoredCharacterImport(prior, exports, MARKET_CHARACTER_FEATURE, []);
  assert.equal(result.records.length, 3);
  for (const record of prior.registry.records) assert.deepEqual(result.registry.records.find(row => row.recordId === record.recordId), record);
  for (const character of prior.snapshot.characters) assert.deepEqual(result.snapshot.characters.find(row => row.id === character.id), character);
  for (const item of result.records) {
    assert.deepEqual(item.record.links.familyTree, []);
    assert.deepEqual(item.record.classification.families, []);
  }
  return result;
}

export function buildMarketCharacterCreateWrites(exports, documentName) {
  assertMarketCharacterExports(exports, { requireArtwork: true });
  return exports.map(entry => ({ update: { name: documentName(`characters/${entry.character.id}`), fields: encodeFirestoreFields(entry.character) }, currentDocument: { exists: false } }));
}
