function buildQuestFileEditorPlaceholder(text = 'Noch keine Eintraege vorhanden.') {
  return `<div class="inline-placeholder-note">${escapeHtml(text)}</div>`;
}

function buildQuestFileObjectiveRows(items = [], mode = 'module') {
  const rows = sanitizeQuestFileRows(items);
  return rows.map((item, index) => `
    <div class="quest-file-edit-row objective ${mode === 'module' ? 'module-quest-objective-row' : 'inline-quest-objective-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-objective-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Ziel" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="sectionThreeItems" data-quest-index="${index}" data-quest-field="title"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-objective-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Beschreibung / Hinweis" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="sectionThreeItems" data-quest-index="${index}" data-quest-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-quest-list-row" data-quest-list="sectionThreeItems" data-quest-index="${index}"` : 'data-module-editor-action="remove-quest-file-row"'}>Löschen</button>
    </div>`).join('');
}

function buildQuestFileTriviaRows(items = [], mode = 'module') {
  const rows = sanitizeQuestFileRows(items);
  return rows.map((item, index) => `
    <div class="quest-file-edit-row simple ${mode === 'module' ? 'module-quest-trivia-row' : 'inline-quest-trivia-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-trivia-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Titel" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="trivia" data-quest-index="${index}" data-quest-field="title"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-trivia-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Detail" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="trivia" data-quest-index="${index}" data-quest-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-quest-list-row" data-quest-list="trivia" data-quest-index="${index}"` : 'data-module-editor-action="remove-quest-file-row"'}>Löschen</button>
    </div>`).join('');
}

