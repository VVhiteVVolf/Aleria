// Repository-authored notices are additive to a board's published or local
// state. Once acknowledged, deleting one in the editor must remain effective.
(function () {
  'use strict';

  async function load(path) {
    if (!path) return { zettel: [], updates: [] };
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const source = await response.json();
      if (!Array.isArray(source.zettel)) throw new Error('Aushangliste fehlt.');
      return { zettel: source.zettel.filter(notice => typeof notice?.id === 'string' && notice.id),
        updates: Array.isArray(source.updates) ? source.updates : [],
        boardBindings: Array.isArray(source.boardBindings) ? source.boardBindings : [] };
    } catch (error) {
      console.warn('[authored-notices] Zusätzliche Aushänge konnten nicht geladen werden:', error);
      window.setTimeout(() => window.TafelRuntime?.toast?.('Zusätzliche Aushänge konnten nicht geladen werden. Bitte die Tafel erneut öffnen.'), 0);
      return { zettel: [], updates: [] };
    }
  }

  function merge(state, source) {
    const notices = Array.isArray(source) ? source : source?.zettel || [];
    if (!notices.length && !source?.updates?.length) return state;
    const existing = Array.isArray(state?.zettel) ? state.zettel : [];
    const ids = new Set(existing.map(notice => notice.id));
    const applied = new Set(Array.isArray(state?.appliedAuthoredNoticeIds) ? state.appliedAuthoredNoticeIds : []);
    const additions = [];
    for (const notice of notices) {
      if (!ids.has(notice.id) && !applied.has(notice.id)) {
        additions.push(JSON.parse(JSON.stringify(notice)));
        ids.add(notice.id);
      }
      applied.add(notice.id);
    }
    const appliedUpdates = new Set(Array.isArray(state?.appliedAuthoredUpdateIds) ? state.appliedAuthoredUpdateIds : []);
    const zettel = [...existing, ...additions];
    for (const update of source.updates || []) {
      if (typeof update?.id !== 'string' || appliedUpdates.has(update.id)) continue;
      const index = zettel.findIndex(notice => notice.id === update.noticeId);
      if (index >= 0) {
        let updated = zettel[index];
        for (const change of update.fields || []) {
          const mediaKey = /^media\.(verfasser|portrait|emblem|unterschrift|siegel)$/.exec(change.field)?.[1];
          if (!mediaKey && !['text', 'portrait', 'verfasser', 'verfasserName', 'emblem', 'unterschrift', 'siegel', 'noticeGroupId'].includes(change.field)) continue;
          if (!Object.hasOwn(change, 'to')) continue;
          const current = mediaKey ? updated.media?.[mediaKey] : updated[change.field];
          const empty = current === undefined || current === null || (typeof current === 'string' && !current.trim());
          const matches = change.fillEmpty ? empty : change.missing ? current === undefined : current === change.from;
          if (!matches || current === change.to) continue;
          if (change.fillEmpty && (change.field === 'siegel' || mediaKey === 'siegel') && updated.sealPreset && updated.sealPreset !== 'auto') continue;
          // Formatting belongs to the replacement image, never to a custom one.
          if (change.fillEmpty && mediaKey && updated[mediaKey] !== change.to?.src) continue;
          if (updated === zettel[index]) updated = { ...updated };
          if (mediaKey) updated.media = { ...updated.media, [mediaKey]: JSON.parse(JSON.stringify(change.to)) };
          else updated[change.field] = change.to;
        }
        zettel[index] = updated;
      }
      appliedUpdates.add(update.id);
    }
    const boardLayout = bindAddedNotices(state?.boardLayout, source.boardBindings, additions);
    return { ...state, zettel, ...(boardLayout ? { boardLayout } : {}), appliedAuthoredNoticeIds: [...applied],
      ...(appliedUpdates.size ? { appliedAuthoredUpdateIds: [...appliedUpdates] } : {}) };
  }

  // A new authored notice may claim an existing decorative paper once. Saved
  // placements, other content, deliberate unlinking and deletions keep precedence.
  function bindAddedNotices(layout, bindings, additions) {
    if (!layout?.posters || !Array.isArray(bindings) || !additions.length) return layout;
    const addedIds = new Set(additions.map(notice => notice.id));
    let next = layout;
    for (const binding of bindings) {
      if (!binding || !addedIds.has(binding.noticeId) || next.posters.some(poster => poster.noticeId === binding.noticeId)) continue;
      const index = next.posters.findIndex(poster => poster.id === binding.posterId && poster.assetId === binding.assetId && !poster.noticeId);
      if (index < 0) continue;
      if (next === layout) next = { ...layout, posters: [...layout.posters] };
      const poster = next.posters[index];
      next.posters[index] = { ...poster, noticeId: binding.noticeId, pin: { ...poster.pin, enabled: true } };
    }
    return next;
  }

  window.TafelAuthoredNotices = Object.freeze({ load, merge });
})();
