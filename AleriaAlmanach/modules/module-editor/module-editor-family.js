// Static module editor fields for the family tree template.

function buildFamilyTypeOptions(selected = 'direct') {
  const current = getFamilyMemberType(selected);
  return Object.entries(FAMILY_MEMBER_TYPES).map(([value, config]) =>
    `<option value="${escapeHtml(value)}"${value === current ? ' selected' : ''}>${escapeHtml(config.label)}</option>`
  ).join('');
}

function createDefaultFamilyNode(index = 0) {
  return {
    id: `familienmitglied-${index + 1}`,
    familyType: 'direct',
    portrait: '',
    title: index === 0 ? 'Familienoberhaupt' : 'Neues Familienmitglied',
    subtitle: '',
    text: '',
    parentIds: []
  };
}

// Every family editor block gets one <datalist> of all currently known card-IDs in that
// module page, so "Von ID" / "Zu ID" / "Eltern" fields can autocomplete instead of relying
// on the author to type (and not typo) IDs defined elsewhere in the form by hand.
function getFamilyEditorBlockFromNode(node) {
  return node?.closest?.('[data-page-type="family"]') || null;
}

function getFamilyDatalistId(scopeEl) {
  return getFamilyEditorBlockFromNode(scopeEl)?.dataset?.familyNodeDatalist || '';
}

function buildFamilyNodeOptionMarkup(id, title) {
  const safeId = String(id || '').trim();
  return safeId ? `<option value="${escapeHtml(safeId)}">${escapeHtml(title || '')}</option>` : '';
}

function buildFamilyNodeOptionsMarkupFromTrees(trees = []) {
  return (Array.isArray(trees) ? trees : [])
    .flatMap(tree => Array.isArray(tree?.levels) ? tree.levels : [])
    .flatMap(level => Array.isArray(level?.nodes) ? level.nodes : [])
    .map(node => buildFamilyNodeOptionMarkup(node?.id, node?.title))
    .join('');
}

function refreshFamilyNodeDatalist(scopeEl) {
  const block = getFamilyEditorBlockFromNode(scopeEl);
  const datalistId = block?.dataset?.familyNodeDatalist;
  const datalist = datalistId ? document.getElementById(datalistId) : null;
  if (!block || !datalist) return;
  datalist.innerHTML = Array.from(block.querySelectorAll('.family-editor-node-row')).map(row => {
    const id = row.querySelector('.me-family-node-id')?.value || '';
    const title = row.querySelector('.me-family-node-title')?.value || '';
    return buildFamilyNodeOptionMarkup(id, title);
  }).join('');
}

function buildFamilyDetailEditorRows(details = []) {
  const rows = Array.isArray(details) && details.length ? details : [{ icon: '*', label: 'Neuer Eintrag', value: 'Wert' }];
  return rows.map(row => `
    <div class="family-editor-detail-row">
      <input class="inline-edit-input me-family-detail-icon" type="text" value="${escapeHtml(row.icon || '')}" placeholder="Icon">
      <input class="inline-edit-input me-family-detail-label" type="text" value="${escapeHtml(row.label || '')}" placeholder="Label">
      <input class="inline-edit-input me-family-detail-value" type="text" value="${escapeHtml(row.value || '')}" placeholder="Wert">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-family-detail">Loeschen</button>
    </div>`).join('');
}

