// Wiederverwendbares Aleria-Datum-Feld (Jahr/Monat/Tag) fuer Modul-Editor-Formulare.
// Additiv neben bestehenden Freitext-Zeitfeldern nutzbar. Siehe modules/core/aleria-calendar.js
// fuer die Kalender-Konstanten und Formatierung.

function buildAleriaDateField(label, keyPrefix, value = {}, inlineFieldName = '') {
  const date = sanitizeAleriaDate(value);
  const monthOptions = Array.from({ length: ALERIA_CALENDAR.monthsPerYear }, (_, i) => i + 1)
    .map(month => `<option value="${month}"${date.month === month ? ' selected' : ''}>${escapeHtml(getAleriaMonthLabel(month))}</option>`)
    .join('');
  const dayOptions = Array.from({ length: ALERIA_CALENDAR.daysPerMonth }, (_, i) => i + 1)
    .map(day => `<option value="${day}"${date.day === day ? ' selected' : ''}>${day}. (${escapeHtml(getAleriaWeekdayName(day))})</option>`)
    .join('');
  const actionAttrs = inlineFieldName
    ? `data-inline-action="sync-page-field" data-page-field="${escapeHtml(inlineFieldName)}"`
    : 'data-module-editor-action="sync-json-preview"';
  return `
    <div class="aleria-date-field">
      <span class="aleria-date-field-label">${escapeHtml(label)}</span>
      <div class="aleria-date-field-row">
        <input type="number" class="${keyPrefix}-year aleria-date-year-input" placeholder="Jahr" min="1" value="${escapeHtml(date.year ?? '')}" ${actionAttrs}>
        <select class="${keyPrefix}-month aleria-date-month-select" ${actionAttrs}>
          <option value=""${date.month ? '' : ' selected'}>Monat</option>
          ${monthOptions}
        </select>
        <select class="${keyPrefix}-day aleria-date-day-select" ${actionAttrs}>
          <option value=""${date.day ? '' : ' selected'}>Tag</option>
          ${dayOptions}
        </select>
      </div>
    </div>`;
}

function collectAleriaDateFromBlock(block, keyPrefix) {
  return sanitizeAleriaDate({
    year: getTrimmedFormValue(block, `.${keyPrefix}-year`),
    month: getTrimmedFormValue(block, `.${keyPrefix}-month`),
    day: getTrimmedFormValue(block, `.${keyPrefix}-day`)
  });
}
