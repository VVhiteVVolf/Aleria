// Visual renderer for the house-warriors template. Only the public page builder is
// exposed; card and section helpers remain feature-local.
(function registerHouseWarriorsRenderer(global) {
  function renderImage(card, className) {
    const image = sanitizeImageSrc(card.image || '');
    const imageClass = `${className} image-${card.imageFormat} fit-${card.imageFit} position-${card.imagePosition}`;
    if (image) {
      return `<div class="${imageClass}"><img src="${image}" alt="${escapeHtml(card.name || '')}" loading="lazy" decoding="async"></div>`;
    }
    return `<div class="${imageClass} is-placeholder" aria-hidden="true"><span>✦</span></div>`;
  }

  function renderFacts(card) {
    const facts = [
      ['Aufgabe', card.duty],
      ['Ausrüstung', card.equipment],
      ['Merkmal', card.hallmark]
    ].filter(([, value]) => value);
    if (!facts.length) return '';
    return `<dl class="house-warriors-facts">${facts.map(([label, value]) => `
      <div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>`;
  }

  function renderCard(card, variant = 'knight') {
    return `
      <article class="house-warriors-card house-warriors-card-${variant}">
        ${renderImage(card, 'house-warriors-card-image')}
        <div class="house-warriors-card-body">
          ${card.badge ? `<div class="house-warriors-card-badge">${escapeHtml(card.badge)}</div>` : ''}
          <h4>${escapeHtml(card.name || 'Unbenannte Gattung')}</h4>
          ${card.subtitle ? `<p class="house-warriors-card-subtitle">${escapeHtml(card.subtitle)}</p>` : ''}
          ${card.description ? `<div class="house-warriors-card-description">${sanitizeContentHtml(card.description)}</div>` : ''}
          ${renderFacts(card)}
        </div>
      </article>`;
  }

  function renderDivider(label) {
    return `
      <div class="house-warriors-divider" aria-hidden="true">
        <span></span><i>◆</i><strong>${escapeHtml(label)}</strong><i>◆</i><span></span>
      </div>`;
  }

  function buildHouseWarriorsPage(page, entry, pageIndex, total) {
    const nav = buildNav(page, pageIndex, total);
    const data = HouseWarriorsData.sanitize(page.houseWarriors);
    const banner = sanitizeStyleUrl(data.bannerImage);
    const crest = sanitizeImageSrc(data.crest);
    const knightRows = HouseWarriorsData.getBalancedRows(data.knightlyClasses)
      .map(row => `<div class="house-warriors-knight-row" style="--house-warriors-columns:${row.length}">${row.map(card => renderCard(card, 'knight')).join('')}</div>`)
      .join('');
    const headerStyle = banner ? ` style="--house-warriors-banner:url('${banner}')"` : '';

    return `
      ${nav}
      <article class="house-warriors-page">
        <header class="house-warriors-hero${banner ? ' has-banner' : ''}"${headerStyle}>
          <div class="house-warriors-hero-shade"></div>
          <div class="house-warriors-hero-copy">
            <div class="house-warriors-eyebrow">${escapeHtml(data.houseName || entry?.title || 'Adelshaus')}</div>
            <h2>${escapeHtml(data.title || page.pageTitle || 'Kriegerische Traditionen')}</h2>
            ${data.motto ? `<p class="house-warriors-motto">„${escapeHtml(data.motto)}“</p>` : ''}
            ${data.introduction ? `<div class="house-warriors-introduction">${sanitizeContentHtml(data.introduction)}</div>` : ''}
            <div class="house-warriors-counts" aria-label="Übersicht">
              <span><strong>${data.knightlyClasses.length}</strong> Rittergattungen</span>
              <span><strong>2</strong> Ausbildungsränge</span>
              <span><strong>${data.menAtArms.length}</strong> Waffenknecht-Gruppen</span>
            </div>
          </div>
          <div class="house-warriors-crest${crest ? '' : ' is-placeholder'}">
            ${crest ? `<img src="${crest}" alt="Wappen ${escapeHtml(data.houseName || '')}" loading="lazy" decoding="async">` : '<span aria-hidden="true">⚜</span>'}
          </div>
        </header>

        <div class="house-warriors-content">
          <section class="house-warriors-section" aria-labelledby="house-warriors-knights-${pageIndex}">
            <div class="house-warriors-section-heading"><span>Der ritterliche Kern</span><h3 id="house-warriors-knights-${pageIndex}">Ritterliche Gattungen</h3></div>
            <div class="house-warriors-knights">${knightRows}</div>
          </section>

          ${renderDivider('Ausbildung')}

          <section class="house-warriors-section" aria-labelledby="house-warriors-training-${pageIndex}">
            <div class="house-warriors-section-heading"><span>Der Weg zum Ritterschlag</span><h3 id="house-warriors-training-${pageIndex}">Page <b>|</b> Knappe</h3></div>
            <div class="house-warriors-training-grid">
              ${renderCard(data.trainingRanks.page, 'training')}
              ${renderCard(data.trainingRanks.squire, 'training')}
            </div>
          </section>

          ${renderDivider('Gefolge')}

          <section class="house-warriors-section" aria-labelledby="house-warriors-men-${pageIndex}">
            <div class="house-warriors-section-heading"><span>Das bewaffnete Gefolge</span><h3 id="house-warriors-men-${pageIndex}">Waffenknechte</h3></div>
            <div class="house-warriors-men-grid" style="--house-warriors-men-columns:${data.menAtArms.length}">
              ${data.menAtArms.map(card => renderCard(card, 'man-at-arms')).join('')}
            </div>
          </section>
        </div>
      </article>`;
  }

  global.buildHouseWarriorsPage = buildHouseWarriorsPage;
})(globalThis);
