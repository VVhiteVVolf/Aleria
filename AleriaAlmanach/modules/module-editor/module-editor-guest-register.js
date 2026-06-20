function makeGuestRegisterId(prefix = 'guest', index = 0) {
  return `${prefix}-${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 6)}`;
}

function sanitizeGuestRegisterRows(rows, fallback = [], maxRows = 8) {
  const source = Array.isArray(rows) ? rows : fallback;
  return source
    .map(row => ({
      label: String(row?.label || '').trim(),
      value: String(row?.value || '').trim()
    }))
    .filter(row => row.label || row.value)
    .slice(0, maxRows);
}

function clampGuestRegisterPortraitSize(value) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : 96;
  return Math.max(72, Math.min(180, Math.round(safe)));
}

function sanitizeGuestRegisterGuest(guest = {}, index = 0) {
  return {
    id: String(guest?.id || '').trim() || makeGuestRegisterId('guest', index),
    portrait: String(guest?.portrait || '').trim(),
    portraitFit: String(guest?.portraitFit || 'cover').trim() === 'contain' ? 'contain' : 'cover',
    portraitPosition: ['top', 'center', 'bottom', 'left', 'right'].includes(String(guest?.portraitPosition || '').trim())
      ? String(guest.portraitPosition).trim()
      : 'top',
    name: String(guest?.name || `Gast ${index + 1}`).trim(),
    role: String(guest?.role || 'Reisender Gast').trim(),
    status: String(guest?.status || 'Einquartiert').trim(),
    descriptionTitle: String(guest?.descriptionTitle || 'Aufenthalt').trim(),
    description: String(guest?.description || 'Beschreibe Herkunft, Auftreten, Wuensche, Verhalten und relevante Beobachtungen.').trim(),
    sideTitle: String(guest?.sideTitle || 'Unterkunft').trim(),
    infoRows: sanitizeGuestRegisterRows(guest?.infoRows, [
      { label: 'Herkunft', value: 'Noch festlegen' },
      { label: 'Stand', value: 'Noch festlegen' },
      { label: 'Begleitung', value: 'Noch festlegen' },
      { label: 'Ankunft', value: 'Noch festlegen' },
      { label: 'Status', value: 'Einquartiert' },
      { label: 'Zahlung', value: 'Offen' }
    ], 6),
    sideRows: sanitizeGuestRegisterRows(guest?.sideRows, [
      { label: 'Zimmer', value: 'Noch festlegen' },
      { label: 'Etage', value: 'Noch festlegen' },
      { label: 'Dauer', value: 'Noch festlegen' },
      { label: 'Wuensche', value: 'Keine' }
    ], 10)
  };
}

function sanitizeGuestRegisterSections(sections) {
  const source = Array.isArray(sections)
    ? sections
    : [
        {
          title: 'Personen 1-4',
          subtitle: 'Aktuell einquartierte Gäste',
          guests: [
            { name: 'Neuer Gast', role: 'Reisender Gast' },
            { name: 'Weitere Person', role: 'Begleitung oder Besucher' }
          ]
        },
        {
          title: 'Personen 5-8',
          subtitle: 'Weitere Gäste oder spätere Anreisen',
          guests: []
        }
      ];

  return source
    .map((section, sectionIndex) => ({
      id: String(section?.id || '').trim() || makeGuestRegisterId('section', sectionIndex),
      title: String(section?.title || `Personen ${sectionIndex + 1}`).trim(),
      subtitle: String(section?.subtitle || '').trim(),
      guests: (Array.isArray(section?.guests) ? section.guests : [])
        .map((guest, guestIndex) => sanitizeGuestRegisterGuest(guest, guestIndex))
        .slice(0, 80)
    }))
    .filter(section => section.title || section.subtitle || section.guests.length)
    .slice(0, 30);
}

