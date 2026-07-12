function getInlineBountyDraft() {
  const page = getInlineDraftPage();
  if (!page) return null;
  page.bountyFile = sanitizeBountyFileData(page.bountyFile || {});
  return page.bountyFile;
}

function updateInlineBountyField(input) {
  const page = getInlineDraftPage();
  const data = getInlineBountyDraft();
  if (!page || !data) return;
  const field = input.dataset.bountyField;
  if (!field) return;
  if (field === 'description') page.description = String(input.value || '').trim();
  else data[field] = input.type === 'range' || input.type === 'number'
    ? Number(input.value) || 0
    : String(input.value || '').trim();
  page.bountyFile = sanitizeBountyFileData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineBountyListRow(listName) {
  const data = getInlineBountyDraft();
  const config = getBountyEditorListConfig(listName);
  if (!data || !config) return;
  data[listName] = Array.isArray(data[listName]) ? data[listName] : [];
  data[listName].push(deepClone(config.fallback));
  getInlineDraftPage().bountyFile = sanitizeBountyFileData(data);
  renderPage(currentPage, 0);
}

function removeInlineBountyListRow(listName, index) {
  const data = getInlineBountyDraft();
  if (!data || !Array.isArray(data[listName])) return;
  data[listName].splice(index, 1);
  getInlineDraftPage().bountyFile = sanitizeBountyFileData(data);
  renderPage(currentPage, 0);
}

function updateInlineBountyListField(input) {
  const data = getInlineBountyDraft();
  if (!data) return;
  const listName = input.dataset.bountyList;
  const field = input.dataset.bountyListField;
  const index = Number(input.dataset.bountyIndex || -1);
  if (!listName || !field || index < 0) return;
  const config = getBountyEditorListConfig(listName);
  data[listName] = Array.isArray(data[listName]) ? data[listName] : [];
  const row = data[listName][index] || deepClone(config.fallback);
  row[field] = input.type === 'range' || input.type === 'number'
    ? Number(input.value) || 0
    : String(input.value || '').trim();
  data[listName][index] = row;
  getInlineDraftPage().bountyFile = sanitizeBountyFileData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineBountyRange(label, field, value, min = 0, max = 100) {
  return `
    <div class="inline-edit-field">
      <span class="inline-edit-label">${escapeHtml(label)} <span>${escapeHtml(value)}%</span></span>
      <input class="inline-size-range" type="range" min="${escapeHtml(min)}" max="${escapeHtml(max)}" step="1" data-inline-action="update-bounty-field" data-bounty-field="${escapeHtml(field)}" value="${escapeHtml(value)}">
    </div>`;
}

function buildInlineBountyRowRange(listName, index, label, field, value, min = 0, max = 100) {
  return `
    <div class="inline-edit-field">
      <span class="inline-edit-label">${escapeHtml(label)} <span>${escapeHtml(value)}%</span></span>
      <input class="inline-size-range" type="range" min="${escapeHtml(min)}" max="${escapeHtml(max)}" step="1" data-inline-action="update-bounty-list-field" data-bounty-list="${escapeHtml(listName)}" data-bounty-index="${escapeHtml(index)}" data-bounty-list-field="${escapeHtml(field)}" value="${escapeHtml(value)}">
    </div>`;
}

function buildInlineBountyListRows(items = [], listName = 'charges') {
  const config = getBountyEditorListConfig(listName);
  const rows = Array.isArray(items) && items.length ? items : [];
  if (!rows.length) return '<div class="inline-placeholder-note">Noch keine Einträge vorhanden.</div>';
  return rows.map((item, index) => `
    <div class="inline-profile-card">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">${escapeHtml(config.label)} ${index + 1}</div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-bounty-list-row" data-bounty-list="${escapeHtml(listName)}" data-bounty-index="${escapeHtml(index)}">Löschen</button>
      </div>
      <div class="inline-edit-grid">
        ${config.fields.map(([field, placeholder, type]) => {
          const attrs = `data-inline-action="update-bounty-list-field" data-bounty-list="${escapeHtml(listName)}" data-bounty-index="${escapeHtml(index)}" data-bounty-list-field="${escapeHtml(field)}"`;
          const value = escapeHtml(item?.[field] || '');
          if (type === 'textarea') {
            return `<div class="inline-edit-field wide"><span class="inline-edit-label">${escapeHtml(placeholder)}</span><textarea class="inline-edit-textarea" ${attrs}>${value}</textarea></div>`;
          }
          const extra = type === 'number' ? ' min="0" max="5" step="1"' : '';
          return `<div class="inline-edit-field"><span class="inline-edit-label">${escapeHtml(placeholder)}</span><input class="inline-edit-input" type="${escapeHtml(type)}"${extra} ${attrs} value="${value}"></div>`;
        }).join('')}
        ${config.imageFields ? `
          ${buildInlineBountyRowRange(listName, index, 'Bildgröße', 'imageScale', item.imageScale || 100, 50, 220)}
          ${buildInlineBountyRowRange(listName, index, 'Bild X', 'imageX', item.imageX || 50)}
          ${buildInlineBountyRowRange(listName, index, 'Bild Y', 'imageY', item.imageY || 50)}
        ` : ''}
      </div>
    </div>`).join('');
}

function buildInlineBountyListBlock(data, listName) {
  const config = getBountyEditorListConfig(listName);
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">${escapeHtml(config.label)}</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-bounty-list-row" data-bounty-list="${escapeHtml(listName)}">+ ${escapeHtml(config.addLabel)}</button>
      </div>
      <div class="inline-edit-grid single">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-bounty-field" data-bounty-field="${escapeHtml(config.titleField)}" value="${escapeHtml(data[config.titleField] || '')}">
        </div>
      </div>
      <div class="inline-profile-card-editor">${buildInlineBountyListRows(data[listName], listName)}</div>
    </div>`;
}

function buildInlineBountyFileEditor(page) {
  const data = sanitizeBountyFileData(page?.bountyFile || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Kopfgeldakte</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Beschreibung</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-bounty-field" data-bounty-field="description">${escapeHtml(page.description || '')}</textarea>
        </div>
        ${[
          ['Aktenüberschrift', 'archiveTitle', 'text'],
          ['Unterzeile', 'archiveSubtitle', 'text'],
          ['Regionales Banner', 'regionalBanner', 'url'],
          ['Hintergrundbild', 'backgroundImage', 'url'],
          ['Portraitbild', 'portraitImage', 'url'],
          ['Wachssiegel', 'sealImage', 'url'],
          ['Münzen-Icon', 'coinImage', 'url'],
          ['Name-Label', 'nameLabel', 'text'],
          ['Name', 'targetName', 'text'],
          ['Alias-Label', 'aliasesLabel', 'text'],
          ['Aliasnamen', 'aliases', 'text'],
          ['Status-Label', 'statusLabel', 'text'],
          ['Status', 'status', 'text'],
          ['Statusnotiz', 'statusNote', 'text'],
          ['Gefahrentext', 'threatText', 'text'],
          ['Kopfgeld-Label', 'bountyLabel', 'text'],
          ['Kopfgeld', 'bountyAmount', 'text'],
          ['Währung', 'bountyCurrency', 'text'],
          ['Beschreibung-Icon', 'descriptionIcon', 'url'],
          ['Verbindungen-Überschrift', 'connectionsTitle', 'text'],
          ['Fraktion-Titel', 'factionTitle', 'text'],
          ['Fraktionsbanner', 'factionBanner', 'url'],
          ['Fraktion / Bande', 'factionName', 'text'],
          ['Footer', 'footer', 'text']
        ].map(([label, field, type]) => `
          <div class="inline-edit-field${field === 'aliases' ? ' wide' : ''}">
            <span class="inline-edit-label">${escapeHtml(label)}</span>
            <input class="inline-edit-input" type="${escapeHtml(type)}" data-inline-action="update-bounty-field" data-bounty-field="${escapeHtml(field)}" value="${escapeHtml(data[field] || '')}">
          </div>`).join('')}
        <div class="inline-edit-field">
          <span class="inline-edit-label">Gefahrenstufe</span>
          <input class="inline-edit-input" type="number" min="1" max="5" step="1" data-inline-action="update-bounty-field" data-bounty-field="threatLevel" value="${escapeHtml(data.threatLevel)}">
        </div>
        ${buildInlineBountyRange('Banner-Größe', 'regionalBannerScale', data.regionalBannerScale, 50, 220)}
        ${buildInlineBountyRange('Banner X', 'regionalBannerX', data.regionalBannerX)}
        ${buildInlineBountyRange('Banner Y', 'regionalBannerY', data.regionalBannerY)}
        ${buildInlineBountyRange('Portrait-Größe', 'portraitScale', data.portraitScale, 50, 220)}
        ${buildInlineBountyRange('Portrait X', 'portraitX', data.portraitX)}
        ${buildInlineBountyRange('Portrait Y', 'portraitY', data.portraitY)}
        ${buildInlineBountyRange('Siegel-Größe', 'sealScale', data.sealScale, 50, 180)}
        ${buildInlineBountyRange('Siegel X', 'sealX', data.sealX)}
        ${buildInlineBountyRange('Siegel Y', 'sealY', data.sealY)}
        ${buildInlineBountyRange('Münzen-Größe', 'coinScale', data.coinScale, 50, 180)}
        ${buildInlineBountyRange('Münze X', 'coinX', data.coinX)}
        ${buildInlineBountyRange('Münze Y', 'coinY', data.coinY)}
        ${buildInlineBountyRange('Fraktionsbanner-Größe', 'factionBannerScale', data.factionBannerScale, 50, 220)}
        ${buildInlineBountyRange('Fraktionsbanner X', 'factionBannerX', data.factionBannerX)}
        ${buildInlineBountyRange('Fraktionsbanner Y', 'factionBannerY', data.factionBannerY)}
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Übergabehinweis</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-bounty-field" data-bounty-field="handoverNote">${escapeHtml(data.handoverNote)}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Beschreibung - Zusatztext</span>
          <textarea class="inline-edit-textarea" data-inline-action="update-bounty-field" data-bounty-field="descriptionNote">${escapeHtml(data.descriptionNote)}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Fraktionstext</span>
          <textarea class="inline-edit-textarea" data-inline-action="update-bounty-field" data-bounty-field="factionText">${escapeHtml(data.factionText)}</textarea>
        </div>
      </div>
    </div>
    ${['charges', 'traits', 'descriptionRows', 'companions', 'sightings', 'allies', 'enemies', 'supporters', 'dangerProfiles'].map(listName => buildInlineBountyListBlock(data, listName)).join('')}`;
}
