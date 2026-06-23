// Static module editor fields for the dedicated hierarchy template.

function buildHierarchyDetailEditorRows(details = []) {
  const rows = Array.isArray(details) && details.length ? details : [{ icon: '*', label: 'Neuer Eintrag', value: 'Wert' }];
  return rows.map(row => `
    <div class="hierarchy-editor-detail-row">
      <input class="inline-edit-input me-hierarchy-detail-icon" type="text" value="${escapeHtml(row.icon || '')}" placeholder="Icon">
      <input class="inline-edit-input me-hierarchy-detail-label" type="text" value="${escapeHtml(row.label || '')}" placeholder="Label">
      <input class="inline-edit-input me-hierarchy-detail-value" type="text" value="${escapeHtml(row.value || '')}" placeholder="Wert">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-hierarchy-detail">Loeschen</button>
    </div>`).join('');
}

function buildHierarchyNodeEditorMarkup(node = {}, levelIndex = 0, nodeIndex = 0) {
  return `
    <div class="hierarchy-editor-node-row">
      <div class="module-card-layout-block-head">
        <div class="inline-edit-kicker">Knoten ${nodeIndex + 1}</div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-hierarchy-node">Loeschen</button>
      </div>
      <div class="module-editor-grid">
        <div class="module-editor-field">
          <label>Portrait-URL</label>
          <input class="me-hierarchy-node-portrait" type="url" value="${escapeHtml(node.portrait || '')}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="module-editor-field">
          <label>Titel / Rang</label>
          <input class="me-hierarchy-node-title" type="text" value="${escapeHtml(node.title || '')}" placeholder="Gildenmeister">
        </div>
        <div class="module-editor-field">
          <label>Untertitel</label>
          <input class="me-hierarchy-node-subtitle" type="text" value="${escapeHtml(node.subtitle || '')}" placeholder="optional">
        </div>
        <div class="module-editor-field wide">
          <label>Beschreibung</label>
          ${buildTextFormatToolbar()}
          <textarea class="me-hierarchy-node-text small">${escapeHtml(node.text || '')}</textarea>
        </div>
      </div>
    </div>`;
}

function buildHierarchyLevelEditorMarkup(level = {}, levelIndex = 0) {
  const nodes = Array.isArray(level.nodes) && level.nodes.length
    ? level.nodes.slice(0, 6)
    : [{ portrait: '', title: 'Neuer Rang', subtitle: '', text: '' }];
  return `
    <div class="module-card-layout-block hierarchy-editor-level-row">
      <div class="module-card-layout-block-head">
        <div>
          <div class="inline-edit-kicker">Ebene ${levelIndex + 1}</div>
          <div class="module-editor-help">Maximal 6 Knoten pro Ebene. Bei breiten Ebenen bekommt der Aufbau im Modul eine eigene Scrollleiste.</div>
        </div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-hierarchy-level" data-hierarchy-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-hierarchy-level" data-hierarchy-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-hierarchy-node">+ Knoten</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-hierarchy-level-after">+ Ebene darunter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-hierarchy-level">Loeschen</button>
        </div>
      </div>
      <div class="module-editor-field">
        <label>Ebenenlabel</label>
        <input class="me-hierarchy-level-label" type="text" value="${escapeHtml(level.label || '')}" placeholder="optional">
      </div>
      <div class="hierarchy-editor-node-list">
        ${nodes.map((node, nodeIndex) => buildHierarchyNodeEditorMarkup(node, levelIndex, nodeIndex)).join('')}
      </div>
    </div>`;
}

function collectHierarchyDetailsFromEditor(block) {
  return Array.from(block.querySelectorAll('.hierarchy-editor-detail-row')).map(row => ({
    icon: getTrimmedFormValue(row, '.me-hierarchy-detail-icon'),
    label: getTrimmedFormValue(row, '.me-hierarchy-detail-label'),
    value: getTrimmedFormValue(row, '.me-hierarchy-detail-value')
  })).filter(row => row.icon || row.label || row.value);
}

