(function () {
  const data = window.GOODS_DATA;

  if (!data || !Array.isArray(data.items)) {
    throw new Error('GOODS_DATA fehlt oder ist ungültig.');
  }

  const state = {
    q: '',
    category: 'Alle',
    maxPrice: ''
  };

  const dom = {
    q: document.getElementById('q'),
    categoryChips: document.getElementById('categoryChips'),
    maxPrice: document.getElementById('maxPrice'),
    itemList: document.getElementById('itemList'),
    status: document.getElementById('status'),
    resetBtn: document.getElementById('resetBtn')
  };

  const categories = ['Alle', ...new Set(data.items.map((item) => item.category))];

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function formatAmount(value) {
    return Number.isInteger(value) ? String(value) : String(value).replace('.', ',');
  }

  function formatPrice(item) {
    const { min, max } = item.price;
    return min === max ? formatAmount(min) : `${formatAmount(min)} - ${formatAmount(max)}`;
  }

  function matchesFilters(item) {
    const haystack = normalize([
      item.name,
      item.category,
      item.unit,
      item.desc,
      ...(item.tags || [])
    ].join(' '));

    if (state.q && !haystack.includes(normalize(state.q))) return false;
    if (state.category !== 'Alle' && item.category !== state.category) return false;
    if (state.maxPrice !== '' && item.price.min > Number(state.maxPrice)) return false;

    return true;
  }

  function getFilteredItems() {
    return data.items.filter(matchesFilters);
  }

  function renderChips() {
    dom.categoryChips.innerHTML = categories.map((category) => `
      <button class="chip ${category === state.category ? 'active' : ''}" type="button" data-category="${escapeHtml(category)}">
        ${escapeHtml(category)}
      </button>
    `).join('');
  }

  function renderItem(item) {
    return `
      <article class="goods-row">
        <div class="goods-main">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(item.category)}</span>
          <span>${escapeHtml(item.unit)}</span>
          <b>${escapeHtml(formatPrice(item))} KT</b>
        </div>
        <p>${escapeHtml(item.desc)}</p>
      </article>
    `;
  }

  function renderList() {
    const items = getFilteredItems();
    dom.status.textContent = `${items.length} von ${data.items.length} Waren angezeigt`;
    dom.itemList.innerHTML = items.length
      ? items.map(renderItem).join('')
      : '<div class="empty">Keine Ware passt zu diesen Filtern.</div>';
  }

  function render() {
    renderChips();
    renderList();
  }

  function resetFilters() {
    state.q = '';
    state.category = 'Alle';
    state.maxPrice = '';
    dom.q.value = '';
    dom.maxPrice.value = '';
    render();
  }

  dom.q.addEventListener('input', (event) => {
    state.q = event.target.value;
    renderList();
  });

  dom.maxPrice.addEventListener('input', (event) => {
    state.maxPrice = event.target.value;
    renderList();
  });

  dom.categoryChips.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    render();
  });

  dom.resetBtn.addEventListener('click', resetFilters);

  render();
})();
