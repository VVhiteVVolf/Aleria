import { element, renderRoleGroup } from './administration-cards.mjs';
import { withVassals } from './administration-model.mjs';

const loaders = {
  militaer: () => import('./data/celtigerns-militaer.mjs?v=20261028'),
  klerus: () => import('./data/celtigerns-klerus.mjs?v=20261028'),
  gerichtsbarkeit: () => import('./data/celtigerns-gerichtsbarkeit.mjs?v=20261028'),
  finanzen: () => import('./data/celtigerns-finanzen.mjs?v=20261028'),
  spionage: () => import('./data/celtigerns-spionage.mjs?v=20261028'),
  diplomatie: () => import('./data/celtigerns-diplomatie.mjs?v=20261028'),
  magie: () => import('./data/celtigerns-magie.mjs?v=20261028'),
  unterhaltung: () => import('./data/celtigerns-unterhaltung.mjs?v=20261028'),
};

export async function renderStructuredAdministration(scopeId, areaId) {
  if (scopeId !== 'grafschaft-celtigerns-wacht' || !loaders[areaId]) return null;
  const [{ default: source }, { default: vassals, territorialContacts }] = await Promise.all([
    loaders[areaId](), import('./data/celtigerns-vassals.generated.mjs?v=20261028'),
  ]);
  const area = withVassals(source, vassals);
  const view = element('div', 'administration-structured');
  view.dataset.areaId = area.id;
  const intro = element('div', 'administration-area-intro');
  intro.append(element('span', 'administration-eyebrow', 'Ämter · Menschen · Verantwortung'), element('p', '', area.intro));
  const legend = element('div', 'administration-rank-legend');
  legend.setAttribute('aria-label', 'Rangabzeichen');
  [['gold', area.id === 'militaer' ? 'Leitung · Marschälle' : 'Leitung'], ['silver', area.id === 'militaer' ? 'Adjutantur · Kriegswarte' : 'Adjutantur · Vasallen · Kernämter'], ['bronze', 'Sonderrollen · Dienste']].forEach(([tier, label]) => {
    const item = element('span', `is-${tier}`, label);
    legend.append(item);
  });
  intro.append(legend);
  view.append(intro);
  area.groups.forEach(group => view.append(renderRoleGroup(group, area)));
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
