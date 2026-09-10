import {
  DRACHENTANZ_EXPERT_PATH_IDS as EXPERT_PATH_IDS,
  DRACHENTANZ_CLASS_PATH_IDS as PATH_ACCESS,
  DRACHENTANZ_FORM_IDS as FORM_IDS,
  DRACHENTANZ_FORM_NAMES as CENYR_FORM_LABELS
} from '../../combat-styles/drachentanz/drachentanz-ids.js?v=20260909-dragon-parent-v2';
import { CENYR_CLASS_IDS } from './cenyr-class-ids.js?v=20260905-cenyr-character-training-v1';
import { ARMOR_ROUTINE } from '../armor-routine.js?v=20260906-armor-routine-v1';
import { getVennyrClassDefinition } from '../vennyr/vennyr-class-registry.js?v=20260909-dragon-parent-v2';
import { WYRMTANZ_FORM_NAMES } from '../../combat-styles/sirenentanz/sirenentanz-forms.js?v=20260909-dragon-parent-v2';

export { CENYR_FORM_LABELS };

export function getCenyrFormLabel(formId, classId = '') {
  return CENYR_FORM_LABELS[formId]
    || WYRMTANZ_FORM_NAMES[formId]
    || formId;
}

const ATTACK_IDS = Object.freeze([
  'combat-style-drachentanz-jungdrache-01-erster-hieb',
  'combat-style-drachentanz-jungdrache-02-drachenbiss',
  'combat-style-drachentanz-jungdrache-03-gekreuzte-klauen',
  'combat-style-drachentanz-jungdrache-04-schweifkreis',
  'combat-style-drachentanz-jungdrache-05-stuermende-spur',
  'combat-style-drachentanz-jungdrache-06-sechsfacher-lehrhieb',
  'combat-style-drachentanz-jungdrache-schuppenschnitt',
  'combat-style-drachentanz-jungdrache-geschlossene-schuppe',
  'combat-style-drachentanz-jungdrache-fluegelschritt',
  'combat-style-drachentanz-jungdrache-ruhiger-drachenatem'
]);

const COMMON_PHASES = Object.freeze([
  { id: 'foundation', name: 'Tanz des Jungdrachens', minimumLevel: 1, maximumLevel: 6, kind: 'foundation' },
  { id: 'free-training', name: 'Freie Vertiefung', minimumLevel: 7, maximumLevel: 8, kind: 'free-training' },
  { id: 'expert-paths', name: 'Expertenpfade', minimumLevel: 9, maximumLevel: 20, kind: 'path-selection' }
]);

function access(formId, minimumLevel, maximumLevel, options = {}) {
  return { formId, minimumLevel, maximumLevel, status: options.status || 'confirmed',
    ...(options.note ? { note: options.note } : {}),
    ...(options.requiredPathId ? { requiredPathId: options.requiredPathId } : {}),
    ...(options.initialTechniqueCount ? { initialTechniqueCount: options.initialTechniqueCount } : {}) };
}

function feature(id, name, minimumLevel, description, mechanics = null, status = 'confirmed') {
  return { id, name, minimumLevel, description, mechanics, status };
}

function jungdracheGrant(levels = []) {
  return { styleId: 'drachentanz', formId: FORM_IDS.jungdrache, minimumLevel: 1,
    techniqueUnlockLevels: Object.fromEntries(ATTACK_IDS.map((id, index) => [id, levels[index] ?? null])) };
}

function curriculum(config) {
  const isMilwr = config.classId === 'milwr';
  return {
    schemaVersion: 3, id: `cenyr-${config.classId}`, classId: config.classId, name: config.name,
    cultureId: 'cenyr', culture: 'Cenyr', templateId: isMilwr ? 'cenyr-milwr' : config.classId,
    pagePath: `Klassenordner/Cenyr/${config.classId}/index.html`, focus: config.focus,
    trainingFocus: config.trainingFocus, minimumLevel: 1, maximumLevel: 20, status: 'partial',
    affiliation: config.affiliation || 'Ritterstand des Königreichs Cenyr',
    trainingPhases: config.trainingPhases || COMMON_PHASES, formAccess: config.formAccess,
    pathSelection: config.pathSelection, techniqueBudget: config.techniqueBudget,
    trainingBranches: config.trainingBranches || [], techniquePool: config.techniquePool,
    weaponTraining: config.weaponTraining, weaponVariants: config.weaponVariants || [],
    classFeatures: [...config.classFeatures, ARMOR_ROUTINE], combatStyleGrants: config.combatStyleGrants,
    pendingFeatures: config.pending.map(name => ({ name, minimumLevel: null, status: 'pending' }))
  };
}

