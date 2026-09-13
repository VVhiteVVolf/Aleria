import assert from 'node:assert/strict';
import { resolveCombatProfile } from '../../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../modules/combat/combat-state-model.js';
import { deriveCombatRuleFrequencyKeys } from '../../modules/combat/combat-trigger-rules.js';
import { averageDamageFormula } from '../../modules/combat/combat-action-estimates.js';
import { SeededCombatDice } from '../../tests/support/combat-seeded-dice.mjs';

export const DUEL_VARIANTS = [
  { id: 'both-one-handed', grips: ['one-handed', 'one-handed'] },
  { id: 'both-two-handed', grips: ['two-handed', 'two-handed'] },
  { id: 'gildas-two-handed', grips: ['two-handed', 'one-handed'] },
  { id: 'gawain-two-handed', grips: ['one-handed', 'two-handed'] }
];

// Only immutable profile projections are cached. Every attack overlays the
// production replay state again, including resources and temporary conditions.
export function createDuelProfiles(characters) {
  return characters.map(character => {
    const base = resolveCombatProfile(character);
    const actions = new Map();
    for (const action of base.actions.filter(action => action.compatible !== false
      && ['weapon', 'technique'].includes(action.kind) && action.formula)) {
      for (const grip of ['one-handed', 'two-handed']) {
        actions.set(`${action.id}:${grip}`, resolveCombatProfile(character, { actionId: action.id, weaponGrip: grip }));
      }
    }
    return { base, actions };
  });
}

function affordable(profile, resources) {
  const totals = new Map();
  for (const cost of profile.resourceCosts) totals.set(cost.resourceId, (totals.get(cost.resourceId) || 0) + cost.amount);
  return totals.size > 0 && [...totals].every(([id, amount]) => (resources.find(resource => resource.id === id)?.current || 0) >= amount);
}

// Exhaustive combinations of known damaging actions, each at most once per own
// contribution. This plans the entire available budget instead of choosing a
// large single hit that wastes the remaining action slots. No future dice seen.
function planTurn(candidates, target, resources) {
  const options = candidates.filter(actor => actor.selectedAction.compatible !== false && affordable(actor, resources))
    .map(actor => ({ actor, score: (averageDamageFormula(actor.weapon.damageFormula) + actor.damageModifier)
      * Math.max(.05, Math.min(.95, (21 + actor.attackModifier - target.totalDefense) / 20)) }));
  let best = { score: 0, actions: [], persistent: Infinity };
  function visit(index, remaining, actions, score, persistent) {
    if (score > best.score + 1e-9 || (Math.abs(score - best.score) < 1e-9 && persistent < best.persistent)) {
      best = { score, actions, persistent };
    }
    for (let next = index; next < options.length; next++) {
      const option = options[next];
      if (!affordable(option.actor, remaining)) continue;
      const after = remaining.map(resource => ({ ...resource, current: resource.current
        - option.actor.resourceCosts.filter(cost => cost.resourceId === resource.id).reduce((sum, cost) => sum + cost.amount, 0) }));
      visit(next + 1, after, [...actions, option], score + option.score,
        persistent + option.actor.resourceCosts.filter(cost => cost.scope === 'persistent').reduce((sum, cost) => sum + cost.amount, 0));
    }
  }
  visit(0, resources, [], 0, 0);
  return best.actions.sort((left, right) => right.score - left.score).map(option => option.actor);
}

