function formatLandingDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Datum offen';
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function landingParagraph(text) {
  return escapeHtml(text || '').replace(/\n/g, '<br>');
}

function buildLandingImage(src, alt, className, fallback = '*') {
  const image = sanitizeImageSrc(src || '');
  if (image) return `<img class="${className}" src="${image}" alt="${escapeHtml(alt || '')}" loading="lazy" decoding="async">`;
  return `<div class="${className} landing-placeholder">${escapeHtml(fallback || '*')}</div>`;
}

function buildLandingIcon(value, alt, className, fallback = '*') {
  const raw = String(value || '').trim();
  const image = sanitizeImageSrc(raw);
  if (image) {
    return `<span class="${className} landing-linked-icon"><img src="${image}" alt="${escapeHtml(alt || '')}" loading="lazy" decoding="async"></span>`;
  }
  return `<span class="${className}">${escapeHtml(raw || fallback)}</span>`;
}

function getLandingInternalTarget(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const hashMatch = raw.match(/^#module\/(.+)$/);
  if (hashMatch) return hashMatch[1].trim();
  if (/^https?:\/\//i.test(raw)) return '';
  const entry = (typeof moduleEntries !== 'undefined' ? moduleEntries : []).find(item =>
    item?.id === raw || normalizeSearchText(item?.title || '') === normalizeSearchText(raw)
  );
  return entry?.id || '';
}

function buildLandingMembers(data) {
  return `
    <section class="landing-panel landing-members-panel">
      <div class="landing-panel-head"><h3>${escapeHtml(data.memberTitle)}</h3><span>${data.members.length}</span></div>
      <div class="landing-member-grid">
        ${data.members.length ? '' : '<p class="group-empty">Noch keine Mitglieder eingetragen.</p>'}
        ${data.members.map(member => `
          <article class="landing-member-card">
            <div class="landing-member-media">
              ${buildLandingImage(member.portrait, member.name, 'landing-member-portrait', getInitialChar(member.name))}
              ${buildLandingIcon(member.badgeIcon, `${member.name} Icon`, 'landing-member-badge')}
            </div>
            <div class="landing-member-body">
              <strong>${escapeHtml(member.name)}</strong>
              <em>${escapeHtml(member.role)}</em>
              <span>${escapeHtml(member.className)}</span>
              <small style="--landing-status:${escapeHtml(member.statusColor || '#2c8a3d')}">${escapeHtml(member.status)}</small>
            </div>
          </article>`).join('')}
      </div>
    </section>`;
}

function buildLandingQuestFilters() {
  return `
    <div class="landing-quest-filters">
      <button type="button" class="active" data-landing-action="filter-quests" data-quest-filter="all" aria-pressed="true">Alle</button>
      <button type="button" data-landing-action="filter-quests" data-quest-filter="active" aria-pressed="false">Aktiv</button>
      <button type="button" data-landing-action="filter-quests" data-quest-filter="done" aria-pressed="false">Abgeschlossen</button>
      <button type="button" data-landing-action="filter-quests" data-quest-filter="failed" aria-pressed="false">Fehlgeschlagen</button>
    </div>`;
}

function buildLandingQuests(data) {
  return `
    <section class="landing-panel landing-quests-panel">
      <div class="landing-panel-head">
        <h3>${escapeHtml(data.questTitle)}</h3>
        ${buildLandingQuestFilters()}
      </div>
      <div class="landing-quest-list">
        ${data.quests.length ? '' : '<p class="group-empty">Noch keine aktiven Aufgaben oder Quests.</p>'}
        ${data.quests.map(quest => `
          <article class="landing-quest-card" data-quest-status="${escapeHtml(quest.status)}" data-quest-id="${escapeHtml(quest.id)}">
            ${buildLandingImage(quest.image, quest.title, 'landing-quest-icon', '*')}
            <div class="landing-quest-main">
              <strong>${escapeHtml(quest.title)}</strong>
              <p>${landingParagraph(quest.text)}</p>
              <div class="group-quest-meta"><span>${escapeHtml(quest.kind)}</span>${quest.ownerMemberId ? `<span>Zuständig: ${escapeHtml(data.members.find(member => member.id === quest.ownerMemberId)?.name || 'Nicht mehr in der Gruppe')}</span>` : ''}${quest.dueDate ? `<span>Fällig: ${escapeHtml(quest.dueDate)}</span>` : ''}${quest.moduleId ? `<button type="button" data-landing-action="open-quest-module" data-module-id="${escapeHtml(quest.moduleId)}">Quest öffnen ↗</button>` : ''}</div>
              <div class="landing-progress"><i style="width:${quest.progress}%"></i></div>
            </div>
            <div class="landing-item-menu-wrap">
              <button type="button" class="landing-menu-toggle" data-landing-action="toggle-quest-menu" aria-haspopup="true" aria-expanded="false" title="Optionen">[...]</button>
              <div class="landing-quest-menu landing-item-menu">
                <div class="landing-item-menu-meta"><span>${escapeHtml(quest.kind)}</span><span>${quest.progress}%</span></div>
                <button type="button" data-landing-action="edit-quest" data-quest-id="${escapeHtml(quest.id)}">Bearbeiten</button>
                <button type="button" data-landing-action="complete-quest" data-quest-id="${escapeHtml(quest.id)}">${quest.status === 'done' ? 'Oeffnen' : 'Abschliessen'}</button>
                <button type="button" class="danger" data-landing-action="delete-quest" data-quest-id="${escapeHtml(quest.id)}">Loeschen</button>
              </div>
            </div>
          </article>`).join('')}
      </div>
      <button class="landing-wide-action" type="button" data-landing-action="edit-quest">+ Aufgabe / Quest anlegen</button>
    </section>`;
}

function buildLandingNotes(data) {
  const memberOptions = data.members.map(member => `<option value="${escapeHtml(member.id)}">${escapeHtml(member.name)}</option>`).join('');
  return `
    <section class="landing-panel landing-notes-panel">
      <div class="landing-panel-head">
        <h3>${escapeHtml(data.notesTitle)}</h3>
        <button type="button" data-landing-action="edit-note">+</button>
      </div>
      <div class="landing-note-list" data-member-options="${escapeHtml(memberOptions)}">
        ${data.notes.length ? '' : '<p class="group-empty">Platz für Absprachen, Beobachtungen und Reiseberichte.</p>'}
        ${data.notes.map(note => `
          <article class="landing-note-card" data-note-id="${escapeHtml(note.id)}">
            ${buildLandingIcon(note.icon, note.title, 'landing-note-icon')}
            <div class="landing-note-main">
              <strong>${escapeHtml(note.title)}</strong>
              <p>${landingParagraph(note.text)}</p>
              <small>${escapeHtml(note.authorName || 'Unbekannt')} - ${escapeHtml(formatLandingDate(note.createdAt))}</small>
            </div>
            <div class="landing-item-menu-wrap">
              <button type="button" class="landing-menu-toggle" data-landing-action="toggle-note-menu" aria-haspopup="true" aria-expanded="false" title="Optionen">[...]</button>
              <div class="landing-note-menu landing-item-menu">
                <button type="button" data-landing-action="edit-note" data-note-id="${escapeHtml(note.id)}">Bearbeiten</button>
                <button type="button" class="danger" data-landing-action="delete-note" data-note-id="${escapeHtml(note.id)}">Loeschen</button>
              </div>
            </div>
          </article>`).join('')}
      </div>
    </section>`;
}

function buildLandingEvents(data) {
  return `
    <section class="landing-panel landing-events-panel">
      <div class="landing-panel-head"><h3>${escapeHtml(data.eventsTitle)}</h3></div>
      <div class="landing-event-list">
        ${data.events.map(item => `
          <div class="landing-event-row">
            ${buildLandingIcon(item.icon, item.title, 'landing-row-icon')}
            <span class="landing-event-date">${escapeHtml(item.time)}</span>
            <div class="landing-event-body">
              <span class="landing-event-arrow">&rarr;</span>
              <span class="landing-event-desc">${escapeHtml(item.title)}</span>
              ${buildAleriaDateBadge(item.aleriaDate)}
            </div>
          </div>`).join('')}
      </div>
    </section>`;
}

function buildLandingMap(data) {
  const kartenMap = data.mapKartenId && typeof KartoMapRegistry !== 'undefined' ? KartoMapRegistry.byId(data.mapKartenId) : null;
  if (kartenMap) {
    const previewSrc = kartenMap.images?.normal ? `../Karten/${kartenMap.images.normal}` : '';
    const href = AleriaLandingModel.landingMapFrameSource(data.mapKartenId, KartoMapRegistry);
    const frameSource = data.group ? `src="about:blank" data-landing-map-src="${escapeHtml(href)}"` : `src="${escapeHtml(href)}"`;
    const preview = data.mapDisplay === 'embed' ? `<iframe class="landing-map-embed" ${frameSource} title="Interaktive Karte: ${escapeHtml(kartenMap.title)}" loading="lazy" allow="fullscreen" referrerpolicy="same-origin"></iframe>` : buildLandingImage(previewSrc, kartenMap.title, 'landing-map-image', '*');
    return `
      <section class="landing-panel landing-map-panel">
        <div class="landing-panel-head"><h3>${escapeHtml(data.mapTitle)}</h3></div>
        <div class="landing-map-frame${data.mapDisplay === 'embed' ? ' landing-map-frame-interactive' : ''}">${preview}</div>
        <button class="landing-wide-action" type="button" data-landing-action="open-karten-map" data-map-link="${escapeHtml(href)}">${escapeHtml(data.mapButtonLabel || 'Karte groß öffnen')}</button>
      </section>`;
  }
  const image = buildLandingImage(data.mapImage, data.mapTitle, 'landing-map-image', '*');
  const internalTarget = getLandingInternalTarget(data.mapLink);
  const linkAttrs = internalTarget
    ? `type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(internalTarget)}"`
    : `type="button" data-landing-action="open-map-link" data-map-link="${escapeHtml(data.mapLink)}"`;
  return `
    <section class="landing-panel landing-map-panel">
      <div class="landing-panel-head"><h3>${escapeHtml(data.mapTitle)}</h3></div>
      <div class="landing-map-frame">${image}</div>
      <button class="landing-wide-action" ${linkAttrs}>${escapeHtml(data.mapButtonLabel || 'Karte oeffnen')}</button>
    </section>`;
}

function buildLandingInfo(data) {
  return `
    <section class="landing-panel landing-info-panel">
      <div class="landing-panel-head"><h3>${escapeHtml(data.infoTitle)}</h3></div>
      <div class="landing-info-list">
        ${data.info.map(item => `
          <div class="landing-info-row">
            ${buildLandingIcon(item.icon, item.title, 'landing-row-icon')}
            <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.text)}</small></div>
          </div>`).join('')}
      </div>
    </section>`;
}

