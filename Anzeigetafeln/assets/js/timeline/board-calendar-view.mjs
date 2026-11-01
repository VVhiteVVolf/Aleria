import { calendar, dateLabel } from './notice-dates.mjs';
import { calendarNumerals } from './calendar-numeral-art.mjs';
import { mountCalendarDatePicker, escapeCalendarText as esc } from '../../../../AleriaAlmanach/modules/calendar/calendar-date-picker.mjs';

export function mountBoardCalendar({ getState, onStep, onToday, onDate, onArchive }) {
  const physical = document.createElement('section');
  physical.className = 'board-calendar';
  physical.dataset.boardControl = 'calendar';
  physical.setAttribute('aria-label', 'Kalender der Anzeigetafel');
  document.getElementById('board-stage').append(physical);
  const mobile = document.createElement('section');
  mobile.className = 'board-calendar-mobile';
  mobile.dataset.boardControl = 'calendar';
  mobile.setAttribute('aria-label', 'Tag der Anzeigetafel');
  const archive = document.createElement('button');
  archive.type = 'button'; archive.className = 'tbtn'; archive.dataset.action = 'board-open-archive';
  archive.textContent = 'Papierarchiv'; archive.addEventListener('click', onArchive);
  document.getElementById('btn-register').before(archive);
  archive.before(mobile);
  const dialog = document.createElement('dialog');
  dialog.className = 'board-date-dialog';
  dialog.innerHTML = '<header><h2>Ein Tag an der Anzeigetafel</h2><button type="button" data-calendar-close aria-label="Kalender schließen">×</button></header><div data-date-picker></div>';
  document.body.append(dialog);
  let picker;

  function chooseDate() {
    picker?.destroy();
    const state = getState();
    picker = mountCalendarDatePicker(dialog.querySelector('[data-date-picker]'), {
      value: state.viewed, calendar: { ...calendar, current: () => getState().today },
      onChange(value) { onDate(value); dialog.close(); },
    });
    dialog.showModal();
    dialog.querySelector('details').open = true;
  }
  dialog.querySelector('[data-calendar-close]').addEventListener('click', () => dialog.close());
  for (const root of [physical, mobile]) {
    root.addEventListener('pointerdown', event => event.stopPropagation());
    root.addEventListener('click', event => {
      const button = event.target.closest('[data-board-date-action]');
      if (!button) return;
      event.stopPropagation();
      const action = button.dataset.boardDateAction;
      if (action === 'previous' || action === 'next') onStep(action === 'previous' ? -1 : 1);
      if (action === 'today') onToday();
      if (action === 'choose') chooseDate();
      root.querySelector(`[data-board-date-action="${action}"]`)?.focus();
    });
  }

  function render(status = 'connecting') {
    const { today, viewed, following } = getState();
    const title = `${dateLabel(viewed)} · ${calendar.weekday(viewed.day)}`;
    const statusText = status === 'online' ? 'Mit dem Weltdatum verbunden' : status === 'offline' ? 'Letztes bekanntes Weltdatum · Verbindung fehlt' : 'Weltdatum wird abgeglichen';
    for (const root of [physical, mobile]) {
      root.style.setProperty('--calendar-month-length', String(calendar.monthLabel(viewed.month).length));
      root.classList.toggle('is-browsing', !following);
      root.innerHTML = root === mobile
        ? `<button type="button" class="tbtn" data-board-date-action="choose" title="${esc(title)}">Kalender</button><button type="button" class="tbtn" data-board-date-action="today" title="${esc(statusText)}">Heute</button>`
        : `<img class="board-calendar-art" src="assets/images/board-calendar/calendar-leaves-v2.webp" alt="" draggable="false">
        <button type="button" class="board-calendar-previous" data-board-date-action="previous" title="Vorheriger Tag" aria-label="Vorheriger Aleria-Tag">‹</button>
        <button type="button" class="board-calendar-leaf" data-board-date-action="choose" title="${esc(title)}" aria-label="${esc(title)} · Datum wählen">
          <small>${esc(calendar.monthLabel(viewed.month))}</small><strong>${calendarNumerals(viewed.day)}</strong><span class="board-calendar-year">${calendarNumerals(viewed.year)}</span></button>
        <button type="button" class="board-calendar-next" data-board-date-action="next" title="Nächster Tag" aria-label="Nächster Aleria-Tag">›</button>
        <button type="button" class="board-calendar-today" data-board-date-action="today" title="${esc(statusText)} · ${esc(dateLabel(today))}" ${following ? 'aria-current="date"' : ''}>Heute</button>`;
      root.dataset.syncState = status;
    }
  }
  return Object.freeze({ render, setArchiveCount(count) { archive.textContent = count ? `Papierarchiv · ${count}` : 'Papierarchiv'; } });
}
