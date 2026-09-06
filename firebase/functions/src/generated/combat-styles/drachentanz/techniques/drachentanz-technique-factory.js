import { DRACHENTANZ_FORM_NAMES } from '../drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import { createDrachentanzDamageProfile } from '../drachentanz-damage-progression.js?v=20260905-damage-balance-v1';

const RESOURCE_NAMES = Object.freeze({
  action: 'Aktion',
  'bonus-action': 'Bonusaktion',
  reaction: 'Reaktion',
  'special-action': 'Besondere Aktion',
  'aura-focus': 'Aura-Fokuspunkt'
});

const DEFAULT_WEAPON_TYPES = Object.freeze(['sword', 'spear', 'polearm', 'bow', 'dagger', 'axe', 'mace']);

function normalizedCost(value) {
  if (typeof value === 'string') return { resourceId: value, amount: 1 };
  return { resourceId: String(value?.resourceId || ''), amount: Math.max(1, Math.trunc(Number(value?.amount) || 1)) };
}

export function techniqueCost(techniqueId, value, index = 0) {
  const cost = normalizedCost(value);
  return {
    id: `${techniqueId}-${cost.resourceId}-${index + 1}`,
    resourceId: cost.resourceId,
    name: RESOURCE_NAMES[cost.resourceId] || cost.resourceId,
    amount: cost.amount,
    scope: ['action', 'bonus-action', 'reaction'].includes(cost.resourceId) ? 'comment' : 'persistent'
  };
}

export function weaponDamageEffect(id, options = {}) {
  return {
    id: `${id}-weapon-damage`,
    type: 'damage',
    target: options.target || 'target',
    formula: '',
    damageType: '',
    inheritWeaponDamageType: true,
    magical: options.magical === true,
    on: options.on || 'hit',
    notes: options.notes || 'Verwendet die zur Laufzeit berechnete Schadensformel der Technik.'
  };
}

export function temporaryCondition(id, name, description, mechanics = {}, options = {}) {
  const target = options.target || 'target';
  const comments = Math.max(1, Math.min(9, Number(options.comments) || 1));
  return {
    id: `${id}-${options.slug || 'condition'}`,
    type: options.type || (target === 'self' ? 'buff' : 'debuff'),
    target,
    on: options.on || 'hit',
    condition: {
      id: `${id}-${options.slug || 'condition'}`,
      name,
      description,
      duration: options.duration || `${comments} eigener Beitrag`,
      durationModel: { kind: 'actor-comments', remainingActorComments: comments },
      tags: options.tags || 'Drachentanz',
      mechanics
    },
    notes: description
  };
}

export function secondarySave(id, name, description, mechanics = {}, options = {}) {
  return {
    enabled: true,
    attributeKey: options.attributeKey || 'strength',
    dcBase: Number(options.dcBase) || 8,
    dcAttributeKey: options.dcAttributeKey || 'strength',
    addProficiency: options.addProficiency !== false,
    failureCondition: {
      id: `${id}-${options.slug || 'failed-save'}`,
      name,
      duration: options.duration || '1 eigener Beitrag',
      description,
      tags: options.tags || 'Drachentanz',
      mechanics
    }
  };
}

export function movementEffect(id, meters, kind = 'move', target = 'self', notes = '') {
  return {
    id: `${id}-${kind}-movement`,
    type: 'move',
    target,
    on: 'hit',
    movementMeters: meters,
    movementKind: kind,
    notes
  };
}

export function createDrachentanzTechnique(spec) {
  const id = `combat-style-drachentanz-${spec.slug}`;
  const formName = DRACHENTANZ_FORM_NAMES[spec.formId] || spec.formName || 'Drachentanz';
  const effects = spec.noPrimaryDamage
    ? [...(spec.effects || [])]
    : [weaponDamageEffect(id, { target: spec.damageTarget, magical: spec.magical }), ...(spec.effects || [])];
  const costs = (spec.costs?.length ? spec.costs : [spec.activationType || 'action'])
    .map((cost, index) => techniqueCost(id, cost, index));
  return {
    id,
    name: spec.name,
    trainingForm: `Drachentanz · ${formName}`,
    combatStyleId: 'drachentanz',
    combatStyleFormId: spec.formId,
    minimumLevel: spec.minimumLevel,
    category: spec.category || 'technique',
    status: spec.status || 'draft',
    description: spec.description,
    effect: spec.effect,
    activationType: ['action', 'reaction', 'bonus-action'].find(id => costs.some(cost => cost.resourceId === id)) || spec.activationType || 'action',
    weaponTypes: spec.weaponTypes || DEFAULT_WEAPON_TYPES,
    compatibleWeaponIds: [],
    ...createDrachentanzDamageProfile(spec, costs),
    damageType: '',
    attackBonus: Number(spec.attackBonus) || 0,
    damageBonus: Number(spec.damageBonus) || 0,
    targetDefenseModifier: Number(spec.targetDefenseModifier) || 0,
    rollMode: spec.rollMode || 'normal',
    criticalThreshold: Number(spec.criticalThreshold) || 20,
    maximumTargets: Math.max(1, Math.min(20, Number(spec.maximumTargets) || 1)),
    range: spec.range || 'Waffenreichweite',
    target: spec.target || 'Ein Gegner',
    duration: spec.duration || 'Sofort',
    requirements: spec.requirements || 'Eine zur Klassenfolge passende, geführte Waffe.',
    tags: ['Drachentanz', formName, spec.tier || 'Attackenentwurf', ...(spec.tags || [])].join(' · '),
    aiInstructions: spec.aiInstructions || `${spec.effect} Zusätzliche erzählerische Folgen dürfen die festgelegte Mechanik nicht erweitern.`,
    mechanicNotes: spec.mechanicNotes || [],
    effects,
    costs,
    auraBypass: {
      allowed: spec.auraBypassAllowed ?? true,
      resourceId: 'aura-focus',
      cost: Math.max(1, Number(spec.auraBypassCost) || costs.filter(cost => cost.resourceId === 'aura-focus').reduce((sum, cost) => sum + cost.amount, 0))
    },
    active: true,
    mechanics: spec.mechanics || {},
    triggerRules: spec.triggerRules || [],
    secondarySave: spec.secondarySave || { enabled: false },
    followUpAttack: spec.followUpAttack || { enabled: false },
    cenyrTraining: {
      branchId: spec.branchId || '',
      weaponRuleSetId: spec.weaponRuleSetId || '',
      uchelwyrCompatible: spec.uchelwyrCompatible === true,
      requiresMounted: spec.requiresMounted === true,
      allowedClassIds: spec.allowedClassIds || [],
      classWeaponProfiles: spec.classWeaponProfiles || {},
      slotBands: spec.slotBands || [],
      designNotes: spec.designNotes || ''
    }
  };
}

export const drachentanzTechniqueFactoryInternals = Object.freeze({ RESOURCE_NAMES, DEFAULT_WEAPON_TYPES, normalizedCost });
