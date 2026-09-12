import test from 'node:test';
import assert from 'node:assert/strict';
import '../../AleriaAlmanach/modules/core/aleria-calendar.js';
import { createEphemeris, MAX_INPUT_YEAR } from '../modules/ephemeris/ephemeris-model.mjs';
import { MONTH_SIGNS, ALL_SIGNS, SOVEREIGNS } from '../modules/zodiac/zodiac-data.mjs';

const calendar = globalThis.AleriaCalendar;
const model = createEphemeris(calendar);
const atOrdinal = ordinal => model.at(calendar.fromOrdinal(ordinal));

test('13 eigenständige Monatszeichen: acht Celestiale, fünf Untergötter, kein Vater', () => {
  assert.equal(MONTH_SIGNS.length, 13);
  assert.equal(MONTH_SIGNS.filter(sign => sign.kind === 'celestial').length, 8);
  assert.equal(MONTH_SIGNS.filter(sign => sign.kind === 'lesser').length, 5);
  assert.equal(new Set(ALL_SIGNS.map(sign => sign.id)).size, 19);
  assert.ok(!MONTH_SIGNS.some(sign => sign.id === 'ordan'));
  for (let month = 1; month <= 13; month++) {
    const first = model.at({ year: 1740, month, day: 1 });
    const last = model.at({ year: 1740, month, day: 36 });
    assert.equal(first.sign.id, last.sign.id);
    assert.equal(first.sign.shadowId, last.sign.shadowId);
    assert.notEqual(atOrdinal(last.ordinal + 1).sign.id, last.sign.id);
  }
});

test('Mutter und Witwe sowie Maid und Hedonist erscheinen immer gemeinsam', () => {
  for (const [id, shadowId] of [['mariel', 'lunara'], ['lyris', 'sanguine']]) {
    const sign = MONTH_SIGNS.find(sign => sign.id === id);
    for (let day = 1; day <= 36; day++) assert.equal(model.at({ year: 1740, month: sign.month, day }).sign.shadowId, shadowId);
  }
});

test('Drachennacht ist genau eine Nacht pro Jahrtausend und ergänzt den Hüter', () => {
  for (const year of [1000, 2000, 3000]) {
    const ordinal = calendar.ordinal({ year, month: 13, day: 36 });
    assert.equal(atOrdinal(ordinal - 1).dragon.visible, false);
    assert.equal(atOrdinal(ordinal).dragon.visible, true);
    assert.equal(atOrdinal(ordinal).sign.id, 'kharon');
    assert.equal(atOrdinal(ordinal).dragon.shadowId, 'adar');
    assert.equal(atOrdinal(ordinal + 1).dragon.visible, false);
    assert.deepEqual(atOrdinal(ordinal + 1).dragon.next, { year: year + 1000, month: 13, day: 36 });
  }
  assert.equal(model.at({ year: 1740, month: 13, day: 36 }).dragon.visible, false);
  assert.deepEqual(model.at({ year: 1740, month: 3, day: 9 }).dragon.next, { year: 2000, month: 13, day: 36 });
});

test('Beide Monde teilen Jahresneumond und Vollmond am 19. Hochlicht', () => {
  const start = model.at({ year: 1740, month: 1, day: 1 });
  assert.ok(start.moons.every(moon => moon.new && moon.illumination === 0));
  const full = model.at({ year: 1740, month: 7, day: 19 });
  assert.ok(full.moons.every(moon => moon.full && moon.illumination === 100));
  for (let day = 1; day <= calendar.daysPerYear; day++) {
    assert.deepEqual(atOrdinal(day).moons, atOrdinal(day + calendar.daysPerYear).moons);
  }
});

test('Souveräne haben begrenzte Sichtfenster und setzen ihre Bahnen über Jahresgrenzen fort', () => {
  for (const sign of SOVEREIGNS) {
    for (const cycle of [0, 1, 9, 50]) {
      const start = sign.offset + sign.period * cycle + 1;
      const appearance = ordinal => atOrdinal(ordinal).sovereigns.find(entry => entry.id === sign.id);
      assert.equal(appearance(start - 1).visible, false);
      assert.equal(appearance(start - 1).daysUntil, 1);
      assert.equal(appearance(start).visible, true);
      assert.equal(appearance(start + sign.duration - 1).visible, true);
      assert.equal(appearance(start + sign.duration).visible, false);
      assert.equal(appearance(start + sign.duration).daysUntil, sign.period - sign.duration);
    }
    let checkedCrossing = false;
    for (let year = 1; year <= sign.period && !checkedCrossing; year++) {
      const entry = model.at({ year, month: 13, day: 36 }).sovereigns.find(item => item.id === sign.id);
      if (entry.visible && entry.start.year !== entry.end.year) {
        assert.equal(calendar.ordinal(entry.end) - calendar.ordinal(entry.start) + 1, sign.duration);
        checkedCrossing = true;
      }
    }
    assert.ok(checkedCrossing, `${sign.id} kann über Jahrswend hinweg sichtbar bleiben`);
  }
});

test('Mehrere Souveräne können gleichzeitig erscheinen; Wiederholung ist deterministisch', () => {
  let simultaneous = null;
  for (let ordinal = 1; ordinal < 4680; ordinal++) {
    const sky = atOrdinal(ordinal);
    if (sky.sovereigns.filter(sign => sign.visible).length > 1) { simultaneous = sky; break; }
  }
  assert.ok(simultaneous);
  assert.deepEqual(model.at(simultaneous.date), simultaneous);
});

test('Ungültige und unvollständige Daten werden abgewiesen statt still gerundet', () => {
  for (const value of [{}, null, { year: 0, month: 1, day: 1 }, { year: 1740, month: 14, day: 1 }, { year: 1740, month: 1, day: 37 }, { year: 1740, month: 1, day: 1.2 }, { year: MAX_INPUT_YEAR + 1, month: 1, day: 1 }, { year: 'abc', month: 1, day: 1 }]) assert.throws(() => model.at(value), RangeError);
  assert.deepEqual(model.validateDate({ year: '1740', month: '13', day: '36' }), { year: 1740, month: 13, day: 36 });
  assert.equal(model.at({ year: MAX_INPUT_YEAR, month: 13, day: 36 }).dragon.next.year, 1000000);
});
