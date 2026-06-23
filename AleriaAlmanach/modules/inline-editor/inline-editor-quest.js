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
  } else if (listName === 'extraSections') {
    current.extraSections.push({ position: 'afterSectionTwo', title: 'Neuer Abschnitt', text: '' });
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
  } else if (listName === 'extraSections') {
    const item = current.extraSections[index] || { position: 'afterSectionTwo', title: '', text: '' };
    item[field] = value;
    current.extraSections[index] = item;
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

function buildInlineQuestFieldSelect(label, field, value, options = []) {
  return `
        <div class="inline-edit-field">
          <span class="inline-edit-label">${escapeHtml(label)}</span>
          <select class="inline-edit-select" data-inline-action="update-quest-file-field" data-quest-file-field="${escapeHtml(field)}">
            ${options.map(option => `<option value="${escapeHtml(option.value)}"${String(value || '') === option.value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
          </select>
        </div>`;
}

function buildInlineQuestClientPortraitControls(questFile) {
  return `
        ${buildInlineQuestFieldSelect('Auftraggeber-Bildformat', 'clientPortraitFormat', questFile.clientPortraitFormat, [
          { value: 'portrait', label: 'Hochformat' },
          { value: 'landscape', label: 'Querformat' },
          { value: 'square', label: 'Quadratisch' }
        ])}
        ${buildInlineQuestFieldSelect('Auftraggeber-Bildfuelle', 'clientPortraitFit', questFile.clientPortraitFit, [
          { value: 'cover', label: 'Fuellen / croppen' },
          { value: 'contain', label: 'Ganzes Bild' }
        ])}
        ${buildInlineQuestFieldSelect('Auftraggeber-Ausschnitt', 'clientPortraitPosition', questFile.clientPortraitPosition, [
          { value: 'top', label: 'Oben' },
          { value: 'center', label: 'Mitte' },
          { value: 'bottom', label: 'Unten' },
          { value: 'left', label: 'Links' },
          { value: 'right', label: 'Rechts' }
        ])}
        <div class="inline-edit-field">
          <span class="inline-edit-label">Auftraggeber-Groesse</span>
          <input class="inline-edit-input" type="number" min="44" max="150" step="1" data-inline-action="update-quest-file-field" data-quest-file-field="clientPortraitSize" value="${escapeHtml(questFile.clientPortraitSize)}">
        </div>`;
}

function buildInlineQuestFileEditor(entry, page, options = {}) {
  const questFile = sanitizeQuestFileData(page.questFile || {});
  const includeMeta = options.includeMeta !== false;
  const includeStats = options.includeStats !== false;
  const metaFields = includeMeta ? `
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
    </div>` : `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Questakte</div>
      <div class="inline-edit-grid">
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
        ${buildInlineQuestClientPortraitControls(questFile)}
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
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-quest-file-field" data-quest-file-field="clientNote">${escapeHtml(questFile.clientNote)}</textarea>
        </div>
      </div>
    </div>`;
  const center = `
    ${includeStats ? buildInlineStatsEditor(page) : ''}
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
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-quest-file-field" data-quest-file-field="sectionOneText">${escapeHtml(questFile.sectionOneText)}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Sektor 2 Text</span>
          ${buildTextFormatToolbar()}
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
        <div class="inline-edit-kicker">Zusatzabschnitte Mitte</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-quest-list-row" data-quest-list="extraSections">+ Abschnitt</button>
      </div>
      <div class="inline-placeholder-note">Abschnitte koennen nach Auftragsbeschreibung, nach Hintergrund oder direkt unter Ziele erscheinen.</div>
      <div class="quest-file-edit-list">${questFile.extraSections.length ? buildQuestFileExtraSectionRows(questFile.extraSections, 'inline') : buildQuestFileEditorPlaceholder('Noch keine Zusatzabschnitte vorhanden.')}</div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Bullet-Liste / Ziele</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-quest-list-row" data-quest-list="sectionThreeItems">+ Ziel</button>
      </div>
      <div class="quest-file-edit-list">${questFile.sectionThreeItems.length ? buildQuestFileObjectiveRows(questFile.sectionThreeItems, 'inline') : buildQuestFileEditorPlaceholder('Noch keine Ziele vorhanden.')}</div>
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
      <div class="quest-file-edit-list">${questFile.contacts.length ? buildQuestFileContactRows(questFile.contacts, 'inline') : buildQuestFileEditorPlaceholder('Noch keine Kontaktpersonen vorhanden.')}</div>
      <div class="inline-edit-head">
        <div class="inline-placeholder-note">Trivia, Orte oder knappe Zusatzhinweise.</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-quest-list-row" data-quest-list="trivia">+ Eintrag</button>
      </div>
      <div class="quest-file-edit-list">${questFile.trivia.length ? buildQuestFileTriviaRows(questFile.trivia, 'inline') : buildQuestFileEditorPlaceholder('Noch keine Hinweise vorhanden.')}</div>
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
      <div class="quest-file-edit-list">${questFile.rewards.length ? buildQuestFileRewardRows(questFile.rewards, 'inline') : buildQuestFileEditorPlaceholder('Noch keine Belohnungen vorhanden.')}</div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Notiz unten</span>
        ${buildTextFormatToolbar()}
        <textarea class="inline-edit-textarea" data-inline-action="update-quest-file-field" data-quest-file-field="note">${escapeHtml(questFile.note)}</textarea>
      </div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Fußzeile</span>
        <input class="inline-edit-input" type="text" data-inline-action="update-quest-file-field" data-quest-file-field="footer" value="${escapeHtml(questFile.footer)}">
      </div>
    </div>`;
  return `${metaFields}${visuals}${center}${sidebar}`;
}
