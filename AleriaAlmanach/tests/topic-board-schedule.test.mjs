import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadSchedule() {
  const context = vm.createContext({ console, Date, Math });
  for (const relativePath of [
    '../modules/world-date/world-date-model.js',
    '../modules/topic-board/topic-board-travel.js',
    '../modules/topic-board/topic-board-schedule.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context;
}

function loadScheduleUi() {
  const context = vm.createContext({
    console,
    Date,
    Math,
    AleriaWorldDateStore: {
      getState: () => ({ date: { year: 1740, month: 3, day: 9 } })
    }
  });
  for (const relativePath of [
    '../modules/core/aleria-calendar.js',
    '../modules/world-date/world-date-model.js',
    '../modules/topic-board/topic-board-travel.js',
    '../modules/topic-board/topic-board-schedule.js',
    '../modules/topic-board/topic-board-schedule-ui.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context;
}

test('ein allgemeiner Termin berechnet sein inklusives Enddatum', () => {
  const context = loadSchedule();
  const schedule = vm.runInContext(`AleriaTopicBoardSchedule.normalize({
    startDate: { year: 1740, month: 3, day: 35 },
    durationDays: 3
  })`, context);

  assert.deepEqual({ ...schedule.endDate }, { year: 1740, month: 4, day: 1 });
  assert.equal(schedule.effectiveDurationDays, 3);
  assert.equal(schedule.durationSource, 'manual');
});

test('eine Reisezeit ersetzt die allgemeine Dauer und berechnet die Ankunft', () => {
  const context = loadSchedule();
  const result = vm.runInContext(`(() => {
    const travel = AleriaTopicBoardTravel.normalize({
      enabled: true,
      manualTravelDays: 4,
      restDays: 1,
      departureDate: { year: 1740, month: 3, day: 34 }
    });
    return AleriaTopicBoardSchedule.normalize({
      startDate: { year: 1740, month: 3, day: 34 },
      durationDays: 2
    }, { travel });
  })()`, context);

  assert.equal(result.effectiveDurationDays, 5);
  assert.equal(result.durationSource, 'travel');
  assert.deepEqual({ ...result.endDate }, { year: 1740, month: 4, day: 3 });
});

test('Termine kennen bevorstehend, laufend und überfällig relativ zum Seitendatum', () => {
  const context = loadSchedule();
  const states = vm.runInContext(`(() => {
    const schedule = AleriaTopicBoardSchedule.normalize({
      startDate: { year: 1740, month: 3, day: 12 },
      durationDays: 3
    });
    return [
      AleriaTopicBoardSchedule.getTiming(schedule, { year: 1740, month: 3, day: 9 }),
      AleriaTopicBoardSchedule.getTiming(schedule, { year: 1740, month: 3, day: 13 }),
      AleriaTopicBoardSchedule.getTiming(schedule, { year: 1740, month: 3, day: 16 })
    ];
  })()`, context);

  assert.deepEqual(Array.from(states, state => state.state), ['upcoming', 'active', 'overdue']);
  assert.equal(states[0].daysUntilStart, 3);
  assert.equal(states[1].daysUntilEnd, 1);
});

test('der Editor startet am Seitendatum und bietet relative Schnelltermine', () => {
  const context = loadScheduleUi();
  const markup = vm.runInContext('AleriaTopicBoardScheduleUI.renderEditor()', context);

  assert.match(markup, /name="scheduleStartDay"[^>]*value="9"/);
  assert.match(markup, /name="scheduleStartMonth"[^>]*value="3"/);
  assert.match(markup, /data-topic-board-schedule-offset="4"/);

  const target = vm.runInContext(`(() => {
    const form = {
      elements: {
        scheduleStartDay: { value: '' },
        scheduleStartMonth: { value: '' },
        scheduleStartYear: { value: '' },
        scheduleDurationDays: { value: '' }
      },
      querySelector: () => null
    };
    AleriaTopicBoardScheduleUI.setOffset(form, 4);
    return {
      day: form.elements.scheduleStartDay.value,
      month: form.elements.scheduleStartMonth.value,
      year: form.elements.scheduleStartYear.value
    };
  })()`, context);

  assert.deepEqual({ ...target }, { year: 1740, month: 3, day: 13 });
});

test('Kalendermodul und Firebase-Feldfreigabe sind in der Anwendung verdrahtet', () => {
  const html = fs.readFileSync(new URL('../AleriaAlmanach.html', import.meta.url), 'utf8');
  const firebase = fs.readFileSync(new URL('../firebase.js', import.meta.url), 'utf8');
  const scheduleIndex = html.indexOf('topic-board-schedule.js');
  const modelIndex = html.indexOf('topic-board-model.js');

  assert.ok(scheduleIndex >= 0);
  assert.ok(modelIndex > scheduleIndex);
  assert.match(html, /topic-board-schedule-ui\.js/);
  assert.match(firebase, /'schedule', 'travel'/);
});
