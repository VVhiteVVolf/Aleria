import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { LOWER_ROLE_KINDS, ROLE_KINDS } from '../../shared/cenyr-administration/office-roles.mjs';
import { officeIcon } from '../../shared/cenyr-administration/office-icons.mjs';
import { officeArtwork, renderPost } from './workbench-view.mjs';
import { renameButton } from './office-title-editor.mjs';
import { needsFilling, postOccupant } from './draft-assignment-references.mjs';

export function renderRoleOptions(templates) {
  return '<option value="">Eigene Rolle</option>' + Object.entries(ROLE_KINDS).map(([kind, info]) => {
    const entries = templates.filter(template => template.kind === kind);
    return entries.length ? `<optgroup label="${e(info.heading)}">${entries.map(template =>
      `<option value="${e(template.id)}">${e(template.title)}</option>`).join('')}</optgroup>` : '';
  }).join('');
}

export function openRoleGroups(root) {
  return new Set([...root.querySelectorAll('details[data-role-group][open]')].map(group => group.dataset.roleGroup));
}

export function renderRoleGroups(slots, { people, appointmentLinks }, expanded, revealOccupied = false) {
  const sets = new Map();
  for (const slot of slots) {
    const id = `${slot.roleKey}/${slot.site || ''}`;
    if (!sets.has(id)) sets.set(id, []);
    sets.get(id).push(slot);
  }
  return [...sets.entries()].map(([id, posts]) => {
    const first = posts[0];
    const size = posts.length;
    const vacant = posts.filter(needsFilling).length;
    const icon = first.image || officeIcon(ROLE_KINDS[first.kind].icon);
    return `<div class="role-group-shell"><details class="role-group" data-role-group="${e(id)}" ${expanded.has(id) || (revealOccupied && vacant < size) ? 'open' : ''}>
      <summary>${officeArtwork(icon, 24)}
        <strong>${e(first.roleTitle)}${first.locality ? ` · ${e(first.locality.name)}` : ''}</strong>
        <span>${size} Posten · ${vacant} frei</span>
      </summary>
      ${first.locality?.title ? `<p class="role-reports">Unterstellt: ${e(first.locality.title)}</p>` : ''}
      <button type="button" class="add-role-button" data-action="add-role-like" data-post="${e(first.key)}"
        aria-label="${e(`Weitere Posten hinzufügen: ${first.roleTitle}`)}">+ Weitere Posten</button>
      <div class="post-grid">${posts.map((slot, index) => renderPost(slot, postOccupant(slot, people), {
        ordinal: size > 1 ? index + 1 : 0, collapseDescription: true, appointmentLinks,
      })).join('')}</div>
    </details>${renameButton(first.roleKey, first.roleTitle, 'Rolle', id)}</div>`;
  }).join('');
}

export function renderLowerRoles(slots, view, expanded, revealOccupied = false) {
  return LOWER_ROLE_KINDS.map(kind => {
    const group = slots.filter(slot => slot.kind === kind);
    return `<section class="role-kind"><h5>${ROLE_KINDS[kind].heading}</h5>
      ${group.length ? renderRoleGroups(group, view, expanded, revealOccupied) : '<p class="muted">Keine Posten eingetragen.</p>'}
    </section>`;
  }).join('');
}
