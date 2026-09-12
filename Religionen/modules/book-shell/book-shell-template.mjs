import { escapeHtml as h, pageLinkFrom } from '../content/content-html.mjs';

export const CONTENT_VERSION = '20260910-traditions-v1';

export function renderShell({ outputPath, title, description, main, sidebar = '', catalog = false, searchable = catalog, theme, extraStyles = [], extraScripts = [] }) {
  const link = pageLinkFrom(outputPath);
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="${theme === 'infernal' ? '#382b2a' : '#263e35'}">
  <meta name="description" content="${h(description)}">
  <title>${h(title)} · Religionen von Aleria</title>
  <link rel="icon" href="${link('IconOrdner/ReiterIcons/Religion.png')}">
  <link rel="stylesheet" href="${link('Religionen/modules/book-shell/book-shell.css')}?v=${CONTENT_VERSION}">
  <link rel="stylesheet" href="${link(catalog ? 'Religionen/modules/catalog/catalog.css' : 'Religionen/modules/profiles/profile.css')}?v=${CONTENT_VERSION}">
  ${searchable ? `<link rel="stylesheet" href="${link('Religionen/modules/catalog/catalog-controls.css')}?v=${CONTENT_VERSION}">` : ''}
  ${extraStyles.map(path => `<link rel="stylesheet" href="${link(path)}?v=${CONTENT_VERSION}">`).join('\n  ')}
  ${theme === 'infernal' ? `<link rel="stylesheet" href="${link('Religionen/modules/book-shell/infernal-theme.css')}?v=${CONTENT_VERSION}">` : ''}
  ${searchable ? `<script type="module" src="${link('Religionen/modules/catalog/catalog-controller.mjs')}?v=${CONTENT_VERSION}"></script>` : ''}
  ${extraScripts.map(path => `<script type="module" src="${link(path)}?v=${CONTENT_VERSION}"></script>`).join('\n  ')}
</head>
<body class="religion-page"${theme ? ` data-theme="${h(theme)}"` : ''}>
  <a class="skip-link" href="#inhalt">Zum Inhalt</a>
  <header class="site-header" id="anfang"><div class="header-inner">
    <a class="site-brand" href="${link('AleriaAlmanach/AleriaAlmanach.html')}"><span aria-hidden="true">←</span> ALERIA <span class="brand-divider">/</span> ALMANACH</a>
    <nav class="sibling-nav" aria-label="Weitere Sammlungen"><a href="${link('Bestiarium/index.html')}">Bestiarium</a><a href="${link('Klassenordner/Klassenseite.html')}">Klassen</a><a href="${link('Religionen/index.html')}"${catalog ? ' aria-current="page"' : ''}>Religionen</a></nav>
  </div></header>
  <div class="codex-page">
    ${sidebar ? `<div class="profile-layout">${sidebar}<main id="inhalt" class="profile-main">${main}</main></div>` : `<main id="inhalt">${main}</main>`}
    <footer class="codex-footer"><span class="footer-mark" aria-hidden="true">✧</span><p>Die Glaubenswelten Alerias<small>Ein Codex im Werden · Bewahrt im Almanach</small></p><a href="${link('AleriaAlmanach/AleriaAlmanach.html')}">Zurück zum Almanach <span aria-hidden="true">↗</span></a></footer>
  </div>
</body>
</html>
`.replace(/[\t ]+$/gm, '');
}

export function renderChapterRegister(chapters) {
  return `<aside class="chapter-register" aria-label="Kapitelregister"><div class="register-sticky">
    <a class="register-heading" href="#anfang"><span aria-hidden="true">✧</span> Der Glaubenscodex</a>
    <p class="eyebrow">In diesem Band</p>
    <nav aria-label="Kapitel">${chapters.map(chapter => `<a href="#${chapter.id}" data-action="navigate-chapter" data-chapter-id="${chapter.id}"><span class="chapter-numeral">${h(chapter.number)}</span><span>${h(chapter.label)}</span><small>${chapter.entries.length || '—'}</small></a>`).join('')}</nav>
    <div class="register-note"><span aria-hidden="true">❧</span><p>Viele Namen.<br>Viele Wege des Glaubens.</p><small>Eine wachsende Sammlung von Religionen, Gottheiten und ihren Überlieferungen.</small></div>
    <a class="back-to-top" href="#anfang">Zur Titelseite ↑</a>
  </div></aside>`;
}
