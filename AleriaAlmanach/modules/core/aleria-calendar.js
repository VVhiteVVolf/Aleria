// Aleria-Weltkalender: 9-Tage-Woche, 36-Tage-Monate, 13 Monate/Jahr.
// Additiv zu bestehenden Freitext-Zeitangaben nutzbar (siehe module-editor-aleria-date-field.js).

const ALERIA_CALENDAR = Object.freeze({
  weekdays: ['Ordanstag', 'Marielstag', 'Maldrastag', 'Sylvanastag', 'Kharonstag', 'Orinstag', 'Tharimstag', 'Baldranstag', 'Lyristag'],
  daysPerWeek: 9,
  daysPerMonth: 36,
  monthsPerYear: 13,
  daysPerYear: 468,
  currentYear: 1740,
  currentMonth: 3,
  currentDay: 9
});

function getAleriaMonthLabel(month) {
  return `Monat ${Number(month)}`;
}

function getAleriaWeekdayIndex(dayOfMonth) {
  const day = Number(dayOfMonth);
  if (!Number.isFinite(day)) return -1;
  return ((Math.round(day) - 1) % ALERIA_CALENDAR.daysPerWeek + ALERIA_CALENDAR.daysPerWeek) % ALERIA_CALENDAR.daysPerWeek;
}

function getAleriaWeekdayName(dayOfMonth) {
  const index = getAleriaWeekdayIndex(dayOfMonth);
  return index >= 0 ? ALERIA_CALENDAR.weekdays[index] : '';
}

function sanitizeAleriaDate(value = {}) {
  const year = Number(value?.year);
  const month = Number(value?.month);
  const day = Number(value?.day);
  return {
    year: Number.isFinite(year) && year > 0 ? Math.round(year) : null,
    month: Number.isFinite(month) && month >= 1 && month <= ALERIA_CALENDAR.monthsPerYear ? Math.round(month) : null,
    day: Number.isFinite(day) && day >= 1 && day <= ALERIA_CALENDAR.daysPerMonth ? Math.round(day) : null
  };
}

function hasAleriaDate(value) {
  const date = sanitizeAleriaDate(value);
  return !!(date.year && date.month && date.day);
}

function getAleriaDayOrdinal(value) {
  const date = sanitizeAleriaDate(value);
  if (!hasAleriaDate(date)) return null;
  return (date.year - 1) * ALERIA_CALENDAR.daysPerYear + (date.month - 1) * ALERIA_CALENDAR.daysPerMonth + date.day;
}

function compareAleriaDates(a, b) {
  const ordinalA = getAleriaDayOrdinal(a);
  const ordinalB = getAleriaDayOrdinal(b);
  if (ordinalA === null || ordinalB === null) return 0;
  return ordinalA - ordinalB;
}

function getAleriaDateEra(value) {
  const date = sanitizeAleriaDate(value);
  if (!hasAleriaDate(date)) return '';
  const delta = compareAleriaDates(date, {
    year: ALERIA_CALENDAR.currentYear,
    month: ALERIA_CALENDAR.currentMonth,
    day: ALERIA_CALENDAR.currentDay
  });
  if (delta < 0) return 'past';
  if (delta > 0) return 'future';
  return 'present';
}

function formatAleriaDate(value, { withWeekday = true } = {}) {
  const date = sanitizeAleriaDate(value);
  if (!hasAleriaDate(date)) return '';
  const weekday = withWeekday ? `${getAleriaWeekdayName(date.day)}, ` : '';
  const dd = String(date.day).padStart(2, '0');
  const mm = String(date.month).padStart(2, '0');
  return `${weekday}${dd}.${mm} Jahr ${date.year}`;
}

function aleriaDateFromOrdinal(ordinal) {
  const safeOrdinal = Math.max(1, Math.round(ordinal));
  const year = Math.floor((safeOrdinal - 1) / ALERIA_CALENDAR.daysPerYear) + 1;
  const dayOfYear = safeOrdinal - (year - 1) * ALERIA_CALENDAR.daysPerYear;
  const month = Math.floor((dayOfYear - 1) / ALERIA_CALENDAR.daysPerMonth) + 1;
  const day = dayOfYear - (month - 1) * ALERIA_CALENDAR.daysPerMonth;
  return sanitizeAleriaDate({ year, month, day });
}

// Verschiebt ein Aleria-Datum um ganze Tage (fuer Szenen, die ueber Tag 1 hinaus voranschreiten).
function addAleriaDays(value, days = 0) {
  const date = sanitizeAleriaDate(value);
  if (!hasAleriaDate(date)) return sanitizeAleriaDate({});
  const ordinal = getAleriaDayOrdinal(date) + Math.round(days);
  return aleriaDateFromOrdinal(ordinal);
}

// "Von - bis": faellt auf ein einzelnes Datum zusammen, wenn Start und aktueller Szenentag identisch sind.
function formatAleriaDateRange(startValue, currentValue) {
  const start = sanitizeAleriaDate(startValue);
  if (!hasAleriaDate(start)) return '';
  const current = sanitizeAleriaDate(currentValue);
  if (!hasAleriaDate(current) || getAleriaDayOrdinal(current) === getAleriaDayOrdinal(start)) {
    return formatAleriaDate(start);
  }
  return `${formatAleriaDate(start)} bis ${formatAleriaDate(current)}`;
}

function buildAleriaDateBadge(value, className = 'aleria-date-badge') {
  const date = sanitizeAleriaDate(value);
  if (!hasAleriaDate(date)) return '';
  const era = getAleriaDateEra(date);
  const eraClass = era && era !== 'present' ? ` ${className}-${era}` : '';
  return `<span class="${className}${eraClass}">${escapeHtml(formatAleriaDate(date))}</span>`;
}
