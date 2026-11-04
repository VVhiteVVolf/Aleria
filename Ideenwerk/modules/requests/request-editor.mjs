import {escapeHtml as h} from '../ui/html.mjs';
import {REQUEST_PRIORITIES,REQUEST_STAGES,buildRequestSummary,isRequestModule} from './request-model.mjs';

export function renderRequestControls(module) {
  if(!isRequestModule(module))return '';
  const meta=module.requestMeta,summary=buildRequestSummary(module);
  return `<section class="request-controls" aria-label="Wunschübergabe"><div><strong>${h(summary.kindLabel)} für die Umsetzung</strong><p>Beschreibe deinen Wunsch unten und füge passende Bilder hinzu. Auf GitHub wird er erst übertragen, wenn du es ausdrücklich auswählst.</p></div><div class="request-fields"><label>Stand<select data-request-field="stage">${Object.entries(REQUEST_STAGES).map(([value,label])=>`<option value="${value}" ${meta.stage===value?'selected':''}>${h(label)}</option>`).join('')}</select></label><label>Dringlichkeit<select data-request-field="priority">${Object.entries(REQUEST_PRIORITIES).map(([value,label])=>`<option value="${value}" ${meta.priority===value?'selected':''}>${h(label)}</option>`).join('')}</select></label></div><div data-request-feedback>${renderRequestFeedback(module)}</div><button type="button" class="button secondary" data-action="share-request">Diesen Wunsch auf GitHub speichern</button></section>`;
}

export function renderRequestFeedback(module) {
  const summary=buildRequestSummary(module),proof=module.requestMeta.submission;
  const missing=summary.problems.length?`<p class="request-missing">Noch ergänzen: ${summary.problems.map(h).join(' ')}</p>`:`<p>Beschreibung vorhanden · ${summary.referenceImageCount} Referenzbild${summary.referenceImageCount===1?'':'er'}</p>`;
  return `${missing}${proof?`<p>Zuletzt auf GitHub gespeichert: ${h(new Date(proof.sentAt).toLocaleDateString('de-DE'))}. Weitere Änderungen bitte erneut übertragen.</p>`:'<p>Dieser Wunsch ist bisher nur lokal gespeichert.</p>'}`;
}
