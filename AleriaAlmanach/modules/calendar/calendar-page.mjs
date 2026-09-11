import { getCalendarStore } from './calendar-store.mjs';
import { createCalendarEventModel } from './calendar-events-model.mjs';
import { renderCalendarMonth, escapeCalendarText as e } from './calendar-date-picker.mjs';
import { renderCalendarPreview, bindCalendarImageFallback } from './calendar-preview.mjs';
import { createCalendarEditor } from './calendar-editor.mjs';

function initializeCalendarPage() {
  const root = document.querySelector('[data-calendar-page]');
  if (!root) return;
  globalThis.AleriaWorldDateStore.initialize();
  const calendar = globalThis.AleriaCalendar;
  const store = getCalendarStore(), model = createCalendarEventModel(calendar);
  const editor = createCalendarEditor({ store, calendar });
  let selected = calendar.current(), filter = '', navigated = false, initialEvent = new URL(location.href).searchParams.get('event');
  const $ = selector => root.querySelector(selector);
  bindCalendarImageFallback(root);

  function entriesInMonth() {
    return model.occurrences(store.getState().events, { ...selected, day: 1 }, { ...selected, day: calendar.daysPerMonth });
  }
  function cards(events) {
    return events.map(event => renderCalendarPreview(event, { calendar, compact: true, collision: events.some(other => other.occurrenceKey !== event.occurrenceKey && model.overlaps(event, other)) })).join('');
  }
  function render() {
    const state = store.getState(), today = calendar.current();
    $('[data-calendar-today]').textContent = calendar.format(today);
    $('[data-calendar-heading]').textContent = calendar.monthLabel(selected.month);
    $('[data-calendar-year]').value = selected.year;
    $('[data-calendar-months]').innerHTML = calendar.months.map((name, index) => `<button type="button" data-calendar-month="${index + 1}" aria-pressed="${selected.month === index + 1}"><small>${String(index + 1).padStart(2, '0')}</small>${e(name)}</button>`).join('');
    const entries = entriesInMonth(), counts = new Map();
    for (let day = 1; day <= calendar.daysPerMonth; day++) {
      const ordinal = calendar.ordinal({ ...selected, day });
      counts.set(day, entries.filter(event => calendar.ordinal(event.start) <= ordinal && calendar.ordinal(event.end) >= ordinal).length);
    }
    $('[data-calendar-grid]').innerHTML = renderCalendarMonth(selected, { calendar, today, counts });
    $('[data-calendar-day-title]').textContent = `${selected.day}. ${calendar.monthLabel(selected.month)}`;
    const dayEntries = model.occurrences(state.events, selected);
    $('[data-calendar-agenda]').innerHTML = cards(dayEntries) || `<div class="calendar-empty"><span aria-hidden="true">✧</span><p>Dieser Tag ist noch frei.</p><small>Eine Zusammenkunft, ein Fest oder den nächsten Aufbruch vormerken.</small><button type="button" data-calendar-action="new">Ersten Termin eintragen</button></div>`;
    const filtered = entries.filter(event => [event.title, event.location, ...event.participants.map(person => person.name)].join(' ').toLocaleLowerCase('de').includes(filter));
    $('[data-calendar-month-events]').innerHTML = cards(filtered) || `<p class="calendar-help">${filter ? 'Keine passenden Termine.' : 'Für diesen Monat sind noch keine Termine eingetragen.'}</p>`;
    $('[data-calendar-status]').textContent = state.online ? `Gemeinsamer Kalender verbunden.${state.pendingCount ? ` ${state.pendingCount} lokale Entwürfe noch nicht veröffentlicht.` : ''}`
      : `${state.error || 'Kalender noch nicht verbunden.'} Termine können auf diesem Gerät vorbereitet werden.`;
    $('[data-calendar-action="publish"]').hidden = !state.pendingCount;
    if (initialEvent) {
      const event = state.events.find(item => item.id === initialEvent);
      if (event) { initialEvent = null; showEvent(resolveOccurrence(event, Number(new URL(location.href).searchParams.get('day')))); }
    }
  }
  const detail = document.createElement('div');
  detail.id = 'calendar-detail-overlay'; detail.className = 'calendar-editor-overlay';
  detail.setAttribute('aria-label', 'Terminvorschau'); document.body.append(detail);
  bindCalendarImageFallback(detail);
  let shownEvent;
  function resolveOccurrence(event, ordinal) {
    if (!Number.isInteger(ordinal) || ordinal < 1) return event;
    return model.occurrences([event], calendar.fromOrdinal(ordinal)).find(item => calendar.ordinal(item.start) === ordinal) || event;
  }
  function showEvent(event) {
    shownEvent = event.source || event;
    detail.innerHTML = `<section class="calendar-detail"><header><span>Terminvorschau</span><button type="button" data-calendar-detail-close aria-label="Schließen">×</button></header>${renderCalendarPreview(event, { calendar })}<footer><button type="button" data-calendar-detail-close>Schließen</button><button type="button" data-calendar-edit class="calendar-primary">Termin bearbeiten</button>${event.localOnly ? '<button type="button" data-calendar-discard>Lokalen Entwurf verwerfen</button>' : ''}</footer></section>`;
    globalThis.activateDialog(detail.id);
  }
  detail.addEventListener('click', event => {
    if (event.target.closest('[data-calendar-detail-close]')) globalThis.deactivateDialog(detail.id);
    if (event.target.closest('[data-calendar-edit]')) { globalThis.deactivateDialog(detail.id); editor.open(shownEvent); }
    const discard = event.target.closest('[data-calendar-discard]');
    if (discard) {
      if (!discard.dataset.confirm) { discard.dataset.confirm = 'true'; discard.textContent = 'Verwerfen bestätigen'; return; }
      store.discardDraft(shownEvent.id); globalThis.deactivateDialog(detail.id);
    }
  });
  root.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-calendar-open')) { const item = store.getState().events.find(item => item.id === button.dataset.calendarOpen); if (item) showEvent(resolveOccurrence(item, Number(button.dataset.calendarOccurrence))); return; }
    if (button.hasAttribute('data-calendar-day')) { selected.day = Number(button.dataset.calendarDay); navigated = true; }
    if (button.hasAttribute('data-calendar-month')) { selected.month = Number(button.dataset.calendarMonth); navigated = true; }
    if (button.hasAttribute('data-calendar-move')) { selected = calendar.shift(selected, Number(button.dataset.calendarMove) * calendar.daysPerMonth); navigated = true; }
    const action = button.dataset.calendarAction;
    if (action === 'new') { editor.open(null, selected); return; }
    if (action === 'today') { selected = calendar.current(); navigated = false; }
    if (action === 'reconnect') { store.reconnect(); globalThis.AleriaWorldDateStore.retrySync(); }
    if (action === 'publish') {
      button.disabled = true;
      try { await store.publish(); } catch (error) { $('[data-calendar-status]').textContent = error.message; return; }
      finally { button.disabled = false; }
    }
    render();
  });
  root.addEventListener('change', event => {
    if (!event.target.hasAttribute('data-calendar-year') || !event.target.checkValidity()) return;
    selected.year = Number(event.target.value); navigated = true; render();
  });
  root.addEventListener('input', event => {
    if (event.target.hasAttribute('data-calendar-search')) { filter = event.target.value.toLocaleLowerCase('de'); render(); }
  });
  document.addEventListener('almanach-world-date-state', () => { if (!navigated) selected = calendar.current(); render(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    const top = globalThis.getTopActiveDialog?.();
    if (top?.id === 'calendar-editor-overlay') editor.close();
    else if (top) globalThis.deactivateDialog(top.id);
  });
  store.subscribe(render);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeCalendarPage, { once: true });
else initializeCalendarPage();
