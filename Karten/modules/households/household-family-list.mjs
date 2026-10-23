export function familyCrest(family) {
  const image = document.createElement('img');
  image.src = family.crest; image.alt = family.name; image.draggable = false;
  image.addEventListener('error', () => { image.hidden = true; }, { once: true });
  return image;
}

export function createFamilyList(families) {
  const list = document.createElement('ul'); list.className = 'household-family-list';
  for (const family of families) {
    const item = document.createElement('li'), link = document.createElement('a');
    link.href = family.href; link.target = '_blank'; link.rel = 'noopener';
    const caption = document.createElement('span');
    const name = document.createElement('strong'); name.textContent = family.name;
    const role = document.createElement('small'); role.textContent = family.role;
    caption.append(name, role); link.append(familyCrest(family), caption); item.append(link); list.append(item);
  }
  return list;
}

export function createRegionDirectory(region) {
  const directory = document.createElement('section'); directory.className = 'household-region-directory';
  const title = document.createElement('h4'); title.textContent = `${region.name} · ${region.total} Häuser`;
  const note = document.createElement('p'); note.className = 'household-count';
  note.textContent = 'Weitere Häuser der Herrschaft. Diese Übersicht bedeutet keinen Wohnsitz in der Stadt.';
  directory.append(title, note);
  for (const section of region.sections) {
    const heading = document.createElement('h5'); heading.textContent = section.title;
    directory.append(heading, createFamilyList(section.families));
  }
  return directory;
}
