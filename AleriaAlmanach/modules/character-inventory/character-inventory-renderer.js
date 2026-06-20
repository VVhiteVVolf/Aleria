function characterInventoryText(text) {
  return escapeHtml(text || '').replace(/\n/g, '<br>');
}

function getCharacterInventoryImageClass(className, options = {}) {
  const settings = sanitizeCharacterInventoryImageSettings(options);
  return [
    className,
    `ci-img-${settings.format}`,
    `ci-fit-${settings.fit}`,
    `ci-pos-${settings.position}`
  ].join(' ');
}

function buildCharacterInventoryImage(src, alt, className, fallback = '*', options = {}) {
  const image = sanitizeImageSrc(src || '');
  const imageClass = getCharacterInventoryImageClass(className, options);
  if (image) return `<img class="${imageClass}" src="${image}" alt="${escapeHtml(alt || '')}" loading="lazy" decoding="async">`;
  return `<div class="${imageClass} ci-placeholder">${escapeHtml(fallback || '*')}</div>`;
}

function buildCharacterInventoryAttributeGrid(attributes = []) {
  return `
    <div class="ci-attribute-grid">
      ${attributes.map(attribute => `
        <div class="ci-attribute-chip">
          <span>${escapeHtml(attribute.label)}</span>
          <strong>${escapeHtml(String(attribute.value))}</strong>
        </div>`).join('')}
    </div>`;
}

function buildCharacterInventoryInfoRows(rows = []) {
  return rows.map(row => `
    <div class="ci-info-row">
      <span>${escapeHtml(row.icon || '*')}</span>
      <em>${escapeHtml(row.label)}</em>
      <strong>${escapeHtml(row.value)}</strong>
    </div>`).join('');
}

function buildCharacterInventoryRadar(attributes = [], className = '') {
  const list = sanitizeCharacterInventoryAttributes(attributes);
  if (!list.length) return '';
  const size = 230;
  const center = size / 2;
  const maxRadius = 72;
  const points = list.map((attribute, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / list.length;
    const valueRadius = maxRadius * (attribute.value / 10);
    const labelRadius = maxRadius + 28;
    return {
      ...attribute,
      x: center + Math.cos(angle) * valueRadius,
      y: center + Math.sin(angle) * valueRadius,
      lx: center + Math.cos(angle) * labelRadius,
      ly: center + Math.sin(angle) * labelRadius
    };
  });
  const polygon = points.map(point => `${point.x},${point.y}`).join(' ');
  const rings = [0.25, 0.5, 0.75, 1].map(step => {
    const ring = list.map((_, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / list.length;
      return `${center + Math.cos(angle) * maxRadius * step},${center + Math.sin(angle) * maxRadius * step}`;
    }).join(' ');
    return `<polygon points="${ring}" fill="none" stroke="rgba(139,105,20,0.24)" stroke-width="1"/>`;
  }).join('');
  const axes = list.map((_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / list.length;
    return `<line x1="${center}" y1="${center}" x2="${center + Math.cos(angle) * maxRadius}" y2="${center + Math.sin(angle) * maxRadius}" stroke="rgba(139,105,20,0.24)" stroke-width="1"/>`;
  }).join('');
  return `
    <div class="ci-radar ${className}">
      <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Attribute">
        ${rings}
        ${axes}
        <polygon points="${polygon}" fill="rgba(111,46,35,0.26)" stroke="#6f2e23" stroke-width="3"/>
        ${points.map(point => `<circle cx="${point.x}" cy="${point.y}" r="3.8" fill="#6f2e23"/>`).join('')}
        ${points.map(point => `<text x="${point.lx}" y="${point.ly}" text-anchor="middle">${escapeHtml(point.label)}</text>`).join('')}
      </svg>
      <div class="ci-radar-bars">
        ${list.map(attribute => `
          <div class="ci-radar-bar">
            <span>${escapeHtml(attribute.label)}</span>
            <i><b style="width:${attribute.value * 10}%"></b></i>
            <strong>${escapeHtml(String(attribute.value))}</strong>
          </div>`).join('')}
      </div>
    </div>`;
}

