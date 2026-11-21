import { getCommentActorIds } from './combat-condition-duration.js';
import { normalizeCombatDistance } from './combat-rule-distance.js';
import { getCombatSupportAuraOptions } from './combat-support-aura.js';
import { withClassPassivePeriods } from '../classes/combat-passives/class-passive-periods.js';
import { getClassPassiveSupportOption } from '../classes/combat-passives/class-passive-rules.js';
import { bindCombatTooltips } from './ui/combat-tooltips.js?v=20261015-skill-challenges-v2';
import { beginCombatContribution, conditionsAtContributionStart } from './combat-contribution-start.js';
import { applySkillRuntimeSnapshots } from '../skill-checks/skill-runtime-state.js';
import { collectChallengeGrantKeys } from '../herausforderung/herausforderung-combat-preview.js?v=20261015-graded-challenges-v1';
import { prepareCombatEquipment, reserveCombatEquipment } from './combat-equipment-preparation.js?v=20260928-equipment-art-v4';
import { beginCriticalContribution } from '../combat-critical/combat-critical-lifecycle.js';
import { estimateCombatHitChance } from './combat-action-estimates.js?v=20260928-equipment-art-v4';
import { getActorsWithCombatPosts, normalizeCombatLoadout, isPairedCombatWeapon, canUseCombatOffHand } from './combat-weapon-loadout.js';
import { applyDismountSnapshots, canCarryCombatShield } from './combat-support-equipment.js';
import { combatRulePhaseLabels } from './ui/combat-rule-presentation.js';
import { CombatDiceAdapter } from './combat-dice-adapter.js?v=20260905-party-combat-v1';
import { getCommentCreatureEscapePreviews, mountCommentConditionTracker, releaseCommentConditionTracker } from '../comments/comments-condition-tracker.js?v=20261121-encounter-cards-v1';
import { hasCreatureContribution, withCreatureContribution } from './combat-creature-contribution.js';
import { CREATURE_TURN_END_ID, getEscapeActionId, getHeldCondition, rollCreatureEscape } from './combat-creature-actions.js';
import { COMBAT_WAIT_ACTION } from './combat-wait-action.js';
import { reconcileConcentrationConditions } from './combat-condition-lifecycle.js';
import { prioritizeCombatTargets } from './ui/combat-target-picker.js?v=20260928-equipment-art-v4';
import { narrateCombatResolution } from './combat-narration-service.js?v=20260806-agency-v1';
import {
  CombatProfileResolver,
  getCombatActorValidationMessage
} from './combat-profile-resolver.js?v=20260928-equipment-art-v4';
import { CombatResolutionService, getCombatRollContext } from './combat-resolution-service.js?v=20261015-graded-challenges-v1';
import {
  applyCombatResourceCosts,
  deriveCombatStateFromComments,
  getResolutionActorChannelingState,
  getResolutionActorConcentrationState,
  getResolutionActorConditionState,
  getResolutionActorEquippedWeaponState,
  getResolutionActorLoadoutState,
  getResolutionActorHitPointState,
  getResolutionActorInventoryState,
  getResolutionTargetInventoryState,
  getResolutionActorResourceState,
  getResolutionHitPointState,
  getResolutionTargetConditionState,
  getResolutionTargetChannelingState,
  getResolutionTargetConcentrationState,
  getResolutionTargetResourceState,
  overlayCombatHitPointState
} from './combat-state-model.js?v=20261014-herausforderung-combat-v1';
import {
  getReservedEquipmentSwitchWeaponId,
  withEquippedCombatWeapon
} from './combat-equipment-state.js?v=20260905-combat-weapon-slots-v1';
import {
  canUseAuraPayment,
  canUseManaSubstitutePayment,
  getActionPaymentCosts,
  recoverDailyCombatResources,
  resetCommentScopedResources
} from './combat-action-economy.js?v=20260905-resource-balance-v2';
import { applyCombatAbilityUse, getCombatAbilityAtDay } from './combat-ability-uses.js?v=20260803-action-economy-v1';
import { consumeCombatRuleAbilityUses } from './combat-rule-consumption.js?v=20260928-equipment-art-v4';
import { getSceneRecoveryDayKey } from '../scene-time/scene-recovery-day.js';
import { previewZornkappeSegment } from '../inventory-use/zornkappe-effects.js';
import { previewSubstanceItem } from '../character-health/substance-preview.js';
import { advanceSubstanceStateMap } from '../character-health/substance-state.js';
import { getSceneConditionClock, sceneClockBeforeSegment } from '../scene-time/scene-condition-clock.js';
import { deriveSceneItems, applySceneItemEvent, applyDroppedWeaponsToStates } from '../scene-items/scene-items-model.js';
import { applySceneItemInteraction } from '../scene-items/scene-item-interaction.js?v=20260928-equipment-art-v4';
import {
  ensureCombatResolutionDialog,
  mountCombatComposer,
  renderCombatEvaluation,
  setCombatResolutionStatus
} from './ui/combat-ui.js?v=20261015-ledger-layout-v3';
import { filterCombatTargets } from './ui/combat-composer-view-state.js?v=20260928-equipment-art-v4';
import {
  collectCombatTriggerRules,
  deriveCombatRuleFrequencyKeys
} from './combat-trigger-rules.js?v=20260928-equipment-art-v4';
import { countActiveHostileOpponents, getCombatEncounterPartyMap, getActiveCombatPartyMap, getActiveCombatEncounter } from './combat-encounter-model.js?v=20260928-equipment-art-v4';
import { getEncounterActionValidationError } from './combat-encounter-lifecycle.js';
import { getCombatSegmentMode, isCombatSegment, getEffectiveCombatSegmentKind } from './combat-segment-model.js';
import { createCombatProfileCache } from './combat-profile-cache.js';
import { getCombatPreviewActorIds, createCombatTargetSummary } from './combat-composer-roster.js?v=20260928-equipment-art-v4';
import { actionAllowsSelfTarget, getCombatTargetSelection, isSelfTargetAction } from './combat-action-targeting.js';
import { getSceneCombatDocumentation } from '../combat-status/combat-scene-documentation.js';
import { projectCombatEquipmentFromInventory } from '../character-equipment/character-equipment-sync.js';
import { projectSceneCreatureActors, resolveSceneCreatureSource } from '../creatures/creature-scene-source.js';
import { loadInventoryItemVersions } from '../item-definitions/item-definition-client.js';

const profileResolver = new CombatProfileResolver();
const resolutionService = new CombatResolutionService(new CombatDiceAdapter());
const resolvedCombatProfileCache = createCombatProfileCache();
let resolvedCombatTargetCache = new WeakMap();
let latestComposerContext = null;

function getProfileCacheOwner(character = {}) {
  return character;
}

function getProfileOptionCacheKey(options = {}) {
  return [
    options.actionId || '',
    options.segmentKind || '',
    options.paymentMode || 'standard',
    options.weaponGrip || 'one-handed',
    options.castLevel || 0,
    options.hostileOpponentCount ?? '',
    options.includeAiSnapshot !== false
  ].join('|');
}

function resolveCachedCombatProfile(character, options = {}) {
  const owner = getProfileCacheOwner(character);
  if (!owner || typeof owner !== 'object') return profileResolver.resolve(character, options);
  const key = getProfileOptionCacheKey(options);
  return resolvedCombatProfileCache.get(owner, key, () => profileResolver.resolve(character, options));
}

function resolveCachedCombatTarget(character) {
  const owner = getProfileCacheOwner(character);
  if (!owner || typeof owner !== 'object') return profileResolver.resolveTarget(character);
  if (!resolvedCombatTargetCache.has(owner)) {
    resolvedCombatTargetCache.set(owner, profileResolver.resolveTarget(character));
  }
  return resolvedCombatTargetCache.get(owner);
}

function hasStoredCombatRules(character = {}) {
  const profile = character.combatProfile;
  return !!profile && typeof profile === 'object' && Object.keys(profile).length > 0;
}
function getCharacters() {
  if (typeof globalThis.getAvailableCommentCharacters !== 'function') return [];
  try {
    return globalThis.getAvailableCommentCharacters();
  } catch {
    return [];
  }
}

function getCharacterById(characterId) {
  const safeId = String(characterId || '').trim();
  if (!safeId) return null;
  if (typeof globalThis.getAvailableCommentCharacterById === 'function') {
    try {
      const character = globalThis.getAvailableCommentCharacterById(safeId);
      if (character) return character;
    } catch {
      // Some classic comment dependencies can still be initializing immediately after navigation.
    }
  }
  const creature = globalThis.AleriaCreatures?.getById?.(safeId);
  return creature || getCharacters().find(item => String(item?.id || '').trim() === safeId) || null;
}

