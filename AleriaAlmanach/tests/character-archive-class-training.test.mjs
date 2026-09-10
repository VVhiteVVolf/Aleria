import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extractCurrentCharacterArchiveEntries, reconcileCharacterArchiveClassTraining } from '../modules/character-archive/character-archive-class-training.js';
import { normalizeCharacterArchiveEntry } from '../modules/character-archive/character-archive-model.js';

test('raw live characters use the same current class attacks in the archive and the scene without writing their record', async () => {
  const source = JSON.parse(await readFile(new URL('../../CharakterDatenbank/records/familien/haus-draig/gawain-draig--q1QtSIug74FzzwUAqWrs/character.json', import.meta.url), 'utf8'));
  const character = structuredClone(source.sources.firestoreExports[0]);
  character.combatProfile.techniques.push({ id: 'my-personal-dragon', name: 'Persönlicher Drachenhieb', combatStyleId: 'drachentanz', notes: 'Eigene Ergänzung' });
  const before = structuredClone(character);
  const entries = extractCurrentCharacterArchiveEntries(character);
  assert.deepEqual(character, before);
  const attacks = entries.filter(entry => entry.kind === 'technique');
  assert.equal(attacks.length, 9);
  assert.equal(attacks.filter(entry => entry.data.id.startsWith('combat-style-drachentanz-')).length, 8);
  assert.ok(attacks.some(entry => entry.data.id === 'my-personal-dragon'));
  assert.ok(!attacks.some(entry => entry.data.id.startsWith('gawain-dragon-')));
});

test('stored archive entries retire only canonical old IDs and preserve manual icon and source metadata', () => {
  const current = normalizeCharacterArchiveEntry({ kind: 'technique', name: 'Alter Name', iconOverride: './my-icon.png',
    createdAt: '2020-01-01', sources: [{ kind: 'character', id: 'example', name: 'Beispiel' }],
    data: { id: 'combat-style-drachentanz-jungdrache-02-drachenbiss', combatStyleFormId: 'old-form', customMemo: 'behalten' } });
  const personal = normalizeCharacterArchiveEntry({ kind: 'technique', name: 'Eigener Sirenentanz', data: { id: 'personal-waves', combatStyleId: 'sirenentanz' } });
  const entries = [current, personal,
    normalizeCharacterArchiveEntry({ kind: 'technique', name: 'Altes Muster', data: { id: 'legacy-dragon-bite' } }),
    normalizeCharacterArchiveEntry({ kind: 'technique', name: 'Alte Derwyn-Technik', data: { id: 'combat-style-sirenentanz-derwyn-retired' } }),
    normalizeCharacterArchiveEntry({ kind: 'combat-style', name: 'Alter Bogendrache', data: { id: 'drachentanz-pfad-bogendrache' } })];
  const result = reconcileCharacterArchiveClassTraining(entries);
  assert.equal(result.length, 2);
  assert.equal(result[0].name, 'Biss des Jungdrachens');
  assert.equal(result[0].data.combatStyleFormId, 'drachentanz-form-i-jungdrache');
  assert.equal(result[0].data.customMemo, 'behalten');
  assert.equal(result[0].iconOverride, current.iconOverride);
  assert.equal(result[0].createdAt, current.createdAt);
  assert.deepEqual(result[0].sources, current.sources);
  assert.deepEqual(result[1], personal);
  assert.deepEqual(reconcileCharacterArchiveClassTraining(result), result);
});
