const WORLD_DATE_SCHEMA_VERSION = 1;
const WORLD_DATE_DEFAULT = Object.freeze({ year: 1740, month: 3, day: 9 });

function normalizeWorldDate(value = {}) {
  const year = Number(value?.year);
  const month = Number(value?.month);
  const day = Number(value?.day);
  return {
    year: Number.isFinite(year) && year > 0 ? Math.round(year) : null,
    month: Number.isFinite(month) && month >= 1 && month <= 13 ? Math.round(month) : null,
    day: Number.isFinite(day) && day >= 1 && day <= 36 ? Math.round(day) : null
  };
}

function isValidWorldDate(value) {
  const date = normalizeWorldDate(value);
  return !!(date.year && date.month && date.day);
}

function getDefaultWorldDate() {
  if (typeof ALERIA_CALENDAR !== 'undefined') {
    const configured = normalizeWorldDate({
      year: ALERIA_CALENDAR.currentYear,
      month: ALERIA_CALENDAR.currentMonth,
      day: ALERIA_CALENDAR.currentDay
    });
    if (isValidWorldDate(configured)) return configured;
  }
  return { ...WORLD_DATE_DEFAULT };
}

function getWorldDateOrdinal(value) {
  const date = normalizeWorldDate(value);
  if (!isValidWorldDate(date)) return null;
  return (date.year - 1) * 468 + (date.month - 1) * 36 + date.day;
}

function worldDateFromOrdinal(value) {
  const ordinal = Math.max(1, Math.round(Number(value) || 1));
  const year = Math.floor((ordinal - 1) / 468) + 1;
  const dayOfYear = ordinal - (year - 1) * 468;
  const month = Math.floor((dayOfYear - 1) / 36) + 1;
  const day = dayOfYear - (month - 1) * 36;
  return normalizeWorldDate({ year, month, day });
}

function shiftWorldDate(value, days = 0) {
  const ordinal = getWorldDateOrdinal(value);
  return ordinal === null ? getDefaultWorldDate() : worldDateFromOrdinal(ordinal + Math.round(Number(days) || 0));
}

function getWorldDateDifferenceInDays(fromValue, toValue) {
  const fromOrdinal = getWorldDateOrdinal(fromValue);
  const toOrdinal = getWorldDateOrdinal(toValue);
  return fromOrdinal === null || toOrdinal === null ? null : toOrdinal - fromOrdinal;
}

function worldDatesEqual(left, right) {
  const a = normalizeWorldDate(left);
  const b = normalizeWorldDate(right);
  return isValidWorldDate(a) && isValidWorldDate(b)
    && a.year === b.year && a.month === b.month && a.day === b.day;
}

function normalizeWorldDateRecord(value = {}) {
  const date = normalizeWorldDate(value.date || value);
  return {
    ...date,
    schemaVersion: WORLD_DATE_SCHEMA_VERSION,
    updatedAtClient: Math.max(0, Number(value.updatedAtClient) || 0),
    updatedBy: String(value.updatedBy || '').trim()
  };
}

globalThis.AleriaWorldDateModel = Object.freeze({
  defaultDate: WORLD_DATE_DEFAULT,
  differenceInDays: getWorldDateDifferenceInDays,
  getDefault: getDefaultWorldDate,
  isValid: isValidWorldDate,
  normalize: normalizeWorldDate,
  normalizeRecord: normalizeWorldDateRecord,
  shift: shiftWorldDate,
  same: worldDatesEqual,
  toOrdinal: getWorldDateOrdinal
});
