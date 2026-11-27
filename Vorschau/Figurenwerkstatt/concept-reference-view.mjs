import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { conceptReferenceHref } from './concept-catalogs.mjs';
import { conceptTitle } from './concept-schema.mjs';

export function referencedName(row, drafts) {
  if (!row.target) return row.name || '';
  const draft = row.target.type === 'draft' && drafts.find(entry => entry.id === row.target.id);
  return draft ? conceptTitle(draft) : row.target.name;
}

export function renderReferenceLink(target, drafts) {
  if (!target) return '';
  if (target.type === 'draft') {
    return drafts.some(draft => draft.id === target.id)
      ? `<button type="button" class="concept-link" data-action="select-draft" data-id="${e(target.id)}">Entwurf öffnen ↗</button>`
      : '<span class="concept-reference-status">Verknüpfter Entwurf fehlt in dieser Mappe.</span>';
  }
  const href = conceptReferenceHref(target);
  const label = target.type === 'house' ? (target.page ? 'Hausakte öffnen' : 'Stammbaum öffnen') : 'Almanachfigur öffnen';
  return href ? `<a class="concept-link" href="${e(href)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>` : '';
}
