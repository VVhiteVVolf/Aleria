// Module and inline editor fields for the standalone family-tree embed.

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
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'family-tree' ? ' visible' : ''}" data-page-type="family-tree">
      <div class="module-editor-grid">
        <div class="module-editor-field wide">
          <div class="module-editor-kicker">Eigenständige Stammbaum-Anwendung</div>
          <div class="module-editor-help">Dieses Template verändert die Anwendung unter <code>E:\\Aleria\\Stammbäume</code> nicht. Es stellt sie ausschließlich in einem isolierten Rahmen dar.</div>
        </div>
        <div class="module-editor-field wide">
          <label>Überschrift im Almanach</label>
          <input type="text" class="me-family-tree-title" value="${escapeHtml(data.title)}" maxlength="160">
        </div>
        <div class="module-editor-field wide">
          <label>Einleitung</label>
          <textarea class="me-family-tree-intro" rows="3" maxlength="600">${escapeHtml(data.intro)}</textarea>
        </div>
        <div class="module-editor-field wide">
          <label>Lokaler Anwendungspfad</label>
          <input type="text" class="me-family-tree-source" value="${escapeHtml(data.source)}" spellcheck="false">
          <div class="module-editor-help">Nur relative, gleichursprüngliche Pfade sind erlaubt. Der Almanach erzwingt den schreibgeschützten <code>mode=view</code>. Eine Familie wird mit <code>?family=haus-id</code> ausgewählt.</div>
        </div>
        <div class="module-editor-field">
          <label>Rahmenhöhe in Pixeln</label>
          <input type="number" class="me-family-tree-height" min="520" max="1200" step="20" value="${escapeHtml(data.height)}">
        </div>
        <div class="module-editor-field">
          <label>Arbeitsbereich</label>
          <a class="module-editor-mini-btn family-tree-editor-open" href="${escapeHtml(data.source)}" target="_blank" rel="noopener noreferrer">Separat öffnen</a>
        </div>
      </div>
    </div>`;
}

function collectFamilyTreeEmbedModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="family-tree"]') || card;
  page.familyTreePage = true;
  page.familyTree = sanitizeFamilyTreeEmbedData({
    source: getTrimmedFormValue(block, '.me-family-tree-source'),
    title: getTrimmedFormValue(block, '.me-family-tree-title'),
    intro: getTrimmedFormValue(block, '.me-family-tree-intro'),
    height: getFormValue(block, '.me-family-tree-height')
  });
  return page;
}

function buildInlineFamilyTreeEmbedEditor(page = {}) {
  const data = sanitizeFamilyTreeEmbedData(page.familyTree);
  const fieldAttributes = path => `data-inline-action="update-family-tree-embed-field" data-family-tree-field="${path}"`;
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Stammbaum-Einbettung</div>
      <div class="module-editor-help">Die genealogischen Daten werden innerhalb der separaten Stammbäume-Anwendung bearbeitet. Hier konfigurierst du nur ihre Darstellung im Almanach.</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Überschrift</span>
          <input class="inline-edit-input" type="text" ${fieldAttributes('title')} value="${escapeHtml(data.title)}" maxlength="160">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Einleitung</span>
          <textarea class="inline-edit-textarea" ${fieldAttributes('intro')} rows="3" maxlength="600">${escapeHtml(data.intro)}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Lokaler Anwendungspfad</span>
          <input class="inline-edit-input" type="text" ${fieldAttributes('source')} value="${escapeHtml(data.source)}" spellcheck="false">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Rahmenhöhe</span>
          <input class="inline-edit-input" type="number" ${fieldAttributes('height')} min="520" max="1200" step="20" value="${escapeHtml(data.height)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Arbeitsbereich</span>
          <a class="module-editor-mini-btn family-tree-editor-open" href="${escapeHtml(data.source)}" target="_blank" rel="noopener noreferrer">Separat öffnen</a>
        </div>
      </div>
    </div>`;
}

function updateInlineFamilyTreeEmbedField(input) {
  const page = getInlineDraftPageForSource(input);
  const path = String(input?.dataset?.familyTreeField || '').trim();
  if (!page || !['source', 'title', 'intro', 'height'].includes(path)) return;
  const current = sanitizeFamilyTreeEmbedData(page.familyTree);
  current[path] = path === 'height' ? Number(input.value) : String(input.value || '').trim();
  page.familyTreePage = true;
  page.familyTree = sanitizeFamilyTreeEmbedData(current);
  scheduleInlineModuleLivePreviewRefresh();
}
