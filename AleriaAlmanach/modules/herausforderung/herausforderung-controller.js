import { mountChallengeCheckPolicyEditor } from './herausforderung-check-policy-ui.js?v=20261016-check-policy-v1';
import { normalizeActionIconId } from '../comment-actions/comment-action-icons.js';
import { refreshActionIconPicker } from '../comment-actions/comment-action-icons-ui.js';
import { mountChallengeTargetEditor } from './herausforderung-target-ui.js?v=20261016-check-policy-v1';
import { normalizeChallengeTarget } from './herausforderung-target.js?v=20261016-check-policy-v1';
import { mountChallengeOutcomesEditor } from './herausforderung-outcomes-ui.js?v=20261015-check-options-v1';
import {
  collectHerausforderungApproaches,
  isHerausforderungComment,
  MAX_HERAUSFORDERUNG_APPROACHES,
  getHerausforderungValidationIssues,
  normalizeHerausforderungApproach,
  normalizeHerausforderungEvent
} from './herausforderung-model.js?v=20261113-scene-elements-v1';
import { collectHerausforderungProgress } from './herausforderung-progress.js?v=20261015-graded-challenges-v1';
import {
  ensureHerausforderungDialog,
  renderApproachRows,
  renderHerausforderungComment,
  setHerausforderungStatus,
  setHerausforderungSubmitting,
  updateHerausforderungDraft,
  showHerausforderungValidation
} from './herausforderung-ui.js?v=20261113-scene-elements-v1';
import { bindSkillIconTooltips } from '../skill-checks/skill-icon-view.js?v=20261016-check-policy-v1';
import { mountHerausforderungRewardEditor, refreshHerausforderungRewardTemplates } from './herausforderung-rewards-ui.js?v=20261104-startup-v1';
import { requestItemRegister } from '../item-register/item-register-demand.js?v=20261104-startup-v1';
import { createChallengeCombatContext, normalizeChallengeAudience, getChallengeCombatBindingError, challengeRequiresCombat } from './herausforderung-combat-context.js?v=20261015-check-options-v1';
import { mountChallengeAudience, refreshChallengeAudience } from './herausforderung-audience-ui.js';
import { resolveCombatProfile } from '../combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../combat/combat-state-model.js';
import { getActiveCombatEncounter } from '../combat/combat-encounter-model.js';
import { mountHerausforderungExchange } from './herausforderung-exchange-ui.js?v=20261113-scene-elements-v1';
import { createHerausforderungAttemptPicker } from './herausforderung-attempt-dialog.js?v=20261016-check-policy-v1';
import { bindChallengeSceneImageEvents, readChallengeSceneImage, setChallengeSceneImage } from './herausforderung-scene-image-ui.js';
import { createSceneElementAuthoringEditor } from '../scene-elements/scene-element-authoring-ui.js';
import { SCENE_ELEMENT_TYPES } from '../scene-elements/scene-element-model.js';
import { createSceneElementsController } from '../scene-elements/scene-elements-controller.js';
import { createSceneElementAiScene } from '../scene-elements/scene-element-ai-guide.js';
import { collectSceneElementParticipants } from '../scene-elements/scene-element-conditions.js';

bindSkillIconTooltips(document);
bindChallengeSceneImageEvents(document);

let editingComment = null;
let activeThreadId = '';
let draftApproaches = [];
let submitting = false;
let renderProgress = new Map();
let operationId = '';
let submittedDraft = '';
let draftTargetActor = normalizeChallengeTarget();
let draftAudience = normalizeChallengeAudience();
let draftCombatBound = false;
let dialogCombatContext = { encounterId: '', participants: [] };
let renderEncounter = null;
let authoringEditor = null;
let preparedElementId = '';
const attemptPicker = createHerausforderungAttemptPicker();
const sceneElements = createSceneElementsController({
  renderChallenge: comment => renderHerausforderungComment(comment, 0, { progress: renderProgress, encounter: renderEncounter,
    actors: globalThis.getAvailableCommentCharacters?.() || [] })
});

