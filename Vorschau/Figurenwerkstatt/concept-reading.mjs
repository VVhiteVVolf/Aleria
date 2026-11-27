import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { artImage, renderMedia, safeConceptUrl } from './concept-media.mjs';
import { referencedName, renderReferenceLink } from './concept-reference-view.mjs';
import { CONCEPT_TYPES, variantTitle } from './concept-schema.mjs';
import { mainImageMatches } from './concept-decisions.mjs';
import { renderDecisionReading } from './concept-decision-view.mjs';

function readingField(field, record, omit = []) {
  if (omit.includes(field.id) || ['icon', 'reference'].includes(field.type)) return '';
  const value = record[field.id]?.trim();
  if (!value) return '';
  const url = field.type === 'link' ? safeConceptUrl(value) : '';
  const label = field.options?.[value] || value;
  const content = url ? `<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)} ↗</a>` : e(label);
  return `<div><dt>${e(field.label)}</dt><dd>${content}</dd></div>`;
}

function pictureVariant(row, index, draft, fallbackFormat) {
  if (![row.name, row.url, row.note].some(value => value?.trim())) return '';
  const choice = mainImageMatches(draft.mainImage, row) ? draft.mainImage : null;
  const title = choice?.title ?? variantTitle(row, index);
  const label = choice ? ' · Hauptbild' : draft.favorite === row.id ? ' · Favorit' : '';
  return `<li class="reading-variant">
    ${renderMedia(choice?.url ?? row.url, title, { format: choice?.format ?? row.format, fallbackFormat })}
    <h4>${e(title)}${label}</h4>
    ${row.note?.trim() ? `<p>${e(row.note)}</p>` : ''}
  </li>`;
}

function readingRow(definition, row, drafts) {
  const label = referencedName(row, drafts).trim();
  const icon = safeConceptUrl(row.icon?.src);
  const details = definition.fields.map(field => readingField(field, row, ['name', definition.media, 'format'])).join('');
  const image = definition.media && row[definition.media] ? renderMedia(row[definition.media], label || definition.title, {
    format: row.format, fallbackFormat: definition.defaultMediaFormat
  }) : '';
  if (!label && !icon && !details && !image) return '';
  return `<li class="reading-entry">
    ${icon || label ? `<div class="reading-entry-title">
      ${icon ? `<img src="${e(icon)}" alt="${e(row.icon.name)}" width="35" height="35" referrerpolicy="no-referrer">` : ''}
      ${label ? `<strong>${e(label)}</strong>` : ''}
    </div>` : ''}
    ${renderReferenceLink(row.target, drafts)}
    ${details ? `<dl>${details}</dl>` : ''}
    ${image}
  </li>`;
}

function readingList(listId, draft, type, drafts) {
  const rows = draft.rows[listId];
  const definition = type.lists[listId];
  if (listId === 'images') {
    const image = draft.mainImage;
    const detached = image && !rows.some(row => mainImageMatches(image, row))
      ? `<figure class="reading-main-image">
        ${renderMedia(image.url, image.title, { format: image.format, fallbackFormat: definition.defaultMediaFormat })}
        <figcaption>${e(image.title)} · Hauptbild</figcaption>
      </figure>` : '';
    const items = rows.map((row, index) => pictureVariant(row, index, draft, definition.defaultMediaFormat)).join('');
    return detached + (items ? `<ul class="reading-variants">${items}</ul>` : '');
  }
  if (listId === 'decisions') return renderDecisionReading(rows);
  if (listId === 'relations') {
    return Object.entries(type.relationGroups).map(([id, label]) => {
      const items = rows.filter(row => row.category === id).map(row => readingRow(definition, row, drafts)).join('');
      return items && `<h4>${e(label)}</h4><ul class="reading-entries">${items}</ul>`;
    }).join('');
  }
  const items = rows.map(row => readingRow(definition, row, drafts)).join('');
  return items && `<h4>${e(definition.title)}</h4><ul class="reading-entries">${items}</ul>`;
}

export function renderConceptReading(draft, drafts) {
  const type = CONCEPT_TYPES[draft.kind];
  const sections = type.tabs.map(tab => {
    const fields = tab.groups.flatMap(group => group.fields)
      .map(field => readingField(field, draft.fields, ['name', 'stage'])).join('');
    const lists = tab.lists.map(listId => readingList(listId, draft, type, drafts)).join('');
    if (!fields && !lists) return '';
    return `<section class="reading-section">
      <h3>${artImage(tab.art)}${e(tab.label)}</h3>
      ${fields ? `<dl class="reading-fields">${fields}</dl>` : ''}
      ${lists}
    </section>`;
  }).join('');
  return `<div class="concept-reading" aria-label="Lesefassung">
    ${sections || '<p class="concept-section-hint">Sobald du den Entwurf ausfüllst, erscheint hier seine Lesefassung.</p>'}
  </div>`;
}
