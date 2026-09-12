import assert from 'node:assert/strict';
import test from 'node:test';
import { createCharacterArchiveIndex, queryCharacterArchive, matchesArchiveSource } from '../modules/character-archive/character-archive-query.js';

const entries = [
  { id: 'fire-10', kind: 'spell', name: 'Feuer 10', builtin: true, description: 'Flamme', sources: [{ kind: 'character', name: 'Rhiannon' }, { kind: 'creature', name: 'Drache' }], data: { school: 'Elemente' } },
  { id: 'fire-2', kind: 'spell', name: 'Feuer 2', builtin: false, archivedFromProfile: true, sources: [{ kind: 'character', name: 'Rhiannon' }], data: {} },
  { id: 'natural', kind: 'attack', name: 'Biss', data: { weaponType: 'natural' }, sources: [] },
  { id: 'trait', kind: 'trait', name: 'Äußerst tapfer', data: {}, description: 'Großer Mut', sources: [] }
];
const index = createCharacterArchiveIndex(entries);
const ids = options => queryCharacterArchive(index, options).map(entry => entry.id);

test('a shared template appears under every applicable source instead of only the first', () => {
  assert.deepEqual(ids({ source: 'character' }), ['fire-2', 'fire-10']);
  assert.deepEqual(ids({ source: 'creature' }), ['fire-10']);
  assert.deepEqual(ids({ source: 'system' }), ['fire-10']);
  assert.equal(matchesArchiveSource(entries[1], 'custom'), false);
  assert.equal(matchesArchiveSource({ ...entries[1], updatedAt: '2026-09-12T10:00:00Z' }, 'custom'), true);
});

test('search combines words across names, rules and sources with German normalization', () => {
  assert.deepEqual(ids({ search: 'rhiannon feuer' }), ['fire-2', 'fire-10']);
  assert.deepEqual(ids({ search: 'ausserst grosser' }), ['trait']);
  assert.deepEqual(ids({ search: 'feuer unbekannt' }), []);
  assert.deepEqual(ids({ search: '  feuer  ', source: 'creature', kind: 'spell' }), ['fire-10']);
});

test('pickers preserve exact character-sheet collection membership despite archive grouping', () => {
  assert.deepEqual(ids({ kind: 'attack' }), []);
  assert.deepEqual(ids({ kind: 'technique' }), ['natural']);
  assert.deepEqual(ids({ picker: { kind: 'attack' } }), ['natural']);
});

test('sorting uses numeric German names and chronological dates without modifying the index', () => {
  assert.deepEqual(ids({ kind: 'spell' }), ['fire-2', 'fire-10']);
  const dated = createCharacterArchiveIndex([
    { ...entries[0], updatedAt: '2026-09-12T12:00:00+02:00' },
    { ...entries[1], updatedAt: '2026-09-12T10:30:00Z' },
    { ...entries[3], updatedAt: 'invalid' }
  ]);
  assert.deepEqual(queryCharacterArchive(dated, { sort: 'newest' }).map(entry => entry.id), ['fire-2', 'fire-10', 'trait']);
  assert.equal(dated[0].entry.id, 'fire-10');
});
