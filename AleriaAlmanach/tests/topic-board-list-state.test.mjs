import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadTopicBoardListState() {
  const context = vm.createContext({ console, Date, Math });
  for (const relativePath of [
    '../modules/world-date/world-date-model.js',
    '../modules/topic-board/topic-board-travel.js',
    '../modules/topic-board/topic-board-schedule.js',
    '../modules/topic-board/topic-board-model.js',
    '../modules/topic-board/topic-board-list-state.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context;
}

function loadTopicBoardUi() {
  const context = vm.createContext({
    console,
    Date,
    Math,
    escapeHtml: value => String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]),
    getTopicBoardViewerId: () => 'viewer',
    hasTopicProposalVote: () => false,
    sanitizeImageSrc: value => String(value || '')
  });
  for (const relativePath of [
    '../modules/world-date/world-date-model.js',
    '../modules/topic-board/topic-board-travel.js',
    '../modules/topic-board/topic-board-schedule.js',
    '../modules/topic-board/topic-board-model.js',
    '../modules/topic-board/topic-board-list-state.js',
    '../modules/topic-board/topic-board-travel-ui.js',
    '../modules/topic-board/topic-board-schedule-ui.js',
    '../modules/topic-board/topic-board-ui.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context;
}

const proposals = `[
  {
    id: 'segelreise',
    title: 'Reise nach Abergwint',
    description: 'Aufbruch mit Idwals Schiff',
    category: 'reise',
    participants: [{ id: 'sianmue', name: 'Siânmue' }],
    travel: { enabled: true, origin: 'Tûr Morlan', destination: 'Abergwint', stopovers: [{ place: 'Nyrhaven', note: 'Vorräte' }] },
    voteCount: 1,
    updatedAtClient: 30
  },
  {
    id: 'hofempfang',
    title: 'Empfang der Windreiter',
    description: 'Verhandlung über einen Söldnervertrag',
    category: 'hof',
    participants: [{ id: 'celtigern', name: 'Celtigern' }],
    location: 'Celtigerns Wacht',
    voteCount: 4,
    updatedAtClient: 10
  }
]`;

test('die Themensuche findet Figuren und Reise-Zwischenstopps ohne Akzentprobleme', () => {
  const context = loadTopicBoardListState();

  const byCharacter = vm.runInContext(`(() => {
    AleriaTopicBoardListState.setQuery('sianmue');
    return AleriaTopicBoardListState.selectProposals(${proposals}).map(item => item.id);
  })()`, context);
  assert.deepEqual(Array.from(byCharacter), ['segelreise']);

  const byStopover = vm.runInContext(`(() => {
    AleriaTopicBoardListState.setQuery('nyrhaven');
    return AleriaTopicBoardListState.selectProposals(${proposals}).map(item => item.id);
  })()`, context);
  assert.deepEqual(Array.from(byStopover), ['segelreise']);
});

test('Themenart und Sortierung bleiben im gekapselten Listen-State', () => {
  const context = loadTopicBoardListState();
  const result = vm.runInContext(`(() => {
    AleriaTopicBoardListState.setCategory('hof');
    AleriaTopicBoardListState.setSort('title');
    return {
      ids: AleriaTopicBoardListState.selectProposals(${proposals}).map(item => item.id),
      state: AleriaTopicBoardListState.getState()
    };
  })()`, context);

  assert.deepEqual(Array.from(result.ids), ['hofempfang']);
  assert.equal(result.state.category, 'hof');
  assert.equal(result.state.sort, 'title');
});

test('Kalendersortierung stellt den nächsten festen Termin zuerst', () => {
  const context = loadTopicBoardListState();
  const ids = vm.runInContext(`(() => {
    AleriaTopicBoardListState.setSort('due');
    return AleriaTopicBoardListState.selectProposals([
      { id: 'spaeter', schedule: { startDate: { year: 1740, month: 4, day: 2 } } },
      { id: 'offen' },
      { id: 'zuerst', schedule: { startDate: { year: 1740, month: 3, day: 12 } } }
    ]).map(item => item.id);
  })()`, context);

  assert.deepEqual(Array.from(ids), ['zuerst', 'spaeter', 'offen']);
});

test('in der kompakten Liste ist immer hoechstens ein Thema aufgeklappt', () => {
  const context = loadTopicBoardListState();
  const expanded = vm.runInContext(`[
    AleriaTopicBoardListState.toggleExpanded('segelreise'),
    AleriaTopicBoardListState.toggleExpanded('hofempfang'),
    AleriaTopicBoardListState.toggleExpanded('hofempfang')
  ]`, context);

  assert.deepEqual(Array.from(expanded), ['segelreise', 'hofempfang', '']);
});

test('ein Themenzettel rendert zuerst als Vorschau und zeigt Details erst nach dem Aufklappen', () => {
  const context = loadTopicBoardUi();
  const collapsed = vm.runInContext(`renderTopicBoardProposalCard(${proposals}[0])`, context);
  assert.match(collapsed, /data-topic-board-action="toggle-details"/);
  assert.match(collapsed, /aria-expanded="false"/);
  assert.match(collapsed, /data-topic-board-details hidden/);
  assert.match(collapsed, /topic-board-card-actions is-persistent/);
  assert.match(collapsed, />Bearbeiten</);

  const expanded = vm.runInContext(`(() => {
    AleriaTopicBoardListState.toggleExpanded('segelreise');
    return renderTopicBoardProposalCard(${proposals}[0]);
  })()`, context);
  assert.match(expanded, /aria-expanded="true"/);
  assert.match(expanded, /data-topic-board-details>/);
  assert.doesNotMatch(expanded, /data-topic-board-details hidden/);
  assert.match(expanded, /topic-board-schedule-badge/);
});

test('die Figurenfilterung blendet nicht passende Namen tatsaechlich aus', () => {
  const context = loadTopicBoardUi();
  const buttons = [
    { dataset: { characterSearch: 'naria windreiter' }, hidden: false },
    { dataset: { characterSearch: 'idwal draig' }, hidden: false },
    { dataset: { characterSearch: 'edras goldsee' }, hidden: false }
  ];
  const counter = { textContent: '' };
  const empty = { hidden: true };
  context.document = {
    querySelectorAll: selector => selector.includes('.topic-board-character') ? buttons : [],
    querySelector: selector => selector.includes('character-count') ? counter : (selector.includes('character-empty') ? empty : null)
  };

  vm.runInContext("AleriaTopicBoardUI.filterTopicBoardCharacters('N')", context);

  assert.deepEqual(buttons.map(button => button.hidden), [false, true, true]);
  assert.equal(counter.textContent, '1 von 3 Figuren');
  assert.equal(empty.hidden, true);
});

test('die Figurenfilter-Regel kann ausgeblendete Treffer nicht per display ueberschreiben', () => {
  const css = fs.readFileSync(new URL('../styles/topic-board.css', import.meta.url), 'utf8');
  const ui = fs.readFileSync(new URL('../modules/topic-board/topic-board-ui.js', import.meta.url), 'utf8');

  assert.match(css, /\.topic-board-character\[hidden\]\s*\{\s*display:\s*none;\s*\}/);
  assert.match(ui, /data-topic-board-action="toggle-details"/);
  assert.match(ui, /data-topic-board-character-count/);
});
