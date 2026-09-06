import { deriveCombatEncounterState, getActiveCombatEncounter, normalizeCombatEncounterEvent, buildEncounterExperienceAwards } from '../combat/combat-encounter-model.js?v=20260906-character-vitality-v1';
import { getEncounterValidationError, prepareEncounterParticipants } from '../combat/combat-encounter-lifecycle.js?v=20260906-character-vitality-v1';
import { buildCombatEncounterSummary } from '../combat/combat-encounter-summary.js';
import { suggestEncounterOutcome } from '../combat/combat-encounter-outcome.js';
import { collectSceneActorIds, buildEncounterCandidates, readEncounterParticipants, captureEncounterCandidateDraft } from './combat-encounter-candidates.js?v=20260906-character-vitality-v1';
import { renderActiveEncounterPanel } from './combat-encounter-panel.js?v=20260906-character-vitality-v1';
import { commitSceneCombatStatus } from '../combat-status/combat-status-controller.js?v=20260906-character-vitality-v1';
import { ensureCombatEncounterDialog, filterEncounterCandidates, renderCombatEncounterComment, renderEncounterCandidates,
  renderOperationButtons, setEncounterEndControls, setEncounterStatus, setEncounterSubmitting, updateEncounterCount,
  setEncounterMode, setEncounterPreview } from './combat-encounter-ui.js?v=20260906-character-vitality-v1';

// This dialog owns its draft; changing tabs never rewrites encounter history.
let dialog = null;
const root = () => document.getElementById('combat-encounter-overlay');
const field = name => root()?.querySelector(`[data-combat-encounter-field="${name}"]`);
const comments = () => globalThis.getCachedCommentsForThread?.(dialog?.threadId) || [];
const participants = () => readEncounterParticipants(root(), dialog.candidates, dialog.operation);

function loadCandidates() {
  const history = comments();
  const sceneIds = collectSceneActorIds(history, globalThis.getCurrentCommentCastIds?.() || [], globalThis.AleriaCommentSceneCast?.getActors?.() || []);
  const data = buildEncounterCandidates(globalThis.getAvailableCommentCharacters?.() || [], history, dialog.encounter, dialog.operation, sceneIds);
  Object.assign(dialog, data);
  const draft = dialog.drafts.get(dialog.operation);
  for (const candidate of dialog.candidates) {
    const saved = draft?.get(candidate.actorId);
    if (saved) Object.assign(candidate, Object.fromEntries(Object.entries(saved).filter(([, value]) => value !== undefined)));
  }
}

function applyFilter() {
  filterEncounterCandidates(field('search').value, ['start', 'add'].includes(dialog.operation) ? field('scope').value : 'all');
}

function buildEvent() {
  const ending = dialog.operation === 'end';
  return normalizeCombatEncounterEvent({
    encounterId: dialog.encounter?.encounterId || dialog.newId, operation: dialog.operation,
    title: field('title').value, body: field('body').value,
    combatType: dialog.encounter?.combatType || field('combat-type').value,
    expectedRevision: dialog.encounter?.revision || '', participants: participants(),
    outcome: ending ? field('outcome').value : '', endReason: ending ? field('end-reason').value : '',
    winningPartyId: ending && field('outcome').value === 'victory' ? field('winning-party').value : '',
    awardExperience: ending ? field('outcome').value === 'victory' && field('award-experience').checked : field('combat-type').value !== 'training'
  });
}

function updatePreview() {
  if (!dialog) return;
  updateEncounterCount();
  setEncounterMode(dialog.operation, field('outcome').value);
  if (dialog.operation !== 'end') return;
  const event = buildEvent();
  event.participants = [...prepareEncounterParticipants(event, dialog.encounter, dialog.profiles, dialog.states).values()];
  event.summary = dialog.summary;
  const plan = event.awardExperience ? buildEncounterExperienceAwards({ participants: event.participants.map(participant => ({
    ...participant, eligibleForExperience: participant.eligibleForExperience !== false && participant.persistence?.kind === 'character'
  })) }, event.winningPartyId) : { totalExperience: 0, awards: [] };
  event.experience = { total: plan.totalExperience, awards: plan.awards };
  setEncounterPreview(event);
}

