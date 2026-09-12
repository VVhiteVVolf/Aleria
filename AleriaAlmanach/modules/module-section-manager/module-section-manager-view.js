// View state belongs to this dialog; persistence remains in module-store.
const moduleSectionManagerView = (() => {
  const state = { section: '', type: '', sort: 'title-asc', descendants: true, selectedOnly: false, panel: '' };
  let sections = [];
  let entries = [];
  let returnFocus = null;
  const element = id => document.getElementById(id);
  const compare = (a, b) => String(a || '').localeCompare(String(b || ''), 'de', { numeric: true, sensitivity: 'base' });
  const title = item => item.entry?.title || item.entry?.id || 'Unbenanntes Modul';
  const type = item => String(item.entry?.type || item.entry?.category || '').trim();

  function refresh(nextSections, nextEntries) {
    sections = nextSections;
    entries = nextEntries;
    if (state.section && !sections.some(section => makeSectionSignature(section) === state.section)) state.section = '';
    const types = [...new Set(entries.map(type).filter(Boolean))].sort(compare);
    if (!types.includes(state.type)) state.type = '';
    const typeSelect = element('msm-type-filter');
    typeSelect.innerHTML = '<option value="">Alle Typen</option>' + types.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
    typeSelect.value = state.type;
    element('msm-overview').textContent = `${sections.length} Bereiche · ${entries.length} Module`;
    element('msm-all-count').textContent = entries.length;
    renderContext();
  }

  function activeSection() {
    return sections.find(section => makeSectionSignature(section) === state.section) || null;
  }

  function scopedSignatures() {
    const active = activeSection();
    if (!active) return null;
    return new Set(sections.filter(section => state.descendants
      ? isSectionDescendantOrSelf(section, active)
      : makeSectionSignature(section) === state.section).map(makeSectionSignature));
  }

  function visibleEntries(items, search = '') {
    const scope = scopedSignatures();
    const terms = normalizeSearchText(search).split(/\s+/).filter(Boolean);
    return items.filter(item => {
      if (scope && !scope.has(item.sectionSignature)) return false;
      if (state.type && type(item) !== state.type) return false;
      if (state.selectedOnly && !_selectedModuleSectionManagerIds.has(String(item.entry?.id || ''))) return false;
      const text = normalizeSearchText([title(item), item.entry?.id, type(item), getSectionOptionLabel(item.section)].join(' '));
      return terms.every(term => text.includes(term));
    }).sort((a, b) => {
      if (state.sort === 'section') {
        const order = compare(getSectionOptionLabel(a.section), getSectionOptionLabel(b.section));
        if (order) return order;
      }
      if (state.sort === 'type') {
        const order = compare(type(a), type(b));
        if (order) return order;
      }
      const order = compare(title(a), title(b)) || compare(a.entry?.id, b.entry?.id);
      return state.sort === 'title-desc' ? -order : order;
    });
  }

  function renderContext() {
    const section = activeSection();
    element('msm-context-title').textContent = section ? getSectionLeafLabel(section) : 'Alle Module';
    element('msm-context-description').textContent = section?.desc || (section ? 'Module in diesem Bereich verwalten und neu zuordnen.' : 'Dein gesamtes Archiv an einem Ort. Wähle links einen Bereich oder suche nach einem Modul.');
    element('msm-context-actions').hidden = !section;
    element('msm-descendants-label').hidden = !section;
    element('msm-all-sections').setAttribute('aria-pressed', String(!section));
    const ancestors = section?.nodeId ? getModuleNodeAncestors(section.nodeId) : [];
    element('msm-breadcrumb').innerHTML = '<button type="button" data-section-manager-action="select-section" data-section-signature="">Archiv</button>' + ancestors.map(node => {
      const parent = sections.find(item => item.nodeId === node.id);
      return parent ? `<span aria-hidden="true">/</span><button type="button" data-section-manager-action="select-section" data-section-signature="${escapeHtml(makeSectionSignature(parent))}">${escapeHtml(node.title)}</button>` : '';
    }).join('') + `<span aria-hidden="true">/</span><span>${escapeHtml(section ? getSectionLeafLabel(section) : 'Alle Module')}</span>`;
  }

  function renderSections(items) {
    const list = element('msm-section-list');
    if (!list) return;
    const needle = normalizeSearchText(element('msm-section-filter')?.value || '');
    const byNode = new Map(items.filter(section => section.nodeId).map(section => [section.nodeId, section]));
    const parents = getModuleSectionParentNodeIds(items);
    const matches = new Set();
    const counts = new Map();
    entries.forEach(item => counts.set(item.sectionSignature, (counts.get(item.sectionSignature) || 0) + 1));
    items.forEach(section => {
      if (!needle || normalizeSearchText(getSectionOptionLabel(section)).includes(needle)) {
        matches.add(makeSectionSignature(section));
        if (needle && section.nodeId) getModuleNodeAncestors(section.nodeId).forEach(node => {
          if (byNode.has(node.id)) matches.add(makeSectionSignature(byNode.get(node.id)));
        });
      }
    });
    // Group every descendant with its parent, even when a parent has been renamed.
    const ordered = [...items].sort((a, b) => {
      const path = section => section.nodeId
        ? [...getModuleNodeAncestors(section.nodeId).map(node => node.title), getSectionLeafLabel(section)]
        : [section.tab || section.key, ...getSectionPathParts(section)];
      const left = path(a), right = path(b);
      for (let index = 0; index < Math.min(left.length, right.length); index++) {
        const order = compare(left[index], right[index]);
        if (order) return order;
      }
      return left.length - right.length;
    });
    const visible = ordered.filter(section => matches.has(makeSectionSignature(section)) && (needle || !getModuleNodeAncestors(section.nodeId).some(node => _collapsedModuleSectionNodeIds.has(node.id))));
    element('msm-section-count').textContent = needle ? `${visible.length} / ${items.length}` : items.length;
    list.innerHTML = visible.map(section => {
      const signature = makeSectionSignature(section);
      const depth = Math.min(getModuleNodeAncestors(section.nodeId).length, 7);
      const hasChildren = parents.has(section.nodeId);
      const collapsed = !needle && _collapsedModuleSectionNodeIds.has(section.nodeId);
      const icon = sanitizeImageSrc(section.iconUrl || findModuleSectionNodeById(section.nodeId)?.iconUrl || '');
      const label = getSectionLeafLabel(section);
      return `<div class="module-section-manager-section-row${signature === state.section ? ' is-selected' : ''}" style="--section-indent:${depth * 14}px">
        ${hasChildren ? `<button type="button" class="module-section-manager-collapse-btn" data-section-manager-action="toggle-section-collapse" data-node-id="${escapeHtml(section.nodeId)}" aria-expanded="${!collapsed}" aria-label="${escapeHtml(label)} ${collapsed ? 'ausklappen' : 'einklappen'}">${collapsed ? '▸' : '▾'}</button>` : '<span class="module-section-manager-collapse-spacer"></span>'}
        <button type="button" class="module-section-manager-section-main" data-section-manager-action="select-section" data-section-signature="${escapeHtml(signature)}" aria-pressed="${signature === state.section}" title="${escapeHtml(getSectionOptionLabel(section))}">
          <span class="module-section-manager-section-icon" aria-hidden="true">${icon ? `<img src="${escapeHtml(icon)}" alt="" loading="lazy">` : '▱'}</span>
          <strong>${escapeHtml(label)}</strong><span class="msm-count" title="Module direkt in diesem Bereich">${counts.get(signature) || 0}</span>
        </button></div>`;
    }).join('') || '<div class="module-section-manager-empty">Kein passender Bereich.<br>Versuche einen anderen Suchbegriff.</div>';
  }

  function renderModules(items, search = '') {
    const list = element('msm-module-list');
    if (!list) return;
    pruneModuleSectionManagerSelection(items);
    const visible = visibleEntries(items, search);
    const scope = scopedSignatures();
    const total = scope ? items.filter(item => scope.has(item.sectionSignature)).length : items.length;
    element('msm-result-count').textContent = `${visible.length} von ${total} Modulen`;
    element('msm-reset-filters').hidden = !search && !state.type && !state.selectedOnly;
    list.innerHTML = visible.map(item => {
      const id = String(item.entry?.id || '');
      const checked = _selectedModuleSectionManagerIds.has(id);
      const label = title(item);
      const sectionLabel = getSectionOptionLabel(item.section);
      return `<div class="module-section-manager-module-row${checked ? ' is-selected' : ''}" data-module-row="${escapeHtml(id)}">
        <input type="checkbox" data-section-manager-action="select-module" data-entry-id="${escapeHtml(id)}"${checked ? ' checked' : ''} aria-label="${escapeHtml(label)} auswählen">
        <div class="module-section-manager-module-main"><strong>${escapeHtml(label)}</strong><small title="Modul-ID">${escapeHtml(id)}</small></div>
        <button type="button" class="msm-module-location" data-section-manager-action="select-section" data-section-signature="${escapeHtml(item.sectionSignature)}" title="${escapeHtml(sectionLabel)}">${escapeHtml(sectionLabel)}</button>
        <span class="msm-type-badge">${escapeHtml(type(item) || 'Modul')}</span>
        <button type="button" class="msm-row-move" data-section-manager-action="prepare-move" data-entry-id="${escapeHtml(id)}" aria-label="${escapeHtml(label)} zum Verschieben auswählen">Verschieben <span aria-hidden="true">↗</span></button>
      </div>`;
    }).join('') || `<div class="module-section-manager-empty"><span aria-hidden="true">▤</span><strong>${state.selectedOnly ? 'Keine ausgewählten Module in dieser Ansicht' : total ? 'Keine passenden Module' : 'Dieser Bereich ist noch leer'}</strong><p>${total ? 'Passe die Suche oder die Filter an.' : 'Importiere ein Modul oder verschiebe vorhandene Module in diesen Bereich.'}</p>${!total && !state.selectedOnly ? '<button type="button" data-section-manager-action="show-import">Module importieren</button>' : '<button type="button" data-section-manager-action="reset-filters">Filter zurücksetzen</button>'}</div>`;
    renderModuleSectionManagerBulkBar(visible);
  }

  function renderBulkBar(visible) {
    const count = _selectedModuleSectionManagerIds.size;
    const visibleSelected = visible.filter(item => _selectedModuleSectionManagerIds.has(String(item.entry?.id || ''))).length;
    element('msm-module-bulk-bar').hidden = !count;
    element('msm-module-bulk-count').textContent = `${count} ausgewählt${count > visibleSelected ? ` · ${count - visibleSelected} außerhalb der Ansicht` : ''}`;
    const target = element('msm-module-bulk-target');
    const previous = target.value;
    target.innerHTML = '<option value="">Zielbereich wählen …</option>' + buildModuleSectionTargetOptions(previous);
    target.value = sections.some(section => makeSectionSignature(section) === previous) ? previous : '';
    const selectAll = element('msm-module-select-all');
    selectAll.checked = visible.length > 0 && visibleSelected === visible.length;
    selectAll.indeterminate = visibleSelected > 0 && visibleSelected < visible.length;
    selectAll.disabled = !visible.length;
  }

  function selectSection(signature) {
    state.section = signature;
    closeModuleSectionEditor();
    showPanel('');
    renderContext();
    renderSections(sections);
    renderModules(entries, element('msm-module-filter').value);
    element('msm-module-list').scrollTop = 0;
  }

  function showPanel(panel, focusSelector) {
    if (panel && !state.panel) returnFocus = document.activeElement;
    state.panel = panel;
    element('msm-inspector').hidden = !panel;
    element('module-section-manager-overlay').dataset.panel = panel;
    element('msm-inspector').querySelectorAll('[data-manager-panel]').forEach(item => { item.hidden = item.dataset.managerPanel !== panel; });
    if (focusSelector) element('msm-inspector').querySelector(focusSelector)?.focus();
    if (!panel && returnFocus?.isConnected) { returnFocus.focus(); returnFocus = null; }
  }

  function resetFilters() {
    state.type = '';
    state.selectedOnly = false;
    element('msm-type-filter').value = '';
    element('msm-selected-only').checked = false;
    element('msm-module-filter').value = '';
    renderModules(entries);
  }

  function handleClick(action, trigger) {
    switch (action) {
      case 'select-section': selectSection(trigger.dataset.sectionSignature || ''); break;
      case 'show-create': closeModuleSectionEditor(); showPanel('create', '#msm-tab'); break;
      case 'show-import':
        closeModuleSectionEditor();
        if (state.section) element('msm-import-target').value = state.section;
        showPanel('import', '#msm-import-target'); break;
      case 'close-inspector': closeModuleSectionEditor(); showPanel(''); break;
      case 'edit-active-section': openModuleSectionEditor(state.section); break;
      case 'add-active-child': openModuleSectionEditor(state.section, { mode: 'child' }); break;
      case 'apply-section-parent':
        moveModuleSectionToParent(_moduleSectionEditorSignature, element('msm-edit-parent').value); break;
      case 'prepare-move':
        _selectedModuleSectionManagerIds.add(trigger.dataset.entryId);
        renderModules(entries, element('msm-module-filter').value);
        element('msm-module-bulk-target').focus(); break;
      case 'reset-filters': resetFilters(); break;
      default: return false;
    }
    return true;
  }

  function handleChange(target) {
    const field = target.dataset.sectionManagerView;
    if (!field) return false;
    state[field] = target.type === 'checkbox' ? target.checked : target.value;
    renderModules(entries, element('msm-module-filter').value);
    return true;
  }

  function reset() {
    state.section = '';
    state.descendants = true;
    state.sort = 'title-asc';
    element('msm-include-descendants').checked = true;
    element('msm-sort').value = state.sort;
    showPanel('');
    resetFilters();
  }

  return { refresh, visibleEntries, renderSections, renderModules, renderBulkBar, showPanel, handleClick, handleChange, reset,
    isEditing: () => state.panel === 'edit', isSelectedOnly: () => state.selectedOnly };
})();
