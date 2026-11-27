import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { filterCatalog } from './concept-catalogs.mjs';
import { safeConceptUrl } from './concept-media.mjs';

const PAGE_SIZE = 32;
const iconCategories = { personality: 'Persönlichkeit', development: 'Charakterentwicklung' };
const referenceCategories = { draft: 'Eigene Entwürfe', character: 'Figuren', house: 'Häuser' };

export function createConceptPicker(dialog, { load, getDrafts }) {
  const role = name => dialog.querySelector(`[data-role="${name}"]`);
  const search = role('picker-search');
  const results = role('picker-results');
  const more = dialog.querySelector('[data-picker-action="more"]');
  let session;

  function renderResults() {
    const current = session;
    if (!current) return;
    const matches = filterCatalog(current.entries, search.value);
    const shown = matches.slice(0, current.limit);
    role('picker-status').textContent = current.status || (matches.length ? `${matches.length} Treffer` : 'Keine passenden Einträge.');
    more.hidden = matches.length <= shown.length;
    results.innerHTML = `<ul class="picker-results${current.icons ? ' picker-results--icons' : ''}">${shown.map(entry => {
      const image = safeConceptUrl(entry.src);
      return `<li><button type="button" data-pick="${e(entry.id)}">
        ${image ? `<img src="${e(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}
        <span><strong>${e(entry.name)}</strong>${entry.description ? `<small>${e(entry.description)}</small>` : ''}</span>
      </button></li>`;
    }).join('')}</ul>`;
  }

  async function selectCategory(category) {
    const current = session;
    current.category = category;
    current.limit = PAGE_SIZE;
    current.status = 'Register wird geladen …';
    current.entries = [];
    for (const button of role('picker-filters').querySelectorAll('[data-category]')) {
      button.setAttribute('aria-pressed', String(button.dataset.category === category));
    }
    renderResults();
    const token = (current.loadToken || 0) + 1;
    current.loadToken = token;
    try {
      const entries = category === 'draft' ? getDrafts() : await load(category);
      if (session !== current || current.loadToken !== token) return;
      current.entries = entries;
      current.status = '';
    } catch {
      if (session !== current || current.loadToken !== token) return;
      current.status = 'Dieses Register ist derzeit nicht erreichbar.';
    }
    renderResults();
  }

  function open({ kind, linkedType, onChoose }) {
    const icons = kind === 'icon';
    const categories = icons ? iconCategories : referenceCategories;
    const category = Object.hasOwn(categories, linkedType) ? linkedType : Object.keys(categories)[0];
    session = { icons, onChoose };
    role('picker-title').textContent = icons ? 'Merkmalsicon wählen' : 'Registereintrag oder Entwurf verknüpfen';
    role('picker-label').textContent = icons ? 'Icons suchen' : 'Name oder Stichwort suchen';
    role('picker-filters').innerHTML = Object.entries(categories).map(([id, label]) => (
      `<button type="button" class="workshop-button" data-category="${id}">${e(label)}</button>`
    )).join('');
    search.value = '';
    dialog.showModal();
    search.focus();
    selectCategory(category);
  }

  search.addEventListener('input', () => {
    session.limit = PAGE_SIZE;
    renderResults();
  });
  dialog.addEventListener('close', () => {
    if (!dialog.open) session = null;
  });
  dialog.addEventListener('click', event => {
    const button = event.target.closest('button');
    const current = session;
    if (!button || !current) return;
    const { category, pickerAction, pick } = button.dataset;
    if (category) selectCategory(category);
    if (pickerAction === 'close') dialog.close();
    if (pickerAction === 'more') {
      const index = current.limit;
      current.limit += PAGE_SIZE;
      renderResults();
      results.querySelectorAll('button')[index]?.focus();
    }
    if (pick) {
      const entry = current.entries.find(item => item.id === pick);
      if (!entry) return;
      dialog.close();
      current.onChoose(entry);
    }
  });

  return { open };
}