function ensureElementEditor(root) {
  if (authoringEditor) return authoringEditor;
  authoringEditor = createSceneElementAuthoringEditor(root, {
    getActors: () => globalThis.getAvailableCommentCharacters?.() || [],
    getSources: () => (globalThis.getCachedCommentsForThread?.(activeThreadId) || []).flatMap(comment =>
      ['item', 'puzzle'].includes(comment.herausforderung?.elementType) ? [{ id: comment.id, title: comment.herausforderung.title }]
        : comment.sceneElementSignal?.visible
          ? [{ id: comment.sceneElementSignal.id, title: comment.sceneElementSignal.title }] : []),
    onChange({ typeChanged, elementType }) {
      if (typeChanged) {
        const title = root.querySelector('[data-herausforderung-field="title"]');
        if (SCENE_ELEMENT_TYPES.some(type => type.label === title.value)) title.value = SCENE_ELEMENT_TYPES.find(type => type.id === elementType).label;
      }
      updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] });
    }
  });
  return authoringEditor;
}

function defaultApproaches() {
  return [normalizeHerausforderungApproach({}, 0)];
}

function renderDialog(activeIndex = 0) {
  mountChallengeAudience(document.getElementById('herausforderung-overlay'), { audience: draftAudience,
    getActors: () => globalThis.getAvailableCommentCharacters?.() || [], combatContext: dialogCombatContext,
    getCombatRequired: () => challengeRequiresCombat(draftApproaches),
    getCombatBound: () => draftCombatBound || challengeRequiresCombat(draftApproaches), onChange: value => { if (typeof value === 'boolean') draftCombatBound = value; updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] }); } });
  renderApproachRows(draftApproaches, activeIndex);
  mountChallengeCheckPolicyEditor(document.getElementById('herausforderung-overlay'), { approaches: draftApproaches, onChange: () => updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] }) });
  mountChallengeTargetEditor(document.getElementById('herausforderung-overlay'), { actors: globalThis.getAvailableCommentCharacters?.() || [], getTarget: () => draftTargetActor, setTarget: target => { draftTargetActor = target; updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] }); } });
  mountChallengeOutcomesEditor(document.getElementById('herausforderung-overlay'), { approaches: draftApproaches, onChange: () => updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] }) });
  mountHerausforderungRewardEditor(document.getElementById('herausforderung-overlay'), { approaches: draftApproaches,
    getCombatContext: () => dialogCombatContext, onChange: () => { refreshChallengeAudience(document.getElementById('herausforderung-overlay')); updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] }); } });
  mountHerausforderungExchange(document.getElementById('herausforderung-overlay'), { getDraft: buildDraft, getCombatContext: () => dialogCombatContext, onStatus: setHerausforderungStatus, onImport: importDraft });
  updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] });
}

function importDraft(event, issues) {
  if (submitting || !activeThreadId) return;
  const root = document.getElementById('herausforderung-overlay');
  root.querySelector('[data-herausforderung-field="title"]').value = event.title;
  root.querySelector('[data-herausforderung-field="publicDescription"]').value = event.publicDescription;
  setChallengeSceneImage(root, event.sceneImage);
  draftApproaches = event.approaches;
  draftAudience = normalizeChallengeAudience(event.audience);
  draftTargetActor = normalizeChallengeTarget(event.targetActor);
  draftCombatBound = event.combatBound;
  ensureElementEditor(root).set(event, { prepared: !!preparedElementId });
  operationId = crypto.randomUUID();
  submittedDraft = '';
  renderDialog();
  showHerausforderungValidation(issues);
  setHerausforderungStatus(issues.length ? `Entwurf importiert. ${issues.length} Pflichtangaben bitte ergänzen.` : 'Entwurf importiert. Situation, Lösungswege und Belohnungen prüfen; danach ausdrücklich veröffentlichen.');
}

