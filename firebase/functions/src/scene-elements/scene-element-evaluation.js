import { randomInt } from 'node:crypto';
import { HttpsError } from 'firebase-functions/v2/https';
import { collectSceneElementParticipants, getSceneElementContributors, evaluateSceneElementConditions } from '../generated/scene-elements/scene-element-conditions.js';
import { normalizeHerausforderungEvent } from '../generated/herausforderung/herausforderung-model.js';
import { getChallengeCombatBindingError } from '../generated/herausforderung/herausforderung-combat-context.js';
import { getActiveCombatEncounter } from '../generated/combat/combat-encounter-model.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../generated/combat/combat-state-model.js';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../generated/combat/combat-equipment-state.js';
import { recoverDailyCombatResources } from '../generated/combat/combat-action-economy.js';
import { getSceneRecoveryDayKey } from '../generated/scene-time/scene-recovery-day.js';
import { readItemDefinitionIndex, hydrateItemRecord } from '../items/item-definition-repository.js';
import { isTrustedSceneContributionComment, sortSceneHistory } from '../mechanics/trusted-scene-history.js';
import { nextMechanicalCommentOrderKey } from '../mechanics/mechanical-comment-order.js';
import { ServerCombatDiceAdapter } from '../mechanics/server-combat-dice.js';
import { sceneElementSignal } from './scene-element-authoring.js';
import { stageSceneElementReveal } from './scene-element-publication.js';
import { resolveSceneElementDetection } from './scene-element-detection.js';
import { getLatestCombatPhase } from '../generated/combat-phase-counter/combat-phase-model.js';

export async function readParticipantProfiles(database, transaction, history, participants = collectSceneElementParticipants(history)) {
  const states = deriveCombatStateFromComments(history);
  const records = new Map();
  for (const descriptor of participants) {
    const key = `${descriptor.kind}:${descriptor.recordId}`;
    if (records.has(key)) continue;
    const ref = database.collection(descriptor.kind === 'creature' ? 'creatures' : 'characters').doc(descriptor.recordId);
    const snapshot = await transaction.get(ref);
    if (snapshot.exists) records.set(key, { ref, record: { ...snapshot.data(), id: descriptor.recordId,
      _itemHolderKind: descriptor.kind === 'creature' ? 'creatures' : 'characters' } });
  }
  const definitions = await readItemDefinitionIndex(database, transaction, [...records.values()].map(entry => entry.record));
  const day = getSceneRecoveryDayKey(history[0]?.entryId || '', history);
  return participants.flatMap(descriptor => {
    const entry = records.get(`${descriptor.kind}:${descriptor.recordId}`);
    if (!entry) return [];
    const state = states.get(descriptor.actorId);
    const record = hydrateItemRecord(entry.record, definitions, { preserveLoadout: true });
    const actor = { ...record, id: descriptor.actorId, entityType: descriptor.kind };
    const equipped = withEquippedCombatWeapon(actor, state?.equippedWeaponId, state?.offHandWeaponId, state?.supportEquipment);
    const profile = overlayCombatHitPointState(resolveCombatProfile(equipped, { definitions }), state);
    profile.resources = recoverDailyCombatResources(profile.resources, day);
    const persistent = descriptor.actorId === descriptor.recordId;
    return [{ ...descriptor, ...entry, actor, profile, name: profile.name || actor.name || descriptor.actorId,
      persistence: persistent ? { kind: descriptor.kind, recordId: descriptor.recordId, stateKey: descriptor.actorId, persistent: true }
        : { kind: 'scene-creature', sourceCreatureId: descriptor.recordId, stateKey: descriptor.actorId, persistent: false } }];
  });
}

export async function prepareSceneElementReaction({ event, evaluation, target, history, entryId, revealId, dice, now }) {
  if (!target || !['danger', 'item'].includes(event.elementType)) return null;
  const detection = await resolveSceneElementDetection({ activation: event.activation, evaluation,
    target, history, entryId, revealId, dice, now });
  event.audience = { mode: 'selected', actorIds: [target.actorId] };
  event.reaction = { actorId: target.actorId, actorName: target.name, detected: detection.detected,
    rollMode: detection.detected ? 'advantage' : 'disadvantage', saveContext: event.activation.saveContext,
    description: detection.detected ? event.activation.detection.detectedText : event.activation.detection.missedText,
    detection: detection.proof };
  event.approaches = event.approaches.map(approach => ({ ...approach, attemptLimit: 1 }));
  event.completionMode = 'any';
  return detection;
}

