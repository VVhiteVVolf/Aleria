import { overlayCombatHitPointState } from '../combat/combat-state-model.js?v=20260928-equipment-art-v4';
import { resolveGroupRoster, groupMemberRecordId } from './group-landing-roster.js';
import { appendGroupCompanions } from './group-landing-companions.js';
import { resolveCombatProfile } from '../combat/combat-profile-resolver.js';
import { deriveGroupSceneStates } from './group-scene-state.js';
import { projectGroupReadiness } from './group-landing-combat.js';
import { collectGroupScenes, projectGroupScene } from './group-landing-scenes.js';

export function groupCharacters() {
  return globalThis.getAvailableCommentCharacters?.() || globalThis.getVisibleCharacterRecords?.() || [];
}

export function groupCreatures() { return globalThis.AleriaCreatures?.getAll?.() || []; }

export function groupScenes() {
  return collectGroupScenes(globalThis.getAllSections?.() || []);
}

export function groupSceneSnapshot(scene, comments) {
  return projectGroupScene(scene, comments, { calendar: globalThis.AleriaCalendar,
    resolveStart: globalThis.AleriaSceneDateDefaults?.resolve, timeline: globalThis.buildSceneTimeline });
}

export function groupMemberSnapshots(entry, group, comments = []) {
  const characters = groupCharacters();
  const creatures = groupCreatures();
  // Ordinary committed speech advances contribution clocks as well. Imported
  // or undone receipts must not seed or advance any current group state.
  const trusted = comments.filter(comment => !comment.importedHistoricalMechanics && !comment.mechanicalUndone && !comment.undoneAt
    && (comment.serverValidatedMechanics === true || comment.serverCommitted === true));
  const ordered = globalThis.sortCommentsByTimeline?.(trusted) || [...trusted].sort((a,b) => Number(a.orderKey || a.createdAtClient || 0) - Number(b.orderKey || b.createdAtClient || 0));
  const states = ordered.length ? deriveGroupSceneStates(ordered) : new Map();
  const people = resolveGroupRoster(entry, group, characters, creatures);
  const roster = group.includeCompanions === false ? people : appendGroupCompanions(people, characters, creatures);
  return roster.map(member => {
    const recordId = groupMemberRecordId(member);
    const character = (member.kind === 'creature' ? creatures : characters).find(record => record.id === recordId);
    const hasSheet = character?.combatProfile && Object.keys(character.combatProfile).length > 0;
    const base = hasSheet ? (member.kind !== 'creature' && globalThis.AleriaCombat?.getProfile?.(recordId))
      || resolveCombatProfile(character, { id: recordId, entityType: member.kind === 'creature' ? 'creature' : 'character' }) : null;
    const profile = base ? overlayCombatHitPointState(base, states.get(`${member.kind || 'character'}:${recordId}`)) : null;
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
