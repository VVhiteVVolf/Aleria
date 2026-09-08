import { escapeHtml, renderPicture, romanNumeral } from '../book-shell/book-template-utils.mjs';
import { LIVESTOCK_CATEGORIES } from './livestock-category-registry.mjs';

const VERSION = '20260908-livestock-category-v2';

function renderTabs(currentId, tabs) {
  return tabs.map(tab => {
    const current = tab.id === currentId;
    return `<a href="${escapeHtml(tab.href)}"${current ? ' aria-current="page"' : ''}>${escapeHtml(tab.title)}</a>`;
  }).join('\n');
}

function categoryNavigation(record) {
  return {
    generatedBy: 'Bestiarium/scripts/build-livestock-categories.mjs',
    pageTitleContext: 'Vieh',
    faviconHref: '../../../../IconOrdner/ReiterIcons/Bestiarium-register.webp',
    bookShellHref: '../../../modules/book-shell/book-shell.css',
    stylesheetHref: '../../../modules/livestock-category/livestock-category.css',
    skipLabel: 'Zur Viehkunde',
    rootHref: '../../../index.html#tiere',
    mastheadEdition: 'Thalenorische Akademie · Archiv der Viehkunde',
    breadcrumbs: [
      { title: 'Bestiarium', href: '../../../index.html' },
      { title: 'Vieh', href: '../index.html' }
    ],
    tabsLabel: 'Unterregister der Viehkunde',
    tabs: LIVESTOCK_CATEGORIES.map(category => ({
      ...category,
      href: category.id === record.id ? './index.html' : `../${category.id}/index.html`
    })),
    sealLabel: 'Viehregister',
    parentHref: '../index.html',
    parentLabel: 'Zur Viehkunde',
    footerBackLabel: 'zur Viehkunde',
    registerLabel: 'Kapitel der Viehkunde',
    registerBackLabel: 'Alle Viehgruppen',
    loreLabel: 'Viehkundlicher Text',
    footerContext: 'Vieh Alerias'
  };
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
  const modifier = entry.unknown ? ' livestock-entry--unknown' : '';
  return entry.href
    ? `<a class="livestock-entry${modifier}" href="${escapeHtml(entry.href)}" data-livestock-entry data-entry-id="${escapeHtml(entry.id)}" data-entry-group="${escapeHtml(groupTitle)}">${content}</a>`
    : `<article class="livestock-entry livestock-entry--pending${modifier}" data-livestock-entry data-entry-id="${escapeHtml(entry.id)}" data-entry-group="${escapeHtml(groupTitle)}">${content}</article>`;
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

export function renderLivestockArchive(record, navigation) {
  const catalogNumber = romanNumeral(record.sections.length + 1);
  return `<!doctype html>
<!-- Generated from uebersicht.json by ${escapeHtml(navigation.generatedBy)}. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>${escapeHtml(record.title)} · ${escapeHtml(navigation.pageTitleContext)} · Bestiarium von Aleria</title><meta name="description" content="${escapeHtml(record.lead)}">
  <link rel="icon" href="${escapeHtml(navigation.faviconHref)}" type="image/webp">
  <link rel="stylesheet" href="${escapeHtml(navigation.bookShellHref)}?v=${VERSION}">
  <link rel="stylesheet" href="${escapeHtml(navigation.stylesheetHref)}?v=${VERSION}">
</head>
<body>
  <a class="skip-link" href="#${escapeHtml(record.sections[0].id)}">${escapeHtml(navigation.skipLabel)}</a>
  <div class="bestiary-page livestock-page" data-livestock-category data-category-id="${escapeHtml(record.id)}">
    <header class="masthead" id="anfang"><a class="almanach-link" href="${escapeHtml(navigation.rootHref)}"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">${escapeHtml(navigation.mastheadEdition)}</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="livestock-breadcrumb" aria-label="Brotkrumennavigation">${navigation.breadcrumbs.map(crumb => `<a href="${escapeHtml(crumb.href)}">${escapeHtml(crumb.title)}</a><span aria-hidden="true">/</span>`).join('')}<span aria-current="page">${escapeHtml(record.title)}</span></nav>
      <nav class="livestock-tabs livestock-tabs--${navigation.tabs.length}" aria-label="${escapeHtml(navigation.tabsLabel)}">${renderTabs(record.id, navigation.tabs)}</nav>
      <section class="livestock-hero" aria-labelledby="livestock-title">
        <div class="livestock-hero-copy"><div class="livestock-seal">${renderPicture(record.icon, { className: 'livestock-icon', eager: true })}<span>${escapeHtml(navigation.sealLabel)}</span></div><p class="eyebrow">${escapeHtml(record.classification)} · Archivblatt ${escapeHtml(record.folio)}</p><h1 id="livestock-title">${escapeHtml(record.title)}</h1><p class="livestock-subtitle">${escapeHtml(record.subtitle)}</p><p class="livestock-lead">${escapeHtml(record.lead)}</p><div class="livestock-actions"><a class="ink-button" href="#bestand">Bestand aufschlagen <span aria-hidden="true">↓</span></a><a href="${escapeHtml(navigation.parentHref)}">${escapeHtml(navigation.parentLabel)} ↗</a></div></div>
        <figure class="livestock-hero-figure">${renderPicture(record.hero, { className: 'livestock-hero-image', eager: true })}<figcaption>${escapeHtml(record.hero.caption)}</figcaption></figure>
      </section>
      <blockquote class="livestock-quote"><span aria-hidden="true">❧</span><p>„${escapeHtml(record.quote)}“</p><span aria-hidden="true">❧</span></blockquote>
      <div class="livestock-book">
        <aside class="livestock-register"><div><p class="eyebrow">In diesem Archivblatt</p><nav aria-label="${escapeHtml(navigation.registerLabel)}">${record.sections.map((section, index) => `<a href="#${escapeHtml(section.id)}"><span>${romanNumeral(index + 1)}</span>${escapeHtml(section.title)}</a>`).join('\n')}<a class="livestock-register-extra" href="#bestand"><span>${catalogNumber}</span>${escapeHtml(record.catalog.title)}</a></nav><a class="livestock-register-back" href="${escapeHtml(navigation.parentHref)}">← ${escapeHtml(navigation.registerBackLabel)}</a></div></aside>
        <div class="livestock-content">
          ${renderFacts(record.facts)}
          <article class="livestock-lore" aria-label="${escapeHtml(navigation.loreLabel)} zu ${escapeHtml(record.title)}">${record.sections.map(renderSection).join('\n')}</article>
          <section class="livestock-catalog" id="bestand" aria-labelledby="livestock-catalog-title"><header class="livestock-catalog-heading"><p class="eyebrow">${catalogNumber} · Ordnung der alten Tafeln</p><h2 id="livestock-catalog-title">${escapeHtml(record.catalog.title)}</h2><p>${escapeHtml(record.catalog.intro)}</p></header>${record.catalog.groups.map(renderGroup).join('\n')}</section>
        </div>
      </div>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>${escapeHtml(record.title)} · ${escapeHtml(navigation.footerContext)}</small></p><a href="${escapeHtml(navigation.parentHref)}">Zurück ${escapeHtml(navigation.footerBackLabel)} ↗</a></footer>
  </div>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}

export function renderLivestockCategory(record) {
  return renderLivestockArchive(record, categoryNavigation(record));
}
