import {
  collectHerausforderungApproaches,
  isHerausforderungComment,
  MAX_HERAUSFORDERUNG_APPROACHES,
  getHerausforderungValidationIssues,
  normalizeHerausforderungApproach,
  normalizeHerausforderungEvent
} from './herausforderung-model.js?v=20261014-herausforderung-rewards-v2';
import { collectHerausforderungProgress } from './herausforderung-progress.js?v=20261014-herausforderung-rewards-v2';
import {
  ensureHerausforderungDialog,
  renderApproachRows,
  renderHerausforderungComment,
  setHerausforderungStatus,
  setHerausforderungSubmitting,
  updateHerausforderungDraft,
  showHerausforderungValidation
} from './herausforderung-ui.js?v=20261014-herausforderung-rewards-v2';
import { mountHerausforderungRewardEditor } from './herausforderung-rewards-ui.js?v=20261014-herausforderung-rewards-v2';
import { mountHerausforderungExchange } from './herausforderung-exchange-ui.js?v=20261014-herausforderung-rewards-v2';

let activeThreadId = '';
let draftApproaches = [];
let submitting = false;
let renderProgress = new Map();
let operationId = '';
let submittedDraft = '';

function defaultApproaches() {
  return [normalizeHerausforderungApproach({}, 0)];
}

function renderDialog(activeIndex = 0) {
  renderApproachRows(draftApproaches, activeIndex);
  mountHerausforderungRewardEditor(document.getElementById('herausforderung-overlay'), { approaches: draftApproaches,
    onChange: () => updateHerausforderungDraft(buildDraft()) });
  mountHerausforderungExchange(document.getElementById('herausforderung-overlay'), { getDraft: buildDraft, onStatus: setHerausforderungStatus, onImport: importDraft });
  updateHerausforderungDraft(buildDraft());
}

function importDraft(event, issues) {
  if (submitting || !activeThreadId) return;
  const root = document.getElementById('herausforderung-overlay');
  root.querySelector('[data-herausforderung-field="title"]').value = event.title;
  root.querySelector('[data-herausforderung-field="publicDescription"]').value = event.publicDescription;
  draftApproaches = event.approaches;
  operationId = crypto.randomUUID();
  submittedDraft = '';
  renderDialog();
  showHerausforderungValidation(issues);
  setHerausforderungStatus(issues.length ? `Entwurf importiert. ${issues.length} Pflichtangaben bitte ergänzen.` : 'Entwurf importiert. Situation, Lösungswege und Belohnungen prüfen; danach ausdrücklich veröffentlichen.');
}

function openDialog() {
  if (submitting) return;
  const thread = globalThis.getCurrentCommentThread?.();
  if (!thread || thread.kind !== 'session') {
    globalThis.showAppStatus?.('Herausforderungen sind nur in interaktiven Szenen verfügbar.', 'error');
    return;
  }
  activeThreadId = String(globalThis.getCurrentCommentThreadId?.() || '');
  if (!activeThreadId) return;
  draftApproaches = defaultApproaches();
  operationId = crypto.randomUUID();
  submittedDraft = '';
  const root = ensureHerausforderungDialog();
  globalThis.AleriaItemRegister?.ensure?.();
  const title = root.querySelector('[data-herausforderung-field="title"]');
  const description = root.querySelector('[data-herausforderung-field="publicDescription"]');
  if (title) title.value = 'Herausforderung';
  if (description) description.value = '';
  renderDialog();
  setHerausforderungStatus('Öffentliche Beschreibung sowie mindestens einen Ansatz mit Fertigkeit, Schwierigkeit und verdeckter Erkenntnis ausfüllen.');
  globalThis.activateDialog?.('herausforderung-overlay', { initialFocus: '[data-herausforderung-field="title"]' });
}

function closeDialog() {
  if (submitting) return;
  globalThis.deactivateDialog?.('herausforderung-overlay');
  activeThreadId = '';
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
}

