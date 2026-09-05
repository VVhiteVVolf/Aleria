export const UNIVERSAL_CLASS_IDS = Object.freeze([
  'kampfer', 'reiter', 'alchemist', 'magier', 'asket', 'druide', 'schurke',
  'barde', 'pakttrager', 'kleriker', 'eidgeschworener', 'barbar',
  'waldlaufer', 'seefahrer', 'schamane'
]);

const LEGACY_CLASS_IDS = Object.freeze({
  krieger: 'kampfer', monch: 'asket', hexenmeister: 'pakttrager',
  hexer: 'pakttrager', paladin: 'eidgeschworener'
});

export function resolveUniversalClassId(value = '') {
  const key = String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const id = LEGACY_CLASS_IDS[key] || key;
  return UNIVERSAL_CLASS_IDS.includes(id) ? id : '';
}

// Relative to Klassenseite.html, also used for its legacy detail hashes.
export function getUniversalClassPageHref(value) {
  const id = resolveUniversalClassId(value);
  return id ? `Basisklassen/${id}/index.html` : '';
}