function mergeCombatActors(characters = [], sceneActors = []) {
  const sourceIds = new Set(sceneActors.map(actor => String(actor.sourceCreatureId || '')).filter(Boolean));
  const merged = new Map();
  characters
    .filter(actor => !(actor.entityType === 'creature' && sourceIds.has(String(actor.id || ''))))
    .forEach(actor => merged.set(String(actor.id || ''), actor));
  projectSceneCreatureActors(sceneActors, characters).forEach(actor => merged.set(String(actor.id || ''), actor));
  return [...merged.values()];
}

function applyEncounterParties(characters, partyMap) {
  if (!partyMap.size) return characters;
  return characters.map(character => partyMap.has(String(character.id || ''))
    ? { ...character, combatTeam: partyMap.get(String(character.id || '')) }
    : character);
}

function getCombatRelationship(first = {}, second = {}) {
  const firstTeam = String(first.combatTeam || first.fraktion || first.faction || '').trim().toLocaleLowerCase('de');
  const secondTeam = String(second.combatTeam || second.fraktion || second.faction || '').trim().toLocaleLowerCase('de');
  return firstTeam && secondTeam && firstTeam === secondTeam ? 'ally' : 'enemy';
}

function getStoredCombatStates(threadId = '', position = {}) {
  const comments = globalThis.getCachedCommentsForThread?.(threadId) || [];
  return deriveCombatStateFromComments(comments, {
    commentId: position.timelineCommentId || '',
    segmentIndex: Number.isInteger(position.timelineSegmentIndex) ? position.timelineSegmentIndex : null
  });
}

function getCombatRecoveryDayKey(threadId = '') {
  const comments = globalThis.getCachedCommentsForThread?.(threadId) || [];
  return getSceneRecoveryDayKey(threadId, comments);
}

function relationMatchesRule(rule, relation) {
  return rule.sourceRelation === 'any' || rule.sourceRelation === relation;
}

function buildCombatRuleOptions({ characters, actorCharacter, actor, targetCharacter, segment, storedStates, recoveryDayKey, profileOverrides } = {}) {
  if (!actorCharacter || !targetCharacter) return [];
  const selections = Array.isArray(segment?.combatRuleSelections) ? segment.combatRuleSelections : [];
  const actionKind = String(actor?.profileActionKind || 'weapon');
  return characters.filter(character => hasStoredCombatRules(character)
    && !profileOverrides?.get(String(character.id))?.previewPending).flatMap(character => {
    const source = profileOverrides?.get(String(character.id)) || resolveActorProfile(character, {
      actorId: character.id,
      storedStates,
      recoveryDayKey
    });
    const relationToActor = String(character.id) === String(actorCharacter.id)
      ? 'self'
      : getCombatRelationship(character, actorCharacter);
    const relationToTarget = String(character.id) === String(targetCharacter.id)
      ? 'self'
      : getCombatRelationship(character, targetCharacter);
    const reactionOptions = collectCombatTriggerRules(source)
      .filter(rule => rule.activation === 'reaction')
      .filter(rule => !rule.actionKinds.length || rule.actionKinds.includes(actionKind))
      .filter(rule => !rule.requiredActionId || rule.requiredActionId === String(actor?.profileActionId || ''))
      .filter(rule => relationMatchesRule(rule, rule.recipient === 'actor' ? relationToActor : relationToTarget))
      .map(rule => {
        const selected = selections.find(item => String(item.sourceActorId) === String(source.characterId) && String(item.ruleId) === String(rule.id));
        return {
          sourceActorId: source.characterId,
          sourceActorName: source.name,
          persistence: source.persistence || null,
          ruleId: rule.id,
          ruleName: rule.name || rule.entryName,
          costs: rule.costs,
          selected: !!selected,
          supportDistance: rule.radiusMeters != null && source.characterId !== actorCharacter.id && source.characterId !== targetCharacter.id,
          distanceMeters: normalizeCombatDistance(selected?.distanceMeters),
          phaseLabel: combatRulePhaseLabels[rule.phase] || ''
        };
      });
    const auraOptions = getCombatSupportAuraOptions({
      actorId: source.characterId, actorName: source.name, profile: source, sourceRole: 'support', relationToActor, relationToTarget,
      ruleSelections: selections.filter(selection => selection.sourceActorId === source.characterId)
    }, actionKind, actor, profileOverrides?.get(String(targetCharacter.id)));
    const cover = relationToActor === 'enemy' && getClassPassiveSupportOption(source, relationToTarget,
      profileOverrides?.get(String(targetCharacter.id)) || targetCharacter);
    if (cover) {
      const selection = selections.find(item => item.sourceActorId === source.characterId && item.ruleId === cover.ruleId);
      reactionOptions.push({ ...cover, sourceActorId: source.characterId, sourceActorName: source.name,
        persistence: source.persistence || null, selected: Boolean(selection), distanceMeters: normalizeCombatDistance(selection?.distanceMeters) });
    }
    return reactionOptions.concat(auraOptions);
  });
}

function buildCombatRuleSources({ characters, actorCharacter, targetCharacter, segment, stateContext, profileOverrides } = {}) {
  const selections = Array.isArray(segment?.combatRuleSelections) ? segment.combatRuleSelections : [];
  const selectedByActor = new Map();
  selections.forEach(selection => {
    const actorId = String(selection.sourceActorId || '');
    if (!selectedByActor.has(actorId)) selectedByActor.set(actorId, []);
    selectedByActor.get(actorId).push(selection);
  });
  return characters
    .filter(character => selectedByActor.has(String(character.id || ''))
      || String(character.id) === String(actorCharacter.id)
      || String(character.id) === String(targetCharacter.id))
    .map(character => {
      const source = profileOverrides?.get(String(character.id)) || resolveActorProfile(character, {
        actorId: character.id,
        storedStates: stateContext.storedStates,
        workingStates: stateContext.workingStates,
        resetCommentResources: false,
        recoveryDayKey: stateContext.recoveryDayKey
      });
      const ruleSelections = selectedByActor.get(String(character.id)) || [];
      return {
        actorId: source.characterId,
        actorName: source.name,
        profile: source,
        sourceRole: String(character.id) === String(actorCharacter.id)
          ? 'actor'
          : (String(character.id) === String(targetCharacter.id) ? 'target' : 'support'),
        relationToActor: String(character.id) === String(actorCharacter.id) ? 'self' : getCombatRelationship(character, actorCharacter),
        relationToTarget: String(character.id) === String(targetCharacter.id) ? 'self' : getCombatRelationship(character, targetCharacter),
        passiveRulesAllowed: [String(actorCharacter.id), String(targetCharacter.id)].includes(String(character.id)),
        selectedRuleIds: ruleSelections.map(selection => selection.ruleId),
        ruleSelections
      };
    });
}

function sceneProfileInput(character, options) {
  const actorId = String(options.actorId || character.id || '');
  const stored = options.storedStates?.get(actorId);
  const state = options.workingStates?.get(actorId) || stored;
  // A live character's current stock comes from its record. Historical and
  // temporary scene actors can still use the inventory captured in the scene.
  const inventory = options.historical || character.sourceCreatureId || state?.inventory !== stored?.inventory
    ? state?.inventory : null;
  const current = inventory ? { ...character, inventory } : character;
  const equipped = state?.equippedWeaponId || state?.supportEquipment || options.loadout
    ? projectCombatEquipmentFromInventory(current) : current;
  return { actorId, state: state ? { ...state, inventory } : null,
    character: withEquippedCombatWeapon(equipped, state?.equippedWeaponId, state?.offHandWeaponId, state?.supportEquipment) };
}

function getSceneContextActor(context, actorId) {
  const actor = context?.sceneActors?.find(candidate => String(candidate.id) === actorId);
  return actor ? resolveSceneCreatureSource(actor, getCharacterById(actor.sourceCreatureId)) : getCharacterById(actorId);
}