function openDialog(comment = null, { phase, elementType = 'challenge' } = {}) {
  if (submitting) return;
  const thread = globalThis.getCurrentCommentThread?.();
  if (!thread || thread.kind !== 'session') {
    globalThis.showAppStatus?.('Herausforderungen sind nur in interaktiven Szenen verfügbar.', 'error');
    return;
  }
  activeThreadId = String(globalThis.getCurrentCommentThreadId?.() || '');
  if (!activeThreadId) return;
  editingComment = comment?.herausforderung ? comment : null;
  preparedElementId = editingComment?._sceneElementId || '';
  draftApproaches = defaultApproaches();
  draftAudience = normalizeChallengeAudience();
  draftTargetActor = normalizeChallengeTarget();
  const comments = globalThis.getCachedCommentsForThread?.(activeThreadId) || [];
  const states = deriveCombatStateFromComments(comments);
  const profiles = (globalThis.getAvailableCommentCharacters?.() || []).map(actor => overlayCombatHitPointState(resolveCombatProfile(actor), states.get(actor.id)));
  dialogCombatContext = { ...createChallengeCombatContext(comments, profiles, { encounterId: editingComment?.herausforderung?.combatBound ? editingComment.herausforderung.combatContext?.encounterId : '' }), actors: (globalThis.getAvailableCommentCharacters?.() || []).map(actor => ({ actorId: actor.id, name: actor.name, persistence: resolveCombatProfile(actor).persistence })) };
  dialogCombatContext.scene = createSceneElementAiScene(thread, comments);
  dialogCombatContext.participantIds = collectSceneElementParticipants(comments).map(actor => actor.actorId);
  draftCombatBound = !!dialogCombatContext.encounterId;
  operationId = crypto.randomUUID();
  submittedDraft = '';
  const root = ensureHerausforderungDialog();
  ensureElementEditor(root).set(editingComment?.herausforderung || (phase ? { elementType, activation: { enabled: true, phase } } : {}), { prepared: !!preparedElementId });
  const registerOperationId = operationId;
  requestItemRegister().then(() => {
    if (activeThreadId && operationId === registerOperationId && !submitting) refreshHerausforderungRewardTemplates(root);
  }).catch(error => {
    if (activeThreadId && operationId === registerOperationId && !submitting) setHerausforderungStatus(error.message, 'error');
  });
  const title = root.querySelector('[data-herausforderung-field="title"]');
  const description = root.querySelector('[data-herausforderung-field="publicDescription"]');
  if (title) title.value = SCENE_ELEMENT_TYPES.find(type => type.id === elementType)?.label || 'Herausforderung';
  if (description) description.value = '';
  setChallengeSceneImage(root, null);
  root.dataset.editing = editingComment ? 'true' : 'false';
  root.querySelector('#herausforderung-dialog-title').textContent = editingComment ? 'Herausforderung bearbeiten' : 'Eine Herausforderung gestalten';
  root.querySelector('[data-herausforderung-submit-label]').textContent = editingComment ? 'Änderungen speichern' : 'Veröffentlichen';
  if (editingComment) {
    const event = normalizeHerausforderungEvent(editingComment.herausforderung);
    title.value = event.title; description.value = event.publicDescription;
    setChallengeSceneImage(root, event.sceneImage);
    draftApproaches = event.approaches; draftAudience = event.audience; draftCombatBound = event.combatBound;
    draftTargetActor = event.targetActor;
  }
  renderDialog();
  setHerausforderungStatus(editingComment ? 'Änderungen gelten für neue Versuche. Bisherige Würfe und Folgen bleiben erhalten.' : 'Öffentliche Beschreibung sowie mindestens einen Ansatz mit Probe, Schwierigkeit und verdeckter Erkenntnis ausfüllen.');
  globalThis.activateDialog?.('herausforderung-overlay', { initialFocus: '[data-herausforderung-field="title"]' });
}

function closeDialog() {
  if (submitting) return;
  globalThis.deactivateDialog?.('herausforderung-overlay');
  activeThreadId = '';
  editingComment = null;
  preparedElementId = '';
  draftApproaches = [];
  operationId = '';
  submittedDraft = '';
}

