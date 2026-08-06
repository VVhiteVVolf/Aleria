import { CombatDiceAdapter } from './combat-dice-adapter.js?v=20260802-dice-audio-v2';
import { narrateCombatResolution } from './combat-narration-service.js?v=20260806-agency-v1';
import {
  CombatProfileResolver,
  getCombatActorValidationMessage
} from './combat-profile-resolver.js?v=20260804-referee-v2';
import { CombatResolutionService } from './combat-resolution-service.js?v=20260804-referee-v2';
import {
  applyCombatResourceCosts,
  deriveCombatStateFromComments,
  getResolutionActorChannelingState,
  getResolutionActorConcentrationState,
  getResolutionActorConditionState,
  getResolutionActorHitPointState,
  getResolutionActorInventoryState,
  getResolutionActorResourceState,
  getResolutionHitPointState,
  getResolutionTargetConditionState,
  getResolutionTargetChannelingState,
  getResolutionTargetConcentrationState,
  getResolutionTargetResourceState,
  overlayCombatHitPointState
} from './combat-state-model.js?v=20260806-encounter-card-v1';
import {
  canUseAuraPayment,
  getActionPaymentCosts,
  recoverDailyCombatResources,
  resetCommentScopedResources
} from './combat-action-economy.js?v=20260803-economy-audit-v1';
import { applyCombatAbilityUse } from './combat-ability-uses.js?v=20260803-action-economy-v1';
import {
  ensureCombatResolutionDialog,
  mountCombatComposer,
  renderCombatEvaluation,
  setCombatResolutionStatus
} from './ui/combat-ui.js?v=20260806-encounter-card-v1';
import {
  collectCombatTriggerRules,
  deriveCombatRuleFrequencyKeys
} from './combat-trigger-rules.js?v=20260804-referee-v2';
import { getActiveCombatPartyMap } from './combat-encounter-model.js?v=20260806-encounter-card-v1';

const profileResolver = new CombatProfileResolver();
const resolutionService = new CombatResolutionService(new CombatDiceAdapter());
let latestComposerContext = null;
function getCombatSegmentMode(segment = {}) {
  const explicit = String(segment.mechanicMode || '').trim();
  if (explicit === 'combat' || explicit === 'magic') return explicit;
  if (segment.combatResolution || segment.combatAction || segment.storedCombatResolution || segment.storedCombatAction) {
    return ['spell', 'prayer', 'song'].includes(String(segment.commentKind || segment.kind || '')) ? 'magic' : 'combat';
  }
  return 'normal';
}

function isCombatSegment(segment = {}) {
  return ['combat', 'magic'].includes(getCombatSegmentMode(segment));
}

function getEffectiveCombatSegmentKind(segment = {}) {
  if (getCombatSegmentMode(segment) === 'combat') return 'combataction';
  const kind = String(segment.commentKind || segment.kind || '');
  return ['spell', 'prayer', 'song'].includes(kind) ? kind : 'spell';
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
  sceneActors.forEach(actor => merged.set(String(actor.id || ''), actor));
  return [...merged.values()];
}

function applyEncounterParties(characters = [], comments = []) {
  const partyMap = getActiveCombatPartyMap(comments);
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
  const timeline = typeof globalThis.buildSceneTimeline === 'function' ? globalThis.buildSceneTimeline(comments) : [];
  const lastTimedEntry = [...timeline].reverse().find(entry => Number.isFinite(entry?.endSeconds));
  const day = typeof globalThis.getSceneDayFromSeconds === 'function'
    ? globalThis.getSceneDayFromSeconds(lastTimedEntry?.endSeconds || 0)
    : 1;
  return `scene:${String(threadId || 'unknown')}:day-${day}`;
}

function relationMatchesRule(rule, relation) {
  return rule.sourceRelation === 'any' || rule.sourceRelation === relation;
}

