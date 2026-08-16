import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const viewSource = fs.readFileSync(
  new URL('../modules/characters/character-register-views.js', import.meta.url),
  'utf8'
);

function createViewContext() {
  const context = vm.createContext({
    Date,
    Number,
    document: {
      addEventListener() {},
      getElementById() { return null; }
    },
    getCharacterRelevanceValue(value) {
      return { minor: 'minor', supporting: 'supporting', important: 'important', plot: 'plot' }[value] || '';
    },
    getCharacterRelevanceLabel(value) {
      return { minor: 'Nebenfigur', supporting: 'Tragend', important: 'Wichtig', plot: 'Plot-Knoten' }[value] || '';
    },
    getCharacterStatusLabel(value) {
      return { active: 'Aktiv', inactive: 'Inaktiv', missing: 'Verschollen', dead: 'Tot', unknown: 'Unklar' }[value] || '';
    }
  });
  vm.runInContext(viewSource, context);
  return context;
}

test('character register sorting supports names, dates and relevance without mutating input', () => {
  const context = createViewContext();
  const chars = [
    { id: 'minor', name: 'Zora', relevance: 'minor', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'plot', name: 'Ada 10', relevance: 'plot', updatedAt: '2026-03-01T00:00:00Z' },
    { id: 'important', name: 'Ada 2', relevance: 'important', updatedAt: '2026-02-01T00:00:00Z' }
  ];
  context.chars = chars;

  assert.deepEqual(
    Array.from(vm.runInContext("sortCharacterRegisterEntries(chars, 'name-asc').map(char => char.id)", context)),
    ['important', 'plot', 'minor']
  );
  assert.deepEqual(
    Array.from(vm.runInContext("sortCharacterRegisterEntries(chars, 'updated-desc').map(char => char.id)", context)),
    ['plot', 'important', 'minor']
  );
  assert.deepEqual(
    Array.from(vm.runInContext("sortCharacterRegisterEntries(chars, 'relevance-desc').map(char => char.id)", context)),
    ['plot', 'important', 'minor']
  );
  assert.deepEqual(chars.map(char => char.id), ['minor', 'plot', 'important']);
});

test('character register facets derive ordered relevance and status views', () => {
  const context = createViewContext();
  context.chars = [
    { id: 'unset' },
    { id: 'minor', relevance: 'minor', status: 'dead' },
    { id: 'important', relevance: 'important', status: 'active' },
    { id: 'plot-field', relevance: 'supporting', plotNode: 'Krönungsintrige', status: 'missing' }
  ];

  assert.deepEqual(
    Array.from(vm.runInContext("buildCharacterRegisterFacetBuckets(chars, 'relevance').map(bucket => bucket.label)", context)),
    ['Plot-Knoten', 'Wichtig', 'Nebenfigur', 'Ohne Relevanz']
  );
  assert.deepEqual(
    Array.from(vm.runInContext("buildCharacterRegisterFacetBuckets(chars, 'status').map(bucket => bucket.label)", context)),
    ['Aktiv', 'Verschollen', 'Tot', 'Ohne Status']
  );
});

test('dynamic character facets merge labels case-insensitively and keep fallbacks visible', () => {
  const context = createViewContext();
  context.chars = [
    { id: 'one', fraktion: 'Silbergilde', currentLocation: 'Aleria' },
    { id: 'two', faction: 'silbergilde', currentLocation: '' },
    { id: 'three' }
  ];

  const factions = vm.runInContext(
    "buildCharacterRegisterFacetBuckets(chars, 'faction').map(bucket => ({ label: bucket.label, count: bucket.chars.length }))",
    context
  );
  assert.deepEqual(
    Array.from(factions, bucket => ({ label: bucket.label, count: bucket.count })),
    [
      { label: 'Ohne Fraktion', count: 1 },
      { label: 'Silbergilde', count: 2 }
    ]
  );

  assert.deepEqual(
    Array.from(vm.runInContext("buildCharacterRegisterFacetBuckets(chars, 'location').map(bucket => bucket.label)", context)),
    ['Aleria', 'Ohne aktuellen Ort']
  );
});

test('characters and creatures are primary registers instead of crowded theme tabs', () => {
  const archiveViewSource = fs.readFileSync(
    new URL('../modules/archive/archive-view.js', import.meta.url),
    'utf8'
  );
  const sidebarSource = fs.readFileSync(
    new URL('../modules/sidebar/sidebar-registers.js', import.meta.url),
    'utf8'
  );

  assert.match(archiveViewSource, /const tabOrder = \['Alle', \.\.\.sectionTabs\]/);
  assert.doesNotMatch(archiveViewSource, /const tabOrder = \[[^\n]*'Charaktere'/);
  assert.match(archiveViewSource, /new Set\(\['Alle', 'Charaktere', 'Kreaturen'\]\)/);
  assert.match(sidebarSource, /archiveTab: 'Charaktere'/);
  assert.match(sidebarSource, /archiveTab: 'Kreaturen'/);
  assert.match(sidebarSource, /icon: 'Charaktere\.png'/);
  assert.match(sidebarSource, /icon: 'Kreaturen\.png'/);
  assert.match(sidebarSource, /icon: 'Charakterbogen Archiv\.png'/);
  assert.match(sidebarSource, /data-archive-register-tab/);
});
