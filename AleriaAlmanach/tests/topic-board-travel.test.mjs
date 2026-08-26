import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadTravelModel() {
  const context = vm.createContext({ console, Date, Math });
  for (const relativePath of [
    '../modules/world-date/world-date-model.js',
    '../modules/topic-board/topic-board-travel.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context;
}

test('ausgeschaltete Reiseplanung bleibt vollstaendig optional', () => {
  const context = loadTravelModel();
  const travel = vm.runInContext(`AleriaTopicBoardTravel.normalize({
    enabled: false,
    origin: 'Celtigerns Wacht',
    distance: 420,
    dailyDistance: 90
  })`, context);

  assert.equal(travel.enabled, false);
  assert.equal(travel.origin, '');
  assert.equal(travel.distance, null);
  assert.equal(travel.travelDays, null);
  assert.equal(travel.totalDays, null);
});

test('Distanz, Zwischenstopps und Rasttage ergeben Reise- und Gesamttage', () => {
  const context = loadTravelModel();
  const travel = vm.runInContext(`AleriaTopicBoardTravel.normalize({
    enabled: true,
    origin: 'Celtigerns Wacht',
    destination: 'Abergwint',
    distance: 420,
    distanceUnit: 'km',
    dailyDistance: 90,
    restDays: 1,
    departureDate: { year: 1740, month: 3, day: 34 },
    stopovers: [
      { place: 'Dunvar', distanceFromStart: 160, stayDays: 1, note: 'Vorräte aufnehmen' }
    ]
  })`, context);

  assert.equal(travel.travelDays, 5);
  assert.equal(travel.stopoverDays, 1);
  assert.equal(travel.restDays, 1);
  assert.equal(travel.totalDays, 7);
  assert.equal(travel.calculationMode, 'distance');
  assert.deepEqual({ ...travel.arrivalDate }, { year: 1740, month: 4, day: 5 });
  assert.deepEqual(
    Array.from(travel.stopovers, stopover => ({ ...stopover })),
    [{ place: 'Dunvar', distanceFromStart: 160, stayDays: 1, note: 'Vorräte aufnehmen' }]
  );
});

test('manuelle Reisetage ersetzen nur die Distanzberechnung', () => {
  const context = loadTravelModel();
  const travel = vm.runInContext(`AleriaTopicBoardTravel.normalize({
    enabled: true,
    distance: '1200',
    distanceUnit: 'meilen',
    dailyDistance: 80,
    manualTravelDays: 9,
    restDays: 2,
    stopovers: [{ place: 'Passwacht', stayDays: 3 }]
  })`, context);

  assert.equal(travel.distanceUnit, 'meilen');
  assert.equal(travel.travelDays, 9);
  assert.equal(travel.totalDays, 14);
  assert.equal(travel.calculationMode, 'manual');
  assert.equal(travel.arrivalDate, null);
});