function buildLandingConfigureButton() {
  return `<button class="landing-config-button" type="button" data-landing-action="edit-settings">Bearbeiten</button>`;
}

function getLandingPageElement(target) {
  return target?.closest?.('.landing-page');
}

function getLandingPageIndexFromElement(element) {
  return Number(element?.dataset?.landingPageIndex || currentPage || 0);
}

function getLandingMutablePage(element) {
  const index = getLandingPageIndexFromElement(element);
  const pages = currentEntry?.pages || [];
  return pages[index] || null;
}

function persistLandingCurrentEntry() {
  if (!currentEntry?.id) return false;
  const found = findCurrentSectionByEntryId(currentEntry.id);
  const section = found?.section || getPreferredEditorSection();
  currentEntry = persistExistingModuleEntry(currentEntry, section);
  return true;
}

function updateLandingPage(element, updater) {
  const page = getLandingMutablePage(element);
  if (!page) return;
  if (page.landing?.group && !canEditModuleContent()) throw new Error('Bitte zuerst die Bearbeitung freischalten.');
  const data = sanitizeLandingData(page.landing || {});
  updater(data);
  page.landingPage = true;
  page.landing = sanitizeLandingData(data);
  persistLandingCurrentEntry();
  renderPage(getLandingPageIndexFromElement(element), 0);
}

