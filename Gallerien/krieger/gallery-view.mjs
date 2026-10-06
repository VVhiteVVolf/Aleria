export function galleryElement(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

export function assetUrl(path) {
  return new URL(`../../${path.split('/').map(encodeURIComponent).join('/')}`, import.meta.url).href;
}

function treeUrl(path) {
  return new URL(`../../${path}`, import.meta.url).href;
}

function imageTile(image) {
  const figure = galleryElement('figure', 'image-tile');
  const button = galleryElement('button');
  button.type = 'button';
  button.dataset.action = 'open-image';
  button.dataset.imageId = image.id;
  button.setAttribute('aria-label', `${image.name} – vergrößern und zuordnen`);
  const img = galleryElement('img');
  img.src = assetUrl(image.thumbnail || image.image);
  img.alt = image.name;
  img.loading = 'lazy';
  img.decoding = 'async';
  button.append(img);
  figure.append(button, galleryElement('figcaption', '', image.name));
  return figure;
}

function houseCard(house, images, compact) {
  const card = galleryElement('article', `house-card${compact ? ' house-card--compact' : images.length > 1 ? ' house-card--collection' : ''}`);
  card.dataset.houseId = house.id;
  const header = galleryElement('div', 'house-card-header');
  header.append(galleryElement('h3', '', house.name), galleryElement('p', 'house-meta', house.location), galleryElement('p', 'house-meta', house.rank));
  if (house.kind === 'mentioned') header.append(galleryElement('p', 'house-meta', 'Nur im Stammbaum erwähnt · Name / Linie'));
  if (compact && !images.length) header.append(galleryElement('p', 'missing-description', house.missingNote || 'Noch keine passende Krieger- oder Rüstungsdarstellung im erfassten Bestand.'));
  card.append(header);
  if (!compact) {
    const grid = galleryElement('div', images.length > 1 ? 'collection-grid' : 'single-illustration');
    grid.append(...images.map(imageTile));
    card.append(grid);
  }
  const footer = galleryElement('div', 'house-card-footer');
  footer.append(galleryElement('span', `status${images.length ? '' : ' missing'}`, images.length ? `${images.length} ${images.length === 1 ? 'Illustration' : 'Illustrationen'}` : 'Illustration fehlt'));
  if (compact && images.length) {
    const button = galleryElement('button', 'quiet-button', 'Bilder ansehen');
    button.type = 'button';
    button.dataset.action = 'show-house';
    button.dataset.houseId = house.id;
    footer.append(button);
  }
  const tree = galleryElement('a', '', house.kind === 'mentioned' ? 'Fundstelle ↗' : 'Stammbaum ↗');
  tree.href = treeUrl(house.tree);
  tree.target = '_blank';
  tree.rel = 'noopener';
  footer.append(tree);
  card.append(footer);
  return card;
}

function section(title, count) {
  const element = galleryElement('section', 'region-section');
  const heading = galleryElement('div', 'region-heading');
  heading.append(galleryElement('h3', '', title), galleryElement('span', '', count));
  const grid = galleryElement('div', 'house-grid');
  element.append(heading, grid);
  return { element, grid };
}

export function renderHouseResults(root, houses, state, compact) {
  const groups = new Map();
  for (const house of houses) {
    if (!groups.has(house.region)) groups.set(house.region, []);
    groups.get(house.region).push(house);
  }
  const regions = [...groups.keys()].sort((a, b) => {
    const priority = key => key === 'Cenyr' ? 0 : key === 'Nur im Stammbaum erwähnt' ? 2 : 1;
    return priority(a) - priority(b) || a.localeCompare(b, 'de');
  });
  const fragment = document.createDocumentFragment();
  const imageIds = [];
  for (const region of regions) {
    const entries = groups.get(region);
    if (!compact) entries.sort((a, b) => state.imagesFor(b.id).length - state.imagesFor(a.id).length || a.name.localeCompare(b.name, 'de'));
    const group = section(region, `${entries.length} ${region === 'Nur im Stammbaum erwähnt' ? 'Namen / Linien' : 'Häuser'}`);
    for (const house of entries) {
      const images = state.imagesFor(house.id);
      imageIds.push(...images.map(i => i.id));
      group.grid.append(houseCard(house, images, compact));
    }
    fragment.append(group.element);
  }
  if (!houses.length) fragment.append(galleryElement('p', 'no-results', 'Keine Treffer für diese Auswahl. Suche oder Filter zurücksetzen.'));
  root.replaceChildren(fragment);
  return [...new Set(imageIds)];
}

export function renderOtherResults(root, images, groupByCollection = false) {
  const groupName = image => groupByCollection ? image.collection || image.category : image.category;
  const categories = [...new Set(images.map(groupName))].sort((a, b) => a.localeCompare(b, 'de'));
  const fragment = document.createDocumentFragment();
  for (const category of categories) {
    const entries = images.filter(image => groupName(image) === category);
    const group = section(category, `${entries.length} Illustrationen`);
    for (const image of entries) {
      const card = galleryElement('article', 'house-card');
      const header = galleryElement('div', 'house-card-header');
      header.append(galleryElement('h3', '', image.affiliation || 'Zuordnung offen'));
      card.append(header, imageTile(image));
      group.grid.append(card);
    }
    fragment.append(group.element);
  }
  if (!images.length) fragment.append(galleryElement('p', 'no-results', 'Keine weiteren Darstellungen für diese Suche.'));
  root.replaceChildren(fragment);
  return images.map(image => image.id);
}

export function renderStatistics(root, catalog, state) {
  const registered = catalog.houses.filter(h => h.kind === 'registered');
  const illustrated = registered.filter(h => state.imagesFor(h.id).length).length;
  const values = [[catalog.illustrations.length, 'Illustrationen'], [registered.length, 'Registerhäuser'], [illustrated, 'Häuser mit Bildern'], [registered.length - illustrated, 'Häuser ohne Bild']];
  root.replaceChildren(...values.map(([count, label]) => {
    const stat = galleryElement('div', 'stat');
    stat.append(galleryElement('strong', '', String(count)), galleryElement('span', '', label));
    return stat;
  }));
}
