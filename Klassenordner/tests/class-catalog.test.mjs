import test from 'node:test';
import assert from 'node:assert/strict';
import { filterClassEntries, normalizeClassSearch, pickRandomClass } from '../modules/catalog/class-catalog-model.js';

const entries = [
  { id: 'cenyr-milwr', groupId: 'cenyr', name: 'Milwr', description: 'Waffenknecht & Miliz', militia: true },
  { id: 'vennyr-milwr', groupId: 'vennyr', name: 'Milwr', description: 'Waffenknecht & Miliz', militia: true },
  { id: 'cenyr-teulu', groupId: 'cenyr', name: 'Teulu', description: 'Klassischer Ritter Cenyrs', militia: false },
  { id: 'basis-monch', groupId: 'basis', name: 'Mönch', description: 'Pfad der inneren Stärke', militia: false },
  { id: 'moinneach-slogar', groupId: 'moinneach', name: 'Slógar', description: 'Móinneach – Die Schwarzmarschen', militia: true }
].map(entry => ({ ...entry, searchText: normalizeClassSearch(`${entry.name} ${entry.description} ${entry.groupId}`) }));

test('same-named cultural entries remain distinct and combine with the origin filter', () => {
  assert.deepEqual(filterClassEntries(entries, { query: 'MILWR' }).map(entry => entry.id), ['cenyr-milwr', 'vennyr-milwr']);
  assert.deepEqual(filterClassEntries(entries, { query: 'milwr', groupId: 'vennyr' }).map(entry => entry.id), ['vennyr-milwr']);
  assert.equal(filterClassEntries(entries, { query: 'milwr', groupId: 'basis' }).length, 0);
});

test('search accepts diacritics, multiple terms, culture and descriptions', () => {
  assert.equal(filterClassEntries(entries, { query: '  MONCH starke ' })[0].id, 'basis-monch');
  assert.equal(filterClassEntries(entries, { query: 'moinneach slogar' })[0].id, 'moinneach-slogar');
  assert.equal(filterClassEntries(entries, { query: 'Ritter CENYR' })[0].id, 'cenyr-teulu');
  assert.equal(filterClassEntries(entries, { query: '<script>' }).length, 0);
  assert.equal(filterClassEntries(entries, { query: '  ' }).length, entries.length);
});

test('random choice stays within current results and excludes militias on request', () => {
  const matches = filterClassEntries(entries, { groupId: 'cenyr' });
  assert.equal(pickRandomClass(matches, { random: () => 0 }).id, 'cenyr-teulu');
  assert.equal(pickRandomClass(matches, { excludeMilitia: false, random: () => 0 }).id, 'cenyr-milwr');
  assert.equal(pickRandomClass(matches, { excludeMilitia: false, random: () => 0.999 }).id, 'cenyr-teulu');
  assert.equal(matches.length, 2, 'Random selection must not mutate filtered results');
});

test('empty or entirely excluded random pools return no selection', () => {
  assert.equal(pickRandomClass([]), null);
  assert.equal(pickRandomClass(filterClassEntries(entries, { query: 'milwr' })), null);
});
