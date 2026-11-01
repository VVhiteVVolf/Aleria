import { prepareCombatEquipment, reserveCombatEquipment } from '../generated/combat/combat-equipment-preparation.js';
import { readItemDefinitionIndex, hydrateItemRecord, prepareUniqueItemClaims } from '../items/item-definition-repository.js';
import { transferredEquipmentProfile } from '../items/item-transfer-equipment.js';
import { removeTransferredSceneEquipment } from '../generated/scene-items/scene-item-equipment.js';
import { materializeInventoryItem } from '../generated/item-definitions/item-definition-resolver.js';
import { prepareCriticalCommentLifecycle } from './critical-comment-lifecycle.js';
import { getActorsWithCombatPosts } from '../generated/combat/combat-weapon-loadout.js';
import { randomUUID, randomInt, createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { attachCriticalConsequences } from '../generated/combat-critical/combat-critical-resolution.js';
import { CRITICAL_CONSEQUENCE_DIE } from '../generated/combat-critical/combat-critical-catalog.js';
import { deriveSceneItems, applySceneItemEvent, applyDroppedWeaponsToStates } from '../generated/scene-items/scene-items-model.js';
import { applySceneItemInteraction } from '../generated/scene-items/scene-item-interaction.js';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { getPersistentCombatResources, recoverDailyCombatResources, resetCommentScopedResources } from '../generated/combat/combat-action-economy.js';
import { applyCombatAbilityUse } from '../generated/combat/combat-ability-uses.js';
import { reconcileConcentrationConditions } from '../generated/combat/combat-condition-lifecycle.js';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../generated/combat/combat-equipment-state.js';
import { CombatResolutionService } from '../generated/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, getResolutionActorChannelingState, getResolutionActorConcentrationState, getResolutionActorConditionState, getResolutionActorEquippedWeaponState, getResolutionActorLoadoutState, getResolutionActorHitPointState, getResolutionActorInventoryState, getResolutionTargetInventoryState, getResolutionActorResourceState, getResolutionHitPointState, getResolutionTargetChannelingState, getResolutionTargetConditionState, getResolutionTargetConcentrationState, getResolutionTargetResourceState, overlayCombatHitPointState } from '../generated/combat/combat-state-model.js';
import { deriveCombatRuleFrequencyKeys } from '../generated/combat/combat-trigger-rules.js';
import { getActiveCombatPartyMap, getActiveCombatEncounter } from '../generated/combat/combat-encounter-model.js';
import { getEncounterActionValidationError } from '../generated/combat/combat-encounter-lifecycle.js';
import { nextMechanicalCommentOrderKey } from './mechanical-comment-order.js';
import { getEffectiveCombatSegmentKind } from '../generated/combat/combat-segment-model.js';
import {
  applyInventoryUseAbilityEffects,
  applyInventoryUseToInventory,
  inferInventoryUseMode,
  normalizeInventoryUse
} from '../generated/inventory-use/inventory-use-model.js';
import { ProvidedDiceAdapter } from './provided-dice-adapter.js';
import { getTrustedSceneDay, isTrustedHerausforderungComment, isTrustedMechanicalComment, isTrustedSceneContributionComment, isTrustedSkillChallengeComment, sortSceneHistory } from './trusted-scene-history.js';
import { skillSegments, validateSkillCommentSegments, persistSkillChallengeClaims } from './skill-comment-validator.js';
import { compactMechanicalSegmentsForStorage } from './mechanical-resolution-storage.js';
import { undoInventoryFingerprint } from './mechanical-undo-inventory.js';

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
  if (['character', 'creature'].includes(submitted.actorPersistence?.kind) && submitted.actorPersistence.recordId) {
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
  return withEquippedCombatWeapon(makeCharacter(record, persistence, actorId), state?.equippedWeaponId, state?.offHandWeaponId, state?.supportEquipment);
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

export async function commitCombatCommentOperation(request, {
  database = getFirestore(), rollCritical = () => randomInt(1, CRITICAL_CONSEQUENCE_DIE + 1), nowClient = Date.now()
} = {}) {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const payload = clonePayload(request.data);
  const entryId = cleanText(payload.entryId, 240);
  const text = cleanText(payload.text);
  const metadata = clonePayload(payload.metadata);
  const entries = combatSegments(metadata);
  // Stable across Firestore retries, never chosen by the submitting browser.
  const criticalRolls = new Map();
  const inventoryEntries = inventorySegments(metadata);
  const skillEntries = skillSegments(metadata);
  if (!entryId || !text || (!entries.length && !inventoryEntries.length && !skillEntries.length)) {
    fail('invalid-argument', 'Beitrag und mindestens ein mechanischer Vorgang sind erforderlich.');
  }

  const operationId = String(metadata.operationId || '');
  if (operationId && !/^[\w:.-]{1,180}$/.test(operationId)) fail('invalid-argument', 'Die Beitragskennung ist ungültig.');
  const requestFingerprint = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const requestKey = operationId ? createHash('sha256').update(`${request.auth.uid}:${operationId}`).digest('hex') : '';
  const commentRef = requestKey ? database.collection('comments').doc(`mechanical-${requestKey}`) : database.collection('comments').doc();
  const requestReceiptRef = requestKey ? database.collection('mechanical_comment_transactions').doc(requestKey) : null;
  let committedComment;
  let profileUpdates = [];
  let responseSegments = [];
  let criticalLifecycle = [];

  await database.runTransaction(async transaction => {
    if (requestReceiptRef) {
      const prior = await transaction.get(requestReceiptRef);
      if (prior.exists) {
        if (prior.data().fingerprint !== requestFingerprint) fail('already-exists', 'Dieser Beitrag wurde bereits mit anderem Inhalt verarbeitet.');
        const comment = await transaction.get(commentRef);
        if (!comment.exists) fail('already-exists', 'Dieser Vorgang wurde bereits ausgeführt und anschließend zurückgenommen.');
        committedComment = comment.data(); responseSegments = committedComment.commentSegments || []; profileUpdates = [];
        return;
      }
    }
    const threadSnapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const allHistory = sortSceneHistory(threadSnapshot.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() })));
    const trustedHistory = allHistory.filter(isTrustedMechanicalComment);
    const encounter = getActiveCombatEncounter(trustedHistory);
    const sceneItems = deriveSceneItems(trustedHistory);
    const actorsWithPosts = getActorsWithCombatPosts(trustedHistory);
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
    const usedConsequenceKeys = new Set();

    const descriptors = entries.flatMap(({ submitted }) => [
      { role: 'actor', actorId: submitted.actorId, persistence: normalizePersistence(submitted.actorPersistence, submitted.actorId) },
      { role: 'target', actorId: submitted.targetId, persistence: normalizePersistence(submitted.targetPersistence, submitted.targetId) }
    ]).concat(entries.flatMap(ruleSelectionDescriptors), inventoryEntries.map(inventoryDescriptor));
    inventoryEntries.forEach(({ submitted }) => {
      const item = sceneItems.get(submitted.sceneItemId);
      if (submitted.source === 'scene' && item?.sourceActorId) descriptors.push({ role: 'item-source', actorId: item.sourceActorId,
        persistence: normalizePersistence(item.sourcePersistence, item.sourceActorId) });
    });
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
      records.set(entry.key, { ...(snapshots[index].data() || {}), id: entry.recordId, _itemHolderKind: collectionFor(entry.kind) });
    });
    const itemDefinitions = await readItemDefinitionIndex(database, transaction,
      [...records.values(), { items: [...sceneItems.values()].map(entry => entry.item) }]);
    const rawRecords = new Map(records);
    for (const [key, record] of records) records.set(key, hydrateItemRecord(record, itemDefinitions, { requireEquipped: entries.length > 0, preserveLoadout: true }));

    const workingStates = new Map(historyStates);
    const workingInventories = new Map();
    const persistentUpdates = new Map();
    const lifecycle = await prepareCriticalCommentLifecycle({ database, transaction, states: workingStates, metadata,
      records, entries: uniqueRecords, updates: persistentUpdates });
    const combatResolutionsBySegment = new Map();
    let enhancedSegments = metadata.commentSegments.map(segment => {
      const clean = { ...segment };
      delete clean.sceneItemEvent;
      delete clean.combatResolution;
      delete clean.combatResolutions;
      delete clean.inventoryUse;
      return clean;
    });
    const skillClaimWrites = [];
    const uniqueItemMoves = [];
    const locallyClaimedSkills = new Set();
    const resolveSkillEntry = async entry => {
      const validated = await validateSkillCommentSegments({ database, transaction, request,
        metadata: { ...metadata, commentSegments: enhancedSegments }, history: trustedHistory,
        challengeHistory: allHistory.filter(comment => isTrustedSkillChallengeComment(comment) || isTrustedHerausforderungComment(comment)),
        rulePeriods, usedRuleFrequencyKeys, usedConsequenceKeys, entryId, workingStates, persistentUpdates, workingInventories,
        deferClaimWrites: true, segmentIndexes: new Set([entry.index]), locallyClaimed: locallyClaimedSkills });
      enhancedSegments = validated.commentSegments;
      usedRuleFrequencyKeys = validated.usedRuleFrequencyKeys;
      skillClaimWrites.push(...(validated.claimWrites || []));
    };

    const resolveInventoryEntry = async entry => {
      const descriptor = inventoryDescriptor(entry);
      const recordKey = `${descriptor.persistence.kind}:${descriptor.persistence.recordId}`;
      const record = records.get(recordKey);
      const submittedUse = normalizeInventoryUse({
        ...entry.submitted,
        sceneItemEvent: null,
        resourceSnapshot: null,
        inventorySnapshot: null,
        conditionSnapshot: null,
        usageId: randomUUID(),
        actorId: descriptor.actorId,
        actorName: cleanText(entry.segment?.charName || entry.submitted?.actorName || record?.name, 160),
        actorPersistence: descriptor.persistence.persistent
          ? { kind: descriptor.persistence.kind, recordId: descriptor.persistence.recordId }
          : { kind: 'scene-actor', actorId: descriptor.actorId }
      });
      const currentInventory = workingInventories.get(recordKey) || record?.inventory || {};
      const actorState = workingStates.get(String(descriptor.actorId));
      const actorBase = resolveCombatProfile(makeCharacterWithCombatState({ ...record, inventory: currentInventory }, descriptor.persistence, descriptor.actorId, actorState));
      const actorResources = getEffectiveCommentResources(actorBase.resources, actorState?.resources, recoveryDayKey);
      const actorProfile = applyStoredState(actorBase, { ...(actorState || {}), resources: actorResources });
      actorProfile.inventory = currentInventory;
      const sceneItem = submittedUse.source === 'scene' ? sceneItems.get(submittedUse.sceneItemId) : null;
      const sourceDescriptor = sceneItem?.sourceActorId ? descriptors.find(candidate => candidate.role === 'item-source' && candidate.actorId === sceneItem.sourceActorId) : null;
      const sourceKey = sourceDescriptor ? `${sourceDescriptor.persistence.kind}:${sourceDescriptor.persistence.recordId}` : '';
      const sourceRecord = sourceKey ? records.get(sourceKey) : null;
      let applied;
      const kind = entry.segment.commentKind || entry.segment.kind;
      if (submittedUse.source === 'scene') {
        if (!descriptor.persistence.persistent) fail('failed-precondition', 'Aufheben benötigt einen gespeicherten Charakter.');
        if (submittedUse.operation === 'consume' && kind !== 'consume') fail('invalid-argument', 'Verbrauchsgüter gehören in die Konsumieren-Blase.');
        if (submittedUse.operation !== 'consume' && kind !== 'interact') fail('invalid-argument', 'Benutzen und Aufheben gehören in die Interagieren-Blase.');
        applied = applySceneItemInteraction({ entry: sceneItem, actor: actorProfile,
          sourceActor: sourceRecord ? { ...sourceRecord, id: sceneItem.sourceActorId, inventory: workingInventories.get(sourceKey) || sourceRecord.inventory } : null,
          operation: submittedUse.operation, paymentResource: submittedUse.paymentResource, usageId: submittedUse.usageId, definitions: itemDefinitions, recoveryDayKey });
        applySceneItemEvent(sceneItems, applied.inventoryUse.sceneItemEvent);
        applyDroppedWeaponsToStates(workingStates, sceneItems);
        actorProfile.resources = applied.resources;
        if (applied.sourceInventory) {
          workingInventories.set(sourceKey, applied.sourceInventory);
          const sourceUpdate = persistentUpdates.get(sourceKey) || { entry: uniqueRecords.get(sourceKey), record: sourceRecord };
          sourceUpdate.inventory = applied.sourceInventory;
          const movedBinding = sourceRecord.combatProfile?.weapons?.find(weapon => weapon.id === sceneItem.weaponId)?.inventoryItemId || sceneItem.item.id;
          const sourceProfile = sourceUpdate.equipment || rawRecords.get(sourceKey)?.combatProfile || {};
          const hasStoredBinding = ['weapons', 'armorItems'].some(collection => (sourceProfile[collection] || [])
            .some(entry => entry.inventoryItemId === movedBinding || collection === 'weapons' && entry.id === sceneItem.weaponId));
          if (hasStoredBinding && !applied.sourceInventory.items.some(item => item.id === movedBinding)) {
            sourceUpdate.equipment = removeTransferredSceneEquipment(sourceProfile, {
              weaponId: sceneItem.weaponId, inventoryItemId: movedBinding
            });
          }
          if (sourceDescriptor.persistence.persistent) {
            persistentUpdates.set(sourceKey, sourceUpdate);
            records.set(sourceKey, { ...sourceRecord, inventory: applied.sourceInventory, combatProfile: applied.sourceCombatProfile });
          }
          const sourceState = workingStates.get(sceneItem.sourceActorId) || {};
          workingStates.set(sceneItem.sourceActorId, { ...sourceState, inventory: applied.sourceInventory });
        }
      } else {
        if ((actorState?.droppedWeapons || []).some(drop => drop.item.id === submittedUse.item.id)) fail('failed-precondition', 'Diese Waffe liegt in der Szene. Zuerst aufheben.');
        const item = (currentInventory.items || []).find(item => item.id === submittedUse.item.id);
        if (item && (inferInventoryUseMode(item, itemDefinitions) === 'consume') !== (kind === 'consume')) fail('invalid-argument', 'Verbrauchsgüter gehören unter „Konsumieren“, andere Gegenstände unter „Interagieren“.');
        if (kind === 'interact') submittedUse.mode = submittedUse.requestedMode = 'use';
        if (kind === 'consume') submittedUse.mode = submittedUse.requestedMode = 'consume';
        applied = applyInventoryUseToInventory(currentInventory, submittedUse, { definitions: itemDefinitions, recoveryDayKey });
      }
      workingInventories.set(recordKey, applied.inventory);
      const usedItem = submittedUse.source === 'scene' ? sceneItem?.item : (currentInventory.items || []).find(item => item.id === submittedUse.item.id);
      const usedDefinition = usedItem?.definitionRef ? itemDefinitions.get(`${usedItem.definitionRef.id}@${usedItem.definitionRef.revision}`) : null;
      if (usedDefinition?.kind === 'unique' && (submittedUse.operation === 'pickup' || applied.inventoryUse.mode === 'consume')) {
        const moved = applied.inventory.items?.find(item => item.instanceId === usedItem.instanceId);
        const previousHolder = submittedUse.source === 'scene' ? sceneItem.sourceActorId
          ? { kind: sourceDescriptor?.persistence.kind === 'creature' ? 'creatures' : 'characters', recordId: sceneItem.sourceActorId, itemId: usedItem.id }
          : { kind: 'scene', recordId: entryId, itemId: sceneItem.sceneItemId }
          : { kind: descriptor.persistence.kind === 'creature' ? 'creatures' : 'characters', recordId: descriptor.persistence.recordId, itemId: usedItem.id };
        uniqueItemMoves.push({ definition: usedDefinition, instanceId: usedItem.instanceId || usedItem.id, quantity: 1, previousHolder,
          holder: applied.inventoryUse.mode === 'consume'
            ? { kind: 'consumed', recordId: commentRef.id, itemId: usedItem.instanceId || usedItem.id }
            : { kind: descriptor.persistence.kind === 'creature' ? 'creatures' : 'characters', recordId: descriptor.persistence.recordId, itemId: moved?.id || usedItem.id } });
      }
      const triggered = applyInventoryUseAbilityEffects(actorProfile, applied.inventoryUse, recoveryDayKey, { definitions: itemDefinitions });
      enhancedSegments[entry.index] = { ...enhancedSegments[entry.index], inventoryUse: triggered.inventoryUse };
      if (triggered.changed || applied.resources) {
        workingStates.set(String(descriptor.actorId), {
          ...(workingStates.get(String(descriptor.actorId)) || actorState || {}),
          resources: triggered.resources,
          abilities: triggered.abilities,
          temporaryConditions: triggered.conditions,
          ...(triggered.hitPoints || {}),
          inventory: applied.inventory
        });
      }
      if (descriptor.persistence.persistent && (submittedUse.mode === 'consume' && submittedUse.source !== 'scene' || applied.inventoryChanged)) {
        const existing = persistentUpdates.get(recordKey) || { entry: uniqueRecords.get(recordKey), record };
        existing.inventory = applied.inventory;
        if (applied.combatProfile) {
          const equipment = transferredEquipmentProfile(existing.equipment || rawRecords.get(recordKey)?.combatProfile,
            applied.combatProfile, `scene:${sceneItem.sceneItemId}`, { preserveExisting: true });
          if (equipment) existing.equipment = equipment;
          records.set(recordKey, { ...record, inventory: applied.inventory, combatProfile: applied.combatProfile });
        }
        persistentUpdates.set(recordKey, existing);
      }
      if (descriptor.persistence.persistent && (triggered.changed || applied.resources)) {
        const existing = persistentUpdates.get(recordKey) || { entry: uniqueRecords.get(recordKey), record };
        existing.resources = getPersistentCombatResources(actorBase.resources, triggered.resources);
        existing.abilities = triggered.abilities;
        if (triggered.hitPoints) existing.hitPoints = triggered.hitPoints;
        persistentUpdates.set(recordKey, existing);
      }
    };

    const startedAreaActions = new Map();
    const pendingWeaponDrops = new Set();
    const dropKey = profile => `${profile.characterId}:${profile.weapon?.inventoryItemId || `weapon:${profile.weapon?.id}`}`;
    const precedingEntries = [...inventoryEntries.map(entry => ({ ...entry, mechanic: 'inventory' })),
      ...skillEntries.map(entry => ({ ...entry, mechanic: 'skill' }))].sort((a, b) => a.index - b.index);
    let nextPrecedingEntry = 0;
    const resolvePreceding = async entry => entry.mechanic === 'skill' ? resolveSkillEntry(entry) : resolveInventoryEntry(entry);
    for (const { index, segment, submitted, targetIndex, targetCount, primary } of entries) {
      while (nextPrecedingEntry < precedingEntries.length && precedingEntries[nextPrecedingEntry].index <= index) {
        await resolvePreceding(precedingEntries[nextPrecedingEntry++]);
      }
      const actorPersistence = normalizePersistence(submitted.actorPersistence, submitted.actorId);
      const targetPersistence = normalizePersistence(submitted.targetPersistence, submitted.targetId);
      const actorRecordKey = `${actorPersistence.kind}:${actorPersistence.recordId}`;
      const targetRecordKey = `${targetPersistence.kind}:${targetPersistence.recordId}`;
      const actorRecord = records.get(actorRecordKey);
      const targetRecord = records.get(targetRecordKey);

      const paymentMode = String(segment.combatAction?.paymentMode || 'standard');
      const actorState = workingStates.get(String(submitted.actorId));
      const targetState = workingStates.get(String(submitted.targetId));
      const equippedCharacter = makeCharacterWithCombatState(actorRecord, actorPersistence, submitted.actorId, actorState);
      const prepared = prepareCombatEquipment(equippedCharacter, primary ? segment.combatAction?.loadout : null, { free: !actorsWithPosts.has(String(submitted.actorId)) });
      if (prepared.preparation?.error) fail('failed-precondition', prepared.preparation.error);
      const actorBase = resolveCombatProfile(prepared.character, {
        actionId: String(segment.combatAction?.profileActionId || submitted.profileActionId || ''),
        segmentKind: getEffectiveCombatSegmentKind(segment),
        paymentMode,
        weaponGrip: String(segment.combatAction?.weaponGrip || '') === 'two-handed' ? 'two-handed' : 'one-handed',
        castLevel: Math.max(0, Math.min(10, Number(segment.combatAction?.castLevel) || 0))
      });
      const targetBase = resolveCombatProfile(makeCharacterWithCombatState(targetRecord, targetPersistence, submitted.targetId, targetState));
      const actorResources = getEffectiveCommentResources(actorBase.resources, actorState?.resources, recoveryDayKey);
      const actor = reserveCombatEquipment(applyStoredState(actorBase, {
        ...(actorState || {}),
        resources: actorResources
      }), prepared.preparation);
      if (actor.equipmentPreparation?.error) fail('failed-precondition', actor.equipmentPreparation.error);
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
        encounter,
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
      const consequences = attachCriticalConsequences(resolution, { encounter, usedConsequenceKeys,
        rollFor({ path, index: attackIndex }) {
          const key = `${index}:${targetIndex}:${path.join('.')}:${attackIndex}`;
          if (!criticalRolls.has(key)) criticalRolls.set(key, rollCritical());
          return criticalRolls.get(key);
        }, id: `${commentRef.id}:${index}:${targetIndex}`,
        actor: { ...actor, weaponUnavailable: actor.weaponUnavailable || pendingWeaponDrops.has(dropKey(actor)) },
        target: { ...target, weaponUnavailable: target.weaponUnavailable || pendingWeaponDrops.has(dropKey(target)) } });
      for (const consequence of consequences) if (consequence.sceneItemEvent) {
        pendingWeaponDrops.add(`${consequence.sceneItemEvent.sourceActorId}:${consequence.sceneItemEvent.item.id}`);
      }
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

      const targetInventory = getResolutionTargetInventoryState(resolution);
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
      if (targetInventory || targetNext || targetConditions || targetResources || targetConcentration !== undefined || targetChanneling !== undefined) workingStates.set(String(submitted.targetId), {
        ...(targetState || {}),
        ...(targetNext || {}),
        ...(targetInventory ? { inventory: targetInventory } : {}),
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
        ...getResolutionActorLoadoutState(resolution),
        ...(abilityUse.changed ? { abilities: abilityUse.abilities } : {}),
        ...(actorChanneling !== undefined ? { channeling: actorChanneling } : {}),
        ...(actorConcentration !== undefined ? { concentration: actorConcentration } : {})
      });

      for (const event of resolution.sceneItemEvents || []) applySceneItemEvent(sceneItems, event);
      if (resolution.sceneItemEvents?.length) applyDroppedWeaponsToStates(workingStates, sceneItems);
      reconcileConcentrationConditions(workingStates);
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
        ...enhancedSegments[index],
        combatResolution: segmentResolutions[0],
        ...(targetCount > 1 ? { combatResolutions: segmentResolutions } : {})
      };

      if (targetPersistence.persistent) {
        const existing = persistentUpdates.get(targetRecordKey) || { entry: uniqueRecords.get(targetRecordKey), record: targetRecord };
        existing.hitPoints = targetNext;
        if (targetInventory) { existing.inventory = targetInventory; workingInventories.set(targetRecordKey, targetInventory); }
        if (targetResources) existing.resources = getPersistentCombatResources(targetBase.resources,
          workingStates.get(String(submitted.targetId))?.resources || targetResources);
        persistentUpdates.set(targetRecordKey, existing);
      }
      if (actorPersistence.persistent) {
        const existing = persistentUpdates.get(actorRecordKey) || { entry: uniqueRecords.get(actorRecordKey), record: actorRecord };
        const actorFinalResources = workingStates.get(String(submitted.actorId))?.resources || actorNextResources || actorBase.resources;
        existing.resources = getPersistentCombatResources(actorBase.resources, actorFinalResources);
        if (abilityUse.changed) existing.abilities = abilityUse.abilities;
        if (actorNextInventory) { existing.inventory = actorNextInventory; workingInventories.set(actorRecordKey, actorNextInventory); }
        if (actorNextHitPoints) existing.hitPoints = actorNextHitPoints;
        persistentUpdates.set(actorRecordKey, existing);
      }
    }

    while (nextPrecedingEntry < precedingEntries.length) await resolvePreceding(precedingEntries[nextPrecedingEntry++]);
    const commitUniqueMoves = await prepareUniqueItemClaims(database, transaction, uniqueItemMoves, { actorUid: request.auth.uid });
    criticalLifecycle = lifecycle.finish({ ...metadata, commentSegments: enhancedSegments });
    persistSkillChallengeClaims(transaction, skillClaimWrites);
    commitUniqueMoves();
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
      if (update.equipment) {
        const originalProfile = rawRecords.get(update.entry.key)?.combatProfile || update.record?.combatProfile;
        for (const collection of ['weapons', 'armorItems']) {
          if (isDeepStrictEqual(originalProfile?.[collection], update.equipment[collection])) continue;
          before[collection] = originalProfile?.[collection] || [];
          values[`combatProfile.${collection}`] = update.equipment[collection] || [];
        }
      }
      values['combatProfile.lastMechanicalCommentId'] = commentRef.id;
      mechanicalUndo[update.entry.key] = {
        kind: update.entry.kind,
        recordId: update.entry.recordId,
        before,
        ...(update.inventory ? { afterInventoryFingerprint: undoInventoryFingerprint(update.inventory) } : {}),
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
        inventory: update.inventory || null,
        equipment: update.equipment ? { weapons: update.equipment.weapons || [], armorItems: update.equipment.armorItems || [] } : null
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
      ...(commitUniqueMoves.undo.length ? { itemClaimUndo: commitUniqueMoves.undo } : {}),
      ...(inventoryEntries.length ? {
        inventoryTransaction: {
          schemaVersion: 2,
          transactionId: commentRef.id,
          operations: inventoryEntries.length,
          validatedBy: 'commitCombatComment'
        }
      } : {}),
      serverValidatedMechanics: true,
      ...(criticalLifecycle.length ? { criticalLifecycle } : {}),
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
    if (requestReceiptRef) transaction.create(requestReceiptRef, { actorUid: request.auth.uid, fingerprint: requestFingerprint, operationId, commentId: commentRef.id, entryId, at: new Date(nowClient).toISOString() });
  });

  return {
    id: commentRef.id,
    profileUpdates,
    mechanics: {
      ...(criticalLifecycle.length ? { criticalLifecycle } : {}),
      commentSegments: responseSegments,
      combatResolution: responseSegments.map(segment => segment?.combatResolution).filter(Boolean).length === 1
        ? responseSegments.find(segment => segment?.combatResolution)?.combatResolution || null
        : null
    }
  };
}

export const commitCombatComment = onCall({ region: 'europe-west1', maxInstances: 20, concurrency: 20,
  enforceAppCheck: false, timeoutSeconds: 30 }, request => commitCombatCommentOperation(request));

export const combatCommentInternals = Object.freeze({ consumeAbilityUse, getEffectiveCommentResources });