function buildQuestFileImageSelect(label, field, value, listName, index, mode, options = []) {
  return `
      <label>
        <span>${escapeHtml(label)}</span>
        <select class="inline-edit-select ${mode === 'module' ? `me-quest-${listName}-${field}` : ''}" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="${escapeHtml(listName)}" data-quest-index="${index}" data-quest-field="${escapeHtml(field)}"` : ''}>
          ${options.map(option => `<option value="${escapeHtml(option.value)}"${String(value || '') === option.value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
        </select>
      </label>`;
}

function buildQuestFileImageControls(item, listName, index, mode = 'module') {
  const format = item.imageFormat || (listName === 'rewards' ? 'square' : 'portrait');
  const fit = item.imageFit || (listName === 'rewards' ? 'contain' : 'cover');
  const position = item.imagePosition || (listName === 'rewards' ? 'center' : 'top');
  const size = item.imageSize || (listName === 'rewards' ? 48 : 56);
  return `
    <div class="quest-file-image-control-grid">
      ${buildQuestFileImageSelect('Format', 'imageFormat', format, listName, index, mode, [
        { value: 'portrait', label: 'Hochformat' },
        { value: 'landscape', label: 'Querformat' },
        { value: 'square', label: 'Quadratisch' }
      ])}
      ${buildQuestFileImageSelect('Bildfuelle', 'imageFit', fit, listName, index, mode, [
        { value: 'cover', label: 'Fuellen / croppen' },
        { value: 'contain', label: 'Ganzes Bild' }
      ])}
      ${buildQuestFileImageSelect('Ausschnitt', 'imagePosition', position, listName, index, mode, [
        { value: 'top', label: 'Oben' },
        { value: 'center', label: 'Mitte' },
        { value: 'bottom', label: 'Unten' },
        { value: 'left', label: 'Links' },
        { value: 'right', label: 'Rechts' }
      ])}
      <label>
        <span>Groesse</span>
        <input class="inline-edit-input ${mode === 'module' ? `me-quest-${listName}-imageSize` : ''}" type="number" min="30" max="150" step="1" value="${escapeHtml(size)}" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="${escapeHtml(listName)}" data-quest-index="${index}" data-quest-field="imageSize"` : ''}>
      </label>
    </div>`;
}

function buildQuestFileSingleImageSelect(label, field, value, options = []) {
  return `
      <label>
        <span>${escapeHtml(label)}</span>
        <select class="inline-edit-select me-quest-${field}">
          ${options.map(option => `<option value="${escapeHtml(option.value)}"${String(value || '') === option.value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
        </select>
      </label>`;
}

function buildQuestFileClientPortraitControls(questFile) {
  return `
    <div class="quest-file-image-control-grid">
      ${buildQuestFileSingleImageSelect('Format', 'client-portrait-format', questFile.clientPortraitFormat, [
        { value: 'portrait', label: 'Hochformat' },
        { value: 'landscape', label: 'Querformat' },
        { value: 'square', label: 'Quadratisch' }
      ])}
      ${buildQuestFileSingleImageSelect('Bildfuelle', 'client-portrait-fit', questFile.clientPortraitFit, [
        { value: 'cover', label: 'Fuellen / croppen' },
        { value: 'contain', label: 'Ganzes Bild' }
      ])}
      ${buildQuestFileSingleImageSelect('Ausschnitt', 'client-portrait-position', questFile.clientPortraitPosition, [
        { value: 'top', label: 'Oben' },
        { value: 'center', label: 'Mitte' },
        { value: 'bottom', label: 'Unten' },
        { value: 'left', label: 'Links' },
        { value: 'right', label: 'Rechts' }
      ])}
      <label>
        <span>Groesse</span>
        <input class="inline-edit-input me-quest-client-portrait-size" type="number" min="44" max="150" step="1" value="${escapeHtml(questFile.clientPortraitSize)}">
      </label>
    </div>`;
}

function buildQuestFileContactRows(items = [], mode = 'module') {
  const rows = sanitizeQuestContacts(items);
  return rows.map((item, index) => `
    <div class="quest-file-edit-row contact ${mode === 'module' ? 'module-quest-contact-row' : 'inline-quest-contact-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-contact-image' : ''}" type="url" value="${escapeHtml(item.image || '')}" placeholder="Imgur-Bild" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="contacts" data-quest-index="${index}" data-quest-field="image"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-contact-name' : ''}" type="text" value="${escapeHtml(item.name || '')}" placeholder="Name" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="contacts" data-quest-index="${index}" data-quest-field="name"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-contact-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Titel / Rolle" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="contacts" data-quest-index="${index}" data-quest-field="title"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-quest-list-row" data-quest-list="contacts" data-quest-index="${index}"` : 'data-module-editor-action="remove-quest-file-row"'}>Löschen</button>
      ${buildQuestFileImageControls(item, 'contacts', index, mode)}
    </div>`).join('');
}

function buildQuestFileRewardRows(items = [], mode = 'module') {
  const rows = sanitizeQuestRewards(items);
  return rows.map((item, index) => `
    <div class="quest-file-edit-row reward ${mode === 'module' ? 'module-quest-reward-row' : 'inline-quest-reward-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-reward-image' : ''}" type="url" value="${escapeHtml(item.image || '')}" placeholder="Imgur-Bild" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="rewards" data-quest-index="${index}" data-quest-field="image"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-reward-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Belohnung" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="rewards" data-quest-index="${index}" data-quest-field="title"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-reward-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Detail" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="rewards" data-quest-index="${index}" data-quest-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-quest-list-row" data-quest-list="rewards" data-quest-index="${index}"` : 'data-module-editor-action="remove-quest-file-row"'}>Löschen</button>
      ${buildQuestFileImageControls(item, 'rewards', index, mode)}
    </div>`).join('');
}

function buildQuestFileExtraSectionRows(items = [], mode = 'module') {
  const rows = sanitizeQuestExtraSections(items);
  return rows.map((item, index) => `
    <div class="quest-file-edit-row extra ${mode === 'module' ? 'module-quest-extra-section-row' : 'inline-quest-extra-section-row'}">
      <select class="inline-edit-select ${mode === 'module' ? 'me-quest-extra-position' : ''}" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="extraSections" data-quest-index="${index}" data-quest-field="position"` : ''}>
        <option value="afterSectionOne"${item.position === 'afterSectionOne' ? ' selected' : ''}>Nach Auftragsbeschreibung</option>
        <option value="afterSectionTwo"${item.position === 'afterSectionTwo' ? ' selected' : ''}>Nach Hintergrund</option>
        <option value="afterObjectives"${item.position === 'afterObjectives' ? ' selected' : ''}>Direkt unter Ziele</option>
      </select>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-extra-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Ueberschrift" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="extraSections" data-quest-index="${index}" data-quest-field="title"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-quest-list-row" data-quest-list="extraSections" data-quest-index="${index}"` : 'data-module-editor-action="remove-quest-file-row"'}>Loeschen</button>
      <textarea class="inline-edit-textarea ${mode === 'module' ? 'me-quest-extra-text' : ''}" placeholder="Text" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="extraSections" data-quest-index="${index}" data-quest-field="text"` : ''}>${escapeHtml(item.text || '')}</textarea>
    </div>`).join('');
}