function resolveActorProfile(character, options = {}) {
  // Ein späterer "Ausrüstung wechseln"-Kommentar bestimmt, welche Waffe/welches Instrument
  // ab jetzt als aktiv gilt - muss vor der Profilauflösung angewendet werden, weil aktiveWeapon
  // und Technik-Kompatibilität bereits innerhalb von profileResolver.resolve entschieden werden.
  const { actorId, state, character: equippedCharacter } = sceneProfileInput(character, options);
  const prepared = prepareCombatEquipment(equippedCharacter, options.loadout, { free: options.freeEquipment });
  const effectiveCharacter = prepared.character;
  const profile = resolveCachedCombatProfile(effectiveCharacter, {
    actionId: options.actionId,
    segmentKind: options.segmentKind,
    paymentMode: options.paymentMode,
    weaponGrip: options.weaponGrip,
    castLevel: options.castLevel,
    hostileOpponentCount: options.hostileOpponentCount,
    includeAiSnapshot: options.includeAiSnapshot
  });
  const resetActors = options.commentResourceResetActors;
  const shouldResetCommentResources = options.resetCommentResources && !resetActors?.has(actorId);
  let effectiveResources = state?.resources || profile.resources;
  if (shouldResetCommentResources) effectiveResources = resetCommentScopedResources(effectiveResources);
  if (shouldResetCommentResources) resetActors?.add(actorId);
  effectiveResources = recoverDailyCombatResources(effectiveResources, options.recoveryDayKey);
  const effectiveState = state || shouldResetCommentResources || options.recoveryDayKey
    ? { ...(state || {}), resources: effectiveResources,
      ...(prepared.preparation?.after ? { supportEquipment: prepared.preparation.after } : {}),
      ...(shouldResetCommentResources && state?.temporaryConditions ? { temporaryConditions: conditionsAtContributionStart(state.temporaryConditions) } : {}) }
    : null;
  return reserveCombatEquipment(overlayCombatHitPointState(profile, effectiveState), prepared.preparation);
}

function resolveTargetPickerProfile(character, options = {}) {
  const { state, character: equippedCharacter } = sceneProfileInput(character, options);
  return overlayCombatHitPointState(resolveCachedCombatTarget(equippedCharacter), state);
}

function synchronizeSegmentTargets(segment, actor) {
  if (!actor) return;
  segment.combatTargetIds = getCombatTargetSelection(actor.selectedAction, actor.characterId,
    segment.combatTargetIds?.length ? segment.combatTargetIds : [segment.combatTargetId]);
  segment.combatTargetId = segment.combatTargetIds[0] || '';
}

function activateResolutionDialog() {
  const overlay = ensureCombatResolutionDialog();
  overlay.setAttribute('aria-hidden', 'false');
  if (typeof globalThis.activateDialog === 'function') {
    globalThis.activateDialog(overlay.id, { initialFocus: '[data-combat-resolution-status]' });
  } else {
    overlay.classList.add('active');
  }
  return overlay;
}

function closeResolutionDialog() {
  const overlay = document.getElementById('combat-resolution-overlay');
  if (!overlay) return;
  if (typeof globalThis.deactivateDialog === 'function') globalThis.deactivateDialog(overlay.id);
  else overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
}

function previewConsumedItem(segment, characters, fallbackActorId, workingStates, storedStates, options = {}) {
  advanceSubstanceStateMap(workingStates, options.sceneClockSeconds, options.sceneId);
  if (!['consume', 'interact'].includes(String(segment.kind || segment.commentKind))) return;
  const actorId = String(segment.actorId || segment.sceneActorId || segment.inventoryUse?.actorId || fallbackActorId || '');
  const character = characters.find(entry => String(entry.id) === actorId);
  if (!character) return;
  const state = workingStates.get(actorId) || storedStates.get(actorId) || {};
  if (segment.inventorySource === 'scene' || segment.inventoryUse?.source === 'scene') {
    const sceneItems = options.sceneItems;
    const entry = sceneItems?.get(segment.sceneItemId || segment.inventoryUse?.sceneItemId);
    if (!entry) return;
    const actor = resolveActorProfile(character, { actorId, storedStates, workingStates, resetCommentResources: true,
      commentResourceResetActors: options.resourceResetActors, recoveryDayKey: options.recoveryDayKey });
    const applied = applySceneItemInteraction({ entry, actor,
      sourceActor: characters.find(source => source.id === entry.sourceActorId),
      operation: (segment.kind || segment.commentKind) === 'consume' ? 'consume' : entry.operation === 'drop' ? 'pickup' : segment.inventoryOperation || 'use',
      paymentResource: segment.inventoryPaymentResource, usageId: segment.inventoryUse?.usageId || `preview:${segment.id}` });
    workingStates.set(actorId, previewSubstanceItem(segment, character, { ...state, inventory: applied.inventory, resources: applied.resources },
      { item: entry.item, quantity: applied.inventoryUse.quantity, seconds: options.sceneClockSeconds, sceneId: options.sceneId }));
    applySceneItemEvent(sceneItems, applied.inventoryUse.sceneItemEvent);
    for (const item of sceneItems.values()) if (item.sourceActorId && !workingStates.has(item.sourceActorId)) {
      workingStates.set(item.sourceActorId, { ...(storedStates.get(item.sourceActorId) || {}) });
    }
    applyDroppedWeaponsToStates(workingStates, sceneItems);
    return;
  }
  if (String(segment.kind || segment.commentKind) !== 'consume') return;
  workingStates.set(actorId, previewSubstanceItem(segment, character, previewZornkappeSegment(segment, character, state),
    { seconds: options.sceneClockSeconds, sceneId: options.sceneId }));
}

