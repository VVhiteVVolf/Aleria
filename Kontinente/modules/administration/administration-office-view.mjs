import { element, pin, portraitImage } from './administration-cards.mjs';
import { dutyIcon } from './office-duty-icons.mjs';

function factsFor(role, group, area) {
  const facts = element('dl', 'administration-office-facts');
  const rows = [
    ['Bereich', role.areaTitle || area.title], ['Amtsebene', group.title],
    ['Zuständig für', role.jurisdiction || area.jurisdiction],
    ['Berichtet an', role.reportsTo || area.reportsTo],
    ['Besetzung', role.name ? 'Besetzt' : 'Nicht benannt'],
    ...(role.facts || []),
  ];
  for (const [term, value] of rows) {
    if (!value) continue;
    const pair = element('div');
    pair.append(element('dt', '', term), element('dd', '', value));
    facts.append(pair);
  }
  return facts;
}

function personFor(role, group, area, tier) {
  const aside = element('aside', `administration-office-person is-${tier}`);
  const identity = element('div', 'administration-office-identity');
  const frame = element('div', 'administration-portrait-frame');
  frame.append(portraitImage(role.portrait, role.name));
  identity.append(frame, pin(role.areaId || area.id, tier), element('h3', '', role.name || 'Nicht benannt'));
  const predecessor = element('div', 'administration-predecessor');
  const previous = role.predecessor;
  predecessor.append(portraitImage(previous?.portrait, previous?.name));
  const label = element(previous?.href ? 'a' : 'span', '', previous?.name ? `Vorgänger · ${previous.name}` : 'Vorgänger');
  if (previous?.href) label.href = previous.href;
  predecessor.append(label);
  aside.append(identity, factsFor(role, group, area), predecessor);
  return aside;
}

function crewFor(crew) {
  const section = element('section', 'administration-office-crew');
  section.append(element('h3', '', crew.label || 'Schiffsmannschaft'));
  const image = portraitImage(crew.image || '/Kontinente/modules/administration/assets/crew-flag-placeholder.svg');
  image.className = 'administration-office-flag';
  section.append(image);
  if (crew.href) {
    const link = element('a', 'administration-module-link', 'Schiffsmannschaft im Almanach öffnen ↗');
    link.href = crew.href;
    section.append(link);
  } else section.append(element('p', '', 'Die eigene Schiffsmannschaft ist für diesen Posten vorgesehen. Flagge, Schiff und Besatzung sind noch nicht ausgearbeitet.'));
  return section;
}

export function renderOfficeView(body, { role, group, area, tier }, onNavigate) {
  const text = element('section', 'administration-office-content');
  text.tabIndex = 0;
  text.setAttribute('aria-label', `Aufgaben und Zuständigkeiten · ${role.title}`);
  text.append(element('span', 'administration-eyebrow', area.title), element('h3', '', 'Aufgabe und Verantwortung'));
  for (const paragraph of [role.description, role.practice].flat().filter(Boolean)) text.append(element('p', '', paragraph));
  if (role.authority) text.append(element('h3', '', 'Vollmacht und Grenzen'), element('p', '', role.authority));
  if (role.crew) text.append(crewFor(role.crew));
  if (role.connections?.length) {
    text.append(element('h3', '', 'Zusammenarbeit mit anderen Bereichen'));
    for (const connection of role.connections) {
      const entry = element('div', 'administration-office-connection');
      const link = element(onNavigate ? 'button' : 'span', onNavigate ? 'administration-crosslink' : '', connection.label);
      if (onNavigate) {
        link.type = 'button';
        link.addEventListener('click', () => onNavigate(connection.area));
      }
      entry.append(link, element('p', '', connection.description));
      text.append(entry);
    }
  }
  if (role.links?.length) {
    const links = element('div', 'administration-office-links');
    for (const item of role.links) {
      const link = element('a', 'administration-module-link', item.label);
      link.href = item.href;
      links.append(link);
    }
    text.append(links);
  }
  if (role.duties?.length) {
    const duties = element('section', 'administration-office-duties');
    duties.append(element('h3', '', 'Kernaufgaben des Amtes'));
    const list = element('ul');
    for (const duty of role.duties) {
      const item = element('li');
      const image = element('img');
      image.src = dutyIcon(duty.icon);
      image.alt = '';
      image.width = 40; image.height = 40;
      item.append(image, element('span', '', duty.text));
      list.append(item);
    }
    duties.append(list); text.append(duties);
  }
  const pane = element('div', 'administration-office-pane');
  pane.append(text);
  body.replaceChildren(personFor(role, group, area, tier), pane);
  return text;
}
