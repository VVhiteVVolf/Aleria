import { element, renderRoleGroup } from './administration-cards.mjs';
import { withVassals } from './administration-model.mjs';
import { scopeForTerritory } from '../../../shared/cenyr-administration/scopes.mjs';
import { officialCouncil, preparationHref } from '../../../shared/cenyr-administration/official-office-model.mjs';
import { CENYR_FORCES } from '../../../shared/cenyr-administration/military-organization.mjs';

const loaders = {
  militaer: () => import('./data/celtigerns-militaer.mjs?v=20261028'),
  klerus: () => import('./data/celtigerns-klerus.mjs?v=20261031-euddogwy'),
  gerichtsbarkeit: () => import('./data/celtigerns-gerichtsbarkeit.mjs?v=20261028'),
  finanzen: () => import('./data/celtigerns-finanzen.mjs?v=20261028'),
  spionage: () => import('./data/celtigerns-spionage.mjs?v=20261028'),
  diplomatie: () => import('./data/celtigerns-diplomatie.mjs?v=20261029-balchder'),
  magie: () => import('./data/celtigerns-magie.mjs?v=20261028'),
  unterhaltung: () => import('./data/celtigerns-unterhaltung.mjs?v=20261028'),
};

function militaryForces(scopeId) {
  const details = element('details', 'administration-dialog-details');
  details.dataset.role = 'military-forces';
  const list = element('dl', 'administration-force-list');
  for (const force of CENYR_FORCES) {
    const description = element('dd', '', force.text);
    if (force.id === 'hausmacht' || force.id === 'kirche') {
      const path = force.id === 'hausmacht' ? ['hof', 'hof-hausmacht'] : ['klerus'];
      const link = element('a', 'administration-module-link', force.id === 'hausmacht' ? 'Hausmacht in der Werkstatt öffnen ↗' : 'Kirchliche Ämter in der Werkstatt öffnen ↗');
      link.href = preparationHref(scopeId, ...path);
      description.append(' ', link);
    }
    list.append(element('dt', '', force.title), description);
  }
  details.append(element('summary', '', 'Die fünf Arten von Streitkräften'), list);
  return details;
}

export async function renderStructuredAdministration(scopeId, areaId) {
  const scope = scopeForTerritory(scopeId);
  if (!scope || !loaders[areaId]) return null;
  const county = scope.rank === 'county';
  const [{ default: source }, { default: vassals, territorialContacts }] = county ? await Promise.all([
    loaders[areaId](), import('./data/celtigerns-vassals.generated.mjs?v=20261028'),
  ]) : [{}, {}];
  const official = officialCouncil(scopeId, areaId, source);
  if (!official) return null;
  const area = {
    id: areaId, title: source?.title || window.ALERIA_ADMINISTRATION_CONTENT.areas.find(entry => entry.id === areaId)?.name,
    ...source, groups: official.groups, jurisdiction: county ? 'Celtigerns Wacht' : official.house.title,
  };
  if (county) area.groups = withVassals(area, vassals).groups;
  const view = element('div', 'administration-structured');
  view.dataset.areaId = area.id;
  if (scope.legacyCouncil) view.dataset.legacyCouncil = 'true';
  const intro = element('div', 'administration-area-intro');
  intro.append(element('p', '', area.intro || official.house.title));
  const legend = element('div', 'administration-rank-legend');
  legend.setAttribute('aria-label', 'Rangabzeichen');
  [['gold', area.id === 'militaer' ? 'Leitung · Marschälle' : 'Leitung'], ['silver', area.id === 'militaer' ? 'Adjutantur · Kriegswarte' : 'Adjutantur · Vasallen · Kernämter'], ['bronze', 'Sonderrollen · Dienste']].forEach(([tier, label]) => {
    const item = element('span', `is-${tier}`, label);
    legend.append(item);
  });
  intro.append(legend);
  const planning = element('a', 'administration-module-link', 'Besetzung in der Werkstatt bearbeiten ↗');
  planning.href = preparationHref(scope.id, areaId);
  intro.append(planning);
  view.append(intro);
  if (areaId === 'militaer') view.append(militaryForces(scope.id));
  const recurring = area.groups.filter(group => group.collapsible);
  area.groups.filter(group => !group.collapsible).forEach(group => view.append(renderRoleGroup(group, area)));
  if (recurring.length) {
    const heading = element('h3', 'administration-recurring-heading', 'Niedere, Sonder- und übrige Rollen');
    view.append(heading);
    for (const group of recurring) {
      const details = element('details', 'administration-dialog-details');
      details.append(element('summary', '', `${group.title} · ${group.roles.length} Posten`), renderRoleGroup(group, area));
      view.append(details);
    }
  }
  if (territorialContacts?.length) {
    view.append(renderRoleGroup({ id: 'territorial-contacts', title: 'Territoriale Verbindungen', kind: 'service',
      description: 'Ansprechstellen ohne ausgearbeiteten eigenen Fachrat. Eine territoriale Verbindung begründet kein zusätzliches Fachamt.',
      roles: territorialContacts.map(contact => ({ ...contact, links: [{ label: 'Territoriale Zuständigkeit ansehen', href: contact.href }] })),
    }, area));
  }
  if (area.sources?.length) {
    const sources = element('details', 'administration-dialog-details');
    sources.append(element('summary', '', 'Quellen und weiterführende Artikel'));
    const list = element('ul', 'administration-source-list');
    area.sources.forEach(source => {
      const li = element('li');
      const link = element('a', '', source.label);
      link.href = source.href;
      li.append(link); list.append(li);
    });
    sources.append(list); view.append(sources);
  }
  return view;
}
