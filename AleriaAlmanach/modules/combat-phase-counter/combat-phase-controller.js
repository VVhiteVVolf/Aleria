import { getDisplayCombatPhaseEvent, getLatestCombatPhase } from './combat-phase-model.js';
import { renderCombatPhaseComment, renderCombatPhaseRail } from './combat-phase-view.js';
import { createCombatPhaseDialog, renderCombatPhaseEditor, renderPhasePreparation, renderPhaseEditorButtons } from './combat-phase-editor.js';

let rail, dialog, editing, suspendedDraft;
let sceneId = '', currentPhase = null, expanded = false;
const sceneThread = () => globalThis.getCurrentCommentThread?.();
const status = message => { dialog.querySelector('[data-combat-phase-status]').textContent = message; };
const fieldValue = input => input.type === 'checkbox' ? input.checked : input.type === 'number' ? Number(input.value) : input.value;

function updateRail() {
  if (!rail || !currentPhase) return;
  const markup = renderCombatPhaseRail(currentPhase, expanded, rail.dataset.controlsId);
  if (markup !== rail.renderedMarkup) {
    const wasFocused = rail.contains(document.activeElement) ? document.activeElement.dataset.combatPhaseAction : '';
    rail.innerHTML = markup;
    rail.renderedMarkup = markup;
    if (wasFocused) rail.querySelector(`[data-combat-phase-action="${wasFocused}"]`)?.focus({ preventScroll: true });
  }
  const tools = rail.closest('.session-content')?.querySelector('[data-comment-tools-toggle]');
  rail.querySelector('[data-combat-phase-edit]').hidden = tools?.getAttribute('aria-pressed') !== 'true';
}

function renderButtons(state) {
  dialog.querySelector('[data-combat-phase-buttons]').innerHTML = renderPhaseEditorButtons(state.editor, state);
}

function updateRangeButton(state) {
  const action = state.editor.phase ? 'advance' : 'start';
  const button = dialog.querySelector(`[data-combat-phase-action="${action}"]`);
  if (!button) { renderButtons(state); return; }
  const next = state.editor.phase ? state.editor.phase + 1 : state.pending.firstPhase;
  button.hidden = next > state.pending.lastPhase;
  button.textContent = state.editor.phase ? `Auf Phase ${next} schalten` : `Mit Phase ${next} starten`;
}

function readStep(state) {
  const preparation = dialog.querySelector('[data-phase-preparation]');
  const select = preparation?.querySelector('[data-phase-select]');
  if (!select) return;
  // The old document remains in place during the select change.
  const phase = state.phaseShown;
  const flavor = preparation.querySelector('[data-phase-flavor]').value;
  const conditions = [...preparation.querySelectorAll('[data-phase-condition]')].map(row =>
    Object.fromEntries([...row.querySelectorAll('[data-phase-condition-field]')].map(input => [input.dataset.phaseConditionField, fieldValue(input)])));
  state.pending.steps = state.pending.steps.filter(item => item.phase !== phase);
  if (flavor.trim() || conditions.length) state.pending.steps.push({ phase, flavor, conditions });
  state.pending.steps.sort((a, b) => a.phase - b.phase);
}

function readForm(state) {
  for (const input of dialog.querySelectorAll('[data-phase-field]')) state.pending[input.dataset.phaseField] = fieldValue(input);
  readStep(state);
}

function renderPreparation(state, focus) {
  const preparation = dialog.querySelector('[data-phase-preparation]');
  if (!preparation) return;
  preparation.innerHTML = '<legend>Kommende Phasen vorbereiten</legend>' + renderPhasePreparation(state.editor, state.pending, state.selectedPhase);
  state.phaseShown = Number(preparation.querySelector('[data-phase-select]')?.value) || 0;
  if (focus) preparation.querySelector(focus)?.focus({ preventScroll: true });
}

function renderEditor(state) {
  renderCombatPhaseEditor(dialog, state.editor, state);
  state.phaseShown = Number(dialog.querySelector('[data-phase-select]')?.value) || 0;
  renderButtons(state);
}

async function backendFor(state) {
  const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
  if (!backend?.combatPhaseCounter) throw new Error('Der Szenenzähler benötigt die Verbindung zum Szenenspeicher.');
  if (editing !== state || sceneId !== state.threadId || globalThis.getCurrentCommentThreadId?.() !== state.threadId
    || !dialog.classList.contains('active')) return null;
  return backend;
}

