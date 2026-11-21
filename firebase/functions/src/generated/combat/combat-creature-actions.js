import { COMBAT_WAIT_ACTION } from './combat-wait-action.js';
import { getAttributeModifier, getEffectiveCombatAttribute, getSavingThrowTotal, getSkillTotal } from './combat-profile-model.js';
import { getRegenerationTrait, isActivelyBurning, isBurning } from './combat-creature-traits.js';
import { naturalRollReceipt, rollProfileD20, succeedsProfileSavingThrow } from './combat-natural-roll-policy.js';

export const CREATURE_TURN_END_ID = 'combat:creature-turn-end';
export const ESCAPE_METHODS = Object.freeze({ athletics: 'Athletik', strength: 'Stärke', dexterity: 'Geschicklichkeit' });
export const getEscapeActionId = method => `combat:escape:${method}`;
const defaultEscape = 'dexterity';

export function getHeldCondition(profile = {}) {
  return (profile.temporaryConditions || []).find(condition => condition.active !== false && condition.restraint?.dc > 0) || null;
}

export function hasOwnHold(actor, target) {
  const held = getHeldCondition(target);
  return Boolean(held && held.concentrationOwnerId === actor.characterId
    && actor.concentration?.instanceId === held.concentrationInstanceId);
}

export function hasCreatureTurnEnd(profile) {
  return getRegenerationTrait(profile)?.regeneration.timing === 'end';
}

export function getRuntimeCreatureAction(id, profile) {
  const method = String(id || '').split(':').at(-1);
  if (id === getEscapeActionId(method) && Object.hasOwn(ESCAPE_METHODS, method)) {
    return { ...COMBAT_WAIT_ACTION, id, name: `Befreiung · ${ESCAPE_METHODS[method]}`, internal: true, escapeMethod: method };
  }
  if (id === CREATURE_TURN_END_ID && hasCreatureTurnEnd(profile)) {
    const resourceId = getRegenerationTrait(profile).regeneration.resourceId;
    return { ...COMBAT_WAIT_ACTION, id, name: 'Trollblut · Beitragsende', internal: true, creatureTurnEnd: true,
      costs: [{ resourceId, amount: 1, scope: 'comment' }] };
  }
  return null;
}

export function prepareCreatureTurnEnd(actor) {
  const trait = getRegenerationTrait(actor);
  const rule = trait.regeneration;
  const burning = isActivelyBurning(actor.conditions || []);
  const suppressed = rule.blockedByBurning && isBurning(actor.conditions || []);
  const alive = Number(actor.currentHitPoints) > 0;
  const modifier = getAttributeModifier(getEffectiveCombatAttribute(actor, 'constitution')) * rule.constitutionMultiplier;
  const effects = [];
  if (alive && burning && rule.burningDamage) effects.push({ id: 'creature-turn-fire', type: 'damage', target: 'self',
    damageType: 'Feuer', on: 'always', formula: rule.burningDamage });
  const healing = `1d${actor.hitPoints?.hitDie || 8}${modifier ? `${modifier > 0 ? '+' : ''}${modifier}` : ''}`;
  if (alive && !suppressed && actor.currentHitPoints < actor.maximumHitPoints) effects.push({ id: 'creature-turn-healing',
    type: 'healing', target: 'self', on: 'always', formula: healing });
  const action = { ...actor.selectedAction, effects: effects.length ? effects : COMBAT_WAIT_ACTION.effects };
  return { actor: { ...actor, selectedAction: action }, turnEnd: { name: trait.name, suppressed, burning } };
}

function getEscapeCheck(actor, held, method) {
  const attributeKey = method === 'athletics' ? 'strength' : method;
  const skill = (actor.skills || []).find(entry => entry.id === 'athletics' || /^athletik$/i.test(entry.name || ''));
  const modifier = method === 'athletics' ? getSkillTotal(actor, skill || { name: 'Athletik', attributeKey })
    : getSavingThrowTotal(actor, attributeKey);
  const rollMode = held.restraint.attempted ? 'normal' : 'disadvantage';
  return { attributeKey, modifier, rollMode, method, dc: Number(held.restraint.dc) };
}

export async function rollCreatureEscape(actor, method, dice, { container = null, prepared = null } = {}) {
  const held = getHeldCondition(actor);
  if (!held || !Object.hasOwn(ESCAPE_METHODS, method)) throw Error('Dieser Befreiungsversuch ist nicht mehr verfügbar.');
  const check = getEscapeCheck(actor, held, method);
  const roll = prepared?.conditionId === held.id && prepared.method === method && prepared.rollMode === check.rollMode
    ? { ...prepared.roll, total: Number(prepared.roll.natural) + check.modifier }
    : await rollProfileD20(dice, 'rollSavingThrow', { modifier: check.modifier, rollMode: check.rollMode,
      actorName: `Festgehalten · ${ESCAPE_METHODS[method]}`, targetName: actor.name, container }, actor);
  return { ...check, roll, conditionId: held.id, succeeded: succeedsProfileSavingThrow(roll, check.dc) };
}

export async function attachCreatureEscape(resolution, actor, dice, options) {
  const held = getHeldCondition(actor);
  const method = actor.selectedAction?.escapeMethod;
  if (Number(actor.currentHitPoints) <= 0) {
    if (method) throw Error('Bei 0 TP ist keine Befreiungsprobe möglich.');
    return resolution;
  }
  if (!held) {
    if (method) throw Error('Die Figur wird nicht festgehalten.');
    return resolution;
  }
  const contribution = String(options.rulePeriods?.comment || '');
  if (contribution && held.restraint.lastAttempt === contribution) {
    if (method) throw Error('Die Figur hat in diesem Beitrag bereits einen Befreiungsversuch gewürfelt.');
    return resolution;
  }
  const result = await rollCreatureEscape(actor, method || defaultEscape, dice, { container: options.container, prepared: options.escapePreview });
  const { roll } = result;
  const before = actor.temporaryConditions || [];
  const after = (resolution.actorConditionSnapshot?.after || before).flatMap(condition => {
    if (condition.id !== held.id) return [condition];
    return result.succeeded ? [] : [{ ...condition, restraint: { ...condition.restraint, attempted: true, lastAttempt: contribution } }];
  });
  const save = { ...naturalRollReceipt(roll), type: 'condition-escape', actorId: actor.characterId, method: result.method,
    attributeKey: result.attributeKey, dc: result.dc, modifier: result.modifier, total: Number(roll.total),
    naturalRoll: Number(roll.natural), diceResults: roll.dice || [], keptDice: roll.keptDice || [], rollId: roll.id || '', succeeded: result.succeeded };
  return { ...resolution, secondarySaves: [...(resolution.secondarySaves || []), save],
    actorConditionSnapshot: { before, after },
    mechanicNotes: [...(resolution.mechanicNotes || []), `Befreiungsversuch · ${ESCAPE_METHODS[result.method]} gegen SG ${result.dc}${result.rollMode === 'disadvantage' ? ' · Nachteil' : ''}`] };
}
