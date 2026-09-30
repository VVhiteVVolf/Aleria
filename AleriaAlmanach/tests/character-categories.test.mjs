import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function harness(chars = [], map = {}) {
  const context = vm.createContext({
    chars, map, window: {}, console,
    document: { addEventListener() {}, getElementById: () => ({ contains: () => true }), querySelector: () => null },
    normalizeSearchText: value => String(value || '').toLowerCase(),
    sanitizeImageSrc: value => value || '',
    escapeHtml: value => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
    getCharacterAssignedTab: id => Object.keys(map).find(key => map[key].includes(id)) || '',
    getVisibleCharacterRecords: () => chars.filter(char => !char.archived),
    renderCharGrid() {}, renderCharSubtabs() {}
  });
  for (const name of ['character-taxonomy', 'character-register-views', 'character-categories', 'character-dashboard', 'character-category-browser']) {
    vm.runInContext(fs.readFileSync(new URL(`../modules/characters/${name}.js`, import.meta.url), 'utf8'), context);
  }
  vm.runInContext("let _activeCharTab = 'Alle'; let _activeCharSubtab = 'Alle'; let _charOrganizeMode = false; let _archiveSearchNeedle = '';", context);
  return expression => vm.runInContext(expression, context);
}

test('classification respects manual groups and uses explicit family, faction and place data only', () => {
  const chars = [
    { id: 'manual', genealogy: { houseName: 'Haus Draig' } },
    { id: 'house', genealogy: { houseName: 'Haus Draig' } },
    { id: 'spouse', genealogy: { sources: [{ familyId: 'haus-draenmelyn' }] } },
    { id: 'crew', fraktion: 'Mannschaft der Tiefenwyrm · Haus Draig' },
    { id: 'clergy', fraktion: 'Kirche von Cenyr, Celtigerns Wacht' },
    { id: 'place', currentLocation: 'Gwynthor' },
    { id: 'ambiguous', name: 'Ada Draig', genealogy: { sources: [{ familyId: 'haus-a' }, { familyId: 'haus-b' }] } },
    { id: 'unknown', name: 'Arthur Draig' }
  ];
  const before = structuredClone(chars);
  const run = harness(chars, { Gefährten: ['manual'] });
  assert.deepEqual(JSON.parse(run('JSON.stringify(chars.map(AleriaCharacterCategories.classify).map(c => [c.kind, c.label]))')), [
    ['collection', 'Gefährten'], ['family', 'Haus Draig'], ['family', 'Haus Draenmelyn'],
    ['faction', 'Mannschaft der Tiefenwyrm'], ['faction', 'Kirche von Cenyr'], ['location', 'Gwynthor'],
    ['unsorted', 'Noch zuordnen'], ['unsorted', 'Noch zuordnen']
  ]);
  assert.deepEqual(chars, before);
  assert.equal(run('buildCharacterDashboardSummary(chars).unsorted.length'), 2);
});

test('local unsorted records are classified without modifying IDs, assignments or live resources', () => {
  const snapshot = JSON.parse(fs.readFileSync(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url)));
  const before = JSON.stringify(snapshot);
  const run = harness(snapshot.characters, snapshot.charTabs.map);
  const counts = JSON.parse(run(`JSON.stringify({
    previouslyUnsorted: chars.filter(c => !c.archived && !getCharacterAssignedTab(c.id)).length,
    automatic: chars.filter(c => !c.archived && AleriaCharacterCategories.classify(c).automatic).length,
    remaining: chars.filter(c => !c.archived && !characterHasGroup(c)).length
  })`));
  assert.ok(counts.previouslyUnsorted > 0);
  assert.ok(counts.automatic > 0);
  assert.equal(counts.automatic + counts.remaining, counts.previouslyUnsorted);
  assert.equal(JSON.stringify(snapshot), before);
});

