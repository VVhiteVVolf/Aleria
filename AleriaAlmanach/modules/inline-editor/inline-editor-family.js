// Inline editor for the family tree template.

function getInlineFamilyDataForEdit(page) {
  page.familyPage = true;
  page.family = sanitizeFamilyData(page.family || {});
  return page.family;
}

function getInlineFamilyTree(data, treeIndex = 0) {
  if (!Array.isArray(data.trees) || !data.trees.length) {
    data.trees = [{ label: data.chartTitle || 'Stammbaum', levels: Array.isArray(data.levels) ? data.levels : [], connections: [] }];
  }
  const safeIndex = Math.max(0, Math.min(data.trees.length - 1, Number(treeIndex) || 0));
  data.trees[safeIndex].levels = Array.isArray(data.trees[safeIndex].levels) ? data.trees[safeIndex].levels : [];
  data.trees[safeIndex].connections = Array.isArray(data.trees[safeIndex].connections) ? data.trees[safeIndex].connections : [];
  return data.trees[safeIndex];
}

function updateInlineFamilyField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  const field = input.dataset.familyField;
  if (!field) return;
  data[field] = String(input.value || '').trim();
  page.family = sanitizeFamilyData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineFamilyDetail() {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  data.details.push({ icon: '*', label: 'Neuer Eintrag', value: 'Wert' });
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function removeInlineFamilyDetail(index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  data.details.splice(index, 1);
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function updateInlineFamilyDetailField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.familyDetailIndex || -1);
  const field = input.dataset.familyDetailField;
  if (index < 0 || !field) return;
  const data = getInlineFamilyDataForEdit(page);
  data.details[index] = data.details[index] || { icon: '', label: '', value: '' };
  data.details[index][field] = String(input.value || '').trim();
  page.family = sanitizeFamilyData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineFamilyTree() {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  data.trees.push({ label: `Familienbaum ${data.trees.length + 1}`, levels: [{ label: '', nodes: [createDefaultFamilyNode(0)] }], connections: [] });
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function removeInlineFamilyTree(treeIndex) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  data.trees.splice(treeIndex, 1);
  if (!data.trees.length) data.trees.push({ label: 'Stammbaum', levels: [{ label: '', nodes: [createDefaultFamilyNode(0)] }], connections: [] });
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function updateInlineFamilyTreeField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  const tree = getInlineFamilyTree(data, Number(input.dataset.familyTreeIndex || 0));
  tree.label = String(input.value || '').trim();
  page.family = sanitizeFamilyData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineFamilyLevel(treeIndex = 0) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  getInlineFamilyTree(data, treeIndex).levels.push({ label: '', nodes: [createDefaultFamilyNode(0)] });
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function addInlineFamilyLevelAfter(treeIndex, index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  const tree = getInlineFamilyTree(data, treeIndex);
  tree.levels.splice(Math.max(0, Math.min(tree.levels.length, index + 1)), 0, { label: '', nodes: [createDefaultFamilyNode(0)] });
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function removeInlineFamilyLevel(treeIndex, index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  getInlineFamilyTree(data, treeIndex).levels.splice(index, 1);
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function moveInlineFamilyLevel(treeIndex, index, direction) {
  const page = getInlineDraftPage();
  if (!page || !direction) return;
  const data = getInlineFamilyDataForEdit(page);
  const tree = getInlineFamilyTree(data, treeIndex);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= tree.levels.length) return;
  const [level] = tree.levels.splice(index, 1);
  tree.levels.splice(nextIndex, 0, level);
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function updateInlineFamilyLevelField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const treeIndex = Number(input.dataset.familyTreeIndex || 0);
  const index = Number(input.dataset.familyLevelIndex || -1);
  if (index < 0) return;
  const data = getInlineFamilyDataForEdit(page);
  const tree = getInlineFamilyTree(data, treeIndex);
  tree.levels[index] = tree.levels[index] || { label: '', nodes: [] };
  tree.levels[index].label = String(input.value || '').trim();
  page.family = sanitizeFamilyData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineFamilyNode(treeIndex, levelIndex) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  const level = getInlineFamilyTree(data, treeIndex).levels[levelIndex];
  if (!level || level.nodes.length >= 8) return;
  level.nodes.push(createDefaultFamilyNode(level.nodes.length));
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function removeInlineFamilyNode(treeIndex, levelIndex, nodeIndex) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  const level = getInlineFamilyTree(data, treeIndex).levels[levelIndex];
  if (!level) return;
  level.nodes.splice(nodeIndex, 1);
  if (!level.nodes.length) level.nodes.push(createDefaultFamilyNode(0));
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function updateInlineFamilyNodeField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const treeIndex = Number(input.dataset.familyTreeIndex || 0);
  const levelIndex = Number(input.dataset.familyLevelIndex || -1);
  const nodeIndex = Number(input.dataset.familyNodeIndex || -1);
  const field = input.dataset.familyNodeField;
  if (levelIndex < 0 || nodeIndex < 0 || !field) return;
  const data = getInlineFamilyDataForEdit(page);
  const tree = getInlineFamilyTree(data, treeIndex);
  const level = tree.levels[levelIndex] || { label: '', nodes: [] };
  const node = level.nodes[nodeIndex] || createDefaultFamilyNode(nodeIndex);
  node[field] = String(input.value || '').trim();
  level.nodes[nodeIndex] = node;
  tree.levels[levelIndex] = level;
  page.family = sanitizeFamilyData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineFamilyConnection(treeIndex = 0) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  const tree = getInlineFamilyTree(data, treeIndex);
  const nodeIds = tree.levels.flatMap(level => (Array.isArray(level.nodes) ? level.nodes : []).map(node => node.id).filter(Boolean));
  tree.connections.push({ from: nodeIds[0] || '', to: nodeIds[1] || '', relationType: 'blood', label: 'Beziehung' });
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function removeInlineFamilyConnection(treeIndex, index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineFamilyDataForEdit(page);
  getInlineFamilyTree(data, treeIndex).connections.splice(index, 1);
  page.family = sanitizeFamilyData(data);
  renderPage(currentPage, 0);
}

function updateInlineFamilyConnectionField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const treeIndex = Number(input.dataset.familyTreeIndex || 0);
  const index = Number(input.dataset.familyConnectionIndex || -1);
  const field = input.dataset.familyConnectionField;
  if (index < 0 || !field) return;
  const data = getInlineFamilyDataForEdit(page);
  const tree = getInlineFamilyTree(data, treeIndex);
  tree.connections[index] = tree.connections[index] || { from: '', to: '', relationType: 'blood', label: '' };
  tree.connections[index][field] = String(input.value || '').trim();
  page.family = sanitizeFamilyData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineFamilyDetailRows(details = []) {
  return (Array.isArray(details) ? details : []).map((row, index) => `
    <div class="inline-stat-row family-inline-detail-row">
      <input class="inline-edit-input" type="text" data-inline-action="update-family-detail-field" data-family-detail-index="${index}" data-family-detail-field="icon" value="${escapeHtml(row.icon || '')}" placeholder="Icon">
      <input class="inline-edit-input" type="text" data-inline-action="update-family-detail-field" data-family-detail-index="${index}" data-family-detail-field="label" value="${escapeHtml(row.label || '')}" placeholder="Label">
      <input class="inline-edit-input" type="text" data-inline-action="update-family-detail-field" data-family-detail-index="${index}" data-family-detail-field="value" value="${escapeHtml(row.value || '')}" placeholder="Wert">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-family-detail" data-family-detail-index="${index}">Loeschen</button>
    </div>`).join('') || '<div class="inline-placeholder-note">Noch keine Details vorhanden.</div>';
}

function buildInlineFamilyNodeRows(level, treeIndex, levelIndex) {
  const nodes = Array.isArray(level.nodes) ? level.nodes : [];
  return nodes.map((node, nodeIndex) => `
    <div class="inline-profile-card family-inline-node-row">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Person ${nodeIndex + 1}</div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-family-node" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}" data-family-node-index="${nodeIndex}">Loeschen</button>
      </div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field"><span class="inline-edit-label">Karten-ID</span><input class="inline-edit-input" type="text" data-inline-action="update-family-node-field" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}" data-family-node-index="${nodeIndex}" data-family-node-field="id" value="${escapeHtml(node.id || '')}"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Familientyp</span><select class="inline-edit-select" data-inline-action="update-family-node-field" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}" data-family-node-index="${nodeIndex}" data-family-node-field="familyType">${buildFamilyTypeOptions(node.familyType)}</select></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Portrait-URL</span><input class="inline-edit-input" type="url" data-inline-action="update-family-node-field" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}" data-family-node-index="${nodeIndex}" data-family-node-field="portrait" value="${escapeHtml(node.portrait || '')}"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Name / Titel</span><input class="inline-edit-input" type="text" data-inline-action="update-family-node-field" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}" data-family-node-index="${nodeIndex}" data-family-node-field="title" value="${escapeHtml(node.title || '')}"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Beziehung / Rang</span><input class="inline-edit-input" type="text" data-inline-action="update-family-node-field" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}" data-family-node-index="${nodeIndex}" data-family-node-field="subtitle" value="${escapeHtml(node.subtitle || '')}"></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Beschreibung</span>${buildTextFormatToolbar()}<textarea class="inline-edit-textarea" data-inline-action="update-family-node-field" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}" data-family-node-index="${nodeIndex}" data-family-node-field="text">${escapeHtml(node.text || '')}</textarea></div>
      </div>
    </div>`).join('');
}

function buildInlineFamilyLevelRows(levels = [], treeIndex = 0) {
  const rows = Array.isArray(levels) ? levels : [];
  return rows.map((level, levelIndex) => `
    <div class="module-card-layout-block family-inline-level-row">
      <div class="module-card-layout-block-head">
        <div><div class="inline-edit-kicker">Generation / Ebene ${levelIndex + 1}</div><div class="module-editor-help">Bis zu 8 Personen pro Ebene.</div></div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-inline-action="move-family-level" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}" data-family-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="move-family-level" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}" data-family-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-family-node" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}">+ Person</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-family-level-after" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}">+ Ebene darunter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-family-level" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}">Loeschen</button>
        </div>
      </div>
      <div class="inline-edit-field"><span class="inline-edit-label">Ebenenlabel</span><input class="inline-edit-input" type="text" data-inline-action="update-family-level-field" data-family-tree-index="${treeIndex}" data-family-level-index="${levelIndex}" value="${escapeHtml(level.label || '')}"></div>
      <div class="family-inline-node-list">${buildInlineFamilyNodeRows(level, treeIndex, levelIndex)}</div>
    </div>`).join('') || '<div class="inline-placeholder-note">Noch keine Ebenen vorhanden.</div>';
}

function buildInlineFamilyConnectionRows(connections = [], treeIndex = 0) {
  return (Array.isArray(connections) ? connections : []).map((row, index) => `
    <div class="inline-stat-row family-inline-connection-row">
      <input class="inline-edit-input" type="text" data-inline-action="update-family-connection-field" data-family-tree-index="${treeIndex}" data-family-connection-index="${index}" data-family-connection-field="from" value="${escapeHtml(row.from || '')}" placeholder="Von ID">
      <input class="inline-edit-input" type="text" data-inline-action="update-family-connection-field" data-family-tree-index="${treeIndex}" data-family-connection-index="${index}" data-family-connection-field="to" value="${escapeHtml(row.to || '')}" placeholder="Zu ID">
      <input class="inline-edit-input" type="text" data-inline-action="update-family-connection-field" data-family-tree-index="${treeIndex}" data-family-connection-index="${index}" data-family-connection-field="relationType" value="${escapeHtml(row.relationType || 'blood')}" placeholder="Typ">
      <input class="inline-edit-input" type="text" data-inline-action="update-family-connection-field" data-family-tree-index="${treeIndex}" data-family-connection-index="${index}" data-family-connection-field="label" value="${escapeHtml(row.label || '')}" placeholder="Label">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-family-connection" data-family-tree-index="${treeIndex}" data-family-connection-index="${index}">Loeschen</button>
    </div>`).join('') || '<div class="inline-placeholder-note">Noch keine Verbindungen vorhanden.</div>';
}

function buildInlineFamilyTreeRows(trees = []) {
  const rows = Array.isArray(trees) && trees.length ? trees : [{ label: 'Stammbaum', levels: [], connections: [] }];
  return rows.map((tree, treeIndex) => `
    <div class="module-card-layout-block family-inline-tree-row">
      <div class="module-card-layout-block-head">
        <div><div class="inline-edit-kicker">Familienbaum ${treeIndex + 1}</div><div class="module-editor-help">Dieser Name erscheint als Reiter in der fertigen Ansicht.</div></div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-family-level" data-family-tree-index="${treeIndex}">+ Ebene</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-family-tree" data-family-tree-index="${treeIndex}">Baum loeschen</button>
        </div>
      </div>
      <div class="inline-edit-field"><span class="inline-edit-label">Reitername</span><input class="inline-edit-input" type="text" data-inline-action="update-family-tree-field" data-family-tree-index="${treeIndex}" value="${escapeHtml(tree.label || `Familienbaum ${treeIndex + 1}`)}"></div>
      <div class="module-card-layout-blocks">${buildInlineFamilyLevelRows(tree.levels, treeIndex)}</div>
      <div class="inline-edit-section">
        <div class="inline-edit-head"><div class="inline-edit-kicker">Verbindungslinien</div><button class="module-editor-mini-btn" type="button" data-inline-action="add-family-connection" data-family-tree-index="${treeIndex}">+ Verbindung</button></div>
        <div class="inline-stat-editor">${buildInlineFamilyConnectionRows(tree.connections, treeIndex)}</div>
      </div>
    </div>`).join('');
}

function buildInlineFamilyEditor(page) {
  const data = getInlineFamilyDataForEdit(page);
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Familienakte</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field"><span class="inline-edit-label">Layoutmodus</span><select class="inline-edit-select" data-inline-action="update-family-field" data-family-field="layoutMode"><option value="vertical"${data.layoutMode !== 'depth' ? ' selected' : ''}>Stammbaum</option><option value="depth"${data.layoutMode === 'depth' ? ' selected' : ''}>Tiefenlayout / Spalten</option></select></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Baumdarstellung</span><select class="inline-edit-select" data-inline-action="update-family-field" data-family-field="treeDisplayMode"><option value="tabs"${data.treeDisplayMode !== 'parallel' ? ' selected' : ''}>Ein Baum pro Reiter</option><option value="parallel"${data.treeDisplayMode === 'parallel' ? ' selected' : ''}>Baeume nebeneinander</option></select></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Kartenschrift (%)</span><input class="inline-edit-input" type="number" min="65" max="125" step="1" value="${escapeHtml(data.cardFontScale)}" data-inline-action="update-family-field" data-family-field="cardFontScale"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Kartenbilder (%)</span><input class="inline-edit-input" type="number" min="50" max="160" step="1" value="${escapeHtml(data.portraitScale)}" data-inline-action="update-family-field" data-family-field="portraitScale"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Aufbau-Groesse (%)</span><input class="inline-edit-input" type="range" min="65" max="135" step="1" value="${escapeHtml(data.chartScale)}" data-inline-action="update-family-field" data-family-field="chartScale"></div>
        ${[
          ['eyebrow', 'Kopfzeile'],
          ['subtitle', 'Unterzeile'],
          ['centerLabel', 'Mitte oben'],
          ['emblem', 'Emblem-URL'],
          ['sideImage', 'Linkes Bild-URL'],
          ['organizationTitle', 'Familientitel'],
          ['motto', 'Motto'],
          ['detailsTitle', 'Details-Ueberschrift'],
          ['quoteLabel', 'Zitatlabel'],
          ['chartTitle', 'Baum-Ueberschrift'],
          ['footerNote', 'Footer-Notiz']
        ].map(([field, label]) => `<div class="inline-edit-field${field === 'footerNote' ? ' wide' : ''}"><span class="inline-edit-label">${escapeHtml(label)}</span><input class="inline-edit-input" type="${field.toLowerCase().includes('image') || field === 'emblem' ? 'url' : 'text'}" data-inline-action="update-family-field" data-family-field="${escapeHtml(field)}" value="${escapeHtml(data[field] || '')}"></div>`).join('')}
        <div class="inline-edit-field wide"><span class="inline-edit-label">Beschreibung links</span>${buildTextFormatToolbar()}<textarea class="inline-edit-textarea" data-inline-action="update-family-field" data-family-field="description">${escapeHtml(data.description || '')}</textarea></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Zitat</span>${buildTextFormatToolbar()}<textarea class="inline-edit-textarea" data-inline-action="update-family-field" data-family-field="quote">${escapeHtml(data.quote || '')}</textarea></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Baum-Einleitung</span>${buildTextFormatToolbar()}<textarea class="inline-edit-textarea" data-inline-action="update-family-field" data-family-field="chartIntro">${escapeHtml(data.chartIntro || '')}</textarea></div>
      </div>
    </div>
    <div class="inline-edit-section"><div class="inline-edit-head"><div class="inline-edit-kicker">Details</div><button class="module-editor-mini-btn" type="button" data-inline-action="add-family-detail">+ Detail</button></div><div class="inline-stat-editor">${buildInlineFamilyDetailRows(data.details)}</div></div>
    <div class="inline-edit-section"><div class="inline-edit-head"><div class="inline-edit-kicker">Familienbaeume</div><button class="module-editor-mini-btn" type="button" data-inline-action="add-family-tree">+ Baum</button></div><div class="module-card-layout-blocks">${buildInlineFamilyTreeRows(data.trees)}</div></div>`;
}
