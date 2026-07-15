import { ALERIA_CURRENT_YEAR } from '../config/chronology.js';

function parseYear(value) {
  const normalized = String(value ?? '').trim();
  if (!/^\d{1,4}$/.test(normalized)) return null;
  return Number(normalized);
}

export function formatLifeLine(person) {
  const birth = person?.birth || '????';
  if (person?.status === 'dead' || person?.death) {
    return `† ${birth} - ${person.death || '????'} †`;
  }
  if (person?.status === 'alive') return `${birth} - lebend`;
  if (person?.status === 'missing') return `${birth} - verschollen`;
  return `${birth} - ????`;
}

export function calculateAge(person, currentYear = ALERIA_CURRENT_YEAR) {
  const birthYear = parseYear(person?.birth);
  if (birthYear === null) return null;
  const deathYear = parseYear(person?.death);
  const endYear = deathYear ?? Number(currentYear);
  if (!Number.isFinite(endYear) || endYear < birthYear) return null;
  return Math.trunc(endYear - birthYear);
}

export function formatAge(person, currentYear = ALERIA_CURRENT_YEAR) {
  const age = calculateAge(person, currentYear);
  return age === null ? 'Unbekannt' : `${age} Jahre`;
}
