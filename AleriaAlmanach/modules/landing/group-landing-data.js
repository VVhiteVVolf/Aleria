import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../combat/combat-state-model.js?v=20260928-equipment-art-v4';
import { resolveGroupRoster } from './group-landing-roster.js';
import { projectGroupReadiness } from './group-landing-combat.js';
import { collectGroupScenes, projectGroupScene } from './group-landing-scenes.js';

export function groupCharacters() {
  return globalThis.getAvailableCommentCharacters?.() || globalThis.getVisibleCharacterRecords?.() || [];
}

export function groupScenes() {
  return collectGroupScenes(globalThis.getAllSections?.() || []);
}

export function groupSceneSnapshot(scene, comments) {
  return projectGroupScene(scene, comments, { calendar: globalThis.AleriaCalendar,
    resolveStart: globalThis.AleriaSceneDateDefaults?.resolve, timeline: globalThis.buildSceneTimeline });
}

export function groupMemberSnapshots(entry, group, comments = []) {
  const characters = groupCharacters();
  const ordered = globalThis.sortCommentsByTimeline?.(comments) || comments;
  const states = ordered.length ? deriveCombatStateFromComments(ordered) : new Map();
  return resolveGroupRoster(entry, group, characters).map(member => {
    const character = characters.find(record => record.id === member.characterId);
    const hasSheet = character?.combatProfile && Object.keys(character.combatProfile).length > 0;
    const base = hasSheet ? globalThis.AleriaCombat?.getProfile?.(member.characterId) : null;
    const profile = base ? overlayCombatHitPointState(base, states.get(member.characterId)) : null;
    return { ...member, portrait: member.portrait || character?.portrait || '',
      className: profile?.classLabel || profile?.className || character?.combatProfile?.className || '',
      readiness: projectGroupReadiness(member, profile) };
  });
}

// Read through the existing comment gateway, with one owned subscription per mount.
export function observeGroupScene(threadId, onNext, onError, getBackend = () => globalThis.getCommentBackend?.()) {
  let closed = false, unsubscribe = null;
  const cached = globalThis.getCachedCommentsForThread?.(threadId);
  if (Array.isArray(cached) && cached.length) onNext(cached, 'cached');
  (async () => {
    try {
      const backend = await getBackend();
      if (closed) return;
      if (!backend?.loadComments) throw new Error('Szenenverbindung ist noch nicht verfügbar.');
      // Subscribe before loading; a delayed initial read must not replace a newer push.
      let pushed = false;
      unsubscribe = backend.subscribeComments?.(threadId, comments => {
        if (closed) return; pushed = true; onNext(comments || [], 'live');
      }, error => { if (!closed) onError(error); });
      const comments = await backend.loadComments(threadId);
      if (!closed && !pushed) onNext(comments || [], backend.subscribeComments ? 'live' : 'loaded');
    } catch (error) { if (!closed) onError(error); }
  })();
  return () => { closed = true; unsubscribe?.(); };
}