const KNIGHT_PATH_SELECTION = Object.freeze({
  minimumLevel: 9, maximumLevel: 20, multiplePathsAllowed: true, sharedTechniqueBudget: true,
  selectionCadence: 'slot-funded', firstSelectionRequired: true, firstSelectionCost: 0,
  additionalSelectionCost: 1, costUnit: 'technique-slot', allowedFormIds: EXPERT_PATH_IDS,
  rule: 'Auf Stufe 9 wird der erste Expertenpfad ohne Slotkosten gewählt. Jeder weitere Pfad verbraucht einen verdienten Experten-Attackenslot; dadurch bleiben weniger Slots für Attacken.'
});

const EXCLUSIVE_PATH_OWNERS = Object.freeze({
  [FORM_IDS.speerdrache]: { note: 'Gemeinsame erste Expertenform von Cantref und Uchelwyr: Schwertdrachenlehre mit albischem Bewegungsfluss.' },
  [FORM_IDS.peitschender]: { note: 'Gemeinsame explosive, offensive Speerform von Cantref und Uchelwyr.' },
  [FORM_IDS.huetender]: { note: 'Gemeinsame defensive, ausdauernde Speerform von Cantref und Uchelwyr.' },
  [FORM_IDS.stuermender]: { note: 'Kavallerieform des Uchelwyr; berittener Einsatz.' },
  [FORM_IDS.schweifender]: { note: 'Offensive Bewegungsform des Uchelwyr mit Schwert und Speer; einzelne Techniken erfordern ein Ross.' },
  [FORM_IDS.lauernder]: { note: 'Bogenform des Helwyr mit dem Schwert als Zweitwaffe.' },
  [FORM_IDS.jagender]: { note: 'Helwyr-Form für Bogen, Heimlichkeit, Hinterhalt und kurze Klingen.' },
  [FORM_IDS.baerenklaue]: { note: 'Einzige besondere Eigenform des Arthwyr: schwerer Nah- und Enterkampf.' }
});

function knightPathSelection(classId) {
  return { ...KNIGHT_PATH_SELECTION, allowedFormIds: PATH_ACCESS[classId] || [] };
}

function techniqueBudget(total, bands) {
  const slots = Object.entries(bands).flatMap(([band, levels]) => levels.map((level, index) => ({
    id: `${band}-${String(index + 1).padStart(2, '0')}`,
    level,
    band
  })));
  if (slots.length !== total) throw new Error(`Ungültiges Cenyr-Attackenbudget: ${slots.length}/${total}`);
  return { total, slots, bands: Object.fromEntries(Object.entries(bands).map(([id, levels]) => [id, { count: levels.length, levels }])) };
}

function branch(id, name, minimumLevel, options = {}) {
  return {
    id, name, minimumLevel,
    status: options.status || 'planned',
    ...(options.maximumLevel ? { maximumLevel: options.maximumLevel } : {}),
    ...(options.formIds ? { formIds: options.formIds } : {}),
    ...(options.weaponProfileIds ? { weaponProfileIds: options.weaponProfileIds } : {}),
    ...(options.note ? { note: options.note } : {}),
    ...(options.optionQuotaPerForm ? { optionQuotaPerForm: options.optionQuotaPerForm } : {})
  };
}

function weaponVariant(id, name, rule, options = {}) {
  return { id, name, rule, status: options.status || 'confirmed', ...(options.maximumTargets ? { maximumTargets: options.maximumTargets } : {}) };
}

const CANTREF_WEAPON_VARIANTS = Object.freeze([
  weaponVariant('lance', 'Lanze', 'Stichschaden; das Ziel wird für diesen Angriff mit 1 Punkt weniger Verteidigung gewertet.'),
  weaponVariant('partisan', 'Partisane', '+1 auf den Angriffswurf.'),
  weaponVariant('trident', 'Dreizack', 'Erlaubt bei einem Treffer einen Entwaffnungsversuch; die Kampfauswertung weist darauf hin.'),
  weaponVariant('halberd', 'Hellebarde', 'Kann bis zu vier Gegner treffen; jeder Angriff wird einzeln gewürfelt, die Kosten fallen einmal an.', { maximumTargets: 4 })
]);

