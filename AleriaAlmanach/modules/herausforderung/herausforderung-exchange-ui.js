import { createHerausforderungAiTemplate, createHerausforderungExport, parseHerausforderungImport, MAX_HERAUSFORDERUNG_IMPORT_BYTES } from './herausforderung-exchange.js?v=20261016-check-policy-v1';
import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';

const bindings = new WeakMap();
const catalog = () => globalThis.AleriaItemRegister?.store.snapshot() || { standards: STANDARD_ITEMS };
function download(document, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(document, null, 2) + '\n'], { type: 'application/json;charset=utf-8' }));
  const anchor = window.document.createElement('a');
  anchor.href = url; anchor.download = filename;
  window.document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function mountHerausforderungExchange(root, binding) {
  const previous = bindings.get(root);
  bindings.set(root, binding);
  if (previous) return;
  root.addEventListener('click', event => {
    const trigger = event.target.closest('[data-herausforderung-exchange]');
    if (!trigger || root.getAttribute('aria-busy') === 'true') return;
    const current = bindings.get(root);
    const action = trigger.dataset.herausforderungExchange;
    if (action === 'ai-template') { download(createHerausforderungAiTemplate(catalog(), current.getCombatContext?.() || {}), 'aleria-herausforderung-ki-vorlage.json'); current.onStatus('KI-Vorlage mit leerer Herausforderung, Anleitung und aktuellen Register-IDs exportiert.'); }
    if (action === 'draft') { download(createHerausforderungExport(current.getDraft()), 'aleria-herausforderung-entwurf.json'); current.onStatus('Der aktuelle Entwurf wurde als JSON exportiert.'); }
    if (action === 'import') root.querySelector('[data-herausforderung-import-file]').click();
  });
  root.addEventListener('change', async event => {
    const field = event.target;
    if (!field.matches('[data-herausforderung-import-file]') || root.getAttribute('aria-busy') === 'true') return;
    const file = field.files?.[0];
    if (!file) return;
    const current = bindings.get(root);
    try {
      if (file.size > MAX_HERAUSFORDERUNG_IMPORT_BYTES) throw Error('Die JSON-Datei darf höchstens 2 MB groß sein.');
      const parsed = parseHerausforderungImport(await file.text(), catalog(), current.getCombatContext?.() || {});
      if (!root.classList.contains('active') || bindings.get(root) !== current) return;
      current.onImport(parsed.event, parsed.issues);
    } catch (error) { current.onStatus(error.message, 'error'); }
    finally { field.value = ''; }
  });
}
