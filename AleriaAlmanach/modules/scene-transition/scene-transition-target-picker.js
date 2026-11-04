// The destination picker projects the existing Almanach hierarchy, never a second taxonomy.
function getSceneTransitionTargetModels(sourceThreadId = '') {
  const sections = getValidSections();
  const entriesBySection = new Map();
  getSceneTransitionCatalog(sections).forEach(scene => {
    if (scene.endpoint.threadId === sourceThreadId) return;
    if (!entriesBySection.has(scene.section)) entriesBySection.set(scene.section, new Map());
    const entries = entriesBySection.get(scene.section);
    if (!entries.has(scene.entry.id)) entries.set(scene.entry.id, { ...scene.entry, transitionScenes: [] });
    entries.get(scene.entry.id).transitionScenes.push(scene);
  });
  const tabs = new Map();
  sections.forEach(section => {
    const tab = section.tab || section.key || 'Archiv';
    if (!tabs.has(tab)) tabs.set(tab, []);
    tabs.get(tab).push({ ...section, entries: [...(entriesBySection.get(section)?.values() || [])] });
  });
  return [...tabs].map(([tab, tabSections]) => buildArchiveHierarchyModel(tabSections, tab))
    .filter(model => model.root.entries.length);
}

function renderSceneTransitionPlaceIcon(source = '', fallback = '▱') {
  const image = sanitizeImageSrc(source);
  return `<span class="scene-transition-place-icon" aria-hidden="true">${image
    ? `<img src="${image}" alt="" loading="lazy" decoding="async">`
    : escapeHtml(fallback)}</span>`;
}

function getSceneTransitionTargetPath(scene) {
  const labels = [scene.endpoint.entryTitle, scene.endpoint.pageTitle]
    .filter((label, index, all) => index === 0 || label !== all[index - 1]);
  return [getSectionOptionLabel(scene.section), ...labels].join(' › ');
}

function renderSceneTransitionTargetOption(scene) {
  const { endpoint, entry, page } = scene;
  const path = getSceneTransitionTargetPath(scene);
  // Archive previews are already sanitized for an HTML attribute.
  const image = sanitizeImageSrc(page.image || '') || getArchiveEntryPreviewImage(entry);
  const icon = image
    ? `<span class="scene-transition-place-icon" aria-hidden="true"><img src="${image}" alt="" loading="lazy" decoding="async"></span>`
    : renderSceneTransitionPlaceIcon('', entry.icon || '↪');
  return `<button type="button" class="scene-transition-target-option" data-scene-transition-action="select-target" data-transition-thread-id="${escapeHtml(endpoint.threadId)}" data-target-path="${escapeHtml(path)}" data-target-search="${escapeHtml(normalizeSearchText(path))}" aria-pressed="false">
    ${icon}<span class="scene-transition-target-copy"><strong>${escapeHtml(endpoint.pageTitle)}</strong><small>${escapeHtml(endpoint.entryTitle)}</small></span>
  </button>`;
}

function renderSceneTransitionTargetEntry(entry, sourceEntryId) {
  const scenes = entry.transitionScenes || [];
  return `<details class="scene-transition-target-group"${entry.id === sourceEntryId ? ' open' : ''}>
    <summary>${renderSceneTransitionPlaceIcon(entry.previewImage || entry.image || '', entry.icon || '▤')}<span class="scene-transition-target-label">${escapeHtml(entry.title)}</span><small>${scenes.length} ${scenes.length === 1 ? 'Szene' : 'Szenen'}</small></summary>
    <div class="scene-transition-target-children">${scenes.map(renderSceneTransitionTargetOption).join('')}</div>
  </details>`;
}

function renderSceneTransitionTargetNode(node, model, sourceEntryId, isRoot = false, sourceSection = null) {
  if (!node.entries.length) return '';
  const count = node.entries.reduce((sum, entry) => sum + entry.transitionScenes.length, 0);
  const sourcePath = sourceSection ? getSectionPathParts(sourceSection) : [];
  const sourceHere = node.entries.some(entry => entry.id === sourceEntryId) || (
    sourceSection && (sourceSection.tab || sourceSection.key || 'Archiv') === model.tab
    && node.path.length <= sourcePath.length
    && node.path.every((part, index) => normalizeSearchText(part) === normalizeSearchText(sourcePath[index]))
  );
  const image = isRoot ? getArchiveDashboardTabIcon(model.tab, node.section?.iconUrl) : sanitizeImageSrc(node.section?.iconUrl || '');
  // image is already attribute-safe; render it directly.
  const icon = image ? `<span class="scene-transition-place-icon" aria-hidden="true"><img src="${image}" alt="" loading="lazy" decoding="async"></span>` : renderSceneTransitionPlaceIcon();
  return `<details class="scene-transition-target-group"${sourceHere ? ' open' : ''}>
    <summary>${icon}<span class="scene-transition-target-label">${escapeHtml(isRoot ? model.tab : node.label)}</span><small>${count} ${count === 1 ? 'Szene' : 'Szenen'}</small></summary>
    <div class="scene-transition-target-children">${node.children.map(child => renderSceneTransitionTargetNode(child, model, sourceEntryId, false, sourceSection)).join('')}${node.directEntries.map(entry => renderSceneTransitionTargetEntry(entry, sourceEntryId)).join('')}</div>
  </details>`;
}