const knightAccess = classId => [
  access(FORM_IDS.jungdrache, 1, 6),
  access(FORM_IDS.vertiefung, 7, 8, { note: 'Eigene Techniken oder die vier bewährten Übergangsangriffe der Klassenfolge.' }),
  ...(PATH_ACCESS[classId] || []).map(formId => {
    const owner = EXCLUSIVE_PATH_OWNERS[formId];
    const allowed = (PATH_ACCESS[classId] || []).includes(formId);
    return access(formId, 9, 20, {
      status: allowed ? 'confirmed' : 'blocked',
      note: owner?.note || (!allowed ? 'Dieser Waffenpfad gehört nicht zur Ausbildung dieser Klasse.' : ''),
      requiredPathId: formId === FORM_IDS.aufsteigender ? FORM_IDS.fliegender : ''
    });
  })
];

const DEFINITIONS = [
  curriculum({
    classId: 'milwr', name: 'Milwr', focus: 'Schildwall, Formation und Dienst', trainingFocus: 'Begrenzte, flexible Drachentanz-Ausbildung',
    affiliation: 'Heer, Milizen und Stadtwachen Cenyrs',
    trainingPhases: [COMMON_PHASES[0], { id: 'drachling', name: 'Tanz des Drachlings', minimumLevel: 6, maximumLevel: 15, kind: 'path' },
      { id: 'open-training', name: 'Freie Klassenentwicklung', minimumLevel: 16, maximumLevel: 20, kind: 'pending' }],
    formAccess: [access(FORM_IDS.jungdrache, 1, 6), access(FORM_IDS.drachling, 6, 15)],
    pathSelection: { minimumLevel: 6, maximumLevel: 15, multiplePathsAllowed: false, sharedTechniqueBudget: false,
      selectionCadence: 'fixed', rule: 'Milwr wechseln nach der Grundform ausschließlich in den Tanz des Drachlings.' },
    techniqueBudget: techniqueBudget(9, { foundation: [1, 2, 4, 6], drachling: [6, 8, 10, 12, 15] }),
    trainingBranches: [branch('milwr-jungdrache', 'Jungdrache des Milwr', 1, { formIds: [FORM_IDS.jungdrache] }),
      branch('milwr-drachling', 'Tanz des Drachlings', 6, { maximumLevel: 15, formIds: [FORM_IDS.drachling] })],
    techniquePool: { rank: 'restricted', totalSlots: 9, description: 'Neun Attackenslots: vier für den Jungdrachen und fünf für den Drachling.' },
    weaponTraining: { primary: ['flexible melee'], secondary: [], note: 'Weniger Grazie und Expertise; brachialer und für Söldner flexibler.' },
    classFeatures: [feature('milwr-drachling-path', 'Pfad des Drachlings', 6, 'Schwächere, direktere Drachentanz-Ausbildung für Nicht-Ritter und Söldner.', null, 'partial')],
    combatStyleGrants: [jungdracheGrant()],
    pending: ['Feinbalance und endgültige Freigabe der neun Attacken', 'Schilddisziplin und Formationskampf', 'Startausrüstung und Klassenwerte']
  }),
  curriculum({
    classId: 'teulu', name: 'Teulu', focus: 'Schwertkunst und Duell', trainingFocus: 'Tiefste Ausbildung und größter Technikpool',
    formAccess: knightAccess('teulu'), pathSelection: knightPathSelection('teulu'),
    // Append slots: saved foundation-01 through -06 retain their original levels.
    techniqueBudget: techniqueBudget(24, { foundation: [1, 2, 3, 4, 5, 6, 2, 3, 4, 6], duelist: [7, 8], expert: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] }),
    trainingBranches: [branch('teulu-sword', 'Schwertfolge der Teulu', 1, { status: 'confirmed', formIds: [FORM_IDS.jungdrache, FORM_IDS.vertiefung, ...PATH_ACCESS.teulu], weaponProfileIds: ['sword'] })],
    techniquePool: { rank: 1, totalSlots: 24, description: '24 Technikslots: zehn Grundtechniken, zwei freie Vertiefungen auf Stufe 7–8 und zwölf Expertenattacken.' },
    weaponTraining: { primary: ['sword'], secondary: [], note: 'Vollständige Schwertausbildung.' },
    classFeatures: [feature('teulu-sword-damage', 'Meisterschaft der Klinge', 6, '+2 Schaden mit Drachentanz-Angriffen, wenn ein Schwert geführt wird.', { damageBonus: 2, styleId: 'drachentanz', weaponTypes: ['sword'] })],
    combatStyleGrants: [jungdracheGrant([1, 2, 3, 4, 5, 6, 2, 3, 4, 6])],
    pending: ['Feinbalance der freien Vertiefungen und Expertenattacken', 'Auswahlregeln für die zwölf Experten-Slots']
  }),
  curriculum({
    classId: 'cantref', name: 'Cantref', focus: 'Speer, Distanz und Linie', trainingFocus: 'Drachentanz mit Speer und Stangenwaffen',
    formAccess: knightAccess('cantref'), pathSelection: knightPathSelection('cantref'),
    techniqueBudget: techniqueBudget(14, { foundation: [1, 2, 3, 4, 5, 6], duelist: [7, 8], expert: [9, 11, 13, 15, 17, 20] }),
    trainingBranches: [branch('cantref-polearm', 'Stangenwaffenfolge des Cantref', 1, { formIds: [FORM_IDS.jungdrache, FORM_IDS.vertiefung, ...PATH_ACCESS.cantref], weaponProfileIds: ['lance', 'partisan', 'trident', 'halberd'] })],
    techniquePool: { rank: 'specialized', totalSlots: 14, description: 'Vierzehn Attackenslots: sechs Grundtechniken, zwei freie Vertiefungen und sechs Expertenattacken.' },
    weaponTraining: { primary: ['Lanze', 'Partisane', 'Dreizack', 'Hellebarde'], secondary: ['Schwert'], note: 'Jede Cantref-Stangenwaffenattacke nutzt dieselbe Attacke; Schadenswürfel und Waffeneffekt richten sich nach der geführten Waffe.' },
    weaponVariants: CANTREF_WEAPON_VARIANTS,
    classFeatures: [feature('cantref-weapon-adaptation', 'Drachentanz der Stangenwaffen', 1, 'Cantref können ihre Speerattacken mit Lanze, Partisane, Dreizack oder Hellebarde ausführen.', null, 'partial')],
    combatStyleGrants: [jungdracheGrant()],
    pending: ['Feinbalance der Stangenwaffenfolgen', 'Automatischer Entwaffnungsablauf für den Dreizack']
  }),
  curriculum({
    classId: 'uchelwyr', name: 'Uchelwyr', focus: 'Lanze, Anritt und Reiterkampf', trainingFocus: 'Zweitgrößter Pool mit berittenen Techniken',
    formAccess: knightAccess('uchelwyr'), pathSelection: knightPathSelection('uchelwyr'),
    techniqueBudget: techniqueBudget(16, { foundation: [1, 2, 3, 4, 5, 6], duelist: [7, 8], expert: [9, 10, 12, 14, 16, 18, 19, 20] }),
    trainingBranches: [
      branch('uchelwyr-sword', 'Schwertfolge des Uchelwyr', 1, { formIds: [FORM_IDS.jungdrache, FORM_IDS.vertiefung, FORM_IDS.stuermender, FORM_IDS.schweifender], weaponProfileIds: ['sword'] }),
      branch('uchelwyr-lance', 'Gemeinsame Speerfolge mit dem Cantref', 1, { formIds: [FORM_IDS.jungdrache, FORM_IDS.vertiefung, FORM_IDS.speerdrache, FORM_IDS.peitschender, FORM_IDS.huetender], weaponProfileIds: ['spear', 'lance', 'partisan', 'trident', 'halberd'], note: 'Die drei Speerformen teilen ihre Techniken mit dem Cantref.' }),
      branch('uchelwyr-mounted', 'Tanz des stürmenden Drachens', 9, { formIds: [FORM_IDS.stuermender, FORM_IDS.schweifender], weaponProfileIds: ['sword', 'lance'], note: 'Der stürmende Drache setzt ein Ross voraus; der schweifende Drache ergänzt den Fußkampf um besondere Reiteroptionen.' })
    ],
    techniquePool: { rank: 2, totalSlots: 16, description: 'Sechzehn Attackenslots: sechs Grundtechniken, zwei freie Vertiefungen und acht Expertenattacken.' },
    weaponTraining: { primary: ['Schwert', 'Speer', 'Lanze'], secondary: ['Partisane', 'Dreizack', 'Hellebarde'], note: 'Die drei Speerformen teilen ihre Techniken mit dem Cantref; berittene Optionen benötigen den Status „beritten“.' },
    weaponVariants: [CANTREF_WEAPON_VARIANTS[0]],
    classFeatures: [feature('uchelwyr-mounted-training', 'Ritter des hohen Sattels', 9, 'Stürmender und schweifender Drache ergänzen die drei gemeinsamen Speerformen. Alle Formen teilen dasselbe Attackenbudget.', null, 'partial')],
    combatStyleGrants: [jungdracheGrant()],
    pending: ['Feinbalance der berittenen Attacken', 'Weitere passive Reiterboni', 'Zusammenspiel von Reiter und Ross']
  }),
  curriculum({
    classId: 'helwyr', name: 'Helwyr', focus: 'Bogen, Gelände und Zielwahl', trainingFocus: 'Halber Drachentanz-Pool mit eigenem Fernkampfpfad',
    formAccess: knightAccess('helwyr'), pathSelection: knightPathSelection('helwyr'),
    techniqueBudget: techniqueBudget(12, { foundation: [1, 3, 5, 4, 6], duelist: [7], expert: [9, 11, 13, 16, 18, 20] }),
    trainingBranches: [
      branch('helwyr-longbow', 'Langbogenfolge', 1, { formIds: [FORM_IDS.jungdrache, FORM_IDS.vertiefung, FORM_IDS.lauernder, FORM_IDS.jagender], weaponProfileIds: ['longbow'], note: 'Reichweite, Durchschlagskraft und gezielte Spezialschüsse.' }),
      branch('helwyr-shortbow', 'Kurzbogenfolge', 1, { formIds: [FORM_IDS.jungdrache, FORM_IDS.vertiefung, FORM_IDS.lauernder, FORM_IDS.jagender], weaponProfileIds: ['shortbow'], note: 'Beweglichkeit, Stellungswechsel und geringere Aktionskosten.' }),
      branch('helwyr-dual-blades', 'Beidhändige Klingenfolge', 1, { formIds: [FORM_IDS.jungdrache, FORM_IDS.vertiefung, FORM_IDS.zwillingsdrache], weaponProfileIds: ['dual-swords', 'dual-daggers'], note: 'Schadenswürfel richten sich nach Schwertern oder Dolchen.' }),
      branch('helwyr-classic-sword', 'Klassische Schwertfolge', 1, { weaponProfileIds: ['sword'], note: 'Kleiner gemeinsamer Ritterpool.' })
    ],
    techniquePool: { ratioToTeulu: 0.5, totalSlots: 12, description: 'Zwölf Technikslots und damit genau halb so viele wie der Teulu. Fünf Grundtechniken halten Fern- und Nahkampf verfügbar.' },
    weaponTraining: { primary: ['Langbogen', 'Kurzbogen'], secondary: ['Beidhändige Schwerter oder Dolche', 'Schwert'], note: 'Alle vier Zweige teilen sich dasselbe Budget; die Waffe bestimmt Schadenswürfel und zulässige Attacken.' },
    classFeatures: [feature('helwyr-ranged-accuracy', 'Auge des Helwyr', 1, '+2 auf Trefferwürfe mit Fernkampfangriffen.', { attackBonus: 2, range: 'ranged' })],
    combatStyleGrants: [jungdracheGrant()],
    pending: ['Feinbalance der vier Waffenfolgen', 'Munitionsbesonderheiten der Spezialschüsse']
  }),
  curriculum({
    classId: 'arthwyr', name: 'Arthwyr', focus: 'Vorhut, Enterkampf und Durchbruch', trainingFocus: 'Brachiale Drachentanz-Variante mit eigener Bärenklaue und frühem Brüllenden Drachen',
    affiliation: 'Haus Arth O’Guwan und Kadettenhäuser Pawen und Crafanc',
    formAccess: knightAccess('arthwyr').map(entry => entry.formId === FORM_IDS.bruellender
      ? access(entry.formId, 6, 20, { initialTechniqueCount: 1, note: 'Eine Attacke bereits ab Stufe 6; der reguläre Pfad beginnt ab Stufe 9.' }) : entry),
    pathSelection: knightPathSelection('arthwyr'),
    techniqueBudget: techniqueBudget(14, { foundation: [1, 2, 3, 4, 5, 6], earlyRoaring: [6], duelist: [7, 8], expert: [9, 12, 15, 18, 20] }),
    trainingBranches: [branch('arthwyr-brutal', 'Brachiale Waffenfolge', 1, { formIds: [FORM_IDS.jungdrache, FORM_IDS.vertiefung, ...PATH_ACCESS.arthwyr], weaponProfileIds: ['greatsword', 'axe', 'battleaxe', 'club'] }),
      branch('arthwyr-early-roaring', 'Früher Brüllender Drache', 6, { formIds: [FORM_IDS.bruellender], note: 'Ein zusätzlicher früher Slot auf Stufe 6.' })],
    techniquePool: { rank: 'broad-brutal', totalSlots: 14, description: 'Vierzehn Attackenslots einschließlich eines zusätzlichen Brüllender-Drache-Slots auf Stufe 6.' },
    weaponTraining: { primary: ['Großschwert'], secondary: ['Axt', 'Keule', 'Streitaxt'], note: 'Die Attacke bleibt dieselbe; Schadenswürfel, Schadensart und Beschreibung passen sich an die geführte Waffe an.' },
    classFeatures: [
      feature('arthwyr-brutal-style', 'Brachialer Drachentanz', 1, '-2 auf Trefferwürfe, aber +2 Schaden mit Drachentanz-Angriffen.', { attackBonus: -2, damageBonus: 2, styleId: 'drachentanz' }),
      feature('arthwyr-roaring-entry', 'Früher Ruf des Brüllenden Drachen', 6, 'Eine Attacke dieses Pfades wird bereits auf Stufe 6 zugänglich.', null, 'partial')
    ],
    combatStyleGrants: [jungdracheGrant()],
    pending: ['Feinbalance der brachialen Waffenwerte']
  }),
  curriculum({
    classId: 'barddwyr', name: 'Barddwyr', focus: 'Klang, Magie und Rapier', trainingFocus: 'Kleinster Drachentanz-Pool und wachsende Zauberkunst',
    affiliation: 'Haus Ceirwyn O’Calon',
    formAccess: [
      access(FORM_IDS.jungdrache, 1, 6),
      access(FORM_IDS.vertiefung, 7, 8, { status: 'optional-branch', note: 'Freie Vertiefung des reduzierten Schwertzweigs.' }),
      access(FORM_IDS.traellernder, 7, 8, { note: 'Rapieroption innerhalb der freien Vertiefung.' }),
      access(FORM_IDS.schwertdrache, 9, 20, { note: 'Duellpfad des reduzierten Schwertzweigs.' }),
      access(FORM_IDS.kreischender, 9, 20)
    ],
    pathSelection: { ...KNIGHT_PATH_SELECTION,
      allowedFormIds: [FORM_IDS.schwertdrache, FORM_IDS.kreischender],
      blockedFormIds: [],
      rule: 'Ab Stufe 9 stehen Schwertdrache und Kreischender Drache offen. Der trällernde Drache bleibt die eigene Rapierform der Stufen 7–8. Weitere Expertenpfade kosten Attackenslots.' },
    techniqueBudget: techniqueBudget(8, { foundation: [1, 4], duelist: [7, 8], expert: [9, 13, 17, 20] }),
    trainingBranches: [
      branch('barddwyr-sword', 'Reduzierte Schwertfolge', 1, { formIds: [FORM_IDS.jungdrache, FORM_IDS.vertiefung, FORM_IDS.schwertdrache], weaponProfileIds: ['sword'], note: 'Folgt einer kleineren Auswahl der Teulu-Schwertfolge.' }),
      branch('barddwyr-rapier', 'Rapierfolge', 1, { formIds: [FORM_IDS.jungdrache, FORM_IDS.traellernder, FORM_IDS.kreischender], weaponProfileIds: ['rapier'], note: 'Natürliche 19 und 20 sind kritisch.' }),
      branch('barddwyr-traellernder', 'Tanz des trällernden Drachens', 7, { maximumLevel: 8, formIds: [FORM_IDS.traellernder], weaponProfileIds: ['rapier'], note: 'Schnelle Rapierfolge als reguläre Fortsetzung auf Stufe 7–8.' }),
      branch('barddwyr-kreischender', 'Tanz des kreischenden Drachens', 9, { maximumLevel: 20, formIds: [FORM_IDS.kreischender], weaponProfileIds: ['rapier'], note: 'Schnelligkeit, Ausweichen, Stellungswechsel und kritische Treffer.' })
    ],
    techniquePool: { rank: 7, totalSlots: 8, description: 'Acht Attackenslots: zwei Grundtechniken, zwei freie Vertiefungen und vier Expertenattacken.' },
    weaponTraining: { primary: ['Rapier'], secondary: ['Schwert'], note: 'Auf Stufe 7 wird Rapier oder Schwert als Hauptzweig gewählt. Der zweite Zweig bleibt möglich, verbraucht aber einen Attackenslot.' },
    weaponVariants: [weaponVariant('rapier', 'Rapier', 'Barddwyr-Drachentanztechniken erzielen bei einer natürlichen 19 oder 20 einen kritischen Treffer.')],
    classFeatures: [
      feature('barddwyr-spell-training', 'Klinge, Klang und Aura', 6, 'Grundzauber, Verstärkungen und Rituale beginnen auf Stufe 6 und wachsen bis Stufe 20.', null, 'partial'),
      feature('barddwyr-rapier-critical', 'Rapiertechnik des Barddwyr', 1, 'Drachentanz-Angriffe mit dem Rapier sind bei einer natürlichen 19 oder 20 kritisch.', { criticalThreshold: 19, styleId: 'drachentanz', weaponProfileIds: ['rapier'] })
    ],
    combatStyleGrants: [jungdracheGrant()],
    pending: ['Grundzauber, Buffs und Rituale 6–20', 'Feinbalance der Rapier- und Schwertpfade']
  })
];