function buildCharacterInventoryCategories(data) {
  return `
    <div class="ci-tabs" role="tablist">
      ${data.categories.map((category, index) => `
        <button type="button" class="${index === 0 ? 'active' : ''}" data-ci-action="filter-items" data-ci-category="${escapeHtml(category.id)}">
          <span>${escapeHtml(category.icon || '*')}</span>${escapeHtml(category.label)}
        </button>`).join('')}
    </div>`;
}

function buildCharacterInventoryItems(data) {
  return `
    <section class="ci-center">
      ${buildCharacterInventoryCategories(data)}
      <div class="ci-item-table">
        <div class="ci-item-head">
          <span>Name</span><span>Typ</span><span>Beschreibung</span><span>Gewicht</span><span>Anzahl</span>
        </div>
        <div class="ci-item-list">
          ${data.items.map(item => `
            <button class="ci-item-row" type="button" data-ci-action="show-item" data-ci-item-id="${escapeHtml(item.id)}" data-ci-category="${escapeHtml(item.category)}">
              <span class="ci-item-name">${buildCharacterInventoryImage(item.icon || item.image, item.name, 'ci-item-icon', '*', {
                format: item.imageFormat || 'square',
                fit: item.imageFit || 'contain',
                position: item.imagePosition || 'center'
              })}<strong>${escapeHtml(item.name)}</strong></span>
              <span>${escapeHtml(item.type)}</span>
              <span>${escapeHtml(item.description)}</span>
              <span>${escapeHtml(item.weight)}</span>
              <span>${escapeHtml(item.quantity)}</span>
            </button>`).join('')}
        </div>
      </div>
    </section>`;
}

function buildCharacterInventoryCompanions(data) {
  return `
    <aside class="ci-companions">
      <h3>Gefaehrten</h3>
      <div class="ci-companion-list">
        ${data.companions.map(companion => `
          <button class="ci-companion-card" type="button" data-ci-action="show-companion" data-ci-companion-id="${escapeHtml(companion.id)}">
            <div>
              <strong>${escapeHtml(companion.name)}</strong>
              <span>${escapeHtml(companion.species || companion.role)}</span>
            </div>
            ${buildCharacterInventoryImage(companion.image, companion.name, 'ci-companion-image', getInitialChar(companion.name), {
              format: companion.imageFormat || 'landscape',
              fit: companion.imageFit || 'cover',
              position: companion.imagePosition || 'top'
            })}
            <dl>
              <dt>Status</dt><dd style="--ci-status:${escapeHtml(companion.statusColor)}">${escapeHtml(companion.status)}</dd>
              <dt>Rolle</dt><dd>${escapeHtml(companion.role)}</dd>
              <dt>Besonderheit</dt><dd>${escapeHtml(companion.summary)}</dd>
            </dl>
          </button>`).join('')}
      </div>
    </aside>`;
}

function buildCharacterInventoryLeft(data) {
  return `
    <aside class="ci-character">
      <div class="ci-character-head">
        <strong>${escapeHtml(data.name)}</strong>
        <span>${escapeHtml([data.role, data.level].filter(Boolean).join(' - '))}</span>
      </div>
      ${buildCharacterInventoryImage(data.portrait, data.name, 'ci-character-portrait', getInitialChar(data.name), {
        format: data.portraitFormat || 'portrait',
        fit: data.portraitFit || 'cover',
        position: data.portraitPosition || 'top'
      })}
      <section class="ci-box">
        <h3>Infotabelle</h3>
        ${buildCharacterInventoryInfoRows(data.infoRows)}
      </section>
    </aside>`;
}

