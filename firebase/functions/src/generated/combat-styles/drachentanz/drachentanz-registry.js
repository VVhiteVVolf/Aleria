import { DRACHENTANZ_FORM_IDS as FORM_IDS } from './drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import { createDrachentanzDamageProfile } from './drachentanz-damage-progression.js?v=20260905-damage-balance-v1';
import { CLASS_FOUNDATION_TECHNIQUES } from './techniques/foundation-techniques.js?v=20260905-damage-balance-v1';
import { DUELIST_TECHNIQUES } from './techniques/duelist-techniques.js?v=20260905-damage-balance-v1';
import { ABWARTENDER_TECHNIQUES } from './techniques/abwartender-techniques.js?v=20260905-damage-balance-v1';
import { FLIEGENDER_TECHNIQUES } from './techniques/fliegender-techniques.js?v=20260905-damage-balance-v1';
import { ARTHWYR_EARLY_ROARING_TECHNIQUE, BRUELLENDER_TECHNIQUES } from './techniques/bruellender-techniques.js?v=20260905-damage-balance-v1';
import { AUSGEGLICHENER_TECHNIQUES } from './techniques/ausgeglichener-techniques.js?v=20260905-damage-balance-v1';
import { ZORNIGER_TECHNIQUES } from './techniques/zorniger-techniques.js?v=20260905-damage-balance-v1';
import { UCHELWYR_MOUNTED_TECHNIQUES } from './techniques/uchelwyr-mounted-techniques.js?v=20260905-damage-balance-v1';
import { DRACHLING_TECHNIQUES } from './techniques/milwr-techniques.js?v=20260905-damage-balance-v1';
import { BARDDWYR_STANDARD_PATH_TECHNIQUES, KREISCHENDER_TECHNIQUES, TRAELLERNDER_TECHNIQUES } from './techniques/barddwyr-techniques.js?v=20260905-damage-balance-v1';
import { HELWYR_EXPERT_TECHNIQUES } from './techniques/helwyr-expert-techniques.js?v=20260905-damage-balance-v1';

export const DRACHENTANZ_REGISTRY_SCHEMA_VERSION = 6;

const FORM_I_NAME = 'Drachentanz Form I · Tanz des Jungdrachens';

