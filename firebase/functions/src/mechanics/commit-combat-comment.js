import { randomUUID } from 'node:crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { getPersistentCombatResources, recoverDailyCombatResources, resetCommentScopedResources } from '../generated/combat/combat-action-economy.js';
import { applyCombatAbilityUse } from '../generated/combat/combat-ability-uses.js';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../generated/combat/combat-equipment-state.js';
import { CombatResolutionService } from '../generated/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, getResolutionActorChannelingState, getResolutionActorConcentrationState, getResolutionActorConditionState, getResolutionActorEquippedWeaponState, getResolutionActorHitPointState, getResolutionActorInventoryState, getResolutionActorResourceState, getResolutionHitPointState, getResolutionTargetChannelingState, getResolutionTargetConditionState, getResolutionTargetConcentrationState, getResolutionTargetResourceState, overlayCombatHitPointState } from '../generated/combat/combat-state-model.js';
import { deriveCombatRuleFrequencyKeys } from '../generated/combat/combat-trigger-rules.js';
import { getActiveCombatPartyMap, getActiveCombatEncounter } from '../generated/combat/combat-encounter-model.js';
import { getEncounterActionValidationError } from '../generated/combat/combat-encounter-lifecycle.js';
import { nextMechanicalCommentOrderKey } from './mechanical-comment-order.js';
import { getEffectiveCombatSegmentKind } from '../generated/combat/combat-segment-model.js';
import {
  applyInventoryUseAbilityEffects,
  applyInventoryUseToInventory,
  normalizeInventoryUse
} from '../generated/inventory-use/inventory-use-model.js';
import { ProvidedDiceAdapter } from './provided-dice-adapter.js';
import { getTrustedSceneDay, isTrustedHerausforderungComment, isTrustedMechanicalComment, isTrustedSceneContributionComment, isTrustedSkillChallengeComment, sortSceneHistory } from './trusted-scene-history.js';
import { skillSegments, validateSkillCommentSegments } from './skill-comment-validator.js';
import { compactMechanicalSegmentsForStorage } from './mechanical-resolution-storage.js';

const RECORD_KINDS = new Set(['character', 'creature']);
const MAX_COMMENT_BYTES = 700_000;

function fail(code, message) {
  throw new HttpsError(code, message);
}

function cleanText(value, maximum = 250000) {
  return String(value || '').trim().slice(0, maximum);
}

function clonePayload(value) {
  try {
    const serialized = JSON.stringify(value || {});
    if (Buffer.byteLength(serialized, 'utf8') > MAX_COMMENT_BYTES) fail('invalid-argument', 'Der mechanische Beitrag ist zu groß.');
    return JSON.parse(serialized);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    fail('invalid-argument', 'Der mechanische Beitrag enthält ungültige Daten.');
  }
}

function normalizePersistence(value = {}, actorId = '') {
  const kind = String(value?.kind || '');
  if (RECORD_KINDS.has(kind) && value.recordId) {
    if (String(actorId) !== String(value.recordId)) {
      fail('failed-precondition', 'Persistente Figuren-ID und Profilquelle stimmen nicht \u00fcberein.');
    }
    return { kind, recordId: String(value.recordId), stateKey: String(actorId), persistent: true };
  }
  if (kind === 'scene-creature' && value.sourceCreatureId) {
    return { kind: 'creature', recordId: String(value.sourceCreatureId), stateKey: String(actorId), persistent: false };
  }
  fail('failed-precondition', 'Die beteiligte Figur besitzt keine serverseitig prüfbare Profilquelle.');
}

function ruleSelectionDescriptors(entry) {
  const selections = Array.isArray(entry?.segment?.combatAction?.ruleSelections)
    ? entry.segment.combatAction.ruleSelections
    : [];
  return selections.slice(0, 20).map(selection => ({
    role: 'rule-source',
    actorId: cleanText(selection?.sourceActorId, 240),
    ruleId: cleanText(selection?.ruleId, 160),
    distanceMeters: Math.max(0, Math.min(9999, Number(selection?.distanceMeters) || 0)),
    persistence: normalizePersistence(selection?.sourcePersistence, selection?.sourceActorId)
  }));
}

