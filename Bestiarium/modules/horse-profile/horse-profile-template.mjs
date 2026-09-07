import { renderProfileMetrics } from '../profile-metrics/profile-metrics-template.mjs';

const VERSION = '20260907-horse-profile-v2';
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const roman = number => {
  const values = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return values[number - 1] || String(number);
};

function picture(image, { className = '', eager = false } = {}) {
  return `<img class="${escape(className)}" src="${escape(image.src)}" alt="${escape(image.alt)}" width="${Number(image.width)}" height="${Number(image.height)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}

function renderBlock(block) {
  if (block.type === 'subheading') return `<h3>${escape(block.text)}</h3>`;
  if (block.type === 'list') return `<ul>${block.items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
  return `<p>${escape(block.text)}</p>`;
}

function renderSection(section, index) {
  return `<section class="horse-section" id="${escape(section.id)}" aria-labelledby="title-${escape(section.id)}">
    <header class="horse-section-heading"><span aria-hidden="true">${roman(index + 3)}</span><h2 id="title-${escape(section.id)}">${escape(section.title)}</h2></header>
    <div class="horse-prose">${section.blocks.map(renderBlock).join('\n')}</div>
  </section>`;
}

function renderFacts(facts) {
  if (!facts.length) return '';
  return `<aside class="horse-facts" aria-labelledby="facts-title"><p class="eyebrow">Zuchtbuchnotizen</p><h2 id="facts-title">Das Pferd im Überblick</h2><dl>${facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('\n')}</dl><span aria-hidden="true">❧</span></aside>`;
}

function renderMarket(record) {
  const market = record.market;
  return `<section class="horse-market" id="rossmarkt" aria-labelledby="rossmarkt-title">
    <header class="horse-feature-heading"><span aria-hidden="true">I</span><div><p class="eyebrow">Aus dem Rossmarkt</p><h2 id="rossmarkt-title">Markt & Haltung</h2></div></header>
    <div class="horse-market-grid"><dl>
      <div><dt>Marktklasse</dt><dd>${escape(market.tier)}</dd></div>
      <div><dt>Üblicher Wert</dt><dd>${escape(market.price)}</dd></div>
      ${market.age ? `<div><dt>Lebenserwartung</dt><dd>${escape(market.age)}</dd></div>` : ''}
    </dl><div class="horse-tags"><p>Geeignet für</p>${market.tags.map(tag => `<span>${escape(tag)}</span>`).join('')}</div></div>
  </section>`;
}

function renderPerformance(record) {
  return `<section class="horse-performance" id="leistungsblatt" aria-labelledby="performance-title">
    <header class="horse-feature-heading"><span aria-hidden="true">II</span><div><p class="eyebrow">Sechs Merkmale · Skala 1–10</p><h2 id="performance-title">Leistungsblatt</h2></div></header>
    <p class="horse-performance-intro">Die Einschätzung folgt den Aufzeichnungen des Rossmarkts und macht die Stärken dieser Linie auf einen Blick vergleichbar.</p>
    ${renderProfileMetrics(record.performance, {
      chartTitle: `Leistungsdiagramm für ${record.name}`,
      emptyText: 'Für diese historische Linie führt der Rossmarkt bislang kein vollständiges Leistungsblatt.'
    })}
  </section>`;
}

function renderSibling(link, direction) {
  if (!link) return '<span></span>';
  return `<a class="horse-sibling horse-sibling--${direction}" href="../${escape(link.id)}/index.html"><span>${direction === 'previous' ? '← Voriges Dossier' : 'Nächstes Dossier →'}</span><strong>${escape(link.name)}</strong></a>`;
}

export function renderHorseProfile(record, navigation = {}) {
  const firstSection = record.sections[0]?.id || 'rossmarkt';
  return `<!doctype html>
<!-- Generated from profil.json by Bestiarium/scripts/build-horse-profiles.mjs. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>${escape(record.name)} · Pferde Alerias</title><meta name="description" content="${escape(record.summary)}">
  <link rel="icon" href="../../../../IconOrdner/ReiterIcons/Bestiarium-register.webp" type="image/webp">
  <link rel="stylesheet" href="../../../modules/book-shell/book-shell.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../modules/profile-metrics/profile-metrics.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../modules/horse-profile/horse-profile.css?v=${VERSION}">
</head>
<body>
  <a class="skip-link" href="#${escape(firstSection)}">Zum Pferdedossier</a>
  <div class="bestiary-page horse-profile" data-horse-profile data-profile-id="${escape(record.id)}">
    <header class="masthead" id="anfang"><a class="almanach-link" href="../../../index.html#tiere"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">Thalenorische Akademie · Hippologisches Archiv</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="horse-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../index.html">Pferde</a><span aria-hidden="true">/</span><span aria-current="page">${escape(record.name)}</span></nav>
      <section class="horse-hero" aria-labelledby="horse-title">
        <div class="horse-hero-copy"><div class="horse-seal">${picture(record.emblem, { className: 'horse-emblem', eager: true })}<span>Rossarchiv</span></div><p class="eyebrow">${escape(record.continent)} · ${escape(record.region)} · Archivblatt ${escape(record.folio)}</p><h1 id="horse-title">${escape(record.name)}</h1><p class="horse-classification">${escape(record.classification)}</p><p class="horse-lead">${escape(record.summary)}</p><div class="horse-hero-actions"><a class="ink-button" href="#rossmarkt">Das Dossier lesen <span aria-hidden="true">↓</span></a><a href="../index.html#gruppe-${escape(record.parentGroupId)}">Zur Zuchtlinie ↗</a></div></div>
        <figure class="horse-portrait">${picture(record.hero, { className: 'horse-portrait-image', eager: true })}<figcaption>${escape(record.hero.caption)}</figcaption></figure>
      </section>
      <blockquote class="horse-quote"><span aria-hidden="true">❧</span><p>„${escape(record.quote)}“${record.quoteAttribution ? `<cite>${escape(record.quoteAttribution)}</cite>` : ''}</p><span aria-hidden="true">❧</span></blockquote>
      <div class="horse-book">
        <aside class="horse-register"><div><p class="eyebrow">In diesem Dossier</p><nav aria-label="Kapitel des Pferdedossiers"><a href="#rossmarkt"><span>I</span>Markt & Haltung</a><a href="#leistungsblatt"><span>II</span>Leistungsblatt</a>${record.sections.map((section, index) => `<a href="#${escape(section.id)}"><span>${roman(index + 3)}</span>${escape(section.title)}</a>`).join('\n')}</nav><a class="horse-register-back" href="../index.html#gruppe-${escape(record.parentGroupId)}">← Alle Pferde dieser Linie</a></div></aside>
        <div class="horse-content">
          <div class="horse-feature-grid">${renderMarket(record)}${renderPerformance(record)}</div>
          <div class="horse-reading"><article class="horse-narrative" aria-label="Überlieferung zu ${escape(record.name)}">${record.sections.map(renderSection).join('\n')}</article>${renderFacts(record.facts)}</div>
          <nav class="horse-profile-navigation" aria-label="Weitere Pferdedossiers">${renderSibling(navigation.previous, 'previous')}<a class="horse-all-link" href="../index.html">Alle Pferde</a>${renderSibling(navigation.next, 'next')}</nav>
        </div>
      </div>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>${escape(record.name)} · Pferde Alerias</small></p><a href="../index.html">Zurück zum Pferdearchiv ↗</a></footer>
  </div>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}
