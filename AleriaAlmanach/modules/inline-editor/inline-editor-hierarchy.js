// Inline editor for the dedicated hierarchy / organisation chart template.

function getInlineHierarchyDataForEdit(page) {
  page.hierarchyPage = true;
  page.hierarchy = sanitizeHierarchyData(page.hierarchy || {});
  return page.hierarchy;
}

function updateInlineHierarchyField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineHierarchyDataForEdit(page);
  const field = input.dataset.hierarchyField;
  if (!field) return;
  data[field] = String(input.value || '').trim();
  page.hierarchy = sanitizeHierarchyData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineHierarchyDetail() {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineHierarchyDataForEdit(page);
  data.details.push({ icon: '*', label: 'Neuer Eintrag', value: 'Wert' });
  page.hierarchy = sanitizeHierarchyData(data);
  renderPage(currentPage, 0);
}

function removeInlineHierarchyDetail(index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineHierarchyDataForEdit(page);
  data.details.splice(index, 1);
  page.hierarchy = sanitizeHierarchyData(data);
  renderPage(currentPage, 0);
}

function updateInlineHierarchyDetailField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.hierarchyDetailIndex || -1);
  const field = input.dataset.hierarchyDetailField;
  if (index < 0 || !field) return;
  const data = getInlineHierarchyDataForEdit(page);
  data.details[index] = data.details[index] || { icon: '', label: '', value: '' };
  data.details[index][field] = String(input.value || '').trim();
  page.hierarchy = sanitizeHierarchyData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineHierarchyLevel() {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineHierarchyDataForEdit(page);
  data.levels.push({ label: '', nodes: [{ portrait: '', title: 'Neuer Rang', subtitle: '', text: '' }] });
  page.hierarchy = sanitizeHierarchyData(data);
  renderPage(currentPage, 0);
}

function addInlineHierarchyLevelAfter(index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineHierarchyDataForEdit(page);
  const insertIndex = Math.max(0, Math.min(data.levels.length, index + 1));
  data.levels.splice(insertIndex, 0, {
    label: '',
    nodes: [{ portrait: '', title: 'Neuer Unterrang', subtitle: '', text: '' }]
  });
  page.hierarchy = sanitizeHierarchyData(data);
  renderPage(currentPage, 0);
}

function removeInlineHierarchyLevel(index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineHierarchyDataForEdit(page);
  data.levels.splice(index, 1);
  page.hierarchy = sanitizeHierarchyData(data);
  renderPage(currentPage, 0);
}

function moveInlineHierarchyLevel(index, direction) {
  const page = getInlineDraftPage();
  if (!page || !direction) return;
  const data = getInlineHierarchyDataForEdit(page);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= data.levels.length) return;
  const [level] = data.levels.splice(index, 1);
  data.levels.splice(nextIndex, 0, level);
  page.hierarchy = sanitizeHierarchyData(data);
  renderPage(currentPage, 0);
}

function updateInlineHierarchyLevelField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.hierarchyLevelIndex || -1);
  if (index < 0) return;
  const data = getInlineHierarchyDataForEdit(page);
  data.levels[index] = data.levels[index] || { label: '', nodes: [] };
  data.levels[index].label = String(input.value || '').trim();
  page.hierarchy = sanitizeHierarchyData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineHierarchyNode(levelIndex) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineHierarchyDataForEdit(page);
  const level = data.levels[levelIndex];
  if (!level || level.nodes.length >= 4) return;
  level.nodes.push({ portrait: '', title: 'Neuer Rang', subtitle: '', text: '' });
  page.hierarchy = sanitizeHierarchyData(data);
  renderPage(currentPage, 0);
}

function removeInlineHierarchyNode(levelIndex, nodeIndex) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineHierarchyDataForEdit(page);
  const level = data.levels[levelIndex];
  if (!level) return;
  level.nodes.splice(nodeIndex, 1);
  if (!level.nodes.length) level.nodes.push({ portrait: '', title: 'Neuer Rang', subtitle: '', text: '' });
  page.hierarchy = sanitizeHierarchyData(data);
  renderPage(currentPage, 0);
}

function updateInlineHierarchyNodeField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const levelIndex = Number(input.dataset.hierarchyLevelIndex || -1);
  const nodeIndex = Number(input.dataset.hierarchyNodeIndex || -1);
  const field = input.dataset.hierarchyNodeField;
  if (levelIndex < 0 || nodeIndex < 0 || !field) return;
  const data = getInlineHierarchyDataForEdit(page);
  const level = data.levels[levelIndex] || { label: '', nodes: [] };
  const node = level.nodes[nodeIndex] || { portrait: '', title: '', subtitle: '', text: '' };
  node[field] = String(input.value || '').trim();
  level.nodes[nodeIndex] = node;
  data.levels[levelIndex] = level;
  page.hierarchy = sanitizeHierarchyData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineHierarchyDetailRows(details = []) {
  const rows = Array.isArray(details) ? details : [];
  return rows.length ? rows.map((row, index) => `
    <div class="inline-stat-row hierarchy-inline-detail-row">
      <input class="inline-edit-input" type="text" data-inline-action="update-hierarchy-detail-field" data-hierarchy-detail-index="${index}" data-hierarchy-detail-field="icon" value="${escapeHtml(row.icon || '')}" placeholder="Icon">
      <input class="inline-edit-input" type="text" data-inline-action="update-hierarchy-detail-field" data-hierarchy-detail-index="${index}" data-hierarchy-detail-field="label" value="${escapeHtml(row.label || '')}" placeholder="Label">
      <input class="inline-edit-input" type="text" data-inline-action="update-hierarchy-detail-field" data-hierarchy-detail-index="${index}" data-hierarchy-detail-field="value" value="${escapeHtml(row.value || '')}" placeholder="Wert">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-hierarchy-detail" data-hierarchy-detail-index="${index}">Loeschen</button>
    </div>`).join('') : '<div class="inline-placeholder-note">Noch keine Details vorhanden.</div>';
}

