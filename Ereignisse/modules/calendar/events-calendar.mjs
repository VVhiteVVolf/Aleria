import { getCalendarStore } from '../../../AleriaAlmanach/modules/calendar/calendar-store.mjs';
import { createCalendarEventModel } from '../../../AleriaAlmanach/modules/calendar/calendar-events-model.mjs';
import { renderCalendarPreview, bindCalendarImageFallback } from '../../../AleriaAlmanach/modules/calendar/calendar-preview.mjs';

function initializeEventsCalendar() {
  const root = document.querySelector('[data-events-calendar]');
  if (!root) return;
  globalThis.AleriaWorldDateStore.initialize();
  const calendar = globalThis.AleriaCalendar;
  const store = getCalendarStore(), model = createCalendarEventModel(calendar);
  bindCalendarImageFallback(root);
  function render() {
    const state = store.getState(), today = calendar.current();
    const entries = model.occurrences(state.events, today, calendar.shift(today, calendar.daysPerWeek));
    root.querySelector('[data-role="calendar-today"]').textContent = `Heute in Aleria: ${calendar.format(today)} · Ausblick auf die nächsten neun Tage`;
    root.querySelector('[data-role="calendar-upcoming"]').innerHTML = entries.slice(0, 3).map(event => renderCalendarPreview(event, {
      calendar, compact: true, link: true, calendarHref: '../AleriaAlmanach/kalender.html',
      articleBase: new URL('../AleriaAlmanach/kalender.html', location.href).href
    })).join('') || '<p class="events-calendar-empty">Für heute und die nächsten neun Tage sind noch keine Termine vorgemerkt. Im Kalender ist Platz für die nächste Zusammenkunft.</p>';
    root.querySelector('[data-role="calendar-status"]').textContent = [
      state.online ? 'Mit dem gemeinsamen Kalender verbunden.' : 'Lokaler Kalenderstand · Online-Abgleich ausstehend.',
      state.pendingCount ? `${state.pendingCount} lokale Entwürfe noch nicht veröffentlicht.` : '',
      entries.length > 3 ? `${entries.length - 3} weitere Termine im Kalender.` : ''
    ].filter(Boolean).join(' ');
  }
  store.subscribe(render);
  document.addEventListener('almanach-world-date-state', render);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeEventsCalendar, { once: true });
else initializeEventsCalendar();
