import { escapeClassHtml as escape } from './class-page-content.js';

export function renderContents(sections, hasPending) {
  return `<nav class="class-chapter-nav" aria-label="Inhaltsverzeichnis"><p class="eyebrow">In diesem Kapitel</p><ol>${sections.map(section =>
    `<li><a href="#${escape(section.id)}">${escape(section.title)}</a></li>`).join('')}
    ${hasPending ? '<li><a href="#offene-kapitel">Offene Kapitel</a></li>' : ''}</ol></nav>`;
}

export function renderIllustration(document) {
  if (!document.illustration) return '';
  const width = document.artwork?.width || 450;
  const height = document.artwork?.height || 675;
  return `<figure class="class-illustration">
    <div class="class-portrait-frame"><img src="${escape(document.illustration)}" alt="Illustration zur Klasse ${escape(document.name)}" width="${width}" height="${height}" decoding="async" data-role="class-illustration">
      <div class="class-art-fallback" data-role="art-fallback" hidden><span aria-hidden="true">✦</span><strong>${escape(document.name)}</strong><p>Die Illustration ist gerade nicht verfügbar.</p></div></div>
    <figcaption>${escape(document.title)} <span>· Aleria</span></figcaption>
  </figure>`;
}

export function renderFacts(document) {
  return `<section class="class-facts" aria-labelledby="wissenswertes"><p class="eyebrow">Auf einen Blick</p><h2 id="wissenswertes">Wissenswertes</h2>
    <dl>${document.facts.length ? document.facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${fact.html}</dd></div>`).join('')
      : `<div><dt>Klasse</dt><dd>${escape(document.name)}</dd></div><div><dt>Einordnung</dt><dd>Universalklasse</dd></div>`}</dl>
    ${document.facts.length ? '' : '<p class="class-facts-note">Weitere Angaben zum Klassenprofil folgen.</p>'}</section>`;
}

export function renderSection(section, index) {
  return `<section class="class-chapter" id="${escape(section.id)}" aria-labelledby="heading-${escape(section.id)}">
    <div class="class-chapter-heading"><span aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><h2 id="heading-${escape(section.id)}">${escape(section.title)}</h2></div>
    <div class="class-prose">${section.html}</div>
  </section>`;
}

export function renderPending(sections) {
  if (!sections.length) return '';
  return `<details class="class-pending" id="offene-kapitel"><summary>Offene Kapitel <span>${sections.length}</span></summary>
    <p>Diese Teile des Klassenprofils werden noch ergänzt.</p><ul>${sections.map(section => `<li id="${escape(section.id)}">${escape(section.title)}</li>`).join('')}</ul></details>`;
}
