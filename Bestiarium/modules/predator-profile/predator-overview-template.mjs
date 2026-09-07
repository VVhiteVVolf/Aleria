const VERSION = '20260907-predator-overview-v1';
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const roman = number => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][number - 1] || String(number);

function picture(image, { className = '', eager = false } = {}) {
  return `<img class="${escape(className)}" src="${escape(image.src)}" alt="${escape(image.alt)}" width="${Number(image.width)}" height="${Number(image.height)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}

function renderBlock(block) {
  if (block.type === 'subheading') return `<h3>${escape(block.text)}</h3>`;
  if (block.type === 'list') return `<ul>${block.items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
  return `<p>${escape(block.text)}</p>`;
}

function renderLoreSection(section, index) {
  return `<section class="predator-overview-section" id="${escape(section.id)}" aria-labelledby="title-${escape(section.id)}">
    <header><span aria-hidden="true">${roman(index + 1)}</span><h2 id="title-${escape(section.id)}">${escape(section.title)}</h2></header>
    <div class="predator-overview-prose">${section.blocks.map(renderBlock).join('\n')}</div>
  </section>`;
}

function renderComparison(comparison, index) {
  if (!comparison) return '';
  return `<section class="predator-comparison" id="vergleich" aria-labelledby="comparison-title">
    <header class="predator-overview-section-heading"><span aria-hidden="true">${roman(index + 1)}</span><div><p class="eyebrow">${escape(comparison.eyebrow)}</p><h2 id="comparison-title">${escape(comparison.title)}</h2></div></header>
    <p class="predator-comparison-intro">${escape(comparison.intro)}</p>
    <div class="predator-comparison-grid">${comparison.columns.map(column => `<article><p class="eyebrow">${escape(column.kicker)}</p><h3>${escape(column.title)}</h3><ul>${column.points.map(point => `<li>${escape(point)}</li>`).join('')}</ul></article>`).join('\n')}</div>
  </section>`;
}

function renderEntry(entry, groupTitle) {
  const content = `<figure>${picture(entry.image, { className: 'predator-card-image' })}</figure><div class="predator-card-copy"><p class="eyebrow">${escape(entry.region)}</p><h3>${escape(entry.title)}</h3><p>${escape(entry.description)}</p><span class="predator-card-status">${escape(entry.status)} ${entry.href ? '<i aria-hidden="true">↗</i>' : ''}</span></div>`;
  return entry.href
    ? `<a class="predator-card" href="${escape(entry.href)}" data-predator-entry data-entry-id="${escape(entry.id)}" data-entry-group="${escape(groupTitle)}">${content}</a>`
    : `<article class="predator-card predator-card--pending" data-predator-entry data-entry-id="${escape(entry.id)}" data-entry-group="${escape(groupTitle)}">${content}</article>`;
}

function renderAtlasGroup(group, index) {
  return `<section class="predator-family" id="gruppe-${escape(group.id)}" aria-labelledby="group-${escape(group.id)}-title">
    <header><p class="eyebrow">${String(index + 1).padStart(2, '0')} · ${escape(group.kicker)}</p><h2 id="group-${escape(group.id)}-title">${escape(group.title)}</h2><p>${escape(group.description)}</p></header>
    <div class="predator-card-grid">${group.entries.map(entry => renderEntry(entry, group.title)).join('\n')}</div>
  </section>`;
}

export function renderPredatorOverview(record) {
  const comparisonIndex = record.sections.length;
  const atlasIndex = comparisonIndex + (record.comparison ? 1 : 0);
  const firstAnchor = record.sections[0]?.id || (record.comparison ? 'vergleich' : 'artenregister');
  return `<!doctype html>
<!-- Generated from uebersicht.json by Bestiarium/scripts/build-predator-profiles.mjs. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>${escape(record.title)} · Raubtiere · Bestiarium von Aleria</title><meta name="description" content="${escape(record.lead)}">
  <link rel="icon" href="../../../../IconOrdner/ReiterIcons/Bestiarium-register.webp" type="image/webp">
  <link rel="stylesheet" href="../../../modules/book-shell/book-shell.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../modules/predator-profile/predator-overview.css?v=${VERSION}">
</head>
<body>
  <a class="skip-link" href="#${escape(firstAnchor)}">Zur Raubtierkunde</a>
  <div class="bestiary-page predator-overview" data-predator-overview data-group-id="${escape(record.id)}">
    <header class="masthead" id="anfang"><a class="almanach-link" href="../../../index.html#tiere"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">Thalenorische Akademie · Archiv der Raubtiere</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="predator-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../index.html">Raubtiere</a><span aria-hidden="true">/</span><span aria-current="page">${escape(record.title)}</span></nav>
      <section class="predator-overview-hero" aria-labelledby="predator-overview-title">
        <div class="predator-overview-hero-copy"><div class="predator-overview-seal">${picture(record.icon, { className: 'predator-overview-icon', eager: true })}<span>Raubtierarchiv</span></div><p class="eyebrow">${escape(record.classification)} · Archivblatt ${escape(record.folio)}</p><h1 id="predator-overview-title">${escape(record.title)}</h1><p class="predator-overview-subtitle">${escape(record.subtitle)}</p><p class="predator-overview-lead">${escape(record.lead)}</p><div class="predator-overview-actions"><a class="ink-button" href="#artenregister">Arten aufschlagen <span aria-hidden="true">↓</span></a><a href="../index.html">Zur Raubtierkunde ↗</a></div></div>
        <figure class="predator-overview-hero-figure">${picture(record.hero, { className: 'predator-overview-hero-image', eager: true })}<figcaption>${escape(record.hero.caption)}</figcaption></figure>
      </section>
      <blockquote class="predator-overview-quote"><span aria-hidden="true">❧</span><p>„${escape(record.quote)}“${record.quoteAttribution ? `<cite>${escape(record.quoteAttribution)}</cite>` : ''}</p><span aria-hidden="true">❧</span></blockquote>
      <div class="predator-overview-book">
        <aside class="predator-overview-register"><div><p class="eyebrow">In diesem Archivblatt</p><nav aria-label="Kapitel der Raubtierkunde">${record.sections.map((section, index) => `<a href="#${escape(section.id)}"><span>${roman(index + 1)}</span>${escape(section.title)}</a>`).join('\n')}${record.comparison ? `<a href="#vergleich"><span>${roman(comparisonIndex + 1)}</span>${escape(record.comparison.title)}</a>` : ''}<a class="predator-register-extra" href="#artenregister"><span>${roman(atlasIndex + 1)}</span>Artenregister</a></nav><a class="predator-register-back" href="../index.html">← Alle Raubtiere</a></div></aside>
        <div class="predator-overview-content">
          <article class="predator-overview-lore" aria-label="Naturkunde zu ${escape(record.title)}">${record.sections.map(renderLoreSection).join('\n')}</article>
          ${renderComparison(record.comparison, comparisonIndex)}
          <section class="predator-atlas" id="artenregister" aria-labelledby="predator-atlas-title"><header class="predator-atlas-heading"><p class="eyebrow">${roman(atlasIndex + 1)} · Systematik & Einzeldossiers</p><h2 id="predator-atlas-title">${escape(record.atlas.title)}</h2><p>${escape(record.atlas.intro)}</p></header>${record.atlas.groups.map(renderAtlasGroup).join('\n')}</section>
        </div>
      </div>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>${escape(record.title)} · Raubtiere Alerias</small></p><a href="../index.html">Zurück zur Raubtierkunde ↗</a></footer>
  </div>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}
