// Offline audit only. Uses the same resolver and replay as the live composer.
import { resolveCombatProfile } from '../../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../modules/combat/combat-state-model.js';
import { deriveCombatRuleFrequencyKeys } from '../../modules/combat/combat-trigger-rules.js';
import { applyCombatAbilityUse } from '../../modules/combat/combat-ability-uses.js';
import { isSelfTargetAction } from '../../modules/combat/combat-action-targeting.js';
import { SeededCombatDice } from '../../tests/support/combat-seeded-dice.mjs';

class AuditDice extends SeededCombatDice {
  async rollWardDeflection() { return this.rollAttack({modifier:0,rollMode:'normal'}); }
}

export function restedAuditRecord(record) {
  const copy = structuredClone(record);
  const profile = resolveCombatProfile(copy, { includeAiSnapshot: false });
  copy.combatProfile.hitPoints = { ...copy.combatProfile.hitPoints, current: profile.maximumHitPoints, temporary: 0 };
  copy.combatProfile.resources = profile.resources.map(r => ({ ...r, current: r.maximum }));
  copy.combatProfile.abilities = profile.abilities.map(a => ({ ...a, usesCurrent: a.usesMaximum }));
  return copy;
}

export function createAuditFighter(record) {
  const character = restedAuditRecord(record);
  const profiles = new Map();
  function profile(actionId = '', paymentMode = 'standard') {
    const key = `${actionId}|${paymentMode}`;
    if (!profiles.has(key)) profiles.set(key, resolveCombatProfile(character, { actionId, paymentMode, includeAiSnapshot: false }));
    return profiles.get(key);
  }
  return { character, profile };
}

export async function simulatePost({ attacker, defender, plan, seed = 1, comments = [], postId = 'audit-post', actorState = null, targetState = null }) {
  const service = new CombatResolutionService(new AuditDice(seed));
  const segments = [];
  const status = (fighter, state, suffix) => state ? { id: `${postId}-${suffix}`, serverValidatedMechanics: true,
    combatStatus: { actorId: fighter.character.id, operation: 'add', after: state } } : null;
  const preceding = [...comments, status(attacker, actorState, 'actor'), status(defender, targetState, 'target')].filter(Boolean);
  for (const choice of plan) {
    const draft = { id: postId, characterId: attacker.character.id, commentSegments: segments };
    const states = deriveCombatStateFromComments([...preceding, draft], { commentId: postId, segmentIndex: segments.length });
    const actor = overlayCombatHitPointState(attacker.profile(choice.id, choice.paymentMode), states.get(attacker.character.id));
    const target = isSelfTargetAction(actor.selectedAction) ? actor : overlayCombatHitPointState(defender.profile(), states.get(defender.character.id));
    if (actor.currentHitPoints <= 0 || target.currentHitPoints <= 0) break;
    const use = applyCombatAbilityUse(actor.abilities, actor.profileActionId);
    if (!use.sufficient) throw new Error(`Audit plan exceeded uses: ${actor.selectedAction.name}`);
    const resolution = await service.resolveAttack({ actor, target }, { relationship: actor === target ? 'self' : 'enemy',
      rulePeriods: { comment: postId, scene: 'audit-scene', day: 'audit-day' },
      usedRuleFrequencyKeys: deriveCombatRuleFrequencyKeys([...preceding, draft]) });
    if (use.changed) resolution.actorAbilitySnapshot = { before: use.beforeAbilities, after: use.abilities };
    segments.push({ characterId: attacker.character.id, combatResolution: resolution });
  }
  const comment = { id: postId, characterId: attacker.character.id, commentSegments: segments };
  const states = deriveCombatStateFromComments([...preceding, comment]);
  const targetAfter = overlayCombatHitPointState(defender.profile(), states.get(defender.character.id));
  return { comment, states, targetAfter,
    damage: segments.reduce((sum, s) => sum + (s.combatResolution.targetId === defender.character.id ? Number(s.combatResolution.damage?.total || 0) : 0), 0),
    attacks: segments.reduce((sum, s) => sum + (s.combatResolution.resolutionMode === 'weapon-attack' || s.combatResolution.resolutionMode === 'spell-attack'
      ? 1 + (s.combatResolution.followUpAttacks?.length || 0) : 0), 0) };
}

export function summarizeSamples(samples, maximumHp) {
  const damages = samples.map(s => s.damage).sort((a,b) => a-b);
  const mean = damages.reduce((a,b) => a+b,0) / damages.length;
  const variance = damages.reduce((sum,d) => sum+(d-mean)**2,0) / Math.max(1,damages.length-1);
  return { samples: damages.length, mean, mean95HalfWidth: 1.96*Math.sqrt(variance/damages.length),
    median: damages[Math.floor(damages.length/2)], p90: damages[Math.floor(damages.length*0.9)], maximum: damages.at(-1),
    defeatProbability: samples.filter(s => s.targetAfter.currentHitPoints<=0).length/samples.length,
    hpFraction: mean/maximumHp, hpOverMean: mean>0 ? maximumHp/mean : null,
    meanAttackRolls: samples.reduce((sum,s)=>sum+s.attacks,0)/samples.length };
}
