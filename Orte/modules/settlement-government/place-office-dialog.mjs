import { escapeHtml as e } from '../../../Vorschau/shared/country-workbench/render.mjs';
import { createOfficeDialog } from '../../../Kontinente/modules/administration/administration-office-dialog.mjs';
import { preparationHref } from '../../../shared/cenyr-administration/office-appointments.mjs';
import { LEHENSWARTE_ID } from '../../../shared/cenyr-administration/lehenswarte-plan.mjs';
import { governmentCard, governmentContext, governmentSectionTitle, handleGovernmentPortraitError } from './place-government-cards.mjs';

function renderPlaceOffice(body, { role, definition, head, sections, people, href, selected }) {
  const card = post => governmentCard(post, people, governmentContext(definition, post), { duties: true, selected: post.key === selected });
  const responsibilities = head?.reportsTo ? `<p class="place-office-supervisor">Untersteht ${e(head.reportsTo)}</p>` : '';
  const leadership = head ? `<ul class="place-office-lead">${card(head)}</ul>${responsibilities}`
    : role.description ? `<p class="place-office-supervisor">${e(role.description)}</p>` : '';
  const groups = sections.map(group => `<section class="place-office-group">
    ${group.title ? governmentSectionTitle('h3', group.title, group.icon) : ''}
    ${group.description ? `<p>${e(group.description)}</p>` : ''}<ul>${group.slots.map(card).join('')}</ul>
    </section>`).join('');
  body.innerHTML = `${leadership}${groups}${href ? `<footer class="place-office-footer">
    <a class="administration-planning-link" href="${e(href)}">${head ? 'Amt' : 'Ortsrat'} in der Werkstatt öffnen ↗</a></footer>` : ''}`;
  return body;
}

export function bindPlaceOfficeDialog(section) {
  let view;
  let dialog;
  section.addEventListener('click', event => {
    const trigger = event.target.closest('button[data-government-office]');
    if (!trigger || !view) return;
    const { definition, plan, plans, people, scope } = view;
    const { governmentOffice: id, governmentPost: selected } = trigger.dataset;
    const council = id === 'ortsrat' && plan.sections.find(group => group.id === id);
    const department = council ? plan : plans[id];
    if (!department) return;
    const head = council ? null : department.head;
    const group = council ? {} : plan.sections.find(group => group.slots.some(slot => slot.department === id)) || { title: 'Ortsleitung' };
    const href = scope && preparationHref(scope.id, LEHENSWARTE_ID, department.department.id, council ? selected : undefined);
    dialog ||= createOfficeDialog({ viewClass: 'place-office-dialog', titleId: 'place-office-title',
      closeLabel: 'Amtsstruktur schließen', renderView: renderPlaceOffice });
    dialog.open({
      role: head || council, area: { title: `${definition.label} ${definition.place}` }, group, tier: 'gold',
      definition, people, head, sections: council ? [{ ...council, title: '', description: '' }] : department.sections,
      href, selected,
    }, trigger);
  });
  section.ownerDocument.addEventListener('error', event => {
    if (event.target.closest?.('.place-office-dialog')) handleGovernmentPortraitError(event);
  }, true);
  return next => { view = next; };
}
