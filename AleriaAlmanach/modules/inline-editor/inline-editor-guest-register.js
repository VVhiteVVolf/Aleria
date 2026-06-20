function getInlineGuestRegisterDataForEdit(page) {
  return sanitizeGuestRegisterData(page?.guestRegister || {});
}

function commitInlineGuestRegisterData(data, rerender = false) {
  const page = getInlineDraftPage();
  if (!page) return;
  page.guestRegisterPage = true;
  page.guestRegister = sanitizeGuestRegisterData(data);
  if (rerender) renderPage(currentPage, 0);
  else scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineGuestRegisterField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.grField;
  if (!field) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  data[field] = input.value;
  commitInlineGuestRegisterData(data);
}

function updateInlineGuestRegisterSectionField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const sectionIndex = Number(input.dataset.grSectionIndex || -1);
  const field = input.dataset.grField;
  if (sectionIndex < 0 || !field) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  const section = { ...(data.sections[sectionIndex] || {}) };
  section[field] = input.value;
  data.sections[sectionIndex] = section;
  commitInlineGuestRegisterData(data);
}

function updateInlineGuestRegisterGuestField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const sectionIndex = Number(input.dataset.grSectionIndex || -1);
  const guestIndex = Number(input.dataset.grGuestIndex || -1);
  const field = input.dataset.grField;
  if (sectionIndex < 0 || guestIndex < 0 || !field) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  const guest = { ...(data.sections[sectionIndex]?.guests?.[guestIndex] || {}) };
  guest[field] = input.value;
  data.sections[sectionIndex].guests[guestIndex] = guest;
  commitInlineGuestRegisterData(data);
}

function updateInlineGuestRegisterRowField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const sectionIndex = Number(input.dataset.grSectionIndex || -1);
  const guestIndex = Number(input.dataset.grGuestIndex || -1);
  const rowIndex = Number(input.dataset.grRowIndex || -1);
  const rowKind = input.dataset.grRowKind === 'side' ? 'sideRows' : 'infoRows';
  const field = input.dataset.grField;
  if (sectionIndex < 0 || guestIndex < 0 || rowIndex < 0 || !field) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  const rows = Array.isArray(data.sections[sectionIndex]?.guests?.[guestIndex]?.[rowKind])
    ? [...data.sections[sectionIndex].guests[guestIndex][rowKind]]
    : [];
  const row = { ...(rows[rowIndex] || {}) };
  row[field] = input.value;
  rows[rowIndex] = row;
  data.sections[sectionIndex].guests[guestIndex][rowKind] = rows;
  commitInlineGuestRegisterData(data);
}

function addInlineGuestRegisterSection(afterIndex = -1) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  const index = data.sections.length + 1;
  const section = {
    title: `Personen ${index}`,
    subtitle: 'Neuer Abschnitt',
    guests: []
  };
  if (afterIndex >= 0) data.sections.splice(afterIndex + 1, 0, section);
  else data.sections.push(section);
  commitInlineGuestRegisterData(data, true);
}

function removeInlineGuestRegisterSection(sectionIndex) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  data.sections.splice(sectionIndex, 1);
  commitInlineGuestRegisterData(data, true);
}

function moveInlineGuestRegisterSection(sectionIndex, direction) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  const target = sectionIndex + direction;
  if (sectionIndex < 0 || target < 0 || target >= data.sections.length) return;
  const [section] = data.sections.splice(sectionIndex, 1);
  data.sections.splice(target, 0, section);
  commitInlineGuestRegisterData(data, true);
}

function addInlineGuestRegisterGuest(sectionIndex) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  if (!data.sections[sectionIndex]) return;
  data.sections[sectionIndex].guests.push({
    name: 'Neuer Gast',
    role: 'Reisender Gast',
    status: 'Einquartiert'
  });
  commitInlineGuestRegisterData(data, true);
}

function removeInlineGuestRegisterGuest(sectionIndex, guestIndex) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  data.sections[sectionIndex]?.guests?.splice(guestIndex, 1);
  commitInlineGuestRegisterData(data, true);
}

