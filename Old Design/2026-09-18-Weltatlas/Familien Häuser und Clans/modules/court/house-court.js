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
    card.append(element(documentRef, 'div', 'house-court-unassigned', 'Amtsinhaber nicht überliefert'));
  }
  const name = element(documentRef, entry.href ? 'a' : 'p', 'house-court-name', entry.name);
  if (entry.href) {
    name.href = entry.href;
    name.setAttribute('aria-label', `${entry.name} im Stammbaum öffnen`);
  }
  card.append(name);
  if (entry.detail) card.append(element(documentRef, 'p', 'house-court-detail', entry.detail));
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

// Optional structured court replaces only the owning house's legacy court table.
export function renderHouseCourt(root, court) {
  if (!Array.isArray(court?.groups)) return;
  const target = root.querySelector('[data-haeuser-court], [data-orte-table-id="haeuser-hof"]');
  if (!target) return;
  const documentRef = root.ownerDocument;
  const content = element(documentRef, 'div', 'house-court');
  content.dataset.haeuserCourt = '';
  if (court.cadets?.length) content.append(renderGroup(documentRef, {
    id: 'cadets', title: 'Kadettenhäuser', entries: court.cadets,
  }, true));
  for (const group of court.groups) content.append(renderGroup(documentRef, group));
  target.replaceWith(content);
}
