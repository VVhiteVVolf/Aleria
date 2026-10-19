import { escape } from './economy-format.mjs';
import { sanitizePageData, validateScenario } from './economy-model.mjs';

export function buildEditor(page, mode = 'module') {
  const data = sanitizePageData(page.economyCalculation), inline = mode === 'inline';
  const content = `<div class="${inline ? 'inline-edit-section' : 'module-editor-grid'}"><label class="${inline ? 'inline-edit-field' : 'module-editor-field'} wide"><span>Wirtschaftsmodell · vollständige Kalkulationsdaten</span>
    <textarea class="inline-edit-textarea me-economy-data" data-economy-editor-data rows="16" spellcheck="false">${escape(JSON.stringify(data, null, 2))}</textarea>
    <small>Preise und Personal bleiben mit Herkunftsverweisen erhalten. In der Leseseite lassen sich Auslastung, Kosten, Abgaben und Einzellöhne ohne Speichern ausprobieren.</small></label></div>`;
  return inline ? content : `<div class="module-page-type-block${page.economyCalculationPage ? ' visible' : ''}" data-page-type="economy-calculation">${content}</div>`;
}

function parseEditor(field) {
  let parsed;
  try { parsed = JSON.parse(field.value); } catch { throw Error('Die Kalkulationsdaten sind kein gültiges JSON.'); }
  const data = sanitizePageData(parsed), errors = validateScenario(data.scenario, globalThis.AleriaCalendar);
  if (errors.length) throw Error(errors.join(' '));
  return data;
}

export function collectEditor(card, page) {
  const field = card.querySelector('[data-page-type="economy-calculation"] [data-economy-editor-data]') || card.querySelector('[data-economy-editor-data]');
  if (!field) throw Error('Das Eingabefeld der Kalkulation fehlt.');
  page.economyCalculationPage = true; page.enableComments = false;
  page.economyCalculation = parseEditor(field); return page;
}

export function bindEditorEvents(document) {
  document.addEventListener('change', event => {
    const field = event.target.closest?.('[data-economy-editor-data]');
    if (!field?.closest('.inline-module-edit-pane')) return;
    try {
      const page = globalThis.getInlineDraftPageForSource(field);
      if (!page?.economyCalculationPage) return;
      page.economyCalculation = parseEditor(field); field.setCustomValidity('');
      globalThis.scheduleInlineModuleLivePreviewRefresh();
    } catch (error) { field.setCustomValidity(error.message); field.reportValidity(); }
  });
}
