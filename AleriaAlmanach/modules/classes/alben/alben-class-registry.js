export const ALBEN_CLASS_IDS = Object.freeze([
  'kern',
  'cateran',
  'mormaer',
  'serf',
  'airig',
  'currach',
  'ceolaire-piobaire',
  'riada',
  'galloghlaigh',
  'fathach',
  'silvaner'
]);

const names = Object.freeze({
  kern: 'Kern',
  cateran: 'Cateran',
  mormaer: 'Mormaer',
  serf: 'Serf',
  airig: 'Airig',
  currach: 'Currach',
  'ceolaire-piobaire': 'Ceólaire & Piobaire',
  riada: 'Riada',
  galloghlaigh: 'Galloghlaigh',
  fathach: 'Fathach',
  silvaner: 'Silvaner'
});

const definitions = ALBEN_CLASS_IDS.map(classId => Object.freeze({
  schemaVersion: 1,
  id: `alben-${classId}`,
  classId,
  name: names[classId],
  cultureId: 'alben',
  culture: 'Alben',
  cultures: Object.freeze(['Alben']),
  pagePath: `Klassenordner/Alben/${classId}/index.html`,
  status: 'lore-only',
  progressionStatus: 'not-authored',
  combatStyleGrants: Object.freeze([])
}));

export function getAlbenClassDefinition(id) {
  const key = String(id || '').toLocaleLowerCase('de');
  const aliases = { galloglaigh: 'galloghlaigh', piobaire: 'ceolaire-piobaire', ceolaire: 'ceolaire-piobaire' };
  const canonical = aliases[key] || key.replace(/^alben-/, '');
  const match = definitions.find(entry => entry.classId === canonical);
  return match ? structuredClone(match) : null;
}

export function getAlbenClassDefinitions() {
  return structuredClone(definitions);
}
