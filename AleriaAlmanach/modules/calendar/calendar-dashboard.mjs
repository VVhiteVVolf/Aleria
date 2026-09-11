import { getCalendarStore } from './calendar-store.mjs';
import { createCalendarEventModel } from './calendar-events-model.mjs';
import { renderCalendarPreview, bindCalendarImageFallback } from './calendar-preview.mjs';

function initializeCalendarDashboard() {
  const calendar = globalThis.AleriaCalendar, store = getCalendarStore(), model = createCalendarEventModel(calendar);
  const initialized = new WeakSet();
  function render() {
    const root = document.querySelector('[data-calendar-dashboard]');
    if (!root) return;
    if (!initialized.has(root)) { bindCalendarImageFallback(root); initialized.add(root); }
    const state = store.getState(), today = calendar.current();
    const events = model.occurrences(state.events, today, calendar.shift(today, calendar.daysPerWeek));
    root.innerHTML = `<header><h3>Die nächsten Tage in Aleria</h3><a href="./kalender.html">Kalender öffnen →</a></header>
      <div class="calendar-dashboard-list">${events.slice(0, 4).map(event => renderCalendarPreview(event, { calendar, compact: true, link: true, collision: events.some(other => other.occurrenceKey !== event.occurrenceKey && model.overlaps(event, other)) })).join('')}</div>
      ${!events.length ? '<p class="calendar-help">Für heute und die nächsten neun Tage sind keine Termine vorgemerkt.</p>' : ''}
      ${events.length > 4 ? `<p class="calendar-help">${events.length - 4} weitere Termine im Kalender</p>` : ''}
      ${!state.online ? '<p class="calendar-help">Lokaler Kalenderstand · Online-Abgleich ausstehend</p>' : ''}`;
  }
  store.subscribe(render);
  document.addEventListener('almanach-world-date-state', render);
  document.addEventListener('almanach-dashboard-rendered', render);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeCalendarDashboard, { once: true });
else initializeCalendarDashboard();
