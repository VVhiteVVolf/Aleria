// Shared static page shell. Kingdom data, terminology and links belong to callers.
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

export function paragraphs(values) {
  return values.map(value => `<p>${escapeHtml(value)}</p>`).join('\n');
}

export function createCourtRenderer(context) {
  return function courtPage({ title, subtitle, description, page, icon, navigation, body, script = '', extraHead = '', iconSrc = '' }) {
    const { kingdom, assets, home, tabs, familyLink, buildSource, bodyClass = 'kingdom-court' } = context;
    return `<!doctype html>
<!-- Erzeugt mit ${buildSource}. -->
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)} · Königreich ${escapeHtml(kingdom)}</title>
  <link rel="stylesheet" href="${assets}/court.css?v=${context.styleVersion}">
  ${script ? `<script type="module" src="${assets}/${script}?v=${context.scriptVersion}"></script>` : ''}${extraHead ? '\n'+extraHead : ''}
</head>
<body class="${escapeHtml(bodyClass)}">
  <a class="court-skip" href="#inhalt">Zum Inhalt</a>
  <div class="court-book" id="seitenanfang">
    <nav class="court-breadcrumb" aria-label="Brotkrumennavigation">
      <a href="${home}">← Königreich ${escapeHtml(kingdom)}</a><span aria-hidden="true">/</span><span>${escapeHtml(title)}</span>
    </nav>
    <header class="court-hero">
      <img class="court-hero-icon" src="${iconSrc || `${assets}/assets/${icon}.png`}" width="176" height="176" alt="">
      <div><p class="court-eyebrow">Königreich ${escapeHtml(kingdom)} · ${escapeHtml(subtitle)}</p><h1>${escapeHtml(title)}</h1><p class="court-lead">${escapeHtml(description)}</p></div>
    </header>
    <nav class="court-tabs" aria-label="${escapeHtml(kingdom)}-Unterseiten">
      ${tabs.map(tab=>`<a href="${escapeHtml(tab.href)}"${page === tab.id ? ' aria-current="page"' : ''}>${escapeHtml(tab.label)}</a>`).join('\n      ')}
      <a href="${escapeHtml(familyLink.href)}">${escapeHtml(familyLink.label)} ↗</a>
    </nav>
    <div class="court-layout">
      <aside class="court-sidebar"><nav aria-label="Inhaltsverzeichnis"><p class="court-eyebrow">Auf dieser Seite</p>${navigation.map(([id, label]) => `<a href="#${id}">${escapeHtml(label)}</a>`).join('\n')}</nav></aside>
      <main class="court-content" id="inhalt">${body}</main>
    </div>
    <footer class="court-footer"><a href="${home}">← Zurück nach ${escapeHtml(kingdom)}</a><a href="#seitenanfang">Zum Seitenanfang ↑</a></footer>
  </div>
</body>
</html>
`.replace(/[\t ]+$/gm, '');
  };
}
