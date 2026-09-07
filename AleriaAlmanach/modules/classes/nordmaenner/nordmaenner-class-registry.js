export const NORDMAENNER_CLASS_IDS = Object.freeze([
  'hird-kona',
  'stjorn',
  'ravnar',
  'ulfhednar',
  'berserkir',
  'veigir',
  'tungur',
  'hestgar'
]);

const names = Object.freeze({
  'hird-kona': 'Hird/Kona',
  stjorn: 'Stjorn',
  ravnar: 'Ravnar',
  ulfhednar: 'Ulfhednar',
  berserkir: 'Berserkir',
  veigir: 'Veigir',
  tungur: 'Tungur',
  hestgar: 'Hestgar'
});

const definitions = NORDMAENNER_CLASS_IDS.map(classId => Object.freeze({
  schemaVersion: 1,
  id: `nordmaenner-${classId}`,
  classId,
  name: names[classId],
  cultureId: 'nordmaenner',
  culture: 'Nordmänner',
  cultures: Object.freeze(['Nordmänner']),
  pagePath: `Klassenordner/Nordmaenner/${classId}/index.html`,
  status: 'lore-only',
  progressionStatus: 'not-authored',
  combatStyleGrants: Object.freeze([])
}));

export function getNordmaennerClassDefinition(id) {
  const key = String(id || '').toLocaleLowerCase('de');
  const aliases = {
    hird: 'hird-kona',
    hirdmann: 'hird-kona',
    kona: 'hird-kona',
    schildmaid: 'hird-kona',
    berserker: 'berserkir',
    ulfhednare: 'ulfhednar'
  };
  const canonical = aliases[key] || key.replace(/^nordmaenner-/, '');
  const match = definitions.find(entry => entry.classId === canonical);
  return match ? structuredClone(match) : null;
}

export function getNordmaennerClassDefinitions() {
  return structuredClone(definitions);
}
