import { getCombatAttackRange } from '../../combat/combat-attack-range.js';
import { getCombatWeaponLoadout } from '../../combat/combat-weapon-loadout.js';
import { getCombatRuleDistance, normalizeCombatDistance } from '../../combat/combat-rule-distance.js';
import { getCenyrWeaponProfileId } from '../cenyr/cenyr-technique-weapon-rules.js';
import { getClassPassiveFeatures } from './class-passive-curriculum.js';
import { classPassivePeriod } from './class-passive-periods.js';
import { CLASS_PASSIVE_POSITION_RULE } from './class-passive-conditions.js';

export const PHYSICAL = ['hieb', 'stich', 'wucht', 'physisch', 'slashing', 'piercing', 'bludgeoning', 'physical'];
const id = value => String(value || '');
const normalized = value => id(value).toLowerCase();

export function leadingWeapon(profile) {
  return getCombatWeaponLoadout(profile).right || profile?.weapon || {};
}

export function weaponProfile(weapon) {
  return normalized(weapon?.profileId || getCenyrWeaponProfileId(weapon || {}) || weapon?.weaponType);
}

export function isPolearm(weapon) {
  return ['spear', 'polearm'].includes(weapon?.weaponType);
}

export function isSword(weapon) {
  return weapon?.weaponType === 'sword' && weaponProfile(weapon) !== 'rapier';
}

export function isBow(weapon) {
  return weapon?.weaponType === 'bow';
}

export function isPhysicalMelee(actor) {
  const { selectedAction: action, weapon } = actor;
  if (!['weapon', 'technique'].includes(actor.profileActionKind) || actor.actionResolutionMode === 'automatic'
    || getCombatAttackRange(actor) !== 'melee' || action?.nonDamaging) return false;
  const structured = (action?.effects || []).filter(effect => effect.type === 'damage' && effect.target !== 'self');
  if (structured.length) return structured.some(effect => !effect.magical
    && PHYSICAL.includes(normalized(effect.inheritWeaponDamageType ? weapon?.damageType : effect.damageType || weapon?.damageType)));
  return PHYSICAL.includes(normalized(weapon?.damageType));
}

export function hasStructuredTag(profile, tags) {
  const entries = [...(profile?.conditions || []), ...(profile?.temporaryConditions || [])];
  return entries.some(entry => entry.active !== false && [entry.id, entry.presetId, entry.sourceConditionId,
    ...String(entry.tags || '').split(/[,;·]/)].some(tag => tags.includes(normalized(tag).trim())));
}

export function getSaveTraits(save = {}) {
  const failures = [save.failureCondition, ...(save.effects || []).map(effect => effect.condition)].filter(Boolean);
  const tags = [...failures.flatMap(failure => [failure.presetId, failure.name, failure.id, ...String(failure.tags || '').split(/[,;·]/)]),
    ...(save.saveTags || [])].map(normalized);
  const matches = expression => tags.some(tag => expression.test(tag));
  return {
    disarm: failures.some(failure => failure.disarm === true) || matches(/entwaffn|disarm/),
    prone: matches(/liegend|niederwerf|zu boden|\bprone\b/),
    movement: matches(/forced-movement|verschieb|weggedr|zurückgedr/) || failures.some(failure => Number(failure.mechanics?.movement) < 0),
    fear: matches(/furcht|angst|ängst|fear|frightened/),
    grip: failures.some(failure => Number(failure.mechanics?.attack) < 0) || matches(/unsicherer stand|verhakte haltung|gestört.*griff/),
    position: failures.some(failure => failure.stanceGroup === 'martial-position-penalty')
  };
}

export function getPassiveActionContext({ source, currentProfile, phase, state, periods, usedFrequencyKeys }, classId) {
  const self = currentProfile || source.profile;
  const level = Number(self?.progression?.level) || 1;
  const features = level >= 5 && classId ? getClassPassiveFeatures(classId).filter(feature => feature.minimumLevel <= level) : [];
  const actor = state.actorProfile || {};
  const target = state.targetProfile || {};
  const sourceId = id(source.actorId);
  const role = actor.characterId === sourceId ? 'actor' : target.characterId === sourceId ? 'target' : 'support';
  const action = actor.selectedAction || {};
  const primary = !state.followUp && state.continuingAction !== true;
  const paid = action.compatible !== false && action.kind === 'technique' && Array.isArray(action.costs) && action.costs.length > 0;
  const period = classPassivePeriod(periods, sourceId, role === 'actor');
  return { self, classId, level, features, actor, target, role, source, sourceId, state, phase, primary, paid,
    action, period, usedFrequencyKeys, form: action.combatStyleFormId, style: action.combatStyleId,
    weapon: role === 'actor' ? actor.weapon || leadingWeapon(self) : leadingWeapon(self),
    melee: isPhysicalMelee(actor), save: getSaveTraits(state.saveContext) };
}

function groupPrefix(context, group) {
  return `${context.sourceId}:class-passive:${context.classId}:${group}:`;
}

export function passiveUsedValues(context, group) {
  const prefix = groupPrefix(context, group);
  const suffix = `@actor-comment:${context.period}`;
  return [...context.usedFrequencyKeys].filter(key => key.startsWith(prefix) && key.endsWith(suffix))
    .map(key => key.slice(prefix.length, -suffix.length));
}

// Derived rules are passed through the ordinary modifier and receipt pipeline.
// Shared groups permit several narrow variants to spend the same one use.
export function passiveRule(context, group, minimumLevel, {
  effects = {}, resultEffects = [], recipient = context.role === 'actor' ? 'actor' : 'target',
  once = true, signature = 'once', support = false
} = {}) {
  const feature = context.features.find(item => item.minimumLevel === minimumLevel);
  if (!feature) return null;
  const id = `${group}:${signature}`;
  return {
    id, entryId: context.classId, entryName: feature.name, name: feature.name,
    phase: context.phase, recipient, sourceRelation: support ? 'ally' : 'self', entryKind: 'class-passive',
    activation: 'passive', frequency: once ? 'actor-comment' : 'always',
    classUsedKey: once ? `${groupPrefix(context, group)}${signature}@actor-comment:${context.period}` : '',
    effects, resultEffects, supportEvidence: support, priority: 0
  };
}

export function isEnemy(context) {
  return context.actor.characterId !== context.target.characterId
    && (context.role === 'actor' ? context.source.relationToTarget : context.source.relationToActor) === 'enemy';
}

export function withinPosition(context, maximum) {
  if (context.role !== 'support' || context.source.relationToTarget !== 'ally' || !isEnemy(context)) return false;
  const distance = getCombatRuleDistance(context.source, CLASS_PASSIVE_POSITION_RULE, 'target');
  return distance != null && distance <= maximum;
}

export function inCantrefReach(context) {
  const distance = normalizeCombatDistance(context.state.distanceMeters);
  const stated = String(context.weapon.range || '').match(/(\d+(?:[.,]\d+)?)\s*(?:m|Meter)\b/i)?.[1];
  const reach = stated ? Number(stated.replace(',', '.')) : 2;
  if (context.role === 'target') return distance == null || distance <= reach;
  const toAlly = getCombatRuleDistance(context.source, CLASS_PASSIVE_POSITION_RULE, 'target');
  // Both measurements are needed. Their sum is a conservative upper bound
  // for the distance from the guard to the attacker.
  return distance != null && toAlly != null && distance + toAlly <= reach;
}