function collectModuleQuestObjectives(card) {
  return sanitizeQuestFileRows(Array.from(card.querySelectorAll('.module-quest-objective-row')).map(row => ({
    title: getTrimmedFormValue(row, '.me-quest-objective-title'),
    detail: getTrimmedFormValue(row, '.me-quest-objective-detail')
  })));
}

function collectModuleQuestTrivia(card) {
  return sanitizeQuestFileRows(Array.from(card.querySelectorAll('.module-quest-trivia-row')).map(row => ({
    title: getTrimmedFormValue(row, '.me-quest-trivia-title'),
    detail: getTrimmedFormValue(row, '.me-quest-trivia-detail')
  })));
}

function collectModuleQuestContacts(card) {
  return sanitizeQuestContacts(Array.from(card.querySelectorAll('.module-quest-contact-row')).map(row => ({
    image: getTrimmedFormValue(row, '.me-quest-contact-image'),
    imageFormat: getTrimmedFormValue(row, '.me-quest-contacts-imageFormat'),
    imageFit: getTrimmedFormValue(row, '.me-quest-contacts-imageFit'),
    imagePosition: getTrimmedFormValue(row, '.me-quest-contacts-imagePosition'),
    imageSize: getTrimmedFormValue(row, '.me-quest-contacts-imageSize'),
    name: getTrimmedFormValue(row, '.me-quest-contact-name'),
    title: getTrimmedFormValue(row, '.me-quest-contact-title')
  })));
}

function collectModuleQuestRewards(card) {
  return sanitizeQuestRewards(Array.from(card.querySelectorAll('.module-quest-reward-row')).map(row => ({
    image: getTrimmedFormValue(row, '.me-quest-reward-image'),
    imageFormat: getTrimmedFormValue(row, '.me-quest-rewards-imageFormat'),
    imageFit: getTrimmedFormValue(row, '.me-quest-rewards-imageFit'),
    imagePosition: getTrimmedFormValue(row, '.me-quest-rewards-imagePosition'),
    imageSize: getTrimmedFormValue(row, '.me-quest-rewards-imageSize'),
    title: getTrimmedFormValue(row, '.me-quest-reward-title'),
    detail: getTrimmedFormValue(row, '.me-quest-reward-detail')
  })));
}

function collectModuleQuestExtraSections(card) {
  return sanitizeQuestExtraSections(Array.from(card.querySelectorAll('.module-quest-extra-section-row')).map(row => ({
    position: getTrimmedFormValue(row, '.me-quest-extra-position'),
    title: getTrimmedFormValue(row, '.me-quest-extra-title'),
    text: getTrimmedFormValue(row, '.me-quest-extra-text')
  })));
}

function addModuleQuestFileRow(button, listName) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector(`.module-quest-${listName}`);
  if (!wrap) return;
  const builders = {
    objectives: () => buildQuestFileObjectiveRows([{ title: 'Neues Ziel', detail: '' }]),
    trivia: () => buildQuestFileTriviaRows([{ title: 'Eintrag', detail: '' }]),
    contacts: () => buildQuestFileContactRows([{ image: '', name: 'Kontaktperson', title: '' }]),
    rewards: () => buildQuestFileRewardRows([{ image: '', title: 'Belohnung', detail: '' }]),
    extraSections: () => buildQuestFileExtraSectionRows([{ position: 'afterSectionTwo', title: 'Neuer Abschnitt', text: '' }])
  };
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', builders[listName]?.() || '');
  syncModuleJsonPreview();
}

function removeModuleQuestFileRow(button) {
  const row = button.closest('.quest-file-edit-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.quest-file-edit-row')) {
    wrap.innerHTML = buildQuestFileEditorPlaceholder();
    syncModuleJsonPreview();
    return;
  }
  syncModuleJsonPreview();
}

