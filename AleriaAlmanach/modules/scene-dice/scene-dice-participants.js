import { loadActiveSceneSnapshot } from './scene-dice-scene-context.js?v=20260803-system-audit-v1';

const SCENE_DICE_ROLLER_STORAGE_KEY = 'aleria.scene-dice.roller.v2';
const SCENE_DICE_NARRATOR_ID = '__narrator__';
const SCENE_DICE_SYSTEM_MODES = new Set([
  'scene-dice',
  'scene-time',
  'scene-transition',
  'scene-poll',
  'scene-inventory'
]);

function normalizeParticipantKey(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('de');
}

function getCommentSpeakerRefs(comment = {}) {
  if (SCENE_DICE_SYSTEM_MODES.has(String(comment.commentMode || '').trim())) return [];
  const refs = [];
  const addRef = (characterId, name, narrator = false, metadata = {}) => {
    if (narrator) return;
    const id = String(characterId || '').trim();
    const safeName = String(name || '').trim();
    if (id || safeName) refs.push({
      id,
      name: safeName,
      sourceCharacterId: String(metadata.sourceCharacterId || '').trim(),
      entityType: String(metadata.entityType || '').trim(),
      portrait: String(metadata.portrait || '').trim(),
      title: String(metadata.title || '').trim(),
      combatTeam: String(metadata.combatTeam || '').trim()
    });
  };

  addRef(
    comment.characterId,
    comment.charName,
    !!comment.narrator || String(comment.commentMode || '') === 'narrator'
  );
  (Array.isArray(comment.commentSegments) ? comment.commentSegments : []).forEach(segment => {
    addRef(
      segment?.sceneActorId || segment?.characterId || comment.characterId,
      segment?.charName || segment?.name || comment.charName,
      !!segment?.narrator || String(segment?.kind || segment?.commentKind || '') === 'narrator',
      {
        sourceCharacterId: segment?.sceneActorSourceId || segment?.creatureId || segment?.characterId || comment.characterId,
        entityType: segment?.sceneActorId ? 'creature' : (segment?.actorType || comment.actorType),
        portrait: segment?.portrait || comment.portrait,
        title: segment?.charTitle || comment.charTitle,
        combatTeam: segment?.combatTeam
      }
    );
  });

  const seen = new Set();
  return refs.filter(ref => {
    const key = ref.id ? `id:${ref.id}` : `name:${normalizeParticipantKey(ref.name)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function rankSceneDiceParticipants(characters = [], comments = [], castIds = []) {
  const activityById = new Map();
  const activityByName = new Map();
  const sceneInstances = new Map();
  (Array.isArray(comments) ? comments : []).forEach((comment, commentIndex) => {
    getCommentSpeakerRefs(comment).forEach(ref => {
      const previous = (ref.id && activityById.get(ref.id))
        || activityByName.get(normalizeParticipantKey(ref.name))
        || { count: 0, lastIndex: -1 };
      const activity = { count: previous.count + 1, lastIndex: commentIndex };
      if (ref.id) activityById.set(ref.id, activity);
      const nameKey = normalizeParticipantKey(ref.name);
      if (nameKey) activityByName.set(nameKey, activity);
      if (ref.id && ref.sourceCharacterId && ref.id !== ref.sourceCharacterId) {
        sceneInstances.set(ref.id, { ...(sceneInstances.get(ref.id) || {}), ...ref });
      }
    });
  });

  const castOrder = new Map((Array.isArray(castIds) ? castIds : [])
    .map((id, index) => [String(id || '').trim(), index])
    .filter(([id]) => id));

  const sourceCharacters = Array.isArray(characters) ? characters : [];
  const characterById = new Map(sourceCharacters.map(character => [String(character?.id || '').trim(), character]));
  const instanceCharacters = [...sceneInstances.values()].map(instance => {
    const source = characterById.get(instance.sourceCharacterId) || {};
    return {
      ...source,
      ...instance,
      id: instance.id,
      sourceCharacterId: instance.sourceCharacterId,
      entityType: instance.entityType || source.entityType || 'creature',
      name: instance.name || source.name || 'Kreatur',
      portrait: instance.portrait || source.portrait || '',
      title: instance.title || source.title || ''
    };
  });

  return [...sourceCharacters, ...instanceCharacters]
    .map(character => {
      const id = String(character?.id || '').trim();
      const name = String(character?.name || '').trim();
      const activity = activityById.get(id) || activityByName.get(normalizeParticipantKey(name)) || null;
      const castIndex = castOrder.has(id) ? castOrder.get(id) : Number.POSITIVE_INFINITY;
      return {
        ...character,
        id,
        name,
        sceneActivityCount: activity?.count || 0,
        sceneActivityIndex: activity?.lastIndex ?? -1,
        scenePriority: activity ? 0 : (Number.isFinite(castIndex) ? 1 : 2),
        sceneCastIndex: castIndex
      };
    })
    .filter(character => character.id || character.name)
    .sort((a, b) => {
      if (a.scenePriority !== b.scenePriority) return a.scenePriority - b.scenePriority;
      if (a.scenePriority === 0 && a.sceneActivityIndex !== b.sceneActivityIndex) {
        return b.sceneActivityIndex - a.sceneActivityIndex;
      }
      if (a.scenePriority === 0 && a.sceneActivityCount !== b.sceneActivityCount) {
        return b.sceneActivityCount - a.sceneActivityCount;
      }
      if (a.scenePriority === 1 && a.sceneCastIndex !== b.sceneCastIndex) {
        return a.sceneCastIndex - b.sceneCastIndex;
      }
      return a.name.localeCompare(b.name, 'de', { sensitivity: 'base' });
    });
}

function readStoredSceneDiceRoller() {
  try {
    const stored = JSON.parse(localStorage.getItem(SCENE_DICE_ROLLER_STORAGE_KEY) || 'null');
    if (stored && typeof stored === 'object') {
      return {
        id: String(stored.id || ''),
        name: String(stored.name || ''),
        sourceCharacterId: String(stored.sourceCharacterId || '')
      };
    }
    const legacyName = String(localStorage.getItem('aleria-scene-dice-roller-v1') || '').trim();
    return legacyName ? { id: '', name: legacyName } : null;
  } catch {
    return null;
  }
}

function storeSceneDiceRoller(selection) {
  try {
    localStorage.setItem(SCENE_DICE_ROLLER_STORAGE_KEY, JSON.stringify({
      id: selection.id || '',
      name: selection.name || '',
      sourceCharacterId: selection.sourceCharacterId || ''
    }));
  } catch { /* localStorage may be blocked */ }
}

function getParticipantPortrait(character) {
  const source = String(character?.portrait || '').trim();
  if (!source) return '';
  return typeof window.sanitizeImageSrc === 'function' ? window.sanitizeImageSrc(source) : source;
}

function getParticipantInitial(name) {
  return String(name || '?').trim().charAt(0).toLocaleUpperCase('de') || '?';
}

const participantState = {
  participants: [],
  selected: null,
  snapshot: null,
  query: '',
  open: false,
  loading: false
};

function getParticipantById(id) {
  return participantState.participants.find(participant => participant.id === String(id || '')) || null;
}

function chooseInitialParticipant() {
  const stored = readStoredSceneDiceRoller();
  const storedMatch = stored && participantState.participants.find(participant =>
    (stored.id && participant.id === stored.id)
    || normalizeParticipantKey(participant.name) === normalizeParticipantKey(stored.name)
  );
  const active = participantState.participants.find(participant => participant.scenePriority === 0);
  return storedMatch && storedMatch.scenePriority === 0
    ? storedMatch
    : active || storedMatch || participantState.participants[0] || null;
}

function renderParticipantAvatar(participant, className) {
  const portrait = getParticipantPortrait(participant);
  const safeName = escapeHtml(participant?.name || 'Erzähler');
  return portrait
    ? `<img class="${className}" src="${escapeHtml(portrait)}" alt="" loading="lazy" decoding="async">`
    : `<span class="${className} placeholder" aria-hidden="true">${escapeHtml(getParticipantInitial(participant?.name || 'Erzähler'))}</span>`;
}

function getParticipantGroupLabel(participant) {
  if (participant.id === SCENE_DICE_NARRATOR_ID) return 'Erzähler und Umgebung';
  if (participant.scenePriority === 0) return 'Gerade in dieser Szene aktiv';
  if (participant.entityType === 'creature') return 'Kreaturen & NSCs';
  if (participant.scenePriority === 1) return 'Szenenbesetzung';
  return 'Weitere Figuren';
}

function renderSceneDiceParticipantList() {
  const target = document.querySelector('[data-scene-dice-participant-list]');
  if (!target) return;
  const query = normalizeParticipantKey(participantState.query);
  const visible = participantState.participants.filter(participant => {
    if (!query) return true;
    return [participant.name, participant.title, ...(participant.aliases || [])]
      .some(value => normalizeParticipantKey(value).includes(query));
  });
  if (!visible.length) {
    target.innerHTML = '<p class="scene-dice-participant-empty">Keine passende Figur gefunden.</p>';
    return;
  }

  let lastGroup = '';
  target.innerHTML = visible.map(participant => {
    const group = getParticipantGroupLabel(participant);
    const groupMarkup = group !== lastGroup
      ? `<div class="scene-dice-participant-group">${escapeHtml(group)}</div>`
      : '';
    lastGroup = group;
    const selected = participantState.selected?.id === participant.id;
    const status = participant.scenePriority === 0
      ? `${participant.sceneActivityCount} ${participant.sceneActivityCount === 1 ? 'Beitrag' : 'Beiträge'} im Verlauf`
      : (participant.title || group);
    return `${groupMarkup}<button class="scene-dice-participant${selected ? ' selected' : ''}" type="button" data-scene-dice-action="select-roller" data-character-id="${escapeHtml(participant.id)}" aria-pressed="${selected}">
      ${renderParticipantAvatar(participant, 'scene-dice-participant-avatar')}
      <span><strong>${escapeHtml(participant.name)}</strong><small>${escapeHtml(status)}</small></span>
      ${participant.scenePriority === 0 ? '<b>aktiv</b>' : ''}
    </button>`;
  }).join('');
}

function renderSceneDiceParticipantSelection() {
  const participant = participantState.selected;
  const trigger = document.querySelector('[data-scene-dice-roller-trigger]');
  const input = document.getElementById('scene-dice-roller');
  if (input) input.value = participant?.name || '';
  if (trigger) {
    const secondary = participant?.scenePriority === 0
      ? 'Aktiv in dieser Szene'
      : (participant?.title || getParticipantGroupLabel(participant || {}));
    trigger.innerHTML = `${renderParticipantAvatar(participant, 'scene-dice-roller-avatar')}<span><strong>${escapeHtml(participant?.name || 'Figur wählen')}</strong><small>${escapeHtml(secondary)}</small></span><i aria-hidden="true">⌄</i>`;
    trigger.setAttribute('aria-expanded', String(participantState.open));
  }
  const picker = document.querySelector('[data-scene-dice-participant-picker]');
  if (picker) picker.hidden = !participantState.open;
  renderSceneDiceParticipantList();
}

async function refreshSceneDiceParticipants() {
  participantState.loading = true;
  const list = document.querySelector('[data-scene-dice-participant-list]');
  if (list) list.innerHTML = '<p class="scene-dice-participant-empty">Aktive Szene wird gelesen …</p>';
  const snapshot = await loadActiveSceneSnapshot();
  let characters = [];
  try {
    if (typeof getAvailableCommentCharacters === 'function') characters = getAvailableCommentCharacters();
  } catch (error) {
    console.warn('scene dice characters unavailable:', error);
  }
  const castIds = typeof getCurrentCommentCastIds === 'function' ? getCurrentCommentCastIds() : [];
  const ranked = rankSceneDiceParticipants(characters, snapshot.comments, castIds);
  const narrator = {
    id: SCENE_DICE_NARRATOR_ID,
    name: 'Erzähler',
    title: 'Umgebung oder Schicksal',
    portrait: '',
    scenePriority: 0.5,
    sceneActivityCount: 0,
    sceneActivityIndex: -1
  };
  const active = ranked.filter(participant => participant.scenePriority === 0);
  const remainder = ranked.filter(participant => participant.scenePriority !== 0);
  participantState.participants = [...active, narrator, ...remainder];
  participantState.snapshot = snapshot;
  participantState.selected = chooseInitialParticipant();
  participantState.loading = false;
  renderSceneDiceParticipantSelection();
  return snapshot;
}

function toggleSceneDiceParticipantPicker(force) {
  participantState.open = typeof force === 'boolean' ? force : !participantState.open;
  renderSceneDiceParticipantSelection();
  if (participantState.open) {
    requestAnimationFrame(() => document.querySelector('[data-scene-dice-participant-search]')?.focus());
  }
}

function selectSceneDiceParticipant(id) {
  const participant = getParticipantById(id);
  if (!participant) return null;
  participantState.selected = participant;
  participantState.open = false;
  participantState.query = '';
  const search = document.querySelector('[data-scene-dice-participant-search]');
  if (search) search.value = '';
  storeSceneDiceRoller(participant);
  renderSceneDiceParticipantSelection();
  return participant;
}

function filterSceneDiceParticipants(query) {
  participantState.query = String(query || '');
  renderSceneDiceParticipantList();
}

function getSceneDiceParticipantSelection() {
  const inputName = String(document.getElementById('scene-dice-roller')?.value || '').trim();
  if (inputName && normalizeParticipantKey(inputName) !== normalizeParticipantKey(participantState.selected?.name)) {
    const matched = participantState.participants.find(participant =>
      normalizeParticipantKey(participant.name) === normalizeParticipantKey(inputName)
    );
    return matched || { id: '', name: inputName, title: '', scenePriority: 2 };
  }
  return participantState.selected || { id: '', name: inputName || 'Erzähler', title: '', scenePriority: 2 };
}

function resetSceneDiceParticipantPicker() {
  participantState.open = false;
  participantState.query = '';
  return refreshSceneDiceParticipants();
}

if (typeof window !== 'undefined') {
  window.AleriaSceneDiceParticipants = {
    refresh: refreshSceneDiceParticipants,
    reset: resetSceneDiceParticipantPicker,
    toggle: toggleSceneDiceParticipantPicker,
    select: selectSceneDiceParticipant,
    filter: filterSceneDiceParticipants,
    getSelection: getSceneDiceParticipantSelection,
    getSnapshot: () => participantState.snapshot,
    isLoading: () => participantState.loading
  };
}