function sanitizeGuestRegisterData(data = {}) {
  return {
    title: String(data.title || 'Gästeverzeichnis').trim(),
    subtitle: String(data.subtitle || 'Gäste, Zimmer und Aufenthalte dokumentieren').trim(),
    location: String(data.location || 'Taverne / Burg / Etablissement').trim(),
    portraitSize: clampGuestRegisterPortraitSize(data.portraitSize),
    note: String(data.note || 'Interne Notiz: Aufenthalte, Zahlung und Sonderwuensche regelmaessig pruefen.').trim(),
    sections: sanitizeGuestRegisterSections(data.sections)
  };
}

function createDefaultGuestRegisterPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - Gästeverzeichnis`,
    guestRegisterPage: true,
    guestRegister: sanitizeGuestRegisterData({}),
    stats: [],
    commentDivider: false,
    commentSequence: []
  };
}

function buildGuestRegisterInput(label, className, value = '', type = 'text') {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <input class="${escapeHtml(className)}" type="${escapeHtml(type)}" value="${escapeHtml(value || '')}">
    </label>`;
}

function buildGuestRegisterTextarea(label, className, value = '') {
  return `
    <label class="guest-register-editor-wide">
      <span>${escapeHtml(label)}</span>
      <textarea class="${escapeHtml(className)}">${escapeHtml(value || '')}</textarea>
    </label>`;
}

function buildGuestRegisterImageControls(guest) {
  const fit = guest.portraitFit || 'cover';
  const position = guest.portraitPosition || 'top';
  return `
    <label>
      <span>Portrait-Füllung</span>
      <select class="me-gr-guest-portrait-fit">
        <option value="cover"${fit === 'cover' ? ' selected' : ''}>Fuellen / croppen</option>
        <option value="contain"${fit === 'contain' ? ' selected' : ''}>Ganzbild</option>
      </select>
    </label>
    <label>
      <span>Portrait-Ausschnitt</span>
      <select class="me-gr-guest-portrait-position">
        ${['top', 'center', 'bottom', 'left', 'right'].map(option => `<option value="${option}"${position === option ? ' selected' : ''}>${option}</option>`).join('')}
      </select>
    </label>`;
}

function buildGuestRegisterRowEditor(rows, kind, maxRows) {
  const safeRows = sanitizeGuestRegisterRows(rows, [], maxRows);
  if (!safeRows.length) return '<div class="inline-placeholder-note">Noch keine Zeilen vorhanden.</div>';
  return safeRows.map(row => `
    <div class="guest-register-editor-row" data-gr-row-kind="${escapeHtml(kind)}">
      ${buildGuestRegisterInput('Reiter', `me-gr-${kind}-label`, row.label)}
      ${buildGuestRegisterInput('Wert', `me-gr-${kind}-value`, row.value)}
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-guest-register-row">Löschen</button>
    </div>`).join('');
}

function buildGuestRegisterGuestEditor(guest, guestIndex) {
  const safeGuest = sanitizeGuestRegisterGuest(guest, guestIndex);
  return `
    <section class="guest-register-editor-card" data-gr-guest-row>
      <input type="hidden" class="me-gr-guest-id" value="${escapeHtml(safeGuest.id)}">
      <div class="guest-register-editor-card-head">
        <strong>Gast ${guestIndex + 1}</strong>
        <div>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-guest-register-guest" data-gr-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-guest-register-guest" data-gr-direction="1">Runter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-guest-register-guest">Löschen</button>
        </div>
      </div>
      <div class="guest-register-editor-grid">
        ${buildGuestRegisterInput('Portrait', 'me-gr-guest-portrait', safeGuest.portrait, 'url')}
        ${buildGuestRegisterImageControls(safeGuest)}
        ${buildGuestRegisterInput('Name', 'me-gr-guest-name', safeGuest.name)}
        ${buildGuestRegisterInput('Rolle / Art', 'me-gr-guest-role', safeGuest.role)}
        ${buildGuestRegisterInput('Status', 'me-gr-guest-status', safeGuest.status)}
        ${buildGuestRegisterInput('Text-Ueberschrift', 'me-gr-guest-description-title', safeGuest.descriptionTitle)}
        ${buildGuestRegisterTextarea('Grosser Textbereich', 'me-gr-guest-description', safeGuest.description)}
        ${buildGuestRegisterInput('Rechte Box Ueberschrift', 'me-gr-guest-side-title', safeGuest.sideTitle)}
      </div>
      <div class="guest-register-editor-subgrid">
        <div>
          <div class="guest-register-editor-linehead">
            <h5>Infotabelle links (max. 6)</h5>
            <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-guest-register-row" data-gr-row-kind="info">+ Zeile</button>
          </div>
          <div class="guest-register-editor-list">${buildGuestRegisterRowEditor(safeGuest.infoRows, 'info', 6)}</div>
        </div>
        <div>
          <div class="guest-register-editor-linehead">
            <h5>Einquartierung rechts</h5>
            <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-guest-register-row" data-gr-row-kind="side">+ Zeile</button>
          </div>
          <div class="guest-register-editor-list">${buildGuestRegisterRowEditor(safeGuest.sideRows, 'side', 10)}</div>
        </div>
      </div>
    </section>`;
}