function mountComposers(context = {}) {
  latestComposerContext = context;
  const segments = Array.isArray(context.segments) ? context.segments : [];
  mountCommentConditionTracker(context, actorId => {
    const character = getSceneContextActor(context, actorId);
    return character ? resolveActorProfile(character, { actorId, storedStates: getStoredCombatStates(context.threadId || ''), includeAiSnapshot: false }) : null;
  }, (profile, method) => rollCreatureEscape(profile, method, new CombatDiceAdapter().forCounter()));
  if (!segments.some(isCombatSegment)) return;
  const cachedComments = globalThis.getCachedCommentsForThread?.(context.threadId || '') || [];
  const encounter = getActiveCombatEncounter(cachedComments);
  const activeEncounterPartyMap = getCombatEncounterPartyMap(encounter);
  const characters = applyEncounterParties(mergeCombatActors(getCharacters(), context.sceneActors || []), activeEncounterPartyMap);
  const storedStates = getStoredCombatStates(context.threadId || '');
  const recoveryDayKey = getCombatRecoveryDayKey(context.threadId || '');
  const composerStates = new Map(storedStates);
  const conditionClock = getSceneConditionClock(cachedComments);
  const actorsWithPosts = getActorsWithCombatPosts(cachedComments);
  const previewRulePeriods = withClassPassivePeriods(
    { comment: `draft:${context.threadId || ''}`, scene: context.threadId || '', day: recoveryDayKey }, cachedComments,
    { characterId: context.selectedCharacterId, commentSegments: segments });
  const previewFrequencyKeys = deriveCombatRuleFrequencyKeys(cachedComments, previewRulePeriods);
  const composerResourceResets = new Set();
  const composerSceneItems = deriveSceneItems(cachedComments);
  const targetCharacters = characters;
  const previewActorIds = getCombatPreviewActorIds({ segments, characters, selectedCharacterId: context.selectedCharacterId,
    participantIds: activeEncounterPartyMap, states: storedStates });
  const targetProfiles = new Map(targetCharacters.map(character => [
    String(character.id || ''),
    previewActorIds.has(String(character.id))
      ? resolveTargetPickerProfile(character, { actorId: character.id, storedStates }) : createCombatTargetSummary(character)
  ]));

  segments.forEach((segment, segmentIndex) => {
    try { previewConsumedItem(segment, characters, context.selectedCharacterId, composerStates, storedStates,
      { sceneItems: composerSceneItems, resourceResetActors: composerResourceResets, recoveryDayKey,
        sceneClockSeconds: sceneClockBeforeSegment(conditionClock, segments, segmentIndex), sceneId: context.threadId }); }
    catch { /* Invalid consumption is rejected explicitly during submission. */ }
    if (!isCombatSegment(segment)) return;
    segment.combatRollMode = 'normal';
    const actorId = String(segment.actorId || context.selectedCharacterId || '');
    const actorCharacter = characters.find(character => String(character.id || '') === actorId) || null;
    const runtime = { beforeStates: storedStates, afterStates: composerStates };
    const encounterError = actorCharacter
      ? getEncounterActionValidationError({ actorId, encounterId: encounter?.encounterId || '' }, encounter, runtime) : '';
    const actor = actorCharacter ? resolveActorProfile(actorCharacter, {
      actionId: segment.combatActionId,
      loadout: segment.combatLoadout,
      freeEquipment: !actorsWithPosts.has(actorId),
      actorId,
      storedStates,
      workingStates: composerStates,
      commentResourceResetActors: composerResourceResets,
      resetCommentResources: true,
      segmentKind: getEffectiveCombatSegmentKind(segment),
      paymentMode: segment.combatPaymentMode,
      weaponGrip: segment.combatWeaponGrip,
      castLevel: segment.combatCastLevel,
      hostileOpponentCount: countActiveHostileOpponents(actorId,
        getCombatEncounterPartyMap(encounter, runtime)),
      includeAiSnapshot: false,
      recoveryDayKey
    }) : null;
    if (actor?.equipmentPreparation && !actor.equipmentPreparation.error) {
      const previous = composerStates.get(actorId) || storedStates.get(actorId) || {};
      composerStates.set(actorId, { ...previous, resources: actor.resources,
        equippedWeaponId: actor.equipmentPreparation.after.rightWeaponId, offHandWeaponId: actor.equipmentPreparation.after.leftWeaponId,
        supportEquipment: { shieldId: actor.equipmentPreparation.after.shieldId, mountId: actor.equipmentPreparation.after.mountId } });
    }
    const actorValidation = actor ? profileResolver.validateActor(actor) : { ready: false, missingFields: [] };
    const abilityReservation = actor
      ? applyCombatAbilityUse(actor.abilities, actor.profileActionId, recoveryDayKey)
      : { sufficient: true, changed: false, abilities: [] };
    const actorReady = actorValidation.ready && abilityReservation.sufficient && !encounterError;
    const actorProblem = encounterError || (!abilityReservation.sufficient
      ? `${actor?.name || 'Die handelnde Figur'} hat keine Nutzung von ${abilityReservation.missing?.name || 'dieser Fähigkeit'} mehr übrig.`
      : (actor ? getCombatActorValidationMessage(actor, actorValidation) : ''));
    const auraPaymentAvailable = actor ? canUseAuraPayment(actor.selectedAction, actor) : false;
    const manaSubstitutePaymentAvailable = actor ? canUseManaSubstitutePayment(actor.selectedAction, actor) : false;
    const paymentOptions = actor ? [
      'standard',
      ...(auraPaymentAvailable ? ['aura'] : []),
      ...(manaSubstitutePaymentAvailable ? ['mana-substitute'] : [])
    ].map(mode => {
      const costs = getActionPaymentCosts(actor.selectedAction || {}, mode, actor);
      return { mode, costs, payment: applyCombatResourceCosts(actor.resources, costs) };
    }) : [];
    const selectedPaymentOption = paymentOptions.find(option => option.mode === segment.combatPaymentMode) || paymentOptions[0] || null;
    if (selectedPaymentOption && segment.combatPaymentMode !== selectedPaymentOption.mode) segment.combatPaymentMode = selectedPaymentOption.mode;
    const payment = selectedPaymentOption?.payment || null;
    let paymentConfirmed = !!segment.combatPaymentConfirmed || !!actor?.cheats?.enabled;
    if (paymentConfirmed && !actor?.cheats?.enabled && !payment?.sufficient) {
      segment.combatPaymentConfirmed = false;
      paymentConfirmed = false;
    }
    if (actor && actorReady && paymentConfirmed && payment?.sufficient) {
      const previous = composerStates.get(actorId) || storedStates.get(actorId) || {};
      const equippedWeaponId = getReservedEquipmentSwitchWeaponId(actor, paymentConfirmed);
      composerStates.set(actorId, {
        ...previous,
        resources: payment.after,
        ...(abilityReservation.changed ? { abilities: abilityReservation.abilities } : {}),
        ...(equippedWeaponId ? { equippedWeaponId } : {})
      });
    }
    synchronizeSegmentTargets(segment, actor);
    const previewProfiles = new Map(targetProfiles);
    for (const character of targetCharacters) {
      if (composerStates.has(String(character.id))) previewProfiles.set(String(character.id), resolveTargetPickerProfile(character, {
        storedStates, workingStates: composerStates
      }));
    }
    if (actor) previewProfiles.set(actorId, actor);
    const targets = prioritizeCombatTargets(targetCharacters
      .filter(character => isSelfTargetAction(actor?.selectedAction)
        ? String(character.id || '') === actorId
        : actionAllowsSelfTarget(actor?.selectedAction) || String(character.id || '') !== actorId)
      .map(character => {
        const target = previewProfiles.get(String(character.id || ''));
        if (target?.previewPending) return target;
        const sources = actor && target ? buildCombatRuleSources({ characters, actorCharacter, targetCharacter: character, segment,
          stateContext: { storedStates, workingStates: composerStates, recoveryDayKey }, profileOverrides: previewProfiles }) : [];
        return target ? { ...target, hitChance: estimateCombatHitChance(actor, target, {
          relationship: actorCharacter ? getCombatRelationship(actorCharacter, character) : 'enemy',
          distanceMeters: segment.combatDistanceMeters, ruleSources: sources,
          rulePeriods: previewRulePeriods, usedRuleFrequencyKeys: previewFrequencyKeys
        }) } : null;
      })
      .filter(Boolean), activeEncounterPartyMap);
    const targetCharacter = characters.find(character => String(character.id || '') === String(segment.combatTargetId || '')) || null;
    const ruleOptions = buildCombatRuleOptions({
      characters,
      actorCharacter,
      actor,
      targetCharacter,
      segment,
      storedStates,
      recoveryDayKey,
      profileOverrides: previewProfiles
    });
    const card = context.list?.querySelector?.(`[data-segment-id="${CSS.escape(String(segment.id || ''))}"]`);
    const previewTarget = targetCharacter ? previewProfiles.get(String(targetCharacter.id)) : {};
    const previewRules = actorCharacter && targetCharacter ? buildCombatRuleSources({ characters, actorCharacter, targetCharacter, segment,
      stateContext: { storedStates, workingStates: composerStates, recoveryDayKey }, profileOverrides: previewProfiles }) : undefined;
    const rollPreview = actor ? getCombatRollContext(actor, previewTarget, {
      relationship: targetCharacter ? getCombatRelationship(actorCharacter, targetCharacter) : 'enemy',
      distanceMeters: segment.combatDistanceMeters, ruleSources: previewRules,
      usedRuleFrequencyKeys: previewFrequencyKeys, rulePeriods: previewRulePeriods
    }) : null;
    mountCombatComposer({
      card,
      segment: { ...segment, kind: getEffectiveCombatSegmentKind(segment) },
      actor,
      freeEquipment: !actorsWithPosts.has(actorId),
      rollModes: rollPreview ? [rollPreview.profileRollModes, rollPreview.auraRollMode, ...rollPreview.preRollApplications.map(application => application.effects?.rollMode)] : [],
      targets,
      ruleOptions,
      actorReady,
      actorProblem,
      payment,
      paymentOptions,
      paymentConfirmed,
      auraPaymentAvailable,
      manaSubstitutePaymentAvailable
    });
  });
}

function updateEquipmentSelection(segmentId, field, value, composer) {
  const segment = latestComposerContext?.segments?.find(item => String(item.id) === String(segmentId));
  if (!segment) return;
  const actorId = String(segment.actorId || latestComposerContext.selectedCharacterId || '');
  const character = getSceneContextActor(latestComposerContext, actorId);
  if (!character) return;
  const weapons = character.combatProfile?.weapons || [];
  const view = composer.querySelector('[data-current-right]');
  let rightWeaponId = view?.dataset.currentRight || '';
  let leftWeaponId = view?.dataset.currentLeft || '';
  const supportView = composer.querySelector('[data-current-shield]');
  let shieldId = supportView?.dataset.currentShield || '';
  let mountId = supportView?.dataset.currentMount || '';
  if (field === 'right') {
    rightWeaponId = value;
    const right = weapons.find(weapon => weapon.id === rightWeaponId);
    if (isPairedCombatWeapon(right || {})) leftWeaponId = rightWeaponId;
    else if (!canUseCombatOffHand(right || {}) || rightWeaponId === leftWeaponId) leftWeaponId = '';
  }
  if (field === 'left') leftWeaponId = value;
  if (field === 'dual') {
    const right = weapons.find(weapon => weapon.id === rightWeaponId);
    leftWeaponId = value ? (isPairedCombatWeapon(right || {}) ? rightWeaponId
      : weapons.find(weapon => weapon.id !== rightWeaponId && canUseCombatOffHand(weapon))?.id || '') : '';
  }
  if (field === 'shield') { shieldId = shieldId === value ? '' : String(value); leftWeaponId = ''; }
  if (field === 'mount') mountId = mountId === value ? '' : String(value);
  if (leftWeaponId || !canCarryCombatShield(weapons.find(weapon => weapon.id === rightWeaponId))) shieldId = '';
  segment.combatLoadout = field === 'cancel' ? null : { rightWeaponId, leftWeaponId, shieldId, mountId };
  segment.combatActionId = '';
  segment.combatWeaponGrip = 'one-handed';
  segment.combatPaymentConfirmed = false;
  globalThis.persistCommentDraft?.();
  mountComposers(latestComposerContext);
}