function collectionFor(kind) {
  return kind === 'creature' ? 'creatures' : 'characters';
}

function combatSegments(metadata) {
  return (Array.isArray(metadata?.commentSegments) ? metadata.commentSegments : [])
    .flatMap((segment, index) => {
      const rawSubmissions = Array.isArray(segment?.combatResolutions) && segment.combatResolutions.length
        ? segment.combatResolutions
        : [segment?.combatResolution];
      const seenTargets = new Set();
      const submissions = rawSubmissions.filter(submitted => {
        const targetId = cleanText(submitted?.targetId, 240);
        if (!targetId || seenTargets.has(targetId)) return false;
        seenTargets.add(targetId);
        return true;
      }).slice(0, 20);
      return submissions.map((submitted, targetIndex) => ({
        segment,
        index,
        submitted,
        targetIndex,
        targetCount: submissions.length,
        primary: targetIndex === 0
      }));
    })
    .filter(entry => entry.submitted?.resolutionId && entry.segment?.combatAction);
}

function inventorySegments(metadata) {
  return (Array.isArray(metadata?.commentSegments) ? metadata.commentSegments : [])
    .map((segment, index) => ({ segment, index, submitted: segment?.inventoryUse }))
    .filter(entry => entry.submitted?.item?.id);
}

function inventoryDescriptor(entry) {
  const submitted = normalizeInventoryUse(entry.submitted);
  if (submitted.actorPersistence?.kind === 'character' && submitted.actorPersistence.recordId) {
    return {
      role: 'inventory-actor',
      actorId: submitted.actorId,
      persistence: normalizePersistence(submitted.actorPersistence, submitted.actorId)
    };
  }
  const sourceCreatureId = cleanText(entry.segment?.sceneActorSourceId || entry.segment?.creatureId, 160);
  if (submitted.mode !== 'consume' && sourceCreatureId) {
    return {
      role: 'inventory-actor',
      actorId: submitted.actorId,
      persistence: { kind: 'creature', recordId: sourceCreatureId, stateKey: String(submitted.actorId), persistent: false }
    };
  }
  fail('failed-precondition', 'Inventarnutzungen brauchen eine serverseitig pr\u00fcfbare Profilquelle.');
}

function makeCharacter(record, persistence, actorId) {
  return {
    ...record,
    id: String(actorId),
    entityType: persistence.kind === 'creature' ? 'creature' : 'character'
  };
}

function makeCharacterWithCombatState(record, persistence, actorId, state = null) {
  return withEquippedCombatWeapon(makeCharacter(record, persistence, actorId), state?.equippedWeaponId);
}

function relationshipBetween(first = {}, second = {}) {
  const firstTeam = String(first.combatTeam || first.fraktion || first.faction || '').trim().toLocaleLowerCase('de');
  const secondTeam = String(second.combatTeam || second.fraktion || second.faction || '').trim().toLocaleLowerCase('de');
  return firstTeam && secondTeam && firstTeam === secondTeam ? 'ally' : 'enemy';
}

function collectSceneActorTeams(comments = [], currentSegments = []) {
  const teams = getActiveCombatPartyMap(comments);
  const remember = segment => {
    const actorId = cleanText(segment?.sceneActorId || segment?.actorId, 240);
    const team = cleanText(segment?.combatTeam, 80);
    if (actorId && team && !teams.has(actorId)) teams.set(actorId, team);
  };
  comments.forEach(comment => (Array.isArray(comment?.commentSegments) ? comment.commentSegments : []).forEach(remember));
  currentSegments.forEach(remember);
  return teams;
}

function relationshipForActors(firstRecord, secondRecord, firstActorId, secondActorId, sceneTeams) {
  return relationshipBetween(
    { ...firstRecord, combatTeam: sceneTeams.get(String(firstActorId)) || firstRecord?.combatTeam },
    { ...secondRecord, combatTeam: sceneTeams.get(String(secondActorId)) || secondRecord?.combatTeam }
  );
}

function applyStoredState(profile, state) {
  if (!state) return profile;
  return overlayCombatHitPointState(profile, state);
}

function getEffectiveCommentResources(profileResources = [], stateResources = null, recoveryDayKey = '') {
  return recoverDailyCombatResources(
    Array.isArray(stateResources) ? stateResources : resetCommentScopedResources(profileResources),
    recoveryDayKey
  );
}

