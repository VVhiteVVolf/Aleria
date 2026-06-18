function getInlineMapTemplateDataForEdit(page) {
  return sanitizeMapTemplateData(page?.mapTemplate || {});
}

function updateInlineMapTemplateTabField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.mapTabIndex || -1);
  const field = input.dataset.mapTabField;
  if (index < 0 || !field) return;
  const data = getInlineMapTemplateDataForEdit(page);
  const tabs = Array.isArray(data.tabs) ? [...data.tabs] : [];
  const tab = { ...(tabs[index] || {}) };
  tab[field] = input.value;
  tabs[index] = tab;
  data.tabs = tabs;
  page.mapTemplatePage = true;
  page.mapTemplate = sanitizeMapTemplateData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineMapTemplateSectionField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.mapSectionIndex || -1);
  const field = input.dataset.mapSectionField;
  if (index < 0 || !field) return;
  const data = getInlineMapTemplateDataForEdit(page);
  const sections = Array.isArray(data.sections) ? [...data.sections] : [];
  const section = { ...(sections[index] || {}) };
  section[field] = input.value;
  sections[index] = section;
  data.sections = sections;
  page.mapTemplatePage = true;
  page.mapTemplate = sanitizeMapTemplateData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineMapTemplateEditor(page) {
  const data = sanitizeMapTemplateData(page.mapTemplate || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">KartenTemplate</div>
      <div class="inline-edit-grid single">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Kartenreiter</span>
          <div class="trade-editor-list">${buildMapTemplateTabRows(data.tabs, 'inline')}</div>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Rechte Seitenleiste</span>
          <div class="trade-editor-list">${buildMapTemplateSectionRows(data.sections, 'inline')}</div>
        </div>
      </div>
    </div>`;
}
