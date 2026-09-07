const VERSION = '20260907-topic-articles-v1';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const roman = number => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][number - 1] || String(number);

function picture(image, { className = '', alt = '', eager = false } = {}) {
  return `<img class="${escape(className)}" src="${escape(image.src)}" alt="${escape(alt)}" width="${image.width}" height="${image.height}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}

function paragraphs(items = []) {
  return items.map(text => `<p>${escape(text)}</p>`).join('\n');
}

function points(items = []) {
  if (!items.length) return '';
  return `<div class="topic-points">${items.map(item => `<article class="topic-point">
    <h3>${escape(item.title)}</h3><p>${escape(item.text)}</p>
    ${item.details?.length ? `<ul>${item.details.map(detail => `<li>${escape(detail)}</li>`).join('')}</ul>` : ''}
  </article>`).join('\n')}</div>`;
}

function subsections(items = []) {
  if (!items.length) return '';
  return `<div class="topic-subsections">${items.map((item, index) => `<section class="topic-subsection">
    <header><span>${String(index + 1).padStart(2, '0')}</span><h3>${escape(item.title)}</h3></header>
    ${item.paragraphs?.length ? `<div class="topic-prose">${paragraphs(item.paragraphs)}</div>` : ''}
    ${points(item.points)}
  </section>`).join('\n')}</div>`;
}

function renderSection(section, index) {
  return `<section class="topic-section" id="${escape(section.id)}" aria-labelledby="title-${escape(section.id)}">
    <header class="topic-section-heading"><span aria-hidden="true">${roman(index + 1)}</span><h2 id="title-${escape(section.id)}">${escape(section.title)}</h2></header>
    ${section.paragraphs?.length ? `<div class="topic-prose">${paragraphs(section.paragraphs)}</div>` : ''}
    ${points(section.points)}
    ${subsections(section.subsections)}
    ${section.afterword?.length ? `<div class="topic-prose topic-afterword">${paragraphs(section.afterword)}</div>` : ''}
    ${section.status ? `<p class="topic-pending"><span aria-hidden="true">✧</span>${escape(section.status)}</p>` : ''}
  </section>`;
}

function renderFacts(topic) {
  return `<aside class="topic-facts" aria-labelledby="facts-title"><p class="eyebrow">Randspalte des Archivs</p><h2 id="facts-title">${escape(topic.factsTitle)}</h2><dl>${topic.facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('\n')}</dl><span aria-hidden="true" class="topic-facts-ornament">❧</span></aside>`;
}

function renderThemeImage(topic) {
  if (topic.themeImage) {
    return `<figure class="topic-theme-figure">${picture(topic.themeImage, { className: 'topic-theme-image', alt: topic.themeImage.alt, eager: true })}<figcaption>${escape(topic.themeImage.caption || topic.title)}</figcaption></figure>`;
  }
  return `<div class="topic-theme-figure topic-theme-figure-empty" role="img" aria-label="Themenbild für ${escape(topic.title)} ist noch nicht vorhanden"><span class="sr-only">Reservierter Platz für das spätere Themenbild.</span></div>`;
}

export function renderTopicArticle(topic) {
  const html = `<!doctype html>
<!-- Generated from thema.json by Bestiarium/scripts/build-topic-articles.mjs. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>${escape(topic.title)} · Themenwand · Bestiarium von Aleria</title><meta name="description" content="${escape(topic.lead)}">
  <link rel="icon" href="../../../IconOrdner/ReiterIcons/Bestiarium-register.webp" type="image/webp">
  <link rel="stylesheet" href="../../modules/book-shell/book-shell.css?v=${VERSION}">
  <link rel="stylesheet" href="../../modules/topic-article/topic-article.css?v=${VERSION}">
</head>
<body>
  <a class="skip-link" href="#${escape(topic.sections[0].id)}">Zum Themenblatt</a>
  <div class="bestiary-page topic-article">
    <header class="masthead" id="anfang"><a class="almanach-link" href="../../index.html#themenwand"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">Thalenorische Akademie · Sphärenkundliches Archiv</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="topic-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../../index.html#themenwand">Themenwand</a><span aria-hidden="true">/</span><span aria-current="page">${escape(topic.title)}</span></nav>
      <section class="topic-hero" aria-labelledby="topic-title">
        <div class="topic-hero-copy"><div class="topic-icon-seal">${picture(topic.icon, { className: 'topic-header-icon', alt: topic.icon.alt, eager: true })}</div><p class="eyebrow">${escape(topic.classification)} <span aria-hidden="true">·</span> Archivblatt ${escape(topic.folio)}</p><h1 id="topic-title">${escape(topic.title)}</h1><p class="topic-subtitle">${escape(topic.subtitle)}</p><p class="topic-lead">${escape(topic.lead)}</p><div class="topic-tags">${topic.tags.map(tag => `<span>${escape(tag)}</span>`).join('')}</div><a class="ink-button" href="#${escape(topic.sections[0].id)}">Das Manuskript lesen <span aria-hidden="true">↓</span></a></div>
        ${renderThemeImage(topic)}
      </section>
      <div class="topic-divider" aria-hidden="true"><span>✦</span></div>
      <div class="topic-book">
        <aside class="topic-register"><div><p class="eyebrow">In diesem Themenblatt</p><nav aria-label="Themenkapitel">${topic.sections.map((section, index) => `<a href="#${escape(section.id)}"><span>${roman(index + 1)}</span>${escape(section.title)}</a>`).join('\n')}</nav><a class="topic-register-back" href="../../index.html#themenwand">← Zur Themenwand</a></div></aside>
        <div class="topic-reading"><article class="topic-narrative" aria-label="Überlieferung zu ${escape(topic.title)}">${topic.sections.map(renderSection).join('\n')}</article>${renderFacts(topic)}</div>
      </div>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>${escape(topic.title)} · Themenwand des Bestiariums</small></p><a href="../../index.html#themenwand">Zurück zur Themenwand ↗</a></footer>
  </div>
</body>
</html>
`;

  return html.replace(/[ \t]+$/gm, '');
}
