const LEGACY_FAMILY_ID_ALIASES = Object.freeze({
  beran: 'haus-beran',
  earncynne: 'haus-earncynne',
  estmere: 'haus-estmere',
  frye: 'haus-frye',
  seolfor: 'haus-seolfor'
});

function normalizeFamilyIdCandidate(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Keeps old shared links usable after a manually created prototype has been
 * promoted to the canonical project registry identity.
 */
export function resolveCanonicalFamilyId(value) {
  const normalizedId = normalizeFamilyIdCandidate(value);
  return LEGACY_FAMILY_ID_ALIASES[normalizedId] || normalizedId;
}

export function isLegacyFamilyId(value) {
  return Object.hasOwn(LEGACY_FAMILY_ID_ALIASES, normalizeFamilyIdCandidate(value));
}

export const FAMILY_ID_ALIASES = LEGACY_FAMILY_ID_ALIASES;
