// Inline editor quest-file state and builder.
// Owns only quest-file-page editing behavior.

function getInlineQuestFileDataForEdit(page) {
  return sanitizeQuestFileData(page?.questFile || {});
}

function updateInlineQuestFileField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.questFileField;
  if (!field) return;
  const current = getInlineQuestFileDataForEdit(page);
  current[field] = String(input.value || '').trim();
  page.questFile = sanitizeQuestFileData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineQuestFileListRow(listName) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineQuestFileDataForEdit(page);
  if (listName === 'sectionThreeItems') {
    current.sectionThreeItems.push({ title: 'Neues Ziel', detail: '' });
  } else if (listName === 'contacts') {
    current.contacts.push({ image: '', name: 'Kontaktperson', title: '' });
  } else if (listName === 'trivia') {
    current.trivia.push({ title: 'Eintrag', detail: '' });
  } else if (listName === 'rewards') {
    current.rewards.push({ image: '', title: 'Belohnung', detail: '' });
  }
  page.questFile = sanitizeQuestFileData(current);
  renderPage(currentPage, 0);
}

function removeInlineQuestFileListRow(listName, index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineQuestFileDataForEdit(page);
  if (Array.isArray(current[listName])) current[listName].splice(Number(index), 1);
  page.questFile = sanitizeQuestFileData(current);
  renderPage(currentPage, 0);
}

function updateInlineQuestFileListField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const listName = input.dataset.questList;
  const index = Number(input.dataset.questIndex || -1);
  const field = input.dataset.questField;
  if (!listName || index < 0 || !field) return;
  const current = getInlineQuestFileDataForEdit(page);
  const value = String(input.value || '').trim();

  if (listName === 'sectionThreeItems' || listName === 'trivia') {
    const item = current[listName][index] || { title: '', detail: '' };
    item[field] = value;
    current[listName][index] = item;
  } else if (listName === 'contacts') {
    const item = current.contacts[index] || { image: '', name: '', title: '' };
    item[field] = value;
    current.contacts[index] = item;
  } else if (listName === 'rewards') {
    const item = current.rewards[index] || { image: '', title: '', detail: '' };
    item[field] = value;
    current.rewards[index] = item;
  }

  page.questFile = sanitizeQuestFileData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineQuestFileEditor(entry, page) {
  const questFile = sanitizeQuestFileData(page.questFile || {});
  const meta = `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Questakte</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Titel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="title" value="${escapeHtml(entry.title || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Untertitel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="subtitle" value="${escapeHtml(entry.subtitle || '')}">
        </div>
        ${buildInlineSectionPicker()}
        ${buildInlineTemplatePicker('quest-file')}
        ${buildInlineModuleSizeControls(entry)}
        <div class="inline-edit-field">
          <span class="inline-edit-label">Typ</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="type" value="${escapeHtml(entry.type || '')}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Stempel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="stamp" value="${escapeHtml(entry.stamp || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Seitentitel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-page-field" data-page-field="pageTitle" value="${escapeHtml(page.pageTitle || '')}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Archivzeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="archiveLabel" value="${escapeHtml(questFile.archiveLabel)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Vertraulichkeitsnotiz</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="confidentiality" value="${escapeHtml(questFile.confidentiality)}">
        </div>
      </div>
    </div>`;
  const visuals = `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Bilder & Auftraggeber</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Banner / Wappenband</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-quest-file-field" data-quest-file-field="bannerImage" value="${escapeHtml(questFile.bannerImage)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Wappen / Siegelbild</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-quest-file-field" data-quest-file-field="crestImage" value="${escapeHtml(questFile.crestImage)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Auftraggeber-Portrait</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-quest-file-field" data-quest-file-field="clientPortrait" value="${escapeHtml(questFile.clientPortrait)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Auftraggeber-Name</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="clientName" value="${escapeHtml(questFile.clientName)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Auftraggeber-Titel</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="clientTitle" value="${escapeHtml(questFile.clientTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Schreiben / Auftraggebernotiz</span>
          <textarea class="inline-edit-textarea" data-inline-action="update-quest-file-field" data-quest-file-field="clientNote">${escapeHtml(questFile.clientNote)}</textarea>
        </div>
      </div>
    </div>`;
  const center = `
    ${buildInlineStatsEditor(page)}
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Zentrale Sektoren</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Sektor 1 Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="sectionOneTitle" value="${escapeHtml(questFile.sectionOneTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Sektor 2 Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="sectionTwoTitle" value="${escapeHtml(questFile.sectionTwoTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Sektor 1 Text</span>
          <textarea class="inline-edit-textarea" data-inline-action="update-quest-file-field" data-quest-file-field="sectionOneText">${escapeHtml(questFile.sectionOneText)}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Sektor 2 Text</span>
          <textarea class="inline-edit-textarea" data-inline-action="update-quest-file-field" data-quest-file-field="sectionTwoText">${escapeHtml(questFile.sectionTwoText)}</textarea>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Bullet-Sektor Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="sectionThreeTitle" value="${escapeHtml(questFile.sectionThreeTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Karten-/Skizzenbild</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-quest-file-field" data-quest-file-field="sketchImage" value="${escapeHtml(questFile.sketchImage)}" placeholder="https://i.imgur.com/...">
        </div>
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Bullet-Liste / Ziele</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-quest-list-row" data-quest-list="sectionThreeItems">+ Ziel</button>
      </div>
      <div class="quest-file-edit-list">${buildQuestFileObjectiveRows(questFile.sectionThreeItems, 'inline')}</div>
    </div>`;
  const sidebar = `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Rechte Sidebar</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Kontakte-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="contactsTitle" value="${escapeHtml(questFile.contactsTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Trivia-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="triviaTitle" value="${escapeHtml(questFile.triviaTitle)}">
        </div>
      </div>
      <div class="inline-edit-head">
        <div class="inline-placeholder-note">Kontaktpersonen mit kleinem Imgur-Bild, Name und Titel.</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-quest-list-row" data-quest-list="contacts">+ Kontakt</button>
      </div>
      <div class="quest-file-edit-list">${buildQuestFileContactRows(questFile.contacts, 'inline')}</div>
      <div class="inline-edit-head">
        <div class="inline-placeholder-note">Trivia, Orte oder knappe Zusatzhinweise.</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-quest-list-row" data-quest-list="trivia">+ Eintrag</button>
      </div>
      <div class="quest-file-edit-list">${buildQuestFileTriviaRows(questFile.trivia, 'inline')}</div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Belohnungen-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="rewardsTitle" value="${escapeHtml(questFile.rewardsTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Notiz-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="noteTitle" value="${escapeHtml(questFile.noteTitle)}">
        </div>
      </div>
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Belohnungen</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-quest-list-row" data-quest-list="rewards">+ Belohnung</button>
      </div>
      <div class="quest-file-edit-list">${buildQuestFileRewardRows(questFile.rewards, 'inline')}</div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Notiz unten</span>
        <textarea class="inline-edit-textarea" data-inline-action="update-quest-file-field" data-quest-file-field="note">${escapeHtml(questFile.note)}</textarea>
      </div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Fußzeile</span>
        <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="footer" value="${escapeHtml(questFile.footer)}">
      </div>
    </div>`;
  return `${meta}${visuals}${center}${sidebar}`;
}