function addApproach() {
  if (draftApproaches.length >= MAX_HERAUSFORDERUNG_APPROACHES) return;
  draftApproaches.push(normalizeHerausforderungApproach({}, draftApproaches.length));
  renderDialog(draftApproaches.length - 1);
  document.querySelector('#herausforderung-overlay [open] input')?.focus();
}

function removeApproach(index) {
  if (draftApproaches.length <= 1 || !Number.isInteger(index) || index < 0 || index >= draftApproaches.length) return;
  draftApproaches.splice(index, 1);
  renderDialog(Math.max(0, index - 1));
}

function updateApproachField(index, field, value) {
  const approach = draftApproaches[index];
  if (!approach) return;
  if (field === 'label') approach.label = String(value || '');
  if (field === 'difficulty') approach.difficulty = value;
  if (field === 'insight') approach.insight = String(value || '');
  if (field === 'partialHint') approach.partialHint = String(value || '');
  if (field === 'failureConsequence') approach.failureConsequence = String(value || '');
}

function togglePreferredSkill(index, skillId, checked) {
  const approach = draftApproaches[index];
  if (!approach) return;
  const preferred = new Set(approach.preferredSkills);
  if (checked) preferred.add(skillId);
  else preferred.delete(skillId);
  approach.preferredSkills = [...preferred];
  approach.checkPenalties = (approach.checkPenalties || []).filter(entry => preferred.has(entry.checkId));
}

function buildDraft() {
  const root = document.getElementById('herausforderung-overlay');
  const element = authoringEditor?.read() || { elementType: 'challenge' };
  const narrative = element.elementType === 'narration';
  return {
    ...element,
    ...(editingComment?.herausforderung?.reaction ? { reaction: editingComment.herausforderung.reaction } : {}),
    title: root?.querySelector('[data-herausforderung-field="title"]')?.value || 'Herausforderung',
    publicDescription: root?.querySelector('[data-herausforderung-field="publicDescription"]')?.value || '',
    sceneImage: readChallengeSceneImage(root),
    targetActor: narrative ? { mode: 'none' } : draftTargetActor,
    audience: narrative ? { mode: 'all', actorIds: [] } : draftAudience,
    combatBound: !narrative && (draftCombatBound || draftAudience.mode === 'combatants' || challengeRequiresCombat(draftApproaches)),
    approaches: narrative ? [] : draftApproaches
  };
}

async function submitEvent() {
  if (submitting || !activeThreadId) return;
  if (String(globalThis.getCurrentCommentThreadId?.() || '') !== activeThreadId) {
    setHerausforderungStatus('Die Szene wurde gewechselt. Öffne die Vorbereitung in der gewünschten Szene erneut.', 'error');
    return;
  }
  const draft = buildDraft();
  if (draft.combatBound && !dialogCombatContext.encounterId) {
    setHerausforderungStatus('Für diese Zielgruppe oder Wirkung ist ein aktiver Kampf erforderlich.', 'error');
    return;
  }
  const issues = getHerausforderungValidationIssues(draft);
  showHerausforderungValidation(issues);
  if (issues.length) {
    setHerausforderungStatus(issues[0].message, 'error');
    return;
  }
  const event = normalizeHerausforderungEvent(draft);
  const fingerprint = JSON.stringify(event);
  if (submittedDraft && submittedDraft !== fingerprint) operationId = crypto.randomUUID();
  submittedDraft = fingerprint;
  const threadId = activeThreadId;
  submitting = true;
  let published = false;
  setHerausforderungSubmitting(true);
  try {
    const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
    if (!backend?.addHerausforderung) throw new Error('Der Online-Speicher unterstützt Herausforderungen noch nicht.');
    await backend.addHerausforderung(threadId, `Herausforderung: ${event.title}`, '7777', {
      commentMode: 'herausforderung',
      commentKind: 'herausforderung-event',
      herausforderung: event,
      operationId,
      ...(preparedElementId ? { sceneElementId: preparedElementId, expectedRevision: editingComment.herausforderungRevision || 0 }
        : editingComment ? { commentId: editingComment.id, expectedRevision: editingComment.herausforderungRevision || 0 } : {}),
      orderKey: globalThis.getNextCommentOrderKey?.(threadId, null) ?? Date.now()
    });
    published = true;
  } catch (error) {
    console.error('herausforderung submit failed:', error);
    setHerausforderungStatus(error?.message || 'Die Herausforderung konnte nicht gespeichert werden.', 'error');
  } finally {
    submitting = false;
    setHerausforderungSubmitting(false);
  }
  if (!published) return;
  const edited = !!editingComment;
  closeDialog();
  globalThis.showAppStatus?.(edited ? 'Die Änderungen wurden gespeichert.' : event.activation.phase
    ? `Der Eintrag ist für Phase ${event.activation.phase} vorbereitet.` : 'Die Herausforderung wurde veröffentlicht.', 'success');
  try {
    await globalThis.loadCommentsIntoPage?.(threadId, true, edited ? {} : { page: 'last' });
  } catch (error) {
    console.error('herausforderung refresh failed:', error);
    globalThis.showAppStatus?.('Die Herausforderung ist gespeichert. Bitte die Szene neu laden, um sie anzuzeigen.', 'error');
  }
}

