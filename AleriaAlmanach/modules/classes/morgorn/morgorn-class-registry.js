export const MORGORN_CLASS_IDS = Object.freeze([
  'karnach',
  'haldr',
  'zernach',
  'wairg',
  'dornach',
  'skarrach',
  'rheach',
  'garnach'
]);

const names = Object.freeze({
  karnach: 'Karnach',
  haldr: 'Haldr',
  zernach: 'Zernach',
  wairg: 'Wairg',
  dornach: 'Dornach',
  skarrach: 'Skarrach',
  rheach: 'Rheach',
  garnach: 'Garnach'
});

const definitions = MORGORN_CLASS_IDS.map(classId => Object.freeze({
  schemaVersion: 1,
  id: `morgorn-${classId}`,
  classId,
  name: names[classId],
  cultureId: 'morgorn',
  culture: 'Morgorn',
  cultures: Object.freeze(['Morgorn']),
  pagePath: `Klassenordner/Morgorn/${classId}/index.html`,
  status: 'lore-only',
  progressionStatus: 'not-authored',
  combatStyleGrants: Object.freeze([])
}));

function normalizeClassId(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de')
    .replace(/^morgorn-/, '')
    .replace(/[^a-z0-9]+/g, '-');
}

export function getMorgornClassDefinition(id) {
  const key = normalizeClassId(id);
  const aliases = {
    bergknecht: 'karnach',
    bergknechte: 'karnach',
    huter: 'haldr',
    wachter: 'zernach',
    hirte: 'wairg',
    hirten: 'wairg',
    grenzer: 'dornach',
    sturmer: 'skarrach',
    'rheas-junger': 'rheach',
    'diener-rheas': 'rheach',
    luntierer: 'garnach'
  };
  const canonical = aliases[key] || key;
  const match = definitions.find(entry => entry.classId === canonical);
  return match ? structuredClone(match) : null;
}

export function getMorgornClassDefinitions() {
  return structuredClone(definitions);
}
