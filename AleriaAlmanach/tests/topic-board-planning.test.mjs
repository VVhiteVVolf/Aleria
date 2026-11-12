import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadPlanning() {
  const context = vm.createContext({ console, Date, Math });
  for (const relativePath of [
    '../modules/world-date/world-date-model.js',
    '../modules/topic-board/topic-board-travel.js',
    '../modules/topic-board/topic-board-schedule.js',
    '../modules/topic-board/topic-board-planning.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context.AleriaTopicBoardPlanning;
}

const currentDate = { year: 1740, month: 3, day: 10 };
const date = day => ({ year: 1740, month: 3, day });
const fixtures = [
  { id: 'later', schedule: { startDate: date(29) } },
  { id: 'idea', title: 'Eine offene Idee' },
  { id: 'today', schedule: { startDate: date(10) } },
  { id: 'ongoing', schedule: { startDate: date(9), durationDays: 3 } },
  { id: 'old', schedule: { startDate: date(8) } },
  { id: 'played', status: 'archived', schedule: { startDate: date(11) } }
];

test('Planungsübersicht zählt nur offene Plays und hält laufende und verpasste Termine auseinander', () => {
  const planning = loadPlanning();
  const summary = planning.getSummary(fixtures, currentDate);
  assert.equal(summary.open, 5);
  assert.equal(summary.archived, 1);
  assert.equal(summary.scheduled, 4);
  assert.equal(summary.upcoming, 1);
  assert.equal(summary.relevant, 3);
  assert.equal(summary.unscheduled, 1);
  assert.equal(summary.today, 1);
  assert.equal(summary.active, 1);
  assert.equal(summary.overdue, 1);
  assert.equal(summary.nextProposal.id, 'old');
});

test('Planungsfilter erhalten Eingaben und zeigen alle, anstehende oder terminlose Plays', () => {
  const planning = loadPlanning();
  const input = fixtures.filter(proposal => proposal.status !== 'archived');
  const before = JSON.stringify(input);
  assert.deepEqual(Array.from(planning.filterProposals(input, 'upcoming', currentDate), proposal => proposal.id), ['later']);
  assert.deepEqual(Array.from(planning.filterProposals(input, 'unscheduled', currentDate), proposal => proposal.id), ['idea']);
  assert.deepEqual(Array.from(planning.filterProposals(input, 'relevant', currentDate), proposal => proposal.id), ['today', 'ongoing', 'old']);
  assert.equal(planning.filterProposals(input).length, 5);
  assert.equal(JSON.stringify(input), before);
});

test('chronologische Reihenfolge verwendet den Aleria-Kalender und stellt Ideen ans Ende', () => {
  const planning = loadPlanning();
  const input = [
    { id: 'idea', votes: { a: true, b: true } },
    { id: 'new-month', schedule: { startDate: { year: 1740, month: 4, day: 1 } } },
    { id: 'end-month', schedule: { startDate: { year: 1740, month: 3, day: 36 } } },
    { id: 'older-year', schedule: { startDate: { year: 1739, month: 13, day: 36 } } }
  ];
  const order = input.map(proposal => proposal.id);
  assert.deepEqual(Array.from(planning.sortChronologically(input), proposal => proposal.id), ['older-year', 'end-month', 'new-month', 'idea']);
  assert.deepEqual(input.map(proposal => proposal.id), order);
});

test('gleiche Termine berücksichtigen gemeinsame Stimmen vor jüngster Bearbeitung', () => {
  const planning = loadPlanning();
  const input = [
    { id: 'recent', schedule: { startDate: date(11) }, votes: {}, updatedAtClient: 100 },
    { id: 'popular', schedule: { startDate: date(11) }, votes: { patrick: true, removed: false }, updatedAtClient: 1 },
    { id: 'older', schedule: { startDate: date(11) }, votes: {}, updatedAtClient: 2 }
  ];
  assert.deepEqual(Array.from(planning.sortChronologically(input), proposal => proposal.id), ['popular', 'recent', 'older']);
});

test('Reiseantritt und Reisedauer verwenden denselben bestehenden Terminresolver', () => {
  const planning = loadPlanning();
  const proposal = {
    travel: { enabled: true, departureDate: date(8), totalDays: 4, arrivalDate: date(12) }
  };
  assert.equal(planning.getTiming(proposal, currentDate).state, 'active');
  assert.equal(planning.getSummary([proposal], currentDate).scheduled, 1);
});

test('ungültige Daten erfinden weder Termine noch ein nächstes Play', () => {
  const planning = loadPlanning();
  assert.equal(planning.getSummary([{ schedule: { startDate: { year: 1740, month: 14, day: 1 } } }], currentDate).unscheduled, 1);
  const unknownCurrent = planning.getSummary([{ schedule: { startDate: date(11) } }], null);
  assert.equal(unknownCurrent.scheduled, 1);
  assert.equal(unknownCurrent.unscheduled, 0);
  assert.equal(unknownCurrent.upcoming, 0);
  assert.equal(unknownCurrent.nextProposal.schedule.startDate.day, 11);
  assert.equal(planning.getSummary([], currentDate).nextProposal, null);
  assert.equal(planning.getSummary(null, currentDate).open, 0);
});