function initializeOutcome() {
  const roster = [...(dialog.encounter?.participants.values() || [])];
  const suggestion = suggestEncounterOutcome(roster);
  field('outcome').value = suggestion?.outcome || '';
  field('winning-party').value = suggestion?.winningPartyId || '';
  field('end-reason').value = suggestion?.endReason || 'agreement';
  field('award-experience').checked = dialog.encounter?.awardExperience !== false && dialog.encounter?.combatType !== 'training';
  dialog.summary = dialog.encounter ? buildCombatEncounterSummary({
    encounterId: dialog.encounter.encounterId, participants: roster, comments: comments(), states: dialog.states, profiles: dialog.profiles
  }) : null;
  setEncounterStatus(suggestion ? 'Der Kampfstand legt einen Sieger nahe. Prüfe den Vorschlag vor dem Abschluss.' : 'Wähle den Ausgang des Kampfes. Es wird keine Siegerseite vorgegeben.');
}

function renderDialog({ initial = false } = {}) {
  loadCandidates();
  renderOperationButtons(!!dialog.encounter, dialog.operation);
  renderEncounterCandidates(dialog.candidates, dialog.operation);
  if (initial) {
    const sides = [...new Map([...(dialog.encounter?.participants.values() || [])].filter(participant => participant.partyId !== 'neutral')
      .map(participant => [participant.partyId, { id: participant.partyId, name: participant.partyName }])).values()];
    setEncounterEndControls(false, sides);
    field('scope').value = dialog.candidates.some(candidate => candidate.inScene) ? 'scene' : 'all';
    initializeOutcome();
  }
  applyFilter();
  updatePreview();
}

function openDialog(operation, trigger) {
  if (dialog?.submitting) return;
  const thread = globalThis.getCurrentCommentThread?.();
  const threadId = String(globalThis.getCurrentCommentThreadId?.() || '');
  if (thread?.kind !== 'session' || !threadId || (trigger?.dataset.threadId && trigger.dataset.threadId !== threadId)) {
    globalThis.showAppStatus?.('Öffne zuerst die zugehörige interaktive Szene.', 'error'); return;
  }
  const encounter = getActiveCombatEncounter(globalThis.getCachedCommentsForThread?.(threadId) || []);
  if (trigger?.dataset.encounterId && trigger.dataset.encounterId !== encounter?.encounterId) {
    globalThis.showAppStatus?.('Dieser Kampf ist bereits beendet. Lade den aktuellen Szenenstand.', 'error'); return;
  }
  ensureCombatEncounterDialog();
  dialog = { threadId, encounter, operation: encounter ? (['add', 'remove', 'end'].includes(operation) ? operation : 'end') : 'start',
    newId: globalThis.crypto.randomUUID(), candidates: [], drafts: new Map(), submitting: false, stale: false };
  field('title').value = encounter?.title || 'Kampfankündigung';
  field('body').value = '';
  field('search').value = '';
  field('combat-type').value = encounter?.combatType || 'combat';
  root().querySelector('[data-combat-encounter-action="refresh"]').hidden = true;
  renderDialog({ initial: true });
  setEncounterSubmitting(false);
  if (!encounter) setEncounterStatus('Bei der Auswahl erhält jede Figur zunächst eine eigene Seite. Passe die Namen für gemeinsame Parteien an.');
  globalThis.activateDialog?.('combat-encounter-overlay', { initialFocus: encounter ? '[data-combat-encounter-field="outcome"]' : '[data-combat-encounter-field="title"]' });
}

function closeDialog() {
  if (dialog?.submitting) return;
  globalThis.deactivateDialog?.('combat-encounter-overlay');
  dialog = null;
}