function getAvailableAttemptTarget(request) {
  const threadId = globalThis.getCurrentCommentThreadId?.() || '';
  if (threadId !== request.threadId) {
    globalThis.showAppStatus?.('Die Szene wurde gewechselt. Wähle den Lösungsweg in der aktuellen Szene.', 'error');
    return null;
  }
  const comments = globalThis.getCachedCommentsForThread?.(threadId) || [];
  const target = collectHerausforderungApproaches(comments).find(approach => approach.commentId === request.commentId && approach.approachId === request.approachId);
  const expired = target && getChallengeCombatBindingError(target, getActiveCombatEncounter(comments));
  if (expired) { globalThis.showAppStatus?.(expired, 'error'); return null; }
  const progress = target && collectHerausforderungProgress(comments).get(target.id);
  if (!target || progress?.solved || (target.attemptLimit && progress?.attempts >= target.attemptLimit)) {
    globalThis.showAppStatus?.('Dieser Ansatz ist nicht mehr verfügbar.', 'error');
    return null;
  }
  return target;
}

function attemptApproach(trigger) {
  const request = { threadId: globalThis.getCurrentCommentThreadId?.() || '',
    commentId: trigger.dataset.commentId, approachId: trigger.dataset.approachId };
  const target = getAvailableAttemptTarget(request);
  if (!target) return;
  sceneElements.close();
  const opened = attemptPicker.open(target, skillId => {
    const latest = getAvailableAttemptTarget(request);
    if (!latest) return;
    if (!globalThis.AleriaSkillChecks?.getChallengeAttemptSettings(latest, skillId)) {
      globalThis.showAppStatus?.('Diese Fertigkeit ist für den Lösungsweg nicht mehr verfügbar.', 'error');
      return;
    }
    globalThis.openCommentFormForSkillChallenge?.(latest, skillId);
  });
  if (!opened) globalThis.showAppStatus?.('Für diesen Lösungsweg ist keine passende Fertigkeit verfügbar.', 'error');
}

