function updateInlineScriptTableData(field) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = sanitizeScriptTableData(page.scriptTable || {});
  const key = field.dataset.scriptTableInlineField;
  if (key === 'rows') data.rows = parseScriptTableRows(field.value);
  else if (key === 'syllables') data.syllables = parseScriptTableSyllables(field.value);
  else data[key] = field.value;
  page.scriptTablePage = true;
  page.scriptTable = sanitizeScriptTableData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineScriptTableEditor(page) {
  const data = sanitizeScriptTableData(page.scriptTable || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Schriftzeichen-Tabelle</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field"><span class="inline-edit-label">Archivzeile</span><input class="inline-edit-input" value="${escapeHtml(data.archiveLabel)}" data-script-table-inline-field="archiveLabel"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Schriftstil</span><select class="inline-edit-select" data-script-table-inline-field="scriptStyle">${buildScriptTableStyleOptions(data.scriptStyle)}</select></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Titel</span><input class="inline-edit-input" value="${escapeHtml(data.title)}" data-script-table-inline-field="title"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Untertitel</span><input class="inline-edit-input" value="${escapeHtml(data.subtitle)}" data-script-table-inline-field="subtitle"></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Runen-Verzierung</span><input class="inline-edit-input" value="${escapeHtml(data.ornamentText)}" data-script-table-inline-field="ornamentText"></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Zeichen | Name | Laut | Bedeutung</span><textarea class="inline-edit-textarea" rows="18" data-script-table-inline-field="rows">${escapeHtml(formatScriptTableRows(data.rows))}</textarea></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Silbentabelle Titel</span><input class="inline-edit-input" value="${escapeHtml(data.syllablesTitle)}" data-script-table-inline-field="syllablesTitle"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Silbentabelle Untertitel</span><input class="inline-edit-input" value="${escapeHtml(data.syllablesSubtitle)}" data-script-table-inline-field="syllablesSubtitle"></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Silbe | Bedeutung | Verwendung</span><textarea class="inline-edit-textarea" rows="12" data-script-table-inline-field="syllables">${escapeHtml(formatScriptTableSyllables(data.syllables))}</textarea></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Fußzeile</span><input class="inline-edit-input" value="${escapeHtml(data.footer)}" data-script-table-inline-field="footer"></div>
      </div>
    </div>`;
}

function handleInlineScriptTableField(event) {
  const field = event.target;
  if (!field?.dataset?.scriptTableInlineField || !field.closest?.('.inline-module-edit-pane')) return;
  updateInlineScriptTableData(field);
}

document.addEventListener('input', handleInlineScriptTableField);
document.addEventListener('change', handleInlineScriptTableField);