function buildCharacterInventoryItemModal(item) {
  return `
    <article class="ci-profile-modal">
      <button class="ci-modal-close" type="button" data-ci-action="close-profile">x</button>
      <div class="ci-profile-media">
        ${buildCharacterInventoryImage(item.image || item.icon, item.name, 'ci-profile-image', '*', {
          format: item.imageFormat || 'square',
          fit: item.imageFit || 'contain',
          position: item.imagePosition || 'center'
        })}
        <div class="ci-box">${buildCharacterInventoryInfoRows(item.infoRows)}</div>
      </div>
      <div class="ci-profile-main">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${characterInventoryText(item.description)}</p>
        ${item.tags ? `<div class="ci-tag-line">${escapeHtml(item.tags)}</div>` : ''}
      </div>
      <div class="ci-profile-radar">${buildCharacterInventoryRadar(item.attributes)}</div>
    </article>`;
}

function buildCharacterInventoryCompanionModal(companion) {
  return `
    <article class="ci-profile-modal companion">
      <button class="ci-modal-close" type="button" data-ci-action="close-profile">x</button>
      <div class="ci-profile-media">
        ${buildCharacterInventoryImage(companion.image, companion.name, 'ci-profile-image', getInitialChar(companion.name), {
          format: companion.imageFormat || 'portrait',
          fit: companion.imageFit || 'cover',
          position: companion.imagePosition || 'top'
        })}
        <p>${characterInventoryText(companion.summary)}</p>
      </div>
      <div class="ci-profile-main">
        <h3>${escapeHtml(companion.name)}</h3>
        <div class="ci-box">${buildCharacterInventoryInfoRows(companion.infoRows)}</div>
        <p>${characterInventoryText(companion.description)}</p>
      </div>
      <div class="ci-profile-radar">${buildCharacterInventoryRadar(companion.attributes)}</div>
    </article>`;
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-ci-action]');
  if (!trigger) return;
  const page = trigger.closest('.character-inventory-page');
  if (!page) return;
  const action = trigger.dataset.ciAction;
  if (action === 'filter-items') {
    event.preventDefault();
    const category = trigger.dataset.ciCategory || 'all';
    page.querySelectorAll('[data-ci-action="filter-items"]').forEach(button => button.classList.toggle('active', button === trigger));
    page.querySelectorAll('.ci-item-row').forEach(row => {
      row.hidden = category !== 'all' && row.dataset.ciCategory !== category;
    });
    return;
  }
  if (action === 'show-item' || action === 'show-companion') {
    event.preventDefault();
    const data = sanitizeCharacterInventoryData(JSON.parse(page.dataset.ciData || '{}'));
    const overlay = page.querySelector('.ci-profile-overlay');
    if (!overlay) return;
    if (action === 'show-item') {
      const item = data.items.find(entry => entry.id === trigger.dataset.ciItemId);
      overlay.innerHTML = item ? buildCharacterInventoryItemModal(item) : '';
    } else {
      const companion = data.companions.find(entry => entry.id === trigger.dataset.ciCompanionId);
      overlay.innerHTML = companion ? buildCharacterInventoryCompanionModal(companion) : '';
    }
    overlay.classList.toggle('active', !!overlay.innerHTML);
    return;
  }
  if (action === 'close-profile') {
    event.preventDefault();
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.innerHTML = '';
    }
  }
});

function buildCharacterInventoryPage(page, entry, pageIndex, total) {
  const nav = page?.hideNav ? '' : buildNav(page, pageIndex, total);
  const data = sanitizeCharacterInventoryData(page.characterInventory || {});
  const encoded = escapeHtml(JSON.stringify(data));
  return `
    ${nav}
    <div class="character-inventory-page" data-ci-data="${encoded}">
      <header class="ci-header">
        <div>
          <h2>${escapeHtml(data.title)}</h2>
          <p>${escapeHtml(data.subtitle)}</p>
        </div>
      </header>
      <div class="ci-layout">
        ${buildCharacterInventoryLeft(data)}
        ${buildCharacterInventoryItems(data)}
        ${buildCharacterInventoryCompanions(data)}
      </div>
      <div class="ci-profile-overlay" aria-live="polite"></div>
    </div>`;
}
