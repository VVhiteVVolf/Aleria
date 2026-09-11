import assert from 'node:assert/strict';
import test from 'node:test';
import { createParticipantSelection, matchesParticipant } from '../modules/topic-board/topic-board-participant-selection.mjs';

const characters = [
  { id: 'idwal', name: 'Idwal Draig', title: 'Kapitän' },
  { id: 'trevor', name: 'Trevor', title: 'Wächter' },
  { id: 'sian', name: 'Siânmue', title: 'Windreiterin' }
];

test('mehrere Namen suchen mit Komma, Semikolon und Zeilenumbruch; Wörter eines Namens gelten gemeinsam', () => {
  const selection = createParticipantSelection({ characters });
  for (const separator of [',', ';', '\n']) {
    assert.deepEqual(selection.filter(`IDWAL DRAIG${separator}sianmue`).map(record => record.id), ['idwal', 'sian']);
  }
  assert.equal(matchesParticipant(characters[0], 'Draig Kapitan'), true);
  assert.equal(matchesParticipant(characters[0], 'Idwal Wächter'), false);
  assert.equal(selection.filter('kein treffer').length, 0);
});

test('mehrfach ergänzen erhält bestehende Auswahl, dedupliziert und meldet das Limit', () => {
  const selection = createParticipantSelection({ characters, selected: [characters[0]], limit: 2 });
  assert.deepEqual(selection.add(['idwal', 'trevor', 'sian', 'unknown']), { added: 1, skipped: 1 });
  assert.deepEqual(selection.selected().map(record => record.id), ['idwal', 'trevor']);
  assert.deepEqual(selection.filter('sian', true), []);
  assert.deepEqual(selection.filter('', true).map(record => record.id), ['idwal', 'trevor']);
});

test('entfernen und leeren sind rückgängig; Suche verändert die Auswahl nicht', () => {
  const selection = createParticipantSelection({ characters, selected: characters });
  selection.filter('trevor');
  assert.equal(selection.selected().length, 3);
  selection.clear();
  assert.equal(selection.selected().length, 0);
  selection.undo();
  assert.equal(selection.selected().length, 3);
  selection.remove('idwal');
  selection.undo();
  assert.equal(selection.has('idwal'), true);
});

test('gespeicherte und übernommene Personen bleiben erhalten, auch ohne aktuellen Archiveintrag', () => {
  const missing = { id: 'old', name: 'Alte Begleitung', portrait: '/old.png' };
  const selection = createParticipantSelection({ characters, selected: [missing] });
  selection.add([{ id: 'guest', name: 'Gast' }, characters[0]]);
  assert.deepEqual(selection.selected().map(record => record.id), ['old', 'guest', 'idwal']);
  const copy = selection.selected();
  copy[0].name = 'Mutiert';
  assert.equal(selection.selected()[0].name, missing.name);
});
