import {
  DEFAULT_CHILDBEARING_AGE,
  DEFAULT_LIFESPAN_YEARS,
  DEFAULT_MARRIAGE_AGE,
  PLAUSIBLE_PARENT_AGE_AT_BIRTH
} from '../config/chronology.js';

// Rein lokale, deterministisch begrenzte Vorschlags-Engine ohne Netzwerkzugriff.
// Dient als immer verfügbare Grundlage; ein optionaler AleriaGPT-Aufruf (siehe
// tree-generator-ai-bridge.js) kann ihre Vorschläge ersetzen, muss es aber nicht.
export const PLACEHOLDER_UNKNOWN = '???';

const MALE_NAME_POOL = Object.freeze([
  'Gareth', 'Dafydd', 'Emrys', 'Rhisiart', 'Cadell', 'Cadoc', 'Cadogan', 'Brân',
  'Euros', 'Idris', 'Owain', 'Rhys', 'Llewelyn', 'Gruffydd', 'Aneurin', 'Emyr',
  'Gwilym', 'Meredydd', 'Rhydderch', 'Tewdwr', 'Cynan', 'Maredudd', 'Ithel',
  'Selwyn', 'Trahaearn'
]);

const FEMALE_NAME_POOL = Object.freeze([
  'Angharad', 'Eluned', 'Meinwen', 'Rhiannon', 'Gwenllian', 'Seren', 'Bronwen',
  'Nia', 'Eirwen', 'Dylis', 'Arial', 'Carys', 'Ceridwen', 'Enid', 'Gwladys',
  'Heledd', 'Mererid', 'Olwen', 'Rhonwen', 'Wenna', 'Ffion', 'Gwyneth',
  'Meredith', 'Nesta', 'Sioned'
]);

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function suggestName(sex, usedNames = []) {
  const pool = sex === 'female'
    ? FEMALE_NAME_POOL
    : sex === 'male'
      ? MALE_NAME_POOL
      : [...MALE_NAME_POOL, ...FEMALE_NAME_POOL];
  const used = new Set(usedNames);
  const candidates = pool.filter(name => !used.has(name));
  if (!candidates.length) return PLACEHOLDER_UNKNOWN;
  return pickRandom(candidates);
}

// role 'spouse': anchorYear ist das Geburtsjahr des bereits bekannten Partners.
// role 'child': anchorYear ist das Geburtsjahr des Elternteils.
export function suggestBirthYear({ anchorYear, role, params = {} } = {}) {
  const anchor = Number(anchorYear);
  if (!Number.isInteger(anchor)) return PLACEHOLDER_UNKNOWN;
  if (role === 'spouse') {
    const jitter = pickRandom([-4, -2, -1, 0, 1, 2, 4]);
    return String(anchor + jitter);
  }
  if (role === 'child') {
    const age = Number(params.childbearingAge) || DEFAULT_CHILDBEARING_AGE;
    const clampedAge = clamp(age, PLAUSIBLE_PARENT_AGE_AT_BIRTH.min, PLAUSIBLE_PARENT_AGE_AT_BIRTH.max);
    return String(anchor + clampedAge);
  }
  return PLACEHOLDER_UNKNOWN;
}

// Sonderarten mit abweichender Alterungsgeschwindigkeit (User-Vorgabe). Priester
// altern halb so schnell (doppelte Lebensspanne); Magier bis zu 10x langsamer
// (Spanne, nicht fix); Druiden gelten als praktisch zeitlos (bis zu 10.000 Jahre) —
// für sie wird bewusst KEIN Sterbejahr vorgeschlagen, sondern der Platzhalter
// belassen, statt ein fernes Datum zu erfinden, das niemand verlangt hat.
export const AGING_KINDS = Object.freeze({
  normal: { id: 'normal', label: 'Normal' },
  priester: { id: 'priester', label: 'Priester (altert halb so schnell)' },
  magier: { id: 'magier', label: 'Magier (altert bis zu 10× langsamer)' },
  druide: { id: 'druide', label: 'Druide (zeitlos, bis zu 10.000 Jahre)' }
});

export function suggestDeathYear({ birthYear, params = {}, agingKind = 'normal' } = {}) {
  const birth = Number(birthYear);
  if (!Number.isInteger(birth)) return PLACEHOLDER_UNKNOWN;
  if (agingKind === 'druide') return PLACEHOLDER_UNKNOWN;
  const baseLifespan = Number(params.lifespan) || DEFAULT_LIFESPAN_YEARS;
  const lifespan = agingKind === 'priester'
    ? baseLifespan * 2
    : agingKind === 'magier'
      ? baseLifespan * pickRandom([3, 4, 5, 6, 7, 8, 9, 10])
      : baseLifespan;
  const jitter = pickRandom([-10, -6, -2, 0, 4, 8]);
  return String(birth + Math.max(1, lifespan + jitter));
}

export function suggestMarriageYear({ manBirthYear, womanBirthYear, params = {} } = {}) {
  const anchor = Number(manBirthYear) || Number(womanBirthYear);
  if (!Number.isInteger(anchor)) return PLACEHOLDER_UNKNOWN;
  const age = Number(params.marriageAge) || DEFAULT_MARRIAGE_AGE;
  return String(anchor + age);
}
