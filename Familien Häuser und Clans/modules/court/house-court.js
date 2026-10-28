import { element as officeElement, renderRoleGroup, roleFor } from '../../../Kontinente/modules/administration/administration-cards.mjs';
import { createOfficeDialog } from '../../../Kontinente/modules/administration/administration-office-dialog.mjs?v=20261028-office-body-v2';
import { completeHouseOffices, hasNobleCourt, houseOfficeRole, partitionHouseCourtEntries } from './house-court-model.mjs?v=20261028-office-body-v2';
import { legacyCourtOffices } from './house-court-legacy.mjs?v=20261028-office-body-v2';

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
  const roles = completeHouseOffices(group.entries, hasNobleCourt(data)).map((entry, index) => houseOfficeRole(entry, index, data));
  const section = renderRoleGroup({ id: 'offices', title: group.title || 'Hofämter', kind: 'court', roles },
    { id: 'unterhaltung', title: 'Hofämter', jurisdiction: data.name });
  section.dataset.courtGroup = 'offices';
  section.classList.add('house-court-offices');
  const note = officeElement('p', 'house-court-note', group.note || 'Unbenannte Ämter bleiben sichtbar. Aufgaben können in kleinen Haushalten von derselben Person wahrgenommen werden.');
  section.querySelector('.administration-group-heading').after(note);
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
