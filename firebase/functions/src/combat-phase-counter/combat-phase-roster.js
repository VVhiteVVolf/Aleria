import { getSceneElementContributors } from '../generated/scene-elements/scene-element-conditions.js';

const departedStatuses = new Set(['left', 'fled', 'surrendered']);
const validId = value => typeof value === 'string' && value !== '' && value.length <= 240 && !value.includes('/');

function sceneActor({ actorId, name = actorId, kind, recordId, persistence }) {
  if (!validId(actorId) || !validId(recordId) || !['character', 'creature'].includes(kind)) return null;
  return {
    actorId, name, kind, recordId,
    persistence: persistence || (actorId === recordId
      ? { kind, recordId, stateKey: actorId, persistent: true }
      : { kind: 'scene-creature', sourceCreatureId: recordId, stateKey: actorId, persistent: false })
  };
}

function fromEncounter(actor) {
  const persistence = actor.persistence || {};
  return sceneActor({
    actorId: actor.actorId,
    name: actor.name,
    kind: persistence.kind === 'scene-creature' ? 'creature' : persistence.kind,
    recordId: persistence.sourceCreatureId || persistence.recordId,
    persistence
  });
}

function sceneRoster(history, entryId) {
  const actors = new Map();
  const departed = new Set();
  const arrive = actor => {
    if (!actor) return;
    departed.delete(actor.actorId);
    actors.set(actor.actorId, actor);
  };
  const leave = actorId => {
    if (!validId(actorId)) return;
    departed.add(actorId);
    actors.delete(actorId);
  };
  for (const comment of history) {
    const transition = comment.sceneTransition;
    if (comment.serverCommitted && transition?.source?.threadId && transition?.target?.threadId
      && transition.source.threadId !== transition.target.threadId && Array.isArray(transition.characters)) {
      for (const character of transition.characters) {
        if (!validId(character?.id)) continue;
        const { id, name } = character;
        if (transition.source.threadId === entryId) leave(id);
        if (transition.target.threadId === entryId) arrive(sceneActor({ actorId: id, recordId: id, name, kind: 'character' }));
      }
      continue;
    }
    const encounter = comment.serverValidatedMechanics && comment.combatEncounter;
    if (encounter && Array.isArray(encounter.participants)) {
      for (const participant of encounter.participants) {
        if (!participant) continue;
        if (departedStatuses.has(participant.status) || encounter.operation === 'remove') leave(participant.actorId);
        else if (['start', 'add'].includes(encounter.operation)) arrive(fromEncounter(participant));
      }
      continue;
    }
    for (const contributor of getSceneElementContributors(comment)) {
      if (!departed.has(contributor.actorId) && !actors.has(contributor.actorId)) arrive(sceneActor(contributor));
    }
  }
  return actors;
}

export async function readCombatPhaseRoster(database, transaction, history, entryId, encounter, { names = false } = {}) {
  const actors = sceneRoster(history, entryId);
  const activeKey = `${entryId}:${encounter?.encounterId || ''}`;
  const locks = new Map();
  const eligible = await Promise.all([...actors.values()].map(async actor => {
    if (actor.persistence.kind === 'scene-creature') return actor;
    const collection = actor.kind === 'creature' ? 'creatures' : 'characters';
    const key = `${collection}/records/${actor.recordId}`;
    if (!locks.has(key)) locks.set(key, transaction.get(database.doc(`combat_profile_locks/${key}`)));
    const lock = await locks.get(key);
    const activeKeys = lock.data()?.activeEncounterKeys;
    if (Array.isArray(activeKeys) && activeKeys.some(key => key !== activeKey)) return null;
    if (names && (!actor.name || actor.name === actor.actorId)) {
      const doc = await transaction.get(database.collection(collection).doc(actor.recordId));
      return { ...actor, name: doc.data()?.name || actor.actorId };
    }
    return actor;
  }));
  return new Map(eligible.filter(Boolean).map(actor => [actor.actorId, actor]));
}