test('new/recent shortcuts show all dated records, sorted globally, and clear stale searches', () => {
  const chars = Array.from({ length: 20 }, (_, i) => ({
    id: String(i), name: `Figur ${20 - i}`, createdAt: `2026-09-${String(i + 1).padStart(2, '0')}T00:00:00Z`, updatedAt: { seconds: i + 1 }
  }));
  chars.push({ id: 'undated', name: 'Ohne Datum' });
  const run = harness(chars);
  run(`_characterRegisterSearch = 'keine Treffer';
    handleCharacterDashboardClick({ target: { closest: () => ({ dataset: { characterDashboardAction: 'set-filter', filter: 'new' } }) }, preventDefault() {}, stopPropagation() {} });`);
  assert.equal(run('hasCharacterRegisterSearch()'), false);
  assert.equal(run("filterCharactersForDashboard(chars, 'Alle').length"), 20);
  assert.equal(run("sortCharacterRegisterEntries(filterCharactersForDashboard(chars, 'Alle'))[0].id"), '19');
  run(`handleCharacterDashboardClick({ target: { closest: () => ({ dataset: { characterDashboardAction: 'set-filter', filter: 'recent' } }) }, preventDefault() {}, stopPropagation() {} });`);
  assert.equal(run("sortCharacterRegisterEntries(filterCharactersForDashboard(chars, 'Alle'))[0].id"), '19');
  run(`handleCharacterDashboardClick({ target: { closest: () => ({ dataset: { characterDashboardAction: 'set-filter', filter: 'recent' } }) }, preventDefault() {}, stopPropagation() {} });`);
  assert.equal(run('_characterDashboardFilter'), '');
});

test('category selection, category-aware search and reset keep a single visible scope', () => {
  const run = harness([
    { id: 'a', name: 'Ada', genealogy: { houseName: 'Haus A' } },
    { id: 'b', name: 'Bea', genealogy: { houseName: 'Haus B' } }
  ]);
  run("AleriaCharacterCategoryBrowser.select('family:haus a')");
  assert.equal(run('AleriaCharacterCategoryBrowser.filterEntries(chars)[0].id'), 'a');
  run("_characterRegisterSearch = 'Haus B'");
  assert.equal(run('filterCharacterRegisterEntries(chars)[0].id'), 'b');
  assert.equal(run('AleriaCharacterCategoryBrowser.filterEntries(filterCharacterRegisterEntries(chars)).length'), 0);
  run('resetCharacterRegisterFilters()');
  assert.equal(run('AleriaCharacterCategoryBrowser.hasSelection()'), false);
  assert.equal(run('hasCharacterRegisterSearch()'), false);
  assert.equal(run('AleriaCharacterCategoryBrowser.filterEntries(chars).length'), 2);
});

test('dashboard character buttons open profiles while card form controls do not', () => {
  const source = fs.readFileSync(new URL('../modules/characters/character-grid.js', import.meta.url), 'utf8');
  const opened = [];
  const context = vm.createContext({
    document: { addEventListener() {}, getElementById: () => ({ contains: () => true }) },
    openCharProfile: id => opened.push(id)
  });
  vm.runInContext(source, context);
  const button = { dataset: { characterGridAction: 'open-character', charId: 'a' } };
  button.closest = () => button;
  const event = { target: button, preventDefault() {} };
  context.handleCharacterGridActionClick(event);
  assert.deepEqual(opened, ['a']);
  const control = { closest: selector => selector === '[data-character-grid-action]' ? button : control };
  context.handleCharacterGridActionClick({ target: control, preventDefault() {} });
  assert.deepEqual(opened, ['a']);
});

test('a family category preserves the requested sort across different manual groups', () => {
  const run = harness([
    { id: 'older', name: 'Ada', updatedAt: '2026-01-01', genealogy: { sources: [{ familyId: 'haus-a' }] } },
    { id: 'newer', name: 'Zora', updatedAt: '2026-09-01', genealogy: { sources: [{ familyId: 'haus-a' }] } }
  ], { Gefährten: ['older'] });
  run("setCharacterRegisterViewMode('families'); AleriaCharacterCategoryBrowser.select('haus-a'); setCharacterRegisterSortMode('updated-desc')");
  assert.equal(run('AleriaCharacterCategoryBrowser.filterEntries(sortCharacterRegisterEntries(chars))[0].id'), 'newer');
});
