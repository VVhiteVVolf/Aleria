import { escapeHtml as h, pageLinkFrom } from '../content/content-html.mjs';
import { renderShell, renderChapterRegister } from '../book-shell/book-shell-template.mjs';
import { renderCelestialSeal } from '../book-shell/celestial-seal.mjs';
import { renderCatalogChapter, renderCatalogTools, renderCatalogEmpty, rootCatalogEntries } from './catalog-register-template.mjs';

export function renderCatalog(catalog) {
  const link = pageLinkFrom('Religionen/index.html');
  const entries = rootCatalogEntries(catalog);
  const religionCount = entries.filter(entry => entry.chapterId === 'religionen').length;
  const main = `<section class="codex-cover" aria-labelledby="page-title">
    <div class="cover-copy"><p class="eyebrow cover-kicker">Alerias Überlieferungen <span aria-hidden="true">/</span> Der Glaube</p><h1 id="page-title"><span>Von Göttern & Sterblichen</span>Die Glaubenswelten<em>von Aleria</em></h1><p class="cover-intro">Von den ersten Mächten bis zu den vielen Wegen des Glaubens. Ein Codex der Religionen, Gottheiten und jener, die zwischen ihnen wandeln.</p><a class="ink-button" href="#verzeichnis">Den Codex aufschlagen <span aria-hidden="true">↗</span></a><p class="cover-colophon">${religionCount} Religionen <span>·</span> ${catalog.chapters.length} Kapitel <span>·</span> Eine Welt voller Überlieferungen</p></div>
    <div class="cover-seal">${renderCelestialSeal()}<p>Das Göttliche trägt viele Namen.</p></div>
  </section>
  <section class="origin-note" aria-labelledby="origin-title"><div><p class="eyebrow">Vor dem ersten Zeitalter</p><h2 id="origin-title">Am Anfang<br>waren die Urgötter.</h2></div><p>${h(catalog.intro)}</p><span aria-hidden="true">❧</span></section>
  <div class="book-layout" data-religion-catalog>
    ${renderChapterRegister(catalog.chapters)}
    <div class="book-content">
      <section class="catalog-intro" id="verzeichnis" aria-labelledby="catalog-title"><p class="eyebrow">Das Register der Überlieferungen</p><h2 id="catalog-title">Welchem Glauben folgt Ihr?</h2><p>Erkundet die Kapitel oder folgt einem Namen durch den Codex.</p></section>
      ${renderCatalogTools(catalog.chapters)}
      <noscript><p class="reading-note">Alle Archivblätter sind unten direkt erreichbar. Mit JavaScript stehen zusätzlich Suche, Kapitelfilter und Sortierung zur Verfügung.</p></noscript>
      <div id="catalog-chapters">${catalog.chapters.map(chapter => renderCatalogChapter(chapter, entries, link)).join('')}</div>
      ${renderCatalogEmpty()}
      <a class="further-reading" href="${link('Religionen/klerus/index.html')}"><span class="reading-mark" aria-hidden="true">❧</span><div><p class="eyebrow">Die Menschen im Dienst der Göttlichen</p><h2>Der Alerische Klerus</h2><p>Sechs Kasten, eigene Hierarchien und die monastischen Zünfte der Kirche.</p></div><span aria-hidden="true">↗</span></a>
      <a class="further-reading" href="${link('Bestiarium/themen/wesen-des-infernalen/index.html')}"><span class="reading-mark" aria-hidden="true">❧</span><div><p class="eyebrow">Aus der Bibliothek des Bestiariums</p><h2>Das Wesen des Infernalen</h2><p>Weiterlesen in den Überlieferungen jenseits der sterblichen Welt.</p></div><span aria-hidden="true">↗</span></a>
    </div>
  </div>`;
  return renderShell({ outputPath: 'Religionen/index.html', title: catalog.title, description: `Religionen und Gottheiten von Aleria: ${religionCount} Glaubensgemeinschaften, die Neun Göttlichen, Infernus und die Wesen zwischen den Sphären.`, main, catalog: true });
}
