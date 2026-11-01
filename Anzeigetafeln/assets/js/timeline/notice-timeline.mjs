import { calendar, NOTICE_START_DATE, noticeDate, publicationDate, withNoticeDate, hasAppeared, dateLabel, isNoticeDate, compareDates, commentsAtDate } from './notice-dates.mjs';
import { normalizeArchive, isArchivedAt, assertArchiveState } from '../archive/notice-archive-model.mjs';
import { createBoardDateState } from './board-date-state.mjs';
import { cachedWorldDate, subscribeBoardWorldDate } from './board-world-date-source.mjs';
import { mountBoardCalendar } from './board-calendar-view.mjs?v=20261031-a38-calendar-v2';
import { mountCalendarDatePicker } from '../../../../AleriaAlmanach/modules/calendar/calendar-date-picker.mjs';

export function initializeNoticeTimeline({ subscribe = subscribeBoardWorldDate } = {}) {
  const dates = createBoardDateState(cachedWorldDate());
  let status = 'connecting', stopPicker = () => {};
  const rt = () => window.TafelRuntime;
  const state = () => window.TafelState.get();
  const current = () => dates.get().viewed;
  const visibleNotices = (notices = state().zettel) => notices.filter(notice => hasAppeared(notice, current())
    && !isArchivedAt(state().noticeArchive, notice.id, current()));

  function refresh() {
    view.render(status);
    rt()?.renderZettel();
    window.dispatchEvent(new CustomEvent('aleria:tafel:date-changed', { detail: dates.get() }));
  }
  function setDate(value) { if (isNoticeDate(value)) { dates.view(value); refresh(); } }
  const view = mountBoardCalendar({ getState: dates.get,
    onStep: amount => { dates.step(amount); refresh(); },
    onToday: () => { dates.follow(); refresh(); }, onDate: setDate,
    onArchive: () => window.TafelArchive?.open(),
  });

  function readableNotices(entryId = '') {
    if (!entryId) return visibleNotices();
    const entry = state().noticeArchive?.entries.find(entry => entry.id === entryId);
    if (!entry || compareDates(entry.archivedOn, current()) > 0) return [];
    return state().zettel.filter(notice => entry.noticeIds.includes(notice.id) && hasAppeared(notice, current()));
  }

  function setPublicationDate(id, value) {
    if (!rt().canEditZettel() || !isNoticeDate(value)) return;
    const group = window.TafelNoticeStacks.publication(state().zettel, id, { includeSecret: true });
    if (!group) return;
    const ids = new Set(group.notices.map(notice => notice.id));
    const next = state().zettel.map(notice => ids.has(notice.id) ? { ...notice, publishedOn: noticeDate(value) } : notice);
    try { assertArchiveState(normalizeArchive(state().noticeArchive, next), next); }
    catch (error) { rt().toast(error.message); return; }
    state().zettel = next;
    rt().renderZettel(); rt().save();
    window.TafelNoticeReader?.refresh();
  }

  function mountEditor(host, notice) {
    stopPicker(); stopPicker = () => {};
    if (!host) return;
    host.innerHTML = '<label class="lml">Aushang sichtbar ab</label><div data-published-date-picker></div><p class="notice-date-help">Gilt auch für die Beiblätter. Frühere Tage zeigen den Aushang noch nicht.</p>';
    const picker = mountCalendarDatePicker(host.querySelector('[data-published-date-picker]'), {
      value: publicationDate(notice), calendar: { ...calendar, current: () => dates.get().today },
      onChange: date => setPublicationDate(notice.id, date),
    });
    stopPicker = () => picker.destroy();
  }

  window.TafelNoticeTimeline = Object.freeze({
    visibleNotices, readableNotices, current, viewDate: setDate, getState: dates.get, mountEditor,
    visibleComments: comments => commentsAtDate(comments, current()), dateLabel,
    normalizeIncomingState(incoming) {
      if (!Array.isArray(incoming.zettel)) return incoming;
      return { ...incoming, zettel: incoming.zettel.map(withNoticeDate), noticeArchive: normalizeArchive(incoming.noticeArchive, incoming.zettel) };
    },
    normalizeArchive, defaultPublicationDate: () => ({ ...NOTICE_START_DATE }),
    dateMarkup: notice => `<p class="notice-posted-date">Ausgehängt am ${dateLabel(publicationDate(notice))}</p>`,
    setArchiveCount: view.setArchiveCount,
  });
  view.render(status);
  const stop = subscribe(date => { dates.receive(date); refresh(); }, next => { status = next; view.render(status); });
  window.addEventListener('pagehide', stop, { once: true });
  return window.TafelNoticeTimeline;
}
