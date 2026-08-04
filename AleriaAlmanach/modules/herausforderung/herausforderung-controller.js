import {
  collectHerausforderungApproaches,
  isHerausforderungComment,
  MAX_HERAUSFORDERUNG_APPROACHES,
  MIN_HERAUSFORDERUNG_APPROACHES,
  normalizeHerausforderungApproach,
  normalizeHerausforderungEvent
} from './herausforderung-model.js?v=20260805-herausforderung-v2';
import {
  ensureHerausforderungDialog,
  renderApproachRows,
  renderHerausforderungComment,
  setHerausforderungStatus,
  setHerausforderungSubmitting
} from './herausforderung-ui.js?v=20260805-herausforderung-v2';

let activeThreadId = '';
let draftApproaches = [];

function defaultApproaches() {
  return [normalizeHerausforderungApproach({}, 0), normalizeHerausforderungApproach({}, 1), normalizeHerausforderungApproach({}, 2)];
}

function renderDialog() {
  renderApproachRows(draftApproaches);
}

function openDialog() {
  const thread = globalThis.getCurrentCommentThread?.();
  if (!thread || thread.kind !== 'session') {
    globalThis.showAppStatus?.('Herausforderungen sind nur in interaktiven Szenen verfügbar.', 'error');
    return;
  }
  activeThreadId = String(globalThis.getCurrentCommentThreadId?.() || '');
  if (!activeThreadId) return;
  draftApproaches = defaultApproaches();
  ensureHerausforderungDialog();
  const title = document.querySelector('[data-herausforderung-field="title"]');
  const description = document.querySelector('[data-herausforderung-field="publicDescription"]');
  if (title) title.value = 'Herausforderung';
  if (description) description.value = '';
  renderDialog();
  setHerausforderungStatus('Öffentliche Beschreibung sowie mindestens einen Ansatz mit Fertigkeit, Schwierigkeit und verdeckter Erkenntnis ausfüllen.');
  globalThis.activateDialog?.('herausforderung-overlay', { initialFocus: '[data-herausforderung-field="title"]' });
}

function closeDialog() {
  globalThis.deactivateDialog?.('herausforderung-overlay');
  activeThreadId = '';
  draftApproaches = [];
}

function addApproach() {
  if (draftApproaches.length >= MAX_HERAUSFORDERUNG_APPROACHES) return;
  draftApproaches.push(normalizeHerausforderungApproach({}, draftApproaches.length));
  renderDialog();
}

function removeApproach(index) {
  if (draftApproaches.length <= 1) return;
  draftApproaches.splice(index, 1);
  renderDialog();
}

function updateApproachField(index, field, value) {
  const approach = draftApproaches[index];
  if (!approach) return;
  if (field === 'label') approach.label = String(value || '');
  if (field === 'difficulty') approach.difficulty = Math.max(1, Math.min(40, Math.trunc(Number(value)) || 10));
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

function buildEvent() {
  return normalizeHerausforderungEvent({
    title: document.querySelector('[data-herausforderung-field="title"]')?.value || 'Herausforderung',
    publicDescription: document.querySelector('[data-herausforderung-field="publicDescription"]')?.value || '',
    approaches: draftApproaches
  });
}

async function submitEvent() {
  const event = buildEvent();
  if (!event.publicDescription) {
    setHerausforderungStatus('Bitte eine öffentliche Beschreibung eintragen.', 'error');
    return;
  }
  if (event.approaches.length < MIN_HERAUSFORDERUNG_APPROACHES || event.approaches.some(approach => !approach.preferredSkills.length || !approach.insight)) {
    setHerausforderungStatus('Jeder Ansatz braucht mindestens eine passende Fertigkeit und eine verdeckte Erkenntnis.', 'error');
    return;
  }
  setHerausforderungSubmitting(true);
  try {
    const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
    if (!backend?.addHerausforderung) throw new Error('Der Online-Speicher unterstützt Herausforderungen noch nicht.');
    await backend.addHerausforderung(activeThreadId, `Herausforderung: ${event.title}`, '7777', {
      commentMode: 'herausforderung',
      commentKind: 'herausforderung-event',
      herausforderung: event,
      orderKey: globalThis.getNextCommentOrderKey?.(activeThreadId, null) ?? Date.now()
    });
    const threadId = activeThreadId;
    closeDialog();
    await globalThis.loadCommentsIntoPage?.(threadId, true, { page: 'last' });
    globalThis.showAppStatus?.('Die Herausforderung wurde veröffentlicht.', 'success');
  } catch (error) {
    console.error('herausforderung submit failed:', error);
    setHerausforderungStatus(error?.message || 'Die Herausforderung konnte nicht gespeichert werden.', 'error');
  } finally {
    setHerausforderungSubmitting(false);
  }
}

function attemptApproach(trigger) {
  const title = trigger.dataset.herausforderungTitle || 'Herausforderung';
  const label = trigger.dataset.approachLabel || 'Ansatz';
  if (typeof globalThis.openCommentForm === 'function') globalThis.openCommentForm();
  globalThis.showAppStatus?.(`Wähle im Kommentar-Formular "Fertigkeitsversuch" und als Ziel "${title} · ${label}".`, 'info', { timeout: 9000 });
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-herausforderung-action]');
  if (!trigger) return;
  const action = trigger.dataset.herausforderungAction;
  if (action === 'open') openDialog();
  if (action === 'close') closeDialog();
  if (action === 'add-approach') addApproach();
  if (action === 'remove-approach') removeApproach(Number(trigger.dataset.approachIndex));
  if (action === 'submit') void submitEvent();
  if (action === 'attempt') attemptApproach(trigger);
});

document.addEventListener('change', event => {
  const field = event.target;
  if (!field?.closest?.('#herausforderung-overlay')) return;
  const index = Number(field.dataset.herausforderungApproachIndex);
  if (!Number.isInteger(index)) return;
  if (field.dataset.herausforderungField === 'preferredSkill') {
    togglePreferredSkill(index, field.dataset.skillId, field.checked);
    return;
  }
  if (field.dataset.herausforderungField) updateApproachField(index, field.dataset.herausforderungField, field.value);
});

document.addEventListener('input', event => {
  const field = event.target;
  if (!field?.closest?.('#herausforderung-overlay')) return;
  const index = Number(field.dataset.herausforderungApproachIndex);
  if (!Number.isInteger(index) || !field.dataset.herausforderungField || field.dataset.herausforderungField === 'preferredSkill') return;
  updateApproachField(index, field.dataset.herausforderungField, field.value);
});

globalThis.AleriaHerausforderung = Object.freeze({
  open: openDialog,
  isComment: comment => isHerausforderungComment(comment),
  renderComment: (comment, index) => {
    try {
      return renderHerausforderungComment(comment, index);
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