function buildFamilyNodeEditorMarkup(node = {}, levelIndex = 0, nodeIndex = 0, datalistId = '') {
  const fallback = createDefaultFamilyNode(nodeIndex);
  const parentIdsValue = (Array.isArray(node.parentIds) ? node.parentIds : []).join(', ');
  const listAttr = datalistId ? ` list="${escapeHtml(datalistId)}"` : '';
  return `
    <div class="family-editor-node-row">
      <div class="module-card-layout-block-head">
        <div class="inline-edit-kicker">Person ${nodeIndex + 1}</div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-family-sibling" title="Neue Person in derselben Ebene, mit denselben Eltern und einer Geschwister-Verbindung">+ Geschwister</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-family-node">Loeschen</button>
        </div>
      </div>
      <div class="module-editor-grid">
        <div class="module-editor-field">
          <label>Karten-ID</label>
          <input class="me-family-node-id" type="text" value="${escapeHtml(node.id || fallback.id)}" placeholder="z.B. gwendolyn-draig" data-module-editor-action="refresh-family-node-options">
          <div class="module-editor-help">Diese ID wird fuer Verbindungslinien und Eltern-Zuordnung benutzt.</div>
        </div>
        <div class="module-editor-field">
          <label>Familientyp</label>
          <select class="me-family-node-type">${buildFamilyTypeOptions(node.familyType)}</select>
        </div>
        <div class="module-editor-field">
          <label>Portrait-URL</label>
          <input class="me-family-node-portrait" type="url" value="${escapeHtml(node.portrait || '')}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="module-editor-field">
          <label>Name / Titel</label>
          <input class="me-family-node-title" type="text" value="${escapeHtml(node.title || fallback.title)}" placeholder="Name" data-module-editor-action="refresh-family-node-options">
        </div>
        <div class="module-editor-field">
          <label>Beziehung / Rang</label>
          <input class="me-family-node-subtitle" type="text" value="${escapeHtml(node.subtitle || '')}" placeholder="z.B. Bruder, Ehefrau, Vetter">
        </div>
        <div class="module-editor-field">
          <label>Eltern (Karten-IDs)</label>
          <input class="me-family-node-parents" type="text" value="${escapeHtml(parentIdsValue)}" placeholder="z.B. vater, mutter"${listAttr}>
          <div class="module-editor-help">Bis zu zwei IDs, kommagetrennt. Zeichnet automatisch eine eigene Abstammungslinie.</div>
        </div>
        <div class="module-editor-field wide">
          <label>Beschreibung</label>
          ${buildTextFormatToolbar()}
          <textarea class="me-family-node-text small">${escapeHtml(node.text || '')}</textarea>
        </div>
      </div>
    </div>`;
}

function buildFamilyLevelEditorMarkup(level = {}, levelIndex = 0, datalistId = '') {
  const nodes = Array.isArray(level.nodes) && level.nodes.length
    ? level.nodes.slice(0, 8)
    : [createDefaultFamilyNode(0)];
  return `
    <div class="module-card-layout-block family-editor-level-row">
      <div class="module-card-layout-block-head">
        <div>
          <div class="inline-edit-kicker">Generation / Ebene ${levelIndex + 1}</div>
          <div class="module-editor-help">Bis zu 8 Personen pro Ebene. Verbindungslinien werden unten ueber Karten-IDs gesetzt.</div>
        </div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-family-level" data-family-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-family-level" data-family-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-family-node">+ Person</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-family-level-after">+ Ebene darunter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-family-level">Loeschen</button>
        </div>
      </div>
      <div class="module-editor-field">
        <label>Ebenenlabel</label>
        <input class="me-family-level-label" type="text" value="${escapeHtml(level.label || '')}" placeholder="z.B. Eltern, Kinder, Nebenlinie">
      </div>
      <div class="family-editor-node-list">
        ${nodes.map((node, nodeIndex) => buildFamilyNodeEditorMarkup(node, levelIndex, nodeIndex, datalistId)).join('')}
      </div>
    </div>`;
}

function buildFamilyConnectionEditorRows(connections = [], datalistId = '') {
  const rows = Array.isArray(connections) && connections.length
    ? connections
    : [{ from: '', to: '', relationType: 'blood', label: 'Beziehung' }];
  const listAttr = datalistId ? ` list="${escapeHtml(datalistId)}"` : '';
  return rows.map(row => `
    <div class="family-editor-connection-row">
      <input class="inline-edit-input me-family-connection-from" type="text" value="${escapeHtml(row.from || '')}" placeholder="Von ID"${listAttr}>
      <input class="inline-edit-input me-family-connection-to" type="text" value="${escapeHtml(row.to || '')}" placeholder="Zu ID"${listAttr}>
      <input class="inline-edit-input me-family-connection-type" type="text" value="${escapeHtml(row.relationType || 'blood')}" placeholder="Typ">
      <input class="inline-edit-input me-family-connection-label" type="text" value="${escapeHtml(row.label || '')}" placeholder="Label">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-family-connection">Loeschen</button>
    </div>`).join('');
}

