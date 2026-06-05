function ensureSpeakerProfileOverlay() {
  let overlay = document.getElementById('speaker-profile-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'speaker-profile-overlay';
  overlay.className = 'speaker-profile-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'false');
  overlay.setAttribute('aria-label', 'Sprecherprofil');
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="speaker-profile-card">
      <button type="button" class="speaker-profile-close" data-speaker-profile-action="close" aria-label="Sprecherprofil schließen">x</button>
      <div id="speaker-profile-content"></div>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function formatSpeakerProfileDate(ms) {
  if (!Number.isFinite(ms)) return 'Noch keine Aktivität';
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleString();
  }
}

function renderSpeakerProfileStat(label, value) {
  return `
    <div class="speaker-profile-stat">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>`;
}

function renderSpeakerProfileList(items, renderItem, emptyText) {
  if (!items?.length) return `<div class="speaker-profile-empty">${escapeHtml(emptyText)}</div>`;
  return `<div class="speaker-profile-list">${items.map(renderItem).join('')}</div>`;
}

function renderSpeakerProfileContent(character, fallbackName, stats, source = {}) {
  const name = character?.name || fallbackName || 'Unbekannte Stimme';
  const title = character?.title || source.title || '';
  const faction = character?.fraktion || character?.faction || '';
  const portrait = sanitizeImageSrc(character?.portrait || source.portrait || stats.recentPortraits?.[0] || '');
  const profileLink = sanitizeHref(character?.profileLink || '');
  const owner = typeof getCharacterPlayerOwnerLabel === 'function'
    ? getCharacterPlayerOwnerLabel(character?.playerOwner || character?.playedBy || character?.player)
    : '';
  const metaRows = [
    title ? ['Titel', title] : null,
    faction ? ['Fraktion', faction] : null,
    owner ? ['Spieler', owner] : null
  ].filter(Boolean);

  return `
    <div class="speaker-profile-head">
      ${portrait
        ? `<img class="speaker-profile-portrait" src="${portrait}" alt="${escapeHtml(name)}" loading="lazy" decoding="async">`
        : `<div class="speaker-profile-portrait speaker-profile-initial">${getInitialChar(name)}</div>`}
      <div class="speaker-profile-title-block">
        <div class="speaker-profile-kicker">Mini-Datenprofil</div>
        <div class="speaker-profile-name">${escapeHtml(name)}</div>
        ${title ? `<div class="speaker-profile-subtitle">${escapeHtml(title)}</div>` : ''}
      </div>
    </div>
    ${metaRows.length ? `<div class="speaker-profile-meta">${metaRows.map(([label, value]) => renderSpeakerProfileStat(label, value)).join('')}</div>` : ''}
    <div class="speaker-profile-stats">
      ${renderSpeakerProfileStat('Kommentare gesamt', String(stats.commentCount))}
      ${renderSpeakerProfileStat('Kommentare hier', String(stats.currentCommentCount))}
      ${renderSpeakerProfileStat('Abschnitte', String(stats.segmentCount))}
      ${renderSpeakerProfileStat('Letzte Aktivität', formatSpeakerProfileDate(stats.latestMs))}
    </div>
    <div class="speaker-profile-section">
      <div class="speaker-profile-section-title">Häufige Wörter</div>
      ${renderSpeakerProfileList(stats.topWords, item => `
        <span class="speaker-profile-chip">${escapeHtml(item.word)} <strong>${escapeHtml(item.count)}</strong></span>
      `, 'Noch zu wenig Textmaterial.')}
    </div>
    <div class="speaker-profile-section">
      <div class="speaker-profile-section-title">Kommentararten</div>
      ${renderSpeakerProfileList(stats.topKinds, item => `
        <span class="speaker-profile-chip">${escapeHtml(item.label)} <strong>${escapeHtml(item.count)}</strong></span>
      `, 'Noch keine Kommentararten erfasst.')}
    </div>
    <div class="speaker-profile-section">
      <div class="speaker-profile-section-title">Häufige Gesprächspartner</div>
      ${renderSpeakerProfileList(stats.topPartners, item => `
        <span class="speaker-profile-chip">${escapeHtml(item.name)} <strong>${escapeHtml(item.count)}</strong></span>
      `, 'Noch keine wiederkehrenden Gesprächspartner.')}
    </div>
    ${profileLink ? `<a class="speaker-profile-link" href="${escapeHtml(profileLink)}" target="_blank" rel="noopener noreferrer">Vollprofil öffnen</a>` : ''}`;
}

function renderSpeakerProfileLoading(name = '') {
  return `
    <div class="speaker-profile-loading">
      <div class="speaker-profile-kicker">Mini-Datenprofil</div>
      <div class="speaker-profile-name">${escapeHtml(name || 'Sprecher')}</div>
      <div class="speaker-profile-empty">Statistik wird geladen...</div>
    </div>`;
}

function showSpeakerProfileOverlay(html) {
  const overlay = ensureSpeakerProfileOverlay();
  const content = overlay.querySelector('#speaker-profile-content');
  if (content) content.innerHTML = html;
  overlay.hidden = false;
  overlay.classList.add('active');
}

function closeSpeakerProfileOverlay() {
  const overlay = document.getElementById('speaker-profile-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  overlay.hidden = true;
}
