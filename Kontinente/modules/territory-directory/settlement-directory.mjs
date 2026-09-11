import { element, detailList, directoryLink, entryHeading } from './directory-elements.mjs?v=panels-20260911a';

// A single renderer for settlements extracted from old tables and new territory data.
export function renderSettlementDomain(domain) {
  const places = domain.places || [];
  const count = places.filter(place => place.kind !== 'separator').length;
  const section = element('section', 'kingdom-domain-card territory-directory');
  const header = element('header', 'kingdom-domain-header');
  if (domain.crest) {
    const crest = element('div', 'kingdom-domain-crest');
    crest.append(domain.crest);
    header.append(crest);
  }
  const title = element('div', 'kingdom-domain-title');
  const heading = element('h3');
  if (domain.href) heading.append(directoryLink(domain.href, '', domain.title || 'Herrschaft'));
  else heading.textContent = domain.title || 'Herrschaft';
  title.append(heading);
  if (domain.center && count) title.append(detailList('kingdom-domain-meta', [
    { label: 'Zentrum', value: domain.center, href: domain.centerHref },
  ]));
  header.append(title);
  if (count) header.append(element('span', 'directory-place-count', `${count} ${count === 1 ? 'Ort' : 'Orte'}`));
  section.append(header);
  const grid = element('div', 'kingdom-place-grid');
  for (const place of places) grid.append(renderPlaceCard(place));
  if (!count && domain.center) grid.append(renderPlaceCard({
    name: domain.center, type: 'Zentrum', typeLabel: 'Funktion', image: domain.centerImage, href: domain.centerHref,
  }));
  section.append(grid);
  return section;
}

function renderPlaceCard(place) {
  if (place.kind === 'separator') return element('h4', 'kingdom-place-separator', place.title || 'Orte');
  const card = element('article', `kingdom-place-card${place.href ? ' is-linked' : ''}`);
  const icon = element('div', 'kingdom-place-icon-frame');
  icon.append(place.image || element('span', 'directory-place-placeholder', 'Bild folgt'));
  const copy = element('div', 'directory-entry-copy');
  copy.append(entryHeading('kingdom-place-name', place.name || 'Unbenannter Ort', place.href, 'kingdom-place-card-link'));
  if (place.type && !['Nicht zugeteilt', 'Siedlung/Ort'].includes(place.type)) {
    // Existing sources mix place kinds with affiliations (for example orders).
    // Keep that information without presenting every affiliation as a place kind.
    copy.append(detailList('', [{ label: place.typeLabel || 'Einordnung', value: place.type, className: 'kingdom-place-type' }]));
  }
  card.append(icon, copy);
  return card;
}
