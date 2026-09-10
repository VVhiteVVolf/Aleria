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
  // Keep ancestors visible, but respect an explicitly collapsed selected folder.
  expandArchiveHierarchyPath(model?.tab, selectedPath.slice(0, -1));
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
  return `
    <button class="archive-hierarchy-entry" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(entry?.id || '')}">
      ${image
        ? `<span class="archive-hierarchy-entry-icon"><img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async"></span>`
        : `<span class="archive-hierarchy-entry-icon archive-hierarchy-entry-mark" aria-hidden="true">${escapeHtml(entry?.icon || '✦')}</span>`}
      <span class="archive-hierarchy-entry-title">${escapeHtml(entry?.title || 'Unbenanntes Modul')}</span>
      <span class="archive-hierarchy-entry-meta">${pageCount} S.</span>
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
          <span class="archive-hierarchy-row-meta" title="${stats.moduleCount} Module">${stats.moduleCount}</span>
        </button>
      </div>
      ${expanded ? `
        <div class="archive-hierarchy-children">
          ${node.directEntries.map(renderArchiveHierarchyEntry).join('')}
          ${node.children.map(child => renderArchiveHierarchyNode(child, model, selectedPath)).join('')}
        </div>` : ''}
    </div>`;
}

function renderArchiveHierarchyBrowser(model, selectedPath = [], options = {}) {
  initializeArchiveHierarchyExpansion(model, selectedPath);
  const selectedNode = findArchiveHierarchyNode(model.root, selectedPath) || model.root;
  const rootEntries = model.root.directEntries.map(renderArchiveHierarchyEntry).join('');
  return `
      <details class="archive-hierarchy-tree"${options.navigationOpen ? ' open' : ''}>
        <summary><span class="archive-hierarchy-desktop-label">Inhaltsverzeichnis</span><span class="archive-hierarchy-mobile-label">Bereich wechseln</span><span class="archive-hierarchy-disclosure" aria-hidden="true">⌄</span></summary>
        <div class="archive-hierarchy-tree-scroll">
          <button class="archive-hierarchy-overview" type="button" data-archive-action="select-hierarchy-node" data-section-path="${escapeHtml(encodeArchivePathData([]))}"${!selectedNode.path.length ? ' aria-current="true"' : ''}>Alle Inhalte <span>${model.root.entries.length}</span></button>
          ${rootEntries}
          ${model.root.children.map(child => renderArchiveHierarchyNode(child, model, selectedNode.path)).join('')}
          ${!rootEntries && !model.root.children.length ? '<div class="archive-hierarchy-empty">Noch keine Unterbereiche angelegt.</div>' : ''}
        </div>
      </details>`;
}

function renderArchiveHierarchyBreadcrumbs(node, model) {
  const crumbs = [
    { label: model.root.label, path: [] },
    ...node.path.map((label, index) => ({ label, path: node.path.slice(0, index + 1) }))
  ];
  return `<nav class="archive-hierarchy-breadcrumbs" aria-label="Aktueller Archivpfad">
    <button type="button" data-archive-action="switch-tab" data-tab="Alle">Weltpfade</button>
    ${crumbs.map((crumb, index) => `<span aria-hidden="true">›</span>${index === crumbs.length - 1
      ? `<span aria-current="page">${escapeHtml(crumb.label)}</span>`
      : `<button type="button" data-archive-action="select-hierarchy-node" data-section-path="${escapeHtml(encodeArchivePathData(crumb.path))}">${escapeHtml(crumb.label)}</button>`}`).join('')}
  </nav>`;
}

function renderArchiveHierarchyContentHeading(node, model) {
  const stats = getArchiveHierarchyNodeStats(node);
  const section = getArchiveHierarchySection(node, model.tab);
  const icon = !node.path.length
    ? getArchiveDashboardTabIcon(model.tab, section.iconUrl)
    : sanitizeImageSrc(section.iconUrl || '');
  const image = icon || getArchiveHierarchyNodeImage(node);
  const description = String(section.desc || (!node.path.length ? getThemeMetaForTab(model.tab).note : '') || '').trim();
  return `
    ${renderArchiveHierarchyBreadcrumbs(node, model)}
    <header class="archive-hierarchy-content-heading">
      ${image ? `<img class="archive-hierarchy-heading-image${icon ? ' is-emblem' : ''}" src="${escapeHtml(image)}" alt="" decoding="async">` : ''}
      <div>
        <h2>${escapeHtml(node.label)}</h2>
        ${description ? `<p>${escapeHtml(description)}</p>` : ''}
        <small>${stats.moduleCount} ${stats.moduleCount === 1 ? 'Modul' : 'Module'} · ${stats.pageCount} ${stats.pageCount === 1 ? 'Seite' : 'Seiten'}</small>
      </div>
    </header>`;
}

function restoreArchiveHierarchyFocus(path, toggle = false) {
  const browser = document.querySelector('[data-archive-hierarchy-tab]');
  if (!browser) return;
  const details = browser.querySelector('.archive-hierarchy-tree');
  if (!toggle && window.matchMedia('(max-width: 1100px)').matches) {
    details.open = false;
    details.querySelector('summary')?.focus({ preventScroll: true });
    return;
  }
  const action = toggle ? 'toggle-hierarchy-node' : 'select-hierarchy-node';
  const target = [...browser.querySelectorAll(`[data-archive-action="${action}"]`)]
    .find(button => button.dataset.sectionPath === encodeArchivePathData(path));
  target?.focus({ preventScroll: true });
}
