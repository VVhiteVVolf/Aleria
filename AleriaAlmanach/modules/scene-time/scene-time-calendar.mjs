import { mountCalendarDatePicker } from '../calendar/calendar-date-picker.mjs';

// Adapter zwischen Weltkalender und bestehender, relativer Szenenuhr.
export function createSceneTimeCalendar(overlay, { comments, thread, afterId = null, editingId = null } = {}) {
  const calendar = globalThis.AleriaCalendar;
  const start = globalThis.AleriaSceneDateDefaults?.resolve(thread, comments);
  const ordered = globalThis.sortCommentsByTimeline?.(comments) || comments;
  const index = afterId ? ordered.findIndex(comment => comment.id === afterId) : -1;
  const relevant = index >= 0 ? ordered.slice(0, index + 1) : ordered;
  const timeline = globalThis.buildSceneTimeline(relevant);
  const anchor = editingId ? timeline.find(entry => entry.comment.id === editingId) : timeline.at(-1);
  const dayIndex = anchor?.aleriaEndDayIndex || 1;
  const baseDate = start ? calendar.shift(start, dayIndex - 1) : calendar.current();
  const baseClockDay = Number.isFinite(anchor?.endSeconds) ? globalThis.getSceneDayFromSeconds(anchor.endSeconds) : 1;
  let dateEdited = false;
  const field = id => overlay.querySelector(`#${id}`);
  function sync() {
    const date = picker.getValue();
    if (!field('ste-day-label').dataset.userEdited) field('ste-day-label').value = calendar.format(date);
    const calendarDay = start ? calendar.ordinal(date) - calendar.ordinal(start) + 1 : 1;
    field('ste-anchor-day').value = Math.max(1, baseClockDay + calendarDay - dayIndex);
    globalThis.renderSceneTimeDialogPreview();
  }
  const picker = mountCalendarDatePicker(overlay.querySelector('[data-scene-time-calendar]'), {
    calendar, value: baseDate, onChange: () => { dateEdited = true; sync(); }
  });
  if (Number.isFinite(anchor?.endSeconds)) field('ste-anchor-time').value = globalThis.formatSceneClock(anchor.endSeconds, false);
  if (editingId && anchor?.comment.sceneTimeEvent?.calendarDate) picker.setValue(anchor.comment.sceneTimeEvent.calendarDate);
  const instance = {
    sync,
    getValue() {
      const date = picker.getValue();
      const calendarDay = start ? calendar.ordinal(date) - calendar.ordinal(start) + 1 : 1;
      return { calendarDate: date, calendarDay, sceneStartDateAleria: start || date };
    },
    validate() {
      if (instance.getValue().calendarDay < 1) throw new Error(`Das Datum liegt vor dem Szenenbeginn (${calendar.format(start)}).`);
      if (instance.getValue().calendarDay > 1000000 || Number(field('ste-anchor-day').value) > 1000000) throw new Error('Das gewählte Datum liegt außerhalb der unterstützten Szenenzeit.');
      if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(field('ste-anchor-time').value)) throw new Error('Bitte eine gültige Uhrzeit angeben.');
    },
    preset(key) {
      const times = { morning: '06:00:00', noon: '12:00:00', evening: '18:30:00', night: '22:00:00', 'next-day': '06:00:00' };
      if (times[key]) field('ste-anchor-time').value = times[key];
      if (!dateEdited) picker.setValue(key === 'next-day' ? calendar.shift(baseDate, 1) : baseDate);
      sync();
    },
    destroy: () => picker.destroy()
  };
  return instance;
}
