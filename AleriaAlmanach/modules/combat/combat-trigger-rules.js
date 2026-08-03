import { normalizeCombatResourceCosts } from './combat-action-economy.js?v=20260803-economy-audit-v1';

const RULE_PHASES = new Set(['pre-roll', 'post-roll', 'post-hit', 'pre-damage']);
const RULE_RECIPIENTS = new Set(['actor', 'target']);
const RULE_RELATIONS = new Set(['self', 'ally', 'enemy', 'any']);
const RULE_ACTIVATIONS = new Set(['passive', 'reaction']);
const RULE_FREQUENCIES = new Set(['always', 'comment', 'scene', 'day']);
const RULE_CONDITIONS = new Set(['always', 'would-hit', 'would-miss', 'critical-hit', 'critical-failure']);
const RULE_OUTCOMES = new Set([
  'none', 'force-hit', 'force-miss', 'force-critical-hit',
  'force-save-success', 'force-save-failure', 'force-skill-success', 'force-skill-failure'
]);
const ROLL_MODES = new Set(['normal', 'advantage', 'disadvantage']);
const ACTION_KINDS = new Set(['weapon', 'technique', 'ability', 'spell', 'prayer', 'song', 'skill']);
const ACTION_SCOPES = new Set(['entry', 'global']);
const ACTION_RESOURCE_IDS = new Set(['action', 'bonus-action', 'reaction', 'special-action']);

function text(value, maximum = 160) {
  return String(value || '').trim().slice(0, maximum);
}