function buildFamilyTreeEditorMarkup(tree = {}, treeIndex = 0, datalistId = '') {
  const levels = Array.isArray(tree.levels) ? tree.levels : [];
  return `
    <div class="module-card-layout-block family-editor-tree-row">
      <div class="module-card-layout-block-head">
        <div>
          <div class="inline-edit-kicker">Familienbaum ${treeIndex + 1}</div>
          <div class="module-editor-help">Jeder Familienbaum bekommt im fertigen Modul einen eigenen Reiter.</div>
        </div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-family-level">+ Ebene</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-family-tree">Baum loeschen</button>
        </div>
      </div>
      <div class="module-editor-field">
        <label>Reitername</label>
        <input class="me-family-tree-label" type="text" value="${escapeHtml(tree.label || `Familienbaum ${treeIndex + 1}`)}" placeholder="z.B. Hauptlinie">
      </div>
      <div class="module-editor-grid compact">
        <div class="module-editor-field">
          <label>Baum-ID</label>
          <input class="me-family-tree-id" type="text" value="${escapeHtml(tree.id || `familienbaum-${treeIndex + 1}`)}" placeholder="z.B. hauptlinie">
          <div class="module-editor-help">Wird fuer Gruppenlayout und baumuebergreifende Zuordnung benutzt.</div>
        </div>
        <div class="module-editor-field">
          <label>Elternbaum-ID</label>
          <input class="me-family-tree-parent-id" type="text" value="${escapeHtml(tree.parentTreeId || '')}" placeholder="leer = oberste Ebene">
          <div class="module-editor-help">Optional. Baeume mit gleicher Eltern-ID stehen darunter nebeneinander.</div>
        </div>
      </div>
      <div class="family-editor-level-list">
        ${levels.length
          ? levels.map((level, levelIndex) => buildFamilyLevelEditorMarkup(level, levelIndex, datalistId)).join('')
          : '<div class="inline-placeholder-note">Noch keine Ebenen vorhanden.</div>'}
      </div>
      <div class="module-editor-field wide">
        <div class="module-editor-inline" style="justify-content:space-between;">
          <label>Parallele Verbindungslinien</label>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-family-connection">+ Verbindung</button>
        </div>
        <div class="module-editor-help">Verbinde zwei Karten-IDs, auch ueber mehrere sichtbare Familienbaeume hinweg. Eltern-Kind-Linien werden automatisch aus dem Eltern-Feld einer Person gezeichnet.</div>
        <div class="family-editor-connection-list">${buildFamilyConnectionEditorRows(tree.connections, datalistId)}</div>
      </div>
    </div>`;
}

function collectFamilyDetailsFromEditor(block) {
  return Array.from(block.querySelectorAll('.family-editor-detail-row')).map(row => ({
    icon: getTrimmedFormValue(row, '.me-family-detail-icon'),
    label: getTrimmedFormValue(row, '.me-family-detail-label'),
    value: getTrimmedFormValue(row, '.me-family-detail-value')
  })).filter(row => row.icon || row.label || row.value);
}

function collectFamilyLevelsFromEditor(block) {
  return Array.from(block.querySelectorAll('.family-editor-level-row')).map(levelRow => ({
    label: getTrimmedFormValue(levelRow, '.me-family-level-label'),
    nodes: Array.from(levelRow.querySelectorAll('.family-editor-node-row')).map(nodeRow => ({
      id: getTrimmedFormValue(nodeRow, '.me-family-node-id'),
      familyType: getFormValue(nodeRow, '.me-family-node-type'),
      portrait: getTrimmedFormValue(nodeRow, '.me-family-node-portrait'),
      title: getTrimmedFormValue(nodeRow, '.me-family-node-title'),
      subtitle: getTrimmedFormValue(nodeRow, '.me-family-node-subtitle'),
      text: getTrimmedFormValue(nodeRow, '.me-family-node-text'),
      parentIds: getTrimmedFormValue(nodeRow, '.me-family-node-parents').split(',').map(id => id.trim()).filter(Boolean)
    })).filter(node => node.id || node.portrait || node.title || node.subtitle || node.text).slice(0, 8)
  })).filter(level => level.label || level.nodes.length);
}