function updateSegmentSetting(segmentId, field, value) {
  const segment = latestComposerContext?.segments?.find(item => String(item.id || '') === String(segmentId || ''));
  if (!segment) return;
  if (field === 'targetId') {
    segment.combatTargetId = String(value || '');
    segment.combatTargetIds = segment.combatTargetId ? [segment.combatTargetId] : [];
  }
  if (field === 'targetIds') {
    segment.combatTargetIds = [...new Set((Array.isArray(value) ? value : []).map(String).filter(Boolean))];
    segment.combatTargetId = segment.combatTargetIds[0] || '';
  }
  if (field === 'actionId') {
    segment.combatActionId = String(value || '');
    segment.combatTargetIds = segment.combatTargetId ? [segment.combatTargetId] : [];
    segment.combatWeaponGrip = 'one-handed';
    segment.combatCastLevel = 0;
    segment.combatPaymentConfirmed = false;
  }
  if (field === 'rollMode') return; // Wurfarten kommen ausschließlich aus aktiven Regelquellen.
  if (field === 'weaponGrip') segment.combatWeaponGrip = String(value || '') === 'two-handed' ? 'two-handed' : 'one-handed';
  if (field === 'castLevel') {
    segment.combatCastLevel = Math.max(0, Math.min(10, Number(value) || 0));
    segment.combatPaymentConfirmed = false;
  }
  if (field === 'distanceMeters') segment.combatDistanceMeters = normalizeCombatDistance(value);
  if (field === 'paymentMode') {
    segment.combatPaymentMode = ['aura', 'mana-substitute', 'cheat'].includes(value) ? value : 'standard';
    segment.combatPaymentConfirmed = false;
  }
  if (['actionId', 'paymentMode', 'weaponGrip', 'castLevel', 'targetId', 'targetIds', 'distanceMeters'].includes(field)) mountComposers(latestComposerContext || {});
  globalThis.persistCommentDraft?.();
}

function setSegmentPaymentConfirmation(segmentId, confirmed) {
  const segment = latestComposerContext?.segments?.find(item => String(item.id || '') === String(segmentId || ''));
  if (!segment || !isCombatSegment(segment)) return;
  segment.combatPaymentConfirmed = !!confirmed;
  globalThis.persistCommentDraft?.();
  mountComposers(latestComposerContext || {});
}

function chooseSegmentPayment(segmentId, paymentMode) {
  const segment = latestComposerContext?.segments?.find(item => String(item.id || '') === String(segmentId || ''));
  if (!segment || !isCombatSegment(segment)) return;
  const normalizedMode = ['aura', 'mana-substitute'].includes(paymentMode) ? paymentMode : 'standard';
  const releasesCurrent = segment.combatPaymentConfirmed && segment.combatPaymentMode === normalizedMode;
  segment.combatPaymentMode = normalizedMode;
  segment.combatPaymentConfirmed = !releasesCurrent;
  globalThis.persistCommentDraft?.();
  mountComposers(latestComposerContext || {});
}

function updateRuleSelection(segmentId, field, checked = null) {
  const segment = latestComposerContext?.segments?.find(item => String(item.id || '') === String(segmentId || ''));
  if (!segment || !isCombatSegment(segment)) return;
  if (!Array.isArray(segment.combatRuleSelections)) segment.combatRuleSelections = [];
  const sourceActorId = String(field.dataset.sourceActorId || '');
  const ruleId = String(field.dataset.ruleId || '');
  const index = segment.combatRuleSelections.findIndex(item => String(item.sourceActorId) === sourceActorId && String(item.ruleId) === ruleId);
  if (field.matches('[data-combat-rule-toggle]')) {
    if (checked && index < 0) {
      const kind = String(field.dataset.persistenceKind || '');
      segment.combatRuleSelections.push({
        sourceActorId,
        ruleId,
        distanceMeters: null,
        sourcePersistence: kind === 'scene-creature'
          ? { kind, sourceCreatureId: String(field.dataset.sourceCreatureId || '') }
          : { kind, recordId: String(field.dataset.recordId || '') }
      });
    }
    if (!checked && index >= 0) segment.combatRuleSelections.splice(index, 1);
  } else if (index >= 0) {
    segment.combatRuleSelections[index].distanceMeters = normalizeCombatDistance(field.value);
  }
  globalThis.persistCommentDraft?.();
  mountComposers(latestComposerContext || {});
}

function buildNarrationFacts(resolution) {
  return {
    actorId: resolution.actorId,
    targetId: resolution.targetId,
    actor: resolution.actorName,
    target: resolution.targetName,
    weapon: resolution.weapon?.name || '',
    hit: resolution.attack?.hit === true,
    critical: resolution.attack?.criticalSuccess === true,
    criticalFailure: resolution.attack?.criticalFailure === true,
    damage: resolution.damage?.total ?? null,
    attack: resolution.attack || null,
    damageRoll: resolution.damage || null,
    targetSnapshot: resolution.targetSnapshot || null,
    actorResourceSnapshot: resolution.actorResourceSnapshot || null,
    actorAbilitySnapshot: resolution.actorAbilitySnapshot || null,
    actorInventorySnapshot: resolution.actorInventorySnapshot || null,
    actorHitPointSnapshot: resolution.actorHitPointSnapshot || null,
    actorConditionSnapshot: resolution.actorConditionSnapshot || null,
    abilityUse: resolution.abilityUse || null,
    auraContext: resolution.auraContext || null,
    ruleApplications: resolution.ruleApplications || [],
    ruleResourceSnapshots: resolution.ruleResourceSnapshots || [],
    ruleAbilitySnapshots: resolution.ruleAbilitySnapshots || [],
    secondarySaves: resolution.secondarySaves || [],
    mountedHitChecks: resolution.mountedHitChecks || [],
    followUpAttacks: resolution.followUpAttacks || [],
    counterAttacks: resolution.counterAttacks || [],
    sceneItemEvents: resolution.sceneItemEvents || [],
    mechanicNotes: resolution.mechanicNotes || [],
    targetConditionSnapshot: resolution.targetConditionSnapshot || null,
    targetResourceSnapshot: resolution.targetResourceSnapshot || null,
    effectResults: resolution.effectResults || [],
    ruleConflicts: resolution.ruleConflicts || [],
    actorChannelingSnapshot: resolution.actorChannelingSnapshot || null,
    actorConcentrationSnapshot: resolution.actorConcentrationSnapshot || null,
    targetConcentrationSnapshot: resolution.targetConcentrationSnapshot || null,
    targetChannelingSnapshot: resolution.targetChannelingSnapshot || null,
    defeat: resolution.defeat || null,
    originalDescription: resolution.originalDescription,
    actorCombatProfile: resolution.actorCombatProfile,
    targetCombatProfile: resolution.targetCombatProfile
  };
}

async function narrateCommittedMechanics(mechanics = {}) {
  const resolutions = (Array.isArray(mechanics.commentSegments) ? mechanics.commentSegments : [])
    .flatMap(segment => Array.isArray(segment?.combatResolutions)
      ? segment.combatResolutions
      : [segment?.combatResolution])
    .filter(resolution => resolution?.serverValidated === true && resolution?.resolutionId);
  const entries = [];
  for (const resolution of resolutions) {
    entries.push({
      resolutionId: resolution.resolutionId,
      narration: await narrateCombatResolution(buildNarrationFacts(resolution))
    });
  }
  return entries;
}