function buildCombatRuleOptions({ characters, actorCharacter, actor, targetCharacter, segment, storedStates, recoveryDayKey } = {}) {
  if (!actorCharacter || !targetCharacter) return [];
  const selections = Array.isArray(segment?.combatRuleSelections) ? segment.combatRuleSelections : [];
  const actionKind = String(actor?.profileActionKind || 'weapon');
  return characters.flatMap(character => {
    const source = resolveActorProfile(character, {
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
          distanceMeters: selected?.distanceMeters ?? 0,
          phaseLabel: rule.phase === 'pre-roll' ? 'vor Wurf' : (rule.phase === 'post-roll' ? 'nach Wurf' : (rule.phase === 'post-hit' ? 'nach Trefferpr\u00fcfung' : 'vor Schaden'))
        };
      });
    const isDirectParticipant = [String(actorCharacter.id), String(targetCharacter.id)].includes(String(character.id));
    const auraOptions = !isDirectParticipant && source.aura?.enabled
      ? [['@aura:actor', 'Aura auf handelnde Figur'], ['@aura:target', 'Aura auf Ziel']].map(([ruleId, ruleName]) => {
          const selected = selections.find(item => String(item.sourceActorId) === String(source.characterId) && String(item.ruleId) === ruleId);
          return {
            sourceActorId: source.characterId,
            sourceActorName: source.name,
            persistence: source.persistence || null,
            ruleId,
            ruleName: `${source.aura.name || 'Aura'} \u00b7 ${ruleName}`,
            costs: [],
            selected: !!selected,
            distanceMeters: selected?.distanceMeters ?? 0,
            phaseLabel: 'Pr\u00e4senz \u00b7 Radius wird gepr\u00fcft'
          };
        })
      : [];
    return [...reactionOptions, ...auraOptions];
  });
}

function buildCombatRuleSources({ characters, actorCharacter, targetCharacter, segment, stateContext } = {}) {
  const selections = Array.isArray(segment?.combatRuleSelections) ? segment.combatRuleSelections : [];
  const selectedByActor = new Map();
  selections.forEach(selection => {
    const actorId = String(selection.sourceActorId || '');
    if (!selectedByActor.has(actorId)) selectedByActor.set(actorId, []);
    selectedByActor.get(actorId).push(String(selection.ruleId || ''));
  });
  return characters
    .filter(character => selectedByActor.has(String(character.id || ''))
      || String(character.id) === String(actorCharacter.id)
      || String(character.id) === String(targetCharacter.id))
    .map(character => {
      const source = resolveActorProfile(character, {
        actorId: character.id,
        storedStates: stateContext.storedStates,
        workingStates: stateContext.workingStates,
        resetCommentResources: false,
        recoveryDayKey: stateContext.recoveryDayKey
      });
      const selection = selections.find(item => String(item.sourceActorId) === String(character.id));
      const distance = Math.max(0, Math.min(9999, Number(selection?.distanceMeters) || 0));
      return {
        actorId: source.characterId,
        actorName: source.name,
        profile: source,
        sourceRole: String(character.id) === String(actorCharacter.id)
          ? 'actor'
          : (String(character.id) === String(targetCharacter.id) ? 'target' : 'support'),
        relationToActor: String(character.id) === String(actorCharacter.id) ? 'self' : getCombatRelationship(character, actorCharacter),
        relationToTarget: String(character.id) === String(targetCharacter.id) ? 'self' : getCombatRelationship(character, targetCharacter),
        distanceToActor: String(character.id) === String(actorCharacter.id) ? 0 : distance,
        distanceToTarget: String(character.id) === String(targetCharacter.id) ? 0 : distance,
        passiveRulesAllowed: [String(actorCharacter.id), String(targetCharacter.id)].includes(String(character.id)),
        selectedRuleIds: selectedByActor.get(String(character.id)) || []
      };
    });
}

function resolveActorProfile(character, options = {}) {
  const profile = profileResolver.resolve(character, {
    actionId: options.actionId,
    segmentKind: options.segmentKind,
    paymentMode: options.paymentMode,
    weaponGrip: options.weaponGrip,
    castLevel: options.castLevel
  });
  const actorId = String(options.actorId || profile.characterId || '');
  const state = options.workingStates?.get(actorId) || options.storedStates?.get(actorId) || null;
  const resetActors = options.commentResourceResetActors;
  const shouldResetCommentResources = options.resetCommentResources && !resetActors?.has(actorId);
  let effectiveResources = state?.resources || profile.resources;
  if (shouldResetCommentResources) effectiveResources = resetCommentScopedResources(effectiveResources);
  if (shouldResetCommentResources) resetActors?.add(actorId);
  effectiveResources = recoverDailyCombatResources(effectiveResources, options.recoveryDayKey);
  const effectiveState = state || shouldResetCommentResources || options.recoveryDayKey
    ? { ...(state || {}), resources: effectiveResources }
    : null;
  return overlayCombatHitPointState(profile, effectiveState);
}

