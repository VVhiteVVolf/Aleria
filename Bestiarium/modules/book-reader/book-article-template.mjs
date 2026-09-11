import { escapeHtml as escape, renderPicture } from '../book-shell/book-template-utils.mjs';
import { renderBookSource } from './book-content.mjs';

export const BOOK_ASSETS = `
  <link rel="stylesheet" href="../../modules/book-reader/book-reader.css?v=20260909-books-v2">
  <script type="module" src="../../modules/book-reader/book-reader.mjs?v=20260909-books-v2"></script>`;

function cover(topic, back = false) {
  const image = back ? topic.book.backCoverImage : topic.book.coverImage;
  if (image) return renderPicture(image, { className: 'book-cover-art', eager: true });
  // An illustrated front uses a plain leather back unless separate back art is supplied.
  if (back && topic.book.coverImage) return '';
  return `<div class="book-cover-inscription"><p class="book-cover-kicker">${escape(topic.classification)}</p><span class="book-cover-rule" aria-hidden="true">✦</span><p class="book-cover-title">${escape(topic.title)}</p><span class="book-cover-sigil" aria-hidden="true">❧</span><p class="book-cover-author">${escape(back ? topic.book.edition : topic.book.author)}</p><p class="book-cover-imprint">Bestiarium · Aleria</p></div>`;
}

export function renderBookArticleContent(topic) {
  return `<nav class="topic-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../../index.html#literatur">Literaturverweise</a><span aria-hidden="true">/</span><span aria-current="page">${escape(topic.title)}</span></nav>
      <header class="book-article-heading"><div><p class="eyebrow">Literaturverweis <span aria-hidden="true">·</span> ${escape(topic.classification)}</p><h1>${escape(topic.title)}</h1><p class="book-article-lead">${escape(topic.lead)}</p></div><aside class="book-metadata" aria-label="Buchinformationen"><p class="eyebrow">Buchinformationen</p><dl>${topic.facts.filter(fact => fact.label !== 'Titel').map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('')}</dl></aside></header>
${renderBookReader(topic)}
      <p class="book-source-note">${escape(topic.book.sourceNote || '')}</p>`;
}


// Shared by Bestiarium articles and the document workshop.
export function renderBookReader(topic) {
  return `      <section class="book-reader" data-book-reader data-title="${escape(topic.title)}" aria-label="${escape(topic.title)} lesen">
        <div class="book-toolbar" data-role="toolbar" hidden><div class="book-view-switch" role="group" aria-label="Leseansicht"><button type="button" data-action="book-view" aria-pressed="true">Buchansicht</button><button type="button" data-action="article-view" aria-pressed="false">Artikelansicht</button></div><span class="book-edition">${escape(topic.book.edition)}</span><button type="button" data-action="close-book" hidden>Buch schließen</button></div>
        <details class="book-contents"><summary>Inhalt &amp; Kapitel</summary><nav aria-label="Buchkapitel">${topic.sections.map(section => `<a href="#${escape(section.id)}">${escape(section.title)}</a>`).join('')}</nav></details>
        <p class="book-message" data-role="message" role="status" hidden></p>
        <div class="book-stage" data-role="stage" hidden>
          <div class="book-closed" data-role="closed" hidden><button type="button" class="book-cover book-cover-launch" data-action="open-book" aria-label="Buch aufschlagen: ${escape(topic.title)}">${cover(topic)}<span class="book-open-label">Buch aufschlagen <span aria-hidden="true">↗</span></span></button></div>
          <div class="book-mount" data-role="mount" tabindex="0" role="region" aria-label="Blätterbares Buch" aria-describedby="book-help"></div>
          <div class="book-controls" data-role="controls" hidden><button type="button" data-action="previous" aria-label="Vorherige Seite">← <span>Zurück</span></button><p data-role="page-status" aria-live="polite" aria-atomic="true"></p><button type="button" data-action="next" aria-label="Nächste Seite"><span>Weiter</span> →</button></div>
          <p class="book-help" id="book-help">An den äußeren Seitenecken ziehen oder blättern. Pfeiltasten: vor / zurück · Pos1: Einband · Ende: Buchende · Esc: schließen.</p>
        </div>
        <article class="book-prose book-article-source" data-role="source" aria-label="Vollständiger Artikel" tabindex="-1">${renderBookSource(topic)}</article>
        <template data-role="front-cover"><div class="book-leaf book-cover" data-density="hard">${cover(topic)}</div></template>
        <template data-role="back-cover"><div class="book-leaf book-cover" data-density="hard">${cover(topic, true)}</div></template>
      </section>`;
}
