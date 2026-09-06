import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCharacterDatabase, markCharacterDatabaseOverlay } from '../../CharakterDatenbank/lib/character-database-model.mjs';

function merge(characters) {
  return buildCharacterDatabase({ characters, exportedAt: '2026-09-06T00:00:00.000Z' }, []).records[0].record.character;
}

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