function actionAllowsSelfTarget(actor) {
  const effects = Array.isArray(actor?.selectedAction?.effects) ? actor.selectedAction.effects : [];
  return effects.length > 0 && !effects.some(effect => ['damage', 'debuff'].includes(String(effect?.type || '')));
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

function mountComposers(context = {}) {
  latestComposerContext = context;
  const segments = Array.isArray(context.segments) ? context.segments : [];
  if (!segments.some(isCombatSegment)) return;
  const cachedComments = globalThis.getCachedCommentsForThread?.(context.threadId || '') || [];
  const activeEncounterPartyMap = getActiveCombatPartyMap(cachedComments);
  const characters = applyEncounterParties(mergeCombatActors(getCharacters(), context.sceneActors || []), cachedComments);
  const storedStates = getStoredCombatStates(context.threadId || '');
  const recoveryDayKey = getCombatRecoveryDayKey(context.threadId || '');
  const composerStates = new Map();
  const composerResourceResets = new Set();

  segments.forEach(segment => {
    if (!isCombatSegment(segment)) return;
    const actorId = String(segment.actorId || context.selectedCharacterId || '');
    const actorCharacter = characters.find(character => String(character.id || '') === actorId) || null;
    const actor = actorCharacter ? resolveActorProfile(actorCharacter, {
      actionId: segment.combatActionId,
      actorId,
      storedStates,
      workingStates: composerStates,
      commentResourceResetActors: composerResourceResets,
      resetCommentResources: true,
      segmentKind: getEffectiveCombatSegmentKind(segment),
      paymentMode: segment.combatPaymentMode,
      weaponGrip: segment.combatWeaponGrip,
      castLevel: segment.combatCastLevel,
      recoveryDayKey
    }) : null;
    const actorValidation = actor ? profileResolver.validateActor(actor) : { ready: false, missingFields: [] };
    const abilityReservation = actor
      ? applyCombatAbilityUse(actor.abilities, actor.profileActionId, recoveryDayKey)
      : { sufficient: true, changed: false, abilities: [] };
    const actorReady = actorValidation.ready && abilityReservation.sufficient;
    const actorProblem = !abilityReservation.sufficient
      ? `${actor?.name || 'Die handelnde Figur'} hat keine Nutzung von ${abilityReservation.missing?.name || 'dieser Fähigkeit'} mehr übrig.`
      : (actor ? getCombatActorValidationMessage(actor, actorValidation) : '');
    const auraPaymentAvailable = actor ? canUseAuraPayment(actor.selectedAction, actor) : false;
    const paymentOptions = actor ? ['standard', ...(auraPaymentAvailable ? ['aura'] : [])].map(mode => {
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
    if (actor && paymentConfirmed && payment?.sufficient && abilityReservation.sufficient) {
      const previous = composerStates.get(actorId) || storedStates.get(actorId) || {};
      composerStates.set(actorId, {
        ...previous,
        resources: payment.after,
        ...(abilityReservation.changed ? { abilities: abilityReservation.abilities } : {})
      });
    }
    const targets = characters
      .filter(character => actionAllowsSelfTarget(actor) || String(character.id || '') !== actorId)
      .filter(character => !activeEncounterPartyMap.size || activeEncounterPartyMap.has(String(character.id || '')))
      .map(character => resolveActorProfile(character, {
        actorId: character.id,
        storedStates,
        recoveryDayKey
      }));
    const targetCharacter = characters.find(character => String(character.id || '') === String(segment.combatTargetId || '')) || null;
    const ruleOptions = buildCombatRuleOptions({
      characters,
      actorCharacter,
      actor,
      targetCharacter,
      segment,
      storedStates,
      recoveryDayKey
    });
    const card = context.list?.querySelector?.(`[data-segment-id="${CSS.escape(String(segment.id || ''))}"]`);
    mountCombatComposer({
      card,
      segment: { ...segment, kind: getEffectiveCombatSegmentKind(segment) },
      actor,
      targets,
      ruleOptions,
      actorReady,
      actorProblem,
      payment,
      paymentOptions,
      paymentConfirmed,
      auraPaymentAvailable
    });
  });
}

function updateSegmentSetting(segmentId, field, value) {
  const segment = latestComposerContext?.segments?.find(item => String(item.id || '') === String(segmentId || ''));
  if (!segment) return;
  if (field === 'targetId') segment.combatTargetId = String(value || '');
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
  if (field === 'rollMode') segment.combatRollMode = ['advantage', 'disadvantage'].includes(value) ? value : 'normal';
  if (field === 'weaponGrip') segment.combatWeaponGrip = String(value || '') === 'two-handed' ? 'two-handed' : 'one-handed';
  if (field === 'castLevel') {
    segment.combatCastLevel = Math.max(0, Math.min(10, Number(value) || 0));
    segment.combatPaymentConfirmed = false;
  }
  if (field === 'distanceMeters') segment.combatDistanceMeters = Math.max(0, Math.min(9999, Number(value) || 0));
  if (field === 'paymentMode') {
    segment.combatPaymentMode = ['aura', 'cheat'].includes(value) ? value : 'standard';
    segment.combatPaymentConfirmed = false;
  }
  globalThis.persistCommentDraft?.();
  if (field === 'actionId' || field === 'paymentMode' || field === 'weaponGrip') mountComposers(latestComposerContext || {});
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
  const normalizedMode = paymentMode === 'aura' ? 'aura' : 'standard';
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
        distanceMeters: 0,
        sourcePersistence: kind === 'scene-creature'
          ? { kind, sourceCreatureId: String(field.dataset.sourceCreatureId || '') }
          : { kind, recordId: String(field.dataset.recordId || '') }
      });
    }
    if (!checked && index >= 0) segment.combatRuleSelections.splice(index, 1);
  } else if (index >= 0) {
    segment.combatRuleSelections[index].distanceMeters = Math.max(0, Math.min(9999, Number(field.value) || 0));
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
    followUpAttacks: resolution.followUpAttacks || [],
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
    actorId,
    storedStates: stateContext.storedStates,
    workingStates: stateContext.workingStates,
    commentResourceResetActors: stateContext.commentResourceResetActors,
    resetCommentResources: true,
    segmentKind: getEffectiveCombatSegmentKind(segment),
    paymentMode: segment.combatPaymentMode,
    weaponGrip: segment.combatWeaponGrip,
    castLevel: segment.combatCastLevel,
    recoveryDayKey: stateContext.recoveryDayKey
  });
  if (!segment.combatPaymentConfirmed && !actor.cheats?.enabled) {
    const effectiveKind = getEffectiveCombatSegmentKind(segment);
    const actionLabel = effectiveKind === 'spell' ? 'Zauberformel' : (effectiveKind === 'prayer' ? 'Gebetsaktion' : (effectiveKind === 'song' ? 'Gesangsaktion' : 'Kampfhandlung'));
    throw new Error(`${actor.name} muss die Kosten dieser ${actionLabel} zuerst reservieren.`);
  }
  const actorValidation = profileResolver.validateActor(actor);
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
    relationship: getCombatRelationship(actorCharacter, targetCharacter),
    distanceMeters: Number(segment.combatDistanceMeters) || 0,
    ruleSources,
    rulePeriods: stateContext.rulePeriods,
    usedRuleFrequencyKeys: stateContext.usedRuleFrequencyKeys,
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
  const nextTargetState = getResolutionHitPointState(resolution);
  const nextTargetConditions = getResolutionTargetConditionState(resolution);
  const nextTargetResources = getResolutionTargetResourceState(resolution);
  const nextTargetConcentration = getResolutionTargetConcentrationState(resolution);
  const nextTargetChanneling = getResolutionTargetChannelingState(resolution);
  if (nextTargetState || nextTargetConditions || nextTargetResources || nextTargetConcentration !== undefined || nextTargetChanneling !== undefined) {
    const previous = stateContext.workingStates?.get(targetId) || stateContext.storedStates?.get(targetId) || {};
    stateContext.workingStates?.set(targetId, {
      ...previous,
      ...(nextTargetState || {}),
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
  const nextActorChanneling = getResolutionActorChannelingState(resolution);
  const nextActorConcentration = getResolutionActorConcentrationState(resolution);
  if (nextActorResources || nextActorInventory || nextActorHitPoints || nextActorConditions
    || (resolution.actionType !== 'channeling' && abilityUse.changed)
    || nextActorChanneling !== undefined || nextActorConcentration !== undefined) {
    const previous = stateContext.workingStates?.get(actorId) || stateContext.storedStates?.get(actorId) || {};
    stateContext.workingStates?.set(actorId, {
      ...previous,
      ...(nextActorResources ? { resources: nextActorResources } : {}),
      ...(nextActorInventory ? { inventory: nextActorInventory } : {}),
      ...(nextActorHitPoints || {}),
      ...(nextActorConditions ? { temporaryConditions: nextActorConditions } : {}),
      ...(resolution.actionType !== 'channeling' && abilityUse.changed ? { abilities: abilityUse.abilities } : {}),
      ...(nextActorChanneling !== undefined ? { channeling: nextActorChanneling } : {}),
      ...(nextActorConcentration !== undefined ? { concentration: nextActorConcentration } : {})
    });
  }
  (Array.isArray(resolution.ruleResourceSnapshots) ? resolution.ruleResourceSnapshots : []).forEach(snapshot => {
    const previous = stateContext.workingStates?.get(String(snapshot.sourceActorId)) || stateContext.storedStates?.get(String(snapshot.sourceActorId)) || {};
    stateContext.workingStates?.set(String(snapshot.sourceActorId), { ...previous, resources: snapshot.after });
  });
  stateContext.usedRuleFrequencyKeys = new Set(resolution.usedRuleFrequencyKeys || []);
  resolution.multiTargetIndex = Math.max(0, Number(resolutionOptions.targetIndex) || 0);
  resolution.multiTargetCount = Math.max(1, Number(resolutionOptions.targetCount) || 1);
  return resolution;
}

async function resolveCombatSegment(segment, characters, index, total, fallbackActorId = '', stateContext = {}) {
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
      { targetId: targetIds[targetIndex], targetIndex, targetCount: targetIds.length, primary: targetIndex === 0 }
    );
    resolutions.push(resolution);
    if (resolution.actionType === 'channeling') break;
  }
  return resolutions;
}

