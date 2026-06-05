function buildQuestFileObjectiveRows(items = [], mode = 'module') {
  const rows = sanitizeQuestFileRows(items).length ? sanitizeQuestFileRows(items) : [{ title: 'Neues Ziel', detail: '' }];
  return rows.map((item, index) => `
    <div class="quest-file-edit-row objective ${mode === 'module' ? 'module-quest-objective-row' : 'inline-quest-objective-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-objective-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Ziel" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="sectionThreeItems" data-quest-index="${index}" data-quest-field="title"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-objective-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Beschreibung / Hinweis" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="sectionThreeItems" data-quest-index="${index}" data-quest-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-quest-list-row" data-quest-list="sectionThreeItems" data-quest-index="${index}"` : 'data-module-editor-action="remove-quest-file-row"'}>Löschen</button>
    </div>`).join('');
}

function buildQuestFileTriviaRows(items = [], mode = 'module') {
  const rows = sanitizeQuestFileRows(items).length ? sanitizeQuestFileRows(items) : [{ title: 'Eintrag', detail: '' }];
  return rows.map((item, index) => `
    <div class="quest-file-edit-row simple ${mode === 'module' ? 'module-quest-trivia-row' : 'inline-quest-trivia-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-trivia-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Titel" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="trivia" data-quest-index="${index}" data-quest-field="title"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-trivia-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Detail" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="trivia" data-quest-index="${index}" data-quest-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-quest-list-row" data-quest-list="trivia" data-quest-index="${index}"` : 'data-module-editor-action="remove-quest-file-row"'}>Löschen</button>
    </div>`).join('');
}

function buildQuestFileContactRows(items = [], mode = 'module') {
  const rows = sanitizeQuestContacts(items).length ? sanitizeQuestContacts(items) : [{ image: '', name: 'Kontaktperson', title: '' }];
  return rows.map((item, index) => `
    <div class="quest-file-edit-row contact ${mode === 'module' ? 'module-quest-contact-row' : 'inline-quest-contact-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-contact-image' : ''}" type="url" value="${escapeHtml(item.image || '')}" placeholder="Imgur-Bild" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="contacts" data-quest-index="${index}" data-quest-field="image"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-contact-name' : ''}" type="text" value="${escapeHtml(item.name || '')}" placeholder="Name" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="contacts" data-quest-index="${index}" data-quest-field="name"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-contact-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Titel / Rolle" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="contacts" data-quest-index="${index}" data-quest-field="title"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-quest-list-row" data-quest-list="contacts" data-quest-index="${index}"` : 'data-module-editor-action="remove-quest-file-row"'}>Löschen</button>
    </div>`).join('');
}

function buildQuestFileRewardRows(items = [], mode = 'module') {
  const rows = sanitizeQuestRewards(items).length ? sanitizeQuestRewards(items) : [{ image: '', title: 'Belohnung', detail: '' }];
  return rows.map((item, index) => `
    <div class="quest-file-edit-row reward ${mode === 'module' ? 'module-quest-reward-row' : 'inline-quest-reward-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-reward-image' : ''}" type="url" value="${escapeHtml(item.image || '')}" placeholder="Imgur-Bild" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="rewards" data-quest-index="${index}" data-quest-field="image"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-reward-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Belohnung" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="rewards" data-quest-index="${index}" data-quest-field="title"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-quest-reward-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Detail" ${mode === 'inline' ? `data-inline-action="update-quest-list-field" data-quest-list="rewards" data-quest-index="${index}" data-quest-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-quest-list-row" data-quest-list="rewards" data-quest-index="${index}"` : 'data-module-editor-action="remove-quest-file-row"'}>Löschen</button>
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
    name: getTrimmedFormValue(row, '.me-quest-contact-name'),
    title: getTrimmedFormValue(row, '.me-quest-contact-title')
  })));
}

function collectModuleQuestRewards(card) {
  return sanitizeQuestRewards(Array.from(card.querySelectorAll('.module-quest-reward-row')).map(row => ({
    image: getTrimmedFormValue(row, '.me-quest-reward-image'),
    title: getTrimmedFormValue(row, '.me-quest-reward-title'),
    detail: getTrimmedFormValue(row, '.me-quest-reward-detail')
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
    rewards: () => buildQuestFileRewardRows([{ image: '', title: 'Belohnung', detail: '' }])
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
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Einträge vorhanden.</div>';
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
            <textarea class="me-quest-section-one-text">${escapeHtml(questFile.sectionOneText)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Sektor 2 Text</label>
            <textarea class="me-quest-section-two-text">${escapeHtml(questFile.sectionTwoText)}</textarea>
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
              ${buildQuestFileObjectiveRows(questFile.sectionThreeItems)}
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
              ${buildQuestFileContactRows(questFile.contacts)}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Trivia / Orte / Hinweise</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-quest-file-row" data-quest-list="trivia">+ Eintrag</button>
            </div>
            <div class="quest-file-edit-list module-quest-trivia">
              ${buildQuestFileTriviaRows(questFile.trivia)}
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
              ${buildQuestFileRewardRows(questFile.rewards)}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Notiz unten</label>
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
    archiveLabel: getTrimmedFormValue(card, '.me-quest-archive-label'),
    confidentiality: getTrimmedFormValue(card, '.me-quest-confidentiality'),
    bannerImage: getTrimmedFormValue(card, '.me-quest-banner-image'),
    crestImage: getTrimmedFormValue(card, '.me-quest-crest-image'),
    clientName: getTrimmedFormValue(card, '.me-quest-client-name'),
    clientTitle: getTrimmedFormValue(card, '.me-quest-client-title'),
    clientPortrait: getTrimmedFormValue(card, '.me-quest-client-portrait'),
    clientNote: getTrimmedFormValue(card, '.me-quest-client-note'),
    sectionOneTitle: getTrimmedFormValue(card, '.me-quest-section-one-title'),
    sectionOneText: getTrimmedFormValue(card, '.me-quest-section-one-text'),
    sectionTwoTitle: getTrimmedFormValue(card, '.me-quest-section-two-title'),
    sectionTwoText: getTrimmedFormValue(card, '.me-quest-section-two-text'),
    sectionThreeTitle: getTrimmedFormValue(card, '.me-quest-section-three-title'),
    sectionThreeItems: collectModuleQuestObjectives(questBlock),
    contactsTitle: getTrimmedFormValue(card, '.me-quest-contacts-title'),
    contacts: collectModuleQuestContacts(questBlock),
    triviaTitle: getTrimmedFormValue(card, '.me-quest-trivia-title'),
    trivia: collectModuleQuestTrivia(questBlock),
    rewardsTitle: getTrimmedFormValue(card, '.me-quest-rewards-title'),
    rewards: collectModuleQuestRewards(questBlock),
    noteTitle: getTrimmedFormValue(card, '.me-quest-note-title'),
    note: getTrimmedFormValue(card, '.me-quest-note'),
    sketchImage: getTrimmedFormValue(card, '.me-quest-sketch-image'),
    footer: getTrimmedFormValue(card, '.me-quest-footer')
  });
  return page;
}
