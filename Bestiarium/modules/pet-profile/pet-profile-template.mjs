import { escapeHtml, renderPicture, romanNumeral } from '../book-shell/book-template-utils.mjs';
import { renderProfileMetrics } from '../profile-metrics/profile-metrics-template.mjs';

const VERSION = '20260908-pet-profile-v2';

function renderBlock(block) {
  if (block.type === 'subheading') return `<h3>${escapeHtml(block.text)}</h3>`;
  if (block.type === 'list') return `<ul>${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  return `<p>${escapeHtml(block.text)}</p>`;
}

function renderSection(section, index) {
  return `<section class="livestock-section pet-profile-section" id="${escapeHtml(section.id)}" aria-labelledby="title-${escapeHtml(section.id)}">
    <header><span aria-hidden="true">${romanNumeral(index + 2)}</span><h2 id="title-${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2></header>
    <div class="livestock-prose pet-profile-prose">${section.blocks.map(renderBlock).join('\n')}</div>
  </section>`;
}

function renderFacts(facts) {
  return `<aside class="livestock-facts pet-profile-facts" aria-labelledby="pet-facts-title"><p class="eyebrow">Rassenblatt</p><h2 id="pet-facts-title">Wissenswertes</h2><dl>${facts.map(fact => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`).join('\n')}</dl></aside>`;
}

function renderSibling(link, direction) {
  if (!link) return '<span></span>';
  const label = direction === 'previous' ? '← Voriges Dossier' : 'Nächstes Dossier →';
  return `<a class="pet-profile-sibling pet-profile-sibling--${direction}" href="../${escapeHtml(link.id)}/index.html"><span>${label}</span><strong>${escapeHtml(link.name)}</strong></a>`;
}

export function renderPetProfile(record, navigation) {
  return `<!doctype html>
<!-- Generated from profil.json by ${escapeHtml(navigation.generatedBy)}. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>${escapeHtml(record.name)} · ${escapeHtml(navigation.pageTitleContext)}</title><meta name="description" content="${escapeHtml(record.summary)}">
  <link rel="icon" href="../../../../../../IconOrdner/ReiterIcons/Bestiarium-register.webp" type="image/webp">
  <link rel="stylesheet" href="../../../../../modules/book-shell/book-shell.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../../../modules/livestock-category/livestock-category.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../../../modules/profile-metrics/profile-metrics.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../../../modules/pet-profile/pet-profile.css?v=${VERSION}">
</head>
<body>
  <a class="skip-link" href="#rassenprofil">Zum Rassendossier</a>
  <div class="bestiary-page livestock-page pet-profile pet-profile--${escapeHtml(navigation.kindId)}" data-pet-profile data-profile-kind="${escapeHtml(navigation.kindId)}" data-profile-id="${escapeHtml(record.id)}">
    <header class="masthead" id="anfang"><a class="almanach-link" href="../../../../../index.html#tiere"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">Thalenorische Akademie · ${escapeHtml(navigation.archiveTitle)}</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="livestock-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../../../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../../../index.html">Vieh</a><span aria-hidden="true">/</span><a href="../../index.html">Haustiere</a><span aria-hidden="true">/</span><a href="../index.html">${escapeHtml(navigation.kindTitle)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(record.name)}</span></nav>
      <section class="livestock-hero pet-profile-hero" aria-labelledby="pet-title">
        <div class="livestock-hero-copy"><div class="livestock-seal">${renderPicture(record.icon, { className: 'livestock-icon pet-profile-icon', eager: true })}<span>Rassenarchiv</span></div><p class="eyebrow">${escapeHtml(record.continent)} · ${escapeHtml(record.region)} · Archivblatt ${escapeHtml(record.folio)}</p><h1 id="pet-title">${escapeHtml(record.name)}</h1><p class="livestock-subtitle">${escapeHtml(record.classification)}</p><p class="livestock-lead">${escapeHtml(record.summary)}</p><div class="livestock-actions"><a class="ink-button" href="#rassenprofil">Das Dossier lesen <span aria-hidden="true">↓</span></a><a href="../index.html#bestand-${escapeHtml(record.parentGroupId)}">Zur Rassenübersicht ↗</a></div></div>
        <figure class="livestock-hero-figure pet-profile-portrait">${renderPicture(record.hero, { className: 'livestock-hero-image pet-profile-portrait-image', eager: true })}<figcaption>${escapeHtml(record.hero.caption)}</figcaption></figure>
      </section>
      <blockquote class="livestock-quote pet-profile-quote"><span aria-hidden="true">❧</span><p>„${escapeHtml(record.quote)}“${record.quoteAttribution ? `<cite>${escapeHtml(record.quoteAttribution)}</cite>` : ''}</p><span aria-hidden="true">❧</span></blockquote>
      <div class="livestock-book pet-profile-book">
        <aside class="livestock-register pet-profile-register"><div><p class="eyebrow">In diesem Dossier</p><nav aria-label="Kapitel des Rassendossiers"><a href="#rassenprofil"><span>I</span>Rassenprofil</a>${record.sections.map((section, index) => `<a href="#${escapeHtml(section.id)}"><span>${romanNumeral(index + 2)}</span>${escapeHtml(section.title)}</a>`).join('\n')}</nav><a class="livestock-register-back" href="../index.html#bestand-${escapeHtml(record.parentGroupId)}">← ${escapeHtml(navigation.registerBackLabel)}</a></div></aside>
        <div class="livestock-content pet-profile-content">
          <section class="pet-profile-metrics" id="rassenprofil" aria-labelledby="pet-metrics-title"><header class="pet-profile-feature-heading"><span aria-hidden="true">I</span><div><p class="eyebrow">Sechs Merkmale · Skala 1–10</p><h2 id="pet-metrics-title">Rassenprofil</h2></div></header><p class="pet-profile-metrics-intro">Die Werte wurden aus den überlieferten Rassenbeschreibungen abgeleitet und machen Arbeitsweise, Wesen und körperliche Anlagen vergleichbar.</p>${renderProfileMetrics(record.metrics, { chartTitle: `Rassenprofil für ${record.name}` })}<p class="pet-profile-metrics-source">Quelle der Einordnung: ${escapeHtml(record.metrics?.source || 'Noch nicht eingeordnet')}</p></section>
          <div class="pet-profile-reading"><article class="livestock-lore pet-profile-narrative" aria-label="Überlieferung zu ${escapeHtml(record.name)}">${record.sections.map(renderSection).join('\n')}</article>${renderFacts(record.facts)}</div>
          <nav class="pet-profile-navigation" aria-label="Weitere Rassendossiers">${renderSibling(navigation.previous, 'previous')}<a class="pet-profile-all" href="../index.html">${escapeHtml(navigation.allLabel)}</a>${renderSibling(navigation.next, 'next')}</nav>
        </div>
      </div>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>${escapeHtml(record.name)} · ${escapeHtml(navigation.pageTitleContext)}</small></p><a href="../index.html">Zurück ${escapeHtml(navigation.footerBackLabel)} ↗</a></footer>
  </div>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}
