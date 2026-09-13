import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCharacterDatabase, markCharacterDatabaseOverlay } from '../../CharakterDatenbank/lib/character-database-model.mjs';

function merge(characters) {
  return buildCharacterDatabase({ characters, exportedAt: '2026-09-06T00:00:00.000Z' }, []).records[0].record.character;
}

test('Bestätigte Namenskorrekturen vereinigen alte Schreibweise und Stammbaumfigur verlustfrei', () => {
  const old = { id: 'a-player', name: 'Arian Seathwyr', portrait: 'player.png', emotes: [{ img: 'smile.png' }], playerOwner: 'patrick' };
  const tree = { id: 'person--arian', name: 'Arian Saethwyr', identity: { worldPersonId: 'person--arian' }, portrait: 'tree.png' };
  const latest = markCharacterDatabaseOverlay({
    ...old, name: 'Arian Saethwyr', identity: tree.identity, updatedAt: '2026-09-13T00:00:00.000Z',
    imageSets: [{ id: 'standard', portrait: 'player.png', emotes: old.emotes }, { id: 'tree', portrait: 'tree.png', emotes: [] }]
  }, { replaceExportedFields: true });
  for (const characters of [[old, tree, latest], [latest, tree, old]]) {
    const result = buildCharacterDatabase({ characters }, []).records;
    assert.equal(result.length, 1);
    assert.equal(result[0].record.character.id, old.id);
    assert.equal(result[0].record.character.name, tree.name);
    assert.equal(result[0].record.character.playerOwner, 'patrick');
    assert.deepEqual(result[0].record.character.emotes, old.emotes);
    assert.deepEqual(result[0].record.character.imageSets, latest.imageSets);
    assert.ok(result[0].record.identity.aliases.includes(old.name));
    assert.deepEqual(new Set(result[0].record.links.firestore.documentIds), new Set([old.id, tree.id]));
    assert.equal(old.name, 'Arian Seathwyr');
  }
});

test('Die neueste bestätigte Umbenennung gilt nur für ihre feste Dokument-ID', () => {
  const old = { id: 'one', name: 'Alter Name' };
  const namesake = { id: 'two', name: 'Alter Name' };
  const earlier = markCharacterDatabaseOverlay({ id: 'one', name: 'Zwischenname', updatedAt: '2026-09-12T00:00:00.000Z' }, { replaceExportedFields: true });
  const latest = markCharacterDatabaseOverlay({ id: 'one', name: 'Neuer Name', updatedAt: '2026-09-13T00:00:00.000Z' }, { replaceExportedFields: true });
  const result = buildCharacterDatabase({ characters: [latest, old, namesake, earlier] }, []).records.map(item => item.record.character);
  assert.equal(result.length, 2);
  assert.equal(result.find(character => character.id === 'one').name, 'Neuer Name');
  assert.equal(result.find(character => character.id === 'two').name, 'Alter Name');
});

test('Bestätigter Export übernimmt Inventar und Biografie ohne alte Begleiter oder gelöschte Einträge', () => {
  const archived = {
    id: 'idwal', name: 'Idwal Draig', profileLink: '/idwal',
    inventory: { companions: [{ id: 'raven', name: 'Distry', imageFormat: 'square' }], items: [{ id: 'removed' }] },
    biography: { stats: [{ label: 'Amt', value: 'Altes Amt' }], notes: 'Alte Notiz' },
    combatProfile: { techniques: [{ id: 'old' }] },
    portrait: 'old.png'
  };
  const latest = {
    id: 'idwal', name: 'Idwal Draig', updatedAt: '2026-09-06T00:00:00.000Z',
    inventory: { companions: [{ name: 'Distry', id: 'raven', imageFormat: 'portrait' }], items: [] },
    biography: { stats: [{ label: 'Amt', value: 'Kapitän' }], notes: '' },
    combatProfile: null, portrait: ''
  };
  const original = structuredClone(archived);
  const result = merge([archived, markCharacterDatabaseOverlay(latest, { replaceExportedFields: true })]);
  assert.deepEqual(result.inventory, latest.inventory);
  assert.deepEqual(result.biography, latest.biography);
  assert.equal(result.combatProfile, null);
  assert.equal(result.portrait, '');
  assert.equal(result.profileLink, '/idwal');
  assert.deepEqual(archived, original);
  assert.ok(!JSON.stringify(result).includes('__aleriaCharacter'));
});

test('Mehrere bestätigte Exporte verwenden den neuesten Stand auch bei weniger Feldern und Einträgen', () => {
  const older = markCharacterDatabaseOverlay({
    id: 'rhodri', name: 'Rhodri Aelmor', updatedAt: '2026-09-05T00:00:00.000Z', role: 'Wachführer',
    inventory: { items: [{ id: 'one' }, { id: 'two' }] }, bio: 'Vorhandene Bio'
  }, { replaceExportedFields: true });
  const newer = markCharacterDatabaseOverlay({
    id: 'rhodri', name: 'Rhodri Aelmor', updatedAt: '2026-09-06T00:00:00.000Z', role: 'Wachmeister',
    inventory: { items: [] }
  }, { replaceExportedFields: true });
  for (const sources of [[newer, older], [older, newer]]) {
    const result = merge(sources);
    assert.equal(result.role, 'Wachmeister');
    assert.deepEqual(result.inventory.items, []);
    assert.equal(result.bio, older.bio);
  }
});

test('Bisherige ergänzende Exporte behalten ihre Zusammenführung und atomare Kampfprofilkorrektur', () => {
  const archived = { id: 'test', name: 'Test', aliases: ['Früher'], bio: 'Archivbiografie', combatProfile: { techniques: [{ id: 'old' }] } };
  const overlay = markCharacterDatabaseOverlay({ id: 'test', name: 'Test', aliases: ['Heute'], combatProfile: { techniques: [{ id: 'new' }] } });
  const result = merge([archived, overlay]);
  assert.equal(result.bio, archived.bio);
  assert.deepEqual(new Set(result.aliases), new Set(['Früher', 'Heute']));
  assert.deepEqual(result.combatProfile, overlay.combatProfile);
});
