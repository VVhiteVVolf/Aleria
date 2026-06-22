const SCENE_TRANSITION_KIND = 'scene-transition-event';

const SCENE_TRANSITION_ICON_PRESETS = [
  { key: 'general', label: 'Genereller Wechsel', url: 'https://i.imgur.com/GCe66kc.png' },
  { key: 'leave-city', label: 'Verlassen der Stadt', url: 'https://i.imgur.com/UgeuKbc.png' },
  { key: 'long-journey', label: 'Weite Reise', url: 'https://i.imgur.com/JL0o9sm.png' },
  { key: 'place-to-place', label: 'Reise von Ort zu Ort', url: 'https://i.imgur.com/N620hO2.png' },
  { key: 'short-journey', label: 'Kurze Reise', url: 'https://i.imgur.com/Mk4r9e5.png' },
  { key: 'short-hike', label: 'Kurze Wanderschaft', url: 'https://i.imgur.com/Tfv0C59.png' },
  { key: 'ride', label: 'Ausritt', url: 'https://i.imgur.com/U7SURy7.png' },
  { key: 'countryside', label: 'Reise aufs Land', url: 'https://i.imgur.com/ELCCyeS.png' },
  { key: 'sea-voyage', label: 'Reise zu See', url: 'https://i.imgur.com/WuYtlmQ.png' },
  { key: 'spatial', label: 'Räumlicher Wechsel', url: 'https://i.imgur.com/s9Bm8cC.png' }
];

function getSceneTransitionIconPreset(key = 'general') {
  return SCENE_TRANSITION_ICON_PRESETS.find(preset => preset.key === key) || SCENE_TRANSITION_ICON_PRESETS[0];
}

function getSceneTransitionIconPresets() {
  return SCENE_TRANSITION_ICON_PRESETS.map(preset => ({ ...preset }));
}

function normalizeSceneTransitionIcon(input = {}) {
  const preset = getSceneTransitionIconPreset(input.key || input.iconKey || 'general');
  return {
    key: preset.key,
    label: preset.label,
    url: typeof normalizeImageUrlForStorage === 'function'
      ? (normalizeImageUrlForStorage(preset.url) || '')
      : preset.url
  };
}

function normalizeSceneTransitionText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

function normalizeSceneTransitionCharacters(characters) {
  if (!Array.isArray(characters)) return [];
  const seen = new Set();
  return characters.map(character => {
    const id = String(character?.id || '').trim();
    if (!id || seen.has(id)) return null;
    seen.add(id);
    return {
      id,
      name: normalizeSceneTransitionText(character?.name, 'Unbekannt'),
      portrait: typeof normalizeImageUrlForStorage === 'function'
        ? (normalizeImageUrlForStorage(character?.portrait || '') || '')
        : String(character?.portrait || '').trim()
    };
  }).filter(Boolean);
}

function getSceneTransitionCharacterPortrait(character) {
  return String(character?.portrait || character?.emotes?.find(emote => emote?.img)?.img || '').trim();
}

function normalizeSceneTransitionEndpoint(endpoint = {}) {
  return {
    threadId: String(endpoint.threadId || '').trim(),
    entryId: String(endpoint.entryId || '').trim(),
    entryTitle: normalizeSceneTransitionText(endpoint.entryTitle, 'Unbenannte Szene'),
    pageTitle: normalizeSceneTransitionText(endpoint.pageTitle, endpoint.entryTitle || 'Unbenannte Szene')
  };
}

function normalizeSceneTransition(input = {}) {
  return {
    kind: SCENE_TRANSITION_KIND,
    transitionId: String(input.transitionId || '').trim(),
    source: normalizeSceneTransitionEndpoint(input.source),
    target: normalizeSceneTransitionEndpoint(input.target),
    flavourText: normalizeSceneTransitionText(input.flavourText || input.text),
    icon: normalizeSceneTransitionIcon(input.icon || { iconKey: input.iconKey }),
    characters: normalizeSceneTransitionCharacters(input.characters),
    schemaVersion: 1
  };
}

function isSceneTransitionComment(comment) {
  return !!(
    comment?.sceneTransition ||
    comment?.commentKind === SCENE_TRANSITION_KIND ||
    comment?.commentMode === 'scene-transition'
  );
}

function dedupeSceneTransitionComments(comments) {
  if (!Array.isArray(comments)) return [];
  const seenTransitionIds = new Set();
  return comments.filter(comment => {
    const transitionId = String(comment?.sceneTransition?.transitionId || '').trim();
    if (!transitionId) return true;
    if (seenTransitionIds.has(transitionId)) return false;
    seenTransitionIds.add(transitionId);
    return true;
  });
}

function makeSceneTransitionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `transition-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSceneTransitionEndpoints() {
  const endpointsByThread = new Map();
  if (typeof getValidSections !== 'function') return [];
  getValidSections().forEach(section => {
    (section.entries || []).forEach(rawEntry => {
      const entry = typeof getRenderableEntry === 'function' ? getRenderableEntry(rawEntry) : rawEntry;
      if (!entry?.id || typeof getPages !== 'function') return;
      getPages(entry).forEach((page, pageIndex) => {
        if (!page?.sessionPage) return;
        const pageKey = getPageCommentThreadKey(page, pageIndex);
        const endpoint = normalizeSceneTransitionEndpoint({
          threadId: getSessionThreadId(entry.id, pageKey),
          entryId: entry.id,
          entryTitle: entry.title,
          pageTitle: page.pageTitle || entry.title
        });
        if (!endpointsByThread.has(endpoint.threadId)) endpointsByThread.set(endpoint.threadId, endpoint);
      });
    });
  });
  return Array.from(endpointsByThread.values());
}

function getCurrentSceneTransitionEndpoint() {
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  if (!thread || thread.kind !== 'session') return null;
  return normalizeSceneTransitionEndpoint({
    threadId: thread.threadId,
    entryId: thread.entry?.id,
    entryTitle: thread.entry?.title,
    pageTitle: thread.page?.pageTitle || thread.entry?.title
  });
}