function moveInlineGuestRegisterGuest(sectionIndex, guestIndex, direction) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  const guests = data.sections[sectionIndex]?.guests;
  const target = guestIndex + direction;
  if (!guests || guestIndex < 0 || target < 0 || target >= guests.length) return;
  const [guest] = guests.splice(guestIndex, 1);
  guests.splice(target, 0, guest);
  commitInlineGuestRegisterData(data, true);
}

function addInlineGuestRegisterRow(sectionIndex, guestIndex, kind) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  const guest = data.sections[sectionIndex]?.guests?.[guestIndex];
  if (!guest) return;
  const rowKind = kind === 'side' ? 'sideRows' : 'infoRows';
  guest[rowKind] = Array.isArray(guest[rowKind]) ? guest[rowKind] : [];
  if (rowKind === 'infoRows' && guest[rowKind].length >= 6) return;
  guest[rowKind].push({ label: 'Neue Angabe', value: 'Wert' });
  commitInlineGuestRegisterData(data, true);
}

function removeInlineGuestRegisterRow(sectionIndex, guestIndex, rowIndex, kind) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineGuestRegisterDataForEdit(page);
  const rowKind = kind === 'side' ? 'sideRows' : 'infoRows';
  data.sections[sectionIndex]?.guests?.[guestIndex]?.[rowKind]?.splice(rowIndex, 1);
  commitInlineGuestRegisterData(data, true);
}

function buildInlineGuestRegisterField(label, field, value, type = 'text', wide = false) {
  const rangeAttrs = type === 'range' && field === 'portraitSize'
    ? ' min="72" max="180" step="2"'
    : '';
  return `
    <div class="inline-edit-field${wide ? ' wide' : ''}">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <input class="inline-edit-input" type="${escapeHtml(type)}"${rangeAttrs} data-inline-action="update-guest-register-field" data-gr-field="${escapeHtml(field)}" value="${escapeHtml(value || '')}">
    </div>`;
}

function buildInlineGuestRegisterTextarea(label, field, value) {
  return `
    <div class="inline-edit-field wide">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <textarea class="inline-edit-textarea" data-inline-action="update-guest-register-field" data-gr-field="${escapeHtml(field)}">${escapeHtml(value || '')}</textarea>
    </div>`;
}

function buildInlineGuestRegisterSectionField(label, sectionIndex, field, value) {
  return `
    <div class="inline-edit-field">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <input class="inline-edit-input" type="text" data-inline-action="update-guest-register-section-field" data-gr-section-index="${sectionIndex}" data-gr-field="${escapeHtml(field)}" value="${escapeHtml(value || '')}">
    </div>`;
}

function buildInlineGuestRegisterGuestField(label, sectionIndex, guestIndex, field, value, type = 'text', wide = false) {
  return `
    <div class="inline-edit-field${wide ? ' wide' : ''}">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <input class="inline-edit-input" type="${escapeHtml(type)}" data-inline-action="update-guest-register-guest-field" data-gr-section-index="${sectionIndex}" data-gr-guest-index="${guestIndex}" data-gr-field="${escapeHtml(field)}" value="${escapeHtml(value || '')}">
    </div>`;
}

function buildInlineGuestRegisterGuestTextarea(label, sectionIndex, guestIndex, field, value) {
  return `
    <div class="inline-edit-field wide">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <textarea class="inline-edit-textarea" data-inline-action="update-guest-register-guest-field" data-gr-section-index="${sectionIndex}" data-gr-guest-index="${guestIndex}" data-gr-field="${escapeHtml(field)}">${escapeHtml(value || '')}</textarea>
    </div>`;
}

