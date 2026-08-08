import { splitEncounterExperience } from './combat-progression.js?v=20260807-magic-system-v1';
import {
  applyCombatEncounterAuraApplicationsToStateMap,
  normalizeCombatEncounterAuraApplication
} from './combat-encounter-aura.js?v=20260808-duncan-v1';

export const COMBAT_ENCOUNTER_EVENT_KIND = 'combat-encounter-event';
export const COMBAT_ENCOUNTER_SCHEMA_VERSION = 1;
const OPERATIONS = new Set(['start', 'add', 'remove', 'end']);
const STATUSES = new Set(['active', 'defeated', 'fled', 'left']);

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
    experienceValue: integer(source.experienceValue),
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
    encounterId: text(source.encounterId, 180),
    operation: OPERATIONS.has(operation) ? operation : 'add',
    title: text(source.title || 'Kampfankündigung', 180),
    body: text(source.body, 4000),
    participants,
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

function getCommentCombatResolutions(comment = {}) {
  const segments = Array.isArray(comment.commentSegments) ? comment.commentSegments : [];
  const nested = segments.flatMap(segment => Array.isArray(segment?.combatResolutions) && segment.combatResolutions.length
    ? segment.combatResolutions
    : [segment?.combatResolution]);
  if (nested.some(Boolean)) return nested.filter(Boolean);
  return comment.combatResolution ? [comment.combatResolution] : [];
}

function applyCombatResolutionToEncounters(encounters, resolution = {}) {
  const targetId = text(resolution.targetId, 180);
  if (!targetId) return;
  const encounter = [...encounters.values()].reverse().find(candidate => candidate.active && candidate.participants.has(targetId));
  if (!encounter) return;
  const participant = encounter.participants.get(targetId);
  const defeated = resolution.defeat?.occurred === true
    || (Number(resolution.targetSnapshot?.hitPointsBefore) > 0 && Number(resolution.targetSnapshot?.hitPointsAfter) === 0);
  const recovered = participant.status === 'defeated'
    && Number(resolution.targetSnapshot?.hitPointsBefore) === 0
    && Number(resolution.targetSnapshot?.hitPointsAfter) > 0;
  if (!defeated && !recovered) return;
  encounter.participants.set(targetId, {
    ...participant,
    status: defeated ? 'defeated' : 'active'
  });
}

export function deriveCombatEncounterState(comments = []) {
  const encounters = new Map();
  (Array.isArray(comments) ? comments : []).forEach(comment => {
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
          events: []
        };
        if (event.operation === 'start') {
          current.active = true;
          current.title = event.title;
          current.startedBy = text(comment.createdBy, 180);
          current.participants = new Map();
        }
        event.participants.forEach(participant => {
          const previous = current.participants.get(participant.actorId) || {};
          current.participants.set(participant.actorId, {
            ...previous,
            ...participant,
            status: event.operation === 'remove' && participant.status === 'active' ? 'left' : participant.status
          });
        });
        if (event.operation === 'end') {
          current.active = false;
          current.winningPartyId = event.winningPartyId;
        }
        current.events.push({ commentId: String(comment.id || ''), operation: event.operation });
        encounters.set(event.encounterId, current);
      }
    }
    getCommentCombatResolutions(comment).forEach(resolution => applyCombatResolutionToEncounters(encounters, resolution));
  });
  return encounters;
}

export function getActiveCombatEncounter(comments = []) {
  return [...deriveCombatEncounterState(comments).values()].reverse().find(encounter => encounter.active) || null;
}

export function getActiveCombatPartyMap(comments = []) {
  const encounter = getActiveCombatEncounter(comments);
  if (!encounter) return new Map();
  return new Map([...encounter.participants.entries()]
    .filter(([, participant]) => participant.status === 'active')
    .map(([actorId, participant]) => [String(actorId), String(participant.partyId || 'neutral')]));
}

export function getEncounterRelationship(firstActorId = '', secondActorId = '', partyMap = new Map()) {
  const firstParty = partyMap instanceof Map ? String(partyMap.get(String(firstActorId)) || '') : '';
  const secondParty = partyMap instanceof Map ? String(partyMap.get(String(secondActorId)) || '') : '';
  if (!firstParty || !secondParty || firstParty === 'neutral' || secondParty === 'neutral') return '';
  return firstParty === secondParty ? 'ally' : 'enemy';
}

export function buildEncounterExperienceAwards(encounter = {}, winningPartyId = '') {
  const participants = encounter.participants instanceof Map
    ? [...encounter.participants.values()]
    : (Array.isArray(encounter.participants) ? encounter.participants : []);
  const defeatedExperience = participants
    .filter(participant => participant.partyId !== winningPartyId && ['defeated', 'fled'].includes(participant.status))
    .reduce((sum, participant) => sum + integer(participant.experienceValue), 0);
  const recipients = participants
    .filter(participant => participant.partyId === winningPartyId && participant.eligibleForExperience !== false)
    .map(participant => ({ actorId: participant.actorId, name: participant.name, eligible: true }));
  return { totalExperience: defeatedExperience, awards: splitEncounterExperience(defeatedExperience, recipients) };
}

export function applyCombatEncounterCommentToStateMap(states, comment = {}) {
  if (!(states instanceof Map) || !isCombatEncounterComment(comment)) return states;
  const event = normalizeCombatEncounterEvent(comment.combatEncounter || comment);
  if (['start', 'add', 'remove', 'end'].includes(event.operation)) {
    applyCombatEncounterAuraApplicationsToStateMap(states, event);
  }
  if (!['remove', 'end'].includes(event.operation)) return states;
  const participantIds = event.operation === 'end'
    ? new Set([...states.keys()].map(String))
    : new Set(event.participants.map(participant => participant.actorId));
  participantIds.forEach(actorId => {
    const previous = states.get(actorId);
    if (!previous) return;
    const temporaryConditions = (Array.isArray(previous.temporaryConditions) ? previous.temporaryConditions : [])
      .filter(condition => !['combat', 'concentration', 'channeling'].includes(String(condition?.durationModel?.kind || '')));
    states.set(actorId, {
      ...previous,
      temporaryConditions,
      concentration: null,
      channeling: null,
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
  getCommentCombatResolutions,
  applyCombatResolutionToEncounters
});