function number(value, fallback = 0, minimum = -999, maximum = 999) {
  if (value === '' || value == null) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

function optionalNumber(value, minimum = 0, maximum = 9999) {
  if (value === '' || value == null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(minimum, Math.min(maximum, parsed));
}

function boolean(value, fallback = false) {
  if (value == null) return fallback;
  if (typeof value === 'string') return ['true', '1', 'on'].includes(value);
  return Boolean(value);
}

function normalizedList(value, maximum = 20) {
  const source = Array.isArray(value) ? value : String(value || '').split(',');
  return [...new Set(source
    .map(item => text(item, 120).toLocaleLowerCase('de'))
    .filter(Boolean))].slice(0, maximum);
}

function tagKey(value) {
  return text(value, 160)
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function collectProfileTags(profile = {}) {
  const values = [];
  ['quirks', 'conditions', 'abilities'].forEach(collection => {
    (Array.isArray(profile?.[collection]) ? profile[collection] : []).forEach(entry => {
      if (entry?.active === false) return;
      values.push(entry?.name);
      values.push(...String(entry?.tags || '').split(/[,;·]/));
    });
  });
  return new Set(values.map(tagKey).filter(Boolean));
}

export function sanitizeCombatRuleEffects(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const rollMode = text(source.rollMode || source.attackRollMode, 24);
  const outcome = text(source.outcome, 40);
  return {
    attackModifier: number(source.attackModifier ?? source.attack, 0, -99, 99),
    defenseModifier: number(source.defenseModifier ?? source.armorClass, 0, -99, 99),
    savingThrowModifier: number(source.savingThrowModifier ?? source.savingThrow, 0, -99, 99),
    spellSaveDcModifier: number(source.spellSaveDcModifier ?? source.spellSaveDc, 0, -99, 99),
    skillModifier: number(source.skillModifier ?? source.skill, 0, -99, 99),
    damageModifier: number(source.damageModifier ?? source.damage, 0, -999, 999),
    damageReduction: number(source.damageReduction, 0, 0, 9999),
    rollMode: ROLL_MODES.has(rollMode) ? rollMode : 'normal',
    outcome: RULE_OUTCOMES.has(outcome) ? outcome : 'none'
  };
}

export function sanitizeCombatTriggerRule(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const phase = text(source.phase, 30);
  const recipient = text(source.recipient, 30);
  const sourceRelation = text(source.sourceRelation || source.relation, 30);
  const activation = text(source.activation, 30);
  const frequency = text(source.frequency || source.firstPer, 30);
  const condition = text(source.condition || source.when, 40);
  const actionScope = text(source.actionScope, 30);
  const actionKinds = (Array.isArray(source.actionKinds) ? source.actionKinds : String(source.actionKinds || '').split(','))
    .map(value => text(value, 30))
    .filter(value => ACTION_KINDS.has(value));
  return {
    id: text(source.id, 120) || `combat-rule-${index + 1}`,
    name: text(source.name, 140),
    enabled: boolean(source.enabled, true),
    phase: RULE_PHASES.has(phase) ? phase : 'post-roll',
    recipient: RULE_RECIPIENTS.has(recipient) ? recipient : 'actor',
    sourceRelation: RULE_RELATIONS.has(sourceRelation) ? sourceRelation : 'self',
    activation: RULE_ACTIVATIONS.has(activation) ? activation : 'passive',
    frequency: RULE_FREQUENCIES.has(frequency) ? frequency : 'always',
    condition: RULE_CONDITIONS.has(condition) ? condition : 'always',
    actionScope: ACTION_SCOPES.has(actionScope) ? actionScope : '',
    consumeReaction: boolean(source.consumeReaction, true),
    costs: normalizeCombatResourceCosts(source.costs),
    actionKinds: [...new Set(actionKinds)].slice(0, 12),
    skillIds: normalizedList(source.skillIds),
    requiredTargetTags: normalizedList(source.requiredTargetTags),
    radiusMeters: optionalNumber(source.radiusMeters, 0, 9999),
    priority: number(source.priority, 0, -99, 99),
    description: text(source.description, 1000),
    effects: sanitizeCombatRuleEffects(source.effects)
  };
}

function normalizeRules(value) {
  const rules = Array.isArray(value?.triggerRules)
    ? value.triggerRules
    : (value?.triggerRule ? [value.triggerRule] : []);
  return rules.slice(0, 20).map(sanitizeCombatTriggerRule);
}

export function sanitizeCombatTriggerRules(value) {
  return normalizeRules({ triggerRules: value });
}

function entryCollections(profile = {}) {
  return [
    ['quirk', profile.quirks],
    ['condition', profile.conditions],
    ['ability', profile.abilities],
    ['technique', profile.techniques]
  ];
}

function getEntryProfileActionId(entryKind, entry = {}) {
  const entryId = text(entry?.id, 120);
  if (!entryId) return '';
  if (entryKind === 'technique') return `technique:${entryId}`;
  if (entryKind === 'ability' && entry?.combatUsable === true) return `ability:${entryId}`;
  return '';
}

function getReactionCosts(rule, entryCosts = []) {
  if (rule.activation !== 'reaction') return [];
  const explicit = normalizeCombatResourceCosts(rule.costs);
  const inherited = normalizeCombatResourceCosts(entryCosts);
  let costs = explicit.length
    ? explicit
    : inherited.filter(cost => !ACTION_RESOURCE_IDS.has(cost.resourceId) || cost.resourceId === 'reaction');
  if (rule.consumeReaction === false) return costs.filter(cost => cost.resourceId !== 'reaction');
  if (!costs.some(cost => cost.resourceId === 'reaction')) {
    costs = costs.concat({
      id: `reaction-${rule.id}`,
      resourceId: 'reaction',
      name: 'Reaktion',
      amount: 1,
      scope: 'comment'
    });
  }
  return normalizeCombatResourceCosts(costs);
}

export function collectCombatTriggerRules(profile = {}) {
  const result = [];
  entryCollections(profile).forEach(([entryKind, entries]) => {
    (Array.isArray(entries) ? entries : []).forEach((entry, entryIndex) => {
      if (entry?.active === false) return;
      normalizeRules(entry).forEach((rule, ruleIndex) => {
        if (!rule.enabled) return;
        const entryId = text(entry?.id, 120) || `${entryKind}-${entryIndex + 1}`;
        const entryActionId = getEntryProfileActionId(entryKind, entry);
        const actionScope = rule.actionScope || (entryActionId ? 'entry' : 'global');
        result.push({
          ...rule,
          entryKind,
          entryId,
          entryName: text(entry?.name, 140) || rule.name || 'Unbenannte Regel',
          actionScope,
          requiredActionId: actionScope === 'entry' ? entryActionId : '',
          ruleIndex,
          costs: getReactionCosts(rule, entry?.costs),
          abilityUsesCurrent: entryKind === 'ability' ? number(entry?.usesCurrent, 0, 0, 999) : null,
          abilityUsesMaximum: entryKind === 'ability' ? number(entry?.usesMaximum, 0, 0, 999) : null
        });
      });
    });
  });
  return result.sort((first, second) => first.priority - second.priority || first.entryName.localeCompare(second.entryName, 'de'));
}

function relationAllows(rule, source = {}) {
  const relation = rule.recipient === 'actor' ? source.relationToActor : source.relationToTarget;
  return ['self', 'ally', 'enemy'].includes(relation)
    && (rule.sourceRelation === 'any' || rule.sourceRelation === relation);
}

function distanceAllows(rule, source = {}) {
  if (rule.radiusMeters == null) return true;
  const value = rule.recipient === 'actor' ? source.distanceToActor : source.distanceToTarget;
  return Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= rule.radiusMeters;
}

function conditionAllows(rule, state = {}) {
  if (rule.condition === 'would-hit') return state.hit === true;
  if (rule.condition === 'would-miss') return state.hit === false;
  if (rule.condition === 'critical-hit') return state.criticalSuccess === true;
  if (rule.condition === 'critical-failure') return state.criticalFailure === true;
  return true;
}

function actionAllows(rule, actionKind, profileActionId = '', state = {}) {
  if (rule.actionKinds.length && !rule.actionKinds.includes(actionKind)) return false;
  if (rule.skillIds.length && (actionKind !== 'skill' || !rule.skillIds.includes(String(state.skillId || '').toLocaleLowerCase('de')))) return false;
  if (rule.actionScope === 'entry' && !rule.requiredActionId) return false;
  return !rule.requiredActionId || rule.requiredActionId === String(profileActionId || '');
}

function targetTagsAllow(rule, state = {}) {
  if (!rule.requiredTargetTags.length) return true;
  const available = state.targetTags instanceof Set
    ? new Set([...state.targetTags].map(tagKey).filter(Boolean))
    : collectProfileTags(state.targetProfile || {});
  return rule.requiredTargetTags.every(required => available.has(tagKey(required)));
}

export function getCombatRuleApplicationKey(source = {}, rule = {}) {
  return [source.actorId, rule.entryKind, rule.entryId, rule.id].map(value => text(value, 160)).join(':');
}

function frequencyKey(source, rule, periods = {}) {
  if (rule.frequency === 'always') return '';
  const period = text(periods[rule.frequency], 240);
  return `${getCombatRuleApplicationKey(source, rule)}@${rule.frequency}:${period}`;
}

function usedInPeriod(source, rule, context = {}) {
  const key = frequencyKey(source, rule, context.periods);
  if (!key) return false;
  return context.usedFrequencyKeys?.has(key) || false;
}

function selectedRule(source, rule) {
  const selected = new Set(Array.isArray(source.selectedRuleIds) ? source.selectedRuleIds.map(String) : []);
  return selected.has(String(rule.id)) || selected.has(`${rule.entryKind}:${rule.entryId}:${rule.id}`);
}

export function collectApplicableCombatRules({
  phase,
  actionKind = 'weapon',
  profileActionId = '',
  state = {},
  sources = [],
  periods = {},
  usedFrequencyKeys = new Set()
} = {}) {
  const context = { periods, usedFrequencyKeys };
  const applications = [];
  sources.forEach(source => {
    collectCombatTriggerRules(source.profile).forEach(rule => {
      if (rule.phase !== phase || !actionAllows(rule, actionKind, profileActionId, state) || !targetTagsAllow(rule, state)) return;
      if (!relationAllows(rule, source) || !distanceAllows(rule, source) || !conditionAllows(rule, state)) return;
      if (rule.activation === 'reaction' && !selectedRule(source, rule)) return;
      if (rule.activation === 'passive' && source.passiveRulesAllowed === false) return;
      if (usedInPeriod(source, rule, context)) return;
      const applicationKey = getCombatRuleApplicationKey(source, rule);
      const usedKey = frequencyKey(source, rule, periods);
      applications.push({
        applicationKey,
        usedKey,
        sourceActorId: text(source.actorId, 160),
        sourceActorName: text(source.actorName, 160),
        sourceRole: text(source.sourceRole, 40),
        relationToActor: text(source.relationToActor, 20),
        relationToTarget: text(source.relationToTarget, 20),
        entryKind: rule.entryKind,
        entryId: rule.entryId,
        entryName: rule.entryName,
        ruleId: rule.id,
        ruleName: rule.name || rule.entryName,
        phase: rule.phase,
        activation: rule.activation,
        frequency: rule.frequency,
        condition: rule.condition,
        recipient: rule.recipient,
        sourceRelation: rule.sourceRelation,
        priority: rule.priority,
        effects: { ...rule.effects },
        costs: rule.activation === 'reaction' ? rule.costs.map(cost => ({ ...cost })) : [],
        consumesAbilityUse: rule.activation === 'reaction' && rule.entryKind === 'ability' && rule.abilityUsesMaximum > 0
      });
    });
  });
  return applications.sort((first, second) => first.priority - second.priority || first.ruleName.localeCompare(second.ruleName, 'de'));
}

export function mergeCombatRuleEffects(applications = []) {
  const effects = sanitizeCombatRuleEffects();
  const rollModes = [];
  let outcome = 'none';
  applications.forEach(application => {
    const current = sanitizeCombatRuleEffects(application.effects);
    Object.keys(effects).forEach(key => {
      if (['rollMode', 'outcome'].includes(key)) return;
      effects[key] += Number(current[key] || 0);
    });
    if (current.rollMode !== 'normal') rollModes.push(current.rollMode);
    if (current.outcome !== 'none') outcome = current.outcome;
  });
  const advantage = rollModes.includes('advantage');
  const disadvantage = rollModes.includes('disadvantage');
  effects.rollMode = advantage === disadvantage ? 'normal' : (advantage ? 'advantage' : 'disadvantage');
  effects.outcome = outcome;
  return effects;
}

export function markCombatRuleApplications(applications = [], usedFrequencyKeys = new Set()) {
  applications.forEach(application => {
    if (application.usedKey) usedFrequencyKeys.add(application.usedKey);
  });
  return usedFrequencyKeys;
}

export function deriveCombatRuleFrequencyKeys(comments = []) {
  const keys = new Set();
  (Array.isArray(comments) ? comments : []).forEach(comment => {
    (Array.isArray(comment?.commentSegments) ? comment.commentSegments : []).forEach(segment => {
      const applications = segment?.combatResolution?.ruleApplications;
      (Array.isArray(applications) ? applications : []).forEach(application => {
        const storedKey = text(application.usedKey, 500);
        if (storedKey) keys.add(storedKey);
      });
    });
  });
  return keys;
}

export const combatTriggerRuleInternals = Object.freeze({
  frequencyKey,
  conditionAllows,
  actionAllows,
  distanceAllows,
  relationAllows
});
