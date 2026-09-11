function freezeList(values = []) {
  return Object.freeze([...values]);
}

function freezePhases(phases = []) {
  return Object.freeze(phases.map(phase => Object.freeze({ ...phase })));
}

function freezeWeaponTraining(training = {}) {
  return Object.freeze({
    primary: freezeList(training.primary),
    secondary: freezeList(training.secondary),
    note: String(training.note || '')
  });
}

export function createStructureOnlyClassDefinitions({
  cultureId,
  culture,
  folder,
  classIds,
  blueprints,
  trainingPhases,
  pathRule = 'Pfade, Wahlrhythmus und Zugangsvoraussetzungen werden später festgelegt.'
}) {
  const phases = freezePhases(trainingPhases);
  return Object.freeze(classIds.map(classId => {
    const blueprint = blueprints[classId];
    if (!blueprint) throw new Error(`${cultureId}: Klassenentwurf fehlt: ${classId}`);
    return Object.freeze({
      schemaVersion: 2,
      id: `${cultureId}-${classId}`,
      classId,
      templateId: `${cultureId}-${classId}`,
      name: blueprint.name,
      cultureId,
      culture,
      cultures: Object.freeze([culture]),
      pagePath: `Klassenordner/${folder}/${classId}/index.html`,
      focus: blueprint.focus,
      trainingFocus: blueprint.trainingFocus,
      affiliation: blueprint.affiliation,
      minimumLevel: 1,
      maximumLevel: 20,
      status: 'structure-only',
      progressionStatus: 'structure-only',
      authoredThroughLevel: 0,
      trainingPhases: phases,
      formAccess: Object.freeze([]),
      pathSelection: Object.freeze({
        minimumLevel: 9,
        maximumLevel: 20,
        multiplePathsAllowed: false,
        sharedTechniqueBudget: false,
        selectionCadence: 'pending',
        rule: pathRule
      }),
      techniqueBudget: Object.freeze({ total: 0, slots: Object.freeze([]), bands: Object.freeze({}) }),
      trainingBranches: Object.freeze([]),
      techniquePool: Object.freeze({ rank: 'pending', totalSlots: 0, description: 'Attacken, Fähigkeiten und Lernplätze sind noch offen.' }),
      weaponTraining: freezeWeaponTraining(blueprint.weaponTraining),
      weaponVariants: Object.freeze([]),
      classFeatures: Object.freeze([]),
      combatStyleGrants: Object.freeze([]),
      pendingFeatures: Object.freeze([
        Object.freeze({ name: 'Kampfkunst und Formen', minimumLevel: null, status: 'pending' }),
        Object.freeze({ name: 'Attacken, Fähigkeiten und Ressourcen', minimumLevel: null, status: 'pending' }),
        Object.freeze({ name: 'Klassenmerkmale und Pfadboni', minimumLevel: null, status: 'pending' })
      ])
    });
  }));
}

function normalizeClassId(value, cultureId) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de')
    .replace(new RegExp(`^${cultureId}-`), '')
    .replace(/[^a-z0-9]+/g, '-');
}

export function findStructureOnlyClassDefinition(definitions, value, { cultureId, aliases = {} }) {
  const key = normalizeClassId(value, cultureId);
  const canonical = aliases[key] || key;
  const match = definitions.find(entry => entry.classId === canonical);
  return match ? structuredClone(match) : null;
}

function clampLevel(level) {
  return Math.max(1, Math.min(20, Math.trunc(Number(level) || 1)));
}

export function createStructureOnlyProgression(definition, level = 1) {
  if (!definition) return null;
  const selectedLevel = clampLevel(level);
  const levels = Array.from({ length: 20 }, (_, index) => {
    const currentLevel = index + 1;
    return {
      level: currentLevel,
      phase: definition.trainingPhases.find(phase => currentLevel >= phase.minimumLevel && currentLevel <= phase.maximumLevel) || null,
      forms: [],
      pathOptions: [],
      techniqueSlots: [],
      attacks: [],
      features: [],
      status: 'pending'
    };
  });
  return {
    ...definition,
    selectedLevel,
    styles: [],
    levels,
    selectedPathIds: [],
    earnedTechniqueSlots: [],
    pathOptions: [],
    attackCatalog: [],
    availableAttacks: []
  };
}
