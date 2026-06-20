function guestRegisterText(text) {
  return escapeHtml(text || '').replace(/\n/g, '<br>');
}

function buildGuestRegisterImage(src, alt, settings = {}) {
  const image = sanitizeImageSrc(src || '');
  const fit = settings.fit === 'contain' ? 'contain' : 'cover';
  const position = ['top', 'center', 'bottom', 'left', 'right'].includes(settings.position) ? settings.position : 'top';
  const className = `guest-register-portrait gr-fit-${fit} gr-pos-${position}`;
  if (image) {
    return `<img class="${className}" src="${image}" alt="${escapeHtml(alt || '')}" loading="lazy" decoding="async">`;
  }
  return `<div class="${className} guest-register-placeholder">${escapeHtml(getInitialChar(alt || 'G'))}</div>`;
}

function buildGuestRegisterInfoRows(rows = [], className = '') {
  const safeRows = sanitizeGuestRegisterRows(rows, [], 10);
  if (!safeRows.length) return '';
  return `
    <div class="guest-register-rows ${className}">
      ${safeRows.map(row => `
        <div>
          <span>${escapeHtml(row.label)}</span>
          <strong>${escapeHtml(row.value)}</strong>
        </div>`).join('')}
    </div>`;
}

function buildGuestRegisterGuest(guest, index) {
  const safeGuest = sanitizeGuestRegisterGuest(guest, index);
  return `
    <article class="guest-register-entry">
      <aside class="guest-register-profile">
        ${buildGuestRegisterImage(safeGuest.portrait, safeGuest.name, {
          fit: safeGuest.portraitFit,
          position: safeGuest.portraitPosition
        })}
        <div class="guest-register-name">
          <strong>${escapeHtml(safeGuest.name)}</strong>
          <span>${escapeHtml(safeGuest.role)}</span>
          <em>${escapeHtml(safeGuest.status)}</em>
        </div>
        ${buildGuestRegisterInfoRows(safeGuest.infoRows.slice(0, 6), 'guest-register-info')}
      </aside>
      <section class="guest-register-description">
        <h4>${escapeHtml(safeGuest.descriptionTitle)}</h4>
        <p>${guestRegisterText(safeGuest.description)}</p>
      </section>
      <aside class="guest-register-side">
        <h4>${escapeHtml(safeGuest.sideTitle)}</h4>
        ${buildGuestRegisterInfoRows(safeGuest.sideRows, 'guest-register-side-rows')}
      </aside>
    </article>`;
}

function buildGuestRegisterSection(section, index) {
  const safeSection = sanitizeGuestRegisterSections([section])[0];
  if (!safeSection) return '';
  return `
    <section class="guest-register-section">
      <header class="guest-register-section-head">
        <div>
          <h3>${escapeHtml(safeSection.title || `Abschnitt ${index + 1}`)}</h3>
          ${safeSection.subtitle ? `<p>${escapeHtml(safeSection.subtitle)}</p>` : ''}
        </div>
        <span>${safeSection.guests.length} Gäste</span>
      </header>
      <div class="guest-register-section-list">
        ${safeSection.guests.length
          ? safeSection.guests.map((guest, guestIndex) => buildGuestRegisterGuest(guest, guestIndex)).join('')
          : '<div class="guest-register-empty">Noch keine Gäste in diesem Abschnitt.</div>'}
      </div>
    </section>`;
}

function buildGuestRegisterPage(page, entry, pageIndex, total) {
  const data = sanitizeGuestRegisterData(page?.guestRegister || {});
  const portraitSize = clampGuestRegisterPortraitSize(data.portraitSize);
  return `
    ${buildNav(page, pageIndex, total)}
    <article class="guest-register-page" style="--guest-portrait-size:${escapeHtml(portraitSize)}px;">
      <header class="guest-register-header">
        <div>
          <p>${escapeHtml(data.location)}</p>
          <h2>${escapeHtml(data.title)}</h2>
          <span>${escapeHtml(data.subtitle)}</span>
        </div>
      </header>
      <div class="guest-register-scroll">
        ${data.sections.map((section, index) => buildGuestRegisterSection(section, index)).join('')}
      </div>
      ${data.note ? `<footer class="guest-register-footer">${guestRegisterText(data.note)}</footer>` : ''}
    </article>`;
}
