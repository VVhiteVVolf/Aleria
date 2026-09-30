// Owns only the optional gallery appended to the house document.
export function renderHouseWarriorGallery(root, gallery) {
  root.querySelector('[data-house-warrior-gallery]')?.remove();
  if (!Array.isArray(gallery?.entries) || !gallery.entries.length) return;
  const document = root.ownerDocument;
  const section = document.createElement('section');
  section.dataset.houseWarriorGallery = '';
  section.className = 'house-warrior-gallery';
  section.id = 'krieger';
  section.setAttribute('aria-labelledby', 'house-warriors-title');
  const heading = document.createElement('h2');
  heading.id = 'house-warriors-title';
  heading.textContent = gallery.title || 'Krieger des Hauses';
  section.append(heading);
  if (gallery.introduction) {
    const introduction = document.createElement('p');
    introduction.textContent = gallery.introduction;
    section.append(introduction);
  }
  const grid = document.createElement('div');
  grid.className = 'house-warrior-gallery__grid';
  for (const entry of gallery.entries) {
    const figure = document.createElement('figure');
    const link = document.createElement('a');
    link.href = entry.image;
    link.setAttribute('aria-label', `${entry.name} – Bild öffnen`);
    const image = document.createElement('img');
    image.src = entry.image;
    image.alt = entry.alt || entry.name;
    image.loading = 'lazy';
    image.decoding = 'async';
    link.append(image);
    const caption = document.createElement('figcaption');
    const name = document.createElement('h3');
    name.textContent = entry.name;
    caption.append(name);
    if (entry.description) {
      const description = document.createElement('p');
      description.textContent = entry.description;
      caption.append(description);
    }
    figure.append(link, caption);
    grid.append(figure);
  }
  section.append(grid);
  root.querySelector('.haeuser-document')?.append(section);
}
