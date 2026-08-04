import { createHash, randomUUID } from 'node:crypto';
import { HttpsError } from 'firebase-functions/v2/https';
import { getPersistentCombatResources, recoverDailyCombatResources } from '../generated/combat/combat-action-economy.js';
import { applyCombatAbilityUse } from '../generated/combat/combat-ability-uses.js';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState } from '../generated/combat/combat-state-model.js';
import { getCombatRuleAbilityUseRequests } from '../generated/combat/combat-rule-consumption.js';
import { getActiveCombatPartyMap, getEncounterRelationship } from '../generated/combat/combat-encounter-model.js';
import { SkillResolutionService } from '../generated/skill-checks/skill-resolution-service.js';
import {
  collectRecentSkillChallenges,
  collectRevealedChallengeIds,
  getSkillsForCommentKind,
  isSuccessfulSkillOutcome,
  normalizeSkillCheckSettings,
  resolveSkillModifier
} from '../generated/skill-checks/skill-check-model.js';
import { ProvidedDiceAdapter } from './provided-dice-adapter.js';

const EDIT_ROLES = new Set(['editor', 'moderator', 'admin']);
const RECORD_KINDS = new Set(['character', 'creature']);

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

function normalizePersistence(value = {}, actorId = '') {
  const kind = clean(value?.kind, 40);
  if (RECORD_KINDS.has(kind) && value.recordId) {
    if (String(actorId) !== String(value.recordId)) fail('failed-precondition', 'Figuren-ID und Profilquelle stimmen nicht überein.');
    return { kind, recordId: clean(value.recordId, 240), persistent: true };
  }
  if (kind === 'scene-creature' && value.sourceCreatureId) {
    return { kind: 'creature', recordId: clean(value.sourceCreatureId, 240), persistent: false };
  }
  fail('failed-precondition', 'Der Fertigkeitsversuch besitzt keine serverseitig prüfbare Profilquelle.');
}

function canControl(record, persistence, request) {
  if (EDIT_ROLES.has(String(request.auth?.token?.aleriaRole || ''))) return true;
  if (persistence.kind === 'creature') return true;
  const uid = String(request.auth?.uid || '');
  return String(record.ownerUid || record.createdBy || '') === uid
    || (Array.isArray(record.controllerUids) && record.controllerUids.includes(uid));
}

function makeActor(record, persistence, actorId) {
  return { ...record, id: String(actorId), entityType: persistence.kind === 'creature' ? 'creature' : 'character' };
}

function relationshipBetween(first = {}, second = {}) {
  const firstTeam = clean(first.combatTeam || first.fraktion || first.faction, 80).toLocaleLowerCase('de');
  const secondTeam = clean(second.combatTeam || second.fraktion || second.faction, 80).toLocaleLowerCase('de');
  return firstTeam && secondTeam && firstTeam === secondTeam ? 'ally' : 'enemy';
}

function relationshipForActors(firstRecord, secondRecord, firstActorId, secondActorId, partyMap) {
  return getEncounterRelationship(firstActorId, secondActorId, partyMap)
    || relationshipBetween(firstRecord, secondRecord);
}

function recordKey(persistence = {}) {
  return `${persistence.kind}:${persistence.recordId}`;
}

function applySkillRuntimeState(profile = {}, state = null, recoveryDayKey = '') {
  const resolved = overlayCombatHitPointState(profile, state || null);
  return {
    ...resolved,
    resources: recoverDailyCombatResources(resolved.resources || [], recoveryDayKey)
  };
}

function challengeClaimId(challenge = {}) {
  return createHash('sha256').update([
    clean(challenge.commentId, 240),
    String(Number.isInteger(challenge.segmentIndex) ? challenge.segmentIndex : ''),
    clean(challenge.id, 120)
  ].join('\u0000')).digest('hex');
}

function ruleSelectionDescriptors(entry = {}) {
  return (Array.isArray(entry.segment?.skillRuleSelections) ? entry.segment.skillRuleSelections : []).slice(0, 20).map(selection => ({
    actorId: clean(selection.sourceActorId, 240),
    ruleId: clean(selection.ruleId, 160),
    distanceMeters: Math.max(0, Math.min(9999, Number(selection.distanceMeters) || 0)),
    persistence: normalizePersistence(selection.sourcePersistence, selection.sourceActorId)
  }));
}

export function skillSegments(metadata = {}) {
  return (Array.isArray(metadata?.commentSegments) ? metadata.commentSegments : [])
    .map((segment, index) => ({ segment, index, submitted: segment?.skillResolution }))
    .filter(entry => entry.submitted?.resolutionId);
}

