import { element as officeElement, renderRoleGroup, roleFor } from '../../../Kontinente/modules/administration/administration-cards.mjs';
import { createOfficeDialog } from '../../../Kontinente/modules/administration/administration-office-dialog.mjs?v=20261028-office-body-v2';
import { hasNobleCourt, houseOfficeRole, partitionHouseCourtEntries } from './house-court-model.mjs?v=kingdoms-20261101';
import { legacyCourtOffices } from './house-court-legacy.mjs?v=20261028-office-body-v2';
import { indexCourtEntries } from '../../../shared/cenyr-administration/court-plan.mjs';
import { officialCourt, officialGroups, officialRole, preparationHref } from '../../../shared/cenyr-administration/official-office-model.mjs';

const controllers = new WeakMap();
const legacyTemplates = new WeakMap();

function element(documentRef, tag, className, text) {
  const node = documentRef.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderCard(documentRef, entry, crest = false) {
  const card = element(documentRef, 'article', 'house-court-card');
  if (entry.role) card.append(element(documentRef, 'h4', 'house-court-role', entry.role));
  if (entry.imageKey) {
    const slot = element(documentRef, 'span', `orte-image-slot house-court-image${crest ? ' house-court-crest' : ''}`);
    Object.assign(slot.dataset, {
      orteImageKey: entry.imageKey, orteImageLabel: entry.name,
      orteImageFormat: crest ? 'square' : 'portrait', orteImageMaxHeight: '210',
    });
    card.append(slot);
  } else {
    card.append(element(documentRef, 'div', 'house-court-unassigned', 'Kein Portrait überliefert'));
  }
  const name = element(documentRef, entry.href ? 'a' : 'p', 'house-court-name', entry.name);
  if (entry.href) {
    name.href = entry.href;
    name.setAttribute('aria-label', `${entry.name} im Stammbaum öffnen`);
  }
  card.append(name);
  if (entry.detail && entry.detail !== entry.role) card.append(element(documentRef, 'p', 'house-court-detail', entry.detail));
  return card;
}

function renderGroup(documentRef, group, crest = false) {
  const section = element(documentRef, 'section', 'house-court-group');
  section.dataset.courtGroup = group.id;
  section.append(element(documentRef, 'h3', 'house-court-heading', group.title));
  if (group.note) section.append(element(documentRef, 'p', 'house-court-note', group.note));
  const grid = element(documentRef, 'div', 'house-court-grid');
  for (const entry of group.entries) grid.append(renderCard(documentRef, entry, crest));
  section.append(grid);
  return section;
}

function renderOffices(group, data) {
  const { scope, house, plans } = officialCourt(data.meta?.id, group.entries);
  const sources = new Map(indexCourtEntries(group.entries).map(({ id, entry }) => [id, entry]));
  const roleForDepartment = slot => officialRole(slot, undefined, true, scope?.id);
  const roleForSlot = slot => {
    const base = sources.get(slot.id) || { role: slot.title };
    const source = houseOfficeRole(base, plans.hof.slots.indexOf(slot), data);
    if (scope && slot.id === 'hausmacht') {
      source.description = [slot.description, base.detail].filter(Boolean);
      source.reportsTo = house.offices.militaer.title;
    }
    const role = officialRole(slot, source, Boolean(house && slot.holder), scope?.id);
    const department = plans[slot.department];
    role.hierarchy = department && officialGroups(department, [], roleForDepartment);
    if (scope && department) role.planningHref = preparationHref(scope.id, 'hof', slot.department);
    if (scope?.id === 'draig' && slot.id === 'hausmacht') role.links.push({
      label: 'Draig-Leibgarde im Almanach öffnen ↗',
      href: '/AleriaAlmanach/AleriaAlmanach.html?entry=draig-leibgarde',
    });
    return role;
  };
  const area = { id: 'unterhaltung', title: 'Hofämter', jurisdiction: data.name };
  const section = officeElement('section', 'house-court-offices');
  section.dataset.courtGroup = 'offices';
  section.append(officeElement('h3', 'house-court-heading', group.title || 'Hofämter'));
  if (group.note) section.append(officeElement('p', 'house-court-note', group.note));
  if (scope) {
    const link = officeElement('a', 'administration-module-link', 'Hofbesetzung in der Werkstatt bearbeiten ↗');
    link.href = preparationHref(scope.id, 'hof');
    section.append(link);
  }
  const top = plans.hof.leadership;
  section.append(renderRoleGroup({ ...top, id: 'court-leadership', kind: 'court', roles: top.slots.map(roleForSlot) }, area));
  officialGroups(plans.hof, [], roleForSlot).forEach(branch => section.append(renderRoleGroup({ ...branch, kind: 'court' }, area)));
  return section;
}

function mountCourtDialog(root) {
  if (controllers.has(root)) return;
  const controller = createOfficeDialog();
  controllers.set(root, controller);
  root.addEventListener('click', event => {
    const trigger = event.target.closest('.house-court-offices [data-action="open-administration-office"]');
    const data = trigger && roleFor(trigger);
    if (data) controller.open(data, trigger);
  });
}

// Presentation completion only: no assignments are written back to house sources.
export function renderHouseCourt(root, data) {
  const target = root.querySelector('[data-haeuser-court], [data-orte-table-id="haeuser-hof"]');
  if (!target) return;
  if (target.matches('table') && !legacyTemplates.has(root)) legacyTemplates.set(root, target.cloneNode(true));
  const court = data.court;
  if (!Array.isArray(court?.groups) && !hasNobleCourt(data)) return;
  const documentRef = root.ownerDocument;
  const content = element(documentRef, 'div', 'house-court');
  content.dataset.haeuserCourt = '';
  if (court?.cadets?.length) content.append(renderGroup(documentRef, {
    id: 'cadets', title: 'Kadettenhäuser', entries: court.cadets,
  }, true));
  if (Array.isArray(court?.groups)) {
    for (const group of court.groups) {
      if (group.id !== 'offices' || !hasNobleCourt(data)) { content.append(renderGroup(documentRef, group)); continue; }
      const { offices, relationships } = partitionHouseCourtEntries(group.entries);
      content.append(renderOffices({ ...group, entries: offices }, data));
      if (relationships.length) content.append(renderGroup(documentRef, { id: 'court-relations', title: 'Weitere Angehörige und Hausbindungen', entries: relationships }));
    }
    if (hasNobleCourt(data) && !court.groups.some(group => group.id === 'offices')) content.append(renderOffices({ entries: [] }, data));
  } else {
    const table = legacyTemplates.get(root)?.cloneNode(true);
    const legacy = table && legacyCourtOffices(table, data);
    if (!legacy) return; // Unknown layouts keep their complete original content.
    for (const row of legacy.rows) row.remove();
    content.append(table, renderOffices({ entries: legacy.entries }, data));
  }
  target.replaceWith(content);
  mountCourtDialog(root);
}