function collectHierarchyLevelsFromEditor(block) {
  return Array.from(block.querySelectorAll('.hierarchy-editor-level-row')).map(levelRow => ({
    label: getTrimmedFormValue(levelRow, '.me-hierarchy-level-label'),
    nodes: Array.from(levelRow.querySelectorAll('.hierarchy-editor-node-row')).map(nodeRow => ({
      portrait: getTrimmedFormValue(nodeRow, '.me-hierarchy-node-portrait'),
      title: getTrimmedFormValue(nodeRow, '.me-hierarchy-node-title'),
      subtitle: getTrimmedFormValue(nodeRow, '.me-hierarchy-node-subtitle'),
      text: getTrimmedFormValue(nodeRow, '.me-hierarchy-node-text')
    })).filter(node => node.portrait || node.title || node.subtitle || node.text).slice(0, 6)
  })).filter(level => level.label || level.nodes.length);
}

function buildHierarchyTreeEditorMarkup(tree = {}, treeIndex = 0) {
  const levels = Array.isArray(tree.levels) ? tree.levels : [];
  return `
    <div class="module-card-layout-block hierarchy-editor-tree-row">
      <div class="module-card-layout-block-head">
        <div>
          <div class="inline-edit-kicker">Hierarchie-Baum ${treeIndex + 1}</div>
          <div class="module-editor-help">Jeder Baum bekommt im fertigen Modul einen eigenen Reiter.</div>
        </div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-hierarchy-level">+ Ebene</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-hierarchy-tree">Baum loeschen</button>
        </div>
      </div>
      <div class="module-editor-field">
        <label>Reitername</label>
        <input class="me-hierarchy-tree-label" type="text" value="${escapeHtml(tree.label || `Baum ${treeIndex + 1}`)}" placeholder="z.B. Hauptstruktur">
      </div>
      <div class="hierarchy-editor-level-list">
        ${levels.length
          ? levels.map((level, levelIndex) => buildHierarchyLevelEditorMarkup(level, levelIndex)).join('')
          : '<div class="inline-placeholder-note">Noch keine Ebenen vorhanden.</div>'}
      </div>
    </div>`;
}

function collectHierarchyTreesFromEditor(block) {
  const trees = Array.from(block.querySelectorAll('.hierarchy-editor-tree-row')).map((treeRow, index) => ({
    label: getTrimmedFormValue(treeRow, '.me-hierarchy-tree-label') || `Baum ${index + 1}`,
    levels: collectHierarchyLevelsFromEditor(treeRow)
  })).filter(tree => tree.label || tree.levels.length);
  if (trees.length) return trees;
  return [{
    label: getTrimmedFormValue(block, '.me-hierarchy-chart-title') || 'Aufbau',
    levels: collectHierarchyLevelsFromEditor(block)
  }];
}

function renumberHierarchyEditor(levelList) {
  Array.from(levelList?.querySelectorAll('.hierarchy-editor-level-row') || []).forEach((levelRow, levelIndex) => {
    const levelKicker = levelRow.querySelector('.module-card-layout-block-head .inline-edit-kicker');
    if (levelKicker) levelKicker.textContent = `Ebene ${levelIndex + 1}`;
    Array.from(levelRow.querySelectorAll('.hierarchy-editor-node-row')).forEach((nodeRow, nodeIndex) => {
      const nodeKicker = nodeRow.querySelector('.inline-edit-kicker');
      if (nodeKicker) nodeKicker.textContent = `Knoten ${nodeIndex + 1}`;
    });
  });
}

function renumberHierarchyTreeEditor(treeList) {
  Array.from(treeList?.querySelectorAll('.hierarchy-editor-tree-row') || []).forEach((treeRow, treeIndex) => {
    const kicker = treeRow.querySelector(':scope > .module-card-layout-block-head .inline-edit-kicker');
    if (kicker) kicker.textContent = `Hierarchie-Baum ${treeIndex + 1}`;
    renumberHierarchyEditor(treeRow.querySelector('.hierarchy-editor-level-list'));
  });
}

