import { randomInt } from 'node:crypto';
import { CombatResolutionService } from '../generated/combat/combat-resolution-service.js';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { CREATURE_TURN_END_ID } from '../generated/combat/combat-creature-actions.js';
import { applyCombatResolutionState, overlayCombatHitPointState } from '../generated/combat/combat-state-model.js';
import { compactCombatResolution } from '../generated/combat/combat-resolution-storage.js';
import { ServerCombatDiceAdapter } from '../mechanics/server-combat-dice.js';

export async function prepareCreaturePhaseEnds({ database, transaction, states, participants, updates, clock, draws, rollDie }) {
  if (clock.deferConditionTime) return [];
  const receipts = [], records = new Map();
  for (const actor of participants.values()) {
    const state = states.get(actor.actorId);
    if (actor.kind !== 'creature' || !state || state.current === 0) continue;
    const key = `creature:${actor.recordId}`;
    const ref = database.collection('creatures').doc(actor.recordId);
    if (!records.has(key)) records.set(key, (await transaction.get(ref)).data() || null);
    const record = records.get(key);
    if (!record) continue;
    const persistent = actor.actorId === actor.recordId;
    const base = resolveCombatProfile({ ...record, entityType: 'creature', id: actor.actorId, name: actor.name,
      ...(persistent ? {} : { sourceCreatureId: actor.recordId }) }, { actionId: CREATURE_TURN_END_ID, segmentKind: 'combataction' });
    if (!base.selectedAction?.creatureTurnEnd) continue;
    const profile = overlayCombatHitPointState(base, state);
    let index = 0;
    const dice = new ServerCombatDiceAdapter(sides => {
      const key = `creature-phase-${actor.actorId}-${index++}-${sides}`;
      if (!draws.has(key)) draws.set(key, rollDie ? rollDie(sides) : randomInt(1, sides + 1));
      return draws.get(key);
    });
    const result = await new CombatResolutionService(dice).resolveAttack({ actor: profile, target: profile, description: 'Trollblut beim Phasenwechsel' });
    applyCombatResolutionState(states, result);
    receipts.push(compactCombatResolution(result));
    const after = states.get(actor.actorId);
    if (persistent && (after.current !== profile.currentHitPoints || after.temporary !== profile.temporaryHitPoints)) {
      updates.set(key, { entry: { kind: 'creature', recordId: actor.recordId, ref }, record,
        hitPoints: { current: after.current, maximum: after.maximum, temporary: after.temporary || 0 } });
    }
  }
  return receipts;
}