function consumeAbilityUse(sourceAbilities, resolution, recoveryDayKey = '') {
  const applied = applyCombatAbilityUse(sourceAbilities, resolution.profileActionId, recoveryDayKey);
  if (!applied.sufficient) {
    fail('failed-precondition', `${applied.missing?.name || 'Diese Fähigkeit'} hat keine Nutzung mehr übrig.`);
  }
  return applied;
}

function consumeRuleAbilityUse(sourceAbilities, application, recoveryDayKey = '') {
  if (!application?.consumesAbilityUse || application.entryKind !== 'ability') {
    return { changed: false, abilities: sourceAbilities || [], beforeAbilities: sourceAbilities || [], use: null };
  }
  return consumeAbilityUse(sourceAbilities, {
    profileActionId: `ability:${application.entryId}`
  }, recoveryDayKey);
}

export const commitCombatComment = onCall({
  region: 'europe-west1',
  maxInstances: 20,
  concurrency: 20,
  enforceAppCheck: false,
  timeoutSeconds: 30
}, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const payload = clonePayload(request.data);
  const entryId = cleanText(payload.entryId, 240);
  const text = cleanText(payload.text);
  const metadata = clonePayload(payload.metadata);
  const entries = combatSegments(metadata);
  const inventoryEntries = inventorySegments(metadata);
  const skillEntries = skillSegments(metadata);
  if (!entryId || !text || (!entries.length && !inventoryEntries.length && !skillEntries.length)) {
    fail('invalid-argument', 'Beitrag und mindestens ein mechanischer Vorgang sind erforderlich.');
  }

  const database = getFirestore();
  const commentRef = database.collection('comments').doc();
  const nowClient = Date.now();
  let committedComment;
  let profileUpdates = [];
  let responseSegments = [];

  await database.runTransaction(async transaction => {
    const threadSnapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const allHistory = sortSceneHistory(threadSnapshot.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() })));
    const trustedHistory = allHistory.filter(isTrustedMechanicalComment);
    const encounter = getActiveCombatEncounter(trustedHistory);
    for (const { segment, submitted } of entries) {
      const error = getEncounterActionValidationError({ ...segment.combatAction, actorId: submitted.actorId }, encounter);
      if (error) fail('failed-precondition', error);
    }
    const historyStates = deriveCombatStateFromComments(allHistory.filter(isTrustedSceneContributionComment));
    const sceneActorTeams = collectSceneActorTeams(trustedHistory, metadata.commentSegments);
    const sceneDay = getTrustedSceneDay(allHistory);
    const recoveryDayKey = `scene:${entryId}:day-${sceneDay}`;
    const rulePeriods = { comment: commentRef.id, scene: entryId, day: recoveryDayKey };
    let usedRuleFrequencyKeys = deriveCombatRuleFrequencyKeys(trustedHistory, rulePeriods);

    const descriptors = entries.flatMap(({ submitted }) => [
      { role: 'actor', actorId: submitted.actorId, persistence: normalizePersistence(submitted.actorPersistence, submitted.actorId) },
      { role: 'target', actorId: submitted.targetId, persistence: normalizePersistence(submitted.targetPersistence, submitted.targetId) }
    ]).concat(entries.flatMap(ruleSelectionDescriptors), inventoryEntries.map(inventoryDescriptor));
    const uniqueRecords = new Map();
    descriptors.forEach(descriptor => {
      const key = `${descriptor.persistence.kind}:${descriptor.persistence.recordId}`;
      if (!uniqueRecords.has(key)) uniqueRecords.set(key, {
        ...descriptor.persistence,
        key,
        ref: database.collection(collectionFor(descriptor.persistence.kind)).doc(descriptor.persistence.recordId)
      });
    });
    const recordEntries = [...uniqueRecords.values()];
    const snapshots = await Promise.all(recordEntries.map(entry => transaction.get(entry.ref)));
    const records = new Map();
    recordEntries.forEach((entry, index) => {
      if (!snapshots[index].exists) fail('not-found', `Das Profil ${entry.recordId} wurde nicht gefunden.`);
      records.set(entry.key, snapshots[index].data() || {});
    });

    const workingStates = new Map([...historyStates].map(([actorId, state]) => [actorId, {
      ...state,
      resources: Array.isArray(state.resources) ? resetCommentScopedResources(state.resources) : state.resources
    }]));
    const workingInventories = new Map();
    const persistentUpdates = new Map();
    const combatResolutionsBySegment = new Map();
    let enhancedSegments = metadata.commentSegments.map(segment => ({ ...segment }));
    const validatedSkills = await validateSkillCommentSegments({
      database,
      transaction,
      request,
      metadata: { ...metadata, commentSegments: enhancedSegments },
      history: trustedHistory,
      challengeHistory: allHistory.filter(comment => isTrustedSkillChallengeComment(comment) || isTrustedHerausforderungComment(comment)),
      rulePeriods,
      usedRuleFrequencyKeys,
      entryId,
      workingStates,
      persistentUpdates
    });
    enhancedSegments = validatedSkills.commentSegments;
    usedRuleFrequencyKeys = validatedSkills.usedRuleFrequencyKeys;

    for (const entry of inventoryEntries) {
      const descriptor = inventoryDescriptor(entry);
      const recordKey = `${descriptor.persistence.kind}:${descriptor.persistence.recordId}`;
      const record = records.get(recordKey);
      const submittedUse = normalizeInventoryUse({
        ...entry.submitted,
        usageId: randomUUID(),
        actorId: descriptor.actorId,
        actorName: cleanText(entry.segment?.charName || entry.submitted?.actorName || record?.name, 160),
        actorPersistence: descriptor.persistence.persistent
          ? { kind: descriptor.persistence.kind, recordId: descriptor.persistence.recordId }
          : { kind: 'scene-actor', actorId: descriptor.actorId }
      });
      const currentInventory = workingInventories.get(recordKey) || record?.inventory || {};
      const applied = applyInventoryUseToInventory(currentInventory, submittedUse);
      workingInventories.set(recordKey, applied.inventory);
      const actorState = workingStates.get(String(descriptor.actorId));
      const actorBase = resolveCombatProfile(makeCharacterWithCombatState(record, descriptor.persistence, descriptor.actorId, actorState));
      const actorResources = getEffectiveCommentResources(actorBase.resources, actorState?.resources, recoveryDayKey);
      const actorProfile = applyStoredState(actorBase, { ...(actorState || {}), resources: actorResources });
      const triggered = applyInventoryUseAbilityEffects(actorProfile, applied.inventoryUse, recoveryDayKey);
      enhancedSegments[entry.index] = { ...enhancedSegments[entry.index], inventoryUse: triggered.inventoryUse };
      if (triggered.changed) {
        workingStates.set(String(descriptor.actorId), {
          ...(actorState || {}),
          resources: triggered.resources,
          abilities: triggered.abilities
        });
      }
      if (descriptor.persistence.persistent && submittedUse.mode === 'consume') {
        const existing = persistentUpdates.get(recordKey) || { entry: uniqueRecords.get(recordKey), record };
        existing.inventory = applied.inventory;
        persistentUpdates.set(recordKey, existing);
      }
      if (descriptor.persistence.persistent && triggered.changed) {
        const existing = persistentUpdates.get(recordKey) || { entry: uniqueRecords.get(recordKey), record };
        existing.resources = getPersistentCombatResources(actorBase.resources, triggered.resources);
        existing.abilities = triggered.abilities;
        persistentUpdates.set(recordKey, existing);
      }
    }

    const startedAreaActions = new Map();
    for (const { index, segment, submitted, targetIndex, targetCount, primary } of entries) {
      const actorPersistence = normalizePersistence(submitted.actorPersistence, submitted.actorId);
      const targetPersistence = normalizePersistence(submitted.targetPersistence, submitted.targetId);
      const actorRecordKey = `${actorPersistence.kind}:${actorPersistence.recordId}`;
      const targetRecordKey = `${targetPersistence.kind}:${targetPersistence.recordId}`;
      const actorRecord = records.get(actorRecordKey);
      const targetRecord = records.get(targetRecordKey);

      const paymentMode = String(segment.combatAction?.paymentMode || 'standard');
      const actorState = workingStates.get(String(submitted.actorId));
      const targetState = workingStates.get(String(submitted.targetId));
      const actorBase = resolveCombatProfile(makeCharacterWithCombatState(actorRecord, actorPersistence, submitted.actorId, actorState), {
        actionId: String(segment.combatAction?.profileActionId || submitted.profileActionId || ''),
        segmentKind: getEffectiveCombatSegmentKind(segment),
        paymentMode,
        weaponGrip: String(segment.combatAction?.weaponGrip || '') === 'two-handed' ? 'two-handed' : 'one-handed',
        castLevel: Math.max(0, Math.min(10, Number(segment.combatAction?.castLevel) || 0))
      });
      const targetBase = resolveCombatProfile(makeCharacterWithCombatState(targetRecord, targetPersistence, submitted.targetId, targetState));
      const actorResources = getEffectiveCommentResources(actorBase.resources, actorState?.resources, recoveryDayKey);
      const actor = applyStoredState(actorBase, {
        ...(actorState || {}),
        resources: actorResources
      });
      const target = applyStoredState(targetBase, targetState);
      const broadTargetEffect = (actor.selectedAction?.effects || []).some(effect => ['selected', 'allies', 'enemies', 'all'].includes(String(effect?.target || '')));
      const maximumTargets = Math.max(1, Number(actor.selectedAction?.maximumTargets) || (broadTargetEffect ? 20 : 1));
      if (targetCount > maximumTargets) {
        fail('failed-precondition', `${actor.selectedAction?.name || 'Diese Technik'} erlaubt höchstens ${maximumTargets} Ziele.`);
      }
      const selectedRuleDescriptors = ruleSelectionDescriptors({ segment });
      const ruleSources = selectedRuleDescriptors.map(descriptor => {
        const recordKey = `${descriptor.persistence.kind}:${descriptor.persistence.recordId}`;
        const record = records.get(recordKey);
        if (!record) fail('not-found', 'Eine ausgew\u00e4hlte Reaktionsquelle wurde nicht gefunden.');
        const sourceState = workingStates.get(String(descriptor.actorId));
        const sourceBase = resolveCombatProfile(makeCharacterWithCombatState(record, descriptor.persistence, descriptor.actorId, sourceState));
        const sourceResources = getEffectiveCommentResources(sourceBase.resources, sourceState?.resources, recoveryDayKey);
        const source = applyStoredState(sourceBase, {
          ...(sourceState || {}),
          resources: sourceResources
        });
        return {
          actorId: descriptor.actorId,
          actorName: source.name,
          profile: source,
          sourceRole: String(descriptor.actorId) === String(submitted.actorId)
            ? 'actor'
            : (String(descriptor.actorId) === String(submitted.targetId) ? 'target' : 'support'),
          relationToActor: String(descriptor.actorId) === String(submitted.actorId)
            ? 'self'
            : relationshipForActors(record, actorRecord, descriptor.actorId, submitted.actorId, sceneActorTeams),
          relationToTarget: String(descriptor.actorId) === String(submitted.targetId)
            ? 'self'
            : relationshipForActors(record, targetRecord, descriptor.actorId, submitted.targetId, sceneActorTeams),
          distanceToActor: String(descriptor.actorId) === String(submitted.actorId) ? 0 : descriptor.distanceMeters,
          distanceToTarget: String(descriptor.actorId) === String(submitted.targetId) ? 0 : descriptor.distanceMeters,
          passiveRulesAllowed: [String(submitted.actorId), String(submitted.targetId)].includes(String(descriptor.actorId)),
          selectedRuleIds: selectedRuleDescriptors
            .filter(item => String(item.actorId) === String(descriptor.actorId))
            .map(item => item.ruleId),
          persistence: descriptor.persistence
        };
      });
      const service = new CombatResolutionService(new ProvidedDiceAdapter(submitted));
      const distanceMeters = Math.max(0, Math.min(9999, Number(segment.combatDistanceMeters) || 0));
      const resolution = await service.resolveAttack({
        actor,
        target,
        description: String(segment.text || submitted.originalDescription || ''),
        rollMode: String(segment.combatAction?.rollMode || submitted.attack?.rollMode || 'normal')
      }, {
        relationship: relationshipForActors(actorRecord, targetRecord, submitted.actorId, submitted.targetId, sceneActorTeams),
        distanceMeters,
        ruleSources,
        rulePeriods,
        usedRuleFrequencyKeys,
        startedAction: primary ? null : startedAreaActions.get(index),
        skipResourceCosts: !primary,
        skipAmmunition: !primary,
        skipSelfEffects: !primary,
        skipChanneling: !primary
      });
      resolution.multiTargetIndex = targetIndex;
      resolution.multiTargetCount = targetCount;
      usedRuleFrequencyKeys = new Set(resolution.usedRuleFrequencyKeys || []);
      resolution.resolutionId = randomUUID();
      resolution.serverValidated = true;
      resolution.validatedAt = new Date(nowClient).toISOString();
      resolution.narration = null;
      if (primary) startedAreaActions.set(index, resolution);

      const abilityUse = resolution.actionType === 'channeling' || !primary
        ? { changed: false, abilities: actor.abilities, beforeAbilities: actor.abilities, use: null }
        : consumeAbilityUse(actor.abilities, resolution, recoveryDayKey);
      if (abilityUse.use) {
        resolution.abilityUse = abilityUse.use;
        resolution.actorAbilitySnapshot = {
          before: abilityUse.beforeAbilities.map(ability => ({ ...ability })),
          after: abilityUse.abilities.map(ability => ({ ...ability })),
          change: abilityUse.use
        };
      }

      const targetNext = getResolutionHitPointState(resolution);
      const targetConditions = getResolutionTargetConditionState(resolution);
      const targetResources = getResolutionTargetResourceState(resolution);
      const targetConcentration = getResolutionTargetConcentrationState(resolution);
      const targetChanneling = getResolutionTargetChannelingState(resolution);
      const actorNextResources = getResolutionActorResourceState(resolution);
      const actorNextInventory = getResolutionActorInventoryState(resolution);
      const actorNextHitPoints = getResolutionActorHitPointState(resolution);
      const actorNextConditions = getResolutionActorConditionState(resolution);
      const actorNextEquippedWeaponId = getResolutionActorEquippedWeaponState(resolution);
      const actorChanneling = getResolutionActorChannelingState(resolution);
      const actorConcentration = getResolutionActorConcentrationState(resolution);
      if (targetNext || targetConditions || targetResources || targetConcentration !== undefined || targetChanneling !== undefined) workingStates.set(String(submitted.targetId), {
        ...(targetState || {}),
        ...(targetNext || {}),
        ...(targetConditions ? { temporaryConditions: targetConditions } : {}),
        ...(targetResources ? { resources: targetResources } : {}),
        ...(targetConcentration !== undefined ? { concentration: targetConcentration } : {}),
        ...(targetChanneling !== undefined ? { channeling: targetChanneling } : {})
      });
      if (actorNextResources || actorNextInventory || actorNextHitPoints || actorNextConditions || actorNextEquippedWeaponId || abilityUse.changed || actorChanneling !== undefined || actorConcentration !== undefined) workingStates.set(String(submitted.actorId), {
        ...(workingStates.get(String(submitted.actorId)) || actorState || {}),
        ...(actorNextResources ? { resources: actorNextResources } : {}),
        ...(actorNextInventory ? { inventory: actorNextInventory } : {}),
        ...(actorNextHitPoints || {}),
        ...(actorNextConditions ? { temporaryConditions: actorNextConditions } : {}),
        ...(actorNextEquippedWeaponId ? { equippedWeaponId: actorNextEquippedWeaponId } : {}),
        ...(abilityUse.changed ? { abilities: abilityUse.abilities } : {}),
        ...(actorChanneling !== undefined ? { channeling: actorChanneling } : {}),
        ...(actorConcentration !== undefined ? { concentration: actorConcentration } : {})
      });

      const ruleAbilitySnapshots = [];
      (Array.isArray(resolution.ruleApplications) ? resolution.ruleApplications : [])
        .filter(application => application.consumesAbilityUse)
        .forEach(application => {
          const sourceId = String(application.sourceActorId || '');
          const source = ruleSources.find(item => String(item.actorId) === sourceId);
          if (!source) fail('failed-precondition', 'Die F\u00e4higkeitsquelle einer Reaktion fehlt.');
          const currentState = workingStates.get(sourceId) || {};
          const currentAbilities = Array.isArray(currentState.abilities) ? currentState.abilities : source.profile.abilities;
          const consumed = consumeRuleAbilityUse(currentAbilities, application, recoveryDayKey);
          if (!consumed.changed) return;
          workingStates.set(sourceId, { ...currentState, abilities: consumed.abilities });
          ruleAbilitySnapshots.push({
            sourceActorId: sourceId,
            sourceActorName: application.sourceActorName,
            applicationKey: application.applicationKey,
            before: consumed.beforeAbilities,
            after: consumed.abilities,
            change: consumed.use
          });
          if (source.persistence?.persistent) {
            const recordKey = `${source.persistence.kind}:${source.persistence.recordId}`;
            const sourceRecord = records.get(recordKey);
            const existing = persistentUpdates.get(recordKey) || { entry: uniqueRecords.get(recordKey), record: sourceRecord };
            existing.abilities = consumed.abilities;
            persistentUpdates.set(recordKey, existing);
          }
        });
      if (ruleAbilitySnapshots.length) resolution.ruleAbilitySnapshots = ruleAbilitySnapshots;

      (Array.isArray(resolution.ruleResourceSnapshots) ? resolution.ruleResourceSnapshots : []).forEach(snapshot => {
        const sourceId = String(snapshot.sourceActorId || '');
        const source = ruleSources.find(item => String(item.actorId) === sourceId);
        if (!source) fail('failed-precondition', 'Die Ressourcenquelle einer Reaktion fehlt.');
        const currentState = workingStates.get(sourceId) || {};
        workingStates.set(sourceId, { ...currentState, resources: snapshot.after });
        if (source.persistence?.persistent) {
          const recordKey = `${source.persistence.kind}:${source.persistence.recordId}`;
          const sourceRecord = records.get(recordKey);
          const existing = persistentUpdates.get(recordKey) || { entry: uniqueRecords.get(recordKey), record: sourceRecord };
          existing.resources = getPersistentCombatResources(source.profile.resources, snapshot.after);
          persistentUpdates.set(recordKey, existing);
        }
      });

      const segmentResolutions = combatResolutionsBySegment.get(index) || [];
      segmentResolutions.push(resolution);
      combatResolutionsBySegment.set(index, segmentResolutions);
      enhancedSegments[index] = {
        ...segment,
        combatResolution: segmentResolutions[0],
        ...(targetCount > 1 ? { combatResolutions: segmentResolutions } : {})
      };

      if (targetPersistence.persistent) {
        const existing = persistentUpdates.get(targetRecordKey) || { entry: uniqueRecords.get(targetRecordKey), record: targetRecord };
        existing.hitPoints = targetNext;
        if (targetResources) existing.resources = getPersistentCombatResources(targetBase.resources, targetResources);
        persistentUpdates.set(targetRecordKey, existing);
      }
      if (actorPersistence.persistent) {
        const existing = persistentUpdates.get(actorRecordKey) || { entry: uniqueRecords.get(actorRecordKey), record: actorRecord };
        const actorFinalResources = workingStates.get(String(submitted.actorId))?.resources || actorNextResources || actorBase.resources;
        existing.resources = getPersistentCombatResources(actorBase.resources, actorFinalResources);
        if (abilityUse.changed) existing.abilities = abilityUse.abilities;
        if (actorNextInventory) existing.inventory = actorNextInventory;
        if (actorNextHitPoints) existing.hitPoints = actorNextHitPoints;
        persistentUpdates.set(actorRecordKey, existing);
      }
    }

    const mechanicalUndo = {};
    profileUpdates = [...persistentUpdates.values()].map(update => {
      const values = { updatedAt: new Date(nowClient).toISOString() };
      const before = {};
      if (update.hitPoints) {
        before.hitPoints = update.record?.combatProfile?.hitPoints || null;
        values['combatProfile.hitPoints.current'] = update.hitPoints.current;
        values['combatProfile.hitPoints.temporary'] = update.hitPoints.temporary;
      }
      if (update.resources) {
        before.resources = update.record?.combatProfile?.resources || null;
        values['combatProfile.resources'] = update.resources;
      }
      if (update.abilities) {
        before.abilities = update.record?.combatProfile?.abilities || null;
        values['combatProfile.abilities'] = update.abilities;
      }
      if (update.inventory) {
        before.inventory = update.record?.inventory || null;
        values.inventory = update.inventory;
      }
      values['combatProfile.lastMechanicalCommentId'] = commentRef.id;
      mechanicalUndo[update.entry.key] = {
        kind: update.entry.kind,
        recordId: update.entry.recordId,
        before,
        previousMechanicalCommentId: update.record?.combatProfile?.lastMechanicalCommentId || null
      };
      transaction.update(update.entry.ref, withProtectedRecordRevisions(
        update.record || {},
        values,
        update.inventory ? ['combatProfile', 'inventory'] : ['combatProfile'],
        nowClient
      ));
      return {
        kind: update.entry.kind,
        recordId: update.entry.recordId,
        hitPoints: update.hitPoints || null,
        resources: update.resources || null,
        abilities: update.abilities || null,
        inventory: update.inventory || null
      };
    });

    responseSegments = enhancedSegments;
    const storedSegments = compactMechanicalSegmentsForStorage(enhancedSegments);
    const resolutions = storedSegments.flatMap(segment => Array.isArray(segment?.combatResolutions)
      ? segment.combatResolutions
      : [segment?.combatResolution]).filter(Boolean);
    committedComment = {
      entryId,
      charName: cleanText(payload.charName, 160),
      charTitle: cleanText(payload.charTitle, 160),
      portrait: cleanText(payload.portrait, 2000) || null,
      text,
      deleteCodeHash: cleanText(payload.deleteCodeHash, 128),
      deleteCodeVersion: 1,
      narrator: payload.narrator === true,
      characterId: cleanText(metadata.characterId, 160),
      actorType: cleanText(metadata.actorType, 40),
      creatureId: cleanText(metadata.creatureId, 160),
      emoteIndex: Number.isInteger(metadata.emoteIndex) ? metadata.emoteIndex : null,
      imageSetId: cleanText(metadata.imageSetId, 48),
      avatarKind: cleanText(metadata.avatarKind, 40),
      commentMode: cleanText(metadata.commentMode, 40),
      commentKind: cleanText(metadata.commentKind, 80),
      commentSegments: storedSegments,
      combatAction: resolutions.length === 1 ? storedSegments.find(segment => segment?.combatAction)?.combatAction || null : null,
      combatResolution: resolutions.length === 1 ? resolutions[0] : null,
      combatRecoveryDayKey: recoveryDayKey,
      combatTransaction: {
        schemaVersion: 2,
        transactionId: commentRef.id,
        committedAtClient: nowClient,
        atomicProfileUpdates: persistentUpdates.size,
        validatedBy: 'commitCombatComment'
      },
      mechanicalUndo: Object.keys(mechanicalUndo).length ? mechanicalUndo : null,
      ...(inventoryEntries.length ? {
        inventoryTransaction: {
          schemaVersion: 2,
          transactionId: commentRef.id,
          operations: inventoryEntries.length,
          validatedBy: 'commitCombatComment'
        }
      } : {}),
      serverValidatedMechanics: true,
      createdBy: request.auth.uid,
      createdByRole: String(request.auth.token?.aleriaRole || 'player'),
      orderKey: nextMechanicalCommentOrderKey(allHistory, metadata.orderKey, nowClient),
      createdAtClient: nowClient,
      activityAtClient: nowClient,
      activityAt: FieldValue.serverTimestamp(),
      schemaVersion: 3,
      ts: FieldValue.serverTimestamp()
    };
    transaction.create(commentRef, committedComment);
  });

  return {
    id: commentRef.id,
    profileUpdates,
    mechanics: {
      commentSegments: responseSegments,
      combatResolution: responseSegments.map(segment => segment?.combatResolution).filter(Boolean).length === 1
        ? responseSegments.find(segment => segment?.combatResolution)?.combatResolution || null
        : null
    }
  };
});

export const combatCommentInternals = Object.freeze({ consumeAbilityUse, getEffectiveCommentResources });
