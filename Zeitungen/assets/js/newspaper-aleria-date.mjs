const MONTH_LABELS = Object.freeze([
  "Erster",
  "Zweiter",
  "Dritter",
  "Vierter",
  "Fünfter",
  "Sechster",
  "Siebter",
  "Achter",
  "Neunter",
  "Zehnter",
  "Elfter",
  "Zwölfter",
  "Dreizehnter"
]);

export const NEWSPAPER_ALERIA_CALENDAR = Object.freeze({
  daysPerMonth: 36,
  monthsPerYear: 13
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

export function formatPublicationDate(value = DEFAULT_PUBLICATION_DATE) {
  const candidate = normalizePublicationDate(value);
  const date = isValidPublicationDate(candidate) ? candidate : DEFAULT_PUBLICATION_DATE;
  return `${date.day}. Tag, ${MONTH_LABELS[date.month - 1]} Monat, Jahr ${date.year}`;
}

function normalizePublicationDate(value) {
  return {
    day: Math.round(Number(value?.day) || 0),
    month: Math.round(Number(value?.month) || 0),
    year: Math.round(Number(value?.year) || 0)
  };
}
