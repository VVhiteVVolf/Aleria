import { element } from './directory-elements.mjs?v=panels-20260911a';

// Filtering belongs to one rendered register. No document listeners or saved state.
export function directoryState(root) {
  return {
    query: root?.querySelector('[data-directory-query]')?.value || '',
    group: root?.querySelector('[data-directory-group]')?.value || '',
  };
}

export function mountDirectoryBrowser(root, { kind = 'houses', state = {} } = {}) {
  if (!root || root.querySelector('.directory-toolbar')) return;
  const sections = [...root.querySelectorAll('[data-directory-section]')];
  const entries = sections.flatMap(section => [...section.querySelectorAll('[data-directory-entry]')].map(node => ({
    node, section,
    search: normalize(`${section.dataset.directorySection} ${node.textContent}`),
  })));
  // Small registers remain simple lists; controls earn their space in longer ones.
  if (entries.length < 8) return;

  const noun = kind === 'places' ? ['Ort', 'Orte'] : ['Haus', 'Häuser'];
  const toolbar = element('div', 'directory-toolbar');
  toolbar.setAttribute('role', 'search');
  toolbar.setAttribute('aria-label', `${noun[1]} im Register filtern`);
  toolbar.dataset.kontinenteGeneratedView = '';
  const searchLabel = element('label', 'directory-search');
  searchLabel.append(element('span', 'directory-control-label', `${noun[1]} durchsuchen`));
  const input = element('input');
  input.type = 'search';
  input.dataset.directoryQuery = '';
  input.placeholder = kind === 'places' ? 'Name oder Einordnung …' : 'Name, Sitz, Lehnsherr oder Rang …';
  input.value = state.query || '';
  searchLabel.append(input);
  toolbar.append(searchLabel);

  let select;
  if (sections.length > 1) {
    const groupLabel = element('label', 'directory-group-filter');
    groupLabel.append(element('span', 'directory-control-label', 'Gruppe'));
    select = element('select');
    select.dataset.directoryGroup = '';
    select.append(new Option('Alle Gruppen', ''));
    sections.forEach((section, index) => select.append(new Option(section.dataset.directorySection, String(index))));
    select.value = state.group || '';
    if (select.selectedIndex < 0) select.value = '';
    groupLabel.append(select);
    toolbar.append(groupLabel);
  }

  const status = element('p', 'directory-result-count');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const reset = element('button', 'directory-reset', 'Zurücksetzen');
  reset.type = 'button';
  reset.dataset.action = 'reset-directory';
  toolbar.append(status, reset);
  const empty = element('p', 'directory-empty', 'Keine passenden Einträge. Passe die Suche oder die Gruppe an.');
  empty.hidden = true;
  empty.dataset.kontinenteGeneratedView = '';
  root.prepend(toolbar);
  root.append(empty);

  function filter() {
    const terms = normalize(input.value).split(' ').filter(Boolean);
    const group = select?.value || '';
    let visible = 0;
    for (const entry of entries) {
      const matchesGroup = !group || entry.section === sections[Number(group)];
      entry.node.hidden = !matchesGroup || !terms.every(term => entry.search.includes(term));
      if (!entry.node.hidden) visible++;
    }
    for (const section of sections) {
      section.hidden = !entries.some(entry => entry.section === section && !entry.node.hidden);
      // A place subheading remains only when its following group has a result.
      let hasResult = false;
      [...section.querySelectorAll('[data-directory-entry], .kingdom-place-separator')].reverse().forEach(node => {
        if (node.matches('.kingdom-place-separator')) { node.hidden = !hasResult; hasResult = false; }
        else if (!node.hidden) hasResult = true;
      });
      const featured = section.querySelector('.kingdom-family-featured');
      if (featured) featured.hidden = ![...featured.children].some(node => !node.hidden);
      const grid = section.querySelector('.kingdom-family-grid');
      if (grid) grid.hidden = ![...grid.children].some(node => !node.hidden);
    }
    status.textContent = `${visible} von ${entries.length} ${entries.length === 1 ? noun[0] : noun[1]}`;
    reset.hidden = !input.value && !group;
    empty.hidden = visible > 0;
  }
  toolbar.addEventListener('input', filter);
  toolbar.addEventListener('change', filter);
  toolbar.addEventListener('click', event => {
    if (!event.target.closest('[data-action="reset-directory"]')) return;
    input.value = '';
    if (select) select.value = '';
    filter();
    input.focus();
  });
  filter();
}

function normalize(value) {
  return value.toLocaleLowerCase('de').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/ß/g, 'ss').replace(/\s+/g, ' ').trim();
}
