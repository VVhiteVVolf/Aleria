import { applyChallengeOutcome, challengeBenefitBundles } from '../generated/herausforderung/herausforderung-outcomes.js';
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
  getChecksForCommentKind,
  isSuccessfulSkillOutcome,
  normalizeSkillCheckSettings,
  resolveSkillModifier
} from '../generated/skill-checks/skill-check-model.js';
import { classifyHerausforderungOutcome, collectHerausforderungApproaches } from '../generated/herausforderung/herausforderung-model.js';
import { ProvidedDiceAdapter } from './provided-dice-adapter.js';
import { benefitsForTier } from '../generated/herausforderung/herausforderung-rewards.js';
import { applyHerausforderungRewardToAttempt, herausforderungEffectClaimId } from './herausforderung-rewards.js';
import { challengeCombatDescriptors, stageHerausforderungCombatBenefits } from './herausforderung-combat-effects.js';
import { getChallengeCombatBindingError } from '../generated/herausforderung/herausforderung-combat-context.js';
import { getActiveCombatEncounter } from '../generated/combat/combat-encounter-model.js';
import { withResolvedChallengeTarget } from '../generated/herausforderung/herausforderung-target.js';
import { getChallengeCheckRule } from '../generated/herausforderung/herausforderung-check-policy.js';

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

