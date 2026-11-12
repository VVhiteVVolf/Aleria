import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadOverview(date) {
  const context = vm.createContext({
    console,
    Date,
    Math,
    AleriaWorldDateStore: { getState: () => ({ date }) }
  });
  for (const relativePath of [
    '../modules/world-date/world-date-model.js',
    '../modules/topic-board/topic-board-travel.js',
    '../modules/topic-board/topic-board-schedule.js',
    '../modules/topic-board/topic-board-model.js',
    '../modules/topic-board/topic-board-planning.js',
    '../modules/topic-board/topic-board-schedule-ui.js',
    '../modules/topic-board/topic-board-overview.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context.AleriaTopicBoardOverview;
}

const date = day => ({ year: 1740, month: 3, day });
const proposals = [
  { id: 'old', schedule: { startDate: date(8) } },
  { id: 'ongoing', schedule: { startDate: date(9), durationDays: 3 } },
  { id: 'today', schedule: { startDate: date(10) } },
  { id: 'tomorrow', schedule: { startDate: date(11) } },
  { id: 'idea', schedule: { startDate: { year: null, month: null, day: null } } }
];
const renderCard = proposal => `<article data-test-card="${proposal.id}"></article>`;
const cardIds = markup => Array.from(markup.matchAll(/data-test-card="([^"]+)"/g), match => match[1]);
function groupedCardIds(markup) {
  return Object.fromEntries(Array.from(
    markup.matchAll(/<section[^>]*data-topic-board-group="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g),
    match => [match[1], cardIds(match[2])]
  ));
}

test('fehlendes Weltdatum erhält jede datierte und undatierte Karte in ihrer Reihenfolge', () => {
  const overview = loadOverview({ year: null, month: null, day: null });
  const before = JSON.stringify(proposals);
  const markup = overview.renderGroups(proposals, { view: 'open', sort: 'due', renderCard });
  assert.deepEqual(cardIds(markup), proposals.map(proposal => proposal.id));
  assert.deepEqual(groupedCardIds(markup), {});
  assert.equal(JSON.stringify(proposals), before);
});

test('gültiges Weltdatum zeigt jedes Play genau einmal in seiner passenden Planungsgruppe', () => {
  const overview = loadOverview(date(10));
  const before = JSON.stringify(proposals);
  const markup = overview.renderGroups(proposals, { view: 'open', sort: 'due', renderCard });
  assert.deepEqual(groupedCardIds(markup), {
    relevant: ['old', 'ongoing', 'today'],
    upcoming: ['tomorrow'],
    unscheduled: ['idea']
  });
  assert.deepEqual(cardIds(markup), proposals.map(proposal => proposal.id));
  assert.equal(new Set(cardIds(markup)).size, proposals.length);
  assert.equal(JSON.stringify(proposals), before);
});

test('am nächsten Welttag wechselt ein zukünftiger Play in relevant und das laufende Ende bleibt inklusive', () => {
  const overview = loadOverview(date(11));
  const markup = overview.renderGroups(proposals, { view: 'open', sort: 'due', renderCard });
  assert.deepEqual(groupedCardIds(markup), {
    relevant: ['old', 'ongoing', 'today', 'tomorrow'],
    unscheduled: ['idea']
  });
  assert.equal(new Set(cardIds(markup)).size, proposals.length);
});

test('Archiv und gewählte alternative Reihenfolgen bleiben ungegliedert und vollständig', () => {
  const overview = loadOverview(date(10));
  const input = proposals.slice().reverse();
  for (const options of [
    { view: 'archived', sort: 'played' },
    { view: 'open', sort: 'votes' }
  ]) {
    const markup = overview.renderGroups(input, { ...options, renderCard });
    assert.deepEqual(cardIds(markup), input.map(proposal => proposal.id));
    assert.deepEqual(groupedCardIds(markup), {});
  }
});
