(function() {
  const data = window.ARMORY_DATA || { items: [], ores: [], styles: [], currency: {} };
  const state = {
    category: 'Alle',
    rarity: 'Alle',
    q: '',
    maxPrice: 0,
    maxWeight: 0,
    compare: []
  };

  const els = {
    q: document.getElementById('q'),
    maxPrice: document.getElementById('maxPrice'),
    maxWeight: document.getElementById('maxWeight'),
    itemGrid: document.getElementById('itemGrid'),
    status: document.getElementById('status'),
    resetBtn: document.getElementById('resetBtn'),
    oreGrid: document.getElementById('oreGrid'),
    styleGrid: document.getElementById('styleGrid'),
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

  function priceToCopper(item) {
    const factor = item.price.unit === 'G' ? data.currency.goldToCopper : 1;
    return {
      min: Math.round(item.price.min * factor),
      max: Math.round(item.price.max * factor)
    };
  }

  function formatPrice(item) {
    const icon = item.price.unit === 'G' ? data.currency.goldIcon : data.currency.copperIcon;
    const same = item.price.min === item.price.max;
    const amount = same ? item.price.min : item.price.min + ' - ' + item.price.max;
    return '<span class="price">' + amount + ' <img src="' + icon + '" alt="' + item.price.unit + '"></span>';
  }

  function rarityClass(rarity) {
    return rarity === 'Selten' ? 'sel' : '';
  }

  function normalise(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function itemSearchText(item) {
    return normalise([
      item.name,
      item.subtitle,
      item.category,
      item.type,
      item.rarity,
      item.material,
      item.desc,
      item.tags.join(' ')
    ].join(' '));
  }

  function passes(item) {
    if (state.category !== 'Alle' && item.category !== state.category) return false;
    if (state.rarity !== 'Alle' && item.rarity !== state.rarity) return false;
    if (state.q && itemSearchText(item).indexOf(normalise(state.q)) === -1) return false;
    if (state.maxPrice > 0 && priceToCopper(item).min > state.maxPrice) return false;
    if (state.maxWeight > 0 && item.weight && item.weight > state.maxWeight) return false;
    return true;
  }

  function itemCard(item) {
    const subtitle = item.subtitle ? '<small>' + item.subtitle + '</small>' : '';
    const weight = item.weight === null ? '-' : item.weight + ' kg';
    const selected = state.compare.some(entry => entry.id === item.id);
    const profile = getProfile(item);
    return [
      '<article class="item-card" data-id="' + item.id + '">',
      '  <div class="item-media">',
      '    <span class="rarity ' + rarityClass(item.rarity) + '">' + displayRarity(item.rarity) + '</span>',
      '    <img src="' + item.image + '" alt="' + item.name + '" loading="lazy">',
      '  </div>',
      '  <div class="item-main">',
      '    <div class="item-body">',
      '      <div class="item-title"><div><h3>' + item.name + '</h3>' + subtitle + '</div>' + formatPrice(item) + '</div>',
      '      <div class="facts">',
      fact('Kategorie', item.category),
      fact('Typ', item.type),
      fact('Gewicht', weight),
      fact('Material', item.material),
      '      </div>',
      '      <p class="desc">' + item.desc + '</p>',
      '      <div class="tag-row">' + item.tags.map(tag => '<span class="tag">' + tag + '</span>').join('') + '</div>',
      '      <div class="actions">',
      '        <button type="button" data-action="detail" data-id="' + item.id + '">Details</button>',
      '        <button type="button" class="secondary" data-action="compare" data-id="' + item.id + '">' + (selected ? 'Entfernen' : 'Vergleichen') + '</button>',
      '      </div>',
      '    </div>',
      '    <aside class="profile-panel">',
      '      <h4>' + profile.title + '</h4>',
      renderRadar(profile.labels, profile.values),
      renderBars(profile.labels, profile.values),
      '    </aside>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function getProfile(item) {
    if (item.category === 'Schilde') {
      return {
        title: 'Schildprofil',
        labels: ['Deckung', 'Parade', 'Stabilität', 'Mobilität', 'Formation', 'Konter'],
        values: shieldStats(item)
      };
    }
    if (item.category === 'Ruestungen') {
      return {
        title: 'Rüstungsprofil',
        labels: ['Schutz', 'Wuchtabfang', 'Beweglichkeit', 'Ausdauer', 'Tarnung', 'Wartung'],
        values: armorStats(item)
      };
    }
    return {
      title: 'Waffenprofil',
      labels: ['Schaden', 'Durchschlag', 'Tempo', 'Reichweite', 'Handhabung', 'Vielseitigkeit'],
      values: weaponStats(item)
    };
  }

  function weaponStats(item) {
    const table = {
      stahlschwert: [5, 4, 7, 5, 8, 8],
      langschwert: [6, 5, 6, 7, 6, 8],
      dreizack: [5, 4, 5, 8, 5, 7],
      flegel: [7, 8, 4, 5, 3, 5],
      streitaxt: [8, 6, 3, 5, 4, 5],
      rattenpruegel: [7, 5, 2, 4, 5, 3],
      ritterschwert: [8, 6, 6, 6, 5, 8],
      hellebarde: [8, 7, 3, 10, 3, 6],
      armbrust: [7, 8, 3, 8, 8, 5],
      streitkolben: [6, 8, 5, 4, 7, 5],
      kriegshammer: [10, 9, 2, 5, 2, 4],
      morgenstern: [7, 9, 4, 4, 4, 4],
      lanze: [8, 7, 3, 10, 5, 4],
      'einfacher-bogen': [4, 3, 7, 7, 7, 7],
      kurzbogen: [4, 4, 8, 6, 8, 7],
      langbogen: [7, 6, 5, 10, 4, 6]
    };
    return table[item.id] || [5, 5, 5, 5, 5, 5];
  }

  function armorStats(item) {
    const table = {
      lederruestung: [3, 2, 9, 8, 8, 8],
      'verstaerkte-lederruestung': [5, 4, 7, 7, 6, 6],
      stoffruestung: [1, 2, 10, 9, 9, 9],
      kettenruestung: [6, 3, 6, 5, 5, 4],
      schuppenpanzer: [7, 5, 5, 4, 3, 4],
      stahlkuerass: [7, 6, 6, 5, 4, 5],
      ritterplatte: [10, 9, 2, 2, 1, 2],
      fellruestung: [2, 3, 8, 7, 7, 8],
      ringpanzer: [5, 4, 6, 6, 4, 6],
      brigantine: [8, 6, 6, 5, 6, 5],
      lamellenpanzer: [7, 5, 7, 6, 4, 7],
      turnierruestung: [9, 10, 1, 1, 1, 1],
      'wappenrock-ruestung': [9, 8, 3, 3, 2, 3],
      gambeson: [3, 6, 8, 7, 7, 8]
    };
    return table[item.id] || [5, 5, 5, 5, 5, 5];
  }

  function shieldStats(item) {
    const table = {
      rundschild: [6, 8, 6, 8, 6, 8],
      'kite-schild': [8, 6, 7, 5, 8, 5],
      turmschild: [10, 4, 9, 2, 10, 2],
      buckler: [2, 9, 5, 10, 2, 9],
      pavese: [10, 2, 8, 1, 8, 1]
    };
    return table[item.id] || [5, 5, 5, 5, 5, 5];
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
    const rings = [2, 4, 6, 8, 10].map(v => {
      const pts = labels.map((_, i) => point(i, maxR * v / 10)).join(' ');
      return '<polygon points="' + pts + '" class="radar-ring"></polygon>';
    }).join('');
    const axes = labels.map((_, i) => '<line x1="' + center + '" y1="' + center + '" x2="' + point(i, maxR).split(',')[0] + '" y2="' + point(i, maxR).split(',')[1] + '" class="radar-axis"></line>').join('');
    const shape = values.map((v, i) => point(i, maxR * Math.max(0, Math.min(10, v)) / 10)).join(' ');
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

  function displayRarity(rarity) {
    return rarity
      .replace('Gewoehnlich', 'Gewöhnlich')
      .replace('Ungewoehnlich', 'Ungewöhnlich');
  }

  function fact(label, value) {
    return '<div class="fact"><span>' + label + '</span><b>' + value + '</b></div>';
  }

  function renderItems() {
    const visible = data.items.filter(passes);
    els.itemGrid.innerHTML = visible.length
      ? visible.map(itemCard).join('')
      : '<p class="desc">Keine passende Ware gefunden.</p>';
    els.status.textContent = visible.length + ' von ' + data.items.length + ' Waren angezeigt';
  }

  function renderMiniCatalogs() {
    els.oreGrid.innerHTML = data.ores.map(ore => {
      const tag = ore.link ? 'a href="' + ore.link + '" target="_blank" rel="noreferrer"' : 'div';
      const close = ore.link ? 'a' : 'div';
      return '<' + tag + ' class="mini-card"><img src="' + ore.image + '" alt="' + ore.name + '" loading="lazy"><span>' + ore.name + '</span></' + close + '>';
    }).join('');

    els.styleGrid.innerHTML = data.styles.map(style => {
      return '<article class="style-card"><img src="' + style.image + '" alt="' + style.name + '" loading="lazy"><span>' + style.name + '</span></article>';
    }).join('');
  }

  function setFilter(button) {
    const filter = button.dataset.filter;
    const value = button.dataset.value;
    state[filter] = value;
    document.querySelectorAll('[data-filter="' + filter + '"]').forEach(btn => {
      btn.classList.toggle('active', btn === button);
    });
    renderItems();
  }

  function findItem(id) {
    return data.items.find(item => item.id === id);
  }

  function openDetail(item) {
    const weight = item.weight === null ? '-' : item.weight + ' kg';
    const profile = getProfile(item);
    els.modalContent.innerHTML = [
      '<div class="modal-layout">',
      '  <img class="modal-item-image" src="' + item.image + '" alt="' + item.name + '">',
      '  <div class="modal-info">',
      '    <p class="eyebrow">' + item.category + ' / ' + item.type + '</p>',
      '    <h2 id="modalTitle">' + item.name + '</h2>',
      item.subtitle ? '    <p><em>' + item.subtitle + '</em></p>' : '',
      '    <div class="facts">',
      fact('Seltenheit', displayRarity(item.rarity)),
      fact('Preis', formatPrice(item)),
      fact('Gewicht', weight),
      fact('Material', item.material),
      fact('Verzauberung', item.enchantment),
      fact('Mana', item.mana),
      '    </div>',
      '  </div>',
      '  <aside class="profile-panel modal-profile">',
      '      <h4>' + profile.title + '</h4>',
      renderRadar(profile.labels, profile.values),
      renderBars(profile.labels, profile.values),
      '  </aside>',
      '  <div class="modal-description">',
      '    <p class="desc">' + item.desc + '</p>',
      '    <div class="tag-row">' + item.tags.map(tag => '<span class="tag">' + tag + '</span>').join('') + '</div>',
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

  function toggleCompare(item) {
    const idx = state.compare.findIndex(entry => entry.id === item.id);
    if (idx >= 0) {
      state.compare.splice(idx, 1);
    } else {
      if (state.compare.length >= 2) state.compare.shift();
      state.compare.push(item);
    }
    renderCompareBar();
    renderItems();
  }

  function renderCompareBar() {
    els.compareBar.classList.toggle('visible', state.compare.length > 0);
    els.compareSlots.innerHTML = [0, 1].map(index => {
      const item = state.compare[index];
      return '<div class="slot">' + (item ? item.name : 'Ware ' + (index + 1)) + '</div>';
    }).join('');
    els.compareBtn.disabled = state.compare.length < 2;
  }

  function openCompare() {
    if (state.compare.length < 2) return;
    const [a, b] = state.compare;
    const rows = [
      ['Bild', '<img src="' + a.image + '" alt="' + a.name + '">', '<img src="' + b.image + '" alt="' + b.name + '">'],
      ['Kategorie', a.category, b.category],
      ['Typ', a.type, b.type],
      ['Seltenheit', displayRarity(a.rarity), displayRarity(b.rarity)],
      ['Gewicht', a.weight === null ? '-' : a.weight + ' kg', b.weight === null ? '-' : b.weight + ' kg'],
      ['Material', a.material, b.material],
      ['Preis', formatPrice(a), formatPrice(b)],
      ['Einsatz', a.tags.join(', '), b.tags.join(', ')]
    ];
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
    state.maxWeight = 0;
    els.q.value = '';
    els.maxPrice.value = '';
    els.maxWeight.value = '';
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === 'Alle');
    });
    renderItems();
  }

  function bindEvents() {
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.addEventListener('click', () => setFilter(button));
    });

    els.q.addEventListener('input', () => {
      state.q = els.q.value.trim();
      renderItems();
    });

    els.maxPrice.addEventListener('input', () => {
      state.maxPrice = parseInt(els.maxPrice.value, 10) || 0;
      renderItems();
    });

    els.maxWeight.addEventListener('input', () => {
      state.maxWeight = parseFloat(els.maxWeight.value) || 0;
      renderItems();
    });

    els.resetBtn.addEventListener('click', resetFilters);

    els.itemGrid.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const item = findItem(button.dataset.id);
      if (!item) return;
      if (button.dataset.action === 'detail') openDetail(item);
      if (button.dataset.action === 'compare') toggleCompare(item);
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
      renderItems();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal(els.detailModal);
        closeModal(els.compareModal);
      }
    });
  }

  renderMiniCatalogs();
  renderItems();
  renderCompareBar();
  bindEvents();
})();
