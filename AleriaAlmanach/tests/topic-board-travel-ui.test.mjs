import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadTravelUi() {
  const context = vm.createContext({ console, Date, Math });
  for (const relativePath of [
    '../modules/world-date/world-date-model.js',
    '../modules/topic-board/topic-board-travel.js',
    '../modules/topic-board/topic-board-travel-ui.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context;
}

test('die optionale Reiseplanung ist im neuen Editor standardmaessig eingeklappt', () => {
  const context = loadTravelUi();
  const markup = vm.runInContext('AleriaTopicBoardTravelUI.renderEditor({})', context);

  assert.match(markup, /name="travelEnabled"/);
  assert.doesNotMatch(markup, /name="travelEnabled"[^>]*checked/);
  assert.match(markup, /data-topic-board-travel-fields hidden/);
});

test('die Reisekarte zeigt Route, berechnete Tage und Zwischenstopp', () => {
  const context = loadTravelUi();
  const markup = vm.runInContext(`AleriaTopicBoardTravelUI.renderCard({
    enabled: true,
    origin: 'Celtigerns Wacht',
    destination: 'Abergwint',
    distance: 420,
    distanceUnit: 'km',
    dailyDistance: 90,
    restDays: 1,
    stopovers: [{ place: 'Dunvar', stayDays: 1 }]
  })`, context);

  assert.match(markup, /Celtigerns Wacht → Dunvar → Abergwint/);
  assert.match(markup, /5 Tage/);
  assert.match(markup, /7 Tage/);
  assert.match(markup, /1 Tag Aufenthalt/);
});

test('die Formauswertung uebergibt optionale Reisefelder strukturiert an das Modell', () => {
  const context = loadTravelUi();
  const travel = vm.runInContext(`(() => {
    const values = {
      travelEnabled: { checked: true },
      travelOrigin: { value: 'Celtigerns Wacht' },
      travelDestination: { value: 'Abergwint' },
      travelDistance: { value: '420' },
      travelDistanceUnit: { value: 'km' },
      travelDailyDistance: { value: '90' },
      travelManualDays: { value: '' },
      travelRestDays: { value: '1' },
      travelDepartureDay: { value: '34' },
      travelDepartureMonth: { value: '3' },
      travelDepartureYear: { value: '1740' }
    };
    const stopValues = {
      travelStopPlace: { value: 'Dunvar' },
      travelStopDistance: { value: '160' },
      travelStopDays: { value: '1' },
      travelStopNote: { value: 'Vorräte aufnehmen' }
    };
    const row = { querySelector: selector => stopValues[selector.match(/name="([^"]+)/)?.[1]] || null };
    const form = {
      elements: values,
      querySelectorAll: selector => selector === '[data-topic-board-travel-stop]' ? [row] : []
    };
    return AleriaTopicBoardTravelUI.collect(form);
  })()`, context);

  assert.equal(travel.enabled, true);
  assert.equal(travel.travelDays, 5);
  assert.equal(travel.totalDays, 7);
  assert.deepEqual({ ...travel.arrivalDate }, { year: 1740, month: 4, day: 5 });
});
