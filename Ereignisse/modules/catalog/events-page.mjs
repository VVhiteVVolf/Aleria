import { EVENTS, EVENT_CHAPTERS } from './events-data.mjs';
import { parseEventYear, selectEvents } from './events-model.mjs';
import { renderEventCatalog } from './events-render.mjs';

// Vite löst die lokalen Originalbilder für die dynamischen Filteransichten auf.
const iconHref = icon => new URL(`../../assets/icons/${icon}.png`, import.meta.url).href;

function initializeEventsPage() {
  const root = document.querySelector('[data-events-page]');
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const params = new URL(location.href).searchParams;
  let state = { query: params.get('q')?.slice(0, 200) || '', year: parseEventYear(params.get('year')),
    chapter: EVENT_CHAPTERS.some(item => item.id === params.get('chapter')) ? params.get('chapter') : 'all',
    order: ['oldest', 'newest'].includes(params.get('order')) ? params.get('order') : 'chapters' };
  $('[data-role="catalog-tools"]').hidden = false;
  $('[data-role="search"]').value = state.query;
  $('[data-role="year"]').value = state.year ?? '';
  $('[data-role="order"]').value = state.order;

  function render({ updateUrl = true } = {}) {
    const entries = selectEvents(state);
    $('[data-role="catalog"]').innerHTML = renderEventCatalog(entries, { ...state, iconHref });
    $('[data-role="result-count"]').textContent = `${entries.length} von ${EVENTS.length} Ereignissen${state.year ? ` · im Jahr ${state.year}` : ''}${state.chapter !== 'all' ? ` · ${EVENT_CHAPTERS.find(item => item.id === state.chapter).title}` : ''}`;
    const filtered = !!state.query || state.year !== null || state.chapter !== 'all' || state.order !== 'chapters';
    root.querySelectorAll('[data-action="reset-events"]').forEach(button => { button.hidden = !filtered; });
    root.querySelectorAll('[data-action="select-chapter"]').forEach(link => {
      if (link.dataset.chapter === state.chapter) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (updateUrl) {
      const url = new URL(location.href);
      for (const [key, value] of [['q', state.query], ['year', state.year], ['chapter', state.chapter === 'all' ? '' : state.chapter], ['order', state.order === 'chapters' ? '' : state.order]]) {
        if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
      }
      // Ein alter Ereignisanker darf nach einem Filterwechsel nicht auf einen ausgeblendeten Eintrag zeigen.
      if (url.hash.startsWith('#ereignis-') && !entries.some(entry => url.hash === `#ereignis-${entry.id}`)) url.hash = 'verzeichnis';
      history.replaceState(null, '', url);
    }
  }

  function showLinkedEntry() {
    const id = location.hash.slice('#ereignis-'.length);
    if (!location.hash.startsWith('#ereignis-') || !EVENTS.some(entry => entry.id === id)) return;
    const card = root.querySelector(`[data-event-id="${id}"]`);
    if (!card) return;
    const story = card.querySelector('details');
    if (story) story.open = true;
    card.scrollIntoView({ block: 'center' });
  }

  root.addEventListener('submit', event => { if (event.target.matches('[data-role="catalog-tools"]')) event.preventDefault(); });
  root.addEventListener('input', event => {
    if (event.target.matches('[data-role="search"]')) { state.query = event.target.value; render(); }
    if (event.target.matches('[data-role="year"]') && event.target.validity.valid) { state.year = parseEventYear(event.target.value); render(); }
  });
  root.addEventListener('change', event => {
    if (event.target.matches('[data-role="order"]')) { state.order = event.target.value; render(); }
  });
  root.addEventListener('click', event => {
    const control = event.target.closest('[data-action]');
    if (!control) return;
    if (control.dataset.action === 'select-chapter') {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      state.chapter = control.dataset.chapter;
      state.query = ''; state.year = null;
    } else if (control.dataset.action === 'reset-events') {
      state = { query: '', year: null, chapter: 'all', order: 'chapters' };
    } else return;
    $('[data-role="search"]').value = state.query;
    $('[data-role="year"]').value = state.year ?? '';
    $('[data-role="order"]').value = state.order;
    render();
    // Ein Reset innerhalb der leeren Trefferliste entfernt den auslösenden Button.
    if (!control.isConnected || control.hidden) $('[data-role="search"]').focus({ preventScroll: true });
    $('#verzeichnis').scrollIntoView({ block: 'start' });
  });
  render({ updateUrl: false });
  showLinkedEntry();
  window.addEventListener('hashchange', showLinkedEntry);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeEventsPage, { once: true });
else initializeEventsPage();
