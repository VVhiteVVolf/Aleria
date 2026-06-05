function buildArtifactModuleEditorFields(page) {
  const artifact = sanitizeArtifactData(page?.artifact || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'artifact' ? ' visible' : ''}" data-page-type="artifact">
        <div class="module-editor-grid">
          <div class="module-editor-field wide">
            <label>Beschreibung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-artifact-description">${escapeHtml(page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Infotabelle</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-stat-row">+ Zeile</button>
            </div>
            <div class="inline-stat-editor module-biography-stats">
              ${buildModuleBiographyStatRows(page?.stats || [])}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Archivzeile</label>
            <input type="text" class="me-artifact-archive-label" value="${escapeHtml(artifact.archiveLabel)}">
          </div>
          <div class="module-editor-field">
            <label>Klassifikation</label>
            <input type="text" class="me-artifact-classification" value="${escapeHtml(artifact.classification)}">
          </div>
          <div class="module-editor-field">
            <label>Herkunft</label>
            <input type="text" class="me-artifact-origin" value="${escapeHtml(artifact.origin)}">
          </div>
          <div class="module-editor-field">
            <label>Zustand</label>
            <input type="text" class="me-artifact-condition" value="${escapeHtml(artifact.condition)}">
          </div>
          <div class="module-editor-field">
            <label>Verwahrung / Besitzer</label>
            <input type="text" class="me-artifact-keeper" value="${escapeHtml(artifact.keeper)}">
          </div>
          <div class="module-editor-field">
            <label>Eigenschaften-Überschrift</label>
            <input type="text" class="me-artifact-properties-title" value="${escapeHtml(artifact.propertiesTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Fundumstände</label>
            <textarea class="me-artifact-discovery small">${escapeHtml(artifact.discovery)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Eigenschaften</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="artifactProperties">+ Eigenschaft</button>
            </div>
            ${buildModuleSimpleLineList(artifact.properties, 'artifactProperties')}
          </div>
          <div class="module-editor-field">
            <label>Risiken-Überschrift</label>
            <input type="text" class="me-artifact-risks-title" value="${escapeHtml(artifact.risksTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Geschichte-Überschrift</label>
            <input type="text" class="me-artifact-history-title" value="${escapeHtml(artifact.historyTitle)}">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Risiken & Nebenwirkungen</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="artifactRisks">+ Risiko</button>
            </div>
            ${buildModuleSimpleLineList(artifact.risks, 'artifactRisks')}
          </div>
          <div class="module-editor-field wide">
            <label>Geschichte</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-artifact-history-text">${escapeHtml(artifact.historyText)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Zitat</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-artifact-quote small">${escapeHtml(page?.quote || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Zitat von</label>
            <input type="text" class="me-artifact-quote-by" value="${escapeHtml(page?.quoteBy || '')}">
          </div>
          <div class="module-editor-field wide">
            <label>Fußzeile</label>
            <input type="text" class="me-artifact-footer" value="${escapeHtml(artifact.footer)}">
          </div>
        </div>
      </div>`;
}

function collectArtifactModuleEditorPage(card, page) {
  const artifactBlock = card.querySelector('[data-page-type="artifact"]') || card;
  page.artifactPage = true;
  page.description = getTrimmedFormValue(card, '.me-artifact-description');
  page.stats = collectModuleBiographyStats(artifactBlock);
  page.quote = getTrimmedFormValue(card, '.me-artifact-quote');
  page.quoteBy = getTrimmedFormValue(card, '.me-artifact-quote-by');
  page.artifact = sanitizeArtifactData({
    archiveLabel: getTrimmedFormValue(card, '.me-artifact-archive-label'),
    classification: getTrimmedFormValue(card, '.me-artifact-classification'),
    origin: getTrimmedFormValue(card, '.me-artifact-origin'),
    condition: getTrimmedFormValue(card, '.me-artifact-condition'),
    keeper: getTrimmedFormValue(card, '.me-artifact-keeper'),
    discovery: getTrimmedFormValue(card, '.me-artifact-discovery'),
    propertiesTitle: getTrimmedFormValue(card, '.me-artifact-properties-title'),
    properties: collectModuleSimpleLineRows(artifactBlock, 'artifactProperties'),
    risksTitle: getTrimmedFormValue(card, '.me-artifact-risks-title'),
    risks: collectModuleSimpleLineRows(artifactBlock, 'artifactRisks'),
    historyTitle: getTrimmedFormValue(card, '.me-artifact-history-title'),
    historyText: getTrimmedFormValue(card, '.me-artifact-history-text'),
    footer: getTrimmedFormValue(card, '.me-artifact-footer')
  });
  return page;
}
