const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '');
}

/** True if every character of `query` appears in `text` in order (cheap typo/partial tolerance without a fuzzy-match dependency). */
function isSubsequence(query, text) {
  let index = 0;
  for (const char of text) {
    if (char === query[index]) index += 1;
    if (index === query.length) return true;
  }
  return index === query.length;
}

function searchableFields(feature) {
  return [feature.name, feature.region, feature.house, feature.faction, feature.description, feature.type, ...(feature.tags || [])];
}

/**
 * Rank point features against a query: exact-prefix matches on the name
 * rank highest, then substring matches (name first, then other fields),
 * then loose subsequence matches as a typo-tolerant fallback. Pure
 * function - unit tested separately from DOM rendering.
 * @param {object[]} features
 * @param {string} query
 * @returns {object[]}
 */
export function rankFeatures(features, query) {
  const q = normalize(query).trim();
  if (!q) return [];
  const scored = [];
  for (const feature of features) {
    const name = normalize(feature.name);
    let score = -1;
    if (name.startsWith(q)) score = 100;
    else if (name.includes(q)) score = 80;
    else if (searchableFields(feature).some((field) => normalize(field).includes(q))) score = 50;
    else if (isSubsequence(q, name)) score = 10;
    if (score > 0) scored.push({ feature, score });
  }
  scored.sort((a, b) => b.score - a.score || a.feature.name.localeCompare(b.feature.name));
  return scored.map((entry) => entry.feature);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

/**
 * @param {HTMLElement} container
 * @param {{getFeatures: () => object[], getCategoryColor: (categoryId:string)=>string, onSelect: (featureId:string)=>void}} props
 */
export function renderSearchPanel(container, { getFeatures, getCategoryColor, onSelect }) {
  container.innerHTML = `
    <div class="search-panel">
      <input class="search-panel__input" type="search" placeholder="🔍 Ort suchen…" autocomplete="off"/>
      <button class="search-panel__clear" type="button" hidden>✕</button>
      <div class="search-panel__results" hidden></div>
    </div>
  `;
  const input = container.querySelector('.search-panel__input');
  const clearButton = container.querySelector('.search-panel__clear');
  const results = container.querySelector('.search-panel__results');

  function renderResults(query) {
    const matches = rankFeatures(getFeatures(), query).slice(0, 12);
    results.hidden = matches.length === 0;
    clearButton.hidden = query.length === 0;
    results.innerHTML = matches
      .map(
        (feature) => `
      <button type="button" class="search-panel__result" data-feature-id="${escapeHtml(feature.id)}">
        <span class="search-panel__dot" style="background:${getCategoryColor(feature.categoryId)}"></span>
        ${escapeHtml(feature.name)}
      </button>`,
      )
      .join('');
  }

  input.addEventListener('input', () => renderResults(input.value));
  clearButton.addEventListener('click', () => {
    input.value = '';
    renderResults('');
    input.focus();
  });
  results.addEventListener('click', (event) => {
    const button = event.target.closest('[data-feature-id]');
    if (!button) return;
    onSelect(button.dataset.featureId);
    results.hidden = true;
    input.value = '';
    clearButton.hidden = true;
  });
  input.addEventListener('blur', () => {
    setTimeout(() => {
      results.hidden = true;
    }, 150);
  });
  input.addEventListener('focus', () => {
    if (input.value) renderResults(input.value);
  });
}