function initializeSceneTransitionTargetPicker(overlay, source) {
  const browser = overlay.querySelector('[data-scene-transition-targets]');
  const sourceSection = typeof findCurrentSectionByEntryId === 'function'
    ? findCurrentSectionByEntryId(source.entryId)?.section : null;
  browser.innerHTML = getSceneTransitionTargetModels(source.threadId)
    .map(model => renderSceneTransitionTargetNode(model.root, model, source.entryId, true, sourceSection)).join('');
  overlay.querySelector('#scene-transition-target').value = '';
  const search = overlay.querySelector('#scene-transition-target-search');
  search.value = '';
  const selection = overlay.querySelector('[data-scene-transition-target-selection]');
  selection.textContent = 'Noch keine Zielszene gewählt.';
  const origin = overlay.querySelector('[data-scene-transition-origin]');
  origin.textContent = `Von: ${source.entryTitle === source.pageTitle ? source.pageTitle : `${source.entryTitle} › ${source.pageTitle}`}`;
  filterSceneTransitionTargets(search);
}

function filterSceneTransitionTargets(input) {
  const scope = input.closest('.scene-transition-target-section');
  const terms = normalizeSearchText(input.value || '').split(/\s+/).filter(Boolean);
  const browser = scope.querySelector('[data-scene-transition-targets]');
  browser?.classList.toggle('is-searching', terms.length > 0);
  if (browser && terms.length && !('beforeSearchScroll' in browser.dataset)) {
    browser.dataset.beforeSearchScroll = String(browser.scrollTop);
  }
  let count = 0;
  scope.querySelectorAll('[data-target-search]').forEach(button => {
    button.hidden = !terms.every(term => button.dataset.targetSearch.includes(term));
    if (!button.hidden) count += 1;
  });
  // Restore browsing state after a search rather than leaving every folder expanded.
  [...scope.querySelectorAll('.scene-transition-target-group')].reverse().forEach(group => {
    group.hidden = !group.querySelector('[data-target-search]:not([hidden])');
    if (terms.length) {
      if (!('beforeSearch' in group.dataset)) group.dataset.beforeSearch = String(group.open);
      group.open = !group.hidden;
    } else if ('beforeSearch' in group.dataset) {
      group.open = group.dataset.beforeSearch === 'true';
      delete group.dataset.beforeSearch;
    }
  });
  scope.querySelector('[data-scene-transition-target-count]').textContent = `${count} ${count === 1 ? 'Szene' : 'Szenen'}${terms.length ? ' gefunden' : ' verfügbar'}`;
  scope.querySelector('[data-scene-transition-target-empty]').hidden = count > 0;
  // Deep room paths can exceed the viewport before the first result is reached.
  // Scroll only this browser, preserving the dialog and the previous browsing position.
  const firstMatch = browser?.querySelector('[data-target-search]:not([hidden])');
  if (terms.length && firstMatch) {
    const bounds = browser.getBoundingClientRect();
    const targetBounds = firstMatch.getBoundingClientRect();
    if (targetBounds.top < bounds.top || targetBounds.bottom > bounds.bottom) {
      browser.scrollTop += targetBounds.top - bounds.top - 8;
    }
  } else if (browser && !terms.length && 'beforeSearchScroll' in browser.dataset) {
    browser.scrollTop = Number(browser.dataset.beforeSearchScroll) || 0;
    delete browser.dataset.beforeSearchScroll;
  }
}

function selectSceneTransitionTarget(button) {
  const overlay = button.closest('#scene-transition-overlay');
  overlay.querySelector('#scene-transition-target').value = button.dataset.transitionThreadId;
  overlay.querySelectorAll('[data-scene-transition-action="select-target"]').forEach(option => {
    option.setAttribute('aria-pressed', String(option === button));
  });
  overlay.querySelector('[data-scene-transition-target-selection]').textContent = `Ziel: ${button.dataset.targetPath}`;
  setSceneTransitionStatus('');
  renderSceneTransitionPreview();
}
