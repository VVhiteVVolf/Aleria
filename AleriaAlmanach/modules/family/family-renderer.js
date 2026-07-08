// Renders the dedicated family tree module template.

function buildFamilyNodeCard(node) {
  const portrait = sanitizeImageSrc(node.portrait || '');
  const type = getFamilyMemberType(node.familyType);
  return `
    <article class="hierarchy-node-card family-node-card family-type-${escapeHtml(type)}" data-family-node-id="${escapeHtml(node.id)}">
      <div class="hierarchy-node-portrait">
        ${portrait
          ? `<img src="${portrait}" alt="${escapeHtml(node.title)}" loading="lazy" decoding="async">`
          : '<div class="hierarchy-node-placeholder"></div>'}
      </div>
      <div class="hierarchy-node-copy">
        <div class="family-node-type">${escapeHtml(getFamilyMemberTypeLabel(type, true))}</div>
        <h4>${escapeHtml(node.title || 'Unbenanntes Familienmitglied')}</h4>
        ${node.subtitle ? `<div class="hierarchy-node-subtitle">${escapeHtml(node.subtitle)}</div>` : ''}
        ${node.text ? `<p>${sanitizeContentHtml(node.text)}</p>` : ''}
      </div>
    </article>`;
}

function buildFamilyLevel(level, index) {
  const nodes = Array.isArray(level.nodes) ? level.nodes.slice(0, 8) : [];
  if (!nodes.length) return '';
  return `
    <section class="hierarchy-chart-level family-chart-level cols-${Math.max(1, Math.min(8, nodes.length))}" data-family-level="${index}">
      ${level.label ? `<div class="hierarchy-level-label">${escapeHtml(level.label)}</div>` : ''}
      <div class="hierarchy-level-nodes family-level-nodes">
        ${nodes.map(buildFamilyNodeCard).join('')}
      </div>
    </section>`;
}

function buildFamilyTreeTabs(trees = []) {
  const safeTrees = Array.isArray(trees) ? trees : [];
  if (!safeTrees.length) return '';
  return `
    <div class="hierarchy-tree-tabs" role="tablist" aria-label="Familienbaeume">
      ${safeTrees.map((tree, index) => `
        <button
          class="hierarchy-tree-tab${index === 0 ? ' active' : ''}"
          type="button"
          role="tab"
          aria-selected="${index === 0 ? 'true' : 'false'}"
          data-hierarchy-tree-tab="${index}">
          ${escapeHtml(tree.label || `Familienbaum ${index + 1}`)}
        </button>`).join('')}
    </div>`;
}

function buildFamilyConnectionData(connections = []) {
  return escapeHtml(JSON.stringify(Array.isArray(connections) ? connections : []));
}

function collectFamilyTreeDescentConnections(tree = {}) {
  return (Array.isArray(tree?.levels) ? tree.levels : [])
    .flatMap(level => Array.isArray(level?.nodes) ? level.nodes : [])
    .flatMap(node => (Array.isArray(node?.parentIds) ? node.parentIds : [])
      .map(parentId => ({ from: parentId, to: node.id, relationType: 'parent', label: '' })));
}

function collectFamilyTreeConnections(trees = []) {
  return (Array.isArray(trees) ? trees : [])
    .flatMap(tree => [
      ...collectFamilyTreeDescentConnections(tree),
      ...(Array.isArray(tree?.connections) ? tree.connections : [])
    ]);
}

function buildFamilyTreePanel(tree, index, layoutMode, displayMode = 'tabs') {
  const levels = Array.isArray(tree?.levels) ? tree.levels : [];
  const active = displayMode === 'parallel' || displayMode === 'groups' || index === 0;
  return `
    <div class="hierarchy-chart-panel family-tree-panel${active ? ' active' : ''}" data-hierarchy-tree-panel="${index}" data-hierarchy-tree-id="${escapeHtml(getHierarchyTreeId(tree, index))}">
      <div class="family-chart-wrap">
        ${displayMode === 'parallel' || displayMode === 'groups' ? `<div class="family-tree-heading">${escapeHtml(tree?.label || `Familienbaum ${index + 1}`)}</div>` : ''}
        <div class="hierarchy-chart family-chart mode-${escapeHtml(layoutMode)}">
          ${levels.length
            ? levels.map(buildFamilyLevel).join('')
            : '<div class="hierarchy-empty-tree">Noch keine Ebenen in diesem Familienbaum.</div>'}
        </div>
      </div>
    </div>`;
}

function getFamilyConnectionPoint(containerRect, node) {
  if (!node.getClientRects().length) return null;
  const rect = node.getBoundingClientRect();
  return {
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height / 2
  };
}

