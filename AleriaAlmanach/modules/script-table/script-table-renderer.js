function getScriptTableStyleClass(style) {
  return `script-style-${sanitizeScriptTableStyle(style)}`;
}

function buildScriptTableMainTable(data) {
  return `
    <div class="script-table-scroll">
      <table class="script-table-grid">
        <thead><tr><th>${escapeHtml(data.symbolHeader)}</th><th>${escapeHtml(data.nameHeader)}</th><th>${escapeHtml(data.soundHeader)}</th><th>${escapeHtml(data.meaningHeader)}</th></tr></thead>
        <tbody>${data.rows.map(row => `<tr><td class="script-table-symbol ${getScriptTableStyleClass(data.scriptStyle)}">${escapeHtml(row.symbol)}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.sound)}</td><td>${escapeHtml(row.meaning)}</td></tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function buildScriptTableSyllableTable(data) {
  if (!data.syllables.length) return '';
  return `
    <section class="script-table-syllable-section">
      <header><h3>${escapeHtml(data.syllablesTitle)}</h3>${data.syllablesSubtitle ? `<p>${escapeHtml(data.syllablesSubtitle)}</p>` : ''}</header>
      <div class="script-table-scroll">
        <table class="script-table-grid script-table-syllables">
          <thead><tr><th>${escapeHtml(data.syllableHeader)}</th><th>${escapeHtml(data.syllableMeaningHeader)}</th><th>${escapeHtml(data.syllableUsageHeader)}</th></tr></thead>
          <tbody>${data.syllables.map(row => `<tr><td>${escapeHtml(row.syllable)}</td><td>${escapeHtml(row.meaning)}</td><td>${escapeHtml(row.usage)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </section>`;
}

function buildScriptTablePage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeScriptTableData(page.scriptTable || {});
  const inlineCommentThread = getInlineCommentThreadForPage(page, entry, pageIndex);
  const embeddedComments = inlineCommentThread ? buildOrganicCommentsContinuation(inlineCommentThread) : '';
  return `
    ${nav}
    <article class="script-table-page">
      <header class="script-table-header">
        <div class="script-table-archive-label">${escapeHtml(data.archiveLabel)}</div>
        ${data.ornamentText ? `<div class="script-table-ornament ${getScriptTableStyleClass(data.scriptStyle)}" aria-hidden="true">${escapeHtml(data.ornamentText)}</div>` : ''}
        <h2>${escapeHtml(data.title)}</h2>
        ${data.subtitle ? `<p>${escapeHtml(data.subtitle)}</p>` : ''}
      </header>
      <div class="script-table-content">
        ${buildScriptTableMainTable(data)}
        ${buildScriptTableSyllableTable(data)}
      </div>
      ${data.footer ? `<footer class="script-table-footer">${escapeHtml(data.footer)}</footer>` : ''}
    </article>
    ${embeddedComments}`;
}
