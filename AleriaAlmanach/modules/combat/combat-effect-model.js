import { applyCombatDamage, normalizeCombatHitPointState } from './combat-state-model.js?v=20260905-party-combat-v1';
import { normalizeConditionDuration, normalizeRuntimeCondition } from './combat-condition-duration.js?v=20260807-rhiannon-v1';

export const COMBAT_EFFECT_TYPES = Object.freeze([
  'damage', 'healing', 'temporary-hit-points', 'apply-condition', 'remove-condition',
  'restore-resource', 'spend-resource', 'move', 'summon', 'buff', 'debuff', 'interrupt'
]);

const EFFECT_TYPES = new Set(COMBAT_EFFECT_TYPES);
const TARGETS = new Set(['self', 'target', 'allies', 'enemies', 'all', 'selected']);
const DAMAGE_RESPONSES = new Set(['normal', 'resistant', 'vulnerable', 'immune']);
const MAGIC_SCOPES = new Set(['any', 'magical', 'nonmagical']);

function text(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

function number(value, fallback = 0, minimum = -999999, maximum = 999999) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, parsed));
}

function boolean(value, fallback = false) {
  return value == null ? fallback : value === true || value === 'true' || value === 1 || value === '1';
}

export function normalizeDamageAffinity(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const response = text(source.response, 30);
  const magicScope = text(source.magicScope, 30);
  return {
    id: text(source.id || `damage-affinity-${index + 1}`, 160),
    damageType: text(source.damageType || source.type || 'all', 100).toLocaleLowerCase('de'),
    response: DAMAGE_RESPONSES.has(response) ? response : 'normal',
    magicScope: MAGIC_SCOPES.has(magicScope) ? magicScope : 'any',
    source: text(source.source, 180),
    notes: text(source.notes, 1000)
  };
}

export function normalizeCombatEffect(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const type = text(source.type, 40);
  const target = text(source.target, 30);
  const condition = source.condition && typeof source.condition === 'object'
    ? normalizeRuntimeCondition({
        ...source.condition,
        durationModel: normalizeConditionDuration(source.condition.durationModel || source.durationModel, source.condition.duration)
      })
    : null;
  return {
    id: text(source.id || `effect-${index + 1}`, 160),
    type: EFFECT_TYPES.has(type) ? type : 'damage',
    target: TARGETS.has(target) ? target : 'target',
    amount: number(source.amount, 0, 0),
    formula: text(source.formula || source.amountFormula || source.damageFormula, 80),
    damageType: text(source.damageType || 'physisch', 100),
    inheritWeaponDamageType: boolean(source.inheritWeaponDamageType),
    magical: boolean(source.magical),
    on: ['always', 'hit', 'miss', 'save-success', 'save-failure'].includes(text(source.on, 30)) ? text(source.on, 30) : 'hit',
    resourceId: text(source.resourceId, 160),
    condition,
    conditionId: text(source.conditionId, 180),
    conditionTags: text(source.conditionTags, 500),
    movementMeters: number(source.movementMeters, 0, -9999, 9999),
    movementKind: ['push', 'pull', 'move'].includes(text(source.movementKind, 30)) ? text(source.movementKind, 30) : 'move',
    summon: source.summon && typeof source.summon === 'object' ? {
      creatureId: text(source.summon.creatureId, 180),
      name: text(source.summon.name, 180),
      count: Math.max(1, Math.trunc(number(source.summon.count, 1, 1, 50))),
      partyId: text(source.summon.partyId, 100),
      duration: normalizeConditionDuration(source.summon.duration)
    } : null,
    concentration: boolean(source.concentration),
    channelComments: Math.trunc(number(source.channelComments, 0, 0, 99)),
    nonlethal: boolean(source.nonlethal),
    notes: text(source.notes, 1600)
  };
}

export function normalizeCombatEffects(values = []) {
  return (Array.isArray(values) ? values : []).slice(0, 30).map(normalizeCombatEffect);
}

function affinityMatches(affinity, damageType, magical) {
  const requested = text(damageType || 'physisch', 100).toLocaleLowerCase('de');
  if (affinity.damageType !== 'all' && affinity.damageType !== requested) return false;
  if (affinity.magicScope === 'magical' && !magical) return false;
  if (affinity.magicScope === 'nonmagical' && magical) return false;
  return true;
}

export function resolveDamageResponse(profile = {}, { damageType = 'physisch', magical = false } = {}) {
  const matches = (Array.isArray(profile.damageAffinities) ? profile.damageAffinities : [])
    .map(normalizeDamageAffinity)
    .filter(affinity => affinityMatches(affinity, damageType, magical));
  const response = matches.some(item => item.response === 'immune') ? 'immune'
    : (matches.some(item => item.response === 'resistant') && matches.some(item => item.response === 'vulnerable') ? 'normal'
      : (matches.some(item => item.response === 'resistant') ? 'resistant'
        : (matches.some(item => item.response === 'vulnerable') ? 'vulnerable' : 'normal')));
  return { response, sources: matches, multiplier: response === 'immune' ? 0 : (response === 'resistant' ? 0.5 : (response === 'vulnerable' ? 2 : 1)) };
}

export function applyTypedCombatDamage(state = {}, amount = 0, profile = {}, options = {}) {
  const damageResponse = resolveDamageResponse(profile, options);
  const adjusted = damageResponse.response === 'resistant'
    ? Math.floor(Math.max(0, Number(amount) || 0) / 2)
    : (damageResponse.response === 'vulnerable' ? Math.max(0, Number(amount) || 0) * 2
      : (damageResponse.response === 'immune' ? 0 : Math.max(0, Number(amount) || 0)));
  return { ...applyCombatDamage(state, adjusted), rawIncoming: Math.max(0, Number(amount) || 0), damageResponse };
}

export function applyCombatHealing(state = {}, amount = 0) {
  const before = normalizeCombatHitPointState(state);
  const requested = Math.max(0, Number(amount) || 0);
  const restored = Math.min(requested, Math.max(0, before.maximum - before.current));
  return { before, after: { ...before, current: before.current + restored }, requested, restored };
}

export function applyTemporaryHitPoints(state = {}, amount = 0) {
  const before = normalizeCombatHitPointState(state);
  const offered = Math.max(0, Number(amount) || 0);
  const after = { ...before, temporary: Math.max(before.temporary, offered) };
  return { before, after, offered, granted: Math.max(0, after.temporary - before.temporary) };
}

export const combatEffectModelInternals = Object.freeze({ affinityMatches, DAMAGE_RESPONSES, MAGIC_SCOPES });