function actionCost(techniqueId, resourceId, name) {
  return {
    id: `${techniqueId}-${resourceId}`,
    resourceId,
    name,
    amount: 1,
    scope: resourceId === 'special-action' ? 'persistent' : 'comment'
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
  const costs = costResources.map(resourceId => actionCost(id, resourceId, costLabels[resourceId]));
  return {
    id,
    name,
    trainingForm: FORM_I_NAME,
    combatStyleId: 'drachentanz',
    combatStyleFormId: 'drachentanz-form-i-jungdrache',
    minimumLevel,
    category: 'technique',
    status: 'confirmed',
    description,
    effect,
    activationType,
    weaponTypes: ['sword'],
    compatibleWeaponIds: [],
    ...createDrachentanzDamageProfile({ minimumLevel, maximumTargets: areaEffect ? 20 : 1 }, costs),
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
    effects: areaEffect ? [{ id: `${id}-area-damage`, ...areaEffect, formula: '', inheritWeaponDamageType: true }] : [],
    costs,
    auraBypass: { allowed: true, resourceId: 'aura-focus', cost: 1 },
    active: true,
    mechanics: {},
    triggerRules: [],
    secondarySave: { enabled: false },
    followUpAttack: { enabled: false },
    cenyrTraining: {
      branchId: 'teulu-sword',
      weaponRuleSetId: '',
      uchelwyrCompatible: false,
      requiresMounted: false,
      allowedClassIds: ['teulu'],
      classWeaponProfiles: { teulu: ['sword'] },
      slotBands: ['foundation'],
      designNotes: 'Bestätigte historische Teulu-Schwertfolge.'
    }
  };
}

const JUNGDRACHE_TECHNIQUES = [
  jungdracheTechnique({
    number: 1,
    slug: 'erster-hieb',
    name: 'Erster Hieb des Jungdrachens',
    minimumLevel: 1,
    description: 'Der grundlegende, schnelle Schwerthieb der ersten Drachentanz-Form.',
    effect: 'Ein kurzer Ergänzungshieb verursacht bei einem Treffer den aktuellen Technikschaden.',
    activationType: 'bonus-action',
    costResources: ['bonus-action']
  }),
  jungdracheTechnique({
    number: 2,
    slug: 'drachenbiss',
    name: 'Biss des Jungdrachens',
    minimumLevel: 2,
    description: 'Der Anwender verdichtet den einfachen Hieb zu einem kurzen, präzisen Vorstoß.',
    effect: 'Bei einem Treffer verursacht die geführte Schwertwaffe den aktuellen Technikschaden.',
    activationType: 'action',
    costResources: ['action', 'reaction']
  }),
  jungdracheTechnique({
    number: 3,
    slug: 'gekreuzte-klauen',
    name: 'Gekreuzte Klauen',
    minimumLevel: 3,
    description: 'Zwei fließend verbundene Schnittlinien treffen wie die gekreuzten Klauen eines jungen Drachen.',
    effect: 'Die kurze Antwort aus der Deckung verursacht bei einem Treffer den aktuellen Technikschaden.',
    activationType: 'reaction',
    costResources: ['reaction']
  }),
  jungdracheTechnique({
    number: 4,
    slug: 'schweifkreis',
    name: 'Schweifkreis des Jungdrachens',
    minimumLevel: 4,
    description: 'Eine vollständige Drehung zieht die Klinge durch alle nahen Feinde.',
    effect: 'Alle ausgewählten Gegner im Umkreis von 3 Metern erleiden bei einem Treffer jeweils den aktuellen Technikschaden.',
    activationType: 'action',
    costResources: ['action', 'bonus-action', 'reaction'],
    range: '3 Meter Umkreis',
    target: 'Mehrere ausgewählte Gegner im Umkreis',
    requirements: 'Eine geführte Schwertwaffe und Bewegungsraum für eine Drehung.',
    areaEffect: {
      type: 'damage',
      target: 'selected',
      formula: '',
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
    effect: 'Bei einem Treffer verursacht die geführte Schwertwaffe den aktuellen Technikschaden.',
    activationType: 'action',
    costResources: ['action', 'bonus-action', 'reaction']
  }),
  jungdracheTechnique({
    number: 6,
    slug: 'sechsfacher-lehrhieb',
    name: 'Sechsfacher Lehrhieb',
    minimumLevel: 6,
    description: 'Der Anwender führt die sechs Grundlinien der Form in einem makellosen Lehrstück zusammen.',
    effect: 'Bei einem Treffer verursacht die geführte Schwertwaffe den aktuellen Technikschaden.',
    activationType: 'special-action',
    costResources: ['action', 'bonus-action', 'special-action']
  })
];

const ALL_DRAFT_TECHNIQUES = Object.freeze([
  ...CLASS_FOUNDATION_TECHNIQUES,
  ...DUELIST_TECHNIQUES,
  ...ABWARTENDER_TECHNIQUES,
  ...FLIEGENDER_TECHNIQUES,
  ARTHWYR_EARLY_ROARING_TECHNIQUE,
  ...BRUELLENDER_TECHNIQUES,
  ...AUSGEGLICHENER_TECHNIQUES,
  ...ZORNIGER_TECHNIQUES,
  ...UCHELWYR_MOUNTED_TECHNIQUES,
  ...DRACHLING_TECHNIQUES,
  ...TRAELLERNDER_TECHNIQUES,
  ...KREISCHENDER_TECHNIQUES,
  ...BARDDWYR_STANDARD_PATH_TECHNIQUES,
  ...HELWYR_EXPERT_TECHNIQUES
]);

function techniquesForForm(formId) {
  return ALL_DRAFT_TECHNIQUES.filter(technique => technique.combatStyleFormId === formId);
}

function plannedForm(number, idSuffix, name, kind, minimum, maximum, unlockRule, options = {}) {
  const formLabel = kind === 'path' ? 'Pfad' : (number ? `Form ${number}` : 'Sonderform');
  return {
    id: `drachentanz-form-${idSuffix}`,
    number: number || null,
    sequence: options.sequence || number || 8,
    name: `Drachentanz ${formLabel} · ${name}`,
    shortName: name,
    kind,
    trainingTier: options.trainingTier || (kind === 'path' ? 'Wahlpfad' : 'Duellantenform'),
    minimumLevel: minimum,
    unlockRule,
    techniqueLevelBand: { minimum, maximum },
    techniques: techniquesForForm(`drachentanz-form-${idSuffix}`)
  };
}

export const DRACHENTANZ_COMBAT_STYLE = Object.freeze({
  schemaVersion: DRACHENTANZ_REGISTRY_SCHEMA_VERSION,
  id: 'drachentanz',
  name: 'Drachentanz',
  culture: 'Cenyr',
  weaponFocus: ['sword', 'spear', 'polearm', 'bow', 'dagger', 'axe', 'mace'],
  description: 'Cenyrische Kampfkunst mit Grundform, Duellantenform und wählbaren Pfaden. Waffenführung, Attackenpool und Pfadzugang richten sich nach der Klasse.',
  progression: {
    foundation: 'Jungdrache: Ausbildung auf Stufe 1–6; erlernte Attacken bleiben danach nutzbar.',
    duelist: 'Schwertdrache: Duellantenform für erfahrene Ritter auf Stufe 7–8.',
    paths: 'Expertenpfade werden ab Stufe 9 bis 20 beim Aufstieg gewählt. Mehrere Pfade teilen sich das Ausbildungsbudget.',
    specialLevels: 'Sonderstufen nach 20 werden individuell gestaltet und erhalten hier keine Freischaltungen.'
  },
  auraProgression: {
    minimumLevel: 8, resourceId: 'aura-focus', status: 'partial',
    description: 'Aura-Ausbildung ab Stufe 6; der erste ausgebbare Aura-Fokuspunkt folgt auf Stufe 8. Aura kann weiterhin das vollständige Kostenpaket ersetzen. Reguläre Formattacken nutzen überwiegend pro Beitrag erneuerte Ressourcen; Signatur- und Meisterattacken zusätzlich Tagesvorräte.',
    combinedCosts: ['action', 'aura-focus', 'reaction', 'special-action'],
    combinedCostsAreExample: true
  },
  forms: [
    {
      id: 'drachentanz-form-i-jungdrache',
      number: 1,
      name: FORM_I_NAME,
      shortName: 'Tanz des Jungdrachens',
      kind: 'foundation',
      trainingTier: 'Grundform',
      minimumLevel: 1,
      unlockRule: 'Teulu schalten auf jeder Stufe von 1 bis 6 genau eine weitere Technik frei.',
      techniqueLevelBand: { minimum: 1, maximum: 6 },
      techniques: [...JUNGDRACHE_TECHNIQUES, ...techniquesForForm(FORM_IDS.jungdrache)]
    },
    plannedForm(2, 'ii-schwertdrache', 'Tanz des Schwertdrachens', 'duelist', 7, 8,
      'Ritterliche Duellantenform mit eigenen Klassenfolgen und einem gemeinsamen Duellantenpool.'),
    ...[
      [3, 'iii-abwartender-drache', 'Tanz des abwartenden Drachens'],
      [4, 'iv-fliegender-drache', 'Tanz des fliegenden Drachens'],
      [5, 'v-bruellender-drache', 'Tanz des brüllenden Drachens'],
      [6, 'vi-ausgeglichener-drache', 'Tanz des ausgeglichenen Drachens'],
      [7, 'vii-zorniger-drache', 'Tanz des zornigen Drachens']
    ].map(([number, suffix, name]) => plannedForm(number, suffix, name, 'path', 9, 20,
      'Beim Stufenaufstieg wählbarer Expertenpfad. Die entworfenen Attacken werden aus dem gemeinsamen Klassenbudget gelernt.')),
    plannedForm(null, 'drachling', 'Tanz des Drachlings', 'path', 6, 15,
      'Milwr-Pfad für Nicht-Ritter und Söldner: schwächer, direkter, brachialer und flexibler.', { sequence: 8, trainingTier: 'Milwr-Pfad' }),
    plannedForm(null, 'barddwyr-traellernder-drache', 'Tanz des trällernden Drachens', 'duelist', 7, 8,
      'Reguläre Rapierfortsetzung der Barddwyr anstelle des Schwertdrachens.', { sequence: 9, trainingTier: 'Barddwyr-Duellantenform' }),
    plannedForm(null, 'barddwyr-kreischender-drache', 'Tanz des kreischenden Drachens', 'path', 9, 20,
      'Eigener Barddwyr-Pfad mit Schnelligkeit, Ausweichen, Stellungswechseln und kritischen Treffern.', { sequence: 10, trainingTier: 'Barddwyr-Pfad' })
  ]
});