function drawFamilyConnectionsInScope(scope) {
  if (!scope) return;
  const svg = scope.querySelector(':scope > .family-connection-layer');
  const panels = scope.querySelector(':scope > .family-chart-panels');
  if (!svg || !panels) return;
  if (scope.querySelector('.family-chart.mode-depth')) {
    svg.innerHTML = '';
    return;
  }
  const raw = scope.dataset.familyConnections || '[]';
  let connections = [];
  try {
    connections = JSON.parse(raw);
  } catch (error) {
    connections = [];
  }

  const width = Math.max(scope.scrollWidth, panels.scrollWidth, scope.clientWidth);
  const height = Math.max(scope.scrollHeight, panels.scrollHeight, scope.clientHeight);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.innerHTML = '';

  if (!connections.length) return;

  const containerRect = scope.getBoundingClientRect();
  const fragment = document.createDocumentFragment();
  const escapeSelectorValue = value => window.CSS?.escape ? CSS.escape(value) : String(value || '').replace(/"/g, '\\"');
  connections.forEach(connection => {
    const from = scope.querySelector(`[data-family-node-id="${escapeSelectorValue(connection.from || '')}"]`);
    const to = scope.querySelector(`[data-family-node-id="${escapeSelectorValue(connection.to || '')}"]`);
    if (!from || !to) return;
    const start = getFamilyConnectionPoint(containerRect, from);
    const end = getFamilyConnectionPoint(containerRect, to);
    if (!start || !end) return;
    const midX = (start.x + end.x) / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', `family-connection-line relation-${String(connection.relationType || 'blood').replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'blood'}`);
    path.setAttribute('d', `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`);
    fragment.appendChild(path);

    if (connection.label) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'family-connection-label');
      text.setAttribute('x', (start.x + end.x) / 2);
      text.setAttribute('y', (start.y + end.y) / 2 - 6);
      text.setAttribute('text-anchor', 'middle');
      text.textContent = connection.label;
      fragment.appendChild(text);
    }
  });
  svg.appendChild(fragment);
}

function redrawFamilyConnections(root = document) {
  root.querySelectorAll?.('.family-chart-connection-scope').forEach(drawFamilyConnectionsInScope);
}

let familyConnectionAnimationFrame = 0;
const pendingFamilyConnectionRoots = new Set();

function scheduleFamilyConnectionRedraw(root = document) {
  pendingFamilyConnectionRoots.add(root || document);
  if (familyConnectionAnimationFrame) return;
  familyConnectionAnimationFrame = requestAnimationFrame(() => {
    familyConnectionAnimationFrame = 0;
    pendingFamilyConnectionRoots.forEach(nextRoot => redrawFamilyConnections(nextRoot));
    pendingFamilyConnectionRoots.clear();
  });
}

document.addEventListener('DOMContentLoaded', () => scheduleFamilyConnectionRedraw());
window.addEventListener('resize', () => scheduleFamilyConnectionRedraw());
document.addEventListener('load', event => {
  if (event.target?.closest?.('.family-page')) scheduleFamilyConnectionRedraw(event.target.closest('.family-page'));
}, true);
document.addEventListener('click', event => {
  if (event.target?.closest?.('[data-hierarchy-tree-tab], [data-hierarchy-fullscreen-toggle], [data-hierarchy-sidebar-toggle], [data-hierarchy-intro-toggle]')) {
    scheduleFamilyConnectionRedraw(event.target.closest('.family-page') || document);
  }
});
document.addEventListener('input', event => {
  if (event.target?.closest?.('[data-hierarchy-scale-input]')) {
    scheduleFamilyConnectionRedraw(event.target.closest('.family-page') || document);
  }
});
document.addEventListener('scroll', event => {
  const viewport = event.target?.closest?.('.family-page .hierarchy-chart-viewport');
  if (viewport) scheduleFamilyConnectionRedraw(viewport.closest('.family-page'));
}, true);

function buildFamilyLegend() {
  return `
    <div class="family-legend">
      ${Object.entries(FAMILY_MEMBER_TYPES).map(([type, config]) => `
        <span class="family-legend-item family-type-${escapeHtml(type)}">${escapeHtml(config.label)}</span>`).join('')}
    </div>`;
}

function buildFamilyPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeFamilyData(page.family || {});
  const emblem = sanitizeImageSrc(data.emblem || entry.symbol || '');
  const sideImage = sanitizeImageSrc(data.sideImage || page.image || '');
  const trees = data.trees.length
    ? data.trees
    : [{ label: data.chartTitle || 'Stammbaum', levels: data.levels, connections: [] }];
  const displayMode = ['parallel', 'groups'].includes(data.treeDisplayMode) ? data.treeDisplayMode : 'tabs';
  const chartScale = data.chartScale / 100;
  const style = [
    `--hierarchy-card-font-scale:${data.cardFontScale / 100}`,
    `--hierarchy-portrait-scale:${data.portraitScale / 100}`,
    `--hierarchy-chart-scale:${chartScale}`,
    `--hierarchy-effective-card-font-scale:${(data.cardFontScale / 100) * chartScale}`,
    `--hierarchy-effective-portrait-scale:${(data.portraitScale / 100) * chartScale}`
  ].join(';');
  return `
    ${nav}
    <div class="hierarchy-page family-page" style="${style}" data-hierarchy-card-scale="${data.cardFontScale / 100}" data-hierarchy-portrait-scale="${data.portraitScale / 100}">
      <header class="hierarchy-topbar">
        <div class="hierarchy-titlemark">
          ${emblem ? `<img src="${emblem}" alt="" loading="lazy" decoding="async">` : '<div class="hierarchy-emblem-placeholder"></div>'}
          <div>
            <h2>${escapeHtml(data.eyebrow)}</h2>
            <p>${escapeHtml(data.subtitle)}</p>
          </div>
        </div>
        <div class="hierarchy-center-label"><span>${escapeHtml(data.centerLabel)}</span></div>
        <div class="hierarchy-top-actions">
          <button class="hierarchy-view-button" type="button" data-hierarchy-fullscreen-toggle aria-pressed="false">Stammbaum Vollbild</button>
          <button class="hierarchy-view-button hierarchy-sidebar-toggle" type="button" data-hierarchy-sidebar-toggle aria-expanded="true">Sidebar einklappen</button>
        </div>
      </header>

      <div class="hierarchy-document">
        <aside class="hierarchy-sidebar">
          <div class="hierarchy-side-head">
            <div class="hierarchy-side-image">
              ${sideImage ? `<img src="${sideImage}" alt="" loading="lazy" decoding="async">` : '<div class="hierarchy-watermark"></div>'}
            </div>
            <div class="hierarchy-side-copy">
              <h3>${escapeHtml(data.organizationTitle)}</h3>
              ${data.motto ? `<p class="hierarchy-motto">${escapeHtml(data.motto)}</p>` : ''}
            </div>
            ${data.description ? `<div class="hierarchy-description">${sanitizeContentHtml(data.description)}</div>` : ''}
          </div>

          <div class="hierarchy-sidebar-divider"></div>
          <section>
            <h4>${escapeHtml(data.detailsTitle)}</h4>
            <div class="hierarchy-details">${data.details.map(buildHierarchyDetailRow).join('')}</div>
          </section>
          <section>
            <h4>Familientypen</h4>
            ${buildFamilyLegend()}
          </section>
          ${data.quote ? `
            <blockquote class="hierarchy-quote">
              <span>${escapeHtml(data.quoteLabel)}</span>
              <p>${sanitizeContentHtml(data.quote)}</p>
            </blockquote>` : ''}
        </aside>

        <main class="hierarchy-main">
          <div class="hierarchy-section-head">
            <h3>${escapeHtml(data.chartTitle)}</h3>
            ${data.chartIntro ? `<p>${sanitizeContentHtml(data.chartIntro)}</p>` : ''}
          </div>
          <div class="hierarchy-view-controls">
            ${displayMode === 'tabs' ? buildFamilyTreeTabs(trees) : ''}
            <button class="hierarchy-view-button" type="button" data-hierarchy-intro-toggle aria-expanded="true">Aufbau-Text einklappen</button>
            <label>
              <span>Ansicht</span>
              <input type="range" min="55" max="170" step="1" value="${escapeHtml(data.chartScale)}" data-hierarchy-scale-input>
              <strong data-hierarchy-scale-value>${escapeHtml(data.chartScale)}%</strong>
            </label>
          </div>
          <div class="hierarchy-ornament-line"></div>
          <div class="hierarchy-chart-viewport">
            <div class="family-chart-connection-scope" data-family-connections="${buildFamilyConnectionData(collectFamilyTreeConnections(trees))}">
              <svg class="family-connection-layer" aria-hidden="true"></svg>
              <div class="hierarchy-chart-panels family-chart-panels family-tree-mode-${escapeHtml(displayMode)}">
                ${displayMode === 'groups'
                  ? buildHierarchyTreeGroups(trees, data.layoutMode, buildFamilyTreePanel)
                  : trees.map((tree, treeIndex) => buildFamilyTreePanel(tree, treeIndex, data.layoutMode, displayMode)).join('')}
              </div>
            </div>
          </div>
        </main>
      </div>

      ${data.footerNote ? `
        <footer class="hierarchy-footer">
          <div class="hierarchy-note">${sanitizeContentHtml(data.footerNote)}</div>
        </footer>` : ''}
    </div>`;
}
