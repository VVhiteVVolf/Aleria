function getWorldDateMonthOptions(selectedMonth) {
  return Array.from({ length: 13 }, (_, index) => index + 1)
    .map(month => `<option value="${month}"${month === selectedMonth ? ' selected' : ''}>${escapeHtml(getAleriaMonthLabel(month))}</option>`)
    .join('');
}

function getWorldDateDayOptions(selectedDay) {
  return Array.from({ length: 36 }, (_, index) => index + 1)
    .map(day => `<option value="${day}"${day === selectedDay ? ' selected' : ''}>${day}. · ${escapeHtml(getAleriaWeekdayName(day))}</option>`)
    .join('');
}

function getRenderableWorldDate() {
  const candidate = AleriaWorldDateStore.getState().date;
  return AleriaWorldDateModel.isValid(candidate)
    ? AleriaWorldDateModel.normalize(candidate)
    : AleriaWorldDateModel.getDefault();
}

function renderWorldDateSidebar() {
  const state = AleriaWorldDateStore.getState();
  const date = getRenderableWorldDate();
  const formattedDate = formatAleriaDate(date) || 'Datum nicht gesetzt';
  const sidebar = document.querySelector('[data-world-date-sidebar]');
  const label = document.querySelector('[data-world-date-label]');
  const sync = document.querySelector('[data-world-date-sync]');
  if (sidebar) sidebar.hidden = false;
  if (label) label.textContent = formattedDate;
  if (sync) {
    sync.textContent = state.remoteConnected ? 'Mit dem Almanach geteilt' : 'Lokal gespeichert';
    sync.dataset.state = state.remoteConnected ? 'online' : 'local';
  }
}

function ensureWorldDateDialog() {
  let overlay = document.getElementById('world-date-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'world-date-overlay';
  overlay.className = 'world-date-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'world-date-title');
  overlay.setAttribute('tabindex', '-1');
  document.body.appendChild(overlay);
  return overlay;
}

function renderWorldDateDialog() {
  const overlay = ensureWorldDateDialog();
  const date = getRenderableWorldDate();
  overlay.innerHTML = `
    <form class="world-date-dialog" data-world-date-form>
      <header>
        <div><small>Kalender von Aleria</small><h2 id="world-date-title">Aktuelles Datum</h2></div>
        <button type="button" data-world-date-action="close-editor" aria-label="Datumsfenster schließen">×</button>
      </header>
      <p>Undatierte interaktive Szenen übernehmen dieses Datum mit ihrem ersten Beitrag als festes Startdatum.</p>
      <div class="world-date-fields">
        <label><span>Jahr</span><input type="number" min="1" required value="${date.year}" data-world-date-field="year"></label>
        <label><span>Monat</span><select required data-world-date-field="month">${getWorldDateMonthOptions(date.month)}</select></label>
        <label><span>Tag</span><select required data-world-date-field="day">${getWorldDateDayOptions(date.day)}</select></label>
      </div>
      <div class="world-date-preview"><small>Gewählter Tag</small><strong data-world-date-preview>${escapeHtml(formatAleriaDate(date))}</strong></div>
      <footer>
        <span data-world-date-status role="status"></span>
        <button type="button" data-world-date-action="close-editor">Abbrechen</button>
        <button class="primary" type="submit">Datum aktualisieren</button>
      </footer>
    </form>`;
  return overlay;
}

function openWorldDateDialog() {
  renderWorldDateDialog();
  activateDialog('world-date-overlay', { initialFocus: '[data-world-date-field="year"], input, select, button' });
}

function closeWorldDateDialog() {
  deactivateDialog('world-date-overlay');
}

function getWorldDateFormValue(form) {
  return AleriaWorldDateModel.normalize({
    year: form.querySelector('[data-world-date-field="year"]')?.value,
    month: form.querySelector('[data-world-date-field="month"]')?.value,
    day: form.querySelector('[data-world-date-field="day"]')?.value
  });
}

function renderWorldDatePreview(form) {
  const preview = form?.querySelector('[data-world-date-preview]');
  if (!preview) return;
  const date = getWorldDateFormValue(form);
  preview.textContent = AleriaWorldDateModel.isValid(date) ? formatAleriaDate(date) : 'Unvollständiges Datum';
}

function setWorldDateDialogStatus(message = '', status = 'info') {
  const element = document.querySelector('[data-world-date-status]');
  if (!element) return;
  element.textContent = message;
  element.dataset.status = status;
}

globalThis.AleriaWorldDateUI = Object.freeze({
  close: closeWorldDateDialog,
  getFormValue: getWorldDateFormValue,
  open: openWorldDateDialog,
  renderPreview: renderWorldDatePreview,
  renderSidebar: renderWorldDateSidebar,
  setStatus: setWorldDateDialogStatus
});
