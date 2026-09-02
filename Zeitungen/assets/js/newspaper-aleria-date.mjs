export const ALERIA_WEEKDAYS = Object.freeze([
  "Ordanstag",
  "Marielstag",
  "Maldrastag",
  "Sylvanastag",
  "Kharonstag",
  "Orinstag",
  "Tharimstag",
  "Baldranstag",
  "Lyristag"
]);

export const NEWSPAPER_ALERIA_CALENDAR = Object.freeze({
  weekdays: ALERIA_WEEKDAYS,
  daysPerWeek: 9,
  daysPerMonth: 36,
  monthsPerYear: 13,
  daysPerYear: 468
});

export const DEFAULT_PUBLICATION_DATE = Object.freeze({
  day: 18,
  month: 3,
  year: 1740
});

export function isValidPublicationDate(value) {
  const date = normalizePublicationDate(value);
  return date.day >= 1
    && date.day <= NEWSPAPER_ALERIA_CALENDAR.daysPerMonth
    && date.month >= 1
    && date.month <= NEWSPAPER_ALERIA_CALENDAR.monthsPerYear
    && date.year >= 1;
}

export function getPublicationWeekday(value) {
  const date = normalizePublicationDate(value);
  if (!isValidPublicationDate(date)) return "";
  const index = (date.day - 1) % NEWSPAPER_ALERIA_CALENDAR.daysPerWeek;
  return ALERIA_WEEKDAYS[index] || "";
}

export function publicationDateToOrdinal(value) {
  const date = normalizePublicationDate(value);
  if (!isValidPublicationDate(date)) return null;
  return (date.year - 1) * NEWSPAPER_ALERIA_CALENDAR.daysPerYear
    + (date.month - 1) * NEWSPAPER_ALERIA_CALENDAR.daysPerMonth
    + date.day;
}

export function comparePublicationDates(left, right) {
  const leftOrdinal = publicationDateToOrdinal(left);
  const rightOrdinal = publicationDateToOrdinal(right);
  if (leftOrdinal === null || rightOrdinal === null) return 0;
  return leftOrdinal - rightOrdinal;
}

export function formatPublicationDate(value = DEFAULT_PUBLICATION_DATE) {
  const candidate = normalizePublicationDate(value);
  const date = isValidPublicationDate(candidate) ? candidate : DEFAULT_PUBLICATION_DATE;
  const day = String(date.day).padStart(2, "0");
  const month = String(date.month).padStart(2, "0");
  return `${getPublicationWeekday(date)}, ${day}.${month} Jahr ${date.year}`;
}

export function normalizePublicationDate(value = {}) {
  return Object.freeze({
    day: Math.round(Number(value?.day) || 0),
    month: Math.round(Number(value?.month) || 0),
    year: Math.round(Number(value?.year) || 0)
  });
}
