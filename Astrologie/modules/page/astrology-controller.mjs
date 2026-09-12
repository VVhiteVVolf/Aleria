import '../../../AleriaAlmanach/modules/core/aleria-calendar.js';
import '../../../AleriaAlmanach/modules/world-date/world-date-model.js';
import '../../../AleriaAlmanach/modules/world-date/world-date-store.js';
import { createEphemeris } from '../ephemeris/ephemeris-model.mjs';
import { renderSkyReading, renderSovereignForecast } from '../ephemeris/ephemeris-view.mjs';

function initializeAstrology(root) {
  const calendar = globalThis.AleriaCalendar;
  const ephemeris = createEphemeris(calendar);
  const deities = JSON.parse(root.querySelector('[data-role="astrology-deities"]').textContent);
  const find = role => root.querySelector(`[data-role="${role}"]`);
  const form = find('sky-form');
  const monthCards = [...root.querySelectorAll('#zodiac-grid [data-role="zodiac-card"]')];
  const search = find('zodiac-search'), filter = find('zodiac-filter');

  function showError(message = '') {
    const error = find('sky-error');
    error.textContent = message;
    error.hidden = !message;
  }

  function showDate(value, { updateUrl = false } = {}) {
    try {
      const sky = ephemeris.at(value);
      for (const key of ['day', 'month', 'year']) form.elements[key].value = sky.date[key];
      find('sky-reading').innerHTML = renderSkyReading(sky, deities, calendar);
      find('sovereign-forecast').innerHTML = renderSovereignForecast(sky, deities, calendar);
      for (const card of monthCards) card.classList.toggle('is-selected', card.dataset.sign === sky.sign.id);
      showError();
      if (updateUrl) {
        const url = new URL(location.href);
        for (const key of ['year', 'month', 'day']) url.searchParams.set(key, sky.date[key]);
        history.replaceState(null, '', url);
      }
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      showError(error.message);
    }
  }

  function filterCards() {
    const query = search.value.trim().toLocaleLowerCase('de');
    let count = 0;
    for (const card of monthCards) {
      card.hidden = !(filter.value === 'all' || card.dataset.kind === filter.value)
        || !card.dataset.search.toLocaleLowerCase('de').includes(query);
      if (!card.hidden) count += 1;
    }
    find('zodiac-count').textContent = `${count} von ${monthCards.length} Monatszeichen`;
    find('zodiac-empty').hidden = count > 0;
  }

  function resetSearch() {
    search.value = '';
    filter.value = 'all';
    filterCards();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (form.reportValidity()) showDate(Object.fromEntries(new FormData(form)), { updateUrl: true });
  });
  root.addEventListener('input', event => {
    if (event.target === search) filterCards();
  });
  root.addEventListener('change', event => {
    if (event.target === filter) filterCards();
  });
  root.addEventListener('click', event => {
    const action = event.target.closest('[data-action]');
    if (!action || !root.contains(action)) return;
    if (action.dataset.action === 'current-date') showDate(calendar.current(), { updateUrl: true });
    if (action.dataset.action === 'reset-search') resetSearch();
    if (action.dataset.action === 'reveal-sign') {
      resetSearch();
      const card = monthCards.find(entry => entry.dataset.sign === action.dataset.sign);
      if (card) card.querySelector('details').open = true;
    }
  });

  showDate(calendar.current());
  const params = new URL(location.href).searchParams;
  if (['year', 'month', 'day'].some(key => params.has(key))) {
    showDate(Object.fromEntries(['year', 'month', 'day'].map(key => [key, params.get(key)])));
  }
  form.hidden = false;
  find('zodiac-tools').hidden = false;
  filterCards();
}

const root = document.querySelector('[data-astrology-page]');
if (root) initializeAstrology(root);
