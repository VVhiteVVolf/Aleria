export const DRACHENTANZ_REGISTRY_SCHEMA_VERSION = 1;

const FORM_I_NAME = 'Drachentanz Form I · Tanz des Jungdrachens';

function actionCost(techniqueId, resourceId, name) {
  return {
    id: `${techniqueId}-${resourceId}`,
    resourceId,
    name,
    amount: 1,
    scope: 'comment'
  };
}

function jungdracheTechnique({
  number,
  slug,
  name,
  minimumLevel,
  description,
  effect,
  activationType,
  costResources,
  damageFormula,
  range = 'Nahkampf',
  target = 'Ein Gegner',
  requirements = 'Eine geführte Schwertwaffe.',
  areaEffect = null
}) {
  const id = `combat-style-drachentanz-jungdrache-${String(number).padStart(2, '0')}-${slug}`;
  const costLabels = {
    action: 'Aktion',
    'bonus-action': 'Bonusaktion',
    reaction: 'Reaktion',
    'special-action': 'Besondere Aktion'
  };
  return {
    id,
    name,
    trainingForm: FORM_I_NAME,
    combatStyleId: 'drachentanz',
    combatStyleFormId: 'drachentanz-form-i-jungdrache',
    minimumLevel,
    category: 'technique',
    description,
    effect,
    activationType,
    weaponTypes: ['sword'],
    compatibleWeaponIds: [],
    damageFormula,
    damageType: 'Hieb',
    attackBonus: 0,
    damageBonus: 0,
    rollMode: 'normal',
    range,
    target,
    duration: 'Sofort',
    requirements,
    tags: `Drachentanz · Form I · Jungdrache · ${areaEffect ? 'Flächenschaden' : 'Schaden'}`,
    aiInstructions: areaEffect
      ? 'Reiner Flächenschaden. Denselben Schadenswurf auf alle ausgewählten Ziele anwenden; Schaden nicht doppelt addieren.'
      : 'Reiner Schadensangriff ohne zusätzlichen Zustand oder Nebeneffekt.',
    effects: areaEffect ? [{ id: `${id}-area-damage`, ...areaEffect }] : [],
    costs: costResources.map(resourceId => actionCost(id, resourceId, costLabels[resourceId])),
    auraBypass: { allowed: true, resourceId: 'aura-focus', cost: 1 },
    active: true,
    mechanics: {},
    triggerRules: [],
    secondarySave: { enabled: false },
    followUpAttack: { enabled: false }
  };
}

const JUNGDRACHE_TECHNIQUES = [
  jungdracheTechnique({
    number: 1,
    slug: 'erster-hieb',
    name: 'Erster Hieb des Jungdrachens',
    minimumLevel: 1,
    description: 'Der grundlegende, schnelle Schwerthieb der ersten Drachentanz-Form.',
    effect: 'Bei einem Treffer verursacht die geführte Schwertwaffe 1W10 Hiebschaden.',
    activationType: 'bonus-action',
    costResources: ['bonus-action'],
    damageFormula: '1d10'
  }),
  jungdracheTechnique({
    number: 2,
    slug: 'drachenbiss',
    name: 'Biss des Jungdrachens',
    minimumLevel: 2,
    description: 'Der Anwender verdichtet den einfachen Hieb zu einem kurzen, präzisen Vorstoß.',
    effect: 'Bei einem Treffer verursacht die geführte Schwertwaffe 1W10 plus 1W6 Hiebschaden.',
    activationType: 'action',
    costResources: ['action', 'reaction'],
    damageFormula: '1d10+1d6'
  }),
  jungdracheTechnique({
    number: 3,
    slug: 'gekreuzte-klauen',
    name: 'Gekreuzte Klauen',
    minimumLevel: 3,
    description: 'Zwei fließend verbundene Schnittlinien treffen wie die gekreuzten Klauen eines jungen Drachen.',
    effect: 'Bei einem Treffer verursacht die geführte Schwertwaffe 2W8 Hiebschaden.',
    activationType: 'reaction',
    costResources: ['reaction'],
    damageFormula: '2d8'
  }),
  jungdracheTechnique({
    number: 4,
    slug: 'schweifkreis',
    name: 'Schweifkreis des Jungdrachens',
    minimumLevel: 4,
    description: 'Eine vollständige Drehung zieht die Klinge durch alle nahen Feinde.',
    effect: 'Alle ausgewählten Gegner im Umkreis von 3 Metern erleiden bei einem Treffer jeweils 2W8 Hiebschaden.',
    activationType: 'action',
    costResources: ['action', 'bonus-action', 'reaction'],
    damageFormula: '2d8',
    range: '3 Meter Umkreis',
    target: 'Mehrere ausgewählte Gegner im Umkreis',
    requirements: 'Eine geführte Schwertwaffe und Bewegungsraum für eine Drehung.',
    areaEffect: {
      type: 'damage',
      target: 'selected',
      formula: '2d8',
      damageType: 'Hieb',
      magical: false,
      on: 'hit',
      notes: 'Trifft alle ausgewählten Gegner im Umkreis von 3 Metern.'
    }
  }),
  jungdracheTechnique({
    number: 5,
    slug: 'stuermende-spur',
    name: 'Stürmende Drachenspur',
    minimumLevel: 5,
    description: 'Ein schneller Antritt bündelt den Schwung des Anwenders in einem einzigen durchgezogenen Schnitt.',
    effect: 'Bei einem Treffer verursacht die geführte Schwertwaffe 2W10 plus 1W6 Hiebschaden.',
    activationType: 'special-action',
    costResources: ['action', 'special-action'],
    damageFormula: '2d10+1d6'
  }),
  jungdracheTechnique({
    number: 6,
    slug: 'sechsfacher-lehrhieb',
    name: 'Sechsfacher Lehrhieb',
    minimumLevel: 6,
    description: 'Der Anwender führt die sechs Grundlinien der Form in einem makellosen Lehrstück zusammen.',
    effect: 'Bei einem Treffer verursacht die geführte Schwertwaffe 3W10 Hiebschaden.',
    activationType: 'special-action',
    costResources: ['action', 'bonus-action', 'special-action'],
    damageFormula: '3d10'
  })
];