export function assertPublicInteraction(history, interaction) {
  if (!interaction) return;
  const source = history.find(comment => comment.id === interaction.sourceId
    || (comment.sceneElementSignal?.id === interaction.sourceId && comment.sceneElementSignal.visible));
  if (!source || source.serverValidatedMechanics !== true || source.importedHistoricalMechanics || !(source.herausforderung?.elementType === 'item' || source.herausforderung?.elementType === 'puzzle'
    || source.sceneElementSignal?.visible)) throw new HttpsError('failed-precondition', 'Diese Interaktionsquelle ist nicht verfügbar.');
  if (!collectSceneElementParticipants(history).some(actor => actor.actorId === interaction.actorId)) throw new HttpsError('failed-precondition', 'Die interagierende Figur muss bereits in dieser Szene kommentiert haben.');
}

export async function evaluateSceneElement(database, entryId, id, { interaction = null, validatedInteraction = false, now = Date.now(), rollDie, selectIndex } = {}) {
  const ref = database.collection('scene_elements').doc(id);
  const signalRef = database.collection('comments').doc('signal-' + id);
  const revealRef = database.collection('comments').doc('reveal-' + id);
  const draws = [], choices = new Map();
  return database.runTransaction(async transaction => {
    let drawIndex = 0;
    const dice = new ServerCombatDiceAdapter(sides => {
      const index = drawIndex++;
      if (draws[index] == null) draws[index] = rollDie ? rollDie(sides) : randomInt(1, sides + 1);
      return draws[index];
    });
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.data().entryId !== entryId) return { id, state: 'missing' };
    const definition = snapshot.data();
    if (definition.state !== 'armed') return { id, state: definition.state, challengeId: definition.challengeId || '' };
    const scene = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const history = sortSceneHistory(scene.docs.map(doc => ({ id: doc.id, ...doc.data() }))).filter(isTrustedSceneContributionComment);
    if (!validatedInteraction) assertPublicInteraction(history, interaction);
    const event = normalizeHerausforderungEvent(definition.event);
    const encounter = getActiveCombatEncounter(history);
    if (event.activation.phase && getLatestCombatPhase(history)?.operation !== 'stop') return { id, state: 'armed' };
    const expired = getChallengeCombatBindingError(event, encounter);
    if (expired || event.activation.phase) {
      transaction.update(ref, { state: 'expired', updatedAt: now });
      transaction.update(signalRef, { sceneElementSignal: sceneElementSignal(id, event, 'expired', definition.revision) });
      return { id, state: 'expired' };
    }
    const profiles = (await readParticipantProfiles(database, transaction, history))
      .filter(actor => !getChallengeCombatBindingError(event, encounter, actor.actorId));
    const baseline = new Set(definition.baselineCommentIds);
    const commentCount = history.filter(comment => !baseline.has(comment.id) && getSceneElementContributors(comment).length).length;
    const interactionSources = new Set(event.activation.conditions.filter(condition => condition.type === 'interaction').map(condition => condition.sourceId || id));
    const interactions = (definition.interactions || []).filter(previous => interactionSources.has(previous.sourceId));
    const relevantInteraction = interaction && interactionSources.has(interaction.sourceId)
      && (!interaction.receiptId || !baseline.has(interaction.receiptId));
    if (relevantInteraction && !interactions.some(previous => previous.sourceId === interaction.sourceId)) {
      interactions.push({ sourceId: interaction.sourceId, actorId: interaction.actorId });
    }
    const evaluation = evaluateSceneElementConditions(event.activation, { commentCount, profiles, interactions, elementId: id });
    const eligible = event.activation.target.mode === 'fixed' ? profiles.filter(actor => actor.actorId === event.activation.target.actorId) : profiles;
    if (!evaluation.satisfied || !eligible.length) {
      if (relevantInteraction) transaction.update(ref, { interactions });
      return { id, state: 'armed' };
    }
    const selectionKey = eligible.map(actor => actor.actorId).join('\0');
    if (!choices.has(selectionKey)) choices.set(selectionKey, selectIndex ? selectIndex(eligible.length) : randomInt(eligible.length));
    const interactingActor = relevantInteraction ? interaction.actorId : evaluation.receipts.find(receipt => receipt.type === 'interaction' && receipt.satisfied)?.actorId;
    const target = eligible.find(actor => actor.actorId === interactingActor) || eligible[choices.get(selectionKey)];
    const detection = await prepareSceneElementReaction({ event, evaluation, target, history, entryId, revealId: revealRef.id, dice, now });
    const orderKey = nextMechanicalCommentOrderKey(history, null, now);
    if (detection?.update) transaction.update(target.ref, detection.update);
    return stageSceneElementReveal(database, transaction, { id, definition, event, orderKey, now, evaluation, interactions,
      targetActorId: target.actorId, detection: detection?.resolution });
  });
}

export async function evaluateSceneElements(database, entryId, options = {}) {
  const ids = await database.runTransaction(async transaction => {
    const scene = await transaction.get(database.collection('scene_elements').where('entryId', '==', entryId));
    return scene.docs.filter(doc => doc.data().state === 'armed').map(doc => doc.id);
  });
  const results = [];
  for (const id of ids) results.push(await evaluateSceneElement(database, entryId, id, options));
  return results;
}
