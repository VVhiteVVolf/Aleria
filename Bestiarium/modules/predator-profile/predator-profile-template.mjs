import { renderProfileMetrics } from '../profile-metrics/profile-metrics-template.mjs';

const VERSION = '20260907-predator-profile-v1';
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const roman = number => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][number - 1] || String(number);

function picture(image, { className = '', eager = false } = {}) {
  return `<img class="${escape(className)}" src="${escape(image.src)}" alt="${escape(image.alt)}" width="${Number(image.width)}" height="${Number(image.height)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}

function renderBlock(block) {
  if (block.type === 'subheading') return `<h3>${escape(block.text)}</h3>`;
  if (block.type === 'list') return `<ul>${block.items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
  return `<p>${escape(block.text)}</p>`;
}

function renderSection(section, index) {
  return `<section class="predator-profile-section" id="${escape(section.id)}" aria-labelledby="title-${escape(section.id)}">
    <header><span aria-hidden="true">${roman(index + 2)}</span><h2 id="title-${escape(section.id)}">${escape(section.title)}</h2></header>
    <div class="predator-profile-prose">${section.blocks.map(renderBlock).join('\n')}</div>
  </section>`;
}

function renderFacts(facts) {
  return `<aside class="predator-profile-facts" aria-labelledby="facts-title"><p class="eyebrow">Feldnotizen</p><h2 id="facts-title">Art im Überblick</h2><dl>${facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('\n')}</dl><span aria-hidden="true">❧</span></aside>`;
}

function renderSibling(link, direction) {
  if (!link) return '<span></span>';
  const label = direction === 'previous' ? '← Voriges Dossier' : 'Nächstes Dossier →';
  return `<a class="predator-sibling predator-sibling--${direction}" href="../${escape(link.id)}/index.html"><span>${label}</span><strong>${escape(link.name)}</strong></a>`;
}

export function renderPredatorProfile(record, navigation = {}) {
  return `<!doctype html>
<!-- Generated from profil.json by Bestiarium/scripts/build-predator-profiles.mjs. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>${escape(record.name)} · ${escape(record.group.title)} · Bestiarium von Aleria</title><meta name="description" content="${escape(record.summary)}">
  <link rel="icon" href="../../../../../IconOrdner/ReiterIcons/Bestiarium-register.webp" type="image/webp">
  <link rel="stylesheet" href="../../../../modules/book-shell/book-shell.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../../modules/profile-metrics/profile-metrics.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../../modules/predator-profile/predator-profile.css?v=${VERSION}">
</head>
<body>
  <a class="skip-link" href="#feldbewertung">Zum Raubtierdossier</a>
  <div class="bestiary-page predator-profile" data-predator-profile data-profile-id="${escape(record.id)}">
    <header class="masthead" id="anfang"><a class="almanach-link" href="../../../../index.html#tiere"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">Thalenorische Akademie · Feldarchiv der Raubtiere</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="predator-profile-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../../index.html">Raubtiere</a><span aria-hidden="true">/</span><a href="../index.html">${escape(record.group.title)}</a><span aria-hidden="true">/</span><span aria-current="page">${escape(record.name)}</span></nav>
      <section class="predator-profile-hero" aria-labelledby="predator-title">
        <div class="predator-profile-hero-copy"><div class="predator-profile-seal">${picture(record.icon, { className: 'predator-profile-icon', eager: true })}<span>Feldarchiv</span></div><p class="eyebrow">${escape(record.continent)} · ${escape(record.region)} · Archivblatt ${escape(record.folio)}</p><h1 id="predator-title">${escape(record.name)}</h1><p class="predator-profile-classification">${escape(record.classification)}</p><p class="predator-profile-lead">${escape(record.summary)}</p><div class="predator-profile-actions"><a class="ink-button" href="#feldbewertung">Das Dossier lesen <span aria-hidden="true">↓</span></a><a href="../index.html#gruppe-${escape(record.group.subgroupId)}">Zur Artenübersicht ↗</a></div></div>
        <figure class="predator-profile-portrait">${picture(record.hero, { className: 'predator-profile-portrait-image', eager: true })}<figcaption>${escape(record.hero.caption)}</figcaption></figure>
      </section>
      <blockquote class="predator-profile-quote"><span aria-hidden="true">❧</span><p>„${escape(record.quote)}“${record.quoteAttribution ? `<cite>${escape(record.quoteAttribution)}</cite>` : ''}</p><span aria-hidden="true">❧</span></blockquote>
      <div class="predator-profile-book">
        <aside class="predator-profile-register"><div><p class="eyebrow">In diesem Dossier</p><nav aria-label="Kapitel des Raubtierdossiers"><a href="#feldbewertung"><span>I</span>Feldbewertung</a>${record.sections.map((section, index) => `<a href="#${escape(section.id)}"><span>${roman(index + 2)}</span>${escape(section.title)}</a>`).join('\n')}</nav><a class="predator-profile-register-back" href="../index.html">← Alle ${escape(record.group.title)}</a></div></aside>
        <div class="predator-profile-content">
          <section class="predator-profile-metrics" id="feldbewertung" aria-labelledby="metrics-title"><header class="predator-profile-feature-heading"><span aria-hidden="true">I</span><div><p class="eyebrow">Sechs Merkmale · Skala 1–10</p><h2 id="metrics-title">Feldbewertung</h2></div></header><p class="predator-profile-metrics-intro">Diese Werte wurden aus den überlieferten Beschreibungen abgeleitet. Sie dienen dem Vergleich innerhalb des Raubtierarchivs und sind keine exakten Messwerte.</p>${renderProfileMetrics(record.metrics, { chartTitle: `Feldbewertung für ${record.name}` })}<p class="predator-profile-metrics-source">Quelle der Einordnung: ${escape(record.metrics.source)}</p></section>
          <div class="predator-profile-reading"><article class="predator-profile-narrative" aria-label="Überlieferung zu ${escape(record.name)}">${record.sections.map(renderSection).join('\n')}</article>${renderFacts(record.facts)}</div>
          <nav class="predator-profile-navigation" aria-label="Weitere Raubtierdossiers">${renderSibling(navigation.previous, 'previous')}<a class="predator-profile-all" href="../index.html">Alle ${escape(record.group.title)}</a>${renderSibling(navigation.next, 'next')}</nav>
        </div>
      </div>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>${escape(record.name)} · ${escape(record.group.title)}</small></p><a href="../index.html">Zurück zur Artenübersicht ↗</a></footer>
  </div>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}