export { CENYR_CLASS_IDS };

export function getCenyrClassDefinition(id, cultureId = 'cenyr') {
  const key = String(id || '').toLowerCase();
  if (['derwyn', 'vennyr-derwyn', 'cenyr-derwyn'].includes(key) && ['cenyr', 'vennyr'].includes(cultureId)) return getVennyrClassDefinition('derwyn');
  if (cultureId !== 'cenyr') return null;
  const entry = DEFINITIONS.find(candidate => [candidate.id, candidate.classId, candidate.templateId].includes(key));
  return entry ? structuredClone(entry) : null;
}

export function getCenyrClassDefinitions() {
  return structuredClone(DEFINITIONS);
}

export function getCenyrClassDefinitionForProfile(profile = {}) {
  const templateId = String(profile.templateSelections?.classId || '').trim().toLowerCase();
  const archetype = String(profile.identity?.archetype || '').trim().toLowerCase();
  const ancestry = String(profile.identity?.ancestry || '').trim().toLowerCase();
  if (!templateId && archetype === 'milwr' && !['cenyr', 'cenyri'].includes(ancestry)) return null;
  const definition = getCenyrClassDefinition(templateId || archetype);
  if (!definition || (templateId && templateId !== definition.templateId)) return null;
  return definition;
}

export function withCenyrClassTraining(template) {
  const definition = template.id === 'derwyn' ? getCenyrClassDefinition('derwyn') : DEFINITIONS.find(entry => entry.templateId === template.id);
  return definition ? { ...template, group: definition.classId === 'derwyn' ? 'Cenyr & Vennyr' : 'Cenyr-Klassen', cultureId: definition.cultureId, classProgressionId: definition.id,
    combatStyleGrants: structuredClone(definition.combatStyleGrants) } : template;
}

export const cenyrClassRegistryInternals = Object.freeze({ FORM_IDS, EXPERT_PATH_IDS, ATTACK_IDS });
