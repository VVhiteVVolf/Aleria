import { CombatDiceAdapter } from './combat-dice-adapter.js?v=20260802-dice-audio-v2';
import { narrateCombatResolution } from './combat-narration-service.js?v=20260802-combat-feedback-v3';
import { CombatProfileResolver } from './combat-profile-resolver.js?v=20260803-action-economy-v2';
import { CombatResolutionService } from './combat-resolution-service.js?v=20260803-action-economy-v2';
import {
  applyCombatResourceCosts,
  deriveCombatStateFromComments,
  getResolutionActorResourceState,
  getResolutionHitPointState,
  overlayCombatHitPointState
} from './combat-state-model.js?v=20260803-scene-rest-v1';
import {
  canUseAuraPayment,
  getActionPaymentCosts,
  recoverDailyCombatResources,
  resetCommentScopedResources
} from './combat-action-economy.js?v=20260803-action-economy-v2';
import {
  ensureCombatResolutionDialog,
  mountCombatComposer,
  renderCombatEvaluation,
  setCombatResolutionStatus
} from './ui/combat-ui.js?v=20260803-action-economy-v2';

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
  const date = typeof globalThis.getSceneTimeSegmentAleriaDate === 'function'
    ? globalThis.getSceneTimeSegmentAleriaDate(day)
    : null;
  return date?.year && date?.month && date?.day
    ? `aleria:${date.year}-${date.month}-${date.day}`
    : `scene:${String(threadId || 'unknown')}:day-${day}`;
}