function addModuleHierarchyTree(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.hierarchy-editor-tree-list');
  if (!wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildHierarchyTreeEditorMarkup({
    label: `Baum ${wrap.querySelectorAll('.hierarchy-editor-tree-row').length + 1}`,
    levels: [{ label: '', nodes: [{ portrait: '', title: 'Neuer Rang', subtitle: '', text: '' }] }]
  }, wrap.querySelectorAll('.hierarchy-editor-tree-row').length));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  renumberHierarchyTreeEditor(wrap);
  syncModuleJsonPreview();
}

function removeModuleHierarchyTree(button) {
  const row = button.closest('.hierarchy-editor-tree-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.hierarchy-editor-tree-row')) {
    wrap.innerHTML = buildHierarchyTreeEditorMarkup({
      label: 'Aufbau',
      levels: [{ label: '', nodes: [{ portrait: '', title: 'Neuer Rang', subtitle: '', text: '' }] }]
    }, 0);
    hydrateModuleRichEditors(wrap);
  }
  renumberHierarchyTreeEditor(wrap);
  syncModuleJsonPreview();
}

function addModuleHierarchyDetail(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.hierarchy-editor-detail-list');
  if (!wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildHierarchyDetailEditorRows([{ icon: '*', label: 'Neuer Eintrag', value: 'Wert' }]));
  syncModuleJsonPreview();
}

