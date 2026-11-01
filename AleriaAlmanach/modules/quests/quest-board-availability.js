import { isNoticeDate, noticeDate, publicationDate, hasAppeared } from '../../../Anzeigetafeln/assets/js/timeline/notice-dates.mjs';
import { isArchivedAt } from '../../../Anzeigetafeln/assets/js/archive/notice-archive-model.mjs';

// A source window is a read-only projection, not a quest run or a new closure
// rule. Keep the paper's dated history so a restored notice can reappear.
export function questBoardAvailability(archive, notices) {
  const ids = new Set(notices.map(notice => notice.id));
  return {
    notices: notices.map(notice => ({ id: notice.id, publishedOn: publicationDate(notice) })),
    archive: { entries: archive.entries.filter(entry => entry.noticeIds.some(id => ids.has(id)))
      .map(({ noticeIds, archivedOn, restoredOn }) => ({ noticeIds: noticeIds.filter(id => ids.has(id)), archivedOn,
        ...(restoredOn ? { restoredOn } : {}) })) }
  };
}

export function questAvailabilityAt(quest, date) {
  const window = quest?.boardAvailability;
  if (!window) return 'available'; // Manual and module quests retain their contract.
  const day = noticeDate(date), appeared = window.notices.filter(notice => hasAppeared(notice, day));
  if (!appeared.length) return 'not-published';
  return appeared.some(notice => !isArchivedAt(window.archive, notice.id, day)) ? 'available' : 'archived';
}

export function questWorldDate(value, fallback) {
  return isNoticeDate(value) ? noticeDate(value) : noticeDate(fallback);
}
