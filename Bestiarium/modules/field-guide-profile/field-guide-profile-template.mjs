import { escapeHtml, renderPicture, romanNumeral } from '../book-shell/book-template-utils.mjs';
import { renderProfileMetrics } from '../profile-metrics/profile-metrics-template.mjs';

const VERSION = '20260908-field-guide-profile-v1';

function renderBlock(block) {
  if (block.type === 'subheading') return `<h3>${escapeHtml(block.text)}</h3>`;
  if (block.type === 'list') return `<ul>${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  return `<p>${escapeHtml(block.text)}</p>`;
}

function renderSection(section, index, offset) {
  return `<section class="field-profile-section" id="${escapeHtml(section.id)}" aria-labelledby="title-${escapeHtml(section.id)}">
    <header><span aria-hidden="true">${romanNumeral(index + offset)}</span><h2 id="title-${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2></header>
    <div class="field-profile-prose">${section.blocks.map(renderBlock).join('\n')}</div>
  </section>`;
}

function renderFacts(facts) {
  return `<aside class="field-profile-facts" aria-labelledby="field-facts-title"><p class="eyebrow">Naturkundliche Randspalte</p><h2 id="field-facts-title">Wissenswertes</h2><dl>${facts.map(fact => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`).join('\n')}</dl><span aria-hidden="true">❧</span></aside>`;
}

function renderRelatedCard(entry) {
  const unknown = entry.unknown || entry.name === '???';
  const cardBody = `${entry.image
    ? `<figure>${renderPicture(entry.image, { className: 'field-related-image' })}</figure>`
    : '<div class="field-related-placeholder" aria-hidden="true"><span>?</span></div>'}
    <div><p class="eyebrow">${escapeHtml(entry.region)}</p><h3>${escapeHtml(entry.name)}</h3><p>${escapeHtml(entry.description)}</p><span class="field-related-status">${escapeHtml(entry.status)}</span></div>`;

  if (entry.href) return `<a class="field-related-card" href="${escapeHtml(entry.href)}">${cardBody}</a>`;
  return `<article class="field-related-card${unknown ? ' field-related-card--unknown' : ''}">${cardBody}</article>`;
}

function renderRelated(related, context) {
  if (!related?.entries?.length) return '';
  return `<section class="field-profile-related" id="verwandtschaft" aria-labelledby="related-title">
    <header class="field-profile-feature-heading"><span aria-hidden="true">II</span><div><p class="eyebrow">${escapeHtml(related.eyebrow || context.relatedEyebrow)}</p><h2 id="related-title">${escapeHtml(related.title)}</h2></div></header>
    <p class="field-profile-feature-intro">${escapeHtml(related.intro)}</p>
    <div class="field-related-grid">${related.entries.map(renderRelatedCard).join('\n')}</div>
  </section>`;
}

function renderPlate(plate) {
  return `<a class="field-plate" href="${escapeHtml(plate.src)}" data-bestiary-image-link><figure>${renderPicture(plate)}<figcaption>${escapeHtml(plate.caption)}</figcaption></figure></a>`;
}

function renderPlates(plates, number) {
  if (!plates?.length) return '';
  return `<section class="field-profile-plates" id="bildtafeln" aria-labelledby="plates-title"><header><span aria-hidden="true">${romanNumeral(number)}</span><div><p class="eyebrow">Überlieferte Abbildungen</p><h2 id="plates-title">Bildtafeln</h2></div></header><div class="field-plate-grid">${plates.map(renderPlate).join('\n')}</div></section>`;
}

function renderSibling(link, direction, context) {
  if (!link) return '<span></span>';
  const label = direction === 'previous' ? '← Voriges Dossier' : 'Nächstes Dossier →';
  return `<a class="field-profile-sibling field-profile-sibling--${direction}" href="../${escapeHtml(link.id)}/index.html"><span>${label}</span><strong>${escapeHtml(link.name)}</strong></a>`;
}

export function renderFieldGuideProfile(record, navigation = {}, options = {}) {
  const context = {
    categoryName: 'Arten',
    pageGroup: 'Tiere',
    archiveEdition: 'Naturkundliches Archiv',
    archiveBadge: 'Artenarchiv',
    dossierName: 'Artendossier',
    relatedLabel: 'Varianten & Verwandte',
    relatedEyebrow: 'Systematik der Art',
    rootDataAttribute: 'data-field-guide-profile',
    buildScript: 'Bestiarium/scripts/build-field-guide-profiles.mjs',
    ...options
  };
  const hasRelated = Boolean(record.related?.entries?.length);
  const sectionOffset = hasRelated ? 3 : 2;
  const plateNumber = sectionOffset + record.sections.length;
  const metricIntro = record.metrics.intro || 'Die Werte wurden aus den überlieferten Beschreibungen abgeleitet und machen verwandte Arten und Linien vergleichbar.';

  return `<!doctype html>
<!-- Generated from profil.json by ${escapeHtml(context.buildScript)}. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>${escapeHtml(record.name)} · ${escapeHtml(context.pageGroup)} Alerias</title><meta name="description" content="${escapeHtml(record.summary)}">
  <link rel="icon" href="../../../../IconOrdner/ReiterIcons/Bestiarium-register.webp" type="image/webp">
  <link rel="stylesheet" href="../../../modules/book-shell/book-shell.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../modules/profile-metrics/profile-metrics.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../modules/field-guide-profile/field-guide-profile.css?v=${VERSION}">
</head>
<body>
  <a class="skip-link" href="#feldbewertung">Zum ${escapeHtml(context.dossierName)}</a>
  <div class="bestiary-page field-profile" ${context.rootDataAttribute} data-profile-id="${escapeHtml(record.id)}">
    <header class="masthead" id="anfang"><a class="almanach-link" href="../../../index.html#tiere"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">Thalenorische Akademie · ${escapeHtml(context.archiveEdition)}</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="field-profile-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../index.html">${escapeHtml(context.categoryName)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(record.name)}</span></nav>
      <section class="field-profile-hero" aria-labelledby="field-title">
        <div class="field-profile-hero-copy"><div class="field-profile-seal">${renderPicture(record.icon, { className: 'field-profile-icon', eager: true })}<span>${escapeHtml(context.archiveBadge)}</span></div><p class="eyebrow">${escapeHtml(record.continent)} · ${escapeHtml(record.region)} · Archivblatt ${escapeHtml(record.folio)}</p><h1 id="field-title">${escapeHtml(record.name)}</h1><p class="field-profile-classification">${escapeHtml(record.classification)}</p><p class="field-profile-lead">${escapeHtml(record.summary)}</p><div class="field-profile-actions"><a class="ink-button" href="#feldbewertung">Das Dossier lesen <span aria-hidden="true">↓</span></a><a href="../index.html#gruppe-${escapeHtml(record.parentGroupId)}">Zur Artenübersicht ↗</a></div></div>
        <figure class="field-profile-portrait">${renderPicture(record.hero, { className: 'field-profile-portrait-image', eager: true })}<figcaption>${escapeHtml(record.hero.caption)}</figcaption></figure>
      </section>
      <blockquote class="field-profile-quote"><span aria-hidden="true">❧</span><p>„${escapeHtml(record.quote)}“<cite>${escapeHtml(record.quoteAttribution)}</cite></p><span aria-hidden="true">❧</span></blockquote>
      <div class="field-profile-book">
        <aside class="field-profile-register"><div><p class="eyebrow">In diesem Dossier</p><nav aria-label="Kapitel des ${escapeHtml(context.dossierName)}"><a href="#feldbewertung"><span>I</span>Archivbewertung</a>${hasRelated ? `<a href="#verwandtschaft"><span>II</span>${escapeHtml(context.relatedLabel)}</a>` : ''}${record.sections.map((section, index) => `<a href="#${escapeHtml(section.id)}"><span>${romanNumeral(index + sectionOffset)}</span>${escapeHtml(section.title)}</a>`).join('\n')}${record.plates?.length ? `<a href="#bildtafeln"><span>${romanNumeral(plateNumber)}</span>Bildtafeln</a>` : ''}</nav><a class="field-profile-register-back" href="../index.html">← Alle ${escapeHtml(context.categoryName)}</a></div></aside>
        <div class="field-profile-content">
          <section class="field-profile-metrics" id="feldbewertung" aria-labelledby="metrics-title"><header class="field-profile-feature-heading"><span aria-hidden="true">I</span><div><p class="eyebrow">Sechs Merkmale · Skala 1–10</p><h2 id="metrics-title">Archivbewertung</h2></div></header><p class="field-profile-feature-intro">${escapeHtml(metricIntro)}</p>${renderProfileMetrics(record.metrics, { chartTitle: `Archivbewertung für ${record.name}` })}<p class="field-profile-metrics-source">Quelle der Einordnung: ${escapeHtml(record.metrics.source)}</p></section>
          ${renderRelated(record.related, context)}
          <div class="field-profile-reading"><article class="field-profile-narrative" aria-label="Überlieferung zu ${escapeHtml(record.name)}">${record.sections.map((section, index) => renderSection(section, index, sectionOffset)).join('\n')}</article>${renderFacts(record.facts)}</div>
          ${renderPlates(record.plates, plateNumber)}
          <nav class="field-profile-navigation" aria-label="Weitere ${escapeHtml(context.categoryName)}-Dossiers">${renderSibling(navigation.previous, 'previous', context)}<a class="field-profile-all" href="../index.html">Alle ${escapeHtml(context.categoryName)}</a>${renderSibling(navigation.next, 'next', context)}</nav>
        </div>
      </div>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>${escapeHtml(record.name)} · ${escapeHtml(context.pageGroup)} Alerias</small></p><a href="../index.html">Zurück zur Artenübersicht ↗</a></footer>
  </div>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}
