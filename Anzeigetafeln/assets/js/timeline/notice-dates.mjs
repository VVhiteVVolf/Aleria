import '../../../../AleriaAlmanach/modules/core/aleria-calendar.js';

export const calendar = globalThis.AleriaCalendar;
export const NOTICE_START_DATE = calendar.playStartDate;
export const isNoticeDate = value => calendar.isValid(value)
  && Number.isInteger(value?.year) && Number.isInteger(value?.month) && Number.isInteger(value?.day)
  && value.year <= 100000;
export const noticeDate = value => calendar.normalize(isNoticeDate(value) ? value : NOTICE_START_DATE);
export const compareDates = (a, b) => calendar.ordinal(noticeDate(a)) - calendar.ordinal(noticeDate(b));
export const dateLabel = value => calendar.format(noticeDate(value), { withWeekday: false });
export const publicationDate = notice => noticeDate(notice?.publishedOn);
export const hasAppeared = (notice, date) => compareDates(publicationDate(notice), date) <= 0;
export const withNoticeDate = notice => ({ ...notice, publishedOn: publicationDate(notice) });
export const commentsAtDate = (comments, date) => comments.filter(comment => !comment.postedOn || compareDates(comment.postedOn, date) <= 0);

export function assertNoticeDate(value, label = 'Aushangdatum') {
  if (!isNoticeDate(value)) throw new Error(`${label} ist kein gültiges Aleria-Datum.`);
}
