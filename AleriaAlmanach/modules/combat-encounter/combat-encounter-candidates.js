import { CombatProfileResolver } from '../combat/combat-profile-resolver.js?v=20260808-duncan-v1';
import { getEffectiveCombatLevel } from '../combat/combat-profile-model.js?v=20260808-duncan-v1';
import { deriveCombatStateFromComments } from '../combat/combat-state-model.js?v=20260905-encounter-v2';
import { captureEncounterSnapshot } from '../combat/combat-encounter-summary.js';

const resolver = new CombatProfileResolver();
export const encounterSearchText = (...values) => values.join(' ').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export function collectSceneActorIds(comments = [], castIds = [], draftActors = []) {
  const ids = new Set([...castIds, ...draftActors.map(actor => actor.id)].map(String));
  for (const comment of comments) {
    if (comment.characterId) ids.add(String(comment.characterId));
    for (const segment of comment.commentSegments || []) {
      if (segment.actorId) ids.add(String(segment.actorId));
      if (segment.combatTargetId) ids.add(String(segment.combatTargetId));
      for (const id of segment.combatTargetIds || []) ids.add(String(id));
    }
    for (const participant of comment.combatEncounter?.participants || []) ids.add(String(participant.actorId));
  }
  return ids;
}

export function buildEncounterCandidates(actors, comments, encounter, operation, sceneIds = new Set()) {
  const states = deriveCombatStateFromComments(comments);
  const profiles = new Map();
  const candidates = actors.map(actor => {
    const profile = resolver.resolve(actor);
    const actorId = String(actor.id || profile.characterId || '');
    profiles.set(actorId, profile);
    const snapshot = captureEncounterSnapshot(profile, states.get(actorId));
    return {
      actorId, name: String(actor.name || profile.name || 'Unbekannte Figur'), title: String(actor.title || ''),
      sourceId: String(actor.sourceCreatureId || actor.sceneActorSourceId || ''),
      portrait: String(actor.portrait || profile.portrait || ''), level: getEffectiveCombatLevel(profile),
      entityType: actor.entityType === 'creature' ? 'creature' : 'character',
      currentHitPoints: snapshot.current, maximumHitPoints: snapshot.maximum,
      conditionNames: snapshot.conditions.map(condition => condition.name),
      concentrationName: snapshot.concentration, channelingName: snapshot.channeling,
      partyId: '', partyName: '', status: 'active', selected: false,
      inScene: sceneIds.has(actorId) || sceneIds.has(actor.name),
      persistence: profile.persistence || (actor.sourceCreatureId || actor.sceneActorSourceId
        ? { kind: 'scene-creature', sourceCreatureId: actor.sourceCreatureId || actor.sceneActorSourceId }
        : { kind: actor.entityType === 'creature' ? 'creature' : 'character', recordId: actorId }),
      searchText: encounterSearchText(actor.name, actor.title, actor.entityType)
    };
  }).filter(candidate => candidate.actorId);
  const byId = new Map(candidates.map(candidate => [candidate.actorId, candidate]));
  const participants = [...(encounter?.participants?.values() || [])];
  const activeIds = new Set(participants.filter(participant => participant.status === 'active').map(participant => participant.actorId));
  const result = ['remove', 'end'].includes(operation)
    ? participants.map(participant => ({ ...byId.get(participant.actorId), ...participant,
      inScene: true, selected: operation === 'end', searchText: encounterSearchText(participant.name, participant.partyName, participant.status)
    }))
    : candidates.filter(candidate => operation !== 'add' || !activeIds.has(candidate.actorId));
  result.sort((a, b) => Number(b.inScene) - Number(a.inScene));
  return { candidates: result, profiles, states };
}

export function readEncounterParticipants(root, candidates, operation) {
  const byId = new Map(candidates.map(candidate => [candidate.actorId, candidate]));
  return [...root.querySelectorAll('[data-combat-encounter-candidate]')].flatMap(row => {
    if (operation !== 'end' && !row.querySelector('[data-combat-encounter-field="participant"]')?.checked) return [];
    const candidate = byId.get(row.dataset.actorId);
    if (!candidate) return [];
    const partyName = String(row.querySelector('[data-combat-encounter-field="party"]')?.value || candidate.partyName || candidate.partyId || '').trim();
    return [{ ...candidate,
      partyName,
      partyId: ['end', 'remove'].includes(operation) ? candidate.partyId
        : partyName.toLocaleLowerCase('de').replace(/[^a-z0-9äöüß]+/g, '-').replace(/^-|-$/g, '') || 'neutral',
      status: row.querySelector('[data-combat-encounter-field="status"]')?.value || candidate.status || 'active',
      eligibleForExperience: candidate.persistence?.kind === 'character'
    }];
  });
}

export function captureEncounterCandidateDraft(root) {
  return new Map([...root.querySelectorAll('[data-combat-encounter-candidate]')].map(row => [row.dataset.actorId, {
    selected: !!row.querySelector('[data-combat-encounter-field="participant"]')?.checked,
    partyName: row.querySelector('[data-combat-encounter-field="party"]')?.value,
    status: row.querySelector('[data-combat-encounter-field="status"]')?.value
  }]));
}
