import { element, detailList, directoryLink, entryHeading } from './directory-elements.mjs?v=panels-20260911a';
import { houseRankLabel } from './house-rank.mjs?v=panels-20260911a';

// Receives normalized cards from either saved legacy tables or structured data.
// Link resolution stays with the calling application; no registry or global state here.
export function renderFamilySection(section, { resolveHref = card => card.href } = {}) {
  const block = element('section', 'kingdom-family-section');
  if (section.variant) block.dataset.familyVariant = section.variant;
  const header = element('header', 'directory-section-header');
  header.append(element('h3', '', section.title || 'Häuser'));
  header.append(element('span', 'kingdom-family-count', `${section.cards.length} ${section.cards.length === 1 ? 'Haus' : 'Häuser'}`));
  block.append(header);
  const featured = section.cards.filter(card => card.featured);
  const regular = section.cards.filter(card => !card.featured);
  if (featured.length) {
    const top = element('div', `kingdom-family-featured${regular.length ? ' has-subordinate-houses' : ''}`);
    for (const card of featured) top.append(renderFamilyCard(card, resolveHref(card)));
    block.append(top);
  }
  if (regular.length) {
    const grid = element('div', 'kingdom-family-grid');
    for (const card of regular) grid.append(renderFamilyCard(card, resolveHref(card)));
    block.append(grid);
  }
  return block;
}

function renderFamilyCard(card, href) {
  const node = element('article', `kingdom-family-card${card.featured ? ' is-family-featured' : ''}${href ? ' is-linked' : ''}`);
  if (card.id) node.dataset.houseId = card.id;
  const crest = element('div', 'kingdom-family-crest');
  const hasImage = card.image && !card.image.classList.contains('kingdom-card-image-placeholder');
  const media = hasImage ? card.image : element('span', 'kingdom-family-crest-placeholder', 'Wappen folgt');
  if (href) {
    const link = directoryLink(href, '', '');
    // The visible name provides the keyboard/screen-reader link to the same page.
    link.tabIndex = -1;
    link.setAttribute('aria-hidden', 'true');
    link.append(media);
    crest.append(link);
  } else crest.append(media);
  const copy = element('div', 'directory-entry-copy');
  if (card.featured) copy.append(element('span', 'kingdom-family-status', card.featuredLabel || 'Herrschendes Haus'));
  copy.append(entryHeading('kingdom-family-name', card.name || 'Unbenanntes Haus', href, 'kingdom-family-name-link'));
  const details = [
    { label: 'Sitz', value: card.seat, className: 'kingdom-family-meta-item kingdom-family-meta-seat' },
    { label: 'Lehnsherr', value: card.liege, className: 'kingdom-family-meta-item kingdom-family-meta-liege' },
    { label: 'Rang', value: houseRankLabel(card.rank), className: 'kingdom-family-meta-item kingdom-family-meta-rank' },
  ].filter(entry => entry.value);
  if (details.length) copy.append(detailList('kingdom-family-meta', details));
  else copy.append(element('span', 'directory-entry-note', 'Angaben folgen'));
  node.append(crest, copy);
  return node;
}