function emptyMasterForm(number, idSuffix, name, minimumLevel = null, unlockRule = 'Freigabestufe und Techniken werden später ergänzt.') {
  return {
    id: `drachentanz-form-${idSuffix}`,
    number,
    name: `Drachentanz Form ${number} · ${name}`,
    shortName: name,
    trainingTier: 'Meisterform',
    minimumLevel,
    unlockRule,
    techniqueLevelBand: null,
    techniques: []
  };
}

export const DRACHENTANZ_COMBAT_STYLE = Object.freeze({
  schemaVersion: DRACHENTANZ_REGISTRY_SCHEMA_VERSION,
  id: 'drachentanz',
  name: 'Drachentanz',
  culture: 'Cenyr',
  weaponFocus: ['sword'],
  description: 'Cenyri-Schwertkampfstil aus sieben Formen. Klassen erlernen einzelne Formen; deren Techniken werden je nach Ausbildungsstufe freigeschaltet.',
  progression: {
    teulu: 'Teulu erlernen die sechs Techniken der Jungdrachenform auf den Stufen 1 bis 6 und erhalten ab Stufe 7 Zugang zur Schwertdrachenform.',
    specialLevels: 'Die Freigaben der Formen III bis VII bleiben bewusst offen, bis ihre Techniken und Stufenbänder ausgearbeitet sind.'
  },
  forms: [
    {
      id: 'drachentanz-form-i-jungdrache',
      number: 1,
      name: FORM_I_NAME,
      shortName: 'Tanz des Jungdrachens',
      trainingTier: 'Grundform',
      minimumLevel: 1,
      unlockRule: 'Teulu schalten auf jeder Stufe von 1 bis 6 genau eine weitere Technik frei.',
      techniqueLevelBand: { minimum: 1, maximum: 6 },
      techniques: JUNGDRACHE_TECHNIQUES
    },
    emptyMasterForm(2, 'ii-schwertdrache', 'Tanz des Schwertdrachens', 7, 'Teulu erhalten ab Stufe 7 Zugang; Techniken werden später ergänzt.'),
    emptyMasterForm(3, 'iii-abwartender-drache', 'Tanz des abwartenden Drachens'),
    emptyMasterForm(4, 'iv-fliegender-drache', 'Tanz des fliegenden Drachens'),
    emptyMasterForm(5, 'v-bruellender-drache', 'Tanz des brüllenden Drachens'),
    emptyMasterForm(6, 'vi-ausgeglichener-drache', 'Tanz des ausgeglichenen Drachens'),
    emptyMasterForm(7, 'vii-zorniger-drache', 'Tanz des zornigen Drachens')
  ]
});
