const VERSION = '20260907-fairean-v1';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const roman = number => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][number - 1];
const paragraphs = items => items.map(text => `<p>${escape(text)}</p>`).join('\n');

function picture(image, { className = '', alt = '', eager = false } = {}) {
  return `<img class="${escape(className)}" src="${escape(image.src)}" alt="${escape(alt)}" width="${image.width}" height="${image.height}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}

function pendingLink(entry, content, className) {
  if (entry.href) return `<a class="${className}" href="${escape(entry.href)}">${content}</a>`;
  return `<button class="${className}" type="button" data-action="preview-entry" data-entry-id="${escape(entry.id)}" aria-label="${escape(entry.title)} – Noch nicht ausgearbeitet" aria-haspopup="dialog">${content}</button>`;
}

function sectionHeading(section, index) {
  return `<header class="profile-section-heading"><span aria-hidden="true">${roman(index + 1)}</span><h2 id="title-${escape(section.id)}">${escape(section.title)}</h2></header>`;
}

function renderSection(section, index) {
  return `<section class="profile-section" id="${escape(section.id)}" aria-labelledby="title-${escape(section.id)}">${sectionHeading(section, index)}<div class="profile-prose">${paragraphs(section.paragraphs)}</div></section>`;
}

function renderFacts(facts) {
  return `<aside class="profile-facts" aria-labelledby="facts-title"><p class="eyebrow">Das Wesen im Überblick</p><h2 id="facts-title">Wissenswertes</h2><dl>${facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('\n')}</dl><span class="facts-ornament" aria-hidden="true">❧</span></aside>`;
}

function renderLineages(profile, section, index) {
  const lineageLabel = profile.lineageLabel || 'Schlag';
  const lineageGroup = profile.lineageGroup || `Gattung der ${profile.title}`;
  return `<section class="profile-section profile-lineages" id="${escape(section.id)}" aria-labelledby="title-${escape(section.id)}">
    ${sectionHeading(section, index)}<div class="profile-prose">${paragraphs(section.paragraphs.slice(0, -1))}</div>
    <div class="lineage-grid">${profile.lineages.map((entry, number) => `<article class="lineage-card" data-profile-entry data-entry-id="${escape(entry.id)}" data-entry-group="${escape(lineageGroup)}">
      <p class="eyebrow">${escape(lineageLabel)} ${roman(number + 1)} · ${escape(entry.region)}</p>
      <h3 data-entry-title>${escape(entry.title)}</h3>
      ${pendingLink(entry, `${picture(entry.image)}<span class="lineage-image-label">${entry.href ? 'Gattung aufschlagen ↗' : 'Noch nicht ausgearbeitet ↗'}</span>`, 'lineage-image-link')}
      <p class="lineage-description" data-entry-description>${escape(entry.description)}</p>
    </article>`).join('\n')}</div>
    <div class="profile-prose lineage-afterword">${paragraphs(section.paragraphs.slice(-1))}</div>
  </section>`;
}

function renderGallery(gallery) {
  return `<section class="profile-gallery" id="galerie" data-role="image-gallery" aria-labelledby="gallery-title">
    <header class="gallery-heading"><p class="eyebrow">Bildatlas · Besondere Erscheinungen</p><h2 id="gallery-title">${escape(gallery.title)}</h2><p>${escape(gallery.intro)}</p></header>
    <p class="gallery-instruction">Bildtafeln zum Vergrößern öffnen. Die weiterführenden Einträge sind noch nicht ausgearbeitet.</p>
    <div class="profile-gallery-grid">${gallery.items.map((entry, index) => `<article class="gallery-card" data-profile-entry data-entry-id="${escape(entry.id)}" data-entry-group="${escape(entry.group)}">
      <header><p class="eyebrow">Tafel ${String(index + 1).padStart(2, '0')}</p><h3 data-entry-title>${escape(entry.title)}</h3></header>
      <a class="gallery-image-link" href="${escape(entry.image.src)}" data-bestiary-image-link data-action="open-gallery" data-gallery-title="${escape(entry.title)}" aria-label="Bild vergrößern: ${escape(entry.title)}">${picture(entry.image, { alt: entry.title })}<span aria-hidden="true">Bild vergrößern ⤢</span></a>
      ${pendingLink(entry, `${entry.href ? 'Zum Eintrag' : 'Noch nicht ausgearbeitet'} <span aria-hidden="true">↗</span>`, 'gallery-entry-link')}
    </article>`).join('\n')}</div>
    <dialog class="image-gallery-dialog" data-role="gallery-dialog" aria-labelledby="gallery-dialog-title">
      <header><p data-role="gallery-position" aria-live="polite"></p><button type="button" data-action="close-gallery" aria-label="Galerie schließen" autofocus>×</button></header>
      <figure><img data-role="gallery-image" alt=""><figcaption id="gallery-dialog-title" data-role="gallery-title"></figcaption></figure>
      <nav aria-label="Durch die Bildtafeln blättern"><button type="button" data-action="previous-image">← Vorheriges Bild</button><button type="button" data-action="next-image">Nächstes Bild →</button></nav>
    </dialog>
  </section>`;
}

function previewDialog() {
  return `<dialog class="entry-preview" data-role="entry-preview" aria-labelledby="preview-title" aria-describedby="preview-description">
    <button class="preview-close" type="button" data-action="close-preview" aria-label="Vorschau schließen">×</button>
    <div class="preview-image" data-role="preview-art"></div><p class="eyebrow" data-role="preview-chapter"></p>
    <h2 id="preview-title" data-role="preview-title"></h2><p class="preview-note" data-role="preview-note"></p><p id="preview-description" data-role="preview-description"></p>
    <div class="preview-status"><span aria-hidden="true">✧</span><strong data-role="preview-status"></strong><p>Dieser weiterführende Eintrag ist noch nicht ausgearbeitet. Hier wird später die eigene Profilseite verknüpft.</p></div>
    <button class="ink-button" type="button" data-action="close-preview" autofocus>Zurück zum Profil</button>
  </dialog>`;
}

export function renderCreatureProfile(profile) {
  const lineageIndex = profile.sections.findIndex(section => section.id === (profile.lineageSectionId || 'arten'));
  const lineageSection = lineageIndex >= 0 ? profile.sections[lineageIndex] : null;
  const sectionsBeforeLineages = lineageIndex >= 0 ? profile.sections.slice(0, lineageIndex) : profile.sections;
  const sectionsAfterLineages = lineageIndex >= 0 ? profile.sections.slice(lineageIndex + 1) : [];
  const title = profile.titleLines?.length
    ? profile.titleLines.map((line, index) => `<span${index ? ' class="profile-title-tail"' : ''}>${escape(line)}</span>`).join('')
    : escape(profile.title);
  const galleryNumber = roman(profile.sections.length + 1);
  const triviaNumber = roman(profile.sections.length + 2);
  return `<!doctype html>
<!-- Generated from profil.json by Bestiarium/scripts/build-creature-profiles.mjs. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>${escape(profile.title)} · Bestiarium von Aleria</title><meta name="description" content="${escape(profile.lead)}">
  <link rel="icon" href="../../../IconOrdner/ReiterIcons/Bestiarium-register.webp" type="image/webp">
  <link rel="stylesheet" href="../../modules/book-shell/book-shell.css?v=${VERSION}">
  <link rel="stylesheet" href="../../modules/creature-profile/creature-profile.css?v=${VERSION}">
  <link rel="stylesheet" href="../../modules/image-gallery/image-gallery.css?v=${VERSION}">
  <link rel="stylesheet" href="../../modules/entry-preview/entry-preview.css?v=20260907-bestiarium-v1">
  <script type="module" src="../../modules/creature-profile/creature-profile-page.js?v=${VERSION}"></script>
</head>
<body>
  <a class="skip-link" href="#einfuehrung">Zum Profiltext</a>
  <div class="bestiary-page creature-profile" data-creature-profile>
    <header class="masthead" id="anfang"><a class="almanach-link" href="../../index.html#${escape(profile.chapter.id)}"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">Thalenorische Akademie · Naturkundliches Archiv</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="profile-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../../index.html#${escape(profile.chapter.id)}">${escape(profile.chapter.title)}</a><span aria-hidden="true">/</span><span aria-current="page">${escape(profile.title)}</span></nav>
      <section class="profile-hero" aria-labelledby="profile-title">
        <div class="profile-hero-copy"><p class="eyebrow">${escape(profile.classification)} <span aria-hidden="true">·</span> Archivblatt ${escape(profile.folio)}</p><h1 id="profile-title">${title}</h1><p class="profile-subtitle">${escape(profile.subtitle)}</p><p class="profile-lead">${escape(profile.lead)}</p><div class="profile-habitats">${profile.habitats.map(habitat => `<span>${escape(habitat)}</span>`).join('')}</div><a class="ink-button" href="#einfuehrung">Die Überlieferung lesen <span aria-hidden="true">↓</span></a><a class="profile-gallery-shortcut" href="#galerie">Zum Bildatlas ↗</a></div>
        <figure class="profile-portrait">${picture(profile.portrait, { alt: profile.portrait.alt, eager: true })}<figcaption><span>Aus der überlieferten Bildtafel</span><span>Archiv · ${escape(profile.title)}</span></figcaption></figure>
      </section>
      <div class="profile-pullquote"><span aria-hidden="true">❧</span><p>„${escape(profile.pullQuote)}“</p><span aria-hidden="true">❧</span></div>
      <div class="profile-book">
        <aside class="profile-register"><div><p class="eyebrow">In diesem Archivblatt</p><nav aria-label="Profilkapitel">${profile.sections.map((section, index) => `<a href="#${escape(section.id)}"><span>${roman(index + 1)}</span>${escape(section.title)}</a>`).join('\n')}<a class="profile-register-extra" href="#galerie"><span>${galleryNumber}</span>Bildatlas</a><a href="#trivia"><span>${triviaNumber}</span>Trivia & Randnotizen</a></nav><a class="profile-register-back" href="../../index.html#${escape(profile.chapter.id)}">← Zum Verzeichnis</a></div></aside>
        <div class="profile-content"><div class="profile-reading"><article class="profile-narrative" aria-label="Überlieferung der ${escape(profile.title)}">${sectionsBeforeLineages.map(renderSection).join('\n')}</article>${renderFacts(profile.facts)}</div>
${lineageSection ? renderLineages(profile, lineageSection, lineageIndex) : ''}
${sectionsAfterLineages.length ? `<article class="profile-narrative profile-narrative-after" aria-label="Weitere Überlieferung der ${escape(profile.title)}">${sectionsAfterLineages.map((section, index) => renderSection(section, lineageIndex + index + 1)).join('\n')}</article>` : ''}
${renderGallery(profile.gallery)}
          <aside class="profile-trivia" id="trivia" aria-labelledby="trivia-title"><p class="eyebrow">Am Rand des Manuskripts</p><h2 id="trivia-title">${escape(profile.trivia.title)}</h2><p>${escape(profile.trivia.text)}</p></aside>
        </div>
      </div>
      <noscript><p class="profile-noscript">Die Bildtafeln lassen sich auch ohne JavaScript direkt öffnen. Für die Galerieansicht und die Vorschauen der noch offenen Einträge wird JavaScript benötigt.</p></noscript>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>${escape(profile.title)} · Bestiarium von Aleria</small></p><a href="../../index.html#${escape(profile.chapter.id)}">Zurück zum Bestiarium ↗</a></footer>
    ${previewDialog()}
  </div>
</body>
</html>
`;
}
