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
        boardBindings: Array.isArray(source.boardBindings) ? source.boardBindings : [],
        boardLayoutUpdates: Array.isArray(source.boardLayoutUpdates) ? source.boardLayoutUpdates : [] };
    } catch (error) {
      console.warn('[authored-notices] Zusätzliche Aushänge konnten nicht geladen werden:', error);
      window.setTimeout(() => window.TafelRuntime?.toast?.('Zusätzliche Aushänge konnten nicht geladen werden. Bitte die Tafel erneut öffnen.'), 0);
      return { zettel: [], updates: [] };
    }
  }

  function merge(state, source) {
    const notices = Array.isArray(source) ? source : source?.zettel || [];
    if (!notices.length && !source?.updates?.length && !source?.boardLayoutUpdates?.length) return state;
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
          const commentId = /^comments\.([a-z0-9-]+)\.text$/.exec(change.field)?.[1];
          const comment = commentId && updated.comments?.find(comment => comment.id === commentId);
          if (commentId && !comment) continue;
          if (!mediaKey && !commentId && !['text', 'portrait', 'verfasser', 'verfasserName', 'emblem', 'unterschrift', 'siegel', 'noticeGroupId'].includes(change.field)) continue;
          if (!Object.hasOwn(change, 'to')) continue;
          const current = commentId ? comment.text : mediaKey ? updated.media?.[mediaKey] : updated[change.field];
          const empty = current === undefined || current === null || (typeof current === 'string' && !current.trim());
          const matches = change.fillEmpty ? empty : change.missing ? current === undefined : current === change.from;
          if (!matches || current === change.to) continue;
          if (change.fillEmpty && (change.field === 'siegel' || mediaKey === 'siegel') && updated.sealPreset && updated.sealPreset !== 'auto') continue;
          // Formatting belongs to the replacement image, never to a custom one.
          if (change.fillEmpty && mediaKey && updated[mediaKey] !== change.to?.src) continue;
          if (updated === zettel[index]) updated = { ...updated };
          if (commentId) updated.comments = updated.comments.map(reply => reply.id === commentId ? { ...reply, text: change.to } : reply);
          else if (mediaKey) updated.media = { ...updated.media, [mediaKey]: JSON.parse(JSON.stringify(change.to)) };
          else updated[change.field] = change.to;
        }
        zettel[index] = updated;
      }
      appliedUpdates.add(update.id);
    }
    const boardLayout = updateBoardLayout(bindAddedNotices(state?.boardLayout, source.boardBindings, additions), source.boardLayoutUpdates, appliedUpdates);
    return { ...state, zettel, ...(boardLayout ? { boardLayout } : {}), appliedAuthoredNoticeIds: [...applied],
      ...(appliedUpdates.size ? { appliedAuthoredUpdateIds: [...appliedUpdates] } : {}) };
  }

  // Correct only an unchanged published default, once. User placement, pin
  // positions, deliberate removals and independently chosen sizes stay intact.
  function updateBoardLayout(layout, updates, applied) {
    let next = layout;
    for (const update of updates || []) {
      if (typeof update?.id !== 'string' || applied.has(update.id)) continue;
      const valid = update.field === 'width' && Number.isFinite(update.from)
        && Number.isFinite(update.to) && update.to > 0 && update.to <= 1;
      const index = valid && next?.posters?.findIndex(poster => poster.id === update.posterId
        && poster.assetId === update.assetId && poster.width === update.from);
      if (valid && Number.isInteger(index) && index >= 0) {
        if (next === layout) next = { ...layout, posters: [...layout.posters] };
        next.posters[index] = { ...next.posters[index], width: update.to };
      }
      applied.add(update.id);
    }
    return next;
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
      if (index < 0) {
        // A newly authored publication may bring its own new paper once. An
        // explicitly emptied board and deliberately removed/acknowledged
        // publications remain untouched on subsequent loads.
        const paper = binding.poster;
        if (!paper || !next.posters.length || next.posters.length >= 500
          || paper.id !== binding.posterId || paper.assetId !== binding.assetId
          || next.posters.some(poster => poster.id === binding.posterId)) continue;
        if (next === layout) next = { ...layout, posters: [...layout.posters] };
        next.posters.push({ ...JSON.parse(JSON.stringify(paper)), noticeId: binding.noticeId,
          layer: Math.max(Number(paper.layer) || 0, ...next.posters.map(poster => Number(poster.layer) || 0)) + 1,
          pin: { ...paper.pin, enabled: true } });
        continue;
      }
      if (next === layout) next = { ...layout, posters: [...layout.posters] };
      const poster = next.posters[index];
      next.posters[index] = { ...poster, noticeId: binding.noticeId, pin: { ...poster.pin, enabled: true } };
    }
    return next;
  }

  window.TafelAuthoredNotices = Object.freeze({ load, merge });
})();
