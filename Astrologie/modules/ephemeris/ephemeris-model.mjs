import { MONTH_SIGNS, SOVEREIGNS, DRAGON, SKY_BODIES } from '../zodiac/zodiac-data.mjs';

export const MAX_INPUT_YEAR = 999999;
const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;

function phaseLabel(age, period) {
  if (age === 0) return 'Neumond';
  if (age * 4 === period) return 'Erstes Viertel';
  if (age * 2 === period) return 'Vollmond';
  if (age * 4 === period * 3) return 'Letztes Viertel';
  if (age * 4 < period) return 'Zunehmende Sichel';
  if (age * 2 < period) return 'Zunehmender Mond';
  return age * 4 < period * 3 ? 'Abnehmender Mond' : 'Abnehmende Sichel';
}

// Die gemeinsame Kalender-API wird übergeben; dieses Modul besitzt keinen Weltzustand.
export function createEphemeris(calendar) {
  if (!calendar?.ordinal || !calendar?.fromOrdinal || calendar.monthsPerYear !== MONTH_SIGNS.length) {
    throw new TypeError('Der gemeinsame Aleria-Kalender mit 13 Monaten wird benötigt.');
  }

  function validateDate(value) {
    const date = { year: Number(value?.year), month: Number(value?.month), day: Number(value?.day) };
    if (!Object.values(date).every(Number.isSafeInteger)
      || date.year < 1 || date.year > MAX_INPUT_YEAR
      || date.month < 1 || date.month > calendar.monthsPerYear
      || date.day < 1 || date.day > calendar.daysPerMonth) {
      throw new RangeError(`Bitte ein gültiges Aleria-Datum eingeben: Tag 1–${calendar.daysPerMonth}, Monat 1–${calendar.monthsPerYear}, Jahr 1–${MAX_INPUT_YEAR}.`);
    }
    return date;
  }

  function moonAt(moon, elapsedDays) {
    const age = mod(elapsedDays, moon.period);
    const phase = age / moon.period;
    return { ...moon, age, phase, label: phaseLabel(age, moon.period), illumination: Math.round((1 - Math.cos(2 * Math.PI * phase)) * 50), full: age * 2 === moon.period, new: age === 0 };
  }

  function sovereignAt(sign, elapsedDays) {
    const age = mod(elapsedDays - sign.offset, sign.period);
    const visible = age < sign.duration;
    const start = visible ? elapsedDays - age : elapsedDays + sign.period - age;
    return { ...sign, visible, start: calendar.fromOrdinal(start + 1), end: calendar.fromOrdinal(start + sign.duration), daysUntil: visible ? 0 : start - elapsedDays };
  }

  function at(value) {
    const date = validateDate(value);
    const ordinal = calendar.ordinal(date);
    const elapsedDays = ordinal - 1;
    const dragonInterval = DRAGON.everyYears * calendar.daysPerYear;
    const dragonVisible = ordinal % dragonInterval === 0;
    const nextOrdinal = Math.ceil(ordinal / dragonInterval) * dragonInterval;
    return {
      date, ordinal, sign: MONTH_SIGNS[date.month - 1],
      moons: SKY_BODIES.moons.map(moon => moonAt(moon, elapsedDays)),
      sovereigns: SOVEREIGNS.map(sign => sovereignAt(sign, elapsedDays)),
      dragon: { ...DRAGON, visible: dragonVisible, next: calendar.fromOrdinal(nextOrdinal), daysUntil: nextOrdinal - ordinal }
    };
  }

  return Object.freeze({ at, validateDate });
}