function markStale() {
  if (!dialog) return;
  dialog.stale = true;
  setEncounterStatus('Der Kampf wurde inzwischen verändert. Lade den aktuellen Stand und prüfe das Fazit erneut; dein Erzählertext bleibt erhalten.', 'error');
  root().querySelector('[data-combat-encounter-action="refresh"]').hidden = false;
  root().querySelector('[data-combat-encounter-action="submit"]').disabled = true;
}

async function refreshEncounter() {
  if (!dialog || dialog.submitting) return;
  try {
    await globalThis.loadCommentsIntoPage?.(dialog.threadId, true, { page: 'last' });
  } catch (error) {
    setEncounterStatus(error?.message || 'Der aktuelle Kampfstand konnte nicht geladen werden.', 'error'); return;
  }
  if (!dialog) return;
  const current = getActiveCombatEncounter(comments());
  if (!current || current.encounterId !== dialog.encounter?.encounterId) {
    setEncounterStatus(current ? 'In dieser Szene läuft inzwischen ein anderer Kampf. Schließe diese Ansicht und öffne den laufenden Kampf.'
      : 'Dieser Kampf wurde bereits beendet. Schließe diese Ansicht.', 'error'); return;
  }
  dialog.encounter = current;
  dialog.drafts.clear();
  dialog.stale = false;
  root().querySelector('[data-combat-encounter-action="refresh"]').hidden = true;
  renderDialog({ initial: true });
  setEncounterSubmitting(false);
}

async function materializeSelectedBuiltins(event) {
  for (const participant of event.participants.filter(participant => participant.persistence?.kind === 'scene-actor')) {
    if (!globalThis.AleriaCreatures?.materializeBuiltin) throw new Error('Die Kreatur kann noch nicht gespeichert werden.');
    await globalThis.AleriaCreatures.materializeBuiltin(participant.actorId);
    dialog.candidates.find(candidate => candidate.actorId === participant.actorId).persistence = { kind: 'creature', recordId: participant.actorId };
    participant.persistence = { kind: 'creature', recordId: participant.actorId };
  }
}

async function submitEvent() {
  if (!dialog || dialog.submitting || dialog.stale) return;
  const current = getActiveCombatEncounter(comments());
  if (dialog.encounter && (current?.encounterId !== dialog.encounter.encounterId || current?.revision !== dialog.encounter.revision)) { markStale(); return; }
  const event = buildEvent();
  const error = getEncounterValidationError(event, current);
  if (error) { setEncounterStatus(error, 'error'); return; }
  dialog.submitting = true;
  setEncounterSubmitting(true);
  try {
    await materializeSelectedBuiltins(event);
    const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
    if (!backend?.addCombatEncounter) throw new Error('Der Online-Speicher unterstützt die Kampfliste noch nicht.');
    const labels = { start: 'Der Kampf beginnt.', add: 'Weitere Kämpfer treten bei.', remove: 'Kämpfer scheiden aus.', end: 'Der Kampf ist beendet.' };
    const threadId = dialog.threadId;
    const result = await backend.addCombatEncounter(threadId, [labels[event.operation], event.body].filter(Boolean).join('\n\n'), '7777', {
      commentMode: 'combat-encounter', commentKind: 'combat-encounter-event', combatEncounter: event,
      orderKey: globalThis.getNextCommentOrderKey?.(threadId, null) ?? Date.now()
    });
    if (result?.profileUpdates?.length) document.dispatchEvent(new CustomEvent('aleria:combat-profile-committed', { detail: { updates: result.profileUpdates } }));
    dialog.submitting = false;
    closeDialog();
    await globalThis.loadCommentsIntoPage?.(threadId, true, { page: 'last' });
    globalThis.showAppStatus?.(event.operation === 'end' ? 'Kampf abgeschlossen und Fazit veröffentlicht.' : 'Die Kampfliste wurde aktualisiert.', 'success');
  } catch (error) {
    console.error('combat encounter submit failed:', error);
    setEncounterStatus(error?.message || 'Die Kampfliste konnte nicht gespeichert werden.', 'error');
  } finally {
    if (dialog) { dialog.submitting = false; setEncounterSubmitting(false); if (dialog.stale) markStale(); }
  }
}