function replaceGroupLandingData(element, entryId, next) {
  if (currentEntry?.id !== entryId || !getLandingMutablePage(element)?.landing?.group) return false;
  updateLandingPage(element, data => { Object.assign(data, sanitizeLandingData(next)); });
  return true;
}

function ensureLandingEditorDialog() {
  let overlay = document.getElementById('landing-editor-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'landing-editor-overlay';
  overlay.className = 'landing-editor-overlay';
  overlay.innerHTML = `
    <div class="landing-editor-card" role="dialog" aria-modal="true" aria-labelledby="landing-editor-title">
      <div class="landing-editor-head">
        <h3 id="landing-editor-title">Eintrag bearbeiten</h3>
        <button type="button" data-landing-editor-action="close">x</button>
      </div>
      <div class="landing-editor-body"></div>
      <div class="landing-editor-actions">
        <button type="button" data-landing-editor-action="close">Abbrechen</button>
        <button type="button" class="primary" data-landing-editor-action="save">Speichern</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
    closeLandingEditorDialog();
  });
  overlay.addEventListener('click', event => {
    if (event.target === overlay) closeLandingEditorDialog();
  });
  return overlay;
}

function landingSettingsInput(label, field, value, type = 'text') {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <input type="${escapeHtml(type)}" data-landing-settings-field="${escapeHtml(field)}" value="${escapeHtml(value || '')}">
    </label>`;
}

function landingSettingsIconInput(label, field, value, scope = 'settings') {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <div class="biography-ability-icon-field">
        <input type="text" data-landing-${scope}-field="${escapeHtml(field)}" value="${escapeHtml(value || '')}">
        <button type="button" class="biography-ability-icon-picker" data-landing-editor-action="pick-icon" title="Icon-Verzeichnis oeffnen" aria-label="Icon-Verzeichnis oeffnen">Icon</button>
      </div>
    </label>`;
}

let _landingSettingsIconPickerTarget = null;

function openLandingSettingsIconPicker(button) {
  const target = button.closest('label')?.querySelector('[data-landing-settings-field], [data-landing-editor-field]');
  if (!target) return;
  _landingSettingsIconPickerTarget = target;
  if (typeof openIconDirectory === 'function') {
    openIconDirectory();
    return;
  }
  _landingSettingsIconPickerTarget = null;
}

function handleLandingSettingsIconSelected(event) {
  const target = _landingSettingsIconPickerTarget;
  const src = String(event?.detail?.src || '').trim();
  if (!target || !target.isConnected || !src) {
    _landingSettingsIconPickerTarget = null;
    return;
  }
  target.value = src;
  target.dispatchEvent(new Event('input', { bubbles: true }));
  target.dispatchEvent(new Event('change', { bubbles: true }));
  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
  if (typeof closeIconDirectory === 'function') {
    closeIconDirectory();
  }
  _landingSettingsIconPickerTarget = null;
}

document.addEventListener('almanach-icon-selected', handleLandingSettingsIconSelected);

function landingSettingsTextarea(label, field, value) {
  return `
    <label class="wide">
      <span>${escapeHtml(label)}</span>
      <textarea data-landing-settings-field="${escapeHtml(field)}">${escapeHtml(value || '')}</textarea>
    </label>`;
}

function landingSettingsSelect(label, field, value, options = []) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <select data-landing-settings-field="${escapeHtml(field)}">
        ${options.map(option => `<option value="${escapeHtml(option.value)}"${option.value === value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
      </select>
    </label>`;
}

function buildLandingSettingsRow(kind, item = {}, index = 0) {
  const removeButton = `<button type="button" class="danger" data-landing-editor-action="remove-settings-row">Entfernen</button>`;
  if (kind === 'member') {
    return `
      <section class="landing-settings-row" data-settings-kind="member">
        <div class="landing-settings-row-head"><strong>Abenteurer ${index + 1}</strong>${removeButton}</div>
        <input type="hidden" data-landing-settings-field="id" value="${escapeHtml(item.id || '')}">
        <div class="landing-settings-grid compact">
          ${landingSettingsInput('Name', 'name', item.name)}
          ${landingSettingsInput('Rolle', 'role', item.role)}
          ${landingSettingsInput('Klasse', 'className', item.className)}
          ${landingSettingsInput('Status', 'status', item.status)}
          ${landingSettingsInput('Statusfarbe', 'statusColor', item.statusColor || '#2c8a3d')}
          ${landingSettingsIconInput('Badge/Icon oder Bild-URL', 'badgeIcon', item.badgeIcon || '*')}
          ${landingSettingsInput('Portrait-URL', 'portrait', item.portrait, 'url')}
        </div>
      </section>`;
  }
  if (kind === 'quest') {
    return `
      <section class="landing-settings-row" data-settings-kind="quest">
        <div class="landing-settings-row-head"><strong>Quest ${index + 1}</strong>${removeButton}</div>
        <input type="hidden" data-landing-settings-field="id" value="${escapeHtml(item.id || '')}">
        <div class="landing-settings-grid compact">
          ${landingSettingsInput('Titel', 'title', item.title)}
          ${landingSettingsInput('Art', 'kind', item.kind || 'Quest')}
          ${landingSettingsSelect('Status', 'status', item.status || 'active', [
            { value: 'active', label: 'Aktiv' },
            { value: 'done', label: 'Abgeschlossen' },
            { value: 'failed', label: 'Fehlgeschlagen' }
          ])}
          ${landingSettingsInput('Fortschritt', 'progress', item.progress ?? 0, 'number')}
          ${landingSettingsIconInput('Icon oder Bild-URL', 'image', item.image)}
          ${landingSettingsTextarea('Text', 'text', item.text)}
        </div>
      </section>`;
  }
  if (kind === 'note') {
    return `
      <section class="landing-settings-row" data-settings-kind="note">
        <div class="landing-settings-row-head"><strong>Notiz ${index + 1}</strong>${removeButton}</div>
        <input type="hidden" data-landing-settings-field="id" value="${escapeHtml(item.id || '')}">
        <input type="hidden" data-landing-settings-field="createdAt" value="${escapeHtml(item.createdAt || '')}">
        <div class="landing-settings-grid compact">
          ${landingSettingsInput('Titel', 'title', item.title)}
          ${landingSettingsIconInput('Icon oder Bild-URL', 'icon', item.icon)}
          ${landingSettingsInput('Verfasser', 'authorName', item.authorName)}
          ${landingSettingsInput('Verfasser-ID optional', 'authorId', item.authorId)}
          ${landingSettingsTextarea('Text', 'text', item.text)}
        </div>
      </section>`;
  }
  if (kind === 'event') {
    return `
      <section class="landing-settings-row" data-settings-kind="event">
        <div class="landing-settings-row-head"><strong>Ereignis ${index + 1}</strong>${removeButton}</div>
        <div class="landing-settings-grid compact">
          ${landingSettingsIconInput('Icon oder Bild-URL', 'icon', item.icon || '*')}
          ${landingSettingsInput('Titel', 'title', item.title)}
          ${landingSettingsInput('Datum (Freitext)', 'time', item.time)}
          ${buildAleriaDateField('Aleria-Datum', 'landing-settings-event-aleriaDate', item.aleriaDate)}
        </div>
      </section>`;
  }
  return `
    <section class="landing-settings-row" data-settings-kind="info">
      <div class="landing-settings-row-head"><strong>Information ${index + 1}</strong>${removeButton}</div>
      <div class="landing-settings-grid compact">
        ${landingSettingsIconInput('Icon oder Bild-URL', 'icon', item.icon || '*')}
        ${landingSettingsInput('Ueberschrift', 'title', item.title)}
        ${landingSettingsInput('Text', 'text', item.text)}
      </div>
    </section>`;
}

function buildLandingSettingsList(kind, items = [], buttonLabel = '+ Eintrag') {
  return `
    <div class="landing-settings-list" data-settings-list="${escapeHtml(kind)}">
      ${items.map((item, index) => buildLandingSettingsRow(kind, item, index)).join('')}
    </div>
    <button type="button" data-landing-editor-action="add-settings-row" data-settings-kind="${escapeHtml(kind)}">${escapeHtml(buttonLabel)}</button>`;
}

function buildLandingSettingsBody(data) {
  return `
    <div class="landing-settings-root" data-landing-base="${escapeHtml(JSON.stringify(data))}">
      <section class="landing-settings-section">
        <h4>Kopfbereich</h4>
        <div class="landing-settings-grid">
          ${landingSettingsInput('Titel', 'title', data.title)}
          ${landingSettingsInput('Untertitel', 'subtitle', data.subtitle)}
          ${landingSettingsIconInput('Bannerbild', 'bannerImage', data.bannerImage)}
        </div>
      </section>
      <section class="landing-settings-section">
        <h4>Ueberschriften</h4>
        <div class="landing-settings-grid">
          ${landingSettingsInput('Abenteurer', 'memberTitle', data.memberTitle)}
          ${landingSettingsInput('Quests', 'questTitle', data.questTitle)}
          ${landingSettingsInput('Notizen', 'notesTitle', data.notesTitle)}
          ${landingSettingsInput('Ereignisse', 'eventsTitle', data.eventsTitle)}
          ${landingSettingsInput('Karte', 'mapTitle', data.mapTitle)}
          ${landingSettingsInput('Informationen', 'infoTitle', data.infoTitle)}
        </div>
      </section>
      <section class="landing-settings-section">
        <h4>${data.group ? 'Mitglieder aus der Hierarchie' : 'Abenteurer'}</h4>
        ${data.group ? '<p>Namen, Rollen und Porträts werden aus der Hierarchie übernommen. Hier wählst du aus, wer aktuell mitkommt.</p><button type="button" data-landing-editor-action="open-group-editor" data-group-editor="select">+ Aus Hierarchie auswählen</button><button type="button" data-landing-editor-action="open-group-editor" data-group-editor="guest">+ Gast aus Charakterarchiv</button><button type="button" data-landing-editor-action="open-group-editor" data-group-editor="settings">Gruppenlage, Überschriften & Icons</button>' : buildLandingSettingsList('member', data.members, '+ Abenteurer')}
      </section>
      <section class="landing-settings-section">
        <h4>Quests</h4>
        ${buildLandingSettingsList('quest', data.quests, '+ Quest')}
      </section>
      <section class="landing-settings-section">
        <h4>Notizen</h4>
        ${buildLandingSettingsList('note', data.notes, '+ Notiz')}
      </section>
      <section class="landing-settings-section">
        <h4>Letzte Ereignisse</h4>
        ${buildLandingSettingsList('event', data.events, '+ Ereignis')}
      </section>
      <section class="landing-settings-section">
        <h4>Aktuelle Karte</h4>
        <div class="landing-settings-grid">
          <label>
            <span>Karte aus "Karten"</span>
            <select data-landing-settings-field="mapKartenId">
              ${buildLandingKartenOptions(data.mapKartenId)}
            </select>
          </label>
          ${landingSettingsSelect('Darstellung', 'mapDisplay', data.mapDisplay, [{ value: 'embed', label: 'Interaktive Karte (Iframe)' }, { value: 'image', label: 'Vorschaubild' }])}
          ${landingSettingsIconInput('Platzhalterbild (Fallback)', 'mapImage', data.mapImage)}
          ${landingSettingsInput('Klickziel / Modul-ID / Link (Fallback)', 'mapLink', data.mapLink)}
          ${landingSettingsInput('Buttontext', 'mapButtonLabel', data.mapButtonLabel)}
        </div>
      </section>
      <section class="landing-settings-section">
        <h4>Informationen</h4>
        ${buildLandingSettingsList('info', data.info, '+ Info')}
      </section>
    </div>`;
}

function closeLandingEditorDialog() {
  const overlay = document.getElementById('landing-editor-overlay');
  if (!overlay) return;
  if (typeof deactivateDialog === 'function') deactivateDialog(overlay.id);
  overlay.classList.remove('active');
  overlay.classList.remove('settings-mode');
  overlay.removeAttribute('data-kind');
  overlay.removeAttribute('data-page-index');
  overlay.removeAttribute('data-item-id');
  overlay.querySelector('.landing-editor-body').innerHTML = '';
  _landingSettingsIconPickerTarget = null;
}

function openLandingEditorDialog(element, kind, item = {}) {
  const overlay = ensureLandingEditorDialog();
  const body = overlay.querySelector('.landing-editor-body');
  const page = getLandingMutablePage(element);
  const data = sanitizeLandingData(page?.landing || {});
  overlay.dataset.kind = kind;
  overlay.dataset.pageIndex = String(getLandingPageIndexFromElement(element));
  overlay.dataset.itemId = item.id || '';
  overlay.querySelector('#landing-editor-title').textContent = kind === 'quest' ? 'Quest bearbeiten' : 'Notiz bearbeiten';
  const members = data.group ? AleriaLandingModel.resolveGroupRoster(currentEntry, data.group, globalThis.getAvailableCommentCharacters?.() || []) : data.members;
  const authorNames = members.map(member => member.name).filter(Boolean);
  const authorKnown = authorNames.includes(item.authorName || '');
  const authorOptions = [
    !authorKnown && item.authorName ? `<option value="${escapeHtml(item.authorName)}" selected>${escapeHtml(item.authorName)}</option>` : '',
    ...authorNames.map(name => `<option value="${escapeHtml(name)}"${name === item.authorName ? ' selected' : ''}>${escapeHtml(name)}</option>`)
  ].join('');
  body.innerHTML = kind === 'quest' ? `
    <label><span>Titel</span><input data-landing-editor-field="title" value="${escapeHtml(item.title || '')}"></label>
    ${landingSettingsIconInput('Icon oder Bild-URL', 'image', item.image, 'editor')}
    <label><span>Art</span><input data-landing-editor-field="kind" value="${escapeHtml(item.kind || 'Quest')}"></label>
    <label><span>Status</span><select data-landing-editor-field="status">
      <option value="active"${item.status === 'active' ? ' selected' : ''}>Aktiv</option>
      <option value="done"${item.status === 'done' ? ' selected' : ''}>Abgeschlossen</option>
      <option value="failed"${item.status === 'failed' ? ' selected' : ''}>Fehlgeschlagen</option>
    </select></label>
    <label><span>Fortschritt</span><input type="number" min="0" max="100" data-landing-editor-field="progress" value="${escapeHtml(item.progress ?? 0)}"></label>
    <label><span>Zuständiges Mitglied</span><select data-landing-editor-field="ownerMemberId"><option value="">Nicht zugewiesen</option>${members.map(member => `<option value="${escapeHtml(member.id)}"${member.id === item.ownerMemberId ? ' selected' : ''}>${escapeHtml(member.name)}</option>`).join('')}</select></label>
    <label><span>Fällig (Aleria-Datum / Ereignis)</span><input data-landing-editor-field="dueDate" value="${escapeHtml(item.dueDate || '')}"></label>
    <label><span>Verknüpftes Questmodul</span><select data-landing-editor-field="moduleId"><option value="">Keine Verknüpfung</option>${(globalThis.getAllSections?.() || []).flatMap(section => section.entries || []).filter(entry => entry.pages?.some(page => page.questFilePage)).map(entry => `<option value="${escapeHtml(entry.id)}"${entry.id === item.moduleId ? ' selected' : ''}>${escapeHtml(entry.title)}</option>`).join('')}</select></label>
    <label class="wide"><span>Text</span><textarea data-landing-editor-field="text">${escapeHtml(item.text || '')}</textarea></label>`
    : `
    <label><span>Titel</span><input data-landing-editor-field="title" value="${escapeHtml(item.title || '')}"></label>
    ${landingSettingsIconInput('Icon oder Bild-URL', 'icon', item.icon, 'editor')}
    <label><span>Verfasser</span><select data-landing-editor-field="authorName">${authorOptions || `<option value="${escapeHtml(item.authorName || 'Erzaehler')}" selected>${escapeHtml(item.authorName || 'Erzaehler')}</option>`}</select></label>
    <label class="wide"><span>Text</span><textarea data-landing-editor-field="text">${escapeHtml(item.text || '')}</textarea></label>`;
  overlay.classList.add('active');
  if (typeof activateDialog === 'function') activateDialog(overlay.id, { initialFocus: '.landing-editor-body input, .landing-editor-body select' });
  body.querySelector('input, textarea, select')?.focus();
}

function openLandingSettingsDialog(element) {
  const page = getLandingMutablePage(element);
  const data = sanitizeLandingData(page?.landing || {});
  const overlay = ensureLandingEditorDialog();
  const body = overlay.querySelector('.landing-editor-body');
  overlay.dataset.kind = 'settings';
  overlay.dataset.pageIndex = String(getLandingPageIndexFromElement(element));
  overlay.removeAttribute('data-item-id');
  overlay.querySelector('#landing-editor-title').textContent = 'Landing Page bearbeiten';
  body.innerHTML = buildLandingSettingsBody(data);
  overlay.classList.add('active', 'settings-mode');
  if (typeof activateDialog === 'function') activateDialog(overlay.id, { initialFocus: '.landing-editor-body input, .landing-editor-body select' });
  body.querySelector('input, textarea, select')?.focus();
}

function getLandingEditorField(name) {
  return document.querySelector(`#landing-editor-overlay [data-landing-editor-field="${name}"]`)?.value || '';
}

function getLandingSettingsValue(scope, field) {
  return scope.querySelector(`[data-landing-settings-field="${field}"]`)?.value || '';
}

function collectLandingSettingsRows(root, kind, mapper) {
  return Array.from(root.querySelectorAll(`[data-settings-kind="${kind}"]`)).map(mapper);
}

function collectLandingSettingsData(root) {
  let base = {};
  try { base = JSON.parse(root.dataset?.landingBase || '{}'); } catch { /* Legacy settings have no preserved state. */ }
  return sanitizeLandingData({
    ...base,
    title: getLandingSettingsValue(root, 'title'),
    subtitle: getLandingSettingsValue(root, 'subtitle'),
    bannerImage: getLandingSettingsValue(root, 'bannerImage'),
    memberTitle: getLandingSettingsValue(root, 'memberTitle'),
    questTitle: getLandingSettingsValue(root, 'questTitle'),
    notesTitle: getLandingSettingsValue(root, 'notesTitle'),
    eventsTitle: getLandingSettingsValue(root, 'eventsTitle'),
    mapTitle: getLandingSettingsValue(root, 'mapTitle'),
    mapKartenId: getLandingSettingsValue(root, 'mapKartenId'),
    mapDisplay: getLandingSettingsValue(root, 'mapDisplay'),
    mapImage: getLandingSettingsValue(root, 'mapImage'),
    mapLink: getLandingSettingsValue(root, 'mapLink'),
    mapButtonLabel: getLandingSettingsValue(root, 'mapButtonLabel'),
    infoTitle: getLandingSettingsValue(root, 'infoTitle'),
    members: base.group ? base.members : collectLandingSettingsRows(root, 'member', row => ({
      ...(base.members || []).find(item => item.id === getLandingSettingsValue(row, 'id')),
      id: getLandingSettingsValue(row, 'id'),
      name: getLandingSettingsValue(row, 'name'),
      role: getLandingSettingsValue(row, 'role'),
      className: getLandingSettingsValue(row, 'className'),
      status: getLandingSettingsValue(row, 'status'),
      statusColor: getLandingSettingsValue(row, 'statusColor'),
      badgeIcon: getLandingSettingsValue(row, 'badgeIcon'),
      portrait: getLandingSettingsValue(row, 'portrait')
    })),
    quests: collectLandingSettingsRows(root, 'quest', row => ({
      ...(base.quests || []).find(item => item.id === getLandingSettingsValue(row, 'id')),
      id: getLandingSettingsValue(row, 'id'),
      title: getLandingSettingsValue(row, 'title'),
      kind: getLandingSettingsValue(row, 'kind'),
      status: getLandingSettingsValue(row, 'status'),
      progress: getLandingSettingsValue(row, 'progress'),
      image: getLandingSettingsValue(row, 'image'),
      text: getLandingSettingsValue(row, 'text')
    })),
    notes: collectLandingSettingsRows(root, 'note', row => ({
      id: getLandingSettingsValue(row, 'id'),
      title: getLandingSettingsValue(row, 'title'),
      icon: getLandingSettingsValue(row, 'icon'),
      authorName: getLandingSettingsValue(row, 'authorName'),
      authorId: getLandingSettingsValue(row, 'authorId'),
      createdAt: getLandingSettingsValue(row, 'createdAt'),
      text: getLandingSettingsValue(row, 'text')
    })),
    events: collectLandingSettingsRows(root, 'event', row => ({
      icon: getLandingSettingsValue(row, 'icon'),
      title: getLandingSettingsValue(row, 'title'),
      time: getLandingSettingsValue(row, 'time'),
      aleriaDate: collectAleriaDateFromBlock(row, 'landing-settings-event-aleriaDate')
    })),
    info: collectLandingSettingsRows(root, 'info', row => ({
      icon: getLandingSettingsValue(row, 'icon'),
      title: getLandingSettingsValue(row, 'title'),
      text: getLandingSettingsValue(row, 'text')
    }))
  });
}

function addLandingSettingsRow(button) {
  const kind = button.dataset.settingsKind || '';
  const list = document.querySelector(`#landing-editor-overlay [data-settings-list="${kind}"]`);
  if (!list) return;
  const index = list.querySelectorAll(`[data-settings-kind="${kind}"]`).length;
  const defaults = {
    member: { name: 'Neuer Abenteurer', role: '', className: '', status: 'Bereit', statusColor: '#2c8a3d', badgeIcon: '*' },
    quest: { title: 'Neue Quest', kind: 'Quest', status: 'active', progress: 0 },
    note: { title: 'Neue Notiz', icon: '', authorName: 'Erzaehler', createdAt: new Date().toISOString() },
    event: { icon: '*', title: 'Neues Ereignis', time: '' },
    info: { icon: '*', title: 'Neue Information', text: '' }
  };
  list.insertAdjacentHTML('beforeend', buildLandingSettingsRow(kind, defaults[kind] || {}, index));
}

function removeLandingSettingsRow(button) {
  button.closest('.landing-settings-row')?.remove();
}

function saveLandingSettingsDialog(overlay) {
  const pageIndex = Number(overlay.dataset.pageIndex || currentPage || 0);
  const landingPage = document.querySelector(`.landing-page[data-landing-page-index="${pageIndex}"]`);
  const root = overlay.querySelector('.landing-settings-root');
  if (!landingPage || !root) return;
  const next = collectLandingSettingsData(root);
  updateLandingPage(landingPage, data => {
    Object.keys(data).forEach(key => { delete data[key]; });
    Object.assign(data, next);
  });
  closeLandingEditorDialog();
}

function openGroupEditorFromLandingSettings(button) {
  const overlay = button.closest('#landing-editor-overlay');
  const pageIndex = Number(overlay?.dataset.pageIndex || currentPage || 0);
  const page = document.querySelector(`.group-landing[data-landing-page-index="${pageIndex}"]`);
  if (!page) return;
  // Keep edits already made in this dialog before changing editor views.
  const next = collectLandingSettingsData(overlay.querySelector('.landing-settings-root'));
  updateLandingPage(page, data => Object.assign(data, next));
  closeLandingEditorDialog();
  const current = document.querySelector(`.group-landing[data-landing-page-index="${pageIndex}"]`);
  globalThis.AleriaGroupLanding?.edit(current, button.dataset.groupEditor);
}

function saveLandingEditorDialog() {
  const overlay = document.getElementById('landing-editor-overlay');
  if (!overlay?.classList.contains('active')) return;
  const kind = overlay.dataset.kind;
  if (kind === 'settings') {
    saveLandingSettingsDialog(overlay);
    return;
  }
  const pageIndex = Number(overlay.dataset.pageIndex || currentPage || 0);
  const itemId = overlay.dataset.itemId || '';
  const landingPage = document.querySelector(`.landing-page[data-landing-page-index="${pageIndex}"]`);
  if (!landingPage) return;
  updateLandingPage(landingPage, data => {
    if (kind === 'quest') {
      const raw = {
        ...data.quests.find(item => item.id === itemId),
        id: itemId || makeLandingItemId('quest'),
        title: getLandingEditorField('title'),
        image: getLandingEditorField('image'),
        kind: getLandingEditorField('kind'),
        status: getLandingEditorField('status'),
        progress: getLandingEditorField('progress'),
        text: getLandingEditorField('text'),
        ownerMemberId: getLandingEditorField('ownerMemberId'),
        dueDate: getLandingEditorField('dueDate'),
        moduleId: getLandingEditorField('moduleId')
      };
      const clean = sanitizeLandingQuests([raw])[0];
      if (!clean) return;
      const index = data.quests.findIndex(item => item.id === itemId);
      if (index >= 0) data.quests[index] = clean;
      else data.quests.push(clean);
      return;
    }
    const raw = {
      ...data.notes.find(item => item.id === itemId),
      id: itemId || makeLandingItemId('note'),
      title: getLandingEditorField('title'),
      icon: getLandingEditorField('icon'),
      authorName: getLandingEditorField('authorName'),
      text: getLandingEditorField('text'),
      createdAt: itemId
        ? data.notes.find(item => item.id === itemId)?.createdAt
        : new Date().toISOString()
    };
    const clean = sanitizeLandingNotes([raw])[0];
    if (!clean) return;
    const index = data.notes.findIndex(item => item.id === itemId);
    if (index >= 0) data.notes[index] = clean;
    else data.notes.unshift(clean);
  });
  closeLandingEditorDialog();
}

function openLandingQuestDialog(element, questId = '') {
  const page = getLandingMutablePage(element);
  const data = sanitizeLandingData(page?.landing || {});
  const quest = data.quests.find(item => item.id === questId) || { id: '', title: '', text: '', image: '', kind: 'Quest', status: 'active', progress: 0 };
  openLandingEditorDialog(element, 'quest', quest);
}

function openLandingNoteDialog(element, noteId = '') {
  const page = getLandingMutablePage(element);
  const data = sanitizeLandingData(page?.landing || {});
  const note = data.notes.find(item => item.id === noteId) || { id: '', title: '', text: '', icon: '', authorName: data.members[0]?.name || '', createdAt: new Date().toISOString() };
  openLandingEditorDialog(element, 'note', note);
}

document.addEventListener('click', event => {
  const withinItemMenu = event.target?.closest?.('.landing-item-menu-wrap');
  document.querySelectorAll('.landing-item-menu-wrap.open').forEach(wrap => {
    if (wrap !== withinItemMenu) {
      wrap.classList.remove('open');
      wrap.querySelector('.landing-menu-toggle')?.setAttribute('aria-expanded', 'false');
    }
  });

  const editorAction = event.target?.closest?.('[data-landing-editor-action]');
  if (editorAction) {
    event.preventDefault();
    const action = editorAction.dataset.landingEditorAction;
    if (action === 'save') saveLandingEditorDialog();
    else if (action === 'add-settings-row') addLandingSettingsRow(editorAction);
    else if (action === 'remove-settings-row') removeLandingSettingsRow(editorAction);
    else if (action === 'pick-icon') openLandingSettingsIconPicker(editorAction);
    else if (action === 'open-group-editor') openGroupEditorFromLandingSettings(editorAction);
    else closeLandingEditorDialog();
    return;
  }

  const trigger = event.target?.closest?.('[data-landing-action]');
  if (!trigger) return;
  const page = getLandingPageElement(trigger);
  if (!page) return;
  const action = trigger.dataset.landingAction;
  event.preventDefault();

  if (action === 'filter-quests') {
    const filter = trigger.dataset.questFilter || 'all';
    page.querySelectorAll('[data-landing-action="filter-quests"]').forEach(button => {
      const active = button === trigger;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    page.querySelectorAll('.landing-quest-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.questStatus !== filter;
    });
    return;
  }

  if (action === 'toggle-quest-menu' || action === 'toggle-note-menu') {
    const wrap = trigger.closest('.landing-item-menu-wrap');
    if (!wrap) return;
    const open = !wrap.classList.contains('open');
    document.querySelectorAll('.landing-item-menu-wrap.open').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.landing-menu-toggle')?.setAttribute('aria-expanded', 'false');
    });
    wrap.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', String(open));
    return;
  }

  if (action === 'edit-settings') {
    openLandingSettingsDialog(page);
    return;
  }
  if (action === 'open-quest-module') {
    const target = (globalThis.getAllSections?.() || []).flatMap(section => section.entries || []).find(entry => entry.id === trigger.dataset.moduleId);
    if (target) openModal(target);
    return;
  }
  if (action === 'edit-quest') {
    openLandingQuestDialog(page, trigger.dataset.questId || '');
    return;
  }
  if (action === 'complete-quest') {
    updateLandingPage(page, data => {
      const quest = data.quests.find(item => item.id === trigger.dataset.questId);
      if (quest) {
        quest.status = quest.status === 'done' ? 'active' : 'done';
        if (quest.status === 'done') quest.progress = 100;
      }
    });
    return;
  }
  if (action === 'delete-quest') {
    if (!confirm('Quest wirklich loeschen?')) return;
    updateLandingPage(page, data => {
      data.quests = data.quests.filter(item => item.id !== trigger.dataset.questId);
    });
    return;
  }
  if (action === 'edit-note') {
    openLandingNoteDialog(page, trigger.dataset.noteId || '');
    return;
  }
  if (action === 'delete-note') {
    if (!confirm('Notiz wirklich loeschen?')) return;
    updateLandingPage(page, data => {
      data.notes = data.notes.filter(item => item.id !== trigger.dataset.noteId);
    });
    return;
  }
  if (action === 'open-map-link') {
    const href = sanitizeHref(trigger.dataset.mapLink || '');
    if (href) window.open(href, /^https?:\/\//i.test(href) ? '_blank' : '_self', 'noopener');
    return;
  }
  if (action === 'open-karten-map') {
    const href = sanitizeHref(trigger.dataset.mapLink || '');
    if (href) window.open(href, '_blank', 'noopener');
  }
});

function buildLandingPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeLandingData(page.landing || {});
  if (data.group && globalThis.AleriaGroupLanding) return `${nav}${globalThis.AleriaGroupLanding.renderBody(data, entry, pageIndex)}`;
  const banner = sanitizeImageSrc(data.bannerImage || entry?.symbol || '');
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';
  return `
    ${nav}
    <div class="landing-page" data-landing-page-index="${pageIndex}">
      <header class="landing-hero">
        ${banner ? `<img class="landing-banner" src="${banner}" alt="" loading="lazy" decoding="async">` : `<div class="landing-banner landing-placeholder">*</div>`}
        <div>
          <h2>${escapeHtml(data.title || entry.title)}</h2>
          <p>${escapeHtml(data.subtitle || entry.subtitle)}</p>
        </div>
      </header>
      <div class="landing-grid">
        ${buildLandingMembers(data)}
        ${buildLandingQuests(data)}
        ${buildLandingNotes(data)}
        ${buildLandingEvents(data)}
        ${buildLandingMap(data)}
        ${buildLandingInfo(data)}
      </div>
      ${buildLandingConfigureButton()}
    </div>
    ${sym}`;
}
