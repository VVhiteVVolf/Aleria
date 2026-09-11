import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createCalendarEventModel, CALENDAR_TEMPLATES } from '../modules/calendar/calendar-events-model.mjs';
import { createCalendarStore } from '../modules/calendar/calendar-store.mjs';
import { createCalendarRepository } from '../modules/calendar/calendar-repository.mjs';

const context = vm.createContext({ console });
vm.runInContext(readFileSync(new URL('../modules/core/aleria-calendar.js', import.meta.url), 'utf8'), context);
const calendar = context.AleriaCalendar;
const model = createCalendarEventModel(calendar);
const date = (month = 3, day = 9, year = 1740) => ({ year, month, day });
const event = (overrides = {}) => model.normalize({ id: 'test', title: 'Audienz', type: 'audience', start: date(), end: date(), ...overrides });

test('13 benannte Monate mit je vier Neuntagewochen, einschließlich Jahreswechsel', () => {
  assert.equal(new Set(calendar.months).size, 13);
  assert.ok(calendar.months.every(name => !/\s/.test(name)));
  assert.deepEqual(JSON.parse(JSON.stringify(calendar.shift(date(13, 36), 1))), date(1, 1, 1741));
  assert.equal(calendar.weekday(1), calendar.weekday(10));
  assert.equal(calendar.weekday(36), calendar.weekday(9));
  assert.match(calendar.format(date()), /Lichtkehr/);
});
test('Termine weisen ungültige, unvollständige und umgekehrte Zeiträume zurück', () => {
  for (const overrides of [{ title: '' }, { start: date(14) }, { start: date(1, 37) }, { start: date(1.1) }, { end: date(2) }, { startTime: '23:00', endTime: '08:00' }, { startTime: '12:00' }]) {
    assert.throws(() => event(overrides));
  }
});
test('Jahrestage beginnen erst im Startjahr und behalten Monat/Tag', () => {
  const holiday = event({ recurrence: 'year' });
  assert.equal(model.occurrences([holiday], date(3, 9, 1739)).length, 0);
  const next = model.occurrences([holiday], date(3, 9, 1741));
  assert.equal(next.length, 1); assert.equal(next[0].start.year, 1741);
});
test('Wöchentliche Termine wiederholen sich nach neun Tagen und überschreiten Monate', () => {
  const court = event({ start: date(13, 35), end: date(13, 35), recurrence: 'week' });
  const next = model.occurrences([court], date(1, 8, 1741));
  assert.equal(next.length, 1); assert.equal(next[0].start.day, 8);
});
test('Mehrtagestermine erscheinen auch nach Beginn; Überschneidung berücksichtigt Uhrzeiten', () => {
  const journey = event({ start: date(2, 35), end: date(3, 11) });
  assert.equal(model.occurrences([journey], date()).length, 1);
  const a = event({ startTime: '10:00', endTime: '11:00' });
  assert.equal(model.overlaps(a, event({ startTime: '12:00', endTime: '13:00' })), false);
  assert.equal(model.overlaps(a, event({ startTime: '10:30', endTime: '12:00' })), true);
  assert.equal(model.overlaps(a, journey), true);
});
test('Vorlagen erzeugen keine kanonischen Feiertagsdaten', () => {
  assert.ok(CALENDAR_TEMPLATES.some(template => template.id === 'holiday'));
  assert.ok(CALENDAR_TEMPLATES.every(template => !template.start && !template.end));
});

function setupStore() {
  const values = new Map(); let backend = null;
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const store = createCalendarStore({ calendar, storage, getBackend: () => backend, target: {} });
  store.initialize();
  return { store, storage, setBackend: value => { backend = value; store.reconnect(); } };
}
test('Offline-Speicherung übersteht Neuladen und wird nicht automatisch veröffentlicht', async () => {
  const { store, storage, setBackend } = setupStore();
  const saved = await store.save(event()); assert.equal(saved.localOnly, true);
  const fresh = createCalendarStore({ calendar, storage, getBackend: () => null, target: {} }); fresh.initialize();
  assert.equal(fresh.getState().events[0].title, 'Audienz');
  let writes = 0;
  setBackend({ subscribe: next => { next([]); return () => {}; }, save: async input => { writes++; return { ...input, revision: 1 }; } });
  assert.equal(writes, 0); assert.equal(store.getState().pendingCount, 1);
  await store.publish(); assert.equal(writes, 1); assert.equal(store.getState().pendingCount, 0);
});
test('Fehlgeschlagenes Veröffentlichen erhält den Entwurf', async () => {
  const { store, setBackend } = setupStore(); await store.save(event());
  setBackend({ subscribe: next => { next([]); return () => {}; }, save: async () => { throw new Error('Konflikt'); } });
  await assert.rejects(store.publish(), /Konflikt/);
  assert.equal(store.getState().pendingCount, 1);
});
test('Speicherfehler werden angezeigt und nicht als lokaler Erfolg behandelt', async () => {
  const store = createCalendarStore({ calendar, storage: { getItem: () => null, setItem: () => { throw Error(); } }, getBackend: () => null, target: {} }); store.initialize();
  await assert.rejects(store.save(event()), /nicht lokal gespeichert/);
  assert.equal(store.getState().events.length, 0);
});
test('Entfernen ist persistent, einschließlich lokaler Wiederholungsserien', async () => {
  const { store } = setupStore(); await store.save(event({ recurrence: 'year' })); await store.save(event({ recurrence: 'year', deleted: true }));
  assert.equal(store.getState().events.length, 0); assert.equal(store.getState().pendingCount, 1);
});
test('Repository verhindert das Überschreiben einer neueren Revision', async () => {
  let written = false;
  const repository = createCalendarRepository({ db: {}, getCalendar: () => calendar, requireUser: async () => ({ uid: 'test' }), sdk: {
    doc: () => ({}), serverTimestamp: () => null,
    runTransaction: async (_, callback) => callback({ get: async () => ({ exists: () => true, data: () => ({ revision: 2 }) }), set: () => { written = true; } })
  } });
  await assert.rejects(repository.save(event({ revision: 1 })), /inzwischen geändert/); assert.equal(written, false);
});