async function resolveCombatTarget(segment, characters, index, total, fallbackActorId = '', stateContext = {}, resolutionOptions = {}) {
  const actorId = String(segment.sceneActorId || segment.actorId || segment.characterId || fallbackActorId || '');
  const actorCharacter = characters.find(character => String(character.id || '') === actorId);
  if (!actorCharacter) throw new Error('Die handelnde Figur dieser Kampfbeschreibung ist nicht mehr verfügbar.');
  const actor = resolveActorProfile(actorCharacter, {
    actionId: segment.combatActionId,
    loadout: resolutionOptions.primary === false ? null : segment.combatLoadout,
    freeEquipment: !stateContext.actorsWithPosts?.has(actorId),
    actorId,
    storedStates: stateContext.storedStates,
    workingStates: stateContext.workingStates,
    commentResourceResetActors: stateContext.commentResourceResetActors,
    resetCommentResources: true,
    segmentKind: getEffectiveCombatSegmentKind(segment),
    paymentMode: segment.combatPaymentMode,
    weaponGrip: segment.combatWeaponGrip,
    castLevel: segment.combatCastLevel,
    hostileOpponentCount: resolutionOptions.hostileOpponentCount,
    recoveryDayKey: stateContext.recoveryDayKey
  });
  const broadTargetEffect = (actor.selectedAction?.effects || []).some(effect => ['selected', 'allies', 'enemies', 'all'].includes(String(effect?.target || '')));
  const maximumTargets = Math.max(1, Number(actor.selectedAction?.maximumTargets) || (broadTargetEffect ? 20 : 1));
  if (Math.max(1, Number(resolutionOptions.targetCount) || 1) > maximumTargets) {
    throw new Error(`${actor.selectedAction?.name || 'Diese Technik'} erlaubt höchstens ${maximumTargets} Ziele.`);
  }
  if (!segment.combatPaymentConfirmed && !actor.cheats?.enabled) {
    const effectiveKind = getEffectiveCombatSegmentKind(segment);
    const actionLabel = effectiveKind === 'spell' ? 'Zauberformel' : (effectiveKind === 'prayer' ? 'Gebetsaktion' : (effectiveKind === 'song' ? 'Gesangsaktion' : 'Kampfhandlung'));
    throw new Error(`${actor.name} muss die Kosten dieser ${actionLabel} zuerst reservieren.`);
  }
  const actorValidation = profileResolver.validateActor(actor, { startedAction: resolutionOptions.startedAction });
  if (!actorValidation.ready) {
    throw new Error(getCombatActorValidationMessage(actor, actorValidation));
  }
  const targetId = String(resolutionOptions.targetId || segment.combatTargetId || '');
  if (!targetId) throw new Error('Wähle für jede Kampfbeschreibung ein Ziel.');
  const targetCharacter = characters.find(character => String(character.id || '') === targetId);
  if (!targetCharacter) throw new Error('Das gewählte Kampfziel ist nicht mehr verfügbar.');
  const target = resolveActorProfile(targetCharacter, {
    actorId: targetId,
    storedStates: stateContext.storedStates,
    workingStates: stateContext.workingStates,
    recoveryDayKey: stateContext.recoveryDayKey
  });
  const ruleSources = buildCombatRuleSources({ characters, actorCharacter, targetCharacter, segment, stateContext });
  const stage = document.getElementById('combat-dice-stage');
  setCombatResolutionStatus(
    total > 1 ? `Kampfauswertung ${index + 1} von ${total} …` : 'Angriffswurf …',
    `${actor.name} gegen ${target.name}`
  );
  const resolution = await resolutionService.resolveAttack({
    actor,
    target,
    description: segment.text,
    rollMode: segment.combatRollMode
  }, {
    container: stage,
    encounter: stateContext.encounter,
    relationship: getCombatRelationship(actorCharacter, targetCharacter),
    distanceMeters: segment.combatDistanceMeters,
    ruleSources,
    rulePeriods: stateContext.rulePeriods,
    usedRuleFrequencyKeys: stateContext.usedRuleFrequencyKeys,
    escapePreview: stateContext.escapePreviews?.get(actorId),
    startedAction: resolutionOptions.startedAction,
    skipResourceCosts: resolutionOptions.primary === false,
    skipAmmunition: resolutionOptions.primary === false,
    skipSelfEffects: resolutionOptions.primary === false,
    skipChanneling: resolutionOptions.primary === false,
    onPhase: phase => setCombatResolutionStatus(
      phase.phase === 'damage'
        ? 'Treffer – Schaden wird gewürfelt …'
        : (phase.phase === 'saving-throw' ? 'Das Ziel würfelt seinen Rettungswurf …' : 'Angriffswurf …'),
      phase.notation
    )
  });
  const abilityUse = resolution.actionType === 'channeling' || resolutionOptions.primary === false
    ? { changed: false, abilities: actor.abilities, beforeAbilities: actor.abilities, use: null, sufficient: true }
    : applyCombatAbilityUse(actor.abilities, actor.profileActionId, stateContext.recoveryDayKey);
  if (!abilityUse.sufficient) {
    throw new Error(`${actor.name} hat keine Nutzung von ${abilityUse.missing?.name || 'dieser Fähigkeit'} mehr übrig.`);
  }
  if (resolution.actionType !== 'channeling' && abilityUse.changed) {
    resolution.abilityUse = abilityUse.use;
    resolution.actorAbilitySnapshot = {
      before: abilityUse.beforeAbilities,
      after: abilityUse.abilities,
      change: abilityUse.use
    };
  }
  setCombatResolutionStatus('Würfelbeleg erfasst …', 'Der Server prüft Profilwerte und endgültigen Zustand beim Speichern.');
  const nextTargetInventory = getResolutionTargetInventoryState(resolution);
  const nextTargetState = getResolutionHitPointState(resolution);
  const nextTargetConditions = getResolutionTargetConditionState(resolution);
  const nextTargetResources = getResolutionTargetResourceState(resolution);
  const nextTargetConcentration = getResolutionTargetConcentrationState(resolution);
  const nextTargetChanneling = getResolutionTargetChannelingState(resolution);
  if (nextTargetInventory || nextTargetState || nextTargetConditions || nextTargetResources || nextTargetConcentration !== undefined || nextTargetChanneling !== undefined) {
    const previous = stateContext.workingStates?.get(targetId) || stateContext.storedStates?.get(targetId) || {};
    stateContext.workingStates?.set(targetId, {
      ...previous,
      ...(nextTargetState || {}),
      ...(nextTargetInventory ? { inventory: nextTargetInventory } : {}),
      ...(nextTargetConditions ? { temporaryConditions: nextTargetConditions } : {}),
      ...(nextTargetResources ? { resources: nextTargetResources } : {}),
      ...(nextTargetConcentration !== undefined ? { concentration: nextTargetConcentration } : {}),
      ...(nextTargetChanneling !== undefined ? { channeling: nextTargetChanneling } : {})
    });
  }
  const nextActorResources = getResolutionActorResourceState(resolution);
  const nextActorInventory = getResolutionActorInventoryState(resolution);
  const nextActorHitPoints = getResolutionActorHitPointState(resolution);
  const nextActorConditions = getResolutionActorConditionState(resolution);
  const nextActorEquippedWeaponId = getResolutionActorEquippedWeaponState(resolution);
  const nextActorChanneling = getResolutionActorChannelingState(resolution);
  const nextActorConcentration = getResolutionActorConcentrationState(resolution);
  if (nextActorResources || nextActorInventory || nextActorHitPoints || nextActorConditions || nextActorEquippedWeaponId
    || (resolution.actionType !== 'channeling' && abilityUse.changed)
    || nextActorChanneling !== undefined || nextActorConcentration !== undefined) {
    const previous = stateContext.workingStates?.get(actorId) || stateContext.storedStates?.get(actorId) || {};
    stateContext.workingStates?.set(actorId, {
      ...previous,
      ...(nextActorResources ? { resources: nextActorResources } : {}),
      ...(nextActorInventory ? { inventory: nextActorInventory } : {}),
      ...(nextActorHitPoints || {}),
      ...(nextActorConditions ? { temporaryConditions: nextActorConditions } : {}),
      ...getResolutionActorLoadoutState(resolution),
      ...(resolution.actionType !== 'channeling' && abilityUse.changed ? { abilities: abilityUse.abilities } : {}),
      ...(nextActorChanneling !== undefined ? { channeling: nextActorChanneling } : {}),
      ...(nextActorConcentration !== undefined ? { concentration: nextActorConcentration } : {})
    });
  }
  applyDismountSnapshots(stateContext.workingStates, resolution, stateContext.actorsWithPosts);
  const reactionUses = consumeCombatRuleAbilityUses(resolution.ruleApplications, ruleSources, {
    dayKey: stateContext.recoveryDayKey, states: stateContext.workingStates, perTrigger: true
  });
  if (reactionUses.length) resolution.ruleAbilitySnapshots = reactionUses;
  for (const snapshot of reactionUses) {
    const previous = stateContext.workingStates?.get(snapshot.sourceActorId) || stateContext.storedStates?.get(snapshot.sourceActorId) || {};
    stateContext.workingStates?.set(snapshot.sourceActorId, { ...previous, abilities: snapshot.after });
  }
  (Array.isArray(resolution.ruleResourceSnapshots) ? resolution.ruleResourceSnapshots : []).forEach(snapshot => {
    const previous = stateContext.workingStates?.get(String(snapshot.sourceActorId)) || stateContext.storedStates?.get(String(snapshot.sourceActorId)) || {};
    stateContext.workingStates?.set(String(snapshot.sourceActorId), { ...previous, resources: snapshot.after });
  });
  for (const event of resolution.sceneItemEvents || []) applySceneItemEvent(stateContext.sceneItems, event);
  if (resolution.sceneItemEvents?.length) applyDroppedWeaponsToStates(stateContext.workingStates, stateContext.sceneItems);
  reconcileConcentrationConditions(stateContext.workingStates);
  stateContext.usedRuleFrequencyKeys = new Set(resolution.usedRuleFrequencyKeys || []);
  resolution.multiTargetIndex = Math.max(0, Number(resolutionOptions.targetIndex) || 0);
  resolution.multiTargetCount = Math.max(1, Number(resolutionOptions.targetCount) || 1);
  return resolution;
}

