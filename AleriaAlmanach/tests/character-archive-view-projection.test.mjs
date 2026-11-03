import test from 'node:test';
import assert from 'node:assert/strict';
import { projectCharacterArchiveViewEntries, getCharacterArchiveViewId, groupCharacterArchiveViewFamilies } from '../modules/character-archive/character-archive-view-projection.js';
import { addArchiveGroupEntry } from '../modules/character-archive/character-archive-group-tree.js';

const entry = (formula, extra = {}) => ({ id: 'old-colliding-id', key: 'ability::shared', kind: 'ability', name: 'Gleicher Name',
  data: { name: 'Gleicher Name', rollFormula: formula }, sources: [], ...extra });

test('different rules with a legacy shared ID have separate stable card actions and survive hierarchy grouping', () => {
  const rows = [entry('1d6'), entry('2d6')], before = structuredClone(rows);
  const projected = projectCharacterArchiveViewEntries(rows);
  assert.equal(new Set(projected.map(getCharacterArchiveViewId)).size, 2);
  assert.deepEqual(projected.map(getCharacterArchiveViewId), projectCharacterArchiveViewEntries(rows.toReversed()).toReversed().map(getCharacterArchiveViewId));
  assert.ok(projected.every(row => row.id === 'old-colliding-id'));
  const group = { entries: [] }; projected.forEach(row => addArchiveGroupEntry(group, row));
  assert.equal(group.entries.length, 2);
  assert.deepEqual(rows, before);
});

test('same-name rule variants form one expandable family without losing any selection target', () => {
  const rows = projectCharacterArchiveViewEntries([entry('1d6', { builtin: true }), entry('2d6', { archivedFromProfile: true,
    sources: [{ kind: 'character', id: 'public-character', name: 'Öffentliche Figur' }] })]);
  const families = groupCharacterArchiveViewFamilies(rows);
  assert.equal(families.length, 1); assert.equal(families[0].length, 2);
  assert.match(families[0][1].archiveVariantLabel, /Öffentliche Figur/);
  assert.equal(projectCharacterArchiveViewEntries([entry('1d6')])[0].archiveVariantLabel, '');
});

test('family grouping never mixes archive kinds or mutates the original display order', () => {
  const rows = [entry('2d6'), entry('1d6', { kind: 'spell' })], before = structuredClone(rows);
  assert.equal(groupCharacterArchiveViewFamilies(rows).length, 2);
  assert.deepEqual(rows, before);
});
