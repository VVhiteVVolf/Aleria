import { randomInt } from 'node:crypto';
import { normalizeHerausforderungEvent } from '../generated/herausforderung/herausforderung-model.js';
import { getChallengeCombatBindingError } from '../generated/herausforderung/herausforderung-combat-context.js';
import { ServerCombatDiceAdapter } from '../mechanics/server-combat-dice.js';
import { readParticipantProfiles, prepareSceneElementReaction } from '../scene-elements/scene-element-evaluation.js';
import { sceneElementSignal } from '../scene-elements/scene-element-authoring.js';
import { stageSceneElementReveal } from '../scene-elements/scene-element-publication.js';

export function scheduledPhaseElements(snapshot) {
  return snapshot.docs.flatMap(doc => {
    const data = doc.data();
    const phase = data.event.activation.phase;
    if (!phase) return [];
    return [{ id: doc.id, data, state: data.state, phase, title: data.event.title, elementType: data.event.elementType }];
  }).sort((a, b) => a.phase - b.phase || a.data.armedAt - b.data.armedAt || a.id.localeCompare(b.id));
}

export async function preparePhaseChallenges({ database, transaction, elements, event, encounter, history,
  participants, entryId, commentId, orderKey, now, draws, rollDie, selectIndex }) {
  const prepared = [], expired = [];
  for (const element of elements) {
    if (element.state !== 'armed') continue;
    if (event.operation === 'stop') { expired.push(element); continue; }
    if (element.phase !== event.phase || !['start', 'advance'].includes(event.operation)) continue;
    const challenge = normalizeHerausforderungEvent(element.data.event);
    if (getChallengeCombatBindingError(challenge, encounter)) { expired.push(element); continue; }
    const phaseReveal = { counterId: event.counterId, phase: event.phase, commentId };
    const evaluation = { satisfied: true, receipts: [{ type: 'phase', satisfied: true, phase: event.phase, commentId }] };
    const revealId = 'reveal-' + element.id;
    let detection = null, target = null;
    if (challenge.elementType === 'danger') {
      const profiles = (await readParticipantProfiles(database, transaction, history, participants))
        .filter(actor => !getChallengeCombatBindingError(challenge, encounter, actor.actorId)
          && (challenge.activation.target.mode !== 'fixed' || challenge.activation.target.actorId === actor.actorId));
      const candidates = profiles.map(actor => actor.actorId).join('\0');
      const key = `${element.id}-${candidates}`;
      if (profiles.length && !draws.has(key)) draws.set(key, selectIndex ? selectIndex(profiles.length) : randomInt(profiles.length));
      target = profiles[draws.get(key)];
      let index = 0;
      const dice = new ServerCombatDiceAdapter(sides => {
        const key = `${element.id}-roll-${index++}-${sides}`;
        if (!draws.has(key)) draws.set(key, rollDie ? rollDie(sides) : randomInt(1, sides + 1));
        return draws.get(key);
      });
      detection = await prepareSceneElementReaction({ event: challenge, evaluation, target, history, entryId, revealId, dice, now });
    }
    const revealOrderKey = orderKey + prepared.length + 1;
    prepared.push({ id: element.id, definition: element.data, event: challenge, evaluation, phaseReveal,
      orderKey: revealOrderKey, interactions: element.data.interactions || [], targetActorId: target?.actorId || '',
      detection: detection?.resolution, update: detection?.update, targetRef: target?.ref, now });
    if (detection?.resolution) history = [...history, { id: revealId, entryId, orderKey: revealOrderKey, combatPhaseReveal: phaseReveal,
      sceneElementDetection: detection.resolution, serverValidatedMechanics: true }];
  }
  return { prepared, expired };
}

export function stagePhaseChallenges(database, transaction, { prepared, expired }, now) {
  for (const { id, data } of expired) {
    transaction.update(database.collection('scene_elements').doc(id), { state: 'expired', updatedAt: now });
    transaction.update(database.collection('comments').doc('signal-' + id), {
      sceneElementSignal: sceneElementSignal(id, data.event, 'expired', data.revision)
    });
  }
  return prepared.map(reveal => {
    if (reveal.update) transaction.update(reveal.targetRef, reveal.update);
    return stageSceneElementReveal(database, transaction, reveal).challengeId;
  });
}