function removeModuleHierarchyDetail(button) {
  const row = button.closest('.hierarchy-editor-detail-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.hierarchy-editor-detail-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Details vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleHierarchyLevel(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = button.closest('.hierarchy-editor-tree-row')?.querySelector('.hierarchy-editor-level-list')
    || pageCard?.querySelector('.hierarchy-editor-level-list');
  if (!wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildHierarchyLevelEditorMarkup({
    label: '',
    nodes: [{ portrait: '', title: 'Neuer Rang', subtitle: '', text: '' }]
  }, wrap.querySelectorAll('.hierarchy-editor-level-row').length));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  renumberHierarchyEditor(wrap);
  renumberHierarchyTreeEditor(pageCard?.querySelector('.hierarchy-editor-tree-list'));
  syncModuleJsonPreview();
}

function addModuleHierarchyLevelAfter(button) {
  const currentLevel = button.closest('.hierarchy-editor-level-row');
  const wrap = currentLevel?.parentElement;
  if (!currentLevel || !wrap) return;
  currentLevel.insertAdjacentHTML('afterend', buildHierarchyLevelEditorMarkup({
    label: '',
    nodes: [{ portrait: '', title: 'Neuer Unterrang', subtitle: '', text: '' }]
  }, 0));
  hydrateModuleRichEditors(currentLevel.nextElementSibling || wrap);
  renumberHierarchyEditor(wrap);
  renumberHierarchyTreeEditor(currentLevel.closest('.hierarchy-editor-tree-list'));
  syncModuleJsonPreview();
}

function removeModuleHierarchyLevel(button) {
  const row = button.closest('.hierarchy-editor-level-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.hierarchy-editor-level-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Ebenen vorhanden.</div>';
  }
  renumberHierarchyEditor(wrap);
  renumberHierarchyTreeEditor(row.closest('.hierarchy-editor-tree-list'));
  syncModuleJsonPreview();
}

function moveModuleHierarchyLevel(button) {
  const row = button.closest('.hierarchy-editor-level-row');
  const direction = Number(button.dataset.hierarchyDirection) || 0;
  if (!row || !direction) return;
  if (direction < 0 && row.previousElementSibling) {
    row.parentElement.insertBefore(row, row.previousElementSibling);
  } else if (direction > 0 && row.nextElementSibling) {
    row.parentElement.insertBefore(row.nextElementSibling, row);
  }
  renumberHierarchyEditor(row.parentElement);
  renumberHierarchyTreeEditor(row.closest('.hierarchy-editor-tree-list'));
  syncModuleJsonPreview();
}

function addModuleHierarchyNode(button) {
  const levelRow = button.closest('.hierarchy-editor-level-row');
  const wrap = levelRow?.querySelector('.hierarchy-editor-node-list');
  if (!wrap || wrap.querySelectorAll('.hierarchy-editor-node-row').length >= 6) return;
  wrap.insertAdjacentHTML('beforeend', buildHierarchyNodeEditorMarkup({ title: 'Neuer Rang' }, 0, wrap.querySelectorAll('.hierarchy-editor-node-row').length));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  renumberHierarchyEditor(levelRow.parentElement);
  syncModuleJsonPreview();
}

function removeModuleHierarchyNode(button) {
  const node = button.closest('.hierarchy-editor-node-row');
  const wrap = node?.parentElement;
  const levelList = node?.closest('.hierarchy-editor-level-list');
  if (!node || !wrap) return;
  node.remove();
  if (!wrap.querySelector('.hierarchy-editor-node-row')) {
    wrap.innerHTML = buildHierarchyNodeEditorMarkup({ title: 'Neuer Rang' }, 0, 0);
    hydrateModuleRichEditors(wrap);
  }
  renumberHierarchyEditor(levelList);
  syncModuleJsonPreview();
}

function buildHierarchyModuleEditorFields(page) {
  const hierarchy = sanitizeHierarchyData(page?.hierarchy || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'hierarchy' ? ' visible' : ''}" data-page-type="hierarchy">
        <div class="module-editor-grid">
          <div class="module-editor-field">
            <label>Layoutmodus</label>
            <select class="me-hierarchy-layout-mode">
              <option value="vertical"${hierarchy.layoutMode !== 'depth' ? ' selected' : ''}>Mockup / Stammbaum</option>
              <option value="depth"${hierarchy.layoutMode === 'depth' ? ' selected' : ''}>Tiefenlayout / Spalten</option>
            </select>
          </div>
          <div class="module-editor-field">
            <label>Baumdarstellung</label>
            <select class="me-hierarchy-tree-display-mode">
              <option value="tabs"${hierarchy.treeDisplayMode !== 'parallel' ? ' selected' : ''}>Ein Baum pro Reiter</option>
              <option value="parallel"${hierarchy.treeDisplayMode === 'parallel' ? ' selected' : ''}>Baeume nebeneinander</option>
            </select>
            <div class="module-editor-help">Nebeneinander zeigt mehrere Baeume mit vertikalem Trenner.</div>
          </div>
          <div class="module-editor-field">
            <label>Kartenschrift</label>
            <input class="me-hierarchy-card-font-scale" type="number" min="65" max="125" step="1" value="${escapeHtml(hierarchy.cardFontScale)}">
            <div class="module-editor-help">Prozent, Standard 92.</div>
          </div>
          <div class="module-editor-field">
            <label>Kartenbilder</label>
            <input class="me-hierarchy-portrait-scale" type="number" min="50" max="160" step="1" value="${escapeHtml(hierarchy.portraitScale)}">
            <div class="module-editor-help">Prozent, Standard 100.</div>
          </div>
          <div class="module-editor-field">
            <label>Aufbau-Groesse</label>
            <input class="me-hierarchy-chart-scale" type="range" min="65" max="135" step="1" value="${escapeHtml(hierarchy.chartScale)}">
            <div class="module-editor-help">Skaliert den fertigen Stammbaum. Standard 100.</div>
          </div>
          <div class="module-editor-field">
            <label>Kopfzeile</label>
            <input type="text" class="me-hierarchy-eyebrow" value="${escapeHtml(hierarchy.eyebrow)}">
          </div>
          <div class="module-editor-field">
            <label>Unterzeile</label>
            <input type="text" class="me-hierarchy-subtitle" value="${escapeHtml(hierarchy.subtitle)}">
          </div>
          <div class="module-editor-field">
            <label>Mitte oben</label>
            <input type="text" class="me-hierarchy-center-label" value="${escapeHtml(hierarchy.centerLabel)}">
          </div>
          <div class="module-editor-field">
            <label>Emblem-URL</label>
            <input type="url" class="me-hierarchy-emblem" value="${escapeHtml(hierarchy.emblem)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Linkes Bild-URL</label>
            <input type="url" class="me-hierarchy-side-image" value="${escapeHtml(hierarchy.sideImage)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Organisationstitel</label>
            <input type="text" class="me-hierarchy-organization-title" value="${escapeHtml(hierarchy.organizationTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Motto</label>
            <input type="text" class="me-hierarchy-motto" value="${escapeHtml(hierarchy.motto)}">
          </div>
          <div class="module-editor-field wide">
            <label>Beschreibung links</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-hierarchy-description">${escapeHtml(hierarchy.description)}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Details-Ueberschrift</label>
            <input type="text" class="me-hierarchy-details-title" value="${escapeHtml(hierarchy.detailsTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Zitatlabel</label>
            <input type="text" class="me-hierarchy-quote-label" value="${escapeHtml(hierarchy.quoteLabel)}">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Details</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-hierarchy-detail">+ Detail</button>
            </div>
            <div class="hierarchy-editor-detail-list">
              ${buildHierarchyDetailEditorRows(hierarchy.details)}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Zitat</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-hierarchy-quote small">${escapeHtml(hierarchy.quote)}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Baum-Ueberschrift</label>
            <input type="text" class="me-hierarchy-chart-title" value="${escapeHtml(hierarchy.chartTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Baum-Einleitung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-hierarchy-chart-intro small">${escapeHtml(hierarchy.chartIntro)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Hierarchie-Baeume</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-hierarchy-tree">+ Baum</button>
            </div>
            <div class="hierarchy-editor-tree-list">
              ${hierarchy.trees.length
                ? hierarchy.trees.map((tree, treeIndex) => buildHierarchyTreeEditorMarkup(tree, treeIndex)).join('')
                : buildHierarchyTreeEditorMarkup({ label: hierarchy.chartTitle || 'Aufbau', levels: hierarchy.levels }, 0)}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Footer-Notiz</label>
            <input type="text" class="me-hierarchy-footer-note" value="${escapeHtml(hierarchy.footerNote)}">
          </div>
        </div>
      </div>`;
}

function collectHierarchyModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="hierarchy"]') || card;
  const trees = collectHierarchyTreesFromEditor(block);
  page.hierarchyPage = true;
  page.hierarchy = sanitizeHierarchyData({
    layoutMode: getFormValue(block, '.me-hierarchy-layout-mode'),
    treeDisplayMode: getFormValue(block, '.me-hierarchy-tree-display-mode'),
    cardFontScale: getFormValue(block, '.me-hierarchy-card-font-scale'),
    portraitScale: getFormValue(block, '.me-hierarchy-portrait-scale'),
    chartScale: getFormValue(block, '.me-hierarchy-chart-scale'),
    eyebrow: getTrimmedFormValue(block, '.me-hierarchy-eyebrow'),
    subtitle: getTrimmedFormValue(block, '.me-hierarchy-subtitle'),
    centerLabel: getTrimmedFormValue(block, '.me-hierarchy-center-label'),
    emblem: getTrimmedFormValue(block, '.me-hierarchy-emblem'),
    sideImage: getTrimmedFormValue(block, '.me-hierarchy-side-image'),
    organizationTitle: getTrimmedFormValue(block, '.me-hierarchy-organization-title'),
    motto: getTrimmedFormValue(block, '.me-hierarchy-motto'),
    description: getTrimmedFormValue(block, '.me-hierarchy-description'),
    detailsTitle: getTrimmedFormValue(block, '.me-hierarchy-details-title'),
    details: collectHierarchyDetailsFromEditor(block),
    quoteLabel: getTrimmedFormValue(block, '.me-hierarchy-quote-label'),
    quote: getTrimmedFormValue(block, '.me-hierarchy-quote'),
    chartTitle: getTrimmedFormValue(block, '.me-hierarchy-chart-title'),
    chartIntro: getTrimmedFormValue(block, '.me-hierarchy-chart-intro'),
    trees,
    levels: trees[0]?.levels || [],
    footerNote: getTrimmedFormValue(block, '.me-hierarchy-footer-note')
  });
  return page;
}