function collectFamilyConnectionsFromEditor(block) {
  return Array.from(block.querySelectorAll('.family-editor-connection-row')).map(row => ({
    from: getTrimmedFormValue(row, '.me-family-connection-from'),
    to: getTrimmedFormValue(row, '.me-family-connection-to'),
    relationType: getTrimmedFormValue(row, '.me-family-connection-type'),
    label: getTrimmedFormValue(row, '.me-family-connection-label')
  })).filter(row => row.from || row.to || row.label);
}

function collectFamilyTreesFromEditor(block) {
  const trees = Array.from(block.querySelectorAll('.family-editor-tree-row')).map((treeRow, index) => ({
    id: getTrimmedFormValue(treeRow, '.me-family-tree-id') || `familienbaum-${index + 1}`,
    parentTreeId: getTrimmedFormValue(treeRow, '.me-family-tree-parent-id'),
    label: getTrimmedFormValue(treeRow, '.me-family-tree-label') || `Familienbaum ${index + 1}`,
    levels: collectFamilyLevelsFromEditor(treeRow),
    connections: collectFamilyConnectionsFromEditor(treeRow)
  })).filter(tree => tree.label || tree.levels.length || tree.connections.length);
  if (trees.length) return trees;
  return [{
    label: getTrimmedFormValue(block, '.me-family-chart-title') || 'Stammbaum',
    levels: collectFamilyLevelsFromEditor(block),
    connections: []
  }];
}

function renumberFamilyEditor(levelList) {
  Array.from(levelList?.querySelectorAll('.family-editor-level-row') || []).forEach((levelRow, levelIndex) => {
    const levelKicker = levelRow.querySelector('.module-card-layout-block-head .inline-edit-kicker');
    if (levelKicker) levelKicker.textContent = `Generation / Ebene ${levelIndex + 1}`;
    Array.from(levelRow.querySelectorAll('.family-editor-node-row')).forEach((nodeRow, nodeIndex) => {
      const nodeKicker = nodeRow.querySelector('.inline-edit-kicker');
      if (nodeKicker) nodeKicker.textContent = `Person ${nodeIndex + 1}`;
    });
  });
}

function renumberFamilyTreeEditor(treeList) {
  Array.from(treeList?.querySelectorAll('.family-editor-tree-row') || []).forEach((treeRow, treeIndex) => {
    const kicker = treeRow.querySelector(':scope > .module-card-layout-block-head .inline-edit-kicker');
    if (kicker) kicker.textContent = `Familienbaum ${treeIndex + 1}`;
    renumberFamilyEditor(treeRow.querySelector('.family-editor-level-list'));
  });
}

function addModuleFamilyTree(button) {
  const wrap = button.closest('.module-page-card')?.querySelector('.family-editor-tree-list');
  if (!wrap) return;
  const datalistId = getFamilyDatalistId(wrap);
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildFamilyTreeEditorMarkup({
    label: `Familienbaum ${wrap.querySelectorAll('.family-editor-tree-row').length + 1}`,
    levels: [{ label: '', nodes: [createDefaultFamilyNode(0)] }],
    connections: []
  }, wrap.querySelectorAll('.family-editor-tree-row').length, datalistId));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  renumberFamilyTreeEditor(wrap);
  refreshFamilyNodeDatalist(wrap);
  syncModuleJsonPreview();
}

function removeModuleFamilyTree(button) {
  const row = button.closest('.family-editor-tree-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  const datalistId = getFamilyDatalistId(wrap);
  row.remove();
  if (!wrap.querySelector('.family-editor-tree-row')) {
    wrap.innerHTML = buildFamilyTreeEditorMarkup({ label: 'Stammbaum', levels: [{ label: '', nodes: [createDefaultFamilyNode(0)] }], connections: [] }, 0, datalistId);
    hydrateModuleRichEditors(wrap);
  }
  renumberFamilyTreeEditor(wrap);
  refreshFamilyNodeDatalist(wrap);
  syncModuleJsonPreview();
}

function addModuleFamilyDetail(button) {
  const wrap = button.closest('.module-page-card')?.querySelector('.family-editor-detail-list');
  if (!wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildFamilyDetailEditorRows([{ icon: '*', label: 'Neuer Eintrag', value: 'Wert' }]));
  syncModuleJsonPreview();
}

function removeModuleFamilyDetail(button) {
  const row = button.closest('.family-editor-detail-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.family-editor-detail-row')) wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Details vorhanden.</div>';
  syncModuleJsonPreview();
}