async function cheatResetSelected() {
  if (!dialog || dialog.submitting) return;
  if (getActiveCombatEncounter(comments())) { setEncounterStatus('Zurücksetzen ist während einer Kampfphase gesperrt.', 'error'); return; }
  const records = participants().map(participant => participant.persistence).filter(persistence => ['character', 'creature'].includes(persistence?.kind));
  if (!records.length) { setEncounterStatus('Wähle mindestens eine gespeicherte Figur aus.', 'error'); return; }
  if (!confirm(`${records.length} Figur(en) vollständig zurücksetzen? Trefferpunkte, Ressourcen und begrenzte Fähigkeiten werden aufgefüllt; temporäre Effekte entfernt. Dies wird im Szenenverlauf festgehalten.`)) return;
  try {
    dialog.submitting = true;
    for (const record of records) await commitSceneCombatStatus({ threadId: dialog.threadId, actorId: record.recordId,
      characterId: record.recordId, kind: record.kind, expectedLastCommentId: comments().at(-1)?.id || '' }, { operation: 'reset' });
    renderDialog();
    setEncounterStatus(`${records.length} Figur(en) zurückgesetzt.`, 'success');
  } catch (error) { setEncounterStatus(error?.message || 'Zurücksetzen fehlgeschlagen.', 'error'); }
  finally { if (dialog) dialog.submitting = false; }
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-combat-encounter-action]');
  if (!trigger || dialog?.submitting) return;
  const action = trigger.dataset.combatEncounterAction;
  if (action === 'open') openDialog(trigger.dataset.operation, trigger);
  if (action === 'close') closeDialog();
  if (action === 'cheat-reset') void cheatResetSelected();
  if (action === 'refresh') void refreshEncounter();
  if (action === 'operation' && dialog) {
    dialog.drafts.set(dialog.operation, captureEncounterCandidateDraft(root()));
    dialog.operation = trigger.dataset.operation;
    renderDialog();
  }
  if (action === 'submit') void submitEvent();
});

document.addEventListener('input', event => {
  if (!dialog || dialog.submitting || !event.target?.closest?.('#combat-encounter-overlay')) return;
  if (event.target.matches('[data-combat-encounter-field="search"]')) applyFilter();
});

document.addEventListener('change', event => {
  if (!dialog || dialog.submitting || !event.target?.closest?.('#combat-encounter-overlay')) return;
  const target = event.target;
  if (target.matches('[data-combat-encounter-field="scope"]')) applyFilter();
  if (target.matches('[data-combat-encounter-field="participant"]') && target.checked) {
    const row = target.closest('[data-combat-encounter-candidate]');
    const party = row.querySelector('[data-combat-encounter-field="party"]');
    if (party && !party.value.trim()) party.value = dialog.candidates.find(candidate => candidate.actorId === row.dataset.actorId)?.name || '';
  }
  if (target.matches('[data-combat-encounter-field="outcome"]')) {
    if (target.value === 'draw') field('end-reason').value = 'agreement';
    if (target.value === 'aborted') field('end-reason').value = 'interruption';
  }
  updatePreview();
});

document.addEventListener('aleria:comments-updated', event => {
  if (!dialog || dialog.submitting || event.detail?.threadId !== dialog.threadId) return;
  const current = getActiveCombatEncounter(event.detail.comments || comments());
  if (dialog.encounter ? current?.encounterId !== dialog.encounter.encounterId || current?.revision !== dialog.encounter.revision : !!current) markStale();
});

globalThis.AleriaCombatEncounter = Object.freeze({ open: openDialog, isComment: comment => !!comment?.combatEncounter,
  renderComment: renderCombatEncounterComment, deriveState: deriveCombatEncounterState, renderActivePanel: renderActiveEncounterPanel });
