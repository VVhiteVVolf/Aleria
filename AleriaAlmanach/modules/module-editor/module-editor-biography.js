let _biographyAbilityIconTarget = null;

function buildBiographyAbilityIconField(item, index, mode) {
  const iconInputAttrs = mode === 'inline'
    ? `data-inline-action="update-biography-ability-field" data-biography-ability-index="${index}" data-biography-ability-field="icon"`
    : 'data-module-editor-action="sync-json-preview"';
  const pickerAttrs = mode === 'inline'
    ? `data-inline-action="pick-biography-ability-icon" data-biography-ability-index="${index}"`
    : 'data-module-editor-action="pick-biography-ability-icon"';
  return `
      <span class="biography-ability-icon-field">
        <input class="inline-edit-input ${mode === 'module' ? 'me-biography-ability-icon' : ''}" type="text" value="${escapeHtml(item.icon || '')}" placeholder="Symbol oder Bild-URL" ${iconInputAttrs}>
        <button class="module-editor-mini-btn biography-ability-icon-picker" type="button" ${pickerAttrs} title="Icon-Verzeichnis oeffnen" aria-label="Icon-Verzeichnis oeffnen">Icon</button>
      </span>`;
}

function openBiographyAbilityIconPicker(button) {
  const row = button?.closest?.('.biography-edit-row');
  const target = row?.querySelector?.('.me-biography-ability-icon, [data-biography-ability-field="icon"]');
  if (!target) return;
  _biographyAbilityIconTarget = target;
  if (typeof openIconDirectory === 'function') {
    openIconDirectory();
    return;
  }
  _biographyAbilityIconTarget = null;
}