function addModuleFamilyLevel(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = button.closest('.family-editor-tree-row')?.querySelector('.family-editor-level-list')
    || pageCard?.querySelector('.family-editor-level-list');
  if (!wrap) return;
  const datalistId = getFamilyDatalistId(wrap);
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildFamilyLevelEditorMarkup({ label: '', nodes: [createDefaultFamilyNode(0)] }, wrap.querySelectorAll('.family-editor-level-row').length, datalistId));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  renumberFamilyEditor(wrap);
  renumberFamilyTreeEditor(pageCard?.querySelector('.family-editor-tree-list'));
  refreshFamilyNodeDatalist(wrap);
  syncModuleJsonPreview();
}

function addModuleFamilyLevelAfter(button) {
  const currentLevel = button.closest('.family-editor-level-row');
  const wrap = currentLevel?.parentElement;
  if (!currentLevel || !wrap) return;
  const datalistId = getFamilyDatalistId(wrap);
  currentLevel.insertAdjacentHTML('afterend', buildFamilyLevelEditorMarkup({ label: '', nodes: [createDefaultFamilyNode(0)] }, 0, datalistId));
  hydrateModuleRichEditors(currentLevel.nextElementSibling || wrap);
  renumberFamilyEditor(wrap);
  renumberFamilyTreeEditor(currentLevel.closest('.family-editor-tree-list'));
  refreshFamilyNodeDatalist(wrap);
  syncModuleJsonPreview();
}

function removeModuleFamilyLevel(button) {
  const row = button.closest('.family-editor-level-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.family-editor-level-row')) wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Ebenen vorhanden.</div>';
  renumberFamilyEditor(wrap);
  renumberFamilyTreeEditor(row.closest('.family-editor-tree-list'));
  refreshFamilyNodeDatalist(wrap);
  syncModuleJsonPreview();
}

function moveModuleFamilyLevel(button) {
  const row = button.closest('.family-editor-level-row');
  const direction = Number(button.dataset.familyDirection) || 0;
  if (!row || !direction) return;
  if (direction < 0 && row.previousElementSibling) row.parentElement.insertBefore(row, row.previousElementSibling);
  if (direction > 0 && row.nextElementSibling) row.parentElement.insertBefore(row.nextElementSibling, row);
  renumberFamilyEditor(row.parentElement);
  renumberFamilyTreeEditor(row.closest('.family-editor-tree-list'));
  syncModuleJsonPreview();
}

function addModuleFamilyNode(button) {
  const levelRow = button.closest('.family-editor-level-row');
  const wrap = levelRow?.querySelector('.family-editor-node-list');
  if (!wrap || wrap.querySelectorAll('.family-editor-node-row').length >= 8) return;
  const datalistId = getFamilyDatalistId(wrap);
  wrap.insertAdjacentHTML('beforeend', buildFamilyNodeEditorMarkup(createDefaultFamilyNode(wrap.querySelectorAll('.family-editor-node-row').length), 0, wrap.querySelectorAll('.family-editor-node-row').length, datalistId));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  renumberFamilyEditor(levelRow.parentElement);
  refreshFamilyNodeDatalist(wrap);
  syncModuleJsonPreview();
}

function removeModuleFamilyNode(button) {
  const node = button.closest('.family-editor-node-row');
  const wrap = node?.parentElement;
  const levelList = node?.closest('.family-editor-level-list');
  if (!node || !wrap) return;
  const datalistId = getFamilyDatalistId(wrap);
  node.remove();
  if (!wrap.querySelector('.family-editor-node-row')) {
    wrap.innerHTML = buildFamilyNodeEditorMarkup(createDefaultFamilyNode(0), 0, 0, datalistId);
    hydrateModuleRichEditors(wrap);
  }
  renumberFamilyEditor(levelList);
  refreshFamilyNodeDatalist(wrap);
  syncModuleJsonPreview();
}

