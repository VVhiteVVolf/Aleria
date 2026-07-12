const _expandedArchiveHierarchyNodes = new Set();
const _initializedArchiveHierarchyTabs = new Set();

function getArchiveHierarchyNodeKey(tab, path = []) {
  const normalizedPath = (Array.isArray(path) ? path : [])
    .map(part => normalizeArchivePathPart(part))
    .filter(Boolean)
    .join('>');
  return `${normalizeArchivePathPart(tab || 'archiv')}::${normalizedPath || 'root'}`;
}

function createArchiveHierarchyNode(label, path = [], section = null) {
  return {
    label: String(label || 'Bereich').trim() || 'Bereich',
    path: Array.isArray(path) ? [...path] : [],
    section,
    directEntries: [],
    entries: [],
    children: [],
    childMap: new Map(),
    sortOrder: Number(section?.sortOrder) || 0
  };
}

function mergeArchiveHierarchySection(node, section) {
  if (!node || !section) return;
  const current = node.section || {};
  node.section = {
    ...current,
    ...section,
    desc: String(section.desc || current.desc || '').trim(),
    iconUrl: String(section.iconUrl || current.iconUrl || '').trim(),
    entries: []
  };
  node.sortOrder = Number(section.sortOrder ?? node.sortOrder) || 0;
  node.directEntries.push(...(section.entries || []));
}