function herausforderungClaimId(challenge = {}) {
  return createHash('sha256').update(clean(challenge.id, 240)).digest('hex');
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
  usedConsequenceKeys = new Set(),
  entryId = '',
  workingStates = new Map(),
  persistentUpdates = new Map(),
  workingInventories = new Map(),
  deferClaimWrites = false,
  maneuverDice,
  segmentIndexes = null,
  locallyClaimed = new Set()
} = {}) {
  const entries = skillSegments(metadata).filter(entry => !segmentIndexes || segmentIndexes.has(entry.index));
  if (!entries.length) return {
    commentSegments: Array.isArray(metadata?.commentSegments) ? metadata.commentSegments : [],
    usedRuleFrequencyKeys
  };

  const challenges = [
    ...collectRecentSkillChallenges(challengeHistory, 3),
    ...collectHerausforderungApproaches(challengeHistory)
  ];
  const encounterParties = getActiveCombatPartyMap(history);
  const encounter = getActiveCombatEncounter(history);
  const encounterId = encounter?.encounterId || '';
  const revealed = collectRevealedChallengeIds(history);
  const challengeById = new Map(challenges.map(challenge => [String(challenge.id), challenge]));
  const descriptors = entries.flatMap(entry => {
    const actor = {
      role: 'actor',
      actorId: clean(entry.submitted.actorId, 240),
      persistence: normalizePersistence(entry.submitted.actorPersistence, entry.submitted.actorId)
    };
    const challengeId = clean(entry.segment.skillTargetChallengeId || entry.submitted.targetChallengeId, 120);
    const challenge = withResolvedChallengeTarget(challengeById.get(challengeId), { encounter, actorId: actor.actorId });
    const target = challenge?.authorPersistence?.recordId || challenge?.authorPersistence?.sourceCreatureId
      ? [{
          role: 'target',
          actorId: clean(challenge.authorId, 240),
          persistence: normalizePersistence(challenge.authorPersistence, challenge.authorId)
        }]
      : [];
    const recipients = challenge ? challengeCombatDescriptors(challenge, encounter).map(descriptor => ({ ...descriptor, persistence: normalizePersistence(descriptor.persistence, descriptor.actorId) })) : [];
    return [actor, ...target, ...recipients, ...ruleSelectionDescriptors(entry).map(selection => ({ role: 'support', ...selection }))];
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

  for (const entry of entries) {
    const actorDescriptor = {
      actorId: clean(entry.submitted.actorId, 240),
      persistence: normalizePersistence(entry.submitted.actorPersistence, entry.submitted.actorId)
    };
    const actorRecord = records.get(recordKey(actorDescriptor.persistence));
    const allowed = getChecksForCommentKind(entry.segment.commentKind || entry.segment.kind);
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
    const unresolvedChallenge = settings.targetChallengeId
      ? challenges.find(item => item.id === settings.targetChallengeId && !revealed.has(item.id))
      : null;
    const challenge = withResolvedChallengeTarget(unresolvedChallenge, { encounter, actorId: actorDescriptor.actorId });
    if (settings.targetChallengeId && !challenge) fail('failed-precondition', 'Die verdeckte Herausforderung ist nicht mehr auflösbar.');
    if (!getChallengeCheckRule(challenge, settings.skillId).allowed) fail('failed-precondition', 'Diese Probe ist für den gewählten Lösungsweg gesperrt.');
    if (challenge && challenge.source !== 'herausforderung' && (String(challenge.authorId) === String(actorDescriptor.actorId)
      || (challenge.createdBy && String(challenge.createdBy) === String(request.auth?.uid || '')))) {
      fail('failed-precondition', 'Die eigene verdeckte Herausforderung kann nicht selbst untersucht werden.');
    }

    const eligibility = challenge && getChallengeCombatBindingError(challenge, encounter, actorDescriptor.actorId);
    if (eligibility) fail('failed-precondition', eligibility);

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
    if (targetProfile && targetDescriptor.actorId !== actorDescriptor.actorId) sources.push({
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

    if (challenge?.source === 'herausforderung' && challengeBenefitBundles(challenge).some(bundle => bundle.combatEffects?.some(effect => effect.type === 'weapon-maneuver'))
      && entry.submitted.herausforderungManeuverVersion !== 1) fail('failed-precondition', 'Diese Herausforderung verwendet neue Waffenmanöver. Bitte die Seite vollständig neu laden und den Versuch erneut öffnen.');
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
    if (challenge?.source === 'herausforderung') {
      const tier = classifyHerausforderungOutcome(resolution);
      resolution.herausforderungTier = tier;
      resolution.herausforderungEncounterId = encounterId;
      const revealText = tier === 'kritischer-erfolg' || tier === 'erfolg'
        ? challenge.insight
        : (tier === 'knapp' ? challenge.partialHint : challenge.failureConsequence);
      if (revealText) resolution.revealedText = clean(revealText, 5000);
      applyChallengeOutcome(challenge, resolution);
      if (challenge.attemptLimit === 1) {
        const attemptId = 'attempt-' + herausforderungClaimId(challenge);
        const ref = database.collection('herausforderung_attempt_claims').doc(attemptId);
        const snapshot = await transaction.get(ref);
        const priorAttempt = history.some(comment => (comment.commentSegments || []).some(segment => segment.skillResolution?.targetChallengeId === challenge.id));
        if (snapshot.exists || priorAttempt || locallyClaimed.has(attemptId)) fail('already-exists', 'Dieser Lösungsweg wurde bereits versucht.');
        locallyClaimed.add(attemptId);
        pendingClaims.push({ ref, challenge, resolution });
      }
    }

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
      const isHerausforderungApproach = challenge.source === 'herausforderung';
      const claimId = isHerausforderungApproach ? herausforderungClaimId(challenge) : challengeClaimId(challenge);
      if (locallyClaimed.has(claimId)) fail('already-exists', 'Diese Herausforderung wurde in diesem Beitrag bereits aufgelöst.');
      const claimRef = database.collection(isHerausforderungApproach ? 'herausforderung_claims' : 'skill_challenge_claims').doc(claimId);
      const claimSnapshot = await transaction.get(claimRef);
      if (claimSnapshot.exists) fail('already-exists', 'Diese Herausforderung wurde bereits aufgelöst.');
      locallyClaimed.add(claimId);
      pendingClaims.push({ ref: claimRef, challenge, resolution });
    }

    if (challenge?.source === 'herausforderung') {
      const tier = resolution.herausforderungTier;
      const benefits = benefitsForTier(challenge, tier);
      const hasBenefits = !!(benefits?.copper || benefits?.items?.length || benefits?.effects?.length || benefits?.combatEffects?.length);
      const success = isSuccessfulSkillOutcome(resolution.outcome);
      const claimId = success ? herausforderungClaimId(challenge) : herausforderungEffectClaimId(challenge.id, actorDescriptor.actorId, tier);
      let eligible = hasBenefits;
      if (!success && hasBenefits) {
        const ref = database.collection('herausforderung_effect_claims').doc(claimId);
        const snapshot = await transaction.get(ref);
        eligible = !snapshot.exists && !locallyClaimed.has(claimId);
        if (eligible) { locallyClaimed.add(claimId); pendingClaims.push({ ref, challenge, resolution }); }
        else resolution.herausforderungReward = { schemaVersion: 1, alreadyApplied: true, tier, actorId: actorDescriptor.actorId, challengeId: challenge.id, copper: 0, items: [], effects: [] };
      }
      if (eligible) {
        if (!actorDescriptor.persistence.persistent && (benefits.copper || benefits.items?.length)) fail('failed-precondition', 'Gegenstände und Geld benötigen einen dauerhaften Inventarempfänger.');
        const key = recordKey(actorDescriptor.persistence);
        const update = persistentUpdates.get(key);
        const grant = applyHerausforderungRewardToAttempt({ challenge, resolution, actor, profile,
          state: workingStates.get(actorDescriptor.actorId) || {}, inventory: workingInventories.get(key) || update?.inventory || actorRecord.inventory || {},
          equipment: update?.equipment || {}, identity: claimId, encounterId });
        if (grant) {
          const combat = await stageHerausforderungCombatBenefits({ challenge, actorId: actorDescriptor.actorId, benefits, identity: claimId,
            encounter, submitted: entry.submitted, descriptors, records, recordEntries, workingStates, persistentUpdates, recoveryDayKey: rulePeriods.day,
            history, rulePeriods, usedRuleFrequencyKeys: usedKeys, usedConsequenceKeys, maneuverDice });
          resolution.usedRuleFrequencyKeys = [...usedKeys];
          resolution.herausforderungCombatResults = combat.results;
          resolution.herausforderungCombatSnapshots = combat.snapshots;
          resolution.herausforderungCombatSaves = combat.saves;
          resolution.herausforderungEncounterId = combat.encounterId;
          resolution.herausforderungReward = { ...grant.receipt,
            effects: combat.results.filter(result => result.condition).map(result => ({ ...result.condition, actorId: result.actorId, actorName: result.actorName })),
            combatEffects: combat.results.filter(result => !result.condition) };
          if (grant.actorInventorySnapshot) resolution.actorInventorySnapshot = grant.actorInventorySnapshot;
          if (grant.actorConditionSnapshot) resolution.actorConditionSnapshot = grant.actorConditionSnapshot;
          const current = workingStates.get(actorDescriptor.actorId) || {};
          workingStates.set(actorDescriptor.actorId, { ...current,
            ...(grant.inventoryChanged ? { inventory: grant.inventory } : {}),
            ...(grant.actorConditionSnapshot ? { temporaryConditions: grant.actorConditionSnapshot.after } : {}) });
          if (grant.inventoryChanged) {
            workingInventories.set(key, grant.inventory);
            persistentUpdates.set(key, { ...(persistentUpdates.get(key) || update || { entry: recordEntries.find(entry => entry.key === key), record: actorRecord }),
              inventory: grant.inventory, equipment: { weapons: grant.combatProfile.weapons || [], armorItems: grant.combatProfile.armorItems || [] } });
          }
        }
      }
    }

    enhanced[entry.index] = { ...entry.segment, skillResolution: resolution };
  }

  const claimWrites = pendingClaims.map(claim => ({ ref: claim.ref, data: {
    entryId: clean(entryId, 240),
    challengeId: claim.challenge.id,
    resolutionId: claim.resolution.resolutionId,
    resolvedBy: request.auth?.uid || '',
    actorId: claim.resolution.actorId,
    tier: claim.resolution.herausforderungTier || '',
    resolvedAt: new Date().toISOString()
  } }));
  if (!deferClaimWrites) persistSkillChallengeClaims(transaction, claimWrites);
  return { commentSegments: enhanced, usedRuleFrequencyKeys: usedKeys, claimWrites };
}

export function persistSkillChallengeClaims(transaction, claims = []) {
  claims.forEach(claim => transaction.create(claim.ref, claim.data));
}

export const skillCommentValidatorInternals = Object.freeze({
  normalizePersistence,
  relationshipBetween,
  challengeClaimId,
  herausforderungClaimId,
  ruleSelectionDescriptors,
  applySkillRuntimeState
});