export async function simulateDuel({ profiles, variant, seed, entryId = 'local-duel-rehearsal', initialComments = [], onComment = null }) {
  const dice = new SeededCombatDice(seed);
  const service = new CombatResolutionService(dice);
  const comments = structuredClone(initialComments);
  const initiative = profiles.map(({ base }, index) => ({ index, roll: dice.die(20), modifier: base.initiative || 0 }));
  initiative.sort((left, right) => (right.roll + right.modifier) - (left.roll + left.modifier)
    || (seed % 2 ? left.index - right.index : right.index - left.index));
  const trace = [];
  const snapshot = draft => deriveCombatStateFromComments([...comments, ...(draft ? [draft] : [])],
    draft ? { commentId: 'pending', segmentIndex: draft.commentSegments.length } : {});
  const overlay = (index, state, base = profiles[index].base) => overlayCombatHitPointState(base, state.get(base.characterId));
  let round = 0;
  while (round < 60 && profiles.every((_, index) => overlay(index, snapshot()).currentHitPoints > 0)) {
    round++;
    for (const { index } of initiative) {
      const draft = { id: 'pending', commentSegments: [] };
      let state = snapshot(draft);
      if (profiles.some((_, actorIndex) => overlay(actorIndex, state).currentHitPoints <= 0)) break;
      const candidates = [...profiles[index].actions.entries()].filter(([key]) => key.endsWith(`:${variant.grips[index]}`))
        .map(([, base]) => overlay(index, state, base));
      const plan = planTurn(candidates, overlay(1 - index, state), overlay(index, state).resources);
      assert.ok(plan.length, 'Eine lebende Figur besitzt einen bezahlbaren Angriff.');
      for (const chosen of plan) {
        state = snapshot(draft);
        const actor = overlay(index, state, profiles[index].actions.get(`${chosen.profileActionId}:${variant.grips[index]}`));
        const target = overlay(1 - index, state);
        if (actor.currentHitPoints <= 0 || target.currentHitPoints <= 0) break;
        // Revalidate against the live draft; reactions may have spent resources.
        if (!affordable(actor, actor.resources)) continue;
        const usedRuleFrequencyKeys = deriveCombatRuleFrequencyKeys([...comments, draft]);
        const resolution = await service.resolveAttack({ actor, target, rollMode: 'normal', description: 'Lokale Duellprobe' }, {
          relationship: 'enemy', distanceMeters: 1.5, usedRuleFrequencyKeys,
          rulePeriods: { comment: 'pending', scene: entryId, day: `scene:${entryId}:day-1` }
        });
        resolution.multiTargetIndex = 0;
        resolution.multiTargetCount = 1;
        draft.commentSegments.push({ kind: 'speech', commentKind: 'speech', mechanicMode: 'combat', actorId: actor.characterId,
          characterId: actor.characterId, charName: actor.name, text: 'Lokale Duellprobe', combatDistanceMeters: 1.5,
          combatAction: { encounterId: initialComments[0]?.combatEncounter?.encounterId || '', profileActionId: actor.profileActionId,
            rollMode: 'normal', paymentMode: 'standard', weaponGrip: actor.weaponGrip, castLevel: 0, loadout: null },
          combatResolution: resolution });
        trace.push({ round, actor: index, actionId: actor.profileActionId, action: actor.selectedAction.name,
          grip: actor.weaponGrip, roll: resolution.attack?.naturalRoll, attackTotal: resolution.attack?.total, hit: resolution.attack?.hit,
          critical: !!resolution.attack?.criticalSuccess, damage: resolution.damage?.total || 0,
          hitPointsAfter: resolution.targetSnapshot.hitPointsAfter });
        for (const resource of resolution.actorResourceSnapshot?.after || []) {
          assert.ok(resource.current >= 0 && resource.current <= resource.maximum, `${actor.name}: ${resource.id}`);
        }
      }
      assert.ok(draft.commentSegments.length, 'Kein leerer Endloszug.');
      const payload = { entryId, charName: profiles[index].base.name, text: 'Lokale Duellprobe',
        metadata: { characterId: profiles[index].base.characterId, commentSegments: draft.commentSegments } };
      if (onComment) await onComment(payload);
      comments.push({ ...payload.metadata, id: `turn-${comments.length + 1}` });
    }
  }
  const final = profiles.map((_, index) => overlay(index, snapshot()));
  const alive = final.flatMap((actor, index) => actor.currentHitPoints > 0 ? [index] : []);
  assert.equal(alive.length, 1, 'Duell endet durch Kampfunfähigkeit vor dem Rundenlimit.');
  return { variant: variant.id, seed, winner: alive[0] === 0 ? 'Gildas' : 'Gawain', rounds: round,
    first: initiative[0].index === 0 ? 'Gildas' : 'Gawain', initiative, actions: trace.length,
    hitPoints: final.map(actor => actor.currentHitPoints), trace };
}
