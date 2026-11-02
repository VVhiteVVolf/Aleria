import {
  COMBAT_ATTRIBUTE_DEFINITIONS,
  getMaximumHitPoints,
  upgradeCharacterHitPoints,
  sanitizeCharacterCombatProfile
} from './combat-profile-model.js?v=20260928-equipment-art-v4';
import {
  CHARACTER_CREATION_TEMPLATE_SCHEMA_VERSION,
  getCharacterCreationTemplate
} from './character-creation-templates.js?v=20260909-dragon-parent-v2';
import { createCharacterLevelUpPlan, previewCharacterLevelUp } from './combat-level-up-model.js';
import { normalizeDevelopment } from '../character-development/development-state.js';
import { getSkillIdentity } from '../skill-checks/skill-definitions.js';
import { createCreationTrainingChoices, getSelectedCreationClasses, getCreationSkillSuggestions, applyCreationMagicChoice } from '../character-development/creation-training-model.js';
import { applyCenyrClassLevelProgression } from '../classes/cenyr/cenyr-class-combat-rules.js?v=20260909-dragon-parent-v2';
import { reconcileCenyrTrainingForLevel } from '../classes/cenyr/cenyr-technique-selection.js?v=20260928-equipment-art-v4';
import { getCenyrClassDefinition } from '../classes/cenyr/cenyr-class-registry.js?v=20260909-dragon-parent-v2';
import { selectCenyrTrainingOption } from '../classes/cenyr/cenyr-class-training.js?v=20260909-dragon-parent-v2';

export const CHARACTER_CREATION_METHODS = Object.freeze([
  { id: 'standard-array', label: 'Standard-Array', description: '15, 14, 13, 12, 10 und 8 frei verteilen.' },
  { id: 'point-buy', label: 'Punktekauf', description: 'Alle Werte beginnen bei 8; 27 Punkte können bis höchstens 15 verteilt werden.' },
  { id: 'rolled', label: 'Auswürfeln', description: 'Sechsmal 4W6; der jeweils niedrigste Würfel wird gestrichen.' },
  { id: 'free', label: 'Freie Verteilung', description: 'Werte ohne Punktekosten frei eintragen.' }
]);

export const CHARACTER_CREATION_STEPS = Object.freeze([
  { id: 'templates', label: 'Herkunft & Klasse' },
  { id: 'attributes', label: 'Attribute' },
  { id: 'skills', label: 'Fertigkeiten' },
  { id: 'equipment', label: 'Kampfausbildung' },
  { id: 'development', label: 'Attacken & Traits' },
  { id: 'resources', label: 'Werte & Vorräte' },
  { id: 'review', label: 'Prüfen & übernehmen' }
]);

export const STANDARD_ATTRIBUTE_ARRAY = Object.freeze([15, 14, 13, 12, 10, 8]);
export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_COSTS = Object.freeze({ 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 });

const ATTRIBUTE_KEYS = COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute => attribute.key);
const DEFAULT_STANDARD_ASSIGNMENT = Object.freeze({
  strength: 15,
  dexterity: 10,
  constitution: 14,
  intelligence: 8,
  wisdom: 12,
  charisma: 13
});

