(function () {
  const data = window.ALCHEMY_DATA;

  if (!data || !Array.isArray(data.items)) {
    throw new Error('ALCHEMY_DATA fehlt oder ist ungültig.');
  }

  const state = {
    q: '',
    category: 'Alle',
    maxPrice: '',
    minRisk: '',
    minHealing: '',
    minMana: '',
    compare: []
  };

  const dom = {
    q: document.getElementById('q'),
    categoryChips: document.getElementById('categoryChips'),
    maxPrice: document.getElementById('maxPrice'),
    minRisk: document.getElementById('minRisk'),
    minHealing: document.getElementById('minHealing'),
    minMana: document.getElementById('minMana'),
    itemList: document.getElementById('itemList'),
    status: document.getElementById('status'),
    resetBtn: document.getElementById('resetBtn'),
    compareBar: document.getElementById('compareBar'),
    compareSlots: document.getElementById('compareSlots'),
    compareBtn: document.getElementById('compareBtn'),
    clearCompareBtn: document.getElementById('clearCompareBtn'),
    detailModal: document.getElementById('detailModal'),
    modalClose: document.getElementById('modalClose'),
    modalContent: document.getElementById('modalContent'),
    compareModal: document.getElementById('compareModal'),
    compareClose: document.getElementById('compareClose'),
    compareContent: document.getElementById('compareContent')
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

  function iconFor(unit) {
    if (unit === 'G') return data.currency.goldIcon;
    if (unit === 'S') return data.currency.silverIcon;
    return data.currency.copperIcon;
  }

  function unitName(unit) {
    if (unit === 'G') return 'Gold';
    if (unit === 'S') return 'Silber';
    return 'Kupfer';
  }

  function priceFactor(unit) {
    if (unit === 'G') return data.currency.goldToCopper;
    if (unit === 'S') return data.currency.silverToCopper;
    return 1;
  }

  function priceToCopper(item) {
    const factor = priceFactor(item.price.unit);
    return {
      min: item.price.min * factor,
      max: item.price.max * factor
    };
  }

  function formatPrice(item) {
    const { min, max, unit, plus } = item.price;
    const amount = min === max ? `${min}${plus ? '+' : ''}` : `${min} - ${max}${plus ? '+' : ''}`;
    return `
      <span class="price">
        <b>${escapeHtml(amount)}</b>
        <img src="${iconFor(unit)}" alt="${unitName(unit)}">
        <i>${unitName(unit)}</i>
      </span>
    `;
  }

  function matchesFilters(item) {
    const haystack = normalize([
      item.name,
      item.category,
      item.type,
      item.unit,
      item.desc,
      ...(item.tags || [])
    ].join(' '));

    if (state.q && !haystack.includes(normalize(state.q))) return false;
    if (state.category !== 'Alle' && item.category !== state.category) return false;
    if (state.maxPrice !== '' && priceToCopper(item).min > Number(state.maxPrice)) return false;
    if (state.minRisk !== '' && item.stats[5] < Number(state.minRisk)) return false;
    if (state.minHealing !== '' && item.stats[0] < Number(state.minHealing)) return false;
    if (state.minMana !== '' && item.stats[1] < Number(state.minMana)) return false;

    return true;
  }

  function getFilteredItems() {
    return data.items.filter(matchesFilters);
  }

  function renderChips() {
    dom.categoryChips.innerHTML = categories.map((category) => `
      <button class="${category === state.category ? 'active' : ''}" type="button" data-category="${escapeHtml(category)}">
        ${escapeHtml(category)}
      </button>
    `).join('');
  }

  function radarPoints(stats) {
    const center = 50;
    const maxRadius = 39;
    const step = (Math.PI * 2) / stats.length;

    return stats.map((value, index) => {
      const angle = -Math.PI / 2 + step * index;
      const radius = maxRadius * (Math.max(0, Math.min(10, value)) / 10);
      return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
    }).join(' ');
  }

  function renderRadar(item) {
    const rings = [13, 26, 39].map((r) => `<circle class="radar-ring" cx="50" cy="50" r="${r}" />`).join('');
    const spokes = item.stats.map((_, index) => {
      const angle = -Math.PI / 2 + ((Math.PI * 2) / item.stats.length) * index;
      return `<line class="radar-axis" x1="50" y1="50" x2="${50 + Math.cos(angle) * 39}" y2="${50 + Math.sin(angle) * 39}" />`;
    }).join('');
    const labels = data.profileLabels.map((label, index) => {
      const angle = -Math.PI / 2 + ((Math.PI * 2) / data.profileLabels.length) * index;
      const x = 50 + Math.cos(angle) * 50;
      const y = 50 + Math.sin(angle) * 50;
      const anchor = Math.cos(angle) > 0.35 ? 'start' : Math.cos(angle) < -0.35 ? 'end' : 'middle';
      const baseline = Math.sin(angle) > 0.35 ? 'hanging' : Math.sin(angle) < -0.35 ? 'auto' : 'middle';
      return `<text class="radar-label" x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="${baseline}">${escapeHtml(label)}</text>`;
    }).join('');

    return `
      <svg class="radar" viewBox="-14 -12 128 124" role="img" aria-label="Wirkprofil von ${escapeHtml(item.name)}">
        ${rings}
        ${spokes}
        <polygon class="radar-shape" points="${radarPoints(item.stats)}"></polygon>
        ${labels}
      </svg>
    `;
  }

  function renderStatBars(item) {
    return `
      <div class="stat-bars">
        ${data.profileLabels.map((label, index) => {
          const value = item.stats[index];
          return `
            <div class="stat-row">
              <span>${escapeHtml(label)}</span>
              <div class="bar"><i style="width:${value * 10}%"></i></div>
              <b>${value}</b>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderTags(item) {
    return `<div class="tag-row">${item.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`;
  }

  function renderFacts(item) {
    return `
      <dl class="facts">
        <div class="fact"><dt>Kategorie</dt><dd>${escapeHtml(item.category)}</dd></div>
        <div class="fact"><dt>Typ</dt><dd>${escapeHtml(item.type)}</dd></div>
        <div class="fact"><dt>Einheit</dt><dd>${escapeHtml(item.unit)}</dd></div>
        <div class="fact"><dt>Preis</dt><dd>${formatPrice(item)}</dd></div>
      </dl>
    `;
  }

  function renderItem(item) {
    const isCompared = state.compare.includes(item.id);

    return `
      <article class="item-card" data-id="${escapeHtml(item.id)}">
        <div class="item-media">
          <span class="category-pill">${escapeHtml(item.category)}</span>
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
        </div>
        <div class="item-main">
          <div class="item-body">
            <h3>${escapeHtml(item.name)}</h3>
            ${renderFacts(item)}
            <p>${escapeHtml(item.desc)}</p>
            ${renderTags(item)}
            <div class="actions">
              <button type="button" data-action="details" data-id="${escapeHtml(item.id)}">Details</button>
              <button type="button" data-action="compare" data-id="${escapeHtml(item.id)}" class="${isCompared ? 'active' : ''}">
                ${isCompared ? 'Im Vergleich' : 'Vergleichen'}
              </button>
            </div>
          </div>
          <aside class="profile-panel">
            <h4>Wirkprofil</h4>
            ${renderRadar(item)}
            ${renderStatBars(item)}
          </aside>
        </div>
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

  function findItem(id) {
    return data.items.find((item) => item.id === id);
  }

  function toggleCompare(id) {
    if (state.compare.includes(id)) {
      state.compare = state.compare.filter((itemId) => itemId !== id);
    } else if (state.compare.length < 3) {
      state.compare.push(id);
    } else {
      state.compare.shift();
      state.compare.push(id);
    }

    render();
  }

  function renderCompareBar() {
    const items = state.compare.map(findItem).filter(Boolean);
    dom.compareBar.classList.toggle('visible', items.length > 0);
    dom.compareBtn.disabled = items.length < 2;
    dom.compareSlots.innerHTML = items.map((item) => `
      <button class="slot" type="button" data-action="remove-compare" data-id="${escapeHtml(item.id)}">
        <img src="${escapeHtml(item.image)}" alt="">
        <span>${escapeHtml(item.name)}</span>
      </button>
    `).join('');
  }

  function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function openDetails(id) {
    const item = findItem(id);
    if (!item) return;

    dom.modalContent.innerHTML = `
      <div class="modal-layout">
        <img class="modal-item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
        <div class="modal-info">
          <p class="eyebrow">${escapeHtml(item.category)}</p>
          <h2 id="modalTitle">${escapeHtml(item.name)}</h2>
          ${renderFacts(item)}
        </div>
        <aside class="profile-panel modal-profile">
          <h4>Wirkprofil</h4>
          ${renderRadar(item)}
          ${renderStatBars(item)}
        </aside>
        <div class="modal-description">
          <p>${escapeHtml(item.desc)}</p>
          ${renderTags(item)}
        </div>
      </div>
    `;
    openModal(dom.detailModal);
  }

  function openCompare() {
    const items = state.compare.map(findItem).filter(Boolean);
    if (items.length < 2) return;

    const rows = [
      ['Bild', (item) => `<img class="compare-img" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">`],
      ['Kategorie', (item) => escapeHtml(item.category)],
      ['Typ', (item) => escapeHtml(item.type)],
      ['Einheit', (item) => escapeHtml(item.unit)],
      ['Preis', (item) => formatPrice(item)],
      ...data.profileLabels.map((label, index) => [label, (item) => `${item.stats[index]} / 10`])
    ];

    dom.compareContent.innerHTML = `
      <h2 id="compareTitle">Warenvergleich</h2>
      <div class="compare-table-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Eigenschaft</th>
              ${items.map((item) => `<th>${escapeHtml(item.name)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(([label, value]) => `
              <tr>
                <th>${escapeHtml(label)}</th>
                ${items.map((item) => `<td>${value(item)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    openModal(dom.compareModal);
  }

  function resetFilters() {
    state.q = '';
    state.category = 'Alle';
    state.maxPrice = '';
    state.minRisk = '';
    state.minHealing = '';
    state.minMana = '';

    dom.q.value = '';
    dom.maxPrice.value = '';
    dom.minRisk.value = '';
    dom.minHealing.value = '';
    dom.minMana.value = '';
    render();
  }

  function render() {
    renderChips();
    renderList();
    renderCompareBar();
  }

  dom.q.addEventListener('input', (event) => {
    state.q = event.target.value;
    renderList();
  });

  dom.categoryChips.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    render();
  });

  [
    ['maxPrice', dom.maxPrice],
    ['minRisk', dom.minRisk],
    ['minHealing', dom.minHealing],
    ['minMana', dom.minMana]
  ].forEach(([key, input]) => {
    input.addEventListener('input', (event) => {
      state[key] = event.target.value;
      renderList();
    });
  });

  dom.itemList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    if (button.dataset.action === 'details') openDetails(button.dataset.id);
    if (button.dataset.action === 'compare') toggleCompare(button.dataset.id);
  });

  dom.compareSlots.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action="remove-compare"]');
    if (!button) return;
    toggleCompare(button.dataset.id);
  });

  dom.resetBtn.addEventListener('click', resetFilters);
  dom.clearCompareBtn.addEventListener('click', () => {
    state.compare = [];
    render();
  });
  dom.compareBtn.addEventListener('click', openCompare);
  dom.modalClose.addEventListener('click', () => closeModal(dom.detailModal));
  dom.compareClose.addEventListener('click', () => closeModal(dom.compareModal));

  [dom.detailModal, dom.compareModal].forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeModal(dom.detailModal);
    closeModal(dom.compareModal);
  });

  render();
})();
