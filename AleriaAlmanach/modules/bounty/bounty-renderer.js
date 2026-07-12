function getBountyImageStyle(item = {}, prefix = 'image') {
  const scale = Math.max(50, Math.min(220, Number(item[`${prefix}Scale`]) || 100));
  const x = Math.max(0, Math.min(100, Number(item[`${prefix}X`]) || 50));
  const y = Math.max(0, Math.min(100, Number(item[`${prefix}Y`]) || 50));
  return `--bounty-img-scale:${scale / 100};--bounty-img-x:${x}%;--bounty-img-y:${y}%;`;
}

function buildBountyImage(src, className, fallback = '', style = '', alt = '') {
  const image = sanitizeImageSrc(src || '');
  if (image) {
    return `<span class="${className}" style="${style}"><img src="${image}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"></span>`;
  }
  return `<span class="${className} placeholder">${escapeHtml(fallback || '+')}</span>`;
}

function buildBountyPanel(title, content, className = '') {
  if (!String(content || '').trim()) return '';
  return `
    <section class="bounty-panel ${className}">
      ${title ? `<h3>${escapeHtml(title)}</h3>` : ''}
      ${content}
    </section>`;
}

function buildBountyThreat(level = 1) {
  const value = Math.max(1, Math.min(5, Number(level) || 1));
  return `<div class="bounty-threat" aria-label="Gefahrenstufe ${value} von 5">
    ${Array.from({ length: 5 }, (_, index) => `<span class="${index < value ? 'filled' : ''}">&#9760;</span>`).join('')}
  </div>`;
}

function buildBountyRating(value = 0) {
  const current = Math.max(0, Math.min(5, Number(value) || 0));
  return `<span class="bounty-rating">${Array.from({ length: 5 }, (_, index) => `<i class="${index < current ? 'filled' : ''}"></i>`).join('')}</span>`;
}

function buildBountyChargeList(items = []) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return '';
  return `<div class="bounty-charge-list">${list.map(item => `
    <div class="bounty-charge-row">
      ${buildBountyImage(item.icon, 'bounty-charge-icon', '!', '', item.title)}
      <div>
        <strong>${escapeHtml(item.title || 'Tatvorwurf')}</strong>
        ${item.text ? `<p>${escapeHtml(item.text)}</p>` : ''}
      </div>
    </div>`).join('')}</div>`;
}

function buildBountyDescription(data) {
  const rows = (Array.isArray(data.descriptionRows) ? data.descriptionRows : [])
    .map(row => `<div class="bounty-info-row"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></div>`)
    .join('');
  const note = data.descriptionNote ? `<p class="bounty-info-note">${sanitizeContentHtml(data.descriptionNote)}</p>` : '';
  const icon = data.descriptionIcon
    ? buildBountyImage(data.descriptionIcon, 'bounty-description-mark', '*', '', data.descriptionTitle)
    : '';
  return rows || note || icon ? `${rows}${note}${icon}` : '';
}

function buildBountyCompanions(items = []) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return '';
  return `<div class="bounty-companion-grid">${list.map((item, index) => `
    <article class="bounty-companion-card">
      ${buildBountyImage(item.image, 'bounty-companion-img', getInitialChar(item.title || index + 1), getBountyImageStyle(item), item.title)}
      <strong>${escapeHtml(item.title || 'Begleiter')}</strong>
      ${item.subtitle ? `<span>${escapeHtml(item.subtitle)}</span>` : ''}
      ${item.text ? `<p>${escapeHtml(item.text)}</p>` : ''}
    </article>`).join('')}</div>`;
}

function buildBountySightings(items = []) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return '';
  return `<table class="bounty-sightings"><thead><tr><th>Ort</th><th>Datum</th><th>Beobachter</th></tr></thead><tbody>
    ${list.map(item => `<tr><td>${escapeHtml(item.place)}</td><td>${escapeHtml(item.date)}</td><td>${escapeHtml(item.observer)}</td></tr>`).join('')}
  </tbody></table>`;
}

function buildBountyConnectionCards(items = [], className = '') {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return '';
  return `<div class="bounty-connection-stack ${className}">${list.map((item, index) => `
    <article class="bounty-connection-card">
      ${buildBountyImage(item.image, 'bounty-connection-img', getInitialChar(item.title || index + 1), getBountyImageStyle(item), item.title)}
      <div>
        <strong>${escapeHtml(item.title || 'Eintrag')}</strong>
        ${item.subtitle ? `<span>${escapeHtml(item.subtitle)}</span>` : ''}
        ${item.text ? `<p>${escapeHtml(item.text)}</p>` : ''}
      </div>
    </article>`).join('')}</div>`;
}

function buildBountyDangerProfile(items = []) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return '';
  return `<div class="bounty-danger-list">${list.map(item => `
    <div class="bounty-danger-row">
      ${buildBountyImage(item.icon, 'bounty-danger-icon', '*', '', item.label)}
      <strong>${escapeHtml(item.label || 'Profilwert')}</strong>
      ${buildBountyRating(item.value)}
    </div>`).join('')}</div>`;
}

function buildBountyFilePage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const inlineCommentThread = getInlineCommentThreadForPage(page, entry, pageIndex);
  const data = sanitizeBountyFileData(page.bountyFile || {});
  const background = sanitizeStyleUrl(data.backgroundImage || '');
  const styleAttr = background ? ` style="--bounty-bg:url('${background}');"` : '';
  const embeddedComments = inlineCommentThread ? buildOrganicCommentsContinuation(inlineCommentThread) : '';
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';

  return `
    ${nav}
    <div class="bounty-file-page"${styleAttr}>
      <article class="bounty-file-sheet">
        <header class="bounty-dossier-header">
          <div class="bounty-dossier-heading">
            ${buildBountyImage(data.regionalBanner, 'bounty-regional-banner', 'A', getBountyImageStyle(data, 'regionalBanner'), data.archiveTitle)}
            <div>
              <span>Amtliches Fahndungsdossier</span>
              <h2>${escapeHtml(data.archiveTitle)}</h2>
              <p>${escapeHtml(data.archiveSubtitle)}</p>
            </div>
          </div>
          <div class="bounty-dossier-seal">${data.sealImage ? buildBountyImage(data.sealImage, 'bounty-seal', '', `--bounty-img-scale:${data.sealScale / 100};--bounty-img-x:${data.sealX}%;--bounty-img-y:${data.sealY}%;`, 'Siegel') : ''}</div>
        </header>

        <div class="bounty-dossier">
          <aside class="bounty-column bounty-column-left">
            ${buildBountyImage(data.portraitImage || page.image, 'bounty-portrait', 'Gesucht', `--bounty-img-scale:${data.portraitScale / 100};--bounty-img-x:${data.portraitX}%;--bounty-img-y:${data.portraitY}%;`, data.targetName || entry.title)}
            ${buildBountyPanel(data.descriptionTitle, buildBountyDescription(data), 'bounty-description-panel')}
            ${data.handoverNote ? `<blockquote class="bounty-handover">${sanitizeContentHtml(data.handoverNote)}</blockquote>` : ''}
          </aside>

          <main class="bounty-column bounty-column-main">
            <section class="bounty-identity">
              <span>${escapeHtml(data.nameLabel)}</span>
              <h1>${escapeHtml(data.targetName || entry.title || 'Unbekannt')}</h1>
              ${data.aliases ? `<div class="bounty-aliases"><span>${escapeHtml(data.aliasesLabel)}</span><p>${escapeHtml(data.aliases)}</p></div>` : ''}
            </section>
            <div class="bounty-core-grid">
              <div>
                <span>${escapeHtml(data.statusLabel)}</span>
                <strong class="bounty-status">${escapeHtml(data.status)}</strong>
                <p>${escapeHtml(data.statusNote)}</p>
              </div>
              <div>
                <span>${escapeHtml(data.threatLabel)}</span>
                ${buildBountyThreat(data.threatLevel)}
                <p>${escapeHtml(data.threatText)}</p>
              </div>
              <div>
                <span>${escapeHtml(data.bountyLabel)}</span>
                <strong class="bounty-amount">${escapeHtml(data.bountyAmount || 'Noch offen')}</strong>
                <p>${escapeHtml(data.bountyCurrency)}</p>
                ${buildBountyImage(data.coinImage, 'bounty-coin', 'M', `--bounty-img-scale:${data.coinScale / 100};--bounty-img-x:${data.coinX}%;--bounty-img-y:${data.coinY}%;`, data.bountyCurrency)}
              </div>
            </div>
            ${page.description ? `<div class="bounty-profile-text">${sanitizeContentHtml(page.description)}</div>` : ''}
            ${buildBountyPanel(data.chargesTitle, buildBountyChargeList(data.charges), 'bounty-charges-panel')}
            ${buildBountyPanel(data.traitsTitle, buildBountyChargeList(data.traits), 'bounty-charges-panel bounty-traits-panel')}
            ${buildBountyPanel(data.companionsTitle, buildBountyCompanions(data.companions), 'bounty-companions-panel')}
            ${buildBountyPanel(data.sightingsTitle, buildBountySightings(data.sightings), 'bounty-sightings-panel')}
          </main>

          <aside class="bounty-column bounty-column-right">
            ${buildBountyPanel(data.dangerTitle, buildBountyDangerProfile(data.dangerProfiles), 'bounty-danger-panel')}
            ${buildBountyPanel(data.connectionsTitle, `
            <div class="bounty-connections-grid">
              <section>
                <h4>${escapeHtml(data.factionTitle)}</h4>
                <div class="bounty-faction-card">
                  ${buildBountyImage(data.factionBanner, 'bounty-faction-banner', 'F', `--bounty-img-scale:${data.factionBannerScale / 100};--bounty-img-x:${data.factionBannerX}%;--bounty-img-y:${data.factionBannerY}%;`, data.factionName)}
                  <div><strong>${escapeHtml(data.factionName || 'Noch festlegen')}</strong><p>${escapeHtml(data.factionText)}</p></div>
                </div>
              </section>
              <section><h4>${escapeHtml(data.alliesTitle)}</h4>${buildBountyConnectionCards(data.allies, 'allies')}</section>
              <section><h4>${escapeHtml(data.enemiesTitle)}</h4>${buildBountyConnectionCards(data.enemies, 'enemies')}</section>
              <section><h4>${escapeHtml(data.supportersTitle)}</h4>${buildBountyConnectionCards(data.supporters, 'supporters')}</section>
            </div>`, 'bounty-connections-panel')}
          </aside>
        </div>

        ${data.footer ? `<footer class="bounty-file-footer">${escapeHtml(data.footer)}</footer>` : ''}
      </article>
    </div>
    ${embeddedComments}
    ${sym}`;
}
