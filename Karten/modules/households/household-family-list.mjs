import { createRosterPortrait, createRosterList } from '../place-roster/place-roster-members.mjs';

export function familyCrest(family) { return createRosterPortrait({ ...family, portrait: family.crest }); }
export function createFamilyList(families) {
  const list = createRosterList(families.map(family => ({ ...family, portrait: family.crest })));
  list.classList.add('household-family-list');
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
