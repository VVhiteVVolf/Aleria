import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEITHEACH_CHRONOLOGY as chronology, LEITHEACH_ELAPSED_HOURS, raidHours, raidPoint, raidIncidentLabel, raidVoyageBudget } from '../../shared/coastal-history/leitheach-chronology.mjs';
import { LEITHEACH_ROUTE as route } from '../../shared/coastal-history/leitheach-route.mjs';
import { coastalSource, COASTAL_ORIGINALS, applyCoastalEdition } from '../../shared/coastal-history/coastal-sources.mjs';
import { LEITHEACH_SOURCE_CHANGES } from '../../shared/coastal-history/leitheach-source-edition.mjs';
import { LEITHEACH, LEITHEACH_INCIDENTS } from '../modules/coastal-history/coastal-events.mjs';
import { EVENTS } from '../modules/catalog/events-data.mjs';

test('all eleven voyage budgets cover the larger scale, meanders and separate rests', () => {
  assert.equal(chronology.voyages.length, 11);
  for (const voyage of chronology.voyages) {
    const start = raidHours(voyage.start), end = raidHours(voyage.end);
    assert.ok(end > start, voyage.id);
    let previousEnd = start;
    for (const [restStart, restEnd] of voyage.rests) {
      assert.ok(raidHours(restStart) >= previousEnd && raidHours(restEnd) > raidHours(restStart) && raidHours(restEnd) <= end, voyage.id);
      previousEnd = raidHours(restEnd);
    }
    for (const referenceKm of [30, 35, 40]) {
      const budget = raidVoyageBudget(voyage, route, referenceKm);
      assert.ok(budget.feasible, `${voyage.id}: ${budget.requiredSpeedKmH} > ${budget.speedLimitKmH} at ${referenceKm} km`);
    }
  }
  assert.equal(raidVoyageBudget(chronology.voyages.at(-1), route).restHours, 15);
  assert.equal(raidVoyageBudget(chronology.voyages.at(-1), route).travelHours, 29);
});

test('both fleet branches can reach their raids without travel overlapping combat', () => {
  const attackConnections = [
    ['coast', 'seann-end', 'clais-approach'], ['north', 'river-departure', 'gleann-start'],
    ['south', 'river-departure', 'dair-start'], ['abhainn', 'gleann-end', 'abhainn-start'],
    ['ceod', 'dair-end', 'ceod-start'], ['srath', 'abhainn-end', 'srath-start'],
    ['tor', 'srath-end', 'tor-start'], ['dun', 'tor-end', 'dun-start'], ['retreat', 'withdrawal', 'estuary']
  ];
  for (const [id, departure, arrival] of attackConnections) {
    const voyage = chronology.voyages.find(item => item.id === id);
    assert.equal(raidHours(voyage.start), raidHours(raidPoint(departure)), id);
    assert.equal(raidHours(voyage.end), raidHours(raidPoint(arrival)), id);
  }
  const join = chronology.voyages.find(v => v.id === 'south-join');
  const follow = chronology.voyages.find(v => v.id === 'south-follow');
  assert.ok(raidHours(join.start) - raidHours(raidPoint('ceod-end')) >= 8);
  assert.ok(raidHours(follow.start) - raidHours(join.end) >= 8);
  assert.equal(raidHours(follow.end), raidHours(raidPoint('dun-followers')));
  assert.ok(raidHours(raidPoint('dun-followers')) <= raidHours(raidPoint('dun-relief')));
  assert.equal(raidHours(raidPoint('river-departure')) - raidHours(raidPoint('clais-end')), 8);
});

test('one seven-day timetable drives the catalog, source tables, dossiers and each map marker', () => {
  assert.equal(LEITHEACH_ELAPSED_HOURS, 164);
  assert.deepEqual([...new Set(chronology.milestones.map(point => point.day))], [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(chronology.milestones.every((point, index, points) => index === 0 || raidHours(point) >= raidHours(points[index - 1])));
  assert.equal(raidPoint('dair-start').day, 2);
  assert.equal(raidPoint('ceod-start').day, 3);
  assert.equal(raidPoint('abhainn-start').day, 3);
  assert.equal(raidPoint('srath-start').day, 4);
  assert.equal(LEITHEACH.timeline, chronology.milestones);
  for (const event of LEITHEACH_INCIDENTS) {
    assert.equal(event.time, raidIncidentLabel(event.id));
    assert.ok(coastalSource(event.sourceId).blocks[6].rows[1][1].text.endsWith(event.time));
    assert.equal(EVENTS.find(item => item.id === `leitheach-${event.id}`).duration, event.duration);
    const html = readFileSync(new URL(`../../${event.file}`, import.meta.url), 'utf8');
    assert.ok(html.includes(event.time), event.id);
    for (const slot of event.slots) assert.ok(route.markers.find(marker => marker.id === slot.markerId).time.startsWith(`Raubzugstag ${raidPoint(slot.start).day}`));
  }
  assert.match(EVENTS.find(event => event.id === LEITHEACH.id).duration, /Sieben/);
  assert.equal(coastalSource('coastal-02').blocks[38].rows.length, chronology.milestones.length + 1);
  assert.equal(route.markers.find(marker => marker.id === 'sea-cluainslige').time, null);
  assert.equal(route.markers.find(marker => marker.id === 'dun-athar-reinforcement').time, null);
  assert.equal(route.markers.find(marker => marker.id === 'escape-direction').time, null);
  assert.ok(!chronology.voyages.some(voyage => voyage.markers.includes('escape-direction')));
});

test('new revision preserves originals and rejects an unexpectedly changed chronology table', () => {
  assert.equal(COASTAL_ORIGINALS[1].blocks[26].rows[3][1].text, 'Ein Tag');
  assert.doesNotMatch(JSON.stringify(coastalSource('coastal-02').blocks.slice(29, 39)), /im letzten Moment mobilisieren|im Tagesverlauf die Siedlungen|Am späten Nachmittag erreichten/);
  assert.match(coastalSource('coastal-02').blocks[14].text, /stiller Abend/);
  assert.match(COASTAL_ORIGINALS[1].blocks[14].text, /stiller Morgen/);
  const table = LEITHEACH_SOURCE_CHANGES.find(change => change.beforeRows);
  assert.throws(() => applyCoastalEdition(COASTAL_ORIGINALS, [{ ...table, beforeRows: [] }]), /veraltet/);
  for (const event of [LEITHEACH, ...LEITHEACH_INCIDENTS]) {
    assert.equal('startDate' in event, false);
    assert.equal('endDate' in event, false);
  }
});
