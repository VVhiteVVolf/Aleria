import { element, directoryLink } from './directory-elements.mjs?v=panels-20260911a';

const silhouette = '/Stammbäume/assets/images/placeholders/male.png';

export function renderCouncilGroups(groups) {
  const view = element('div', 'territory-council');
  view.dataset.kontinenteGeneratedView = '';
  for (const group of groups) {
    if (!group.members?.length && !group.links?.length) continue;
    const section = element('section', 'herrschaft-person-group');
    section.append(element('h3', '', group.title || 'Amtsträger'));
    if (group.members?.length) {
      const grid = element('div', 'herrschaft-person-grid');
      for (const member of group.members) grid.append(renderCouncilMember(member));
      section.append(grid);
    }
    for (const item of group.links || []) {
      const link = directoryLink(item.href, 'council-section-link', '');
      if (item.image) link.append(item.image);
      link.append(element('span', '', item.label));
      section.append(link);
    }
    view.append(section);
  }
  return view;
}

function renderCouncilMember(member) {
  const card = element('article', `herrschaft-person-card${member.featured ? ' is-featured' : ''}`);
  card.append(element('span', 'herrschaft-person-office', member.office || 'Amt nicht angegeben'));
  const portrait = element('div', 'herrschaft-person-portrait');
  const image = member.image?.tagName === 'IMG' ? member.image : element('img');
  if (!image.getAttribute('src')) image.src = silhouette;
  image.alt = member.imageAlt || `Porträt: ${member.name || 'Name nicht überliefert'}`;
  image.loading = 'lazy';
  image.decoding = 'async';
  // Failed legacy external portraits retain a visible, local silhouette.
  image.addEventListener('error', () => { image.src = silhouette; }, { once: true });
  if (member.href) {
    const link = directoryLink(member.href, 'herrschaft-family-link', '');
    link.tabIndex = -1;
    link.setAttribute('aria-hidden', 'true');
    link.append(image);
    portrait.append(link);
  } else portrait.append(image);
  card.append(portrait);
  const name = element('h4', 'herrschaft-person-name');
  const label = member.name || 'Name nicht überliefert';
  name.append(member.href ? directoryLink(member.href, 'herrschaft-family-link', label) : document.createTextNode(label));
  card.append(name);
  if (member.seat) card.append(element('span', 'herrschaft-person-seat', `Sitz: ${member.seat}`));
  if (member.note) card.append(element('small', 'herrschaft-person-note', member.note));
  return card;
}