async function refreshEditor(backend, state) {
  const editor = await backend.combatPhaseCounter({ entryId: state.threadId, operation: 'read' });
  if (editing !== state) return;
  state.editor = { ...editor, sceneTitle: sceneThread()?.page?.pageTitle || sceneThread()?.title || 'Interaktive Szene' };
  state.pending = structuredClone(editor.settings);
  state.stale = false;
  state.request = null;
}

async function open() {
  if (sceneThread()?.kind !== 'session' || !sceneId || editing?.busy) return;
  dialog ||= createCombatPhaseDialog();
  const state = { threadId: sceneId, busy: true, editor: null, pending: null, selectedPhase: 0 };
  editing = state;
  dialog.querySelector('[data-combat-phase-content]').textContent = '';
  dialog.querySelector('[data-combat-phase-buttons]').textContent = '';
  status('Lade den Phasenzähler …');
  globalThis.activateDialog?.(dialog.id, { initialFocus: '[data-combat-phase-action="close"]' });
  try {
    const backend = await backendFor(state);
    if (!backend) return;
    await refreshEditor(backend, state);
    if (editing !== state) return;
    if (suspendedDraft?.threadId === state.threadId && suspendedDraft.revision === state.editor.revision) {
      state.pending = suspendedDraft.settings;
      state.selectedPhase = suspendedDraft.selectedPhase;
    }
    suspendedDraft = null;
    status('');
  } catch (error) {
    if (editing === state) status(error.message);
  } finally {
    if (editing === state) {
      state.busy = false;
      if (state.editor) renderEditor(state);
      else dialog.querySelector('[data-combat-phase-buttons]').innerHTML = '<button type="button" data-combat-phase-action="open">Erneut laden</button>';
    }
  }
}

function close() {
  if (dialog) globalThis.deactivateDialog?.(dialog.id);
  editing = null;
}

async function write(operation) {
  const state = editing;
  if (!state?.editor || state.busy || (state.stale && operation !== 'reload')) return;
  if (operation !== 'reload') readForm(state);
  state.busy = true;
  renderEditor(state);
  try {
    const backend = await backendFor(state);
    if (!backend) return;
    if (operation === 'reload') {
      await refreshEditor(backend, state);
      status('Aktueller Zählerstand geladen.');
      return;
    }
    const { revision, settings } = state.editor;
    const changed = JSON.stringify(settings) !== JSON.stringify(state.pending);
    const request = { entryId: state.threadId, expectedRevision: revision, operation,
      ...(['configure', 'start'].includes(operation) || (operation === 'advance' && changed) ? { settings: state.pending } : {}) };
    const fingerprint = JSON.stringify(request);
    if (state.request?.fingerprint !== fingerprint) state.request = { fingerprint, id: crypto.randomUUID() };
    const result = await backend.combatPhaseCounter({ ...request, operationId: state.request.id });
    if (result.profileUpdates?.length) document.dispatchEvent(new CustomEvent('aleria:combat-profile-committed', { detail: { updates: result.profileUpdates } }));
    if (editing !== state) return;
    await refreshEditor(backend, state);
    if (editing !== state) return;
    if (result.id) await globalThis.loadCommentsIntoPage?.(state.threadId, true, { page: 'last' });
    if (editing !== state) return;
    status(operation === 'stop' ? 'Phasenzähler beendet.' : operation === 'configure' ? 'Einstellungen gespeichert.'
      : `Phase ${result.phase} eingetragen.${result.revealed?.length ? ` Aufgedeckte Einträge: ${result.revealed.length}.` : ''}`);
  } catch (error) {
    if (editing !== state) return;
    if (String(error.code || '').split('/').at(-1) === 'aborted') state.stale = true;
    status(error.message);
  } finally {
    if (editing === state) {
      state.busy = false;
      renderEditor(state);
      const focusAction = state.stale ? 'reload' : state.editor.stopped ? 'close' : state.editor.phase ? 'advance' : 'start';
      const button = dialog.querySelector(`[data-combat-phase-action="${focusAction}"]:not(:disabled)`);
      (button || dialog.querySelector('[data-combat-phase-action="close"]'))?.focus({ preventScroll: true });
    }
  }
}

