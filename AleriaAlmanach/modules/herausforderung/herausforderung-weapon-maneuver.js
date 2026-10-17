import { overlayCombatHitPointState, applyCombatResourceCosts, applyCombatResolutionState } from '../combat/combat-state-model.js';
import { resolvePreparedWeaponAttackProfile } from '../combat/combat-weapon-response.js';
import { CombatResolutionService } from '../combat/combat-resolution-service.js';
import { resolveTechniqueSecondarySave } from '../combat/combat-technique-secondary-save.js';
import { consumeCombatRuleResources } from '../combat/combat-rule-consumption.js';
import { getDroppedWeapon, applySceneItemEvent, applyDroppedWeaponsToStates } from '../scene-items/scene-items-model.js';
import { applySceneItemInteraction } from '../scene-items/scene-item-interaction.js';
import { attachCriticalConsequences } from '../combat-critical/combat-critical-resolution.js';
import { applyCriticalConsequencesForComment } from '../combat-critical/combat-critical-model.js';
import { getResolutionSceneItemEvents } from '../combat/combat-resolution-tree.js';

function ruleSources(actor, target) {
  return [[actor, 'actor'], [target, 'target']].map(([profile, role]) => ({ actorId: profile.characterId, actorName: profile.name,
    profile, sourceRole: role, relationToActor: role === 'actor' ? 'self' : 'enemy', relationToTarget: role === 'target' ? 'self' : 'enemy',
    distanceToActor: 0, distanceToTarget: 0, selectedRuleIds: [], persistence: profile.persistence }));
}

async function resolveManeuverSave({ maneuver, actor, target, dice, periods, usedKeys }) {
  const sources = ruleSources(actor, target);
  const result = await resolveTechniqueSecondarySave({ dice, actor: { ...actor, selectedAction: {
    name: 'Gefährliche Waffenaufnahme', secondarySave: { enabled: true, requiresHit: false, attributeKey: maneuver.save.attribute, dc: maneuver.save.difficulty }
  } }, target, attack: {}, timing: 'after-hit', ruleSources: sources, ruleProfileState: {}, actionKind: 'weapon',
  profileActionId: `weapon:${actor.weapon.id}`, rulePeriods: periods, usedRuleFrequencyKeys: usedKeys, options: {} });
  return { ...result, sources, resourceSnapshots: consumeCombatRuleResources(result.applications, sources) };
}

// One finite, authored maneuver. The combat engine remains responsible for
// attacks, critical damage, protection, conditions, ammunition and counters.
export async function resolveChallengeWeaponManeuver({ effect, getContext, sceneItems, dice, encounter, periods = {},
  usedKeys = new Set(), usedConsequenceKeys = new Set(), rollCritical, identity }) {
  const maneuver = effect.maneuver, actorContext = getContext(maneuver.actorId), targetContext = getContext(effect.targetActorId);
  const states = new Map([[maneuver.actorId, actorContext.state], [effect.targetActorId, targetContext.state]]);
  const profile = context => overlayCombatHitPointState(context.profile, states.get(context.actorId));
  const receipt = { effectId: effect.effectId, type: 'weapon-maneuver', actorId: maneuver.actorId, actorName: actorContext.profile.name,
    targetActorId: effect.targetActorId, serverRolled: true };
  // Scene-item replay may also project old dropped weapons of spectators.
  // This maneuver owns only its two participants, never those other profiles.
  const finish = () => { for (const context of [actorContext, targetContext]) context.state = states.get(context.actorId); return receipt; };
  let actor = profile(actorContext), target = profile(targetContext);
  if (maneuver.save) {
    const result = await resolveManeuverSave({ maneuver, actor, target, dice, periods, usedKeys });
    receipt.save = { ...result.save, actorId: target.characterId, actorName: target.name, ruleApplications: result.applications };
    for (const snapshot of result.resourceSnapshots) states.set(snapshot.sourceActorId, { ...states.get(snapshot.sourceActorId), resources: snapshot.after });
    if (result.save.succeeded) { receipt.skipped = 'Dem Gegenangriff entgangen; die Waffe kann anschließend regulär aufgehoben werden.'; return finish(); }
    actor = profile(actorContext); target = profile(targetContext);
  }
  if (maneuver.pickupWeapon) {
    const weapon = actor.weapons.find(weapon => weapon.id === maneuver.weaponId);
    const entry = weapon && getDroppedWeapon(sceneItems, actor.characterId, weapon);
    if (!entry) throw Error('Die eigene Waffe liegt nicht mehr verfügbar in dieser Szene.');
    const pickup = applySceneItemInteraction({ entry, actor, operation: 'pickup', paymentResource: maneuver.resourceId, usageId: `maneuver:${identity}:${effect.effectId}` });
    states.set(actor.characterId, { ...states.get(actor.characterId), resources: pickup.resources });
    applySceneItemEvent(sceneItems, pickup.inventoryUse.sceneItemEvent);
    applyDroppedWeaponsToStates(states, sceneItems);
    receipt.pickup = pickup.inventoryUse;
    receipt.cost = { resourceId: maneuver.resourceId, name: actor.resources.find(r => r.id === maneuver.resourceId)?.name || maneuver.resourceId };
    actor = profile(actorContext);
  } else if (maneuver.resourceId) {
    const payment = applyCombatResourceCosts(actor.resources, [{ resourceId: maneuver.resourceId, amount: 1 }]);
    if (!payment.sufficient) throw Error('Der Aktionspunkt für das Waffenmanöver fehlt.');
    states.set(actor.characterId, { ...states.get(actor.characterId), resources: payment.after });
    receipt.cost = { resourceId: maneuver.resourceId, name: actor.resources.find(r => r.id === maneuver.resourceId)?.name || maneuver.resourceId };
    actor = profile(actorContext);
  }
  const prepared = resolvePreparedWeaponAttackProfile(actor, { weaponId: maneuver.weaponId, rollMode: maneuver.rollMode, extraWeaponDice: maneuver.extraWeaponDice });
  if (!prepared) throw Error('Das Waffenmanöver benötigt die tatsächlich geführte und verfügbare Waffe.');
  const resolution = await new CombatResolutionService(dice).resolvePreparedAttack({ actor: prepared, target, rollMode: maneuver.rollMode,
    description: 'Waffenmanöver aus einer Herausforderung' }, { encounter, relationship: 'enemy', distanceMeters: 0,
    ruleSources: ruleSources(prepared, target), rulePeriods: periods, usedRuleFrequencyKeys: usedKeys,
    skipResourceCosts: true, damageMultiplier: maneuver.damageMultiplier });
  if (receipt.pickup) resolution.sceneItemEvents = [receipt.pickup.sceneItemEvent, ...(resolution.sceneItemEvents || [])];
  attachCriticalConsequences(resolution, { encounter, actor: prepared, target, usedConsequenceKeys,
    rollFor: rollCritical, id: `${identity}:${effect.effectId}` });
  resolution.serverValidated = true;
  resolution.validatedAt = new Date().toISOString();
  resolution.challengeManeuver = { effectId: effect.effectId, extraWeaponDice: maneuver.extraWeaponDice, damageMultiplier: maneuver.damageMultiplier };
  applyCombatResolutionState(states, resolution, sceneItems);
  applyCriticalConsequencesForComment(states, { commentSegments: [{ combatResolution: resolution }] });
  for (const event of getResolutionSceneItemEvents(resolution)) applySceneItemEvent(sceneItems, event);
  applyDroppedWeaponsToStates(states, sceneItems);
  for (const key of resolution.usedRuleFrequencyKeys || []) usedKeys.add(key);
  receipt.resolution = resolution;
  return finish();
}
