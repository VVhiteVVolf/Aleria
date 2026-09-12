import { matchesMagicEntry } from './magic-catalog-model.mjs';
import { createMagicDisclosures } from './magic-disclosures.mjs';

function initMagicCatalog(root) {
  const tools = root.querySelector('[data-role="catalog-tools"]');
  const search = tools.querySelector('[data-role="search"]');
  const tradition = tools.querySelector('[data-role="tradition"]');
  const resultCount = tools.querySelector('[data-role="result-count"]');
  const reset = tools.querySelector('[data-action="reset-catalog"]');
  const empty = root.querySelector('[data-role="empty-state"]');
  const groups = [...root.querySelectorAll('[data-tradition]')];
  const entries = [...root.querySelectorAll('[data-magic-entry], [data-magic-domain]')].map(element => ({
    element,
    tradition: element.closest('[data-tradition]').dataset.tradition,
    text: `${element.textContent} ${element.dataset.keywords || ''}`
  }));
  const chapterLinks = [...root.querySelectorAll('.magic-register nav a')];
  const disclosures = createMagicDisclosures(root);
  const printableDetails = [...root.querySelectorAll('details')];
  let printState = null;
  let revealedHash = '';

  function applyFilters() {
    const filters = { query: search.value, tradition: tradition.value };
    let visible = 0;
    entries.forEach(entry => {
      entry.element.hidden = !matchesMagicEntry(entry, filters);
      if (!entry.element.hidden) visible += 1;
    });
    groups.forEach(group => {
      group.hidden = !entries.some(entry => entry.tradition === group.dataset.tradition && !entry.element.hidden);
    });
    disclosures.applySearch(search.value);
    resultCount.textContent = `${visible} von ${entries.length} Einträgen im Register`;
    empty.hidden = visible !== 0;
    reset.hidden = !search.value && tradition.value === 'all';
  }

  function resetFilters() {
    search.value = '';
    tradition.value = 'all';
    applyFilters();
  }

  function revealAnchor(hash, scroll = false) {
    if (!hash || hash === '#') return;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target || !root.contains(target)) return;
    revealedHash = hash;
    const group = target.closest('[data-tradition]');
    if (group?.hidden || target.closest('[hidden]')) resetFilters();
    if (target.matches('[data-magic-entry]')) target.open = true;
    disclosures.reveal(target);
    const chapter = target.closest('.magic-chapter');
    chapterLinks.forEach(link => {
      if (link.hash === `#${chapter?.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (scroll) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }

  root.addEventListener('input', event => { if (event.target === search) applyFilters(); });
  root.addEventListener('change', event => { if (event.target === tradition) applyFilters(); });
  root.addEventListener('click', event => {
    if (event.target.closest('[data-action="reset-catalog"]')) {
      resetFilters();
      search.focus();
      return;
    }
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor) revealAnchor(anchor.hash);
  });
  window.addEventListener('hashchange', () => {
    if (location.hash !== revealedHash) revealAnchor(location.hash, true);
  });
  // Print all authored entries and restore the reader's filters and open sheets afterwards.
  window.addEventListener('beforeprint', () => {
    if (printState) return;
    printState = printableDetails.map(element => element.open);
    entries.forEach(({ element }) => { element.hidden = false; });
    printableDetails.forEach(element => { element.hidden = false; element.open = true; });
    disclosures.groups.forEach(group => { group.hidden = false; });
    groups.forEach(group => { group.hidden = false; });
  });
  window.addEventListener('afterprint', () => {
    if (!printState) return;
    printableDetails.forEach((element, index) => { element.open = printState[index]; });
    printState = null;
    applyFilters();
  });

  tools.hidden = false;
  applyFilters();
  revealAnchor(location.hash, true);
}

const codex = document.querySelector('[data-magic-codex]');
if (codex) initMagicCatalog(codex);
