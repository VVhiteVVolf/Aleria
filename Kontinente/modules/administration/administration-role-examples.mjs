import { element, pin } from './administration-cards.mjs';
import { ROLE_EXAMPLES, ROLE_EXAMPLE_GROUPS } from './data/role-examples.mjs';

export function renderRoleExamples(area) {
  const examples = ROLE_EXAMPLES[area.id];
  if (!examples) return null;
  const section = element('section', 'administration-role-examples');
  section.dataset.roleExamples = area.id;
  const heading = element('h3', '', `Weitere Rollen · ${area.name}`);
  heading.id = `administration-role-examples-${area.id}`;
  section.append(heading, element('p', 'administration-examples-intro',
    'Anregungen für eigene Rollen: regelmäßige Dienste, unterstützende Nebenrollen und besondere Aufträge. Umfang und Ausgestaltung richten sich nach dem jeweiligen Hof oder Verwaltungsgebiet.'));
  const table = element('table', 'administration-dialog-table administration-examples-table');
  table.setAttribute('aria-labelledby', heading.id);
  const head = element('thead');
  const header = element('tr');
  for (const label of ['Rolle', 'Kurzbeschreibung']) {
    const cell = element('th', '', label);
    cell.scope = 'col';
    header.append(cell);
  }
  head.append(header);
  table.append(head);
  for (const [kind, title] of Object.entries(ROLE_EXAMPLE_GROUPS)) {
    const body = element('tbody');
    body.dataset.exampleKind = kind;
    const groupRow = element('tr', 'administration-example-group');
    const groupHeading = element('th', '', title);
    groupHeading.colSpan = 2;
    groupHeading.scope = 'rowgroup';
    groupRow.append(groupHeading);
    body.append(groupRow);
    for (const [name, description] of examples[kind]) {
      const row = element('tr');
      const role = element('th');
      role.scope = 'row';
      const label = element('span', 'administration-example-role');
      label.append(pin(area.id, 'bronze'), element('span', '', name));
      role.append(label);
      row.append(role, element('td', '', description));
      body.append(row);
    }
    table.append(body);
  }
  section.append(table);
  return section;
}