async function handleSubmission(submission = {}) {
  const segments = Array.isArray(submission.commentSegments) ? submission.commentSegments : [];
  const combatSegments = segments.filter(isCombatSegment);
  if (!combatSegments.length) return { handled: false, published: false };
  const cachedComments = globalThis.getCachedCommentsForThread?.(submission.threadId || '') || [];
  const characters = applyEncounterParties(
    mergeCombatActors(getCharacters(), latestComposerContext?.sceneActors || []),
    cachedComments
  );
  const stateContext = {
    storedStates: getStoredCombatStates(submission.threadId || ''),
    workingStates: new Map(),
    commentResourceResetActors: new Set(),
    recoveryDayKey: getCombatRecoveryDayKey(submission.threadId || ''),
    rulePeriods: {
      comment: `draft:${String(submission.threadId || '')}:${Date.now()}`,
      scene: String(submission.threadId || ''),
      day: getCombatRecoveryDayKey(submission.threadId || '')
    }
  };
  stateContext.usedRuleFrequencyKeys = deriveCombatRuleFrequencyKeys(
    cachedComments,
    stateContext.rulePeriods
  );

  activateResolutionDialog();
  try {
    const resolutionGroups = [];
    for (let index = 0; index < combatSegments.length; index += 1) {
      resolutionGroups.push(await resolveCombatSegment(
        combatSegments[index],
        characters,
        index,
        combatSegments.length,
        submission.characterId,
        stateContext
      ));
    }

    let resolutionIndex = 0;
    const enhancedSegments = segments.map(segment => {
      const { clientSegmentId, ...storedSegment } = segment;
      if (!isCombatSegment(storedSegment)) return storedSegment;
      const combatResolutions = resolutionGroups[resolutionIndex++] || [];
      const combatResolution = combatResolutions[0];
      return {
        ...storedSegment,
        mechanicMode: getCombatSegmentMode(storedSegment),
        combatAction: {
          schemaVersion: 4,
          actionType: 'attack',
          presentationKind: storedSegment.commentKind || storedSegment.kind,
          actorId: combatResolution.actorId,
          targetId: combatResolution.targetId,
          targetIds: combatResolutions.map(resolution => resolution.targetId),
          profileActionId: combatResolution.profileActionId || storedSegment.combatActionId || '',
          profileActionKind: combatResolution.profileActionKind || '',
          rollMode: combatResolution.attack.rollMode,
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
  if (trigger.dataset.combatControllerAction === 'confirm-payment') setSegmentPaymentConfirmation(segmentId, true);
  if (trigger.dataset.combatControllerAction === 'release-payment') setSegmentPaymentConfirmation(segmentId, false);
});

document.addEventListener('input', event => {
  const search = event.target?.closest?.('[data-combat-target-search]');
  if (!search) return;
  const select = search.closest('[data-combat-composer]')?.querySelector?.('[data-combat-input="targetId"], [data-combat-input="targetIds"]');
  if (!select) return;
  const query = String(search.value || '').trim().toLocaleLowerCase('de');
  [...select.options].forEach((option, index) => {
    option.hidden = index > 0 && !!query && !option.textContent.toLocaleLowerCase('de').includes(query);
  });
});

globalThis.AleriaCombat = Object.freeze({
  getProfile(characterId, options = {}) {
    const character = getCharacterById(characterId);
    if (!character) return null;
    const profile = profileResolver.resolve(character);
    const actorId = String(options.actorId || characterId || '');
    const state = getStoredCombatStates(options.threadId || '', options).get(actorId) || null;
    return overlayCombatHitPointState(profile, state);
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
  handleSubmission,
  narrateCommittedMechanics,
  renderEvaluation: renderCombatEvaluation
});
