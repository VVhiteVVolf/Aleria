(function() {
  const data = window.LIVESTOCK_DATA || { animals: [], profileLabels: [], currency: {} };
  const state = {
    category: 'Alle',
    rarity: 'Alle',
    q: '',
    maxPrice: 0,
    minMarket: 0,
    compare: []
  };

  const els = {
    q: document.getElementById('q'),
    categoryChips: document.getElementById('categoryChips'),
    maxPrice: document.getElementById('maxPrice'),
    minMarket: document.getElementById('minMarket'),
    animalList: document.getElementById('animalList'),
    status: document.getElementById('status'),
    resetBtn: document.getElementById('resetBtn'),
    detailModal: document.getElementById('detailModal'),
    modalContent: document.getElementById('modalContent'),
    modalClose: document.getElementById('modalClose'),
    compareBar: document.getElementById('compareBar'),
    compareSlots: document.getElementById('compareSlots'),
    compareBtn: document.getElementById('compareBtn'),
    clearCompareBtn: document.getElementById('clearCompareBtn'),
    compareModal: document.getElementById('compareModal'),
    compareContent: document.getElementById('compareContent'),
    compareClose: document.getElementById('compareClose')
  };

  function displayRarity(value) {
    return value
      .replace('Gewoehnlich', 'Gewöhnlich')
      .replace('Ungewoehnlich', 'Ungewöhnlich');
  }

  function normalise(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function formatPrice(animal) {
    const same = animal.price.min === animal.price.max;
    const amount = same ? animal.price.min : animal.price.min + ' - ' + animal.price.max;
    const icon = animal.price.unit === 'G' ? data.currency.goldIcon : data.currency.copperIcon;
    return '<span class="price">' + amount + ' <img src="' + icon + '" alt="' + animal.price.unit + '"></span>';
  }

  function searchText(animal) {
    return normalise([
      animal.name,
      animal.category,
      animal.rarity,
      animal.role,
      animal.upkeep,
      animal.desc,
      animal.tags.join(' ')
    ].join(' '));
  }

  function passes(animal) {
    if (state.category !== 'Alle' && animal.category !== state.category) return false;
    if (state.rarity !== 'Alle' && animal.rarity !== state.rarity) return false;
    if (state.q && searchText(animal).indexOf(normalise(state.q)) === -1) return false;
    if (state.maxPrice > 0 && animal.price.min > state.maxPrice) return false;
    if (state.minMarket > 0 && animal.stats[5] < state.minMarket) return false;
    return true;
  }

  function fact(label, value) {
    return '<div class="fact"><span>' + label + '</span><b>' + value + '</b></div>';
  }

  function rarityClass(rarity) {
    return rarity === 'Selten' ? 'selten' : '';
  }

  function animalCard(animal) {
    const selected = state.compare.some(entry => entry.id === animal.id);
    return [
      '<article class="animal-card" data-id="' + animal.id + '">',
      '  <div class="animal-media">',
      '    <span class="rarity ' + rarityClass(animal.rarity) + '">' + displayRarity(animal.rarity) + '</span>',
      '    <img src="' + animal.image + '" alt="' + animal.name + '" loading="lazy">',
      '  </div>',
      '  <div class="animal-main">',
      '    <div class="animal-body">',
      '      <div class="animal-title"><div><h3>' + animal.name + '</h3><small>' + animal.role + '</small></div>' + formatPrice(animal) + '</div>',
      '      <div class="facts">',
      fact('Kategorie', animal.category),
      fact('Seltenheit', displayRarity(animal.rarity)),
      fact('Unterhalt', animal.upkeep),
      fact('Marktwert', animal.stats[5] + '/10'),
      '      </div>',
      '      <p class="desc">' + animal.desc + '</p>',
      '      <div class="tag-row">' + animal.tags.map(tag => '<span class="tag">' + tag + '</span>').join('') + '</div>',
      '      <div class="actions">',
      '        <button type="button" data-action="detail" data-id="' + animal.id + '">Details</button>',
      '        <button type="button" class="secondary" data-action="compare" data-id="' + animal.id + '">' + (selected ? 'Entfernen' : 'Vergleichen') + '</button>',
      '      </div>',
      '    </div>',
      '    <aside class="profile-panel">',
      '      <h4>Viehprofil</h4>',
      renderRadar(data.profileLabels, animal.stats),
      renderBars(data.profileLabels, animal.stats),
      '    </aside>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function renderRadar(labels, values) {
    const size = 190;
    const center = 95;
    const maxR = 62;
    const count = labels.length;
    const angle = index => (Math.PI / 2) - (2 * Math.PI * index / count);
    const point = (index, radius) => {
      const a = angle(index);
      return [
        (center + radius * Math.cos(a)).toFixed(2),
        (center - radius * Math.sin(a)).toFixed(2)
      ].join(',');
    };
    const rings = [2, 4, 6, 8, 10].map(value => {
      const pts = labels.map((_, i) => point(i, maxR * value / 10)).join(' ');
      return '<polygon points="' + pts + '" class="radar-ring"></polygon>';
    }).join('');
    const axes = labels.map((_, i) => {
      const p = point(i, maxR).split(',');
      return '<line x1="' + center + '" y1="' + center + '" x2="' + p[0] + '" y2="' + p[1] + '" class="radar-axis"></line>';
    }).join('');
    const shape = values.map((value, i) => point(i, maxR * Math.max(0, Math.min(10, value)) / 10)).join(' ');
    const labelNodes = labels.map((label, i) => {
      const coords = point(i, maxR + 21).split(',');
      const x = Number(coords[0]);
      const anchor = x < center - 8 ? 'end' : x > center + 8 ? 'start' : 'middle';
      return '<text x="' + coords[0] + '" y="' + coords[1] + '" text-anchor="' + anchor + '" class="radar-label">' + label + '</text>';
    }).join('');
    return '<svg class="radar" viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true">' + rings + axes + '<polygon points="' + shape + '" class="radar-shape"></polygon>' + labelNodes + '</svg>';
  }

  function renderBars(labels, values) {
    return '<div class="stat-bars">' + labels.map((label, i) => {
      return '<div class="stat-row"><span>' + label + '</span><div><i style="width:' + (values[i] * 10) + '%"></i></div><b>' + values[i] + '</b></div>';
    }).join('') + '</div>';
  }

  function renderCategoryChips() {
    const categories = ['Alle'].concat(Array.from(new Set(data.animals.map(animal => animal.category))));
    els.categoryChips.innerHTML = categories.map(category => {
      return '<button class="chip ' + (category === 'Alle' ? 'active' : '') + '" data-category="' + category + '">' + category + '</button>';
    }).join('');
  }

  function renderAnimals() {
    const visible = data.animals.filter(passes);
    els.animalList.innerHTML = visible.length
      ? visible.map(animalCard).join('')
      : '<p class="desc">Keine passenden Tiere gefunden.</p>';
    els.status.textContent = visible.length + ' von ' + data.animals.length + ' Tieren angezeigt';
  }

  function findAnimal(id) {
    return data.animals.find(animal => animal.id === id);
  }

  function openDetail(animal) {
    els.modalContent.innerHTML = [
      '<div class="modal-layout">',
      '  <img class="modal-item-image" src="' + animal.image + '" alt="' + animal.name + '">',
      '  <div class="modal-info">',
      '    <p class="eyebrow">' + animal.category + '</p>',
      '    <h2 id="modalTitle">' + animal.name + '</h2>',
      '    <div class="facts">',
      fact('Rolle', animal.role),
      fact('Preis', formatPrice(animal)),
      fact('Seltenheit', displayRarity(animal.rarity)),
      fact('Unterhalt', animal.upkeep),
      '    </div>',
      '  </div>',
      '  <aside class="profile-panel modal-profile">',
      '      <h4>Viehprofil</h4>',
      renderRadar(data.profileLabels, animal.stats),
      renderBars(data.profileLabels, animal.stats),
      '  </aside>',
      '  <div class="modal-description">',
      '    <p class="desc">' + animal.desc + '</p>',
      '    <h3>Unterhalt</h3>',
      '    <ul class="upkeep-list">' + animal.upkeepDetails.map(line => '<li>' + line + '</li>').join('') + '</ul>',
      '    <div class="tag-row">' + animal.tags.map(tag => '<span class="tag">' + tag + '</span>').join('') + '</div>',
      '  </div>',
      '</div>'
    ].join('');
    els.detailModal.classList.add('open');
    els.detailModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (!els.detailModal.classList.contains('open') && !els.compareModal.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  function toggleCompare(animal) {
    const idx = state.compare.findIndex(entry => entry.id === animal.id);
    if (idx >= 0) {
      state.compare.splice(idx, 1);
    } else {
      if (state.compare.length >= 2) state.compare.shift();
      state.compare.push(animal);
    }
    renderCompareBar();
    renderAnimals();
  }

  function renderCompareBar() {
    els.compareBar.classList.toggle('visible', state.compare.length > 0);
    els.compareSlots.innerHTML = [0, 1].map(index => {
      const animal = state.compare[index];
      return '<div class="slot">' + (animal ? animal.name : 'Tier ' + (index + 1)) + '</div>';
    }).join('');
    els.compareBtn.disabled = state.compare.length < 2;
  }

  function openCompare() {
    if (state.compare.length < 2) return;
    const [a, b] = state.compare;
    const profileRows = data.profileLabels.map((label, i) => [label, a.stats[i] + '/10', b.stats[i] + '/10']);
    const rows = [
      ['Bild', '<img src="' + a.image + '" alt="' + a.name + '">', '<img src="' + b.image + '" alt="' + b.name + '">'],
      ['Kategorie', a.category, b.category],
      ['Rolle', a.role, b.role],
      ['Preis', formatPrice(a), formatPrice(b)],
      ['Unterhalt', a.upkeep, b.upkeep]
    ].concat(profileRows);
    els.compareContent.innerHTML = [
      '<h2 id="compareTitle" style="padding:28px 28px 0;margin:0">Vergleich</h2>',
      '<table class="compare-table">',
      '<thead><tr><th>Merkmal</th><th>' + a.name + '</th><th>' + b.name + '</th></tr></thead>',
      '<tbody>',
      rows.map(row => '<tr><th>' + row[0] + '</th><td>' + row[1] + '</td><td>' + row[2] + '</td></tr>').join(''),
      '</tbody></table>'
    ].join('');
    els.compareModal.classList.add('open');
    els.compareModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function resetFilters() {
    state.category = 'Alle';
    state.rarity = 'Alle';
    state.q = '';
    state.maxPrice = 0;
    state.minMarket = 0;
    els.q.value = '';
    els.maxPrice.value = '';
    els.minMarket.value = '';
    document.querySelectorAll('[data-category]').forEach(button => button.classList.toggle('active', button.dataset.category === 'Alle'));
    document.querySelectorAll('[data-rarity]').forEach(button => button.classList.toggle('active', button.dataset.rarity === 'Alle'));
    renderAnimals();
  }

  function bindEvents() {
    els.categoryChips.addEventListener('click', event => {
      const button = event.target.closest('[data-category]');
      if (!button) return;
      state.category = button.dataset.category;
      document.querySelectorAll('[data-category]').forEach(btn => btn.classList.toggle('active', btn === button));
      renderAnimals();
    });

    document.querySelectorAll('[data-rarity]').forEach(button => {
      button.addEventListener('click', () => {
        state.rarity = button.dataset.rarity;
        document.querySelectorAll('[data-rarity]').forEach(btn => btn.classList.toggle('active', btn === button));
        renderAnimals();
      });
    });

    els.q.addEventListener('input', () => {
      state.q = els.q.value.trim();
      renderAnimals();
    });

    els.maxPrice.addEventListener('input', () => {
      state.maxPrice = parseInt(els.maxPrice.value, 10) || 0;
      renderAnimals();
    });

    els.minMarket.addEventListener('input', () => {
      state.minMarket = parseInt(els.minMarket.value, 10) || 0;
      renderAnimals();
    });

    els.resetBtn.addEventListener('click', resetFilters);

    els.animalList.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const animal = findAnimal(button.dataset.id);
      if (!animal) return;
      if (button.dataset.action === 'detail') openDetail(animal);
      if (button.dataset.action === 'compare') toggleCompare(animal);
    });

    els.modalClose.addEventListener('click', () => closeModal(els.detailModal));
    els.compareClose.addEventListener('click', () => closeModal(els.compareModal));
    els.detailModal.addEventListener('click', event => {
      if (event.target === els.detailModal) closeModal(els.detailModal);
    });
    els.compareModal.addEventListener('click', event => {
      if (event.target === els.compareModal) closeModal(els.compareModal);
    });

    els.compareBtn.addEventListener('click', openCompare);
    els.clearCompareBtn.addEventListener('click', () => {
      state.compare = [];
      renderCompareBar();
      renderAnimals();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal(els.detailModal);
        closeModal(els.compareModal);
      }
    });
  }

  renderCategoryChips();
  renderAnimals();
  renderCompareBar();
  bindEvents();
})();