function buildGuestRegisterSectionEditor(section, sectionIndex) {
  const safeSection = sanitizeGuestRegisterSections([section])[0] || { id: '', title: '', subtitle: '', guests: [] };
  return `
    <section class="guest-register-editor-section" data-gr-section-row>
      <input type="hidden" class="me-gr-section-id" value="${escapeHtml(safeSection.id)}">
      <div class="guest-register-editor-section-head">
        <strong>Abschnitt ${sectionIndex + 1}</strong>
        <div>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-guest-register-section" data-gr-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-guest-register-section" data-gr-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-guest-register-section">+ Abschnitt darunter</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-guest-register-guest">+ Gast</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-guest-register-section">Löschen</button>
        </div>
      </div>
      <div class="guest-register-editor-grid">
        ${buildGuestRegisterInput('Ueberschrift / Trenner', 'me-gr-section-title', safeSection.title)}
        ${buildGuestRegisterInput('Unterzeile', 'me-gr-section-subtitle', safeSection.subtitle)}
      </div>
      <div class="guest-register-editor-guests">
        ${safeSection.guests.length
          ? safeSection.guests.map((guest, guestIndex) => buildGuestRegisterGuestEditor(guest, guestIndex)).join('')
          : '<div class="inline-placeholder-note">Noch keine Gäste in diesem Abschnitt.</div>'}
      </div>
    </section>`;
}