const SKILL_ALIASES = Object.freeze({
  überzeugen: ['überzeugen', 'ueberzeugen', 'überreden', 'ueberreden'],
  körperbeherrschung: ['körperbeherrschung', 'koerperbeherrschung']
});

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function normalizeLookup(value = '') {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function acceptedSkillNames(name = '') {
  const normalized = normalizeLookup(name);
  const aliasEntry = Object.entries(SKILL_ALIASES).find(([canonical, aliases]) => (
    normalizeLookup(canonical) === normalized || aliases.map(normalizeLookup).includes(normalized)
  ));
  return new Set((aliasEntry?.[1] || [name]).map(normalizeLookup));
}

function inferTemplateId(kind, label = '') {
  const normalized = normalizeLookup(label);
  if (!normalized) return '';
  const candidates = ['cenyr', 'alben', 'aldrimarer', 'nordmann', 'ritter', 'teulu', 'cantref', 'helwyr', 'uchelwyr', 'arthwyr', 'barddwyr', 'morwyr', 'rhyfelwyr', 'ceidwynr', 'rhiddwyrr', 'derwyn'];
  return candidates.find(id => {
    const template = getCharacterCreationTemplate(kind, id);
    return template && [template.label, ...(template.aliases || [])].some(candidate => normalizeLookup(candidate) === normalized);
  }) || '';
}

function attributeMap(profile = {}) {
  return Object.fromEntries(ATTRIBUTE_KEYS.map(key => [
    key,
    Number(profile.attributes?.find(attribute => attribute.key === key)?.score) || 10
  ]));
}

function initialFreeAttributes(profile, ancestryId) {
  const values = attributeMap(profile);
  const appliedAncestry = profile.templateSelections?.ancestryId === ancestryId
    ? getCharacterCreationTemplate('ancestry', ancestryId)
    : null;
  Object.entries(appliedAncestry?.attributeBonuses || {}).forEach(([key, bonus]) => {
    values[key] = Math.max(1, values[key] - Number(bonus || 0));
  });
  return values;
}

export function rollFourDropLowest(random = Math.random) {
  const dice = Array.from({ length: 4 }, () => Math.max(1, Math.min(6, Math.floor(random() * 6) + 1)));
  const droppedIndex = dice.reduce((lowest, value, index) => value < dice[lowest] ? index : lowest, 0);
  return {
    dice,
    droppedIndex,
    total: dice.reduce((total, value, index) => total + (index === droppedIndex ? 0 : value), 0)
  };
}

export function rollAttributeSet(random = Math.random) {
  return Array.from({ length: 6 }, (_entry, index) => ({ id: `roll-${index + 1}`, ...rollFourDropLowest(random) }));
}

export function getPointBuySpent(attributes = {}) {
  return ATTRIBUTE_KEYS.reduce((total, key) => total + (POINT_BUY_COSTS[Number(attributes[key])] ?? POINT_BUY_BUDGET + 1), 0);
}

export function getPointBuyRemaining(attributes = {}) {
  return POINT_BUY_BUDGET - getPointBuySpent(attributes);
}

export function getCreationBaseAttributes(draft = {}) {
  if (draft.attributeMethod === 'rolled') {
    const pools = new Map((draft.rolledPools || []).map(pool => [pool.id, pool]));
    return Object.fromEntries(ATTRIBUTE_KEYS.map(key => [key, Number(pools.get(draft.rolledAssignments?.[key])?.total) || 3]));
  }
  return Object.fromEntries(ATTRIBUTE_KEYS.map(key => [key, Number(draft.baseAttributes?.[key]) || 8]));
}

export function getCreationFinalAttributes(draft = {}) {
  const result = getCreationBaseAttributes(draft);
  if ((draft.skippedSteps || []).includes('templates')) return result;
  const ancestry = getCharacterCreationTemplate('ancestry', draft.selections?.ancestryId);
  Object.entries(ancestry?.attributeBonuses || {}).forEach(([key, bonus]) => {
    result[key] = Math.max(1, Math.min(40, (Number(result[key]) || 0) + Number(bonus || 0)));
  });
  return result;
}

export function setCreationAttributeMethod(draft, method) {
  const next = clone(draft);
  const selected = CHARACTER_CREATION_METHODS.some(entry => entry.id === method) ? method : 'standard-array';
  next.attributeMethod = selected;
  if (selected === 'standard-array') next.baseAttributes = { ...DEFAULT_STANDARD_ASSIGNMENT };
  if (selected === 'point-buy') next.baseAttributes = Object.fromEntries(ATTRIBUTE_KEYS.map(key => [key, 8]));
  if (selected === 'free') next.baseAttributes = { ...next.freeAttributes };
  if (selected === 'rolled' && !(next.rolledPools || []).length) {
    next.rolledPools = rollAttributeSet();
    next.rolledAssignments = Object.fromEntries(ATTRIBUTE_KEYS.map((key, index) => [key, next.rolledPools[index].id]));
  }
  return next;
}

export function createCharacterCreationDraft(profileValue = {}, options = {}) {
  const profile = sanitizeCharacterCombatProfile(profileValue);
  const ancestryId = profile.templateSelections.ancestryId || inferTemplateId('ancestry', profile.identity.ancestry);
  const backgroundId = profile.templateSelections.backgroundId || inferTemplateId('background', profile.identity.background);
  const classId = profile.templateSelections.classId || inferTemplateId('class', profile.identity.archetype);
  const freeAttributes = initialFreeAttributes(profile, ancestryId);
  const existingBuild=Boolean(classId||ancestryId||backgroundId||profile.progression.level>1||profile.progression.specialLevels
    ||profile.progression.experience||profile.hitPoints.current!=null||profile.quirks.length||profile.techniques.length
    ||profile.attributes.some(attribute=>attribute.score!==10));
  const resetLevelOne=options.resetLevelOne ?? !existingBuild;
  const method = CHARACTER_CREATION_METHODS.some(entry => entry.id === profile.templateSelections.attributeMethod)
    ? profile.templateSelections.attributeMethod
    : existingBuild ? 'free' : 'standard-array';
  const draft = {
    characterName: String(options.characterName || '').trim(),
    stepIndex: 0,
    skippedSteps: [],
    selections: { ancestryId, backgroundId, classId },
    foundationFormId: profile.classTraining.selections.find(selection => selection.kind === 'foundation')?.selectionId || '',
    attributeMethod: method,
    baseAttributes: method === 'free' ? { ...freeAttributes } : { ...DEFAULT_STANDARD_ASSIGNMENT },
    freeAttributes,
    rolledPools: [],
    rolledAssignments: {},
    skillOverrides: {},
    resetLevelOne,
    developmentPlan: { ...createCharacterLevelUpPlan(profile), targetLevel: resetLevelOne ? 1 : profile.progression.level+profile.progression.specialLevels,
      experience:resetLevelOne?0:profile.progression.experience },
    ...createCreationTrainingChoices(profile,existingBuild)
  };
  return setCreationAttributeMethod(draft, method);
}

export function getTemplateGrantedSkills(draft = {}) {
  return getCreationSkillSuggestions(draft).map(skill=>skill.name);
}

function applySkillTraining(profile, choices = {}) {
  return profile.skills.map(skill=>{
    const selected=choices[getSkillIdentity(skill.name)];
    return {...skill,proficiency:['none','trained','expertise'].includes(selected)?selected:skill.proficiency};
  });
}

function mergeItems(existing = [], incoming = [], prefixesToReplace = []) {
  const retained = (Array.isArray(existing) ? existing : []).filter(item => (
    !prefixesToReplace.some(prefix => String(item?.id || '').startsWith(prefix))
  ));
  const byId = new Map(retained.map(item => [item.id, clone(item)]));
  (incoming || []).forEach(item => byId.set(item.id, clone(item)));
  return [...byId.values()];
}

function templateTraits(ancestry, background) {
  const entries = [];
  (ancestry?.culturalTraits || []).forEach((name, index) => entries.push({
    id: `starter-ancestry-${ancestry.id}-trait-${index + 1}`,
    name,
    type: 'trait',
    description: ancestry.description,
    appliesWhen: 'Dauerhafte kulturelle Prägung',
    target: 'self',
    active: true,
    tags: `Volk · ${ancestry.label}`
  }));
  (background?.traits || []).forEach((name, index) => entries.push({
    id: `starter-background-${background.id}-trait-${index + 1}`,
    name,
    type: 'trait',
    description: background.description,
    appliesWhen: 'Wenn Herkunft, Stand oder Ausbildung relevant sind',
    target: 'self',
    active: true,
    tags: `Hintergrund · ${background.label}`
  }));
  return entries;
}

function resetLevelOneResources(resources = []) {
  const fixed = {
    action: [1, 1],
    'bonus-action': [1, 1],
    reaction: [1, 1],
    'special-action': [2, 2],
    'aura-focus': [0, 0],
    'mana-focus': [0, 0],
    focus: [0, 0],
    'pact-points': [0, 0],
    'celestial-points': [0, 0],
    'infernal-points': [0, 0],
    inspiration: [0, 1]
  };
  return resources.map(resource => {
    if (/^spell-slot-(10|[1-9])$/.test(resource.id)) return { ...resource, current: 0, maximum: 0 };
    const values = fixed[resource.id];
    return values ? { ...resource, current: values[0], maximum: values[1] } : resource;
  });
}

export function getCreationFoundationOptions(draft = {}) {
  return getCenyrClassDefinition(draft.selections?.classId)?.foundationSelection?.options || [];
}

export function validateCharacterCreationDraft(draft = {}) {
  const errors = [];
  if(!(draft.skippedSteps||[]).includes('equipment')){
    if((draft.includeCustomClass||draft.selections?.classId==='custom')&&!draft.customClass?.name?.trim())errors.push('Gib der eigenen Ausbildung einen Namen.');
    if(getSelectedCreationClasses(draft).length>20)errors.push('Es können höchstens 20 Klassen oder Ausbildungen gespeichert werden.');
  }
  const foundationOptions = getCreationFoundationOptions(draft);
  if (!(draft.skippedSteps || []).includes('equipment') && foundationOptions.length
    && !foundationOptions.some(option => option.formId === draft.foundationFormId)) {
    errors.push('Wähle die Grundausbildung des Derwyn: Tanz des Jungdrachen oder Tanz der jungen Welle.');
  }
  if (!(draft.skippedSteps || []).includes('attributes')) {
    const base = getCreationBaseAttributes(draft);
    if (draft.attributeMethod === 'standard-array') {
      const assigned = Object.values(base).sort((a, b) => b - a);
      if (assigned.join(',') !== [...STANDARD_ATTRIBUTE_ARRAY].sort((a, b) => b - a).join(',')) {
        errors.push('Das Standard-Array muss jeden Wert genau einmal verwenden.');
      }
    }
    if (draft.attributeMethod === 'point-buy' && getPointBuyRemaining(base) < 0) {
      errors.push('Der Punktekauf überschreitet das Budget von 27 Punkten.');
    }
    if (draft.attributeMethod === 'rolled' && new Set(Object.values(draft.rolledAssignments || {})).size !== 6) {
      errors.push('Jedes ausgewürfelte Ergebnis muss genau einem Attribut zugeordnet sein.');
    }
  }
  return errors;
}

function buildCreationBaseProfile(profileValue, draft, options) {
  let profile = sanitizeCharacterCombatProfile(profileValue);
  // Set the mode before any class reconciliation can grant starter techniques.
  profile.progression.development = normalizeDevelopment(profile.progression.development);
  const skipped = new Set(draft.skippedSteps || []);
  const ancestry = getCharacterCreationTemplate('ancestry', draft.selections?.ancestryId);
  const background = getCharacterCreationTemplate('background', draft.selections?.backgroundId);
  const classes=getSelectedCreationClasses(draft);
  const classTemplate = classes.find(template=>template.id===draft.selections?.classId);

  if (!skipped.has('templates')) {
    profile.identity = {
      ancestry: ancestry?.label || profile.identity.ancestry,
      background: background?.label || profile.identity.background,
      archetype: profile.identity.archetype
    };
    profile.templateSelections = {
      ...profile.templateSelections,
      schemaVersion: CHARACTER_CREATION_TEMPLATE_SCHEMA_VERSION,
      ancestryId: ancestry?.id || '',
      backgroundId: background?.id || '',
      classId: profile.templateSelections.classId,
      attributeMethod: draft.attributeMethod,
      appliedAt: String(options.now || new Date().toISOString())
    };
    profile.quirks = mergeItems(
      profile.quirks,
      templateTraits(ancestry, background),
      ['starter-ancestry-', 'starter-background-']
    );
  }

  if (!skipped.has('attributes')) {
    const finalAttributes = getCreationFinalAttributes(draft);
    profile.attributes = profile.attributes.map(attribute => ({
      ...attribute,
      score: finalAttributes[attribute.key],
      modifierOverride: null
    }));
    profile.templateSelections.attributeMethod = draft.attributeMethod;
  }

  if (!skipped.has('skills')) {
    profile.skills = applySkillTraining(profile, draft.skillChoices);
  }

  if (!skipped.has('equipment')) {
    const training=draft.trainingChoices||{};
    const {classIds:oldClasses,customClass:oldCustom,...selection}=profile.templateSelections;
    const classIds=classes.map(template=>template.id),primary=draft.selections?.classId||classIds[0]||'';
    profile.templateSelections={...selection,classId:primary,...(classIds.length>1?{classIds}:{}),
      ...(classIds.includes('custom')?{customClass:draft.customClass}:{})};
    if(classes.length)profile.identity.archetype=classes.map(template=>template.label).join(' / ');
    profile.hitPoints.hitDie = training.hitDieOverride || classTemplate?.hitDie || profile.hitPoints.hitDie;
    profile.savingThrows = profile.savingThrows.map(save => ({
      ...save,
      proficient:training.savingThrows?training.savingThrows.includes(save.attributeKey):save.proficient,
      expertise:training.savingThrows&&!training.savingThrows.includes(save.attributeKey)?false:save.expertise
    }));
    if(training.proficiencies)profile.proficiencies={...profile.proficiencies,...clone(training.proficiencies)};
    // Class choices provide training and core values. Equipment is authored per
    // character, never granted, replaced or unequipped by this assistant.
    applyCreationMagicChoice(profile,draft,classTemplate);
  }

  profile = sanitizeCharacterCombatProfile(profile);
  if (!skipped.has('resources') && draft.resetLevelOne !== false) {
    profile.progression = {
      ...profile.progression,
      level: 1,
      specialLevels: 0,
      experience: 0,
      nextLevelExperience: profile.progression.nextLevelExperience,
      proficiencyBonusOverride: null
    };
    profile.resources = resetLevelOneResources(profile.resources);
    profile.hitPoints.current = null;
    profile.hitPoints.temporary = 0;
    profile.hitPoints.maximumOverride = null;
    profile = upgradeCharacterHitPoints(profile);
    profile.hitPoints.vitality.overrideAnchor = null;
    profile.hitPoints.current = getMaximumHitPoints(profile);
  }

  profile = applyCenyrClassLevelProgression(profile, profile.progression.level).profile;
  if (!skipped.has('equipment') && getCreationFoundationOptions(draft).some(option => option.formId === draft.foundationFormId)) {
    const foundation = selectCenyrTrainingOption(profile, { kind: 'foundation', selectionId: draft.foundationFormId, selectedAtLevel: 1 });
    if (foundation.ok) profile = foundation.profile;
  }
  profile = reconcileCenyrTrainingForLevel(profile, profile.progression.level, { autoFill: true }).profile;
  return sanitizeCharacterCombatProfile(profile);
}

export function previewCharacterCreationDraft(profileValue = {}, draft = {}, options = {}) {
  const baseProfile = buildCreationBaseProfile(profileValue, draft, options);
  const plan = {
    ...createCharacterLevelUpPlan(baseProfile), targetLevel: 1, ...draft.developmentPlan
  };
  if ((draft.skippedSteps || []).includes('development')) {
    const unchanged = createCharacterLevelUpPlan(baseProfile);
    Object.assign(plan, { targetLevel: baseProfile.progression.level + baseProfile.progression.specialLevels,
      purchaseIds: [], traitIds: unchanged.traitIds, development: unchanged.development, attributeIncreases: {} });
  }
  if ((draft.skippedSteps || []).includes('resources')) plan.resourceIncreases = {};
  const development = previewCharacterLevelUp(baseProfile, plan);
  const errors = [...new Set([...validateCharacterCreationDraft(draft), ...development.errors])];
  return { ...development, baseProfile, ready: errors.length === 0, errors };
}

export function applyCharacterCreationDraft(profileValue = {}, draft = {}, options = {}) {
  const preview = previewCharacterCreationDraft(profileValue, draft, options);
  return {
    ok: preview.ready,
    errors: preview.errors,
    profile: preview.ready ? preview.profile : sanitizeCharacterCombatProfile(profileValue)
  };
}

export const characterCreationInternals = Object.freeze({
  ATTRIBUTE_KEYS,
  DEFAULT_STANDARD_ASSIGNMENT,
  acceptedSkillNames,
  inferTemplateId,
  resetLevelOneResources
});