export async function validateSkillCommentSegments({
  database,
  transaction,
  request,
  metadata,
  history = [],
  challengeHistory = [],
  rulePeriods = {},
  usedRuleFrequencyKeys = new Set(),
  entryId = '',
  workingStates = new Map(),
  persistentUpdates = new Map()
} = {}) {
  const entries = skillSegments(metadata);
  if (!entries.length) return {
    commentSegments: Array.isArray(metadata?.commentSegments) ? metadata.commentSegments : [],
    usedRuleFrequencyKeys
  };

  const challenges = collectRecentSkillChallenges(challengeHistory, 3);
  const encounterParties = getActiveCombatPartyMap(history);
  const revealed = collectRevealedChallengeIds(history);
  const challengeById = new Map(challenges.map(challenge => [String(challenge.id), challenge]));
  const descriptors = entries.flatMap(entry => {
    const actor = {
      role: 'actor',
      actorId: clean(entry.submitted.actorId, 240),
      persistence: normalizePersistence(entry.submitted.actorPersistence, entry.submitted.actorId)
    };
    const challengeId = clean(entry.segment.skillTargetChallengeId || entry.submitted.targetChallengeId, 120);
    const challenge = challengeById.get(challengeId);
    const target = challenge?.authorPersistence?.recordId || challenge?.authorPersistence?.sourceCreatureId
      ? [{
          role: 'target',
          actorId: clean(challenge.authorId, 240),
          persistence: normalizePersistence(challenge.authorPersistence, challenge.authorId)
        }]
      : [];
    return [actor, ...target, ...ruleSelectionDescriptors(entry).map(selection => ({ role: 'support', ...selection }))];
  });

  const recordEntries = [...new Map(descriptors.map(descriptor => {
    const key = recordKey(descriptor.persistence);
    return [key, {
      key,
      ...descriptor.persistence,
      ref: database.collection(descriptor.persistence.kind === 'creature' ? 'creatures' : 'characters').doc(descriptor.persistence.recordId)
    }];
  })).values()];
  const snapshots = await Promise.all(recordEntries.map(entry => transaction.get(entry.ref)));
  const records = new Map();
  recordEntries.forEach((entry, index) => {
    if (!snapshots[index].exists) fail('not-found', 'Das Profil eines Fertigkeitsversuchs wurde nicht gefunden.');
    records.set(entry.key, snapshots[index].data() || {});
  });

  const enhanced = (Array.isArray(metadata?.commentSegments) ? metadata.commentSegments : []).map(segment => ({ ...segment }));
  let usedKeys = usedRuleFrequencyKeys instanceof Set ? new Set(usedRuleFrequencyKeys) : new Set();
  const pendingClaims = [];
  const locallyClaimed = new Set();

  for (const entry of entries) {
    const actorDescriptor = {
      actorId: clean(entry.submitted.actorId, 240),
      persistence: normalizePersistence(entry.submitted.actorPersistence, entry.submitted.actorId)
    };
    const actorRecord = records.get(recordKey(actorDescriptor.persistence));
    if (!canControl(actorRecord, actorDescriptor.persistence, request)) {
      fail('permission-denied', 'Du darfst diese Figur nicht für einen Fertigkeitsversuch einsetzen.');
    }
    const allowed = getSkillsForCommentKind(entry.segment.commentKind || entry.segment.kind);
    const settings = normalizeSkillCheckSettings({
      skillId: entry.segment.skillId || entry.submitted.skillId,
      customModifier: entry.segment.skillCustomModifier ?? entry.submitted.customModifier,
      difficulty: entry.segment.skillDifficulty ?? entry.submitted.difficulty,
      rollMode: entry.segment.skillRollMode || entry.submitted.rollMode,
      targetChallengeId: entry.segment.skillTargetChallengeId || entry.submitted.targetChallengeId
    });
    if (!allowed.some(skill => skill.id === settings.skillId)) {
      fail('failed-precondition', 'Die Fertigkeit passt nicht zur gewählten Blase.');
    }
    const challenge = settings.targetChallengeId
      ? challenges.find(item => item.id === settings.targetChallengeId && !revealed.has(item.id))
      : null;
    if (settings.targetChallengeId && !challenge) fail('failed-precondition', 'Die verdeckte Herausforderung ist nicht mehr auflösbar.');
    if (challenge && (String(challenge.authorId) === String(actorDescriptor.actorId)
      || (challenge.createdBy && String(challenge.createdBy) === String(request.auth?.uid || '')))) {
      fail('failed-precondition', 'Die eigene verdeckte Herausforderung kann nicht selbst untersucht werden.');
    }

    const actor = makeActor(actorRecord, actorDescriptor.persistence, actorDescriptor.actorId);
    const profile = applySkillRuntimeState(
      resolveCombatProfile(actor),
      workingStates.get(String(actorDescriptor.actorId)) || null,
      rulePeriods.day || ''
    );
    const targetDescriptor = challenge?.authorPersistence?.recordId || challenge?.authorPersistence?.sourceCreatureId
      ? { actorId: clean(challenge.authorId, 240), persistence: normalizePersistence(challenge.authorPersistence, challenge.authorId) }
      : null;
    const targetRecord = targetDescriptor ? records.get(recordKey(targetDescriptor.persistence)) : null;
    const targetActor = targetDescriptor && targetRecord
      ? makeActor(targetRecord, targetDescriptor.persistence, targetDescriptor.actorId)
      : null;
    const targetProfile = targetActor
      ? applySkillRuntimeState(resolveCombatProfile(targetActor), workingStates.get(String(targetDescriptor.actorId)) || null, rulePeriods.day || '')
      : null;
    const opposedSkill = challenge && targetActor && challenge.defenseMode !== 'fixed'
      ? resolveSkillModifier(targetProfile, challenge.defenseSkillId || 'deception')
      : null;
    const opposedDifficulty = opposedSkill ? Math.max(1, 10 + Number(opposedSkill.modifier || 0)) : null;

    const sources = [{
      actorId: profile.characterId,
      actorName: profile.name,
      profile,
      sourceRole: 'actor',
      relationToActor: 'self',
      relationToTarget: targetRecord ? relationshipForActors(actorRecord, targetRecord, actorDescriptor.actorId, targetDescriptor.actorId, encounterParties) : 'enemy',
      distanceToActor: 0,
      distanceToTarget: null,
      selectedRuleIds: [],
      persistence: actorDescriptor.persistence
    }];
    if (targetProfile) sources.push({
      actorId: targetProfile.characterId,
      actorName: targetProfile.name,
      profile: targetProfile,
      sourceRole: 'target',
      relationToActor: relationshipForActors(targetRecord, actorRecord, targetDescriptor.actorId, actorDescriptor.actorId, encounterParties),
      relationToTarget: 'self',
      distanceToActor: null,
      distanceToTarget: 0,
      selectedRuleIds: [],
      persistence: targetDescriptor.persistence
    });
    ruleSelectionDescriptors(entry).forEach(selection => {
      const supportRecord = records.get(recordKey(selection.persistence));
      if (!supportRecord) fail('not-found', 'Eine ausgewählte Unterstützungsfigur wurde nicht gefunden.');
      if (!canControl(supportRecord, selection.persistence, request)) {
        fail('permission-denied', 'Du darfst diese Unterstützungsreaktion nicht verwenden.');
      }
      const supportProfile = applySkillRuntimeState(
        resolveCombatProfile(makeActor(supportRecord, selection.persistence, selection.actorId)),
        workingStates.get(String(selection.actorId)) || null,
        rulePeriods.day || ''
      );
      let source = sources.find(item => String(item.actorId) === String(selection.actorId));
      if (!source) {
        source = {
          actorId: selection.actorId,
          actorName: supportProfile.name,
          profile: supportProfile,
          sourceRole: 'support',
          relationToActor: relationshipForActors(supportRecord, actorRecord, selection.actorId, actorDescriptor.actorId, encounterParties),
          relationToTarget: targetRecord ? relationshipForActors(supportRecord, targetRecord, selection.actorId, targetDescriptor.actorId, encounterParties) : 'enemy',
          distanceToActor: selection.distanceMeters,
          distanceToTarget: selection.distanceMeters,
          selectedRuleIds: [],
          persistence: selection.persistence
        };
        sources.push(source);
      }
      source.selectedRuleIds.push(selection.ruleId);
    });

    const service = new SkillResolutionService(new ProvidedDiceAdapter(entry.submitted));
    const resolution = await service.resolve({
      actor,
      settings,
      challenge,
      actorPersistence: entry.submitted.actorPersistence
    }, {
      actorProfile: profile,
      ruleSources: sources,
      targetProfile,
      opposedDifficulty,
      opposedDefense: opposedSkill ? {
        actorId: String(targetDescriptor.actorId),
        actorName: targetProfile.name,
        skillId: opposedSkill.definition.id,
        skillName: opposedSkill.definition.label,
        modifier: opposedSkill.modifier,
        passiveTotal: opposedDifficulty
      } : null,
      rulePeriods,
      usedRuleFrequencyKeys: usedKeys
    });
    usedKeys = new Set(resolution.usedRuleFrequencyKeys || []);
    resolution.resolutionId = randomUUID();
    resolution.serverValidated = true;
    resolution.validatedAt = new Date().toISOString();
    resolution.actorProfileSnapshot = profile.aiSnapshot || null;
    resolution.targetProfileSnapshot = targetProfile?.aiSnapshot || null;
    resolution.customModifierDeclared = Number(settings.customModifier) !== 0;
    resolution.originalAttempt = clean(entry.segment.text, 5000);
    resolution.targetContribution = clean(challenge?.visibleText, 5000);

    (Array.isArray(resolution.ruleResourceSnapshots) ? resolution.ruleResourceSnapshots : []).forEach(snapshot => {
      const source = sources.find(item => String(item.actorId) === String(snapshot.sourceActorId));
      if (!source) return;
      const sourceId = String(snapshot.sourceActorId);
      const previous = workingStates.get(sourceId) || {};
      workingStates.set(sourceId, { ...previous, resources: snapshot.after });
      if (source.persistence?.persistent) {
        const key = recordKey(source.persistence);
        const existing = persistentUpdates.get(key) || {
          entry: recordEntries.find(item => item.key === key),
          record: records.get(key)
        };
        existing.resources = getPersistentCombatResources(source.profile.resources, snapshot.after);
        persistentUpdates.set(key, existing);
      }
    });

    const abilitySnapshots = [];
    getCombatRuleAbilityUseRequests(resolution.ruleApplications).forEach(requested => {
      const source = sources.find(item => String(item.actorId) === requested.sourceActorId);
      if (!source) fail('failed-precondition', 'Die Fähigkeitsquelle einer Fertigkeitsreaktion fehlt.');
      const sourceId = requested.sourceActorId;
      const currentState = workingStates.get(sourceId) || {};
      const currentAbilities = Array.isArray(currentState.abilities) ? currentState.abilities : source.profile.abilities;
      const consumed = applyCombatAbilityUse(currentAbilities, `ability:${requested.abilityId}`, rulePeriods.day || '');
      if (!consumed.sufficient) fail('failed-precondition', `${consumed.missing?.name || requested.ruleName} hat keine Nutzung mehr übrig.`);
      if (!consumed.changed) return;
      workingStates.set(sourceId, { ...currentState, abilities: consumed.abilities });
      abilitySnapshots.push({
        sourceActorId: sourceId,
        applicationKey: requested.applicationKey,
        before: consumed.beforeAbilities,
        after: consumed.abilities,
        change: consumed.use
      });
      if (source.persistence?.persistent) {
        const key = recordKey(source.persistence);
        const existing = persistentUpdates.get(key) || {
          entry: recordEntries.find(item => item.key === key),
          record: records.get(key)
        };
        existing.abilities = consumed.abilities;
        persistentUpdates.set(key, existing);
      }
    });
    if (abilitySnapshots.length) resolution.ruleAbilitySnapshots = abilitySnapshots;

    if (challenge && isSuccessfulSkillOutcome(resolution.outcome)) {
      const claimId = challengeClaimId(challenge);
      if (locallyClaimed.has(claimId)) fail('already-exists', 'Diese Herausforderung wurde in diesem Beitrag bereits aufgelöst.');
      const claimRef = database.collection('skill_challenge_claims').doc(claimId);
      const claimSnapshot = await transaction.get(claimRef);
      if (claimSnapshot.exists) fail('already-exists', 'Diese Herausforderung wurde bereits aufgelöst.');
      locallyClaimed.add(claimId);
      pendingClaims.push({ ref: claimRef, challenge, resolution });
    }

    enhanced[entry.index] = { ...entry.segment, skillResolution: resolution };
  }

  pendingClaims.forEach(claim => transaction.create(claim.ref, {
    entryId: clean(entryId, 240),
    challengeId: claim.challenge.id,
    resolutionId: claim.resolution.resolutionId,
    resolvedBy: request.auth?.uid || '',
    resolvedAt: new Date().toISOString()
  }));
  return { commentSegments: enhanced, usedRuleFrequencyKeys: usedKeys };
}

export const skillCommentValidatorInternals = Object.freeze({
  normalizePersistence,
  canControl,
  relationshipBetween,
  challengeClaimId,
  ruleSelectionDescriptors,
  applySkillRuntimeState
});