function changeCondition(action, button) {
  const state = editing;
  readForm(state);
  const phase = state.phaseShown;
  let step = state.pending.steps.find(item => item.phase === phase);
  if (!step) {
    step = { phase, flavor: '', conditions: [] };
    state.pending.steps.push(step);
  }
  if (action === 'remove-condition') step.conditions.splice(Number(button.dataset.phaseIndex), 1);
  else step.conditions.push({ actorId: '', presetId: '', durationKind: 'actor-comments', durationAmount: 1 });
  renderPreparation(state, action === 'add-condition' ? '[data-phase-condition]:last-of-type select' : '[data-combat-phase-action="add-condition"]');
}

async function openChallenge(action, button) {
  const state = editing;
  readForm(state);
  if (action === 'edit-challenge') {
    state.busy = true;
    try {
      const backend = await backendFor(state);
      const prepared = await backend?.sceneElements?.({ action: 'read', entryId: state.threadId, id: button.dataset.phaseChallengeId });
      if (editing !== state || !prepared) return;
      suspend(state);
      globalThis.AleriaHerausforderung?.openPrepared?.(prepared);
    } catch (error) { if (editing === state) status(error.message); }
    finally { state.busy = false; }
  } else {
    suspend(state);
    globalThis.AleriaHerausforderung?.openForPhase?.(state.phaseShown, action === 'add-trap' ? 'danger' : 'challenge');
  }
}

function suspend(state) {
  suspendedDraft = { threadId: state.threadId, revision: state.editor.revision, settings: state.pending, selectedPhase: state.phaseShown };
  close();
}

document.addEventListener('change', event => {
  const state = editing, input = event.target;
  if (!state?.editor || state.busy || !dialog.contains(input)) return;
  if (input.matches('[data-phase-select], [data-phase-field]')) {
    readForm(state);
    state.selectedPhase = input.matches('[data-phase-select]') ? Number(input.value) : state.phaseShown;
    renderPreparation(state, input.matches('[data-phase-select]') ? '[data-phase-select]' : null);
    if (input.matches('[data-phase-field]')) updateRangeButton(state);
  } else if (input.dataset.phaseConditionField === 'durationKind') {
    input.closest('[data-phase-condition]').querySelector('[data-phase-duration-amount]').hidden = input.value !== 'actor-comments';
  }
});

document.addEventListener('click', event => {
  const button = event.target.closest?.('[data-combat-phase-action]');
  if (!button) return;
  const action = button.dataset.combatPhaseAction;
  if (action === 'toggle') {
    expanded = !expanded;
    updateRail();
  } else if (action === 'open') void open();
  else if (action === 'close' && !editing?.busy) close();
  else if (editing?.editor && !editing.busy && !editing.stale && ['add-condition', 'remove-condition'].includes(action)) changeCondition(action, button);
  else if (editing?.editor && !editing.busy && !editing.stale && ['add-challenge', 'add-trap', 'edit-challenge'].includes(action)) void openChallenge(action, button);
  else if (['start', 'advance', 'stop', 'configure', 'reload'].includes(action)) void write(action);
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !event.target.closest?.('#combat-phase-counter-overlay')) return;
  event.preventDefault();
  if (!editing?.busy) close();
});

document.addEventListener('aleria:comment-tools-visibility-changed', updateRail);

globalThis.AleriaCombatPhaseCounter = Object.freeze({
  filterTimeline: comments => comments.filter(comment => !['configure', 'stop'].includes(getDisplayCombatPhaseEvent(comment)?.operation)),
  renderComment(comment) {
    const phase = getDisplayCombatPhaseEvent(comment);
    return phase ? renderCombatPhaseComment(comment, phase) : '';
  },
  sync(comments, { threadId, host }) {
    if (sceneId !== threadId) {
      close();
      sceneId = threadId;
      suspendedDraft = null;
      rail = null;
      expanded = false;
    }
    if (!host?.querySelector('[data-scene-elements-dock]')) return null;
    currentPhase = getLatestCombatPhase(comments);
    if (editing?.editor && !editing.busy && currentPhase && currentPhase.revision > editing.editor.revision) {
      readForm(editing);
      editing.stale = true;
      renderEditor(editing);
      status('Der Zähler wurde inzwischen geändert. Lade den aktuellen Stand.');
    }
    if (!currentPhase || currentPhase.operation === 'stop') return null;
    if (!rail) {
      rail = document.createElement('section');
      rail.className = 'combat-phase-rail';
      rail.dataset.controlsId = 'combat-phase-controls-' + crypto.randomUUID();
      rail.setAttribute('aria-label', 'Phasenzähler');
    }
    updateRail();
    // The common right rail moves this same node into its desktop or compact dock.
    queueMicrotask(updateRail);
    return rail;
  }
});
