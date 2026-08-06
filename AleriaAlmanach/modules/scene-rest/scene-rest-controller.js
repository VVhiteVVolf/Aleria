import { CombatProfileResolver } from '../combat/combat-profile-resolver.js?v=20260804-referee-v2';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../combat/combat-state-model.js?v=20260806-encounter-card-v1';
import {
  buildSceneRestParticipant,
  getSceneRestType,
  isSceneRestComment,
  normalizeSceneRest
} from './scene-rest-model.js?v=20260804-referee-v2';
import {
  ensureSceneRestDialog,
  filterSceneRestCandidates,
  renderSceneRestCandidates,
  renderSceneRestComment,
  renderSceneRestPreview,
  SCENE_REST_ICON_URL,
  setSceneRestStatus,
  setSceneRestSubmitting,
  setSceneRestType,
  updateSceneRestSelectionCount
} from './scene-rest-ui.js?v=20260804-referee-v2';

const profileResolver = new CombatProfileResolver();
let activeCandidates = [];
let activeThreadId = '';

function clone(value) {
  if (!value || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function normalizeSearch(value) {
  return String(value || '')
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCurrentThread() {
  return typeof globalThis.getCurrentCommentThread === 'function' ? globalThis.getCurrentCommentThread() : null;
}

function getCachedComments(threadId) {
  const comments = globalThis.getCachedCommentsForThread?.(threadId) || [];
  return typeof globalThis.sortCommentsByTimeline === 'function'
    ? globalThis.sortCommentsByTimeline(comments)
    : comments;
}

function getAvailableActors() {
  try {
    return typeof globalThis.getAvailableCommentCharacters === 'function'
      ? globalThis.getAvailableCommentCharacters()
      : [];
  } catch {
    return [];
  }
}

function actorFromStoredEntry(entry = {}, availableById = new Map()) {
  if (entry.narrator) return null;
  const actorId = String(entry.sceneActorId || entry.actorId || entry.characterId || '').trim();
  const sourceId = String(entry.sceneActorSourceId || entry.creatureId || '').trim();
  if (!actorId) return null;
  const base = availableById.get(sourceId || actorId) || availableById.get(actorId) || null;
  if (!base) return null;
  if (!sourceId || actorId === String(base.id || '')) return clone(base);
  return {
    ...clone(base),
    id: actorId,
    sourceCreatureId: sourceId,
    sceneActorSourceId: sourceId,
    entityType: 'creature',
    name: String(entry.charName || base.name || 'Kreatur'),
    title: String(entry.charTitle || base.title || ''),
    portrait: String(entry.portrait || base.portrait || '')
  };
}

function collectSceneParticipantActors(comments, availableById) {
  const actors = new Map();
  comments.forEach(comment => {
    if (isSceneRestComment(comment)) return;
    const segments = Array.isArray(comment?.commentSegments)
      ? comment.commentSegments.filter(segment => !segment?.narrator && (segment?.sceneActorId || segment?.actorId || segment?.characterId))
      : [];
    const entries = segments.length ? segments : [comment];
    entries.forEach(entry => {
      const actor = actorFromStoredEntry(entry, availableById);
      if (actor?.id) actors.set(String(actor.id), actor);
    });
  });
  return actors;
}

function resolveCandidate(actor, sceneParticipant, combatStates) {
  const actorId = String(actor?.id || '');
  if (!actorId) return null;
  const resolved = profileResolver.resolve(actor);
  const profile = overlayCombatHitPointState(resolved, combatStates.get(actorId) || null);
  const name = String(actor.name || profile.name || 'Unbekannte Figur');
  const title = String(actor.title || '');
  return {
    actor,
    actorId,
    sourceId: String(actor.sourceCreatureId || actor.sceneActorSourceId || ''),
    name,
    title,
    portrait: String(actor.portrait || profile.portrait || ''),
    profile,
    sceneParticipant,
    selected: sceneParticipant,
    searchText: normalizeSearch([name, title, actor.entityType === 'creature' ? 'Kreatur' : 'Charakter'].join(' '))
  };
}

function buildRestCandidates(threadId) {
  const comments = getCachedComments(threadId);
  const available = getAvailableActors();
  const availableById = new Map(available.map(actor => [String(actor?.id || ''), actor]));
  const sceneActors = collectSceneParticipantActors(comments, availableById);
  const combatStates = deriveCombatStateFromComments(comments);
  const result = new Map();
  sceneActors.forEach(actor => {
    const candidate = resolveCandidate(actor, true, combatStates);
    if (candidate) result.set(candidate.actorId, candidate);
  });
  available.forEach(actor => {
    const actorId = String(actor?.id || '');
    if (!actorId || result.has(actorId)) return;
    const candidate = resolveCandidate(actor, false, combatStates);
    if (candidate) result.set(candidate.actorId, candidate);
  });
  return [...result.values()].sort((left, right) => (
    Number(right.sceneParticipant) - Number(left.sceneParticipant)
    || left.name.localeCompare(right.name, 'de')
  ));
}

function parseClock(value) {
  const match = String(value || '').trim().match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (!match) return null;
  return (Number(match[1]) * 3600) + (Number(match[2]) * 60) + Number(match[3] || 0);
}

function formatClock(seconds) {
  const safe = ((Math.floor(seconds) % 86400) + 86400) % 86400;
  return [Math.floor(safe / 3600), Math.floor((safe % 3600) / 60), safe % 60]
    .map(value => String(value).padStart(2, '0'))
    .join(':');
}

function getCurrentTimelineCursor(threadId) {
  const timeline = typeof globalThis.buildSceneTimeline === 'function'
    ? globalThis.buildSceneTimeline(getCachedComments(threadId))
    : [];
  const latest = [...timeline].reverse().find(entry => Number.isFinite(entry?.endSeconds));
  return Number.isFinite(latest?.endSeconds) ? latest.endSeconds : null;
}

function getDialogTimeRange() {
  const day = Math.max(1, Math.floor(Number(document.getElementById('scene-rest-start-day')?.value) || 1));
  const clock = parseClock(document.getElementById('scene-rest-start-time')?.value);
  const restType = getSceneRestType(document.getElementById('scene-rest-type')?.value || 'short');
  const minimumHours = restType.durationSeconds / 3600;
  const hours = Math.max(minimumHours, Math.min(168, Number(document.getElementById('scene-rest-duration-hours')?.value) || minimumHours));
  const startTotalSeconds = ((day - 1) * 86400) + (clock ?? 0);
  const durationSeconds = Math.round(hours * 3600);
  const endTotalSeconds = startTotalSeconds + durationSeconds;
  return {
    valid: clock != null,
    startDay: day,
    startSeconds: clock,
    startTotalSeconds,
    durationSeconds,
    endTotalSeconds,
    endDay: Math.floor(endTotalSeconds / 86400) + 1,
    endSeconds: endTotalSeconds % 86400
  };
}

function getRecoveryDayKey(threadId, day) {
  const date = typeof globalThis.getSceneTimeSegmentAleriaDate === 'function'
    ? globalThis.getSceneTimeSegmentAleriaDate(day)
    : null;
  return date?.year && date?.month && date?.day
    ? `aleria:${date.year}-${date.month}-${date.day}`
    : `scene:${String(threadId || 'unknown')}:day-${day}`;
}

function getSelectedActorIds() {
  return new Set([...document.querySelectorAll('[data-scene-rest-field="participant"]:checked')]
    .map(input => String(input.value || ''))
    .filter(Boolean));
}

function buildDialogPayload() {
  const type = getSceneRestType(document.getElementById('scene-rest-type')?.value || 'short').id;
  const range = getDialogTimeRange();
  const recoveryDayKey = getRecoveryDayKey(activeThreadId, range.endDay);
  const selectedIds = getSelectedActorIds();
  const participants = activeCandidates
    .filter(candidate => selectedIds.has(candidate.actorId))
    .map(candidate => buildSceneRestParticipant(candidate.profile, type, {
      actorId: candidate.actorId,
      sourceId: candidate.sourceId,
      name: candidate.name,
      title: candidate.title,
      portrait: candidate.portrait,
      persistence: candidate.profile.persistence,
      recoveryDayKey,
      dayChanged: range.endDay > range.startDay
    }));
  const definition = getSceneRestType(type);
  const body = String(document.getElementById('scene-rest-body')?.value || definition.description).trim();
  const sceneRest = normalizeSceneRest({
    type,
    durationSeconds: range.durationSeconds,
    title: definition.title,
    body,
    recoveryDayKey,
    dayChanged: range.endDay > range.startDay,
    participants
  });
  const sceneTimeInput = {
    presetKey: type === 'long' ? 'long-rest' : 'short-rest',
    title: sceneRest.title,
    dayLabel: range.endDay !== range.startDay && typeof globalThis.getSceneTimeDefaultSegmentLabel === 'function'
      ? globalThis.getSceneTimeDefaultSegmentLabel(range.endDay)
      : '',
    timeLabel: `${range.durationSeconds / 3600} Std. später · ${formatClock(range.endSeconds)}`,
    body,
    anchorDay: range.endDay,
    anchorSeconds: range.endSeconds,
    segmentBreak: range.endDay !== range.startDay,
    iconUrl: SCENE_REST_ICON_URL
  };
  const normalizedTime = typeof globalThis.normalizeSceneTimeEvent === 'function'
    ? globalThis.normalizeSceneTimeEvent(sceneTimeInput)
    : sceneTimeInput;
  const sceneTimeEvent = typeof globalThis.prepareSceneTimeEventForThread === 'function'
    ? globalThis.prepareSceneTimeEventForThread(normalizedTime, activeThreadId)
    : normalizedTime;
  return { range, sceneRest, sceneTimeEvent };
}

function updateTimeOutput(range) {
  const output = document.getElementById('scene-rest-end-time');
  if (output) output.textContent = range.valid
    ? `Tag ${range.endDay} · ${formatClock(range.endSeconds)}`
    : 'Ungültige Uhrzeit';
}

function updatePreview() {
  const payload = buildDialogPayload();
  updateTimeOutput(payload.range);
  renderSceneRestPreview(payload.sceneRest, payload.sceneTimeEvent);
  updateSceneRestSelectionCount();
}

function setInitialTime(threadId) {
  const cursor = getCurrentTimelineCursor(threadId);
  const start = Number.isFinite(cursor) ? cursor : ((18 * 3600) + (30 * 60));
  const dayInput = document.getElementById('scene-rest-start-day');
  const timeInput = document.getElementById('scene-rest-start-time');
  if (dayInput) dayInput.value = String(Math.floor(start / 86400) + 1);
  if (timeInput) timeInput.value = formatClock(start);
}

function openSceneRestDialog() {
  const thread = getCurrentThread();
  if (!thread || thread.kind !== 'session') {
    globalThis.showAppStatus?.('Rasten ist nur in interaktiven Szenen verfügbar.', 'error');
    return;
  }
  activeThreadId = String(globalThis.getCurrentCommentThreadId?.() || '');
  if (!activeThreadId) return;
  ensureSceneRestDialog();
  activeCandidates = buildRestCandidates(activeThreadId);
  renderSceneRestCandidates(activeCandidates);
  setSceneRestType('short');
  setInitialTime(activeThreadId);
  const search = document.getElementById('scene-rest-participant-search');
  if (search) search.value = '';
  filterSceneRestCandidates('');
  setSceneRestStatus(activeCandidates.some(candidate => candidate.sceneParticipant)
    ? 'Alle bisherigen Szenenfiguren sind vorausgewählt.'
    : 'Noch hat keine Figur in dieser Szene kommentiert. Bitte wähle mindestens eine Figur.');
  updatePreview();
  if (typeof globalThis.activateDialog === 'function') {
    globalThis.activateDialog('scene-rest-overlay', { initialFocus: '[data-scene-rest-action="select-type"], input, button' });
  } else {
    document.getElementById('scene-rest-overlay')?.classList.add('active');
  }
}

function closeSceneRestDialog() {
  if (typeof globalThis.deactivateDialog === 'function') globalThis.deactivateDialog('scene-rest-overlay');
  else document.getElementById('scene-rest-overlay')?.classList.remove('active');
  activeCandidates = [];
  activeThreadId = '';
}

function setParticipantSelection(predicate) {
  document.querySelectorAll('[data-scene-rest-participant]').forEach(row => {
    const candidate = activeCandidates.find(item => item.actorId === row.dataset.restActorId);
    const checkbox = row.querySelector('[data-scene-rest-field="participant"]');
    if (checkbox) checkbox.checked = !!candidate && predicate(candidate);
  });
  updatePreview();
}

function getRestCommentText(rest) {
  const names = rest.participants.map(participant => participant.name).join(', ');
  return [rest.title, rest.body, names ? `Betroffene Figuren: ${names}` : ''].filter(Boolean).join('\n\n');
}

async function submitSceneRest() {
  const { range, sceneRest, sceneTimeEvent } = buildDialogPayload();
  if (!range.valid) {
    setSceneRestStatus('Bitte eine gültige Beginn-Uhrzeit im Format HH:MM:SS angeben.', 'error');
    document.getElementById('scene-rest-start-time')?.focus();
    return;
  }
  if (!sceneRest.participants.length) {
    setSceneRestStatus('Wähle mindestens eine Figur für die Rast aus.', 'error');
    return;
  }
  const metadata = {
    commentMode: 'scene-rest',
    commentKind: 'scene-rest-event',
    sceneRest,
    sceneTimeEvent,
    orderKey: globalThis.getNextCommentOrderKey?.(activeThreadId, null) ?? Date.now()
  };
  setSceneRestSubmitting(true);
  setSceneRestStatus('Rast, Zeitfortschritt und Profilwerte werden gemeinsam gespeichert …');
  try {
    const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
    if (!backend || typeof backend.addSceneRest !== 'function') throw new Error('Der Kommentar-Speicher unterstützt noch keine Rasttransaktionen.');
    const result = await backend.addSceneRest(
      activeThreadId,
      getRestCommentText(sceneRest),
      '7777',
      metadata
    );
    if (Array.isArray(result?.profileUpdates) && result.profileUpdates.length) {
      document.dispatchEvent(new CustomEvent('aleria:combat-profile-committed', { detail: { updates: result.profileUpdates } }));
    }
    const threadId = activeThreadId;
    closeSceneRestDialog();
    globalThis.requestCommentAutoScroll?.(threadId);
    await globalThis.loadCommentsIntoPage?.(threadId, true, { page: 'last' });
    globalThis.loadSidebarFeed?.();
    globalThis.showAppStatus?.('Die Rast wurde eingetragen; Zeit und ausgewählte Profile sind aktualisiert.', 'success');
  } catch (error) {
    console.error('scene rest submit failed:', error);
    const message = typeof globalThis.getFriendlyErrorMessage === 'function'
      ? globalThis.getFriendlyErrorMessage(error, 'Die Rast konnte nicht gespeichert werden.')
      : (error?.message || 'Die Rast konnte nicht gespeichert werden.');
    setSceneRestStatus(message, 'error');
  } finally {
    setSceneRestSubmitting(false);
  }
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-scene-rest-action]');
  if (!trigger) return;
  const action = trigger.dataset.sceneRestAction;
  if (action === 'open') openSceneRestDialog();
  if (action === 'close') closeSceneRestDialog();
  if (action === 'select-type') {
    setSceneRestType(trigger.dataset.restType || 'short');
    updatePreview();
  }
  if (action === 'select-scene') setParticipantSelection(candidate => candidate.sceneParticipant);
  if (action === 'clear-participants') setParticipantSelection(() => false);
  if (action === 'submit') void submitSceneRest();
});

document.addEventListener('input', event => {
  if (!event.target?.closest?.('#scene-rest-overlay')) return;
  if (event.target.matches('[data-scene-rest-field="search"]')) {
    filterSceneRestCandidates(event.target.value);
    return;
  }
  if (event.target.matches('[data-scene-rest-field]')) updatePreview();
});

document.addEventListener('change', event => {
  if (event.target?.matches?.('[data-scene-rest-field="participant"]')) updatePreview();
});

globalThis.AleriaSceneRest = Object.freeze({
  isComment: isSceneRestComment,
  normalize: normalizeSceneRest,
  open: openSceneRestDialog,
  renderComment: renderSceneRestComment
});
