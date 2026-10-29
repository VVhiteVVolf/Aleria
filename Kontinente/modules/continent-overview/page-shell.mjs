import source from './continents.source.json' with { type: 'json' };

export const ATLAS_VERSION = 'atlas-unified-20261029b';
export const continents = source.continents;
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const continentBanner = continent => `/IconOrdner/L%C3%A4nder%20Icons/${encodeURIComponent(continent.name)}%20Kontinent.png`;

function continentNavigation(activeId) {
  const items = [{ id: 'overview', name: 'Alle Kontinente', href: '/Kontinente/index.html' }, ...continents.filter(c => c.href)];
  return `<nav class="atlas-continent-nav" aria-label="Kontinent wählen">${items.map(c => `<a href="${c.href}"${c.id === activeId ? ' aria-current="page"' : ''}>${escapeHtml(c.name)}</a>`).join('')}</nav>`;
}

function pageHeader(continent) {
  const isIndex = !continent;
  const title = continent?.name || 'Kontinente';
  const introduction = continent?.introduction || 'Acht Kontinente. Ihre Länder, ihre Wappen und die Spuren vergangener Reiche.';
  return `<header class="continent-page-header${isIndex ? '' : ' continent-page-header--detail'}" id="seitenanfang">
    <div class="atlas-title-block"><p class="atlas-eyebrow">${isIndex ? 'Der Aleria-Atlas' : `Kontinent ${continent.number} · Der Weltenalmanach`}</p>
      <h1 id="${continent?.id || 'kontinente'}-title"${isIndex ? ' data-kontinent-title' : ''} data-orte-explicit-inline>${title}</h1>
      <p class="atlas-introduction">${escapeHtml(introduction)}</p></div>
    ${isIndex ? '<div class="atlas-volume" aria-hidden="true"><span>ALERIA</span><strong>VIII</strong><span>Kontinente</span></div>' : `<span class="orte-image-slot continent-hero-slot" data-orte-image-key="${continent.bannerKey}" data-orte-image-label="Banner Kontinent ${title}" data-orte-image-width="100" data-orte-image-format="banner" data-orte-image-max-height="260" aria-label="Banner Kontinent ${title}"><img src="${continentBanner(continent)}" alt="Banner Kontinent ${title}"></span>`}
  </header>`;
}

function chapterNavigation(chapters) {
  if (!chapters.length) return '';
  return `<nav class="atlas-chapter-index" aria-label="Kapitel auf diesem Kontinent"><span class="atlas-index-label">In diesem Kapitel</span><div class="atlas-index-links">${chapters.map((c, i) => `<a href="#${c.id}"><span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${escapeHtml(c.title)}</a>`).join('')}</div></nav>`;
}

// Build-time presentation only. Existing loaders and inline editing keep ownership.
export function renderContinentPage({ continent = null, content, chapters = [], extraScripts = [] }) {
  const id = continent ? `kontinent-${continent.id}` : 'kontinente-startseite';
  const label = continent?.name || 'Kontinente';
  return `<!doctype html>
<!-- Gemeinsame Atlas-Schale: Kontinente/modules/continent-overview/page-shell.mjs -->
<html lang="de"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(label)} – Aleria</title>
  <meta name="description" content="${escapeHtml(continent?.introduction || 'Der Aleria-Atlas: acht Kontinente und ihre Länder im gemeinsamen Verzeichnis.')}">
  <link rel="stylesheet" href="/Kontinente/assets/css/kontinente-overview.css?v=${ATLAS_VERSION}">
  <script src="/Kontinente/kontinente.registry.js?v=${ATLAS_VERSION}"></script>
  <script src="/Kontinente/assets/js/kontinente-loader.js?v=vortigern-20261018" data-default-id="${id}"></script>
  ${extraScripts.map(src => `<script type="module" src="${escapeHtml(src)}"></script>`).join('\n  ')}
</head><body class="continent-atlas">
  <main class="kingdom-page continent-page ${continent ? 'continent-detail-page' : 'continent-start-page'}" data-page-type="${continent ? 'continent' : 'continent-overview'}" data-kontinent-root data-orte-static-template data-default-id="${id}">
    <section class="continent-parchment" aria-labelledby="${continent?.id || 'kontinente'}-title">
      <div class="atlas-folio"><a href="/Kontinente/index.html">Aleria <span>Atlas & Chronik</span></a><span>${continent ? `Aleria / ${label}` : 'Das Register der Kontinente'}</span></div>
      ${continentNavigation(continent?.id || 'overview')}
      ${pageHeader(continent)}
      ${chapterNavigation(chapters)}
      ${content}
      <footer class="atlas-footer"><a href="/Kontinente/index.html">← Zum Kontinentregister</a><a href="#seitenanfang">Zurück zum Seitenanfang ↑</a></footer>
    </section>
  </main>
</body></html>\n`.replace(/[\t ]+$/gm, '');
}
