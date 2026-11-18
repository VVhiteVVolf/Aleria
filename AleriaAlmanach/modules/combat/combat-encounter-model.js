import { splitEncounterExperience } from './combat-progression.js?v=20260807-magic-system-v1';
import { isSilentSceneRegeneration } from '../scene-regeneration/scene-regeneration-model.js';
import { normalizeCombatEncounterStartApplications, applyCombatEncounterStartApplicationsToStateMap } from './combat-encounter-start-effects.js';
import {
  applyCombatEncounterAuraApplicationsToStateMap,
  normalizeCombatEncounterAuraApplication
} from './combat-encounter-aura.js?v=20260928-equipment-art-v4';
import { normalizeEncounterSnapshot, normalizeCombatEncounterSummary } from './combat-encounter-summary.js';
import { ENCOUNTER_TYPE_LABELS, ENCOUNTER_OUTCOME_LABELS, ENCOUNTER_REASON_LABELS } from './combat-encounter-outcome.js';
import { getCombatRulesRelease } from './combat-rules-release.js';
import { getCombatResolutionTree, getSegmentCombatResolutions, getSegmentSkillCombatResolutions, getSegmentCombatStateReceipts } from './combat-resolution-tree.js';

export const COMBAT_ENCOUNTER_EVENT_KIND = 'combat-encounter-event';
export const COMBAT_ENCOUNTER_SCHEMA_VERSION = 2;
const OPERATIONS = new Set(['start', 'add', 'remove', 'end']);
const STATUSES = new Set(['active', 'defeated', 'surrendered', 'fled', 'left']);