document.addEventListener('click', event => {
  const iconChoice = event.target?.closest?.('#herausforderung-overlay [data-herausforderung-action-icon]');
  if (iconChoice && !submitting) {
    const index = Number(iconChoice.closest('[data-herausforderung-approach-row]')?.dataset.approachIndex);
    const approach = draftApproaches[index];
    if (approach) {
      approach.actionIconId = normalizeActionIconId(iconChoice.dataset.herausforderungActionIcon);
      refreshActionIconPicker(iconChoice.closest('[data-comment-action-picker]'), approach, { fieldAttribute: 'data-herausforderung-action-icon' });
      updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] });
    }
    return;
  }
  const trigger = event.target?.closest?.('[data-herausforderung-action]');
  if (!trigger) return;
  const action = trigger.dataset.herausforderungAction;
  if (submitting) return;
  if (action === 'open') openDialog();
  if (action === 'edit') {
    sceneElements.close();
    const comments = globalThis.getCachedCommentsForThread?.(globalThis.getCurrentCommentThreadId?.() || '') || [];
    const comment = comments.find(comment => comment.id === trigger.dataset.commentId && isHerausforderungComment(comment));
    if (comment) openDialog(comment);
    else globalThis.showAppStatus?.('Die Herausforderung ist nicht mehr verfügbar. Bitte die Szene neu laden.', 'error');
  }
  if (action === 'close') closeDialog();
  if (action === 'clear-image') {
    setChallengeSceneImage(document.getElementById('herausforderung-overlay'), null);
    updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] });
  }
  if (action === 'add-approach') addApproach();
  if (action === 'remove-approach') removeApproach(Number(trigger.dataset.approachIndex));
  if (action === 'submit') void submitEvent();
  if (action === 'attempt') attemptApproach(trigger);
  if (action === 'set-difficulty') {
    const index = Number(trigger.dataset.approachIndex);
    updateApproachField(index, 'difficulty', Number(trigger.dataset.value));
    const input = trigger.closest('[data-herausforderung-approach-row]')?.querySelector('[data-herausforderung-field="difficulty"]');
    if (input) input.value = trigger.dataset.value;
    updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] });
  }
});

document.addEventListener('change', event => {
  const field = event.target;
  if (!field?.closest?.('#herausforderung-overlay')) return;
  const index = Number(field.dataset.herausforderungApproachIndex);
  if (!Number.isInteger(index)) return;
  if (field.dataset.herausforderungField === 'preferredSkill') {
    togglePreferredSkill(index, field.dataset.skillId, field.checked);
    updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] });
    return;
  }
  if (field.dataset.herausforderungField) updateApproachField(index, field.dataset.herausforderungField, field.value);
  updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] });
});

document.addEventListener('input', event => {
  const field = event.target;
  if (!field?.closest?.('#herausforderung-overlay')) return;
  const index = Number(field.dataset.herausforderungApproachIndex);
  if (!field.dataset.herausforderungField || field.dataset.herausforderungField === 'preferredSkill') return;
  if (Number.isInteger(index)) updateApproachField(index, field.dataset.herausforderungField, field.value);
  field.removeAttribute('aria-invalid');
  updateHerausforderungDraft(buildDraft(), { actors: globalThis.getAvailableCommentCharacters?.() || [] });
});

document.addEventListener('keydown', event => {
  if (event.defaultPrevented) return;
  if (!event.target?.closest?.('#herausforderung-overlay')) return;
  if (event.key !== 'Escape' && !(event.key === 'Enter' && (event.ctrlKey || event.metaKey))) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.key === 'Escape') closeDialog();
  else void submitEvent();
}, true);

globalThis.AleriaHerausforderung = Object.freeze({
  open: openDialog,
  openForPhase: (phase, elementType) => openDialog(null, { phase, elementType }),
  openPrepared: ({ id, event, revision }) => openDialog({ id: 'signal-' + id, herausforderung: event, herausforderungRevision: revision, _sceneElementId: id }),
  setRenderContext(comments = []) { renderProgress = collectHerausforderungProgress(comments); renderEncounter = getActiveCombatEncounter(comments); },
  isComment: comment => isHerausforderungComment(comment),
  renderComment: (comment, index) => {
    try {
      return renderHerausforderungComment(comment, index, { progress: renderProgress, encounter: renderEncounter, actors: globalThis.getAvailableCommentCharacters?.() || [] });
    } catch (error) {
      console.error('herausforderung render failed:', error);
      return '';
    }
  },
  collectApproaches: comments => {
    try {
      return collectHerausforderungApproaches(comments);
    } catch (error) {
      console.error('herausforderung collect approaches failed:', error);
      return [];
    }
  }
});