function finalizeArchiveHierarchyNode(node) {
  node.children.sort((a, b) => {
    const order = (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
    return order || a.label.localeCompare(b.label, 'de', { sensitivity: 'base' });
  });
  node.children.forEach(finalizeArchiveHierarchyNode);

  node.entries = [...node.directEntries, ...node.children.flatMap(child => child.entries)];
  return node;
}

function buildArchiveHierarchyModel(tabSections = [], tab = '') {
  const rootSection = getArchiveRootSection(tabSections, tab);
  const root = createArchiveHierarchyNode(getSectionLeafLabel(rootSection), [], rootSection);

  tabSections.forEach(section => {
    const path = getSectionPathParts(section);
    let node = root;
    path.forEach((part, index) => {
      const normalized = normalizeArchivePathPart(part);
      if (!node.childMap.has(normalized)) {
        const child = createArchiveHierarchyNode(part, path.slice(0, index + 1));
        node.childMap.set(normalized, child);
        node.children.push(child);
      }
      node = node.childMap.get(normalized);
    });
    mergeArchiveHierarchySection(node, section);
  });

  finalizeArchiveHierarchyNode(root);
  return { tab, root };
}

function findArchiveHierarchyNode(root, path = []) {
  let node = root;
  for (const part of path) {
    node = node?.childMap?.get(normalizeArchivePathPart(part));
    if (!node) return null;
  }
  return node || null;
}

function expandArchiveHierarchyPath(tab, path = []) {
  const parts = Array.isArray(path) ? path : [];
  parts.forEach((_, index) => {
    _expandedArchiveHierarchyNodes.add(getArchiveHierarchyNodeKey(tab, parts.slice(0, index + 1)));
  });
}

function initializeArchiveHierarchyExpansion(model, selectedPath = []) {
  const tabKey = normalizeArchivePathPart(model?.tab || 'archiv');
  if (!_initializedArchiveHierarchyTabs.has(tabKey)) {
    _initializedArchiveHierarchyTabs.add(tabKey);
    const firstChild = model?.root?.children?.[0];
    if (firstChild) _expandedArchiveHierarchyNodes.add(getArchiveHierarchyNodeKey(model.tab, firstChild.path));
  }
  expandArchiveHierarchyPath(model?.tab, selectedPath);
}

function toggleArchiveHierarchyNode(tab, path = []) {
  const key = getArchiveHierarchyNodeKey(tab, path);
  if (_expandedArchiveHierarchyNodes.has(key)) _expandedArchiveHierarchyNodes.delete(key);
  else _expandedArchiveHierarchyNodes.add(key);
}

function getArchiveHierarchyNodeStats(node) {
  const entries = node?.entries || [];
  return {
    moduleCount: entries.length,
    pageCount: entries.reduce((sum, entry) => sum + getArchiveEntryPageCount(entry), 0),
    dialogCount: entries.filter(entry => entry?.appendCommentsPage !== false || hasArchiveEntryPageComments(entry)).length,
    childCount: node?.children?.length || 0
  };
}

function getArchiveHierarchyNodeImage(node) {
  for (const entry of node?.entries || []) {
    const image = getArchiveEntryPreviewImage(entry);
    if (image) return image;
  }
  return '';
}

function getArchiveHierarchySection(node, tab = '') {
  const fallback = node?.section || {};
  return {
    ...fallback,
    key: node?.label || fallback.key || tab || 'Archiv',
    tab: fallback.tab || tab || fallback.key || 'Archiv',
    path: [...(node?.path || [])],
    entries: [...(node?.entries || [])]
  };
}

function renderArchiveHierarchyRowIcon(node, className = 'archive-hierarchy-row-icon') {
  const icon = sanitizeImageSrc(node?.section?.iconUrl || '');
  if (icon) return `<span class="${className}"><img src="${escapeHtml(icon)}" alt="" loading="lazy" decoding="async"></span>`;
  return `<span class="${className} archive-hierarchy-row-mark" aria-hidden="true">✦</span>`;
}

function renderArchiveHierarchyEntry(entry) {
  const image = getArchiveEntryPreviewImage(entry);
  const pageCount = getArchiveEntryPageCount(entry);
  const dialogLabel = getArchiveEntryCommentLabel(entry);
  return `
    <button class="archive-hierarchy-entry" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(entry?.id || '')}">
      ${image
        ? `<span class="archive-hierarchy-entry-icon"><img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async"></span>`
        : `<span class="archive-hierarchy-entry-icon archive-hierarchy-entry-mark" aria-hidden="true">${escapeHtml(entry?.icon || '✦')}</span>`}
      <span class="archive-hierarchy-entry-title">${escapeHtml(entry?.title || 'Unbenanntes Modul')}</span>
      <span class="archive-hierarchy-entry-meta">
        ${pageCount ? `<span>Seiten: ${pageCount}</span>` : ''}
        <span>${escapeHtml(dialogLabel)}</span>
      </span>
    </button>`;
}

function renderArchiveHierarchyNode(node, model, selectedPath = []) {
  const key = getArchiveHierarchyNodeKey(model.tab, node.path);
  const expanded = _expandedArchiveHierarchyNodes.has(key);
  const selected = archivePathsEqual(node.path, selectedPath);
  const stats = getArchiveHierarchyNodeStats(node);
  const expandable = node.children.length > 0 || node.directEntries.length > 0;
  return `
    <div class="archive-hierarchy-node${selected ? ' is-selected' : ''}">
      <div class="archive-hierarchy-row">
        <button class="archive-hierarchy-toggle" type="button" data-archive-action="toggle-hierarchy-node" data-section-path="${escapeHtml(encodeArchivePathData(node.path))}" aria-label="${escapeHtml(node.label)} ${expanded ? 'einklappen' : 'aufklappen'}" aria-expanded="${expanded ? 'true' : 'false'}"${expandable ? '' : ' disabled'}>
          <span aria-hidden="true">${expanded ? '⌄' : '›'}</span>
        </button>
        <button class="archive-hierarchy-select" type="button" data-archive-action="select-hierarchy-node" data-section-path="${escapeHtml(encodeArchivePathData(node.path))}"${selected ? ' aria-current="true"' : ''}>
          ${renderArchiveHierarchyRowIcon(node)}
          <span class="archive-hierarchy-row-title">${escapeHtml(node.label)}</span>
          <span class="archive-hierarchy-row-meta">${stats.moduleCount} Module${stats.childCount ? ` · ${stats.childCount} Unterreiter` : ''}</span>
        </button>
      </div>
      ${expanded ? `
        <div class="archive-hierarchy-children">
          ${node.directEntries.map(renderArchiveHierarchyEntry).join('')}
          ${node.children.map(child => renderArchiveHierarchyNode(child, model, selectedPath)).join('')}
        </div>` : ''}
    </div>`;
}

function renderArchiveHierarchyPreview(node, model) {
  const stats = getArchiveHierarchyNodeStats(node);
  const section = getArchiveHierarchySection(node, model.tab);
  const image = getArchiveHierarchyNodeImage(node);
  const icon = sanitizeImageSrc(section.iconUrl || '');
  const kind = node.path.length ? 'Unterbereich' : 'Archivbereich';
  const description = String(section.desc || getThemeMetaForTab(model.tab).note || '').trim();
  return `
    <aside class="archive-hierarchy-preview" aria-label="Vorschau ${escapeHtml(node.label)}">
      <div class="archive-hierarchy-preview-image${image ? ' has-image' : ''}">
        ${image ? `<img src="${escapeHtml(image)}" alt="" loading="eager" decoding="async">` : '<span aria-hidden="true"></span>'}
        ${icon ? `<img class="archive-hierarchy-preview-emblem" src="${escapeHtml(icon)}" alt="" loading="lazy" decoding="async">` : ''}
      </div>
      <div class="archive-hierarchy-preview-copy">
        <div class="archive-hierarchy-preview-kicker">${escapeHtml(kind)}</div>
        <h3>${escapeHtml(node.label)}</h3>
        ${description ? `<p>${escapeHtml(description)}</p>` : ''}
        <dl class="archive-hierarchy-preview-stats">
          <div><dt>Module</dt><dd>${stats.moduleCount}</dd></div>
          <div><dt>Unterreiter</dt><dd>${stats.childCount}</dd></div>
          <div><dt>Seiten</dt><dd>${stats.pageCount}</dd></div>
          <div><dt>Dialogbereiche</dt><dd>${stats.dialogCount}</dd></div>
        </dl>
        <button class="archive-hierarchy-show" type="button" data-archive-action="show-hierarchy-content" data-section-path="${escapeHtml(encodeArchivePathData(node.path))}">
          Inhalte anzeigen
        </button>
      </div>
    </aside>`;
}

function renderArchiveHierarchyBrowser(model, selectedPath = []) {
  initializeArchiveHierarchyExpansion(model, selectedPath);
  const selectedNode = findArchiveHierarchyNode(model.root, selectedPath) || model.root;
  const rootEntries = model.root.directEntries.map(renderArchiveHierarchyEntry).join('');
  return `
    <div class="archive-hierarchy-browser" data-archive-hierarchy-tab="${escapeHtml(model.tab)}">
      <section class="archive-hierarchy-tree" aria-label="Unterbereiche ${escapeHtml(model.tab)}">
        <div class="archive-hierarchy-tree-head">
          <div class="archive-hierarchy-tree-kicker">Unterbereiche</div>
          ${selectedNode.path.length ? `
            <button type="button" data-archive-action="select-hierarchy-node" data-section-path="${escapeHtml(encodeArchivePathData([]))}">
              Gesamtübersicht
            </button>` : ''}
        </div>
        <div class="archive-hierarchy-tree-scroll">
          ${rootEntries}
          ${model.root.children.map(child => renderArchiveHierarchyNode(child, model, selectedNode.path)).join('')}
          ${!rootEntries && !model.root.children.length ? '<div class="archive-hierarchy-empty">Noch keine Unterbereiche angelegt.</div>' : ''}
        </div>
      </section>
      ${renderArchiveHierarchyPreview(selectedNode, model)}
    </div>`;
}

function renderArchiveHierarchyContentHeading(node) {
  const stats = getArchiveHierarchyNodeStats(node);
  return `
    <div class="archive-hierarchy-content-heading" id="archive-hierarchy-content" tabindex="-1">
      <div>
        <span>Inhalte</span>
        <h3>${escapeHtml(node.label)}</h3>
      </div>
      <small>${stats.moduleCount} Module · ${stats.pageCount} Seiten</small>
    </div>`;
}