function resolveActorProfile(character, options = {}) {
  const profile = profileResolver.resolve(character, {
    actionId: options.actionId,
    segmentKind: options.segmentKind,
    paymentMode: options.paymentMode
  });
  const actorId = String(options.actorId || profile.characterId || '');
  const state = options.workingStates?.get(actorId) || options.storedStates?.get(actorId) || null;
  const shouldResetCommentResources = options.resetCommentResources && !options.workingStates?.has(actorId);
  let effectiveResources = state?.resources || profile.resources;
  if (shouldResetCommentResources) effectiveResources = resetCommentScopedResources(effectiveResources);
  effectiveResources = recoverDailyCombatResources(effectiveResources, options.recoveryDayKey);
  const effectiveState = state || shouldResetCommentResources || options.recoveryDayKey
    ? { ...(state || {}), resources: effectiveResources }
    : null;
  return overlayCombatHitPointState(profile, effectiveState);
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
  const characters = mergeCombatActors(getCharacters(), context.sceneActors || []);
  const storedStates = getStoredCombatStates(context.threadId || '');
  const recoveryDayKey = getCombatRecoveryDayKey(context.threadId || '');
  const composerStates = new Map();

  (context.segments || []).forEach(segment => {
    if (!isCombatSegment(segment)) return;
    const actorId = String(segment.actorId || context.selectedCharacterId || '');
    const actorCharacter = characters.find(character => String(character.id || '') === actorId) || null;
    const actor = actorCharacter ? resolveActorProfile(actorCharacter, {
      actionId: segment.combatActionId,
      actorId,
      storedStates,
      workingStates: composerStates,
      resetCommentResources: true,
      segmentKind: getEffectiveCombatSegmentKind(segment),
      paymentMode: segment.combatPaymentMode,
      recoveryDayKey
    }) : null;
    const actorReady = actor ? profileResolver.validateActor(actor).ready : false;
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
    if (actor && paymentConfirmed && payment?.sufficient) {
      const previous = composerStates.get(actorId) || storedStates.get(actorId) || {};
      composerStates.set(actorId, { ...previous, resources: payment.after });
    }
    const targets = characters
      .filter(character => String(character.id || '') !== actorId)
      .map(character => resolveActorProfile(character, {
        actorId: character.id,
        storedStates,
        recoveryDayKey
      }));
    const card = context.list?.querySelector?.(`[data-segment-id="${CSS.escape(String(segment.id || ''))}"]`);
    mountCombatComposer({
      card,
      segment: { ...segment, kind: getEffectiveCombatSegmentKind(segment) },
      actor,
      targets,
      actorReady,
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
  if (field === 'actionId') {
    segment.combatActionId = String(value || '');
    segment.combatPaymentConfirmed = false;
  }
  if (field === 'rollMode') segment.combatRollMode = ['advantage', 'disadvantage'].includes(value) ? value : 'normal';
  if (field === 'paymentMode') {
    segment.combatPaymentMode = ['aura', 'cheat'].includes(value) ? value : 'standard';
    segment.combatPaymentConfirmed = false;
  }
  globalThis.persistCommentDraft?.();
  if (field === 'actionId' || field === 'paymentMode') mountComposers(latestComposerContext || {});
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
    originalDescription: resolution.originalDescription,
    actorCombatProfile: resolution.actorCombatProfile,
    targetCombatProfile: resolution.targetCombatProfile
  };
}

async function resolveCombatSegment(segment, characters, index, total, fallbackActorId = '', stateContext = {}) {
  const actorId = String(segment.sceneActorId || segment.actorId || segment.characterId || fallbackActorId || '');
  const actorCharacter = characters.find(character => String(character.id || '') === actorId);
  if (!actorCharacter) throw new Error('Die handelnde Figur dieser Kampfbeschreibung ist nicht mehr verfügbar.');
  const actor = resolveActorProfile(actorCharacter, {
    actionId: segment.combatActionId,
    actorId,
    storedStates: stateContext.storedStates,
    workingStates: stateContext.workingStates,
    resetCommentResources: true,
    segmentKind: getEffectiveCombatSegmentKind(segment),
    paymentMode: segment.combatPaymentMode,
    recoveryDayKey: stateContext.recoveryDayKey
  });
  if (!segment.combatPaymentConfirmed && !actor.cheats?.enabled) {
    const effectiveKind = getEffectiveCombatSegmentKind(segment);
    const actionLabel = effectiveKind === 'spell' ? 'Zauberformel' : (effectiveKind === 'prayer' ? 'Gebetsaktion' : (effectiveKind === 'song' ? 'Gesangsaktion' : 'Kampfhandlung'));
    throw new Error(`${actor.name} muss die Kosten dieser ${actionLabel} zuerst reservieren.`);
  }
  if (!profileResolver.validateActor(actor).ready) {
    throw new Error(`Ergänze für ${actor.name} zuerst einen Angriff mit Schadenswurf auf dem Profilbogen.`);
  }
  const targetId = String(segment.combatTargetId || '');
  if (!targetId) throw new Error('Wähle für jede Kampfbeschreibung ein Ziel.');
  const targetCharacter = characters.find(character => String(character.id || '') === targetId);
  if (!targetCharacter) throw new Error('Das gewählte Kampfziel ist nicht mehr verfügbar.');
  const target = resolveActorProfile(targetCharacter, {
    actorId: targetId,
    storedStates: stateContext.storedStates,
    workingStates: stateContext.workingStates,
    recoveryDayKey: stateContext.recoveryDayKey
  });
  const stage = document.getElementById('combat-dice-stage');
  if (stage) stage.innerHTML = '';
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
    onPhase: phase => setCombatResolutionStatus(
      phase.phase === 'damage'
        ? 'Treffer – Schaden wird gewürfelt …'
        : (phase.phase === 'saving-throw' ? 'Das Ziel würfelt seinen Rettungswurf …' : 'Angriffswurf …'),
      phase.notation
    )
  });
  setCombatResolutionStatus('Erzählerische Folge wird formuliert …', `${resolution.actorName} gegen ${resolution.targetName}`);
  resolution.narration = await narrateCombatResolution(buildNarrationFacts(resolution));
  const nextTargetState = getResolutionHitPointState(resolution);
  if (nextTargetState) {
    const previous = stateContext.workingStates?.get(targetId) || stateContext.storedStates?.get(targetId) || {};
    stateContext.workingStates?.set(targetId, { ...previous, ...nextTargetState });
  }
  const nextActorResources = getResolutionActorResourceState(resolution);
  if (nextActorResources) {
    const previous = stateContext.workingStates?.get(actorId) || stateContext.storedStates?.get(actorId) || {};
    stateContext.workingStates?.set(actorId, { ...previous, resources: nextActorResources });
  }
  return resolution;
}

async function handleSubmission(submission = {}) {
  const segments = Array.isArray(submission.commentSegments) ? submission.commentSegments : [];
  const combatSegments = segments.filter(isCombatSegment);
  if (!combatSegments.length) return { handled: false, published: false };
  const characters = mergeCombatActors(getCharacters(), latestComposerContext?.sceneActors || []);
  const stateContext = {
    storedStates: getStoredCombatStates(submission.threadId || ''),
    workingStates: new Map(),
    recoveryDayKey: getCombatRecoveryDayKey(submission.threadId || '')
  };

  activateResolutionDialog();
  try {
    const resolutions = [];
    for (let index = 0; index < combatSegments.length; index += 1) {
      resolutions.push(await resolveCombatSegment(
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
      const combatResolution = resolutions[resolutionIndex++];
      return {
        ...storedSegment,
        mechanicMode: getCombatSegmentMode(storedSegment),
        combatAction: {
          schemaVersion: 4,
          actionType: 'attack',
          presentationKind: storedSegment.commentKind || storedSegment.kind,
          actorId: combatResolution.actorId,
          targetId: combatResolution.targetId,
          profileActionId: combatResolution.profileActionId || storedSegment.combatActionId || '',
          profileActionKind: combatResolution.profileActionKind || '',
          rollMode: combatResolution.attack.rollMode,
          paymentMode: storedSegment.combatPaymentMode || 'standard',
          resourceCosts: combatResolution.resourceCosts || [],
          originalDescription: storedSegment.text
        },
        combatResolution
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
        combatResolution: combatSegments.length === 1 ? resolutions[0] : null
      }
    };
  } catch (error) {
    closeResolutionDialog();
    throw error;
  }
}

document.addEventListener('change', event => {
  const field = event.target?.closest?.('[data-combat-input]');
  if (!field) return;
  const composer = field.closest('[data-combat-composer]');
  updateSegmentSetting(composer?.dataset.combatSegmentId, field.dataset.combatInput, field.value);
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
  const select = search.closest('[data-combat-composer]')?.querySelector?.('[data-combat-input="targetId"]');
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
  renderEvaluation: renderCombatEvaluation
});
