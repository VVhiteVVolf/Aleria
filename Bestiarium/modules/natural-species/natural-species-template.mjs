const VERSION = '20260908-natural-species-v4';
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const roman = number => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][number - 1] || String(number);
const paragraphs = items => items.map(text => `<p>${escape(text)}</p>`).join('\n');

function renderToolShortcuts(tools = []) {
  return tools.map(tool => `<a class="species-atlas-shortcut" href="${escape(tool.href)}">${escape(tool.label)} <span aria-hidden="true">↗</span></a>`).join('');
}

function renderToolRegister(tools = [], startNumber) {
  return tools.map((tool, index) => `<a class="species-register-extra" href="${escape(tool.href)}"><span>${roman(startNumber + index)}</span>${escape(tool.title)}</a>`).join('\n');
}

function picture(image, { className = '', eager = false } = {}) {
  return `<img class="${escape(className)}" src="${escape(image.src)}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}

function entryFigureClass(image) {
  const isPortrait = Number(image.height) > Number(image.width) * 1.2;
  return `species-entry-figure species-entry-figure--${isPortrait ? 'portrait' : 'square'}`;
}

function renderSection(section, index) {
  return `<section class="species-section" id="${escape(section.id)}" aria-labelledby="title-${escape(section.id)}">
    <header class="species-section-heading"><span aria-hidden="true">${roman(index + 1)}</span><h2 id="title-${escape(section.id)}">${escape(section.title)}</h2></header>
    <div class="species-prose">${paragraphs(section.paragraphs)}</div>
  </section>`;
}

function renderFacts(record) {
  return `<aside class="species-facts" aria-labelledby="facts-title"><p class="eyebrow">Naturkundliche Randspalte</p><h2 id="facts-title">Wissenswertes</h2><dl>${record.facts.map(entry => `<div><dt>${escape(entry.label)}</dt><dd>${escape(entry.value)}</dd></div>`).join('\n')}</dl><span class="species-facts-ornament" aria-hidden="true">❧</span></aside>`;
}

function renderEntry(entry, groupTitle, modifier = '') {
  const classes = ['species-entry', modifier, entry.unknown ? 'species-entry--unknown' : ''].filter(Boolean).join(' ');
  return `<article class="${classes}" data-species-entry data-entry-id="${escape(entry.id)}" data-entry-group="${escape(groupTitle)}" data-entry-status="${escape(entry.status)}">
    <p class="species-entry-region" data-entry-region>${escape(entry.region)}</p>
    <h4 data-entry-title>${escape(entry.title)}</h4>
    ${entry.image ? `<figure class="${entryFigureClass(entry.image)}">${picture(entry.image)}</figure>` : entry.unknown ? '<div class="species-entry-placeholder" aria-hidden="true"><span>?</span></div>' : ''}
    <p data-entry-description>${escape(entry.description)}</p>
    ${entry.href
      ? `<a class="species-entry-link" href="${escape(entry.href)}">Dossier aufschlagen <span aria-hidden="true">↗</span></a>`
      : entry.unknown
        ? `<span class="species-entry-link species-entry-link--static">${escape(entry.status)}</span>`
        : `<button class="species-entry-link" type="button" data-action="preview-entry" data-entry-id="${escape(entry.id)}" aria-haspopup="dialog">Eigenes Dossier folgt <span aria-hidden="true">↗</span></button>`}
  </article>`;
}

function renderGroup(group, index) {
  return `<section class="species-family" id="gruppe-${escape(group.id)}" aria-labelledby="gruppe-title-${escape(group.id)}">
    <header class="species-family-heading"><p class="eyebrow">${String(index + 1).padStart(2, '0')} · ${escape(group.kicker)}</p><h3 id="gruppe-title-${escape(group.id)}">${escape(group.title)}</h3><p>${escape(group.description)}</p></header>
    ${group.ancestor ? `<div class="species-ancestor"><span class="species-ancestor-mark" aria-hidden="true">✦</span>${renderEntry(group.ancestor, group.title, 'species-entry-ancestor')}</div>` : ''}
    <div class="species-entry-grid">${group.entries.map(entry => renderEntry(entry, group.title)).join('\n')}</div>
  </section>`;
}

function previewDialog() {
  return `<dialog class="entry-preview" data-role="entry-preview" aria-labelledby="preview-title" aria-describedby="preview-description">
    <button class="preview-close" type="button" data-action="close-preview" aria-label="Vorschau schließen">×</button>
    <div class="preview-image" data-role="preview-art"></div><p class="eyebrow" data-role="preview-chapter"></p>
    <h2 id="preview-title" data-role="preview-title"></h2><p class="preview-note" data-role="preview-note"></p><p id="preview-description" data-role="preview-description"></p>
    <div class="preview-status"><span aria-hidden="true">✧</span><strong data-role="preview-status"></strong><p>Die Art oder Rasse ist bereits naturkundlich eingeordnet. Ihr ausführliches Einzeldossier wird später an dieser Stelle verknüpft.</p></div>
    <button class="ink-button" type="button" data-action="close-preview" autofocus>Zurück zur Artenkunde</button>
  </dialog>`;
}

export function renderNaturalSpecies(record) {
  const atlasNumber = roman(record.sections.length + 1);
  const html = `<!doctype html>
<!-- Generated from art.json by Bestiarium/scripts/build-natural-species.mjs. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>${escape(record.title)} · Tiere · Bestiarium von Aleria</title><meta name="description" content="${escape(record.lead)}">
  <link rel="icon" href="../../../IconOrdner/ReiterIcons/Bestiarium-register.webp" type="image/webp">
  <link rel="stylesheet" href="../../modules/book-shell/book-shell.css?v=${VERSION}">
  <link rel="stylesheet" href="../../modules/natural-species/natural-species.css?v=${VERSION}">
  <link rel="stylesheet" href="../../modules/entry-preview/entry-preview.css?v=${VERSION}">
  <script type="module" src="../../modules/natural-species/natural-species-page.js?v=${VERSION}"></script>
</head>
<body>
  <a class="skip-link" href="#${escape(record.sections[0].id)}">Zur Artenkunde</a>
  <div class="bestiary-page natural-species" data-natural-species>
    <header class="masthead" id="anfang"><a class="almanach-link" href="../../index.html#tiere"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">Thalenorische Akademie · Naturkundliches Archiv</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="species-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../../index.html#tiere">Tiere</a><span aria-hidden="true">/</span><span aria-current="page">${escape(record.title)}</span></nav>
      <section class="species-hero" aria-labelledby="species-title">
        <div class="species-hero-copy"><div class="species-icon-seal">${picture(record.icon, { className: 'species-header-icon', eager: true })}</div><p class="eyebrow">${escape(record.classification)} <span aria-hidden="true">·</span> Archivblatt ${escape(record.folio)}</p><h1 id="species-title">${escape(record.title)}</h1><p class="species-subtitle">${escape(record.subtitle)}</p><p class="species-lead">${escape(record.lead)}</p><a class="ink-button" href="#${escape(record.sections[0].id)}">Die Artenkunde lesen <span aria-hidden="true">↓</span></a><a class="species-atlas-shortcut" href="#artenregister">Zum Artenregister ↗</a>${renderToolShortcuts(record.tools)}</div>
        <figure class="species-hero-figure">${picture(record.hero, { className: 'species-hero-image', eager: true })}<figcaption>${escape(record.hero.caption)}</figcaption></figure>
      </section>
      <blockquote class="species-pullquote"><span aria-hidden="true">❧</span><p>„${escape(record.pullQuote)}“</p><span aria-hidden="true">❧</span></blockquote>
      <div class="species-book">
        <aside class="species-register"><div><p class="eyebrow">In diesem Archivblatt</p><nav aria-label="Kapitel der Artenkunde">${record.sections.map((section, index) => `<a href="#${escape(section.id)}"><span>${roman(index + 1)}</span>${escape(section.title)}</a>`).join('\n')}<a class="species-register-extra" href="#artenregister"><span>${atlasNumber}</span>${escape(record.atlas.title)}</a>${renderToolRegister(record.tools, record.sections.length + 2)}</nav><a class="species-register-back" href="../../index.html#tiere">← Zu den natürlichen Arten</a></div></aside>
        <div class="species-content">
          <div class="species-reading"><article class="species-narrative" aria-label="Naturkunde zu ${escape(record.title)}">${record.sections.map(renderSection).join('\n')}</article>${renderFacts(record)}</div>
          <section class="species-atlas" id="artenregister" aria-labelledby="atlas-title"><header class="species-atlas-heading"><p class="eyebrow">${atlasNumber} · Systematik & weiterführende Dossiers</p><h2 id="atlas-title">${escape(record.atlas.title)}</h2><p>${escape(record.atlas.intro)}</p></header>${record.atlas.groups.map(renderGroup).join('\n')}</section>
        </div>
      </div>
      <noscript><p class="species-noscript">Alle Artenbeschreibungen sind ohne JavaScript lesbar. Nur die Vorschau der späteren Einzeldossiers benötigt JavaScript.</p></noscript>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>${escape(record.title)} · Die natürlichen Arten Alerias</small></p><a href="../../index.html#tiere">Zurück zum Bestiarium ↗</a></footer>
    ${previewDialog()}
  </div>
</body>
</html>
`;

  return html.replace(/[ \t]+$/gm, '');
}
