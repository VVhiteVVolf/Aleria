import { escapeHtml, renderPicture, romanNumeral } from '../book-shell/book-template-utils.mjs';
import { LIVESTOCK_CATEGORIES } from './livestock-category-registry.mjs';

const VERSION = '20260908-livestock-category-v1';

function renderTabs(currentId) {
  return LIVESTOCK_CATEGORIES.map(category => {
    const current = category.id === currentId;
    return `<a href="${current ? './index.html' : `../${escapeHtml(category.id)}/index.html`}"${current ? ' aria-current="page"' : ''}>${escapeHtml(category.title)}</a>`;
  }).join('\n');
}

function renderSection(section, index) {
  return `<section class="livestock-section" id="${escapeHtml(section.id)}" aria-labelledby="section-${escapeHtml(section.id)}-title">
    <header><span aria-hidden="true">${romanNumeral(index + 1)}</span><h2 id="section-${escapeHtml(section.id)}-title">${escapeHtml(section.title)}</h2></header>
    <div class="livestock-prose">${section.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('\n')}</div>
  </section>`;
}

function renderFacts(facts) {
  return `<aside class="livestock-facts" aria-labelledby="livestock-facts-title"><p class="eyebrow">Naturkundliche Randspalte</p><h2 id="livestock-facts-title">Wissenswertes</h2><dl>${facts.map(fact => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`).join('\n')}</dl></aside>`;
}

function renderEntryArt(entry) {
  return `<div class="livestock-entry-art${entry.images.length > 1 ? ' livestock-entry-art--pair' : ''}" data-image-count="${entry.images.length}">${entry.images.map(image => `<figure>${renderPicture(image, { className: 'livestock-entry-image' })}</figure>`).join('\n')}</div>`;
}

function renderEntry(entry, groupTitle) {
  const content = `${renderEntryArt(entry)}<div class="livestock-entry-copy"><p class="eyebrow">${escapeHtml(entry.region)}</p><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.description)}</p><span>${escapeHtml(entry.status)}${entry.href ? ' <i aria-hidden="true">↗</i>' : ''}</span></div>`;
  return entry.href
    ? `<a class="livestock-entry" href="${escapeHtml(entry.href)}" data-livestock-entry data-entry-id="${escapeHtml(entry.id)}" data-entry-group="${escapeHtml(groupTitle)}">${content}</a>`
    : `<article class="livestock-entry livestock-entry--pending" data-livestock-entry data-entry-id="${escapeHtml(entry.id)}" data-entry-group="${escapeHtml(groupTitle)}">${content}</article>`;
}

function renderGroup(group, index) {
  const entries = group.entries.length
    ? `<div class="livestock-entry-grid">${group.entries.map(entry => renderEntry(entry, group.title)).join('\n')}</div>`
    : `<div class="livestock-empty"><span aria-hidden="true">◇</span><div><strong>Noch kein benannter Eintrag</strong><p>${escapeHtml(group.description)}</p></div></div>`;
  return `<section class="livestock-group${group.entries.length ? '' : ' livestock-group--empty'}" id="bestand-${escapeHtml(group.id)}" aria-labelledby="bestand-${escapeHtml(group.id)}-title">
    <header><p class="eyebrow">${String(index + 1).padStart(2, '0')} · ${escapeHtml(group.kicker)}</p><h2 id="bestand-${escapeHtml(group.id)}-title">${escapeHtml(group.title)}</h2>${group.entries.length ? `<p>${escapeHtml(group.description)}</p>` : ''}</header>
    ${entries}
  </section>`;
}

export function renderLivestockCategory(record) {
  const catalogNumber = romanNumeral(record.sections.length + 1);
  return `<!doctype html>
<!-- Generated from uebersicht.json by Bestiarium/scripts/build-livestock-categories.mjs. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>${escapeHtml(record.title)} · Vieh · Bestiarium von Aleria</title><meta name="description" content="${escapeHtml(record.lead)}">
  <link rel="icon" href="../../../../IconOrdner/ReiterIcons/Bestiarium-register.webp" type="image/webp">
  <link rel="stylesheet" href="../../../modules/book-shell/book-shell.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../modules/livestock-category/livestock-category.css?v=${VERSION}">
</head>
<body>
  <a class="skip-link" href="#${escapeHtml(record.sections[0].id)}">Zur Viehkunde</a>
  <div class="bestiary-page livestock-page" data-livestock-category data-category-id="${escapeHtml(record.id)}">
    <header class="masthead" id="anfang"><a class="almanach-link" href="../../../index.html#tiere"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">Thalenorische Akademie · Archiv der Viehkunde</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="livestock-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../index.html">Vieh</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(record.title)}</span></nav>
      <nav class="livestock-tabs" aria-label="Unterregister der Viehkunde">${renderTabs(record.id)}</nav>
      <section class="livestock-hero" aria-labelledby="livestock-title">
        <div class="livestock-hero-copy"><div class="livestock-seal">${renderPicture(record.icon, { className: 'livestock-icon', eager: true })}<span>Viehregister</span></div><p class="eyebrow">${escapeHtml(record.classification)} · Archivblatt ${escapeHtml(record.folio)}</p><h1 id="livestock-title">${escapeHtml(record.title)}</h1><p class="livestock-subtitle">${escapeHtml(record.subtitle)}</p><p class="livestock-lead">${escapeHtml(record.lead)}</p><div class="livestock-actions"><a class="ink-button" href="#bestand">Bestand aufschlagen <span aria-hidden="true">↓</span></a><a href="../index.html">Zur Viehkunde ↗</a></div></div>
        <figure class="livestock-hero-figure">${renderPicture(record.hero, { className: 'livestock-hero-image', eager: true })}<figcaption>${escapeHtml(record.hero.caption)}</figcaption></figure>
      </section>
      <blockquote class="livestock-quote"><span aria-hidden="true">❧</span><p>„${escapeHtml(record.quote)}“</p><span aria-hidden="true">❧</span></blockquote>
      <div class="livestock-book">
        <aside class="livestock-register"><div><p class="eyebrow">In diesem Archivblatt</p><nav aria-label="Kapitel der Viehkunde">${record.sections.map((section, index) => `<a href="#${escapeHtml(section.id)}"><span>${romanNumeral(index + 1)}</span>${escapeHtml(section.title)}</a>`).join('\n')}<a class="livestock-register-extra" href="#bestand"><span>${catalogNumber}</span>${escapeHtml(record.catalog.title)}</a></nav><a class="livestock-register-back" href="../index.html">← Alle Viehgruppen</a></div></aside>
        <div class="livestock-content">
          ${renderFacts(record.facts)}
          <article class="livestock-lore" aria-label="Viehkundlicher Text zu ${escapeHtml(record.title)}">${record.sections.map(renderSection).join('\n')}</article>
          <section class="livestock-catalog" id="bestand" aria-labelledby="livestock-catalog-title"><header class="livestock-catalog-heading"><p class="eyebrow">${catalogNumber} · Ordnung der alten Tafeln</p><h2 id="livestock-catalog-title">${escapeHtml(record.catalog.title)}</h2><p>${escapeHtml(record.catalog.intro)}</p></header>${record.catalog.groups.map(renderGroup).join('\n')}</section>
        </div>
      </div>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>${escapeHtml(record.title)} · Vieh Alerias</small></p><a href="../index.html">Zurück zur Viehkunde ↗</a></footer>
  </div>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}
