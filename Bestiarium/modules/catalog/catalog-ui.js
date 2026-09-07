import { BESTIARY_CHAPTERS, BESTIARY_ENTRIES, BESTIARY_FILTERS } from './catalog-data.js?v=20260907-natural-species-v1';
import { filterEntries } from './catalog-model.js?v=20260907-bestiarium-v1';
import { createEntryLink } from '../entry-preview/entry-link.js?v=20260907-bestiarium-v1';

function createCard(entry, featured) {
  const card = createEntryLink(entry, `creature-card${featured ? ' creature-card-featured' : ''}`);
  const image = document.createElement('img');
  image.src = entry.image;
  image.alt = '';
  image.width = 384;
  image.height = 384;
  image.loading = 'lazy';
  image.decoding = 'async';
  const copy = document.createElement('span');
  copy.className = 'creature-card-copy';
  const title = document.createElement('strong');
  title.textContent = entry.title;
  copy.append(title);
  if (entry.note) {
    const note = document.createElement('small');
    note.textContent = entry.note;
    copy.append(note);
  }
  if (featured) {
    const caption = document.createElement('span');
    caption.className = 'creature-card-caption';
    caption.textContent = 'Ein besonderes Exemplar';
    copy.append(caption);
  }
  const arrow = document.createElement('span');
  arrow.className = 'creature-card-arrow';
  arrow.textContent = '↗';
  arrow.setAttribute('aria-hidden', 'true');
  card.append(image, copy, arrow);
  return card;
}

function createChapter(chapter) {
  const section = document.createElement('section');
  section.className = `bestiary-chapter chapter-${chapter.kind}`;
  section.id = chapter.id;
  section.setAttribute('aria-labelledby', `title-${chapter.id}`);
  const header = document.createElement('header');
  header.className = 'chapter-heading';
  const number = document.createElement('span');
  number.className = 'chapter-number';
  number.textContent = chapter.number;
  number.setAttribute('aria-hidden', 'true');
  const headingCopy = document.createElement('div');
  const subtitle = document.createElement('p');
  subtitle.className = 'eyebrow';
  subtitle.textContent = chapter.subtitle;
  const title = document.createElement('h2');
  title.id = `title-${chapter.id}`;
  title.textContent = chapter.title;
  const description = document.createElement('p');
  description.className = 'chapter-description';
  description.textContent = chapter.description;
  headingCopy.append(subtitle, title);
  header.append(number, headingCopy);
  section.append(header, description);
  const groups = chapter.groups.map(group => {
    const element = document.createElement('div');
    element.className = 'creature-group';
    const heading = document.createElement('h3');
    heading.textContent = group.title;
    element.append(heading);
    if (group.description) {
      const detail = document.createElement('p');
      detail.className = 'group-description';
      detail.textContent = group.description;
      element.append(detail);
    }
    const grid = document.createElement('div');
    grid.className = group.featured ? 'creature-grid creature-grid-featured' : 'creature-grid';
    const cards = group.entries.map(entry => {
      const node = createCard(entry, group.featured);
      grid.append(node);
      return { id: entry.id, node };
    });
    element.append(grid);
    section.append(element);
    return { element, cards };
  });
  const specimen = document.createElement('aside');
  specimen.className = 'specimen-note';
  if (chapter.specimenTitle) {
    const heading = document.createElement('h3');
    heading.textContent = chapter.specimenTitle;
    specimen.append(heading);
  }
  const specimenCopy = document.createElement('p');
  specimenCopy.textContent = chapter.specimenNote;
  specimen.append(specimenCopy);
  section.append(specimen);
  return { section, groups };
}

export function mountCatalog(root, { onQueryChange = () => {} } = {}) {
  const search = root.querySelector('[data-role="search"]');
  const filters = root.querySelector('[data-role="filters"]');
  const count = root.querySelector('[data-role="result-count"]');
  const empty = root.querySelector('[data-role="empty"]');
  const reset = root.querySelector('.catalog-results [data-action="reset-catalog"]');
  let state = { query: '', kind: 'all' };
  const chapters = BESTIARY_CHAPTERS.map(createChapter);
  root.querySelector('[data-role="chapters"]').replaceChildren(...chapters.map(item => item.section));
  filters.replaceChildren(...BESTIARY_FILTERS.map(filter => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = 'filter-catalog';
    button.dataset.kind = filter.id;
    button.textContent = filter.label;
    button.setAttribute('aria-pressed', String(filter.id === 'all'));
    return button;
  }));

  function render() {
    const matches = new Set(filterEntries(BESTIARY_ENTRIES, state).map(entry => entry.id));
    for (const { section, groups } of chapters) {
      for (const { element, cards } of groups) {
        cards.forEach(({ id, node }) => { node.hidden = !matches.has(id); });
        element.hidden = cards.every(({ node }) => node.hidden);
      }
      section.hidden = groups.every(({ element }) => element.hidden);
    }
    filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.kind === state.kind)));
    count.textContent = `${matches.size} von ${BESTIARY_ENTRIES.length} Bildtafeln${state.query || state.kind !== 'all' ? ' · Auswahl im Verzeichnis' : ' · Zum Entdecken und Weiterblättern'}`;
    reset.hidden = !state.query && state.kind === 'all';
    empty.hidden = matches.size > 0;
    onQueryChange(state.query);
  }

  function resetCatalog() {
    state = { query: '', kind: 'all' };
    search.value = '';
    render();
  }

  root.addEventListener('input', event => {
    if (event.target !== search) return;
    state.query = search.value;
    render();
  });
  root.addEventListener('click', event => {
    const action = event.target.closest('[data-action]');
    if (!action || !root.contains(action)) return;
    if (action.dataset.action === 'filter-catalog') {
      state.kind = action.dataset.kind;
      render();
    }
    if (action.dataset.action === 'reset-catalog') {
      resetCatalog();
      search.focus({ preventScroll: true });
    }
  });
  render();
  return { reset: resetCatalog };
}
