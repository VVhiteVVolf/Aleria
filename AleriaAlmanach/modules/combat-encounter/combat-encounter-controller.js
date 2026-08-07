import { CombatProfileResolver } from '../combat/combat-profile-resolver.js?v=20260807-freya-v1';
import { getEffectiveCombatLevel } from '../combat/combat-profile-model.js?v=20260807-save-guard-v1';
import {
  deriveCombatEncounterState,
  getActiveCombatEncounter,
  normalizeCombatEncounterEvent
} from '../combat/combat-encounter-model.js?v=20260806-encounter-card-v1';
import { deriveCombatStateFromComments } from '../combat/combat-state-model.js?v=20260807-freya-v1';
import {
  ensureCombatEncounterDialog,
  filterEncounterCandidates,
  renderCombatEncounterComment,
  renderEncounterCandidates,
  renderOperationButtons,
  setEncounterEndControls,
  setEncounterStatus,
  setEncounterSubmitting,
  updateEncounterCount
} from './combat-encounter-ui.js?v=20260807-loot-v1';

const resolver = new CombatProfileResolver();
let activeThreadId = '';
let activeEncounter = null;
let activeOperation = 'start';
let activeCandidates = [];

function clone(value) {
  if (!value || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function searchText(...values) {
  return values.join(' ').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function availableActors() {
  try {
    return typeof globalThis.getAvailableCommentCharacters === 'function' ? globalThis.getAvailableCommentCharacters() : [];
  } catch {
    return [];
  }
}

function cachedComments() {
  return globalThis.getCachedCommentsForThread?.(activeThreadId) || [];
}

function actorPersistence(actor, profile) {
  if (profile?.persistence) return clone(profile.persistence);
  if (actor?.sourceCreatureId || actor?.sceneActorSourceId) return { kind: 'scene-creature', sourceCreatureId: actor.sourceCreatureId || actor.sceneActorSourceId };
  return { kind: actor?.entityType === 'creature' ? 'creature' : 'character', recordId: actor?.id || '' };
}

function candidateFromActor(actor) {
  const profile = resolver.resolve(actor);
  return {
    actor: clone(actor),
    actorId: String(actor.id || profile.characterId || ''),
    sourceId: String(actor.sourceCreatureId || actor.sceneActorSourceId || ''),
    name: String(actor.name || profile.name || 'Unbekannte Figur'),
    title: String(actor.title || ''),
    portrait: String(actor.portrait || profile.portrait || ''),
    level: getEffectiveCombatLevel(profile),
    entityType: actor.entityType === 'creature' ? 'creature' : 'character',
    currentHitPoints: Number(profile.currentHitPoints) || 0,
    maximumHitPoints: Number(profile.maximumHitPoints) || 0,
    conditionNames: [], concentrationName: '', channelingName: '',
    partyId: '', partyName: '', status: 'active', selected: false,
    persistence: actorPersistence(actor, profile),
    searchText: searchText(actor.name, actor.title, actor.entityType)
  };
}

function currentParticipants() {
  return activeEncounter?.participants instanceof Map ? [...activeEncounter.participants.values()] : [];
}

function candidatesForOperation(operation) {
  const actors = availableActors().map(candidateFromActor).filter(candidate => candidate.actorId);
  const actorById = new Map(actors.map(candidate => [candidate.actorId, candidate]));
  const participants = currentParticipants();
  if (operation === 'start') return actors;
  if (operation === 'add') {
    const activeIds = new Set(participants.filter(participant => participant.status === 'active').map(participant => participant.actorId));
    return actors.filter(candidate => !activeIds.has(candidate.actorId));
  }
  const sceneStates = deriveCombatStateFromComments(cachedComments());
  return participants.map(participant => {
    const candidate = actorById.get(participant.actorId) || {};
    const runtime = sceneStates.get(String(participant.actorId)) || {};
    return {
      ...candidate,
      ...participant,
      currentHitPoints: Number.isFinite(Number(runtime.current)) ? Number(runtime.current) : candidate.currentHitPoints,
      maximumHitPoints: Number.isFinite(Number(runtime.maximum)) ? Number(runtime.maximum) : candidate.maximumHitPoints,
      conditionNames: (Array.isArray(runtime.temporaryConditions) ? runtime.temporaryConditions : [])
        .filter(condition => condition?.active !== false)
        .map(condition => String(condition?.name || 'Zustand')),
      concentrationName: String(runtime.concentration?.actionName || ''),
      channelingName: String(runtime.channeling?.actionName || ''),
      searchText: searchText(participant.name, participant.partyName, participant.status),
      selected: operation === 'end'
    };
  });
}

function parties() {
  return [...new Map(currentParticipants().filter(participant => participant.partyId).map(participant => [participant.partyId, {
    id: participant.partyId,
    name: participant.partyName || participant.partyId
  }])).values()];
}

function renderDialog() {
  activeCandidates = candidatesForOperation(activeOperation);
  renderOperationButtons(!!activeEncounter, activeOperation);
  renderEncounterCandidates(activeCandidates, activeOperation);
  setEncounterEndControls(activeOperation === 'end', parties(), parties()[0]?.id || '');
  updateEncounterCount();
}

function openDialog() {
  const thread = globalThis.getCurrentCommentThread?.();
  if (!thread || thread.kind !== 'session') {
    globalThis.showAppStatus?.('Die Kampfliste ist nur in interaktiven Szenen verfügbar.', 'error');
    return;
  }
  activeThreadId = String(globalThis.getCurrentCommentThreadId?.() || '');
  if (!activeThreadId) return;
  activeEncounter = getActiveCombatEncounter(cachedComments());
  activeOperation = activeEncounter ? 'add' : 'start';
  ensureCombatEncounterDialog();
  const title = document.querySelector('[data-combat-encounter-field="title"]');
  const body = document.querySelector('[data-combat-encounter-field="body"]');
  const search = document.querySelector('[data-combat-encounter-field="search"]');
  if (title) title.value = activeEncounter?.title || 'Kampfankündigung';
  if (body) body.value = '';
  if (search) search.value = '';
  renderDialog();
  setEncounterStatus(activeEncounter ? `${activeEncounter.participants.size} Kämpfer sind in der aktuellen Kampfliste.` : 'Wähle Kämpfer und trage für jede Figur ihre Partei ein.');
  globalThis.activateDialog?.('combat-encounter-overlay', { initialFocus: '[data-combat-encounter-action="operation"], input, button' });
}

function closeDialog() {
  globalThis.deactivateDialog?.('combat-encounter-overlay');
  activeThreadId = '';
  activeEncounter = null;
  activeCandidates = [];
}

function selectedParticipants() {
  return [...document.querySelectorAll('[data-combat-encounter-candidate]')].flatMap(row => {
    const checkbox = row.querySelector('[data-combat-encounter-field="participant"]');
    if (!checkbox?.checked && activeOperation !== 'end') return [];
    const candidate = activeCandidates.find(item => item.actorId === row.dataset.actorId);
    if (!candidate) return [];
    const partyName = String(row.querySelector('[data-combat-encounter-field="party"]')?.value || candidate.partyName || candidate.partyId || 'Neutral').trim();
    const status = String(row.querySelector('[data-combat-encounter-field="status"]')?.value || candidate.status || 'active');
    return [{
      actorId: candidate.actorId,
      sourceId: candidate.sourceId || '',
      name: candidate.name,
      portrait: candidate.portrait,
      level: candidate.level || 1,
      partyId: partyName.toLocaleLowerCase('de').replace(/[^a-z0-9äöüß]+/g, '-').replace(/^-|-$/g, '') || 'neutral',
      partyName,
      status,
      persistence: candidate.persistence,
      eligibleForExperience: candidate.entityType !== 'creature'
    }];
  });
}

function buildEvent() {
  const encounterId = activeEncounter?.encounterId || globalThis.crypto?.randomUUID?.() || `encounter-${Date.now().toString(36)}`;
  return normalizeCombatEncounterEvent({
    encounterId,
    operation: activeOperation,
    title: document.querySelector('[data-combat-encounter-field="title"]')?.value || 'Kampfankündigung',
    body: document.querySelector('[data-combat-encounter-field="body"]')?.value || '',
    participants: selectedParticipants(),
    winningPartyId: activeOperation === 'end' ? document.querySelector('[data-combat-encounter-field="winning-party"]')?.value : '',
    awardExperience: document.querySelector('[data-combat-encounter-field="award-experience"]')?.checked !== false
  });
}

async function materializeSelectedBuiltins() {
  const rows = [...document.querySelectorAll('[data-combat-encounter-candidate]')];
  const pending = rows
    .map(row => {
      const checkbox = row.querySelector('[data-combat-encounter-field="participant"]');
      if (!checkbox?.checked && activeOperation !== 'end') return null;
      return activeCandidates.find(item => item.actorId === row.dataset.actorId) || null;
    })
    .filter(candidate => candidate?.persistence?.kind === 'scene-actor' && candidate.actorId);
  for (const candidate of pending) {
    try {
      await globalThis.AleriaCreatures?.materializeBuiltin?.(candidate.actorId);
      candidate.persistence = { kind: 'creature', recordId: candidate.actorId };
    } catch (error) {
      console.error('materialize builtin creature failed:', error);
    }
  }
}

async function submitEvent() {
  setEncounterSubmitting(true);
  try {
    await materializeSelectedBuiltins();
    const event = buildEvent();
    if (!event.participants.length && event.operation !== 'end') {
      setEncounterStatus('Wähle mindestens eine Figur aus.', 'error');
      return;
    }
    const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
    if (!backend?.addCombatEncounter) throw new Error('Der Online-Speicher unterstützt die Kampfliste noch nicht.');
    const labels = { start: 'Der Kampf beginnt.', add: 'Weitere Kämpfer treten bei.', remove: 'Kämpfer scheiden aus.', end: 'Der Kampf ist beendet.' };
    const result = await backend.addCombatEncounter(activeThreadId, [labels[event.operation], event.body].filter(Boolean).join('\n\n'), '7777', {
      commentMode: 'combat-encounter',
      commentKind: 'combat-encounter-event',
      combatEncounter: event,
      orderKey: globalThis.getNextCommentOrderKey?.(activeThreadId, null) ?? Date.now()
    });
    if (result?.profileUpdates?.length) document.dispatchEvent(new CustomEvent('aleria:combat-profile-committed', { detail: { updates: result.profileUpdates } }));
    const threadId = activeThreadId;
    closeDialog();
    await globalThis.loadCommentsIntoPage?.(threadId, true, { page: 'last' });
    globalThis.showAppStatus?.('Die Kampfliste wurde verbindlich aktualisiert.', 'success');
  } catch (error) {
    console.error('combat encounter submit failed:', error);
    setEncounterStatus(error?.message || 'Die Kampfliste konnte nicht gespeichert werden.', 'error');
  } finally {
    setEncounterSubmitting(false);
  }
}

async function cheatResetSelected() {
  const participants = selectedParticipants()
    .map(participant => participant.persistence)
    .filter(persistence => persistence?.kind === 'character' || persistence?.kind === 'creature')
    .map(persistence => ({ kind: persistence.kind, recordId: persistence.recordId }));
  if (!participants.length) {
    setEncounterStatus('Wähle mindestens eine gespeicherte Figur aus, bevor du zurücksetzt.', 'error');
    return;
  }
  const confirmed = confirm(
    `${participants.length} Figur(en) auf ihren aktuellen Charakterbogen-Vollzustand zurücksetzen?\n\nTrefferpunkte, Ressourcen und Fähigkeiten werden auf maximal gesetzt, alle Kampfsperren gelöst. Das ist ein Cheat-Werkzeug und wird nicht als Beitrag erzählt.`
  );
  if (!confirmed) return;
  try {
    const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
    if (!backend?.resetCombatParticipants) throw new Error('Zurücksetzen benötigt eine Online-Verbindung.');
    const result = await backend.resetCombatParticipants(participants);
    setEncounterStatus(`${result?.reset?.length || 0} Figur(en) zurückgesetzt.`, 'success');
    renderDialog();
  } catch (error) {
    console.error('cheat reset failed:', error);
    setEncounterStatus(error?.message || 'Zurücksetzen fehlgeschlagen.', 'error');
  }
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-combat-encounter-action]');
  if (!trigger) return;
  const action = trigger.dataset.combatEncounterAction;
  if (action === 'open') openDialog();
  if (action === 'close') closeDialog();
  if (action === 'cheat-reset') void cheatResetSelected();
  if (action === 'operation') {
    activeOperation = trigger.dataset.operation || activeOperation;
    renderDialog();
  }
  if (action === 'submit') void submitEvent();
});

document.addEventListener('input', event => {
  if (event.target?.matches?.('[data-combat-encounter-field="search"]')) filterEncounterCandidates(event.target.value);
});
document.addEventListener('change', event => {
  if (event.target?.closest?.('#combat-encounter-overlay')) updateEncounterCount();
});

globalThis.AleriaCombatEncounter = Object.freeze({
  open: openDialog,
  isComment: comment => !!comment?.combatEncounter,
  renderComment: renderCombatEncounterComment,
  deriveState: deriveCombatEncounterState
});
