export const COURT_ASSETS = '../../modules/cenyr-court';
export const KINGDOM_PAGE = 'Königreich von Cenyr.html';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

export function paragraphs(values) {
  return values.map(value => `<p>${escapeHtml(value)}</p>`).join('\n');
}

export function courtPage({ title, subtitle, description, page, icon, navigation, body, script = '' }) {
  return `<!doctype html>
<!-- Erzeugt mit Kontinente/scripts/build-cenyr-court.mjs. Quellen: modules/cenyr-court/. -->
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)} · Königreich Cenyr</title>
  <link rel="stylesheet" href="${COURT_ASSETS}/court.css?v=20260911b">
  ${script ? `<script type="module" src="${COURT_ASSETS}/${script}?v=20260911a"></script>` : ''}
</head>
<body class="cenyr-court">
  <a class="court-skip" href="#inhalt">Zum Inhalt</a>
  <div class="court-book" id="seitenanfang">
    <nav class="court-breadcrumb" aria-label="Brotkrumennavigation">
      <a href="${KINGDOM_PAGE}">← Königreich Cenyr</a><span aria-hidden="true">/</span><span>${escapeHtml(title)}</span>
    </nav>
    <header class="court-hero">
      <img class="court-hero-icon" src="${COURT_ASSETS}/assets/${icon}.png" width="176" height="176" alt="">
      <div><p class="court-eyebrow">Königreich Cenyr · ${escapeHtml(subtitle)}</p><h1>${escapeHtml(title)}</h1><p class="court-lead">${escapeHtml(description)}</p></div>
    </header>
    <nav class="court-tabs" aria-label="Cenyr-Unterseiten">
      <a href="aemter.html"${page === 'offices' ? ' aria-current="page"' : ''}>Ämter & Rollen</a>
      <a href="kronfolge.html"${page === 'succession' ? ' aria-current="page"' : ''}>Kronfolge</a>
      <a href="../../../Stammbäume/Stammbaum.html?family=haus-pendrag&amp;mode=view">Haus Pendrag im Stammbaum ↗</a>
    </nav>
    <div class="court-layout">
      <aside class="court-sidebar"><nav aria-label="Inhaltsverzeichnis"><p class="court-eyebrow">Auf dieser Seite</p>${navigation.map(([id, label]) => `<a href="#${id}">${escapeHtml(label)}</a>`).join('\n')}</nav></aside>
      <main class="court-content" id="inhalt">${body}</main>
    </div>
    <footer class="court-footer"><a href="${KINGDOM_PAGE}">← Zurück nach Cenyr</a><a href="#seitenanfang">Zum Seitenanfang ↑</a></footer>
  </div>
</body>
</html>
`.replace(/[\t ]+$/gm, '');
}