async function resolveCombatSegment(segment, characters, index, total, fallbackActorId = '', stateContext = {}) {
  const actorId = String(segment.sceneActorId || segment.actorId || segment.characterId || fallbackActorId || '');
  const { encounter, storedStates, workingStates } = stateContext;
  const runtime = { beforeStates: storedStates, afterStates: workingStates };
  const error = getEncounterActionValidationError({ actorId, encounterId: encounter?.encounterId || '' }, encounter, runtime);
  if (error) throw new Error(error);
  const held = getHeldCondition(workingStates?.get(actorId) || {});
  const escapePreview = stateContext.escapePreviews?.get(actorId);
  if (segment.combatActionId === COMBAT_WAIT_ACTION.id && held?.id && escapePreview?.conditionId === held.id
    && held.restraint.lastAttempt !== stateContext.rulePeriods?.comment) {
    segment.combatActionId = getEscapeActionId(escapePreview.method);
  }
  const hostileOpponentCount = countActiveHostileOpponents(actorId, getCombatEncounterPartyMap(encounter, runtime));
  const character = characters.find(entry => String(entry.id || '') === actorId);
  if (character) synchronizeSegmentTargets(segment, resolveActorProfile(character, {
    actionId: segment.combatActionId, actorId, segmentKind: getEffectiveCombatSegmentKind(segment),
    castLevel: segment.combatCastLevel, weaponGrip: segment.combatWeaponGrip,
    storedStates: stateContext.storedStates, workingStates: stateContext.workingStates, includeAiSnapshot: false
  }));
  const targetIds = [...new Set((Array.isArray(segment.combatTargetIds) && segment.combatTargetIds.length
    ? segment.combatTargetIds
    : [segment.combatTargetId]).map(String).filter(Boolean))].slice(0, 20);
  if (!targetIds.length) throw new Error('Wähle für jede Kampfbeschreibung mindestens ein Ziel.');
  const resolutions = [];
  for (let targetIndex = 0; targetIndex < targetIds.length; targetIndex += 1) {
    const resolution = await resolveCombatTarget(
      segment,
      characters,
      index,
      total,
      fallbackActorId,
      stateContext,
      { targetId: targetIds[targetIndex], targetIndex, targetCount: targetIds.length, primary: targetIndex === 0,
        startedAction: resolutions[0], hostileOpponentCount }
    );
    resolutions.push(resolution);
    if (resolution.actionType === 'channeling') break;
  }
  return resolutions;
}

function creatureContributionContext(threadId) {
  const cachedComments = globalThis.getCachedCommentsForThread?.(threadId || '') || [];
  const encounter = getActiveCombatEncounter(cachedComments);
  const partyMap = getCombatEncounterPartyMap(encounter);
  const composer = latestComposerContext?.threadId === threadId ? latestComposerContext : null;
  const characters = applyEncounterParties(
    mergeCombatActors(getCharacters(), composer?.sceneActors || []), partyMap
  );
  const storedStates = getStoredCombatStates(threadId || '');
  const profileFor = actorId => {
    if (!partyMap.has(actorId)) return null;
    const character = characters.find(entry => String(entry.id) === actorId);
    return character ? resolveActorProfile(character, { actorId, storedStates, includeAiSnapshot: false }) : null;
  };
  return { cachedComments, encounter, characters, storedStates, profileFor, composer };
}

function hasCombatContribution(segments, { threadId = '', characterId = '' } = {}) {
  if ((segments || []).some(isCombatSegment)) return true;
  return Boolean(threadId && hasCreatureContribution(segments || [], characterId, creatureContributionContext(threadId).profileFor));
}

function skipAutomaticCreatureSegment(segment, { workingStates, rulePeriods }) {
  if (!segment.creatureAutomatic) return false;
  const state = workingStates.get(segment.actorId);
  if (state?.current === 0) return true;
  if (segment.combatActionId === CREATURE_TURN_END_ID) return false;
  const held = getHeldCondition(state || {});
  return !held || held.restraint.lastAttempt === rulePeriods.comment;
}

async function handleSubmission(submission = {}) {
  const sourceSegments = Array.isArray(submission.commentSegments) ? submission.commentSegments : [];
  const { cachedComments, encounter, characters, storedStates, profileFor, composer } = creatureContributionContext(submission.threadId || '');
  const escapePreviews = await getCommentCreatureEscapePreviews(composer?.list);
  const segments = withCreatureContribution(sourceSegments, submission.characterId, profileFor, escapePreviews);
  const combatSegments = segments.filter(isCombatSegment);
  if (!combatSegments.length) return { handled: false, published: false };
  const encounterId = encounter?.encounterId || '';
  const stateContext = {
    encounter,
    sceneItems: deriveSceneItems(cachedComments),
    storedStates,
    escapePreviews,
    workingStates: new Map(),
    commentResourceResetActors: new Set(),
    recoveryDayKey: getCombatRecoveryDayKey(submission.threadId || ''),
    actorsWithPosts: getActorsWithCombatPosts(globalThis.getCachedCommentsForThread?.(submission.threadId || submission.entryId || '') || []),
    rulePeriods: withClassPassivePeriods({
      comment: `draft:${String(submission.threadId || '')}:${Date.now()}`,
      scene: String(submission.threadId || ''),
      day: getCombatRecoveryDayKey(submission.threadId || '')
    }, cachedComments, submission)
  };
  stateContext.usedRuleFrequencyKeys = deriveCombatRuleFrequencyKeys(
    cachedComments,
    stateContext.rulePeriods
  );
  stateContext.workingStates = new Map(stateContext.storedStates);
  beginCombatContribution(stateContext.workingStates, { characterId: submission.characterId, commentSegments: segments });
  for (const actorId of getCommentActorIds({ characterId: submission.characterId, commentSegments: segments })) {
    if (Array.isArray(stateContext.workingStates.get(actorId)?.resources)) stateContext.commentResourceResetActors.add(actorId);
  }
  beginCriticalContribution(stateContext.workingStates, { characterId: submission.characterId, commentSegments: segments });

  activateResolutionDialog();
  try {
    const resolutionGroups = [];
    const skippedCreatureSegments = new Set();
    const skillResolutions = new Map();
    const skillContext = {
      comments: cachedComments,
      grantedKeys: collectChallengeGrantKeys(cachedComments),
      rulePeriods: stateContext.rulePeriods,
      usedRuleFrequencyKeys: stateContext.usedRuleFrequencyKeys,
      profileResolver: {
        resolve: actor => {
          const profile = resolveActorProfile(actor, {
            actorId: actor.id, storedStates: stateContext.storedStates, workingStates: stateContext.workingStates,
            resetCommentResources: true, commentResourceResetActors: stateContext.commentResourceResetActors,
            recoveryDayKey: stateContext.recoveryDayKey
          });
          const previous = stateContext.workingStates.get(actor.id) || {};
          stateContext.workingStates.set(actor.id, { ...previous, resources: profile.resources });
          return profile;
        },
        appendResolution: resolution => applySkillRuntimeSnapshots(stateContext.workingStates, resolution)
      }
    };
    for (const [segmentIndex, segment] of segments.entries()) {
      previewConsumedItem(segment, characters, submission.characterId, stateContext.workingStates, stateContext.storedStates,
        { sceneItems: stateContext.sceneItems, resourceResetActors: stateContext.commentResourceResetActors, recoveryDayKey: stateContext.recoveryDayKey,
          sceneClockSeconds: sceneClockBeforeSegment(getSceneConditionClock(cachedComments), segments, segmentIndex), sceneId: submission.threadId });
      if (String(segment.mechanicMode) === 'skill') {
        if (!globalThis.AleriaSkillChecks?.resolveDraftSegment) throw Error('Die Fertigkeitsauswertung ist noch nicht geladen.');
        skillContext.usedRuleFrequencyKeys = stateContext.usedRuleFrequencyKeys;
        const resolution = await globalThis.AleriaSkillChecks.resolveDraftSegment(segment, submission, skillContext);
        skillResolutions.set(segment, resolution);
        stateContext.usedRuleFrequencyKeys = skillContext.usedRuleFrequencyKeys;
      }
      if (!isCombatSegment(segment)) continue;
      if (skipAutomaticCreatureSegment(segment, stateContext)) { skippedCreatureSegments.add(segment); continue; }
      resolutionGroups.push(await resolveCombatSegment(
        segment,
        characters,
        resolutionGroups.length,
        combatSegments.length,
        submission.characterId,
        stateContext
      ));
    }

    let resolutionIndex = 0;
    const enhancedSegments = segments.filter(segment => !skippedCreatureSegments.has(segment)).map(segment => {
      const { clientSegmentId, ...storedSegment } = segment;
      if (skillResolutions.has(segment)) return { ...storedSegment, skillResolution: skillResolutions.get(segment) };
      if (!isCombatSegment(storedSegment)) return storedSegment;
      const combatResolutions = resolutionGroups[resolutionIndex++] || [];
      const combatResolution = combatResolutions[0];
      return {
        ...storedSegment,
        mechanicMode: getCombatSegmentMode(storedSegment),
        combatAction: {
          schemaVersion: 4,
          encounterId,
          actionType: 'attack',
          presentationKind: storedSegment.commentKind || storedSegment.kind,
          actorId: combatResolution.actorId,
          targetId: combatResolution.targetId,
          targetIds: combatResolutions.map(resolution => resolution.targetId),
          profileActionId: combatResolution.profileActionId || storedSegment.combatActionId || '',
          profileActionKind: combatResolution.profileActionKind || '',
          rollMode: combatResolution.attack.rollMode,
          loadout: normalizeCombatLoadout(storedSegment.combatLoadout),
          weaponGrip: combatResolution.weaponGrip || storedSegment.combatWeaponGrip || 'one-handed',
          castLevel: combatResolution.castLevel ?? storedSegment.combatCastLevel ?? 0,
          paymentMode: storedSegment.combatPaymentMode || 'standard',
          resourceCosts: combatResolution.resourceCosts || [],
          ruleSelections: Array.isArray(storedSegment.combatRuleSelections) ? storedSegment.combatRuleSelections.map(selection => ({ ...selection })) : [],
          originalDescription: storedSegment.text
        },
        combatResolution,
        ...(combatResolutions.length > 1 ? { combatResolutions } : {})
      };
    });
    setCombatResolutionStatus('Kampfauswertung abgeschlossen.', 'Der Beitrag wird gespeichert …');
    closeResolutionDialog();
    return {
      handled: true,
      published: false,
      commentMetadata: {
        commentSegments: enhancedSegments,
        combatRecoveryDayKey: stateContext.recoveryDayKey,
        combatAction: combatSegments.length === 1 ? enhancedSegments.find(segment => segment.combatAction)?.combatAction || null : null,
        combatResolution: combatSegments.length === 1 && resolutionGroups[0]?.length === 1 ? resolutionGroups[0][0] : null
      }
    };
  } catch (error) {
    closeResolutionDialog();
    throw error;
  }
}

