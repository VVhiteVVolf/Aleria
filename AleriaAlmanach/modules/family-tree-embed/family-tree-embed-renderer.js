// Renderer for the Almanach shell around the standalone Stammbäume application.

function buildFamilyTreeEmbedPage(page, entry, pageIndex, total) {
  const data = sanitizeFamilyTreeEmbedData(page?.familyTree);
  const nav = buildNav(page, pageIndex, total);
  const frame = data.familyId
    ? `<div class="family-tree-embed-frame-shell">
        <iframe
          class="family-tree-embed-frame"
          src="${escapeHtml(data.source)}"
          title="${escapeHtml(data.title)}"
          loading="eager"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals"
          referrerpolicy="no-referrer"
          allow="fullscreen"
          allowfullscreen></iframe>
      </div>`
    : `<div class="family-tree-embed-empty" role="status">
        <span aria-hidden="true">◇</span>
        <strong>Noch kein Stammbaum ausgewählt</strong>
        <p>Öffne den Bearbeitungsmodus und wähle eine Familienakte aus der Stammbaum-Registry.</p>
      </div>`;
  return `
    ${nav}
    <article class="family-tree-embed-page" style="--family-tree-frame-height:${escapeHtml(data.height)}px">
      <header class="family-tree-embed-header">
        <div>
          <span class="family-tree-embed-eyebrow">Aleria Almanach · Genealogie</span>
          <h2>${escapeHtml(data.title)}</h2>
          ${data.intro ? `<p>${escapeHtml(data.intro)}</p>` : ''}
        </div>
        ${data.familyId ? `<a class="family-tree-embed-open" href="${escapeHtml(data.source)}" target="_blank" rel="noopener noreferrer">In eigener Ansicht öffnen</a>` : ''}
      </header>
      ${frame}
      <footer class="family-tree-embed-footer">
        <span>Eigenständige Anwendung · Ansichtsmodus</span>
        <code>${escapeHtml(data.familyId ? data.source : 'Keine Familie ausgewählt')}</code>
      </footer>
    </article>`;
}