// "+ Geschwister": adds a new person in the same level, inheriting the reference person's
// parentIds so the whole sibling group stays wired to the same parents, and immediately adds
// a labelled "Geschwister" connection between the two so the relation is visible right away.
function addModuleFamilySibling(button) {
  const referenceNode = button.closest('.family-editor-node-row');
  const wrap = referenceNode?.parentElement;
  const treeRow = button.closest('.family-editor-tree-row');
  if (!wrap || wrap.querySelectorAll('.family-editor-node-row').length >= 8) return;
  const datalistId = getFamilyDatalistId(wrap);

  const referenceId = getTrimmedFormValue(referenceNode, '.me-family-node-id');
  const parentIds = getTrimmedFormValue(referenceNode, '.me-family-node-parents');
  const newIndex = wrap.querySelectorAll('.family-editor-node-row').length;
  const sibling = {
    ...createDefaultFamilyNode(newIndex),
    id: `familienmitglied-${Date.now().toString(36)}`,
    title: 'Neues Geschwister',
    subtitle: 'Geschwister',
    parentIds: parentIds ? parentIds.split(',').map(id => id.trim()).filter(Boolean) : []
  };
  referenceNode.insertAdjacentHTML('afterend', buildFamilyNodeEditorMarkup(sibling, 0, newIndex, datalistId));
  const siblingRow = referenceNode.nextElementSibling;
  hydrateModuleRichEditors(siblingRow || wrap);
  renumberFamilyEditor(wrap.closest('.family-editor-level-list'));
  refreshFamilyNodeDatalist(wrap);

  if (referenceId && treeRow) {
    const connectionWrap = treeRow.querySelector('.family-editor-connection-list');
    if (connectionWrap) {
      connectionWrap.querySelector('.inline-placeholder-note')?.remove();
      connectionWrap.insertAdjacentHTML('beforeend', buildFamilyConnectionEditorRows([
        { from: referenceId, to: sibling.id, relationType: 'sibling', label: 'Geschwister' }
      ], datalistId));
    }
  }
  syncModuleJsonPreview();
}

function getFamilyEditorNodeIds(treeRow) {
  return Array.from(treeRow?.querySelectorAll('.me-family-node-id') || [])
    .map(input => String(input.value || '').trim())
    .filter(Boolean);
}

function addModuleFamilyConnection(button) {
  const treeRow = button.closest('.family-editor-tree-row');
  const wrap = treeRow?.querySelector('.family-editor-connection-list');
  if (!wrap) return;
  const ids = getFamilyEditorNodeIds(treeRow);
  const datalistId = getFamilyDatalistId(wrap);
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildFamilyConnectionEditorRows([{ from: ids[0] || '', to: ids[1] || '', relationType: 'blood', label: 'Beziehung' }], datalistId));
  syncModuleJsonPreview();
}

function removeModuleFamilyConnection(button) {
  const row = button.closest('.family-editor-connection-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.family-editor-connection-row')) wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Verbindungen vorhanden.</div>';
  syncModuleJsonPreview();
}