document.addEventListener('change', event => {
  const loadoutField = event.target?.closest?.('[data-combat-loadout]');
  if (loadoutField) {
    const composer = loadoutField.closest('[data-combat-composer]');
    updateEquipmentSelection(composer?.dataset.combatSegmentId, loadoutField.dataset.combatLoadout,
      loadoutField.type === 'checkbox' ? loadoutField.checked : loadoutField.value, composer);
    return;
  }
  const ruleField = event.target?.closest?.('[data-combat-rule-toggle], [data-combat-rule-distance]');
  if (ruleField) {
    const composer = ruleField.closest('[data-combat-composer]');
    updateRuleSelection(composer?.dataset.combatSegmentId, ruleField, ruleField.type === 'checkbox' ? ruleField.checked : null);
    return;
  }
  const field = event.target?.closest?.('[data-combat-input]');
  if (!field) return;
  const composer = field.closest('[data-combat-composer]');
  updateSegmentSetting(composer?.dataset.combatSegmentId, field.dataset.combatInput, field.multiple
    ? [...field.selectedOptions].map(option => option.value).filter(Boolean)
    : field.value);
});

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-combat-controller-action]');
  if (!trigger) return;
  const composer = trigger.closest('[data-combat-composer]');
  const segmentId = composer?.dataset.combatSegmentId || '';
  if (trigger.dataset.combatControllerAction === 'choose-payment') chooseSegmentPayment(segmentId, trigger.dataset.paymentMode);
  if (trigger.dataset.combatControllerAction === 'select-weapon') updateEquipmentSelection(segmentId, 'right', trigger.dataset.weaponId, composer);
  if (trigger.dataset.combatControllerAction === 'select-shield') updateEquipmentSelection(segmentId, 'shield', trigger.dataset.equipmentId, composer);
  if (trigger.dataset.combatControllerAction === 'select-mount') updateEquipmentSelection(segmentId, 'mount', trigger.dataset.equipmentId, composer);
  if (trigger.dataset.combatControllerAction === 'cancel-equipment') updateEquipmentSelection(segmentId, 'cancel', '', composer);
  if (trigger.dataset.combatControllerAction === 'confirm-payment') setSegmentPaymentConfirmation(segmentId, true);
  if (trigger.dataset.combatControllerAction === 'release-payment') setSegmentPaymentConfirmation(segmentId, false);
});

document.addEventListener('input', event => {
  const search = event.target?.closest?.('[data-combat-target-search]');
  if (!search) return;
  filterCombatTargets(search.closest('[data-combat-composer]'), search.value);
});

let composerRefreshQueued = false;
const profileInputEvents = ['aleria:combat-profile-committed', 'aleria:characters-changed', 'aleria:creatures-changed', 'aleria:item-definitions-changed'];
for (const name of [...profileInputEvents, 'aleria:comments-updated', 'aleria:inventory-use-selection-changed']) document.addEventListener(name, () => {
  if (profileInputEvents.includes(name)) {
    resolvedCombatProfileCache.clear();
    resolvedCombatTargetCache = new WeakMap();
  }
  if (composerRefreshQueued || !latestComposerContext?.list?.isConnected || latestComposerContext.list.closest('[aria-hidden="true"]')) return;
  composerRefreshQueued = true;
  requestAnimationFrame(() => {
    composerRefreshQueued = false;
    if (latestComposerContext?.list?.isConnected && !latestComposerContext.list.closest('[aria-hidden="true"]')) mountComposers(latestComposerContext);
  });
});

globalThis.AleriaCombat = Object.freeze({
  getProfile(characterId, options = {}) {
    const character = getCharacterById(characterId);
    if (!character) return null;
    void loadInventoryItemVersions([character]).catch(error => console.warn('Itemregeln konnten nicht geladen werden:', error));
    const actorId = String(options.actorId || characterId || '');
    const threadId = options.threadId || '';
    const historical = !!options.timelineCommentId;
    const comments = globalThis.getCachedCommentsForThread?.(threadId) || [];
    const liveScene = threadId && !historical;
    const recoveryDayKey = liveScene ? getSceneRecoveryDayKey(threadId, comments) : '';
    const profile = resolveActorProfile(character, {
      actorId, storedStates: getStoredCombatStates(threadId, options), historical, recoveryDayKey,
      hostileOpponentCount: liveScene ? countActiveHostileOpponents(actorId, getActiveCombatPartyMap(comments)) : null
    });
    return {
      ...profile,
      ...(recoveryDayKey ? { abilities: profile.abilities.map(ability => getCombatAbilityAtDay(ability, recoveryDayKey)) } : {}),
      sceneDocumentation: getSceneCombatDocumentation(profile, comments, threadId)
    };
  },
  mountComposer(list, context = {}) {
    mountComposers({
      list,
      segments: Array.isArray(context.segments) ? context.segments : [],
      selectedCharacterId: String(context.selectedCharacterId || ''),
      sceneActors: Array.isArray(context.sceneActors) ? context.sceneActors : [],
      threadId: String(context.threadId || '')
    });
  },
  releaseComposer(list) {
    if (!list) return;
    releaseCommentConditionTracker(list);
    list.querySelectorAll('[data-combat-composer]').forEach(composer => composer.remove());
    if (latestComposerContext?.list === list) latestComposerContext = null;
    resolvedCombatProfileCache.clear();
    resolvedCombatTargetCache = new WeakMap();
  },
  handleSubmission,
  hasCombatSegments: hasCombatContribution,
  narrateCommittedMechanics,
  renderEvaluation: renderCombatEvaluation
});
bindCombatTooltips(document);