function buildGuestRegisterModuleEditorFields(page) {
  const data = sanitizeGuestRegisterData(page?.guestRegister || {});
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'guest-register' ? ' visible' : ''}" data-page-type="guest-register">
      <div class="guest-register-editor">
        <div class="module-editor-grid">
          <div class="module-editor-field">
            <label>Titel</label>
            <input class="me-gr-title" type="text" value="${escapeHtml(data.title)}">
          </div>
          <div class="module-editor-field">
            <label>Untertitel</label>
            <input class="me-gr-subtitle" type="text" value="${escapeHtml(data.subtitle)}">
          </div>
          <div class="module-editor-field">
            <label>Ort / Etablissement</label>
            <input class="me-gr-location" type="text" value="${escapeHtml(data.location)}">
          </div>
          <div class="module-editor-field">
            <label>Portraitgröße <span>${escapeHtml(data.portraitSize)} px</span></label>
            <input class="me-gr-portrait-size module-size-range" type="range" min="72" max="180" step="2" value="${escapeHtml(data.portraitSize)}">
          </div>
          <div class="module-editor-field wide">
            <label>Interne Notiz / Fußzeile</label>
            <textarea class="me-gr-note">${escapeHtml(data.note)}</textarea>
          </div>
        </div>
        <div class="guest-register-editor-main-head">
          <h4>Abschnitte & Gäste</h4>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-guest-register-section">+ Abschnitt</button>
        </div>
        <div class="guest-register-editor-sections">
          ${data.sections.map((section, index) => buildGuestRegisterSectionEditor(section, index)).join('')}
        </div>
        <div class="guest-register-editor-bottom-action">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-guest-register-section">+ Weiteren Abschnitt hinzufügen</button>
        </div>
      </div>
    </div>`;
}

function collectGuestRegisterRows(scope, kind) {
  return Array.from(scope.querySelectorAll(`[data-gr-row-kind="${kind}"]`)).map(row => ({
    label: getTrimmedFormValue(row, `.me-gr-${kind}-label`),
    value: getTrimmedFormValue(row, `.me-gr-${kind}-value`)
  }));
}

function collectGuestRegisterGuest(row) {
  return {
    id: getTrimmedFormValue(row, '.me-gr-guest-id'),
    portrait: getTrimmedFormValue(row, '.me-gr-guest-portrait'),
    portraitFit: getTrimmedFormValue(row, '.me-gr-guest-portrait-fit'),
    portraitPosition: getTrimmedFormValue(row, '.me-gr-guest-portrait-position'),
    name: getTrimmedFormValue(row, '.me-gr-guest-name'),
    role: getTrimmedFormValue(row, '.me-gr-guest-role'),
    status: getTrimmedFormValue(row, '.me-gr-guest-status'),
    descriptionTitle: getTrimmedFormValue(row, '.me-gr-guest-description-title'),
    description: getTrimmedFormValue(row, '.me-gr-guest-description'),
    sideTitle: getTrimmedFormValue(row, '.me-gr-guest-side-title'),
    infoRows: collectGuestRegisterRows(row, 'info'),
    sideRows: collectGuestRegisterRows(row, 'side')
  };
}

function collectGuestRegisterSection(row) {
  return {
    id: getTrimmedFormValue(row, '.me-gr-section-id'),
    title: getTrimmedFormValue(row, '.me-gr-section-title'),
    subtitle: getTrimmedFormValue(row, '.me-gr-section-subtitle'),
    guests: Array.from(row.querySelectorAll(':scope > .guest-register-editor-guests > [data-gr-guest-row]')).map(collectGuestRegisterGuest)
  };
}

function collectGuestRegisterModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="guest-register"]') || card;
  page.guestRegisterPage = true;
  page.guestRegister = sanitizeGuestRegisterData({
    title: getTrimmedFormValue(block, '.me-gr-title'),
    subtitle: getTrimmedFormValue(block, '.me-gr-subtitle'),
    location: getTrimmedFormValue(block, '.me-gr-location'),
    portraitSize: getTrimmedFormValue(block, '.me-gr-portrait-size'),
    note: getTrimmedFormValue(block, '.me-gr-note'),
    sections: Array.from(block.querySelectorAll(':scope .guest-register-editor-sections > [data-gr-section-row]')).map(collectGuestRegisterSection)
  });
  return page;
}

function rerenderGuestRegisterEditor(button, updater) {
  const card = button.closest('.module-page-card');
  if (!card) return;
  const page = collectModulePageFromCard(card);
  const data = sanitizeGuestRegisterData(page.guestRegister || {});
  updater(data);
  page.guestRegisterPage = true;
  page.guestRegister = sanitizeGuestRegisterData(data);
  card.outerHTML = buildModulePageEditorMarkup(page, Number(card.dataset.pageIndex || 0));
  if (typeof syncModuleJsonPreview === 'function') syncModuleJsonPreview();
}

function getGuestRegisterRowIndex(row, selector) {
  return Array.from(row?.parentElement?.querySelectorAll(selector) || []).indexOf(row);
}

function addGuestRegisterSection(button) {
  const sectionRow = button.closest('[data-gr-section-row]');
  const sectionIndex = getGuestRegisterRowIndex(sectionRow, '[data-gr-section-row]');
  rerenderGuestRegisterEditor(button, data => {
    const index = data.sections.length + 1;
    const section = { title: `Personen ${index}`, subtitle: 'Neuer Abschnitt', guests: [] };
    if (sectionIndex >= 0) data.sections.splice(sectionIndex + 1, 0, section);
    else data.sections.push(section);
  });
}

function removeGuestRegisterSection(button) {
  const row = button.closest('[data-gr-section-row]');
  const index = getGuestRegisterRowIndex(row, '[data-gr-section-row]');
  rerenderGuestRegisterEditor(button, data => {
    if (index >= 0) data.sections.splice(index, 1);
  });
}

function moveGuestRegisterSection(button) {
  const row = button.closest('[data-gr-section-row]');
  const index = getGuestRegisterRowIndex(row, '[data-gr-section-row]');
  const direction = Number(button.dataset.grDirection || 0);
  rerenderGuestRegisterEditor(button, data => {
    const target = index + direction;
    if (index < 0 || target < 0 || target >= data.sections.length) return;
    const [section] = data.sections.splice(index, 1);
    data.sections.splice(target, 0, section);
  });
}

function addGuestRegisterGuest(button) {
  const sectionRow = button.closest('[data-gr-section-row]');
  const sectionIndex = getGuestRegisterRowIndex(sectionRow, '[data-gr-section-row]');
  rerenderGuestRegisterEditor(button, data => {
    const section = data.sections[sectionIndex];
    if (!section) return;
    section.guests.push({ name: 'Neuer Gast', role: 'Reisender Gast' });
  });
}

function removeGuestRegisterGuest(button) {
  const sectionRow = button.closest('[data-gr-section-row]');
  const guestRow = button.closest('[data-gr-guest-row]');
  const sectionIndex = getGuestRegisterRowIndex(sectionRow, '[data-gr-section-row]');
  const guestIndex = getGuestRegisterRowIndex(guestRow, '[data-gr-guest-row]');
  rerenderGuestRegisterEditor(button, data => {
    if (sectionIndex >= 0 && guestIndex >= 0) data.sections[sectionIndex]?.guests?.splice(guestIndex, 1);
  });
}

function moveGuestRegisterGuest(button) {
  const sectionRow = button.closest('[data-gr-section-row]');
  const guestRow = button.closest('[data-gr-guest-row]');
  const sectionIndex = getGuestRegisterRowIndex(sectionRow, '[data-gr-section-row]');
  const guestIndex = getGuestRegisterRowIndex(guestRow, '[data-gr-guest-row]');
  const direction = Number(button.dataset.grDirection || 0);
  rerenderGuestRegisterEditor(button, data => {
    const guests = data.sections[sectionIndex]?.guests;
    const target = guestIndex + direction;
    if (!guests || guestIndex < 0 || target < 0 || target >= guests.length) return;
    const [guest] = guests.splice(guestIndex, 1);
    guests.splice(target, 0, guest);
  });
}

function addGuestRegisterRow(button) {
  const guestRow = button.closest('[data-gr-guest-row]');
  const sectionRow = button.closest('[data-gr-section-row]');
  const sectionIndex = getGuestRegisterRowIndex(sectionRow, '[data-gr-section-row]');
  const guestIndex = getGuestRegisterRowIndex(guestRow, '[data-gr-guest-row]');
  const kind = button.dataset.grRowKind || 'info';
  rerenderGuestRegisterEditor(button, data => {
    const guest = data.sections[sectionIndex]?.guests?.[guestIndex];
    if (!guest) return;
    if (kind === 'info' && guest.infoRows.length < 6) guest.infoRows.push({ label: 'Neue Angabe', value: 'Wert' });
    if (kind === 'side') guest.sideRows.push({ label: 'Neue Angabe', value: 'Wert' });
  });
}

function removeGuestRegisterRow(button) {
  const row = button.closest('[data-gr-row-kind]');
  const guestRow = button.closest('[data-gr-guest-row]');
  const sectionRow = button.closest('[data-gr-section-row]');
  const kind = row?.dataset.grRowKind || 'info';
  const sectionIndex = getGuestRegisterRowIndex(sectionRow, '[data-gr-section-row]');
  const guestIndex = getGuestRegisterRowIndex(guestRow, '[data-gr-guest-row]');
  const rowIndex = getGuestRegisterRowIndex(row, `[data-gr-row-kind="${kind}"]`);
  rerenderGuestRegisterEditor(button, data => {
    const guest = data.sections[sectionIndex]?.guests?.[guestIndex];
    if (!guest || rowIndex < 0) return;
    if (kind === 'info') guest.infoRows.splice(rowIndex, 1);
    if (kind === 'side') guest.sideRows.splice(rowIndex, 1);
  });
}