function buildQuestFileModuleEditorFields(page) {
  const questFile = sanitizeQuestFileData(page?.questFile || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'quest-file' ? ' visible' : ''}" data-page-type="quest-file">
        <div class="module-editor-grid">
          <div class="module-editor-field">
            <label>Archivzeile</label>
            <input type="text" class="me-quest-archive-label" value="${escapeHtml(questFile.archiveLabel)}">
          </div>
          <div class="module-editor-field">
            <label>Vertraulichkeitsnotiz</label>
            <input type="text" class="me-quest-confidentiality" value="${escapeHtml(questFile.confidentiality)}">
          </div>
          <div class="module-editor-field">
            <label>Banner / Wappenband</label>
            <input type="url" class="me-quest-banner-image" value="${escapeHtml(questFile.bannerImage)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Wappen / Siegelbild</label>
            <input type="url" class="me-quest-crest-image" value="${escapeHtml(questFile.crestImage)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Infotabelle</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-stat-row">+ Zeile</button>
            </div>
            <div class="inline-stat-editor module-biography-stats">
              ${buildModuleBiographyStatRows(page?.stats || [])}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Auftraggeber-Portrait</label>
            <input type="url" class="me-quest-client-portrait" value="${escapeHtml(questFile.clientPortrait)}" placeholder="https://i.imgur.com/...">
            ${buildQuestFileClientPortraitControls(questFile)}
          </div>
          <div class="module-editor-field">
            <label>Auftraggeber-Name</label>
            <input type="text" class="me-quest-client-name" value="${escapeHtml(questFile.clientName)}">
          </div>
          <div class="module-editor-field">
            <label>Auftraggeber-Titel</label>
            <input type="text" class="me-quest-client-title" value="${escapeHtml(questFile.clientTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Schreiben / Auftraggebernotiz</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-quest-client-note small">${escapeHtml(questFile.clientNote)}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Sektor 1 Überschrift</label>
            <input type="text" class="me-quest-section-one-title" value="${escapeHtml(questFile.sectionOneTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Sektor 2 Überschrift</label>
            <input type="text" class="me-quest-section-two-title" value="${escapeHtml(questFile.sectionTwoTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Sektor 1 Text</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-quest-section-one-text">${escapeHtml(questFile.sectionOneText)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Sektor 2 Text</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-quest-section-two-text">${escapeHtml(questFile.sectionTwoText)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Zusatzabschnitte Mitte</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-quest-file-row" data-quest-list="extraSections">+ Abschnitt</button>
            </div>
            <div class="module-editor-help">Abschnitte koennen nach Auftragsbeschreibung, nach Hintergrund oder direkt unter Ziele erscheinen.</div>
            <div class="quest-file-edit-list module-quest-extraSections">
              ${questFile.extraSections.length ? buildQuestFileExtraSectionRows(questFile.extraSections) : buildQuestFileEditorPlaceholder('Noch keine Zusatzabschnitte vorhanden.')}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Bullet-Sektor Überschrift</label>
            <input type="text" class="me-quest-section-three-title" value="${escapeHtml(questFile.sectionThreeTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Karten-/Skizzenbild Mitte</label>
            <input type="url" class="me-quest-sketch-image" value="${escapeHtml(questFile.sketchImage)}" placeholder="Optional: https://i.imgur.com/...">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Bullet-Liste / Ziele</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-quest-file-row" data-quest-list="objectives">+ Ziel</button>
            </div>
            <div class="quest-file-edit-list module-quest-objectives">
              ${questFile.sectionThreeItems.length ? buildQuestFileObjectiveRows(questFile.sectionThreeItems) : buildQuestFileEditorPlaceholder('Noch keine Ziele vorhanden.')}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Kontakte-Überschrift</label>
            <input type="text" class="me-quest-contacts-title" value="${escapeHtml(questFile.contactsTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Trivia-Überschrift</label>
            <input type="text" class="me-quest-trivia-title" value="${escapeHtml(questFile.triviaTitle)}">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Kontaktpersonen</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-quest-file-row" data-quest-list="contacts">+ Kontakt</button>
            </div>
            <div class="quest-file-edit-list module-quest-contacts">
              ${questFile.contacts.length ? buildQuestFileContactRows(questFile.contacts) : buildQuestFileEditorPlaceholder('Noch keine Kontaktpersonen vorhanden.')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Trivia / Orte / Hinweise</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-quest-file-row" data-quest-list="trivia">+ Eintrag</button>
            </div>
            <div class="quest-file-edit-list module-quest-trivia">
              ${questFile.trivia.length ? buildQuestFileTriviaRows(questFile.trivia) : buildQuestFileEditorPlaceholder('Noch keine Hinweise vorhanden.')}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Belohnungen-Überschrift</label>
            <input type="text" class="me-quest-rewards-title" value="${escapeHtml(questFile.rewardsTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Notiz-Überschrift</label>
            <input type="text" class="me-quest-note-title" value="${escapeHtml(questFile.noteTitle)}">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Belohnungen</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-quest-file-row" data-quest-list="rewards">+ Belohnung</button>
            </div>
            <div class="quest-file-edit-list module-quest-rewards">
              ${questFile.rewards.length ? buildQuestFileRewardRows(questFile.rewards) : buildQuestFileEditorPlaceholder('Noch keine Belohnungen vorhanden.')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Notiz unten</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-quest-note small">${escapeHtml(questFile.note)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Fußzeile</label>
            <input type="text" class="me-quest-footer" value="${escapeHtml(questFile.footer)}">
          </div>
        </div>
      </div>`;
}

function collectQuestFileModuleEditorPage(card, page) {
  const questBlock = card.querySelector('[data-page-type="quest-file"]') || card;
  page.questFilePage = true;
  page.stats = collectModuleBiographyStats(questBlock);
  page.questFile = sanitizeQuestFileData({
    archiveLabel: getTrimmedFormValue(questBlock, '.me-quest-archive-label'),
    confidentiality: getTrimmedFormValue(questBlock, '.me-quest-confidentiality'),
    bannerImage: getTrimmedFormValue(questBlock, '.me-quest-banner-image'),
    crestImage: getTrimmedFormValue(questBlock, '.me-quest-crest-image'),
    clientName: getTrimmedFormValue(questBlock, '.me-quest-client-name'),
    clientTitle: getTrimmedFormValue(questBlock, '.me-quest-client-title'),
    clientPortrait: getTrimmedFormValue(questBlock, '.me-quest-client-portrait'),
    clientPortraitFormat: getTrimmedFormValue(questBlock, '.me-quest-client-portrait-format'),
    clientPortraitFit: getTrimmedFormValue(questBlock, '.me-quest-client-portrait-fit'),
    clientPortraitPosition: getTrimmedFormValue(questBlock, '.me-quest-client-portrait-position'),
    clientPortraitSize: getTrimmedFormValue(questBlock, '.me-quest-client-portrait-size'),
    clientNote: getTrimmedFormValue(questBlock, '.me-quest-client-note'),
    sectionOneTitle: getTrimmedFormValue(questBlock, '.me-quest-section-one-title'),
    sectionOneText: getTrimmedFormValue(questBlock, '.me-quest-section-one-text'),
    sectionTwoTitle: getTrimmedFormValue(questBlock, '.me-quest-section-two-title'),
    sectionTwoText: getTrimmedFormValue(questBlock, '.me-quest-section-two-text'),
    sectionThreeTitle: getTrimmedFormValue(questBlock, '.me-quest-section-three-title'),
    sectionThreeItems: collectModuleQuestObjectives(questBlock),
    extraSections: collectModuleQuestExtraSections(questBlock),
    contactsTitle: getTrimmedFormValue(questBlock, '.me-quest-contacts-title'),
    contacts: collectModuleQuestContacts(questBlock),
    triviaTitle: getTrimmedFormValue(questBlock, '.me-quest-trivia-title'),
    trivia: collectModuleQuestTrivia(questBlock),
    rewardsTitle: getTrimmedFormValue(questBlock, '.me-quest-rewards-title'),
    rewards: collectModuleQuestRewards(questBlock),
    noteTitle: getTrimmedFormValue(questBlock, '.me-quest-note-title'),
    note: getTrimmedFormValue(questBlock, '.me-quest-note'),
    sketchImage: getTrimmedFormValue(questBlock, '.me-quest-sketch-image'),
    footer: getTrimmedFormValue(questBlock, '.me-quest-footer')
  });
  return page;
}