function buildInlineHierarchyNodeRows(level, levelIndex) {
  const nodes = Array.isArray(level.nodes) ? level.nodes : [];
  return nodes.map((node, nodeIndex) => `
    <div class="inline-profile-card hierarchy-inline-node-row">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Knoten ${nodeIndex + 1}</div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-hierarchy-node" data-hierarchy-level-index="${levelIndex}" data-hierarchy-node-index="${nodeIndex}">Loeschen</button>
      </div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Portrait-URL</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-hierarchy-node-field" data-hierarchy-level-index="${levelIndex}" data-hierarchy-node-index="${nodeIndex}" data-hierarchy-node-field="portrait" value="${escapeHtml(node.portrait || '')}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Titel / Rang</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-hierarchy-node-field" data-hierarchy-level-index="${levelIndex}" data-hierarchy-node-index="${nodeIndex}" data-hierarchy-node-field="title" value="${escapeHtml(node.title || '')}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Untertitel</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-hierarchy-node-field" data-hierarchy-level-index="${levelIndex}" data-hierarchy-node-index="${nodeIndex}" data-hierarchy-node-field="subtitle" value="${escapeHtml(node.subtitle || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Beschreibung</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-hierarchy-node-field" data-hierarchy-level-index="${levelIndex}" data-hierarchy-node-index="${nodeIndex}" data-hierarchy-node-field="text">${escapeHtml(node.text || '')}</textarea>
        </div>
      </div>
    </div>`).join('');
}

function buildInlineHierarchyLevelRows(levels = []) {
  const rows = Array.isArray(levels) ? levels : [];
  return rows.length ? rows.map((level, levelIndex) => `
    <div class="module-card-layout-block hierarchy-inline-level-row">
      <div class="module-card-layout-block-head">
        <div>
          <div class="inline-edit-kicker">Ebene ${levelIndex + 1}</div>
          <div class="module-editor-help">Bis zu 4 Knoten pro Ebene.</div>
        </div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-inline-action="move-hierarchy-level" data-hierarchy-level-index="${levelIndex}" data-hierarchy-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="move-hierarchy-level" data-hierarchy-level-index="${levelIndex}" data-hierarchy-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-hierarchy-node" data-hierarchy-level-index="${levelIndex}">+ Knoten</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-hierarchy-level-after" data-hierarchy-level-index="${levelIndex}">+ Ebene darunter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-hierarchy-level" data-hierarchy-level-index="${levelIndex}">Loeschen</button>
        </div>
      </div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Ebenenlabel</span>
        <input class="inline-edit-input" type="text" data-inline-action="update-hierarchy-level-field" data-hierarchy-level-index="${levelIndex}" value="${escapeHtml(level.label || '')}">
      </div>
      <div class="hierarchy-inline-node-list">
        ${buildInlineHierarchyNodeRows(level, levelIndex)}
      </div>
    </div>`).join('') : '<div class="inline-placeholder-note">Noch keine Ebenen vorhanden.</div>';
}

function buildInlineHierarchyEditor(page) {
  const data = getInlineHierarchyDataForEdit(page);
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Hierarchie-Akte</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Layoutmodus</span>
          <select class="inline-edit-select" data-inline-action="update-hierarchy-field" data-hierarchy-field="layoutMode">
            <option value="vertical"${data.layoutMode !== 'depth' ? ' selected' : ''}>Mockup / Stammbaum</option>
            <option value="depth"${data.layoutMode === 'depth' ? ' selected' : ''}>Tiefenlayout / Spalten</option>
          </select>
        </div>
        ${[
          ['eyebrow', 'Kopfzeile'],
          ['subtitle', 'Unterzeile'],
          ['centerLabel', 'Mitte oben'],
          ['emblem', 'Emblem-URL'],
          ['sideImage', 'Linkes Bild-URL'],
          ['organizationTitle', 'Organisationstitel'],
          ['motto', 'Motto'],
          ['detailsTitle', 'Details-Ueberschrift'],
          ['quoteLabel', 'Zitatlabel'],
          ['chartTitle', 'Baum-Ueberschrift'],
          ['footerNote', 'Footer-Notiz'],
          ['backLabel', 'Zurueck-Button'],
          ['printLabel', 'Druck-Button']
        ].map(([field, label]) => `
          <div class="inline-edit-field${field === 'footerNote' ? ' wide' : ''}">
            <span class="inline-edit-label">${escapeHtml(label)}</span>
            <input class="inline-edit-input" type="${field.toLowerCase().includes('image') || field === 'emblem' ? 'url' : 'text'}" data-inline-action="update-hierarchy-field" data-hierarchy-field="${escapeHtml(field)}" value="${escapeHtml(data[field] || '')}">
          </div>`).join('')}
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Beschreibung links</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-hierarchy-field" data-hierarchy-field="description">${escapeHtml(data.description || '')}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Zitat</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-hierarchy-field" data-hierarchy-field="quote">${escapeHtml(data.quote || '')}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Baum-Einleitung</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-hierarchy-field" data-hierarchy-field="chartIntro">${escapeHtml(data.chartIntro || '')}</textarea>
        </div>
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Details</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-hierarchy-detail">+ Detail</button>
      </div>
      <div class="inline-stat-editor">${buildInlineHierarchyDetailRows(data.details)}</div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Stammbaum-Ebenen</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-hierarchy-level">+ Ebene</button>
      </div>
      <div class="module-card-layout-blocks">${buildInlineHierarchyLevelRows(data.levels)}</div>
    </div>`;
}