function buildInlineGuestRegisterImageSelect(label, sectionIndex, guestIndex, field, value, options) {
  return `
    <div class="inline-edit-field">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <select class="inline-edit-select" data-inline-action="update-guest-register-guest-field" data-gr-section-index="${sectionIndex}" data-gr-guest-index="${guestIndex}" data-gr-field="${escapeHtml(field)}">
        ${options.map(option => `<option value="${escapeHtml(option.value)}"${value === option.value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
      </select>
    </div>`;
}

function buildInlineGuestRegisterRows(rows, sectionIndex, guestIndex, kind, maxRows) {
  const safeRows = sanitizeGuestRegisterRows(rows, [], maxRows);
  return `
    <div class="guest-register-editor-list">
      ${safeRows.length ? safeRows.map((row, rowIndex) => `
        <div class="guest-register-editor-row">
          <div class="inline-edit-field">
            <span class="inline-edit-label">Reiter</span>
            <input class="inline-edit-input" type="text" data-inline-action="update-guest-register-row-field" data-gr-section-index="${sectionIndex}" data-gr-guest-index="${guestIndex}" data-gr-row-index="${rowIndex}" data-gr-row-kind="${escapeHtml(kind)}" data-gr-field="label" value="${escapeHtml(row.label)}">
          </div>
          <div class="inline-edit-field">
            <span class="inline-edit-label">Wert</span>
            <input class="inline-edit-input" type="text" data-inline-action="update-guest-register-row-field" data-gr-section-index="${sectionIndex}" data-gr-guest-index="${guestIndex}" data-gr-row-index="${rowIndex}" data-gr-row-kind="${escapeHtml(kind)}" data-gr-field="value" value="${escapeHtml(row.value)}">
          </div>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-guest-register-row" data-gr-section-index="${sectionIndex}" data-gr-guest-index="${guestIndex}" data-gr-row-index="${rowIndex}" data-gr-row-kind="${escapeHtml(kind)}">Löschen</button>
        </div>`).join('') : '<div class="inline-placeholder-note">Noch keine Zeilen vorhanden.</div>'}
    </div>`;
}

function buildInlineGuestRegisterGuest(guest, sectionIndex, guestIndex) {
  const safeGuest = sanitizeGuestRegisterGuest(guest, guestIndex);
  return `
    <section class="guest-register-editor-card">
      <div class="guest-register-editor-card-head">
        <strong>Gast ${guestIndex + 1}</strong>
        <div>
          <button class="module-editor-mini-btn" type="button" data-inline-action="move-guest-register-guest" data-gr-section-index="${sectionIndex}" data-gr-guest-index="${guestIndex}" data-gr-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="move-guest-register-guest" data-gr-section-index="${sectionIndex}" data-gr-guest-index="${guestIndex}" data-gr-direction="1">Runter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-guest-register-guest" data-gr-section-index="${sectionIndex}" data-gr-guest-index="${guestIndex}">Löschen</button>
        </div>
      </div>
      <div class="inline-edit-grid">
        ${buildInlineGuestRegisterGuestField('Portrait', sectionIndex, guestIndex, 'portrait', safeGuest.portrait, 'url', true)}
        ${buildInlineGuestRegisterImageSelect('Portrait-Füllung', sectionIndex, guestIndex, 'portraitFit', safeGuest.portraitFit, [
          { value: 'cover', label: 'Füllen / croppen' },
          { value: 'contain', label: 'Ganzbild' }
        ])}
        ${buildInlineGuestRegisterImageSelect('Portrait-Ausschnitt', sectionIndex, guestIndex, 'portraitPosition', safeGuest.portraitPosition, [
          { value: 'top', label: 'Oben' },
          { value: 'center', label: 'Mitte' },
          { value: 'bottom', label: 'Unten' },
          { value: 'left', label: 'Links' },
          { value: 'right', label: 'Rechts' }
        ])}
        ${buildInlineGuestRegisterGuestField('Name', sectionIndex, guestIndex, 'name', safeGuest.name)}
        ${buildInlineGuestRegisterGuestField('Rolle / Art', sectionIndex, guestIndex, 'role', safeGuest.role)}
        ${buildInlineGuestRegisterGuestField('Status', sectionIndex, guestIndex, 'status', safeGuest.status)}
        ${buildInlineGuestRegisterGuestField('Text-Überschrift', sectionIndex, guestIndex, 'descriptionTitle', safeGuest.descriptionTitle)}
        ${buildInlineGuestRegisterGuestTextarea('Großer Textbereich', sectionIndex, guestIndex, 'description', safeGuest.description)}
        ${buildInlineGuestRegisterGuestField('Rechte Box Überschrift', sectionIndex, guestIndex, 'sideTitle', safeGuest.sideTitle)}
      </div>
      <div class="guest-register-editor-subgrid">
        <div>
          <div class="guest-register-editor-linehead">
            <h5>Infotabelle links (max. 6)</h5>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-guest-register-row" data-gr-section-index="${sectionIndex}" data-gr-guest-index="${guestIndex}" data-gr-row-kind="info">+ Zeile</button>
          </div>
          ${buildInlineGuestRegisterRows(safeGuest.infoRows, sectionIndex, guestIndex, 'info', 6)}
        </div>
        <div>
          <div class="guest-register-editor-linehead">
            <h5>Einquartierung rechts</h5>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-guest-register-row" data-gr-section-index="${sectionIndex}" data-gr-guest-index="${guestIndex}" data-gr-row-kind="side">+ Zeile</button>
          </div>
          ${buildInlineGuestRegisterRows(safeGuest.sideRows, sectionIndex, guestIndex, 'side', 10)}
        </div>
      </div>
    </section>`;
}

function buildInlineGuestRegisterSection(section, sectionIndex) {
  const safeSection = sanitizeGuestRegisterSections([section])[0] || { title: '', subtitle: '', guests: [] };
  return `
    <section class="guest-register-editor-section">
      <div class="guest-register-editor-section-head">
        <strong>Abschnitt ${sectionIndex + 1}</strong>
        <div>
          <button class="module-editor-mini-btn" type="button" data-inline-action="move-guest-register-section" data-gr-section-index="${sectionIndex}" data-gr-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="move-guest-register-section" data-gr-section-index="${sectionIndex}" data-gr-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-guest-register-section" data-gr-section-index="${sectionIndex}">+ Abschnitt darunter</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-guest-register-guest" data-gr-section-index="${sectionIndex}">+ Gast</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-guest-register-section" data-gr-section-index="${sectionIndex}">Löschen</button>
        </div>
      </div>
      <div class="inline-edit-grid">
        ${buildInlineGuestRegisterSectionField('Überschrift / Trenner', sectionIndex, 'title', safeSection.title)}
        ${buildInlineGuestRegisterSectionField('Unterzeile', sectionIndex, 'subtitle', safeSection.subtitle)}
      </div>
      <div class="guest-register-editor-guests">
        ${safeSection.guests.length
          ? safeSection.guests.map((guest, guestIndex) => buildInlineGuestRegisterGuest(guest, sectionIndex, guestIndex)).join('')
          : '<div class="inline-placeholder-note">Noch keine Gäste in diesem Abschnitt.</div>'}
      </div>
    </section>`;
}

function buildInlineGuestRegisterEditor(page) {
  const data = getInlineGuestRegisterDataForEdit(page);
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Gästeverzeichnis</div>
      <div class="inline-edit-grid">
        ${buildInlineGuestRegisterField('Titel', 'title', data.title)}
        ${buildInlineGuestRegisterField('Untertitel', 'subtitle', data.subtitle)}
        ${buildInlineGuestRegisterField('Ort / Etablissement', 'location', data.location)}
        ${buildInlineGuestRegisterField('Portraitgröße', 'portraitSize', data.portraitSize, 'range')}
        ${buildInlineGuestRegisterTextarea('Interne Notiz / Fußzeile', 'note', data.note)}
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Abschnitte & Gäste</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-guest-register-section">+ Abschnitt</button>
      </div>
      <div class="guest-register-editor-sections">
        ${data.sections.map((section, sectionIndex) => buildInlineGuestRegisterSection(section, sectionIndex)).join('')}
      </div>
      <div class="guest-register-editor-bottom-action">
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-guest-register-section">+ Weiteren Abschnitt hinzufügen</button>
      </div>
    </div>`;
}
