// Local sandbox only: production resolution/replay, without persistence or XP.
import assert from 'node:assert/strict';
import { createAuditFighter } from './post-simulation.mjs';
import { resolveCombatProfile } from '../../modules/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../../modules/combat/combat-equipment-state.js';
import { CombatResolutionService } from '../../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../modules/combat/combat-state-model.js';
import { deriveCombatRuleFrequencyKeys } from '../../modules/combat/combat-trigger-rules.js';
import { createCriticalConsequence } from '../../modules/combat-critical/combat-critical-model.js';
import { getCriticalWeaponAttack } from '../../modules/combat-critical/combat-critical-catalog.js';
import { applyCombatAbilityUse } from '../../modules/combat/combat-ability-uses.js';
import { isSelfTargetAction } from '../../modules/combat/combat-action-targeting.js';
import { applySceneItemInteraction } from '../../modules/scene-items/scene-item-interaction.js';
import { SeededCombatDice } from '../../tests/support/combat-seeded-dice.mjs';

class DuelDice extends SeededCombatDice {
  async rollWardDeflection() { return this.rollAttack({ modifier: 0 }); }
}

export function createDuelFighter(record) {
  const rested = createAuditFighter(record);
  const cache = new Map();
  return { character: rested.character, profile(actionId = '', state = null) {
    const key = JSON.stringify([actionId, state?.equippedWeaponId, state?.offHandWeaponId, state?.supportEquipment]);
    if (!cache.has(key)) {
      const character = withEquippedCombatWeapon(rested.character, state?.equippedWeaponId, state?.offHandWeaponId, state?.supportEquipment);
      cache.set(key, character === rested.character ? rested.profile(actionId) : resolveCombatProfile(character, { actionId, includeAiSnapshot: false }));
    }
    return overlayCombatHitPointState(cache.get(key), state);
  } };
}

export function duelSnapshot(fighters, comments, draft = null) {
  const states = deriveCombatStateFromComments([...comments, ...(draft ? [draft] : [])],
    draft ? { commentId: draft.id, segmentIndex: draft.commentSegments.length } : {});
  return { states, profiles: fighters.map(fighter => fighter.profile('', states.get(fighter.character.id))) };
}

export async function resolveDuelContribution({ fighters, comments, index, plan, dice, postId }) {
  const service = new CombatResolutionService(dice);
  const draft = { id: postId, characterId: fighters[index].character.id, commentSegments: [] };
  const encounter = { encounterId: 'offline-nudd-asgeir-duel', criticalEffectsVersion: 1 };
  const usedConsequenceKeys = new Set();
  let snapshot = duelSnapshot(fighters, comments, draft);
  // Recover the owned dropped weapon through the real interaction and cost path.
  const dropped = snapshot.profiles[index].droppedWeapons;
  for (const entry of dropped || []) {
    if (!snapshot.profiles[index].resources.some(resource => ['action', 'bonus-action', 'reaction'].includes(resource.id) && resource.current > 0)) break;
    const recovered = applySceneItemInteraction({ entry: { ...entry, available: true }, actor: snapshot.profiles[index],
      operation: 'pickup', paymentResource: snapshot.profiles[index].resources.find(resource => resource.id === 'bonus-action' && resource.current > 0)?.id || '',
      usageId: `${postId}-pickup-${draft.commentSegments.length}` });
    draft.commentSegments.push({ characterId: draft.characterId, inventoryUse: recovered.inventoryUse });
    snapshot = duelSnapshot(fighters, comments, draft);
  }
  const chosen = typeof plan === 'function' ? await plan(snapshot.profiles, snapshot.states) : plan;
  for (const id of chosen.length ? chosen : ['combat:wait']) {
    snapshot = duelSnapshot(fighters, comments, draft);
    if (snapshot.profiles.some(profile => profile.currentHitPoints <= 0)) break;
    const actor = fighters[index].profile(id, snapshot.states.get(draft.characterId));
    const target = isSelfTargetAction(actor.selectedAction) ? actor : snapshot.profiles[1 - index];
    const use = applyCombatAbilityUse(actor.abilities, actor.profileActionId);
    assert.ok(use.sufficient, `${actor.name}: ability use available`);
    const resolution = await service.resolveAttack({ actor, target }, { relationship: actor === target ? 'self' : 'enemy', distanceMeters: 1.5,
      rulePeriods: { comment: postId, scene: encounter.encounterId, day: 'offline-day-1' },
      usedRuleFrequencyKeys: deriveCombatRuleFrequencyKeys([...comments, draft]) });
    if (use.changed) resolution.actorAbilitySnapshot = { before: use.beforeAbilities, after: use.abilities };
    const critical = getCriticalWeaponAttack(resolution);
    const consequenceKey = critical?.criticalFailure ? `failure:${actor.characterId}` : `hit:${actor.characterId}:${target.characterId}`;
    if (critical && !usedConsequenceKeys.has(consequenceKey)) {
      const consequence = createCriticalConsequence(resolution, { encounter, roll: dice.die(20), usedConsequenceKeys,
        id: `${postId}:${draft.commentSegments.length}`, actor, target });
      if (consequence) resolution.criticalConsequence = consequence;
    }
    for (const resource of resolution.actorResourceSnapshot?.after || []) assert.ok(resource.current >= 0 && resource.current <= resource.maximum);
    draft.commentSegments.push({ characterId: draft.characterId, combatResolution: resolution });
  }
  // A tick at the start of the contribution can itself cause incapacitation.
  if (!draft.commentSegments.length) draft.commentSegments.push({ characterId: draft.characterId, kind: 'speech', text: 'Beitrag beginnt.' });
  return { comment: draft, snapshot: duelSnapshot(fighters, [...comments, draft]) };
}

