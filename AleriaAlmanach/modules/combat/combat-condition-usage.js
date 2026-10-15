// Conditional combat benefits are evaluated at the actual attack, never folded
// into a figure's permanent modifiers. Snapshots remain owned by combat replay.
import { mergeRollModes } from './combat-roll-mode.js';

export function validateConditionUsage(value, mechanics = {}) {
  if (value == null) return null;
  if (!mechanics || typeof mechanics !== 'object' || Array.isArray(mechanics)) return 'Die Mechanik des einmaligen Effekts muss ein Objekt sein.';
  if (!value || typeof value !== 'object' || Array.isArray(value) || !['attack', 'action'].includes(value.scope)) return 'Verbrauch muss attack oder action verwenden.';
  if (value.actorId != null && (typeof value.actorId !== 'string' || !value.actorId.trim() || value.actorId.length > 240 || value.actorId.includes('/'))) return 'Die Figur für den Effektverbrauch ist ungültig.';
  if (Object.keys(mechanics).some(key => !['attack', 'armorClass', 'attackRollMode'].includes(key))) return 'Einmalige Angriffseffekte unterstützen Angriff, RK und Angriffswurfart.';
  return null;
}

export function createConditionUsage(value, mechanics) {
  if (!value) return {};
  const error = validateConditionUsage(value, mechanics);
  if (error) throw Error(error);
  return { mechanics: {}, conditionalMechanics: { ...mechanics }, usage: { scope: value.scope, actorId: String(value.actorId || ''), remaining: 1 } };
}

function conditions(profile) {
  return [...new Map([...(profile.conditions || []), ...(profile.temporaryConditions || [])].map(condition => [condition.id, condition])).values()];
}

export function getConditionUsageBenefits(actor, target, { attackIndex = 0, enabled = true, startedAction } = {}) {
  const result = { attack: 0, armorClass: 0, rollModes: [], actorIds: [], targetIds: [] };
  if (!enabled) return result;
  const actorId = String(actor.characterId || actor.id || '');
  for (const [profile, role] of [[actor, 'actor'], [target, 'target']]) {
    const carryIds = new Set(startedAction?.conditionUsage?.actorConditionIds || []);
    const carried = role === 'actor' ? (startedAction?.actorConditionSnapshot?.before || []).filter(condition => carryIds.has(condition.id) && condition.usage?.scope === 'action') : [];
    for (const condition of [...new Map([...conditions(profile), ...carried].map(condition => [condition.id, condition])).values()]) {
      const usage = condition.usage;
      if (!usage || condition.active === false || usage.remaining <= 0 || (usage.actorId && usage.actorId !== actorId)) continue;
      if (usage.scope === 'attack' && attackIndex > 0) continue;
      const mechanics = condition.conditionalMechanics || {};
      if (role === 'actor') {
        if (!mechanics.attack && !mechanics.attackRollMode) continue;
        result.attack += Number(mechanics.attack || 0);
        result.rollModes.push(mechanics.attackRollMode || 'normal');
        result.actorIds.push(condition.id);
      } else {
        if (!mechanics.armorClass) continue;
        result.armorClass += Number(mechanics.armorClass || 0);
        result.targetIds.push(condition.id);
      }
    }
  }
  result.rollMode = mergeRollModes(result.rollModes);
  return result;
}

export function consumeConditionUsage(conditions = [], ids = []) {
  const used = new Set(ids);
  return conditions.filter(condition => !used.has(condition.id));
}