function buildFamilyModuleEditorFields(page) {
  const family = sanitizeFamilyData(page?.family || {});
  const datalistId = `family-node-ids-${Math.random().toString(36).slice(2, 9)}`;
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'family' ? ' visible' : ''}" data-page-type="family" data-family-node-datalist="${escapeHtml(datalistId)}">
        <datalist id="${escapeHtml(datalistId)}">${buildFamilyNodeOptionsMarkupFromTrees(family.trees)}</datalist>
        <div class="module-editor-grid">
          <div class="module-editor-field">
            <label>Layoutmodus</label>
            <select class="me-family-layout-mode">
              <option value="vertical"${family.layoutMode !== 'depth' ? ' selected' : ''}>Stammbaum</option>
              <option value="depth"${family.layoutMode === 'depth' ? ' selected' : ''}>Tiefenlayout / Spalten</option>
            </select>
          </div>
          <div class="module-editor-field">
            <label>Baumdarstellung</label>
            <select class="me-family-tree-display-mode">
              <option value="tabs"${family.treeDisplayMode !== 'parallel' && family.treeDisplayMode !== 'groups' ? ' selected' : ''}>Ein Baum pro Reiter</option>
              <option value="parallel"${family.treeDisplayMode === 'parallel' ? ' selected' : ''}>Baeume nebeneinander</option>
              <option value="groups"${family.treeDisplayMode === 'groups' ? ' selected' : ''}>Eltern-/Unterbaeume</option>
            </select>
          </div>
          <div class="module-editor-field"><label>Kartenschrift</label><input class="me-family-card-font-scale" type="number" min="65" max="125" step="1" value="${escapeHtml(family.cardFontScale)}"></div>
          <div class="module-editor-field"><label>Kartenbilder</label><input class="me-family-portrait-scale" type="number" min="50" max="160" step="1" value="${escapeHtml(family.portraitScale)}"></div>
          <div class="module-editor-field"><label>Aufbau-Groesse</label><input class="me-family-chart-scale" type="range" min="65" max="135" step="1" value="${escapeHtml(family.chartScale)}"></div>
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
            ['chartTitle', 'Baum-Ueberschrift']
          ].map(([field, label]) => `
            <div class="module-editor-field">
              <label>${escapeHtml(label)}</label>
              <input type="${field.toLowerCase().includes('image') || field === 'emblem' ? 'url' : 'text'}" class="me-family-${escapeHtml(field)}" value="${escapeHtml(family[field])}">
            </div>`).join('')}
          <div class="module-editor-field wide"><label>Beschreibung links</label>${buildTextFormatToolbar()}<textarea class="me-family-description">${escapeHtml(family.description)}</textarea></div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;"><label>Details</label><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-family-detail">+ Detail</button></div>
            <div class="family-editor-detail-list">${buildFamilyDetailEditorRows(family.details)}</div>
          </div>
          <div class="module-editor-field wide"><label>Zitat</label>${buildTextFormatToolbar()}<textarea class="me-family-quote small">${escapeHtml(family.quote)}</textarea></div>
          <div class="module-editor-field wide"><label>Baum-Einleitung</label>${buildTextFormatToolbar()}<textarea class="me-family-chartIntro small">${escapeHtml(family.chartIntro)}</textarea></div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;"><label>Familienbaeume</label><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-family-tree">+ Baum</button></div>
            <div class="family-editor-tree-list">${family.trees.map((tree, treeIndex) => buildFamilyTreeEditorMarkup(tree, treeIndex, datalistId)).join('')}</div>
          </div>
          <div class="module-editor-field wide"><label>Footer-Notiz</label><input type="text" class="me-family-footerNote" value="${escapeHtml(family.footerNote)}"></div>
        </div>
      </div>`;
}

function collectFamilyModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="family"]') || card;
  const trees = collectFamilyTreesFromEditor(block);
  page.familyPage = true;
  page.family = sanitizeFamilyData({
    layoutMode: getFormValue(block, '.me-family-layout-mode'),
    treeDisplayMode: getFormValue(block, '.me-family-tree-display-mode'),
    cardFontScale: getFormValue(block, '.me-family-card-font-scale'),
    portraitScale: getFormValue(block, '.me-family-portrait-scale'),
    chartScale: getFormValue(block, '.me-family-chart-scale'),
    eyebrow: getTrimmedFormValue(block, '.me-family-eyebrow'),
    subtitle: getTrimmedFormValue(block, '.me-family-subtitle'),
    centerLabel: getTrimmedFormValue(block, '.me-family-centerLabel'),
    emblem: getTrimmedFormValue(block, '.me-family-emblem'),
    sideImage: getTrimmedFormValue(block, '.me-family-sideImage'),
    organizationTitle: getTrimmedFormValue(block, '.me-family-organizationTitle'),
    motto: getTrimmedFormValue(block, '.me-family-motto'),
    description: getTrimmedFormValue(block, '.me-family-description'),
    detailsTitle: getTrimmedFormValue(block, '.me-family-detailsTitle'),
    details: collectFamilyDetailsFromEditor(block),
    quoteLabel: getTrimmedFormValue(block, '.me-family-quoteLabel'),
    quote: getTrimmedFormValue(block, '.me-family-quote'),
    chartTitle: getTrimmedFormValue(block, '.me-family-chartTitle'),
    chartIntro: getTrimmedFormValue(block, '.me-family-chartIntro'),
    trees,
    levels: trees[0]?.levels || [],
    footerNote: getTrimmedFormValue(block, '.me-family-footerNote')
  });
  return page;
}