export async function simulateOptimizedDuel({ fighters, seed, choosePlan, maximumRounds = 40, trace = false }) {
  const dice = new DuelDice(seed);
  const initiative = fighters.map((fighter, index) => ({ index, roll: dice.die(20), modifier: fighter.profile().initiative || 0 }));
  initiative.sort((a,b) => b.roll + b.modifier - a.roll - a.modifier || (seed % 2 ? a.index - b.index : b.index - a.index));
  const comments = [], turns = [];
  let snapshot = duelSnapshot(fighters, comments), round = 0;
  while (round < maximumRounds && snapshot.profiles.every(profile => profile.currentHitPoints > 0)) {
    round++;
    for (const { index } of initiative) {
      if (snapshot.profiles.some(profile => profile.currentHitPoints <= 0)) break;
      const postId = `duel-turn-${comments.length + 1}`;
      const prepared = await resolveDuelContribution({ fighters, comments, index, dice, postId,
        plan: (profiles, states) => choosePlan({ fighters, profiles, states, index, round, comments, postId }) });
      comments.push(prepared.comment); snapshot = prepared.snapshot;
      const actions = prepared.comment.commentSegments.map(segment => {
        const r = segment.combatResolution;
        return r ? { action: fighters[index].profile(r.profileActionId).selectedAction.name, actionId: r.profileActionId, roll: r.attack?.naturalRoll,
          hit: r.attack?.hit, damage: r.damage?.total || 0, followUps: r.followUpAttacks?.map(a => ({ hit: a.attack?.hit, damage: a.damage?.total || 0 })),
          critical: r.criticalConsequence?.name, counters: r.counterAttacks?.map(counter => ({ actor: counter.actorName,
            hit: counter.attack?.hit, damage: counter.damage?.total || 0 })), hpAfter: r.targetSnapshot?.hitPointsAfter }
          : { action: segment.inventoryUse?.sceneItemEvent?.text || segment.text };
      });
      turns.push({ round, actor: fighters[index].character.name, actions,
        hp: snapshot.profiles.map(p => p.currentHitPoints), temporaryHp: snapshot.profiles.map(p => p.temporaryHitPoints) });
    }
  }
  const alive = snapshot.profiles.flatMap((profile,index) => profile.currentHitPoints > 0 ? [index] : []);
  assert.ok(alive.length < 2, 'Duel terminates within the bounded round limit');
  return { seed, winner: alive.length === 1 ? fighters[alive[0]].character.name : 'Unentschieden', rounds: round,
    first: fighters[initiative[0].index].character.name, initiative, hp: snapshot.profiles.map(p => p.currentHitPoints),
    ...(trace ? { turns } : {}) };
}