function text(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

function integer(value, fallback = 0, minimum = 0, maximum = 999999999) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

export function normalizeEncounterParticipant(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const status = text(source.status, 30);
  const actorId = text(source.actorId || source.id || `participant-${index + 1}`, 180);
  return {
    actorId,
    sourceId: text(source.sourceId, 180),
    name: text(source.name || 'Unbekannte Figur', 180),
    portrait: text(source.portrait, 2000),
    level: integer(source.level, 1, 0, 999),
    partyId: text(source.partyId || 'neutral', 100),
    partyName: text(source.partyName || source.partyId || 'Neutral', 140),
    status: STATUSES.has(status) ? status : 'active',
    canActAtZeroHitPoints: source.canActAtZeroHitPoints === true,
    experienceValue: integer(source.experienceValue),
    entrySnapshot: normalizeEncounterSnapshot(source.entrySnapshot),
    eligibleForExperience: source.eligibleForExperience !== false,
    persistence: source.persistence && typeof source.persistence === 'object' ? { ...source.persistence } : {}
  };
}

export function normalizeCombatEncounterEvent(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const operation = text(source.operation, 30);
  const participants = (Array.isArray(source.participants) ? source.participants : [])
    .slice(0, 100)
    .map(normalizeEncounterParticipant);
  return {
    kind: COMBAT_ENCOUNTER_EVENT_KIND,
    schemaVersion: COMBAT_ENCOUNTER_SCHEMA_VERSION,
    criticalEffectsVersion: source.criticalEffectsVersion === 1 ? 1 : 0,
    encounterId: text(source.encounterId, 180),
    operation: OPERATIONS.has(operation) ? operation : 'add',
    title: text(source.title || 'Kampfankündigung', 180),
    body: text(source.body, 4000),
    combatType: Object.hasOwn(ENCOUNTER_TYPE_LABELS, source.combatType) ? source.combatType : 'combat',
    outcome: Object.hasOwn(ENCOUNTER_OUTCOME_LABELS, source.outcome) ? source.outcome : (source.winningPartyId ? 'victory' : ''),
    endReason: Object.hasOwn(ENCOUNTER_REASON_LABELS, source.endReason) ? source.endReason : '',
    expectedRevision: text(source.expectedRevision, 240),
    summary: normalizeCombatEncounterSummary(source.summary),
    participants,
    startApplications: normalizeCombatEncounterStartApplications(source.startApplications),
    auraApplications: (Array.isArray(source.auraApplications) ? source.auraApplications : [])
      .slice(0, 500)
      .map(normalizeCombatEncounterAuraApplication),
    winningPartyId: text(source.winningPartyId, 100),
    awardExperience: source.awardExperience !== false,
    experience: {
      total: integer(source.experience?.total),
      awards: (Array.isArray(source.experience?.awards) ? source.experience.awards : []).slice(0, 100).map(award => ({
        actorId: text(award.actorId, 180),
        name: text(award.name, 180),
        experience: integer(award.experience),
        beforeExperience: integer(award.beforeExperience),
        afterExperience: integer(award.afterExperience),
        levelUpAvailable: award.levelUpAvailable === true,
        availableLevel: integer(award.availableLevel, 1, 1, 20)
      }))
    }
  };
}

export function isCombatEncounterComment(comment = {}) {
  return !!(comment.combatEncounter || comment.commentKind === COMBAT_ENCOUNTER_EVENT_KIND || comment.commentMode === 'combat-encounter');
}

// Existing membership and reward values are owned by the original encounter,
// never by a status form. Normalized missing fields must not zero those values.
export function mergeEncounterParticipantUpdates(previousParticipants = [], event = {}) {
  const merged = new Map(previousParticipants.map(participant => [participant.actorId, participant]));
  for (const participant of event.participants || []) {
    const previous = merged.get(participant.actorId);
    const status = event.operation === 'remove' && participant.status === 'active' ? 'left' : participant.status;
    merged.set(participant.actorId, previous ? {
      ...previous, status,
      ...(event.operation === 'add' ? {
        partyId: participant.partyId, partyName: participant.partyName, canActAtZeroHitPoints: participant.canActAtZeroHitPoints
      } : {})
    } : { ...participant, status });
  }
  return merged;
}

function participantStatusAfterHitPoints(participant, before, after, explicitDefeat = false) {
  if (participant.status === 'active' && !participant.canActAtZeroHitPoints
    && (explicitDefeat || (Number(before) > 0 && after != null && after !== '' && Number(after) === 0))) {
    return 'defeated';
  }
  if (participant.status === 'defeated' && before != null && before !== '' && Number(before) === 0 && Number(after) > 0) {
    return 'active';
  }
  return participant.status;
}

function applyParticipantHitPoints(encounters, actorId, before, after, explicitDefeat = false) {
  const id = text(actorId, 180);
  if (!id) return;
  const encounter = [...encounters.values()].reverse().find(candidate => candidate.active && candidate.participants.has(id));
  const participant = encounter?.participants.get(id);
  if (!participant) return;
  const status = participantStatusAfterHitPoints(participant, before, after, explicitDefeat);
  if (status !== participant.status) encounter.participants.set(id, { ...participant, status });
}

function applyCombatResolutionToEncounters(encounters, root) {
  for (const { resolution } of getCombatResolutionTree(root)) {
    const actorSnapshot = resolution.actorHitPointSnapshot;
    const targetSnapshot = resolution.targetSnapshot;
    // State replay gives the actor's final snapshot precedence on self-targets.
    if (resolution.targetId !== resolution.actorId || actorSnapshot?.after?.current == null) {
      applyParticipantHitPoints(encounters, resolution.targetId, targetSnapshot?.hitPointsBefore,
        targetSnapshot?.hitPointsAfter, resolution.defeat?.occurred === true);
    }
    if (actorSnapshot) applyParticipantHitPoints(encounters, resolution.actorId, actorSnapshot.before?.current, actorSnapshot.after?.current);
    for (const snapshot of resolution.herausforderungCombatSnapshots || []) {
      applyParticipantHitPoints(encounters, snapshot.actorId, snapshot.before?.current, snapshot.after?.current);
    }
  }
}

function applyContributionToEncounters(encounters, comment) {
  const segments = Array.isArray(comment.commentSegments) ? comment.commentSegments : [];
  const hasSegmentCombat = segments.some(segment => getSegmentCombatResolutions(segment).length || getSegmentSkillCombatResolutions(segment).length);
  const legacyResolution = hasSegmentCombat ? null : comment.combatResolution;
  if (legacyResolution) applyCombatResolutionToEncounters(encounters, legacyResolution);
  for (const segment of segments) {
    for (const receipt of getSegmentCombatStateReceipts(segment)) applyCombatResolutionToEncounters(encounters, receipt);
    if (!segment?.skillResolution?.herausforderungCombatSnapshots?.length) {
      for (const receipt of getSegmentSkillCombatResolutions(segment)) applyCombatResolutionToEncounters(encounters, receipt);
    }
  }
  return hasSegmentCombat || !!legacyResolution;
}

export function deriveCombatEncounterState(comments = []) {
  const encounters = new Map();
  (Array.isArray(comments) ? comments : []).forEach(comment => {
    if (isSilentSceneRegeneration(comment)) {
      for (const participant of comment.sceneRegeneration.participants) {
        applyParticipantHitPoints(encounters, participant.actorId, 0, participant.after?.current);
      }
      encounters.forEach(encounter => { if (encounter.active) encounter.revision = String(comment.id || encounter.revision); });
      return;
    }
    const release = getCombatRulesRelease(comment);
    if (release) {
      const encounter = encounters.get(String(release.encounterId));
      if (encounter?.active) {
        encounter.criticalEffectsVersion = 1;
        encounter.revision = String(comment.id || encounter.revision);
      }
      return;
    }
    if (isCombatEncounterComment(comment)) {
      const event = normalizeCombatEncounterEvent(comment.combatEncounter || comment);
      if (event.encounterId) {
        const current = encounters.get(event.encounterId) || {
          encounterId: event.encounterId,
          title: event.title,
          active: false,
          startedBy: '',
          participants: new Map(),
          winningPartyId: '',
          combatType: event.combatType, awardExperience: event.awardExperience, revision: '',
          events: []
        };
        if (event.operation === 'start') {
          current.criticalEffectsVersion = event.criticalEffectsVersion;
          current.active = true;
          current.title = event.title;
          current.startedBy = text(comment.createdBy, 180);
          current.participants = new Map();
          current.combatType = event.combatType;
          current.awardExperience = event.awardExperience;
        }
        current.participants = mergeEncounterParticipantUpdates([...current.participants.values()], event);
        if (event.operation === 'end') {
          current.active = false;
          current.winningPartyId = event.winningPartyId;
          current.outcome = event.outcome;
        }
        current.revision = String(comment.id || current.revision);
        current.events.push({ commentId: String(comment.id || ''), operation: event.operation });
        encounters.set(event.encounterId, current);
      }
    }
    // Critical HP loss occurs before the first action; later healing may revive
    // the participant in the same contribution.
    for (const event of comment.criticalLifecycle || []) if (event.phase === 'start') {
      applyParticipantHitPoints(encounters, event.actorId, event.before?.current, event.after?.current);
    }
    const hasCombatResolution = applyContributionToEncounters(encounters, comment);
    // Conservatively invalidate an open preview after any further mechanical
    // contribution in the scene, including rests and resource use.
    if (!isCombatEncounterComment(comment) && !comment.importedHistoricalMechanics && (comment.serverValidatedMechanics || comment.serverCommitted || hasCombatResolution)) {
      encounters.forEach(encounter => { if (encounter.active) encounter.revision = String(comment.id || encounter.revision); });
    }
  });
  return encounters;
}

export function getActiveCombatEncounter(comments = []) {
  return [...deriveCombatEncounterState(comments).values()].reverse().find(encounter => encounter.active) || null;
}

export function getActiveCombatPartyMap(comments = []) {
  return getCombatEncounterPartyMap(getActiveCombatEncounter(comments));
}

export function getCombatEncounterParticipantStatus(encounter, actorId, { beforeStates, afterStates } = {}) {
  const id = String(actorId || '');
  const participant = encounter?.participants.get(id);
  if (!participant) return '';
  return participantStatusAfterHitPoints(participant, beforeStates?.get(id)?.current ?? participant.entrySnapshot?.current,
    afterStates?.get(id)?.current);
}

export function getCombatEncounterPartyMap(encounter, runtime) {
  if (!encounter) return new Map();
  return new Map([...encounter.participants.entries()]
    .filter(([actorId]) => getCombatEncounterParticipantStatus(encounter, actorId, runtime) === 'active')
    .map(([actorId, participant]) => [String(actorId), String(participant.partyId || 'neutral')]));
}

export function getEncounterRelationship(firstActorId = '', secondActorId = '', partyMap = new Map()) {
  const firstParty = partyMap instanceof Map ? String(partyMap.get(String(firstActorId)) || '') : '';
  const secondParty = partyMap instanceof Map ? String(partyMap.get(String(secondActorId)) || '') : '';
  if (!firstParty || !secondParty || firstParty === 'neutral' || secondParty === 'neutral') return '';
  return firstParty === secondParty ? 'ally' : 'enemy';
}

export function countActiveHostileOpponents(actorId, partyMap = new Map()) {
  if (!partyMap.has(String(actorId))) return null;
  return [...partyMap.keys()].filter(opponentId => getEncounterRelationship(actorId, opponentId, partyMap) === 'enemy').length;
}

export function buildEncounterExperienceAwards(encounter = {}, winningPartyId = '') {
  const participants = encounter.participants instanceof Map
    ? [...encounter.participants.values()]
    : (Array.isArray(encounter.participants) ? encounter.participants : []);
  if (!winningPartyId || !participants.some(participant => participant.partyId === winningPartyId)) return { totalExperience: 0, awards: [] };
  const defeatedExperience = participants
    .filter(participant => participant.partyId !== winningPartyId && ['defeated', 'surrendered', 'fled'].includes(participant.status))
    .reduce((sum, participant) => sum + integer(participant.experienceValue), 0);
  const recipients = participants
    .filter(participant => participant.partyId === winningPartyId && participant.eligibleForExperience !== false)
    .map(participant => ({ actorId: participant.actorId, name: participant.name, eligible: true }));
  return { totalExperience: defeatedExperience, awards: splitEncounterExperience(defeatedExperience, recipients) };
}

export function applyCombatEncounterCommentToStateMap(states, comment = {}) {
  if (!(states instanceof Map) || !isCombatEncounterComment(comment)) return states;
  const event = normalizeCombatEncounterEvent(comment.combatEncounter || comment);
  if (['start', 'add'].includes(event.operation)) {
    event.participants.forEach(participant => {
      const previous = states.get(participant.actorId);
      const snapshot = participant.entrySnapshot;
      const initial = snapshot && (event.operation === 'start' || !previous) ? {
        ...(snapshot.current == null ? {} : { current: snapshot.current }),
        ...(snapshot.maximum == null ? {} : { maximum: snapshot.maximum }),
        ...(snapshot.temporary == null ? {} : { temporary: snapshot.temporary }),
        ...(snapshot.resources.length ? { resources: snapshot.resources } : {})
      } : {};
      const combatRecoveryEncounterIds = previous?.combatRecoveryEncounterIds || [];
      if (!combatRecoveryEncounterIds.includes(event.encounterId)) {
        const resources = initial.resources || previous?.resources || snapshot?.resources;
        if (resources) initial.resources = resources.map(resource => resource.recovery === 'combat'
          ? { ...resource, current: resource.maximum } : resource);
      }
      states.set(participant.actorId, { ...previous, ...initial,
        combatRecoveryEncounterIds: [...new Set([...combatRecoveryEncounterIds, event.encounterId])],
        encounterIds: [...new Set([...(previous?.encounterIds || []), event.encounterId])], encounterStatus: participant.status });
    });
  }
  const participantIds = new Set(event.participants.map(participant => participant.actorId));
  if (event.operation === 'end') states.forEach((state, actorId) => {
    if (state.encounterIds?.includes(event.encounterId) || state.encounterAuraTemporaryHitPoints?.encounterId === event.encounterId
      || state.temporaryConditions?.some(condition => condition.durationModel?.encounterId === event.encounterId)) participantIds.add(actorId);
  });
  if (['start', 'add', 'remove', 'end'].includes(event.operation)) {
    applyCombatEncounterStartApplicationsToStateMap(states, event);
    applyCombatEncounterAuraApplicationsToStateMap(states, event);
  }
  if (!['remove', 'end'].includes(event.operation)) return states;
  participantIds.forEach(actorId => {
    const previous = states.get(actorId);
    if (!previous) return;
    const temporaryConditions = (Array.isArray(previous.temporaryConditions) ? previous.temporaryConditions : [])
      .filter(condition => (condition.durationModel?.encounterId && condition.durationModel.encounterId !== event.encounterId)
        || !['combat', 'concentration', 'channeling'].includes(String(condition?.durationModel?.kind || '')));
    states.set(actorId, {
      ...previous,
      temporaryConditions,
      concentration: null,
      channeling: null,
      encounterIds: (previous.encounterIds || []).filter(id => id !== event.encounterId),
      encounterStatus: event.operation === 'end'
        ? 'ended'
        : (event.participants.find(participant => participant.actorId === actorId)?.status || 'left')
    });
  });
  return states;
}

export const combatEncounterInternals = Object.freeze({
  OPERATIONS,
  STATUSES,
  integer,
  text,
  applyCombatResolutionToEncounters
});
