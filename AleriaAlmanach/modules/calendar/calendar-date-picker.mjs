export function escapeCalendarText(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export function renderCalendarMonth(date, { calendar = globalThis.AleriaCalendar, today = calendar.current(), counts = new Map(), selected = date.day } = {}) {
  const e = escapeCalendarText;
  return `<div class="ac-weekdays">${calendar.weekdays.map(name => `<abbr title="${e(name)}">${e(name.slice(0, 3))}</abbr>`).join('')}</div>
    <div class="ac-days">${Array.from({ length: calendar.daysPerMonth }, (_, index) => {
      const day = index + 1;
      const current = day === today.day && date.month === today.month && date.year === today.year;
      const count = counts.get(day) || 0;
      return `<button type="button" data-calendar-day="${day}" aria-label="${e(calendar.format({ ...date, day }))}${count ? `, ${count} Termine` : ''}" aria-pressed="${day === selected}"${current ? ' aria-current="date"' : ''}><span>${day}</span>${count ? `<small>${count}</small>` : ''}</button>`;
    }).join('')}</div>`;
}

export function mountCalendarDatePicker(host, { value, onChange = () => {}, calendar = globalThis.AleriaCalendar } = {}) {
  let selected = calendar.isValid(value) ? calendar.normalize(value) : calendar.current();
  let displayed = { ...selected };
  const abort = new AbortController();
  host.classList.add('ac-picker');
  host.innerHTML = `<details><summary aria-label="Kalenderdatum auswählen"></summary><div class="ac-picker-popover">
    <div class="ac-picker-nav"><button type="button" data-picker-move="-1" aria-label="Voriger Monat">‹</button>
    <label><span class="ac-sr-only">Monat</span><select data-picker-month>${calendar.months.map((month, index) => `<option value="${index + 1}">${escapeCalendarText(month)}</option>`).join('')}</select></label>
    <label><span class="ac-sr-only">Jahr</span><input data-picker-year type="number" min="1" max="100000" aria-label="Jahr"></label>
    <button type="button" data-picker-move="1" aria-label="Nächster Monat">›</button></div>
    <div data-picker-grid></div><button type="button" data-picker-today>Heute in Aleria</button></div></details>`;
  const details = host.querySelector('details');
  function render() {
    host.querySelector('summary').textContent = calendar.format(selected);
    host.querySelector('[data-picker-month]').value = displayed.month;
    host.querySelector('[data-picker-year]').value = displayed.year;
    host.querySelector('[data-picker-grid]').innerHTML = renderCalendarMonth(displayed, {
      calendar, selected: selected.year === displayed.year && selected.month === displayed.month ? selected.day : null
    });
  }
  function setValue(next, notify = false) {
    if (!calendar.isValid(next)) return;
    selected = calendar.normalize(next);
    displayed = { ...selected };
    render();
    if (notify) onChange({ ...selected });
  }
  function close() { details.open = false; }
  host.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.hasAttribute('data-picker-move')) {
      displayed = calendar.shift({ ...displayed, day: 1 }, Number(target.dataset.pickerMove) * calendar.daysPerMonth);
      render();
    } else if (target.hasAttribute('data-calendar-day') || target.hasAttribute('data-picker-today')) {
      setValue(target.hasAttribute('data-picker-today') ? calendar.current() : { ...displayed, day: Number(target.dataset.calendarDay) }, true);
      close();
      host.querySelector('summary').focus();
    }
  }, { signal: abort.signal });
  host.addEventListener('change', () => {
    const year = Number(host.querySelector('[data-picker-year]').value);
    const month = Number(host.querySelector('[data-picker-month]').value);
    if (!Number.isInteger(year) || year < 1 || year > 100000) return;
    displayed = { ...displayed, year, month };
    render();
  }, { signal: abort.signal });
  host.addEventListener('keydown', event => {
    if (event.key === 'Escape' && details.open) {
      event.preventDefault(); event.stopPropagation(); close(); host.querySelector('summary').focus();
    }
    const day = event.target.closest('[data-calendar-day]');
    if (!day) return;
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -calendar.daysPerWeek, ArrowDown: calendar.daysPerWeek }[event.key];
    if (delta) {
      event.preventDefault();
      const next = calendar.shift({ ...displayed, day: Number(day.dataset.calendarDay) }, delta);
      displayed = next; render(); host.querySelector(`[data-calendar-day="${next.day}"]`)?.focus();
    }
  }, { signal: abort.signal });
  document.addEventListener('click', event => { if (!host.contains(event.target)) close(); }, { signal: abort.signal });
  render();
  return { getValue: () => ({ ...selected }), setValue, destroy: () => { abort.abort(); host.replaceChildren(); } };
}
