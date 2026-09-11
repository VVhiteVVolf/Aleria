// Progressive Suche: Der vollständige Seiteninhalt ist bereits im HTML enthalten.
function normalizeSearch(value) {
  return value.toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').trim();
}

function initializeOfficeSearch(root) {
  const search = root.querySelector('[data-court-search]');
  const input = search?.querySelector('input');
  const reset = search?.querySelector('[data-action="clear-search"]');
  const status = search?.querySelector('[data-role="search-status"]');
  const empty = root.querySelector('[data-role="search-empty"]');
  if (!input || !reset || !status || !empty) return;

  const groups = [...root.querySelectorAll('[data-court-group]')];
  const records = [...root.querySelectorAll('[data-court-office], [data-court-service]')].map(element => ({
    element,
    text: normalizeSearch(element.textContent)
  }));

  function filter() {
    const terms = normalizeSearch(input.value).split(/\s+/).filter(Boolean);
    let matches = 0;
    for (const record of records) {
      const visible = terms.every(term => record.text.includes(term));
      record.element.hidden = !visible;
      if (visible) matches += 1;
    }
    for (const group of groups) {
      group.hidden = !group.querySelector('[data-court-office]:not([hidden])');
    }
    status.textContent = terms.length
      ? `${matches} von ${records.length} Einträgen gefunden`
      : `${records.length} Einträge · Ämter, Titel, Stände und Hofdienst`;
    reset.hidden = !input.value;
    empty.hidden = matches > 0;
  }

  function clear() {
    input.value = '';
    filter();
  }

  search.addEventListener('input', filter);
  search.addEventListener('click', event => {
    if (!event.target.closest('[data-action="clear-search"]')) return;
    clear();
    input.focus();
  });
  // Abschnittslinks öffnen auch zuvor weggefilterte Einträge.
  root.addEventListener('click', event => {
    if (input.value && event.target.closest('a[href^="#"]')) clear();
  });
  window.addEventListener('hashchange', () => {
    if (!input.value) return;
    clear();
    const target = document.getElementById(window.location.hash.slice(1));
    target?.scrollIntoView();
  });
  search.hidden = false;
  filter();
}

const page = document.querySelector('.cenyr-court');
if (page) initializeOfficeSearch(page);