function buildDraft() {
  const root = document.getElementById('herausforderung-overlay');
  return {
    title: root?.querySelector('[data-herausforderung-field="title"]')?.value || 'Herausforderung',
    publicDescription: root?.querySelector('[data-herausforderung-field="publicDescription"]')?.value || '',
    approaches: draftApproaches
  };
}

async function submitEvent() {
  if (submitting || !activeThreadId) return;
  const draft = buildDraft();
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
  closeDialog();
  globalThis.showAppStatus?.('Die Herausforderung wurde veröffentlicht.', 'success');
  try {
    await globalThis.loadCommentsIntoPage?.(threadId, true, { page: 'last' });
  } catch (error) {
    console.error('herausforderung refresh failed:', error);
    globalThis.showAppStatus?.('Die Herausforderung ist gespeichert. Bitte die Szene neu laden, um sie anzuzeigen.', 'error');
  }
}

function attemptApproach(trigger) {
  const threadId = globalThis.getCurrentCommentThreadId?.() || '';
  const comments = globalThis.getCachedCommentsForThread?.(threadId) || [];
  const target = collectHerausforderungApproaches(comments).find(approach => approach.commentId === trigger.dataset.commentId && approach.approachId === trigger.dataset.approachId);
  if (!target || collectHerausforderungProgress(comments).get(target.id)?.solved) {
    globalThis.showAppStatus?.('Dieser Ansatz ist nicht mehr verfügbar.', 'error');
    return;
  }
  globalThis.openCommentFormForSkillChallenge?.(target);
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-herausforderung-action]');
  if (!trigger) return;
  const action = trigger.dataset.herausforderungAction;
  if (submitting) return;
  if (action === 'open') openDialog();
  if (action === 'close') closeDialog();
  if (action === 'add-approach') addApproach();
  if (action === 'remove-approach') removeApproach(Number(trigger.dataset.approachIndex));
  if (action === 'submit') void submitEvent();
  if (action === 'attempt') attemptApproach(trigger);
  if (action === 'set-difficulty') {
    const index = Number(trigger.dataset.approachIndex);
    updateApproachField(index, 'difficulty', Number(trigger.dataset.value));
    const input = trigger.closest('[data-herausforderung-approach-row]')?.querySelector('[data-herausforderung-field="difficulty"]');
    if (input) input.value = trigger.dataset.value;
    updateHerausforderungDraft(buildDraft());
  }
});

document.addEventListener('change', event => {
  const field = event.target;
  if (!field?.closest?.('#herausforderung-overlay')) return;
  const index = Number(field.dataset.herausforderungApproachIndex);
  if (!Number.isInteger(index)) return;
  if (field.dataset.herausforderungField === 'preferredSkill') {
    togglePreferredSkill(index, field.dataset.skillId, field.checked);
    updateHerausforderungDraft(buildDraft());
    return;
  }
  if (field.dataset.herausforderungField) updateApproachField(index, field.dataset.herausforderungField, field.value);
  updateHerausforderungDraft(buildDraft());
});

document.addEventListener('input', event => {
  const field = event.target;
  if (!field?.closest?.('#herausforderung-overlay')) return;
  const index = Number(field.dataset.herausforderungApproachIndex);
  if (!field.dataset.herausforderungField || field.dataset.herausforderungField === 'preferredSkill') return;
  if (Number.isInteger(index)) updateApproachField(index, field.dataset.herausforderungField, field.value);
  field.removeAttribute('aria-invalid');
  updateHerausforderungDraft(buildDraft());
});

document.addEventListener('keydown', event => {
  if (!event.target?.closest?.('#herausforderung-overlay')) return;
  if (event.key !== 'Escape' && !(event.key === 'Enter' && (event.ctrlKey || event.metaKey))) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.key === 'Escape') closeDialog();
  else void submitEvent();
}, true);

globalThis.AleriaHerausforderung = Object.freeze({
  open: openDialog,
  setRenderContext(comments = []) { renderProgress = collectHerausforderungProgress(comments); },
  isComment: comment => isHerausforderungComment(comment),
  renderComment: (comment, index) => {
    try {
      return renderHerausforderungComment(comment, index, { progress: renderProgress });
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