function handleBiographyAbilityIconSelected(event) {
  const target = _biographyAbilityIconTarget;
  const src = String(event?.detail?.src || '').trim();
  if (!target || !target.isConnected || !src) {
    _biographyAbilityIconTarget = null;
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
  _biographyAbilityIconTarget = null;
}

function buildBiographyAbilityRows(abilities = [], mode = 'module') {
  const rows = (Array.isArray(abilities) && abilities.length ? abilities : [{ icon: '*', title: '', detail: '' }]);
  return rows.map((item, index) => `
    <div class="biography-edit-row ${mode === 'inline' ? '' : 'module-biography-ability-row'}" ${mode === 'inline' ? `data-biography-ability-index="${index}"` : ''}>
      ${buildBiographyAbilityIconField(item, index, mode)}
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-ability-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Titel" ${mode === 'inline' ? `data-inline-action="update-biography-ability-field" data-biography-ability-index="${index}" data-biography-ability-field="title"` : 'data-module-editor-action="sync-json-preview"'}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-ability-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Beschreibung" ${mode === 'inline' ? `data-inline-action="update-biography-ability-field" data-biography-ability-index="${index}" data-biography-ability-field="detail"` : 'data-module-editor-action="sync-json-preview"'}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-biography-ability" data-biography-ability-index="${index}"` : 'data-module-editor-action="remove-biography-ability-row"'}>Loeschen</button>
    </div>`).join('');
}

document.addEventListener('almanach-icon-selected', handleBiographyAbilityIconSelected);

function buildBiographySectionRows(sections = [], mode = 'module') {
  const rows = Array.isArray(sections) ? sections : [];
  return rows.map((item, index) => `
    <div class="biography-edit-section-row ${mode === 'inline' ? '' : 'module-biography-section-row'}" ${mode === 'inline' ? `data-biography-section-index="${index}"` : ''}>
      <select class="inline-edit-input ${mode === 'module' ? 'me-biography-section-position' : ''}" ${mode === 'inline' ? `data-inline-action="update-biography-section-field" data-biography-section-index="${index}" data-biography-section-field="position"` : ''}>
        <option value="afterIntro"${item.position !== 'afterWorks' ? ' selected' : ''}>Nach Haupttext</option>
        <option value="afterWorks"${item.position === 'afterWorks' ? ' selected' : ''}>Nach Abschnitt 3</option>
      </select>
      <select class="inline-edit-input ${mode === 'module' ? 'me-biography-section-mode' : ''}" ${mode === 'inline' ? `data-inline-action="update-biography-section-field" data-biography-section-index="${index}" data-biography-section-field="mode"` : ''}>
        <option value="text"${item.mode !== 'list' ? ' selected' : ''}>Text</option>
        <option value="list"${item.mode === 'list' ? ' selected' : ''}>Bulletliste</option>
      </select>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-section-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Ueberschrift" ${mode === 'inline' ? `data-inline-action="update-biography-section-field" data-biography-section-index="${index}" data-biography-section-field="title"` : ''}>
      <textarea class="inline-edit-textarea ${mode === 'module' ? 'me-biography-section-text' : ''}" placeholder="Text oder je Zeile ein Listenpunkt" ${mode === 'inline' ? `data-inline-action="update-biography-section-field" data-biography-section-index="${index}" data-biography-section-field="text"` : ''}>${escapeHtml(item.text || '')}</textarea>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-biography-section" data-biography-section-index="${index}"` : 'data-module-editor-action="remove-biography-section-row"'}>Loeschen</button>
    </div>`).join('');
}

function buildBiographyConnectionRows(connections = [], mode = 'module') {
  const rows = (Array.isArray(connections) && connections.length ? connections : [{ image: '', name: '', detail: '' }]);
  return rows.map((item, index) => `
    <div class="biography-edit-row connection ${mode === 'inline' ? '' : 'module-biography-connection-row'}" ${mode === 'inline' ? `data-biography-connection-index="${index}"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-image' : ''}" type="url" value="${escapeHtml(item.image || '')}" placeholder="Imgur-Bild" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="image"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-name' : ''}" type="text" value="${escapeHtml(item.name || '')}" placeholder="Name" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="name"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Beziehung" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-biography-connection" data-biography-connection-index="${index}"` : 'data-module-editor-action="remove-biography-connection-row"'}>Löschen</button>
    </div>`).join('');
}

function buildModuleBiographyStatRows(stats = []) {
  const rows = Array.isArray(stats) && stats.length ? stats : [['Neuer Eintrag', 'Wert']];
  return rows.map(([label, value]) => `
    <div class="inline-stat-row module-biography-stat-row">
      <input class="inline-edit-input me-biography-stat-label" type="text" value="${escapeHtml(label || '')}" placeholder="Label">
      <input class="inline-edit-input me-biography-stat-value" type="text" value="${escapeHtml(value || '')}" placeholder="Wert">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-biography-stat-row">Löschen</button>
    </div>`).join('');
}

let _biographyDocumentIconTarget = null;

function buildBiographyDocumentIconField(item, index, mode) {
  const iconInputAttrs = mode === 'inline'
    ? `data-inline-action="update-biography-document-field" data-biography-document-index="${index}" data-biography-document-field="icon"`
    : 'data-module-editor-action="sync-json-preview"';
  const pickerAttrs = mode === 'inline'
    ? `data-inline-action="pick-biography-document-icon" data-biography-document-index="${index}"`
    : 'data-module-editor-action="pick-biography-document-icon"';
  return `
      <span class="biography-ability-icon-field">
        <input class="inline-edit-input ${mode === 'module' ? 'me-biography-document-icon' : ''}" type="text" value="${escapeHtml(item.icon || '')}" placeholder="Icon-URL oder Zeichen" ${iconInputAttrs}>
        <button class="module-editor-mini-btn biography-ability-icon-picker" type="button" ${pickerAttrs} title="Icon-Verzeichnis oeffnen" aria-label="Icon-Verzeichnis oeffnen">Icon</button>
      </span>`;
}

function openBiographyDocumentIconPicker(button) {
  const row = button?.closest?.('.biography-edit-row');
  const target = row?.querySelector?.('.me-biography-document-icon, [data-biography-document-field="icon"]');
  if (!target) return;
  _biographyDocumentIconTarget = target;
  if (typeof openIconDirectory === 'function') {
    openIconDirectory();
    return;
  }
  _biographyDocumentIconTarget = null;
}

function handleBiographyDocumentIconSelected(event) {
  const target = _biographyDocumentIconTarget;
  const src = String(event?.detail?.src || '').trim();
  if (!target || !target.isConnected || !src) {
    _biographyDocumentIconTarget = null;
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
  _biographyDocumentIconTarget = null;
}

document.addEventListener('almanach-icon-selected', handleBiographyDocumentIconSelected);

function buildBiographyDocumentRows(documents = [], mode = 'module') {
  const rows = (Array.isArray(documents) && documents.length ? documents : [{ icon: '', title: '', text: '', link: '' }]);
  return rows.map((item, index) => `
    <div class="biography-edit-row document ${mode === 'inline' ? 'inline-biography-document-row' : 'module-biography-document-row'}">
      ${buildBiographyDocumentIconField(item, index, mode)}
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-document-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Überschrift" ${mode === 'inline' ? `data-inline-action="update-biography-document-field" data-biography-document-index="${index}" data-biography-document-field="title"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-document-text' : ''}" type="text" value="${escapeHtml(item.text || '')}" placeholder="Untertext" ${mode === 'inline' ? `data-inline-action="update-biography-document-field" data-biography-document-index="${index}" data-biography-document-field="text"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-document-link' : ''}" type="url" value="${escapeHtml(item.link || '')}" placeholder="Link zur Seite / URL (optional)" ${mode === 'inline' ? `data-inline-action="update-biography-document-field" data-biography-document-index="${index}" data-biography-document-field="link"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-biography-document" data-biography-document-index="${index}"` : 'data-module-editor-action="remove-biography-document-row"'}>Löschen</button>
    </div>`).join('');
}

function collectModuleBiographyStats(card) {
  return Array.from(card.querySelectorAll('.module-biography-stat-row'))
    .map(row => [
      getTrimmedFormValue(row, '.me-biography-stat-label'),
      getTrimmedFormValue(row, '.me-biography-stat-value')
    ])
    .filter(([label, value]) => label || value);
}

function collectModuleBiographyAbilities(card) {
  return Array.from(card.querySelectorAll('.module-biography-ability-row')).map(row => ({
    icon: getTrimmedFormValue(row, '.me-biography-ability-icon'),
    title: getTrimmedFormValue(row, '.me-biography-ability-title'),
    detail: getTrimmedFormValue(row, '.me-biography-ability-detail')
  })).filter(item => item.icon || item.title || item.detail);
}

function collectModuleBiographySections(card) {
  return Array.from(card.querySelectorAll('.module-biography-section-row')).map(row => ({
    position: getFormValue(row, '.me-biography-section-position'),
    mode: getFormValue(row, '.me-biography-section-mode'),
    title: getTrimmedFormValue(row, '.me-biography-section-title'),
    text: getTrimmedFormValue(row, '.me-biography-section-text')
  })).filter(item => item.title || item.text);
}

function collectModuleBiographyConnections(card) {
  return Array.from(card.querySelectorAll('.module-biography-connection-row')).map(row => ({
    image: getTrimmedFormValue(row, '.me-biography-connection-image'),
    name: getTrimmedFormValue(row, '.me-biography-connection-name'),
    detail: getTrimmedFormValue(row, '.me-biography-connection-detail')
  })).filter(item => item.image || item.name || item.detail);
}

function collectModuleBiographyDocuments(card) {
  return Array.from(card.querySelectorAll('.module-biography-document-row')).map(row => ({
    icon: getTrimmedFormValue(row, '.me-biography-document-icon'),
    title: getTrimmedFormValue(row, '.me-biography-document-title'),
    text: getTrimmedFormValue(row, '.me-biography-document-text'),
    link: getTrimmedFormValue(row, '.me-biography-document-link')
  })).filter(item => item.icon || item.title || item.text || item.link);
}

function buildBiographyConnectionRows(connections = [], mode = 'module') {
  const rows = (Array.isArray(connections) && connections.length ? connections : [{ type: 'connection', image: '', imageFormat: 'portrait', name: '', detail: '' }]);
  return rows.map((item, index) => {
    if (item.type === 'heading') {
      return `
    <div class="biography-edit-row connection-heading ${mode === 'inline' ? '' : 'module-biography-connection-row'}" ${mode === 'inline' ? `data-biography-connection-index="${index}"` : ''} data-biography-connection-type="heading">
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Ueberschrift" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="title"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Unterzeile optional" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-biography-connection" data-biography-connection-index="${index}"` : 'data-module-editor-action="remove-biography-connection-row"'}>Loeschen</button>
    </div>`;
    }
    return `
    <div class="biography-edit-row connection ${mode === 'inline' ? '' : 'module-biography-connection-row'}" ${mode === 'inline' ? `data-biography-connection-index="${index}"` : ''} data-biography-connection-type="connection">
      <input type="hidden" class="me-biography-connection-title" value="">
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-image' : ''}" type="url" value="${escapeHtml(item.image || '')}" placeholder="Imgur-Bild" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="image"` : ''}>
      <select class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-image-format' : ''}" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="imageFormat"` : ''}>
        <option value="portrait"${item.imageFormat !== 'landscape' && item.imageFormat !== 'square' ? ' selected' : ''}>Hochformat</option>
        <option value="landscape"${item.imageFormat === 'landscape' ? ' selected' : ''}>Querformat</option>
        <option value="square"${item.imageFormat === 'square' ? ' selected' : ''}>Quadrat</option>
      </select>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-name' : ''}" type="text" value="${escapeHtml(item.name || '')}" placeholder="Name" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="name"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Beziehung" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-biography-connection" data-biography-connection-index="${index}"` : 'data-module-editor-action="remove-biography-connection-row"'}>Loeschen</button>
    </div>`;
  }).join('');
}

function collectModuleBiographyConnections(card) {
  return Array.from(card.querySelectorAll('.module-biography-connection-row')).map(row => ({
    type: row.dataset.biographyConnectionType === 'heading' ? 'heading' : 'connection',
    title: getTrimmedFormValue(row, '.me-biography-connection-title'),
    image: getTrimmedFormValue(row, '.me-biography-connection-image'),
    imageFormat: getFormValue(row, '.me-biography-connection-image-format'),
    name: getTrimmedFormValue(row, '.me-biography-connection-name'),
    detail: getTrimmedFormValue(row, '.me-biography-connection-detail')
  })).filter(item => item.type === 'heading' ? item.title || item.detail : item.image || item.name || item.detail);
}

function addModuleBiographyStatRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = button.closest('.module-editor-field')?.querySelector('.module-biography-stats')
    || pageCard?.querySelector('.module-biography-stats');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildModuleBiographyStatRows([['Neuer Eintrag', 'Wert']]));
  syncModuleJsonPreview();
}

function removeModuleBiographyStatRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-biography-stat-row');
  const wrap = button.closest('.module-editor-field')?.querySelector('.module-biography-stats')
    || pageCard?.querySelector('.module-biography-stats');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-biography-stat-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Infozeilen vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleBiographyAbilityRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-biography-abilities');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildBiographyAbilityRows([{ icon: '*', title: 'Neuer Punkt', detail: '' }], 'module'));
  syncModuleJsonPreview();
}

function removeModuleBiographyAbilityRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-biography-ability-row');
  const wrap = pageCard?.querySelector('.module-biography-abilities');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-biography-ability-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Punkte vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleBiographySectionRow(button, position = 'afterIntro') {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-biography-sections');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildBiographySectionRows([{
    position: position === 'afterWorks' ? 'afterWorks' : 'afterIntro',
    mode: 'text',
    title: 'Neue Ueberschrift',
    text: ''
  }], 'module'));
  syncModuleJsonPreview();
}

function removeModuleBiographySectionRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-biography-section-row');
  const wrap = pageCard?.querySelector('.module-biography-sections');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-biography-section-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Zusatzabschnitte vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleBiographyDocumentRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-biography-documents');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildBiographyDocumentRows([{ icon: '', text: 'Neuer Eintrag', link: '' }], 'module'));
  syncModuleJsonPreview();
}

function removeModuleBiographyDocumentRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-biography-document-row');
  const wrap = pageCard?.querySelector('.module-biography-documents');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-biography-document-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Dokumente vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleBiographyConnectionRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-biography-connections');
  if (!pageCard || !wrap) return;
  const kind = button.dataset.biographyConnectionKind === 'heading' ? 'heading' : 'connection';
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildBiographyConnectionRows([kind === 'heading'
    ? { type: 'heading', title: 'Neue Gruppe', detail: '' }
    : { type: 'connection', image: '', imageFormat: 'portrait', name: 'Neue Verbindung', detail: '' }
  ], 'module'));
  syncModuleJsonPreview();
}

function removeModuleBiographyConnectionRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-biography-connection-row');
  const wrap = pageCard?.querySelector('.module-biography-connections');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-biography-connection-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Verbindungen vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function buildBiographyModuleEditorFields(page) {
  const biography = sanitizeBiographyData(page?.biography || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'biography' ? ' visible' : ''}" data-page-type="biography">
        <div class="module-editor-grid">
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
            <label>Biografie-Überschrift</label>
            <input type="text" class="me-biography-title" value="${escapeHtml(biography.biographyTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Linke Inhaltsbreite (%)</label>
            <input type="number" class="me-biography-side-width" min="35" max="100" step="1" value="${escapeHtml(biography.sideWidth)}">
            <div class="module-editor-help">Steuert Bild, Infotabelle und Zitatbox gemeinsam.</div>
          </div>
          <div class="module-editor-field">
            <label>Fähigkeiten-Überschrift</label>
            <input type="text" class="me-biography-abilities-title" value="${escapeHtml(biography.abilitiesTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Biografie</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-biography-text">${escapeHtml(biography.biographyText || page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Fähigkeiten & Spezialgebiete</label>
            <div class="module-editor-inline" style="justify-content:flex-end;">
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-ability-row">+ Punkt</button>
            </div>
            <div class="biography-edit-list module-biography-abilities">
              ${biography.abilities.length ? buildBiographyAbilityRows(biography.abilities, 'module') : '<div class="inline-placeholder-note">Noch keine Punkte vorhanden.</div>'}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Geschichte-Überschrift</label>
            <input type="text" class="me-biography-history-title" value="${escapeHtml(biography.historyTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Werke-Überschrift</label>
            <input type="text" class="me-biography-works-title" value="${escapeHtml(biography.worksTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Geschichte & Wirkung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-biography-history-text">${escapeHtml(biography.historyText)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Bekannte Werke</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="biographyWorks">+ Werk</button>
            </div>
            ${buildModuleSimpleLineList(biography.works, 'biographyWorks')}
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Zusatzabschnitte im Hauptbereich</label>
              <span>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-section-row" data-biography-section-position="afterIntro">+ Nach Haupttext</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-section-row" data-biography-section-position="afterWorks">+ Nach Abschnitt 3</button>
              </span>
            </div>
            <div class="module-editor-help">Fuer Textbloecke oder Bulletlisten zwischen den Hauptreitern der Biographie.</div>
            <div class="biography-edit-list module-biography-sections">
              ${biography.extraSections.length ? buildBiographySectionRows(biography.extraSections, 'module') : '<div class="inline-placeholder-note">Noch keine Zusatzabschnitte vorhanden.</div>'}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Trivia-Überschrift</label>
            <input type="text" class="me-biography-trivia-title" value="${escapeHtml(biography.triviaTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Zitate-Überschrift</label>
            <input type="text" class="me-biography-quotes-title" value="${escapeHtml(biography.quotesTitle)}">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Trivia</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="biographyTrivia">+ Trivia</button>
            </div>
            ${buildModuleSimpleLineList(biography.trivia, 'biographyTrivia')}
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Zitate</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="biographyQuotes">+ Zitat</button>
            </div>
            ${buildModuleSimpleLineList(biography.quotes, 'biographyQuotes')}
          </div>
          <div class="module-editor-field">
            <label>Verbindungen-Überschrift</label>
            <input type="text" class="me-biography-connections-title" value="${escapeHtml(biography.connectionsTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Verbindungsportrait-Hoehe (px)</label>
            <input type="number" class="me-biography-connection-portrait-height" min="44" max="140" step="1" value="${escapeHtml(biography.connectionPortraitHeight)}">
            <div class="module-editor-help">Macht die kleinen Portraitbilder in den Verbindungen hoeher oder kompakter.</div>
          </div>
          <div class="module-editor-field">
            <label>Verbindungstext-Versatz <span>${escapeHtml(biography.connectionTextOffset)}px</span></label>
            <input class="module-size-range me-biography-connection-text-offset" type="range" min="0" max="80" step="1" value="${escapeHtml(biography.connectionTextOffset)}" data-module-editor-action="update-range-percent-label">
            <div class="module-editor-help">Rueckt den Text in den Verbindungen nach rechts.</div>
          </div>
          <div class="module-editor-field">
            <label>Besitz-/Dokumente-Überschrift</label>
            <input type="text" class="me-biography-documents-title" value="${escapeHtml(biography.documentsTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Verbindungen</label>
            <div class="module-editor-inline" style="justify-content:space-between;">
              <span class="module-editor-help">Bild, Name und Beziehung der verbundenen Person.</span>
              <span>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-connection-row" data-biography-connection-kind="heading">+ Trenner</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-connection-row" data-biography-connection-kind="connection">+ Verbindung</button>
              </span>
            </div>
            <div class="biography-edit-list module-biography-connections">
              ${buildBiographyConnectionRows(biography.connections, 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>${escapeHtml(biography.documentsTitle || 'Eigentum & Besitz')}</label>
            <div class="module-editor-inline" style="justify-content:space-between;">
              <span class="module-editor-help">Icon per Bild-URL oder Zeichen; der optionale Link öffnet den Eintrag in einer neuen Seite.</span>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-document-row">+ Eintrag</button>
            </div>
            <div class="biography-edit-list module-biography-documents">
              ${buildBiographyDocumentRows(biography.documents, 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Zitatbox links</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-biography-quote small">${escapeHtml(page?.quote || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Zitat von</label>
            <input type="text" class="me-biography-quote-by" value="${escapeHtml(page?.quoteBy || '')}">
          </div>
          <div class="module-editor-field wide">
            <label>Fußzeile</label>
            <input type="text" class="me-biography-footer" value="${escapeHtml(biography.footer)}">
          </div>
        </div>
      </div>`;
}

function collectBiographyModuleEditorPage(card, page) {
  page.biographyPage = true;
  page.description = getTrimmedFormValue(card, '.me-biography-text');
  page.stats = collectModuleBiographyStats(card.querySelector('[data-page-type="biography"]') || card);
  page.quote = getTrimmedFormValue(card, '.me-biography-quote');
  page.quoteBy = getTrimmedFormValue(card, '.me-biography-quote-by');
  page.biography = sanitizeBiographyData({
    biographyTitle: getTrimmedFormValue(card, '.me-biography-title'),
    biographyText: getTrimmedFormValue(card, '.me-biography-text'),
    sideWidth: getFormValue(card, '.me-biography-side-width'),
    abilitiesTitle: getTrimmedFormValue(card, '.me-biography-abilities-title'),
    abilities: collectModuleBiographyAbilities(card),
    extraSections: collectModuleBiographySections(card),
    historyTitle: getTrimmedFormValue(card, '.me-biography-history-title'),
    historyText: getTrimmedFormValue(card, '.me-biography-history-text'),
    worksTitle: getTrimmedFormValue(card, '.me-biography-works-title'),
    works: collectModuleSimpleLineRows(card, 'biographyWorks'),
    triviaTitle: getTrimmedFormValue(card, '.me-biography-trivia-title'),
    trivia: collectModuleSimpleLineRows(card, 'biographyTrivia'),
    quotesTitle: getTrimmedFormValue(card, '.me-biography-quotes-title'),
    quotes: collectModuleSimpleLineRows(card, 'biographyQuotes'),
    connectionsTitle: getTrimmedFormValue(card, '.me-biography-connections-title'),
    connectionPortraitHeight: getFormValue(card, '.me-biography-connection-portrait-height'),
    connectionTextOffset: getFormValue(card, '.me-biography-connection-text-offset'),
    connections: collectModuleBiographyConnections(card),
    documentsTitle: getTrimmedFormValue(card, '.me-biography-documents-title'),
    documents: collectModuleBiographyDocuments(card),
    footer: getTrimmedFormValue(card, '.me-biography-footer')
  });
  return page;
}
