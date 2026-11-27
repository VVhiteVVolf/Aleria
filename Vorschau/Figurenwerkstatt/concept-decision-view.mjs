import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { artImage, safeConceptUrl } from './concept-media.mjs';
import { canConfirmDecision } from './concept-decisions.mjs';

export function renderMainImageStatus(image, { openVariants = false } = {}) {
  const url = safeConceptUrl(image?.url);
  return `<div class="concept-main-image-status" data-confirmed="${Boolean(image)}">
    <div class="concept-decision-title">
      ${artImage('inquiry', 25)}
      <div><strong data-role="main-image-title" tabindex="-1">Hauptbild ${image ? 'festgelegt' : 'offen'}</strong>
        ${image ? `<p>${e(image.title)}</p>` : ''}</div>
    </div>
    <div class="workshop-actions">
      ${openVariants ? '<button type="button" class="workshop-button" data-action="section" data-id="images">Bildvarianten öffnen</button>' : ''}
      ${url ? `<button type="button" class="concept-link" data-action="show-image" data-image="${e(url)}" data-title="${e(image.title)}">Hauptbild ansehen</button>
        <button type="button" class="concept-link" data-action="clear-main-image">Bildfestlegung lösen</button>` : ''}
    </div>
  </div>`;
}

function decisionValues(row) {
  const fields = [
    [row.status === 'confirmed' ? 'Festlegung' : 'Vorschlag', row.result],
    ['Begründung', row.reason],
    ['Alternativen', row.alternatives]
  ].filter(([, value]) => value?.trim());
  return fields.length ? `<dl class="decision-values">${fields.map(([label, value]) =>
    `<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`
  ).join('')}</dl>` : '';
}

function decisionState(confirmed) {
  return `<span class="decision-state" data-confirmed="${confirmed}">${confirmed ? 'Festgelegt' : 'Offen'}</span>`;
}

function decisionRow(row, fields, renderControl) {
  const confirmed = row.status === 'confirmed';
  const [name, result, ...details] = fields;
  return `<li class="concept-row decision-row" data-collection="decisions" data-row="${e(row.id)}" data-confirmed="${confirmed}">
    <div class="decision-row-heading">
      <h4 data-role="decision-heading" tabindex="-1">${e(row.name?.trim() || 'Entscheidung')}</h4>${decisionState(confirmed)}
    </div>
    ${confirmed ? `${decisionValues(row)}
      <button type="button" class="workshop-button" data-action="reopen-decision">Erneut öffnen</button>` : `
      <div class="decision-fields">${renderControl(name, row.name)}${renderControl(result, row.result)}</div>
      <details class="decision-details"${row.alternatives?.trim() || row.reason?.trim() ? ' open' : ''}>
        <summary>Alternativen und Begründung</summary>
        <div class="concept-fields concept-fields--prose-grid">
          ${details.map(field => renderControl(field, row[field.id])).join('')}
        </div>
      </details>
      <div class="workshop-actions">
        <button type="button" class="workshop-button workshop-button--primary" data-action="confirm-decision"${canConfirmDecision(row) ? '' : ' disabled'}>Entscheidung festlegen</button>
        <button type="button" class="concept-link concept-remove" data-action="remove-row">Entscheidung entfernen</button>
      </div>`}
  </li>`;
}

export function renderDecisionEditor(draft, type, renderControl) {
  const list = type.lists.decisions;
  const rows = draft.rows.decisions;
  const confirmed = rows.filter(row => row.status === 'confirmed').length;
  return `<section class="concept-group">
    ${renderMainImageStatus(draft.mainImage, { openVariants: true })}
    <div class="concept-list-heading">
      <h3>${e(list.title)}</h3>
      <button type="button" class="workshop-button" data-action="export-decisions">${artImage('export', 18)}Entscheidungsblatt exportieren</button>
    </div>
    <div class="decision-topics">
      <strong>Entscheidung vorbereiten</strong>
      <div class="workshop-actions">${type.decisionTopics.map(topic =>
        `<button type="button" class="workshop-button" data-action="add-decision-topic" data-topic="${e(topic.id)}">${e(topic.label)}</button>`
      ).join('')}
      <button type="button" class="workshop-button workshop-button--primary" data-action="add-row" data-collection="decisions">＋ ${e(list.add)}</button></div>
    </div>
    ${rows.length ? `<p class="decision-count">${confirmed} festgelegt · ${rows.length - confirmed} offen</p>
      <ul class="concept-list">${rows.map(row => decisionRow(row, list.fields, renderControl)).join('')}</ul>`
    : '<p class="concept-empty">Wähle ein Thema oder ergänze eine eigene Entscheidung.</p>'}
  </section>`;
}

export function renderDecisionReading(rows) {
  const entries = rows.filter(row => [row.name, row.result, row.alternatives, row.reason].some(value => value?.trim()));
  if (!entries.length) return '';
  return `<ul class="reading-entries">${entries.map(row => `<li class="reading-entry">
    <div class="decision-row-heading"><strong>${e(row.name?.trim() || 'Entscheidung')}</strong>${decisionState(row.status === 'confirmed')}</div>
    ${decisionValues(row)}
  </li>`).join('')}</ul>`;
}
