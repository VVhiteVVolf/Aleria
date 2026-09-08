import { escapeHtml, renderPicture, romanNumeral } from '../book-shell/book-template-utils.mjs';

const VERSION = '20260908-dog-profile-v1';

function renderBlock(block) {
  if (block.type === 'subheading') return `<h3>${escapeHtml(block.text)}</h3>`;
  if (block.type === 'list') return `<ul>${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  return `<p>${escapeHtml(block.text)}</p>`;
}

function renderSection(section, index) {
  return `<section class="livestock-section dog-profile-section" id="${escapeHtml(section.id)}" aria-labelledby="title-${escapeHtml(section.id)}">
    <header><span aria-hidden="true">${romanNumeral(index + 1)}</span><h2 id="title-${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2></header>
    <div class="livestock-prose dog-profile-prose">${section.blocks.map(renderBlock).join('\n')}</div>
  </section>`;
}

function renderFacts(facts) {
  return `<aside class="livestock-facts dog-profile-facts" aria-labelledby="dog-facts-title"><p class="eyebrow">Rassenblatt</p><h2 id="dog-facts-title">Wissenswertes</h2><dl>${facts.map(fact => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`).join('\n')}</dl></aside>`;
}

function renderSibling(link, direction) {
  if (!link) return '<span></span>';
  const label = direction === 'previous' ? '← Voriges Dossier' : 'Nächstes Dossier →';
  return `<a class="dog-profile-sibling dog-profile-sibling--${direction}" href="../${escapeHtml(link.id)}/index.html"><span>${label}</span><strong>${escapeHtml(link.name)}</strong></a>`;
}

export function renderDogProfile(record, navigation = {}) {
  const firstSection = record.sections[0]?.id || 'einfuehrung';
  return `<!doctype html>
<!-- Generated from profil.json by Bestiarium/scripts/build-dog-profiles.mjs. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>${escapeHtml(record.name)} · Hunde Alerias</title><meta name="description" content="${escapeHtml(record.summary)}">
  <link rel="icon" href="../../../../../../IconOrdner/ReiterIcons/Bestiarium-register.webp" type="image/webp">
  <link rel="stylesheet" href="../../../../../modules/book-shell/book-shell.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../../../modules/livestock-category/livestock-category.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../../../modules/dog-profile/dog-profile.css?v=${VERSION}">
</head>
<body>
  <a class="skip-link" href="#${escapeHtml(firstSection)}">Zum Rassendossier</a>
  <div class="bestiary-page livestock-page dog-profile" data-dog-profile data-profile-id="${escapeHtml(record.id)}">
    <header class="masthead" id="anfang"><a class="almanach-link" href="../../../../../index.html#tiere"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">Thalenorische Akademie · Kynologisches Archiv</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="livestock-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../../../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../../../index.html">Vieh</a><span aria-hidden="true">/</span><a href="../../index.html">Haustiere</a><span aria-hidden="true">/</span><a href="../index.html">Hunde</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(record.name)}</span></nav>
      <section class="livestock-hero dog-profile-hero" aria-labelledby="dog-title">
        <div class="livestock-hero-copy"><div class="livestock-seal">${renderPicture(record.icon, { className: 'livestock-icon dog-profile-icon', eager: true })}<span>Rassenarchiv</span></div><p class="eyebrow">${escapeHtml(record.continent)} · ${escapeHtml(record.region)} · Archivblatt ${escapeHtml(record.folio)}</p><h1 id="dog-title">${escapeHtml(record.name)}</h1><p class="livestock-subtitle">${escapeHtml(record.classification)}</p><p class="livestock-lead">${escapeHtml(record.summary)}</p><div class="livestock-actions"><a class="ink-button" href="#${escapeHtml(firstSection)}">Das Dossier lesen <span aria-hidden="true">↓</span></a><a href="../index.html#gruppe-${escapeHtml(record.parentGroupId)}">Zur Rassenübersicht ↗</a></div></div>
        <figure class="livestock-hero-figure dog-profile-portrait">${renderPicture(record.hero, { className: 'livestock-hero-image dog-profile-portrait-image', eager: true })}<figcaption>${escapeHtml(record.hero.caption)}</figcaption></figure>
      </section>
      <blockquote class="livestock-quote dog-profile-quote"><span aria-hidden="true">❧</span><p>„${escapeHtml(record.quote)}“${record.quoteAttribution ? `<cite>${escapeHtml(record.quoteAttribution)}</cite>` : ''}</p><span aria-hidden="true">❧</span></blockquote>
      <div class="livestock-book dog-profile-book">
        <aside class="livestock-register dog-profile-register"><div><p class="eyebrow">In diesem Dossier</p><nav aria-label="Kapitel des Rassendossiers">${record.sections.map((section, index) => `<a href="#${escapeHtml(section.id)}"><span>${romanNumeral(index + 1)}</span>${escapeHtml(section.title)}</a>`).join('\n')}</nav><a class="livestock-register-back" href="../index.html#gruppe-${escapeHtml(record.parentGroupId)}">← Alle Hunderassen</a></div></aside>
        <div class="livestock-content dog-profile-content">
          ${renderFacts(record.facts)}
          <article class="livestock-lore dog-profile-narrative" aria-label="Überlieferung zu ${escapeHtml(record.name)}">${record.sections.map(renderSection).join('\n')}</article>
          <nav class="dog-profile-navigation" aria-label="Weitere Rassendossiers">${renderSibling(navigation.previous, 'previous')}<a class="dog-profile-all" href="../index.html">Alle Hunde</a>${renderSibling(navigation.next, 'next')}</nav>
        </div>
      </div>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>${escapeHtml(record.name)} · Hunde Alerias</small></p><a href="../index.html">Zurück zum Hundearchiv ↗</a></footer>
  </div>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}
