function getCourtInternalTargetId(target = '') {
  const value = String(target || '').trim();
  if (!value) return '';
  if (/^(https?:|mailto:|tel:|#)/i.test(value)) return '';
  return typeof findCurrentSectionByEntryId === 'function' && findCurrentSectionByEntryId(value) ? value : '';
}

function buildCourtTargetHref(target = '') {
  const value = String(target || '').trim();
  if (!value) return '';
  if (/^#[A-Za-z0-9_\-:.]+$/.test(value)) return escapeHtml(value);
  return sanitizeHref(value);
}

function buildCourtImageOrMark(src, text, className, fallback = 'S') {
  const image = sanitizeImageSrc(src || '');
  if (image) {
    return `<img class="${className}" src="${image}" alt="" loading="lazy" decoding="async">`;
  }
  return `<div class="${className} placeholder">${escapeHtml(String(text || '').trim().charAt(0) || fallback)}</div>`;
}

function buildCourtLinkedBlock(target, innerHtml, className = '') {
  const internalId = getCourtInternalTargetId(target || '');
  if (internalId) {
    return `<button class="${className}" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(internalId)}">${innerHtml}</button>`;
  }
  const href = buildCourtTargetHref(target || '');
  if (!href) return `<div class="${className}">${innerHtml}</div>`;
  const externalAttrs = /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a class="${className}" href="${href}"${externalAttrs}>${innerHtml}</a>`;
}

function getCourtImageFit(page, fallback = 'cover') {
  const value = String(page?.imageFit || '').trim();
  return ['cover', 'contain'].includes(value) ? value : fallback;
}

function getCourtImagePosition(page, fallback = 'center top') {
  const value = String(page?.imagePosition || '').trim();
  const positions = {
    top: 'center top',
    center: 'center center',
    bottom: 'center bottom',
    left: 'left center',
    right: 'right center'
  };
  return positions[value] || fallback;
}

function buildCourtImageElementAttrs(page, fallbackFit = 'cover', fallbackPosition = 'center top') {
  const fit = getCourtImageFit(page, fallbackFit);
  const position = getCourtImagePosition(page, fallbackPosition);
  return ` style="object-fit:${fit};object-position:${position};"`;
}

function buildCourtImageFrameAttrs(page) {
  if (page?.imageWidth == null || page.imageWidth === '') return '';
  const width = Math.max(20, Math.min(100, Number(page.imageWidth) || 100));
  return ` style="width:${width}%;max-width:100%;margin-inline:auto;"`;
}

function buildCourtPanel(title, body, className = '') {
  const content = String(body || '').trim();
  if (!content) return '';
  return `
    <section class="court-panel ${className}">
      ${title ? `<h3>${escapeHtml(title)}</h3>` : ''}
      ${content}
    </section>`;
}

function buildCourtOverviewRows(rows) {
  const list = sanitizeCourtOverviewRows(rows || []);
  if (!list.length) return '';
  return `<div class="court-overview-list">${list.map(row => buildCourtLinkedBlock(row.target, `
    ${buildCourtImageOrMark(row.icon, row.label, 'court-row-icon', '+')}
    <span>${escapeHtml(row.label)}</span>
    <strong>${sanitizeContentHtml(row.value)}</strong>
  `, 'court-overview-row')).join('')}</div>`;
}

function buildCourtCharges(items) {
  const list = sanitizeCourtCharges(items || []);
  if (!list.length) return '';
  return `<div class="court-charge-list">${list.map(item => buildCourtLinkedBlock(item.target, `
    <span class="court-charge-number">${escapeHtml(item.number)}</span>
    <div>
      <strong>${escapeHtml(item.title || 'Anklagepunkt')}</strong>
      ${item.text ? `<p>${sanitizeContentHtml(item.text)}</p>` : ''}
    </div>
  `, 'court-charge-card')).join('')}</div>`;
}

function buildCourtDates(items) {
  const list = sanitizeCourtDates(items || []);
  if (!list.length) return '';
  return `<div class="court-date-list">${list.map(item => buildCourtLinkedBlock(item.target, `
    ${buildCourtImageOrMark(item.icon, item.label, 'court-date-icon', '*')}
    <div>
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      ${item.note ? `<p>${sanitizeContentHtml(item.note)}</p>` : ''}
    </div>
  `, 'court-date-row')).join('')}</div>`;
}

function buildCourtParties(items) {
  const list = sanitizeCourtParties(items || []);
  if (!list.length) return '';
  return `<div class="court-party-grid">${list.map(item => buildCourtLinkedBlock(item.target, `
    ${buildCourtImageOrMark(item.portrait || item.crest, item.name || item.role, 'court-party-portrait', '#')}
    <div>
      ${item.role ? `<em>${escapeHtml(item.role)}</em>` : ''}
      <strong>${escapeHtml(item.name || 'Beteiligte Person')}</strong>
      ${item.title ? `<span>${escapeHtml(item.title)}</span>` : ''}
      ${item.text ? `<p>${sanitizeContentHtml(item.text)}</p>` : ''}
    </div>
  `, 'court-party-card')).join('')}</div>`;
}

function buildCourtEvidence(items) {
  const list = sanitizeCourtEvidence(items || []);
  if (!list.length) return '';
  return `<div class="court-evidence-list">${list.map(item => buildCourtLinkedBlock(item.target, `
    ${buildCourtImageOrMark(item.icon, item.title, 'court-evidence-icon', '!')}
    <div class="court-evidence-main">
      <strong>${escapeHtml(item.title || 'Beweisstueck')}</strong>
      ${item.text ? `<p>${sanitizeContentHtml(item.text)}</p>` : ''}
      <div class="court-evidence-meta">
        ${item.location ? `<span>${escapeHtml(item.location)}</span>` : ''}
        ${item.custodian ? `<span>${escapeHtml(item.custodian)}</span>` : ''}
        ${item.status ? `<span>${escapeHtml(item.status)}</span>` : ''}
      </div>
    </div>
    ${item.date ? `<time>${escapeHtml(item.date)}</time>` : ''}
  `, 'court-evidence-row')).join('')}</div>`;
}

function buildCourtWitnesses(items) {
  const list = sanitizeCourtWitnesses(items || []);
  if (!list.length) return '';
  return `<div class="court-witness-list">${list.map(item => buildCourtLinkedBlock(item.target, `
    ${buildCourtImageOrMark(item.portrait, item.name, 'court-witness-portrait', '?')}
    <div class="court-witness-main">
      <strong>${escapeHtml(item.name || 'Zeuge')}</strong>
      ${item.role ? `<span>${escapeHtml(item.role)}</span>` : ''}
      ${item.statement ? `<p>${sanitizeContentHtml(item.statement)}</p>` : ''}
    </div>
    <div class="court-witness-status">
      ${item.status ? `<span>${escapeHtml(item.status)}</span>` : ''}
      ${item.protection ? `<em>${escapeHtml(item.protection)}</em>` : ''}
    </div>
  `, 'court-witness-row')).join('')}</div>`;
}

function buildCourtChronology(items) {
  const list = sanitizeCourtChronology(items || []);
  if (!list.length) return '';
  return `<div class="court-timeline">${list.map(item => buildCourtLinkedBlock(item.target, `
    <time>${escapeHtml(item.date)}</time>
    <div>
      <strong>${escapeHtml(item.title || 'Ereignis')}</strong>
      ${item.text ? `<p>${sanitizeContentHtml(item.text)}</p>` : ''}
    </div>
  `, 'court-timeline-row')).join('')}</div>`;
}

function buildCourtOpenQuestions(items) {
  const list = sanitizeCourtOpenQuestions(items || []);
  if (!list.length) return '';
  return `<div class="court-question-list">${list.map(item => buildCourtLinkedBlock(item.target, `
    ${buildCourtImageOrMark(item.icon, item.text, 'court-question-icon', '?')}
    <p>${sanitizeContentHtml(item.text)}</p>
    ${item.status ? `<span>${escapeHtml(item.status)}</span>` : ''}
  `, 'court-question-row')).join('')}</div>`;
}

function buildCourtRelatedEntries(items) {
  const list = sanitizeCourtRelatedEntries(items || []);
  if (!list.length) return '';
  return `<div class="court-related-list">${list.map(item => buildCourtLinkedBlock(item.target, `
    ${buildCourtImageOrMark(item.icon, item.label, 'court-related-icon', '+')}
    <div>
      <strong>${escapeHtml(item.label || 'Eintrag')}</strong>
      ${item.detail ? `<span>${escapeHtml(item.detail)}</span>` : ''}
    </div>
  `, 'court-related-row')).join('')}</div>`;
}

function buildCourtPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const inlineCommentThread = getInlineCommentThreadForPage(page, entry, pageIndex);
  const data = sanitizeCourtData(page.court || {});
  const heroImage = sanitizeImageSrc(page.image || '');
  const headerIcon = sanitizeImageSrc(data.headerIcon || entry.symbol || '');
  const sealImage = sanitizeImageSrc(data.sealImage || '');
  const bannerImage = sanitizeImageSrc(data.bannerImage || '');
  const background = sanitizeStyleUrl(data.backgroundImage || '');
  const summaryText = data.summaryText || page.description || '';
  const styleAttr = background ? ` style="--court-bg:url('${background}');"` : '';
  const embeddedComments = inlineCommentThread ? buildOrganicCommentsContinuation(inlineCommentThread) : '';
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';

  return `
    ${nav}
    <div class="court-page"${styleAttr}>
      <header class="court-header">
        <div class="court-header-title">
          ${buildCourtImageOrMark(headerIcon, data.archiveLabel || entry.title, 'court-header-icon', 'S')}
          <div>
            <span>${escapeHtml(data.archiveLabel || 'Gerichtsakte')}</span>
            <h2>${escapeHtml(entry.title || 'Gerichtsakte')}</h2>
            ${entry.subtitle ? `<p>${escapeHtml(entry.subtitle)}</p>` : ''}
          </div>
        </div>
        <div class="court-header-meta">
          ${data.caseNumber ? `<strong>${escapeHtml(data.caseNumber)}</strong>` : ''}
          ${data.courtName ? `<span>${escapeHtml(data.courtName)}</span>` : ''}
          ${data.status ? `<em>${escapeHtml(data.status)}</em>` : ''}
          ${sealImage ? `<img src="${sealImage}" alt="" loading="lazy" decoding="async">` : ''}
        </div>
      </header>

      ${bannerImage ? `<img class="court-banner" src="${bannerImage}" alt="" loading="lazy" decoding="async">` : ''}

      <div class="court-layout">
        <main class="court-main">
          ${buildCourtPanel(data.overviewTitle, buildCourtOverviewRows(data.overviewRows), 'court-overview-panel')}
          ${summaryText ? `<section class="court-summary"><h3>${escapeHtml(data.summaryTitle)}</h3>${sanitizeContentHtml(summaryText)}</section>` : ''}
          ${buildCourtPanel(data.chargesTitle, buildCourtCharges(data.charges), 'court-charges-panel')}
          ${buildCourtPanel(data.datesTitle, buildCourtDates(data.dates), 'court-dates-panel')}
        </main>
        <aside class="court-side">
          ${heroImage ? `<figure class="court-hero-image"${buildCourtImageFrameAttrs(page)}><img src="${heroImage}" alt="${escapeHtml(entry.title || 'Gerichtsakte')}" loading="eager" decoding="async" fetchpriority="high"${buildCourtImageElementAttrs(page, 'cover', 'center top')}></figure>` : ''}
          ${buildCourtPanel(data.evidenceTitle, buildCourtEvidence(data.evidence), 'court-evidence-panel')}
          ${buildCourtPanel(data.witnessesTitle, buildCourtWitnesses(data.witnesses), 'court-witness-panel')}
        </aside>
      </div>

      ${buildCourtPanel(data.partiesTitle, buildCourtParties(data.parties), 'court-parties-panel')}
      <div class="court-bottom-grid">
        ${buildCourtPanel(data.chronologyTitle, buildCourtChronology(data.chronology), 'court-chronology-panel')}
        ${buildCourtPanel(data.openQuestionsTitle, buildCourtOpenQuestions(data.openQuestions), 'court-questions-panel')}
        ${buildCourtPanel(data.relatedTitle, buildCourtRelatedEntries(data.relatedEntries), 'court-related-panel')}
      </div>
      ${data.noteText ? `<section class="court-note"><h3>${escapeHtml(data.noteTitle)}</h3>${sanitizeContentHtml(data.noteText)}</section>` : ''}
      ${data.footer ? `<footer class="court-footer">${escapeHtml(data.footer)}</footer>` : ''}
    </div>
    ${embeddedComments}
    ${sym}`;
}
