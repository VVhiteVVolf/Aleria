import { noticeDate, compareDates, calendar } from './notice-dates.mjs';

export function createBoardDateState(initial) {
  let today = noticeDate(initial), viewed = noticeDate(initial), following = true;
  return Object.freeze({
    get: () => ({ today: { ...today }, viewed: { ...viewed }, following }),
    receive(value) { today = noticeDate(value); if (following) viewed = { ...today }; },
    view(value) { viewed = noticeDate(value); following = compareDates(viewed, today) === 0; },
    step(amount) { this.view(calendar.shift(viewed, amount)); },
    follow() { following = true; viewed = { ...today }; },
  });
}
