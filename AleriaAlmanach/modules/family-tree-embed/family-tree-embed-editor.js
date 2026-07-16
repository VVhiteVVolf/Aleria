// Module and inline editor fields for the standalone family-tree embed.

function getFamilyTreeEmbedCatalogRecords() {
  return globalThis.AleriaFamilyTreeEmbedCatalog?.getSnapshot?.() || [];
}

function getFamilyTreeEmbedCatalogLabel(record) {
  return [...(record.folderPath || []), record.title || record.id].filter(Boolean).join(' > ');
}

function buildFamilyTreeEmbedCatalogOptions(familyId = '', records = getFamilyTreeEmbedCatalogRecords()) {
  const selectedId = sanitizeFamilyTreeEmbedFamilyId(familyId);
  const options = ['<option value="">Familie auswählen …</option>'];
  if (selectedId && !records.some(record => record.id === selectedId)) {
    options.push(`<option value="${escapeHtml(selectedId)}" selected>Aktuelle Familie · ${escapeHtml(selectedId)}</option>`);
  }
  records.forEach(record => {
    options.push(`<option value="${escapeHtml(record.id)}"${record.id === selectedId ? ' selected' : ''}>${escapeHtml(getFamilyTreeEmbedCatalogLabel(record))}</option>`);
  });
  return options.join('');
}

function buildFamilyTreeEmbedCatalogSelect(data, mode = 'module') {
  const action = mode === 'inline'
    ? 'data-inline-action="update-family-tree-embed-field" data-family-tree-field="familyId"'
    : 'data-module-editor-action="sync-json-preview"';
  const className = mode === 'inline'
    ? 'inline-edit-input family-tree-embed-family-select'
    : 'me-family-tree-family-id family-tree-embed-family-select';
  return `<select class="${className}" data-family-tree-catalog-select ${action}>
    ${buildFamilyTreeEmbedCatalogOptions(data.familyId)}
  </select>`;
}

function buildFamilyTreeEmbedOpenLink(data) {
  const enabled = Boolean(data.familyId);
  return `<a class="module-editor-mini-btn family-tree-editor-open${enabled ? '' : ' is-disabled'}" data-family-tree-open${enabled ? ` href="${escapeHtml(data.source)}"` : ''} target="_blank" rel="noopener noreferrer" aria-disabled="${enabled ? 'false' : 'true'}">${enabled ? 'Separat öffnen' : 'Zuerst Familie wählen'}</a>`;
}

function refreshFamilyTreeEmbedSelectionPresentation(select) {
  const editor = select?.closest?.('[data-family-tree-embed-editor]');
  if (!editor) return;
  const familyId = sanitizeFamilyTreeEmbedFamilyId(select.value);
  const source = createFamilyTreeEmbedSource(familyId);
  const preview = editor.querySelector('[data-family-tree-source-preview]');
  const openLink = editor.querySelector('[data-family-tree-open]');
  const status = editor.querySelector('[data-family-tree-selection-status]');
  if (preview) preview.textContent = familyId ? source : 'Noch keine Familie ausgewählt';
  if (status) status.textContent = familyId
    ? 'Die ausgewählte Familie wird schreibgeschützt im Modul geladen.'
    : 'Wähle eine Familie aus der Registry.';
  if (openLink) {
    openLink.classList.toggle('is-disabled', !familyId);
    openLink.setAttribute('aria-disabled', familyId ? 'false' : 'true');
    openLink.textContent = familyId ? 'Separat öffnen' : 'Zuerst Familie wählen';
    if (familyId) openLink.href = source;
    else openLink.removeAttribute('href');
  }
}

function hydrateFamilyTreeEmbedCatalogSelects(root = document) {
  const records = getFamilyTreeEmbedCatalogRecords();
  root.querySelectorAll?.('[data-family-tree-catalog-select]').forEach(select => {
    const selectedId = sanitizeFamilyTreeEmbedFamilyId(select.value);
    select.innerHTML = buildFamilyTreeEmbedCatalogOptions(selectedId, records);
    select.value = selectedId;
    refreshFamilyTreeEmbedSelectionPresentation(select);
  });
}

function scheduleFamilyTreeEmbedCatalogHydration() {
  const catalog = globalThis.AleriaFamilyTreeEmbedCatalog;
  if (!catalog) return;
  const schedule = typeof queueMicrotask === 'function'
    ? queueMicrotask
    : typeof setTimeout === 'function' ? callback => setTimeout(callback, 0) : null;
  if (!schedule) return;
  schedule(() => {
    hydrateFamilyTreeEmbedCatalogSelects();
    void catalog.load?.().catch(error => {
      console.info('Die Stammbaum-Auswahlliste konnte nicht aktualisiert werden.', error);
    });
  });
}

function createDefaultFamilyTreeEmbedPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Stammbaum`,
    image: '',
    familyTreePage: true,
    familyTree: sanitizeFamilyTreeEmbedData({})
  };
}

function buildFamilyTreeEmbedModuleEditorFields(page = {}) {
  const data = sanitizeFamilyTreeEmbedData(page.familyTree);
  scheduleFamilyTreeEmbedCatalogHydration();
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'family-tree' ? ' visible' : ''}" data-page-type="family-tree" data-family-tree-embed-editor>
      <div class="module-editor-grid">
        <div class="module-editor-field wide">
          <div class="module-editor-kicker">Eigenständige Stammbaum-Anwendung</div>
          <div class="module-editor-help">Dieses Template verändert die Anwendung unter <code>E:\Aleria\Stammbäume</code> nicht. Es stellt eine ausgewählte Familienakte ausschließlich im schreibgeschützten Ansichtsmodus dar.</div>
        </div>
        <div class="module-editor-field wide">
          <label>Stammbaum aus der Registry</label>
          ${buildFamilyTreeEmbedCatalogSelect(data, 'module')}
          <div class="module-editor-help" data-family-tree-selection-status>${data.familyId ? 'Die ausgewählte Familie wird schreibgeschützt im Modul geladen.' : 'Wähle eine Familie aus der Registry.'}</div>
        </div>
        <div class="module-editor-field wide">
          <label>Erzeugte Ansichtsadresse</label>
          <code class="family-tree-embed-source-preview" data-family-tree-source-preview>${escapeHtml(data.familyId ? data.source : 'Noch keine Familie ausgewählt')}</code>
          <div class="module-editor-help">Die Adresse wird aus der stabilen Familien-ID erzeugt. Der Almanach erzwingt immer <code>mode=view</code>; ein Bearbeitungsmodus wird niemals eingebettet.</div>
        </div>
        <div class="module-editor-field wide">
          <label>Überschrift im Almanach</label>
          <input type="text" class="me-family-tree-title" value="${escapeHtml(data.title)}" maxlength="160">
        </div>
        <div class="module-editor-field wide">
          <label>Einleitung</label>
          <textarea class="me-family-tree-intro" rows="3" maxlength="600">${escapeHtml(data.intro)}</textarea>
        </div>
        <div class="module-editor-field">
          <label>Rahmenhöhe in Pixeln</label>
          <input type="number" class="me-family-tree-height" min="520" max="1200" step="20" value="${escapeHtml(data.height)}">
        </div>
        <div class="module-editor-field">
          <label>Arbeitsbereich</label>
          ${buildFamilyTreeEmbedOpenLink(data)}
        </div>
      </div>
    </div>`;
}

function collectFamilyTreeEmbedModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="family-tree"]') || card;
  page.familyTreePage = true;
  page.familyTree = sanitizeFamilyTreeEmbedData({
    familyId: getTrimmedFormValue(block, '.me-family-tree-family-id'),
    title: getTrimmedFormValue(block, '.me-family-tree-title'),
    intro: getTrimmedFormValue(block, '.me-family-tree-intro'),
    height: getFormValue(block, '.me-family-tree-height')
  });
  return page;
}

function buildInlineFamilyTreeEmbedEditor(page = {}) {
  const data = sanitizeFamilyTreeEmbedData(page.familyTree);
  const fieldAttributes = path => `data-inline-action="update-family-tree-embed-field" data-family-tree-field="${path}"`;
  scheduleFamilyTreeEmbedCatalogHydration();
  return `
    <div class="inline-edit-section" data-family-tree-embed-editor>
      <div class="inline-edit-kicker">Stammbaum-Einbettung</div>
      <div class="module-editor-help">Die genealogischen Daten werden innerhalb der separaten Stammbäume-Anwendung bearbeitet. Hier wählst du die Familienakte und konfigurierst ihre Darstellung im Almanach.</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Stammbaum aus der Registry</span>
          ${buildFamilyTreeEmbedCatalogSelect(data, 'inline')}
          <div class="inline-placeholder-note" data-family-tree-selection-status>${data.familyId ? 'Die ausgewählte Familie wird schreibgeschützt im Modul geladen.' : 'Wähle eine Familie aus der Registry.'}</div>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Erzeugte Ansichtsadresse</span>
          <code class="family-tree-embed-source-preview" data-family-tree-source-preview>${escapeHtml(data.familyId ? data.source : 'Noch keine Familie ausgewählt')}</code>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Überschrift</span>
          <input class="inline-edit-input" type="text" ${fieldAttributes('title')} value="${escapeHtml(data.title)}" maxlength="160">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Einleitung</span>
          <textarea class="inline-edit-textarea" ${fieldAttributes('intro')} rows="3" maxlength="600">${escapeHtml(data.intro)}</textarea>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Rahmenhöhe</span>
          <input class="inline-edit-input" type="number" ${fieldAttributes('height')} min="520" max="1200" step="20" value="${escapeHtml(data.height)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Arbeitsbereich</span>
          ${buildFamilyTreeEmbedOpenLink(data)}
        </div>
      </div>
    </div>`;
}

function updateInlineFamilyTreeEmbedField(input) {
  const page = getInlineDraftPageForSource(input);
  const path = String(input?.dataset?.familyTreeField || '').trim();
  if (!page || !['familyId', 'title', 'intro', 'height'].includes(path)) return;
  const current = sanitizeFamilyTreeEmbedData(page.familyTree);
  current[path] = path === 'height' ? Number(input.value) : String(input.value || '').trim();
  page.familyTreePage = true;
  page.familyTree = sanitizeFamilyTreeEmbedData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

if (typeof document !== 'undefined') {
  document.addEventListener('aleria:family-tree-embed-catalog-updated', () => {
    hydrateFamilyTreeEmbedCatalogSelects();
  });
  document.addEventListener('change', event => {
    const select = event.target?.closest?.('[data-family-tree-catalog-select]');
    if (select) refreshFamilyTreeEmbedSelectionPresentation(select);
  });
}
