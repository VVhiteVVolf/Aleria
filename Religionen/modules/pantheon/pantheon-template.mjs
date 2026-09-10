import { escapeHtml as h, pageLinkFrom } from '../content/content-html.mjs';
import { entryPagePath, entrySymbolPath } from '../content/content-repository.mjs';
import { renderShell, renderChapterRegister } from '../book-shell/book-shell-template.mjs';
import { renderCatalogChapter, renderCatalogTools, renderCatalogEmpty } from '../catalog/catalog-register-template.mjs';
import { renderLoreBlocks } from '../lore/lore-template.mjs';

export function collectionCatalog(catalog, collection) {
  const saints = collection.saints?.entries || [];
  const members = new Map([...catalog.entries, ...(catalog.records || [])].map(entry => [entry.id, entry]));
  const chapters = [...collection.groups, ...(saints.length ? [{ id: 'heilige', number: 'IV', title: collection.saints.title, label: 'Die Heiligen', shortLabel: 'Heilige', intro: collection.saints.intro, entries: saints.map(saint => saint.id) }] : [])];
  const entries = [
    ...collection.groups.flatMap(group => group.memberIds.map(id => members.get(id))).map(entry => ({ ...entry, chapterId: entry.groupId })),
    ...saints.map(saint => ({ id: `heilige-${saint.id}`, title: saint.name, kind: 'Heiligenregister', summary: saint.epithet || 'Beiname noch nicht überliefert.', tags: [], chapterId: 'heilige', recordOnly: true }))
  ];
  return { chapters, entries };
}

function renderCollectionDoctrine(catalog, collection) {
  const doctrine = (collection.doctrineIds || []).map(id => catalog.sharedLore[id]);
  if (!doctrine.length) return '';
  return `<section class="pantheon-doctrine" id="lehre" aria-labelledby="lehre-title"><p class="eyebrow">Über den einzelnen Götterblättern</p><h2 id="lehre-title">Glaube, Gunst & Gelübde</h2><p>Die gemeinsame Lehre von göttlicher Nähe, Hingabe, Gabe und Versöhnung.</p>${doctrine.map(lore => `<details class="shared-doctrine"><summary>${h(lore.title)}</summary><div>${renderLoreBlocks(lore.blocks)}</div></details>`).join('')}</section>`;
}

function renderCollectionReading(catalog, parent, collection, link) {
  const links = [...(collection.readingEntryIds || []).map(id => {
    const entry = catalog.entries.find(item => item.id === id);
    return { label: entry.title, href: entryPagePath(entry), note: entry.summary };
  }), ...(parent.links || [])];
  return links.map(item => `<a class="further-reading" href="${link(item.href)}"><span class="reading-mark" aria-hidden="true">❧</span><div><p class="eyebrow">Weiterführende Überlieferungen</p><h2>${h(item.label)}</h2><p>${h(item.note)}</p></div><span aria-hidden="true">↗</span></a>`).join('');
}

export function renderPantheon(catalog, parent, collection) {
  const outputPath = entryPagePath(parent);
  const link = pageLinkFrom(outputPath);
  const { chapters, entries } = collectionCatalog(catalog, collection);
  const main = `<div class="pantheon-collection" data-religion-catalog>
    <nav class="pantheon-breadcrumbs" aria-label="Brotkrumennavigation"><a href="${link('Religionen/index.html')}">Glaubenscodex</a><span aria-hidden="true">/</span><span aria-current="page">${h(parent.title)}</span></nav>
    <header class="pantheon-cover"><div><p class="eyebrow">${h(collection.subtitle)}</p><h1>${h(parent.title)}</h1><p class="pantheon-lead">${h(parent.summary)}</p><a class="ink-button" href="#verzeichnis">${h(collection.exploreLabel || 'Den Götterkreis erkunden')} <span aria-hidden="true">↓</span></a></div><figure><img src="${link(entrySymbolPath(parent))}" width="225" height="225" alt="Das Zeichen von ${h(parent.title)}"><figcaption>${h(collection.symbolCaption || collection.title)}</figcaption></figure></header>
    <div class="pantheon-counts" aria-label="Umfang des Registers">${chapters.map(chapter => `<a href="#${h(chapter.id)}" data-action="navigate-chapter" data-chapter-id="${h(chapter.id)}"><strong>${chapter.entries.length}</strong><span>${h(chapter.shortLabel || chapter.label)}</span></a>`).join('')}</div>
    <section class="pantheon-intro" aria-label="${h(collection.title)}">${renderLoreBlocks(parent.sections.flatMap(section => section.blocks || section.paragraphs.map(text => ({ type: 'paragraph', text }))))}</section>
    <div class="book-layout">${renderChapterRegister(chapters)}<div class="book-content">
      <section class="catalog-intro" id="verzeichnis" aria-labelledby="catalog-title"><p class="eyebrow">Namen, Wesen und Überlieferungen</p><h2 id="catalog-title">Die Mächte und ihre Wege</h2><p>Öffnet ein Götterblatt oder sucht nach einem Namen, Beinamen oder einer Domäne.</p></section>
      ${renderCatalogTools(chapters, { searchLabel: 'Gottheiten und Registereinträge durchsuchen', placeholder: 'Name, Beiname oder Domäne …' })}
      <noscript><p class="reading-note">Alle ausgearbeiteten Archivblätter sind direkt verlinkt. Weitere überlieferte Namen und Bildnisse stehen im Register.</p></noscript>
      <div id="catalog-chapters">${chapters.map(chapter => renderCatalogChapter(chapter, entries, link)).join('')}</div>
      ${renderCatalogEmpty()}
      ${renderCollectionDoctrine(catalog, collection)}${renderCollectionReading(catalog, parent, collection, link)}
    </div></div>
  </div>`;
  return renderShell({ outputPath, title: parent.title, description: parent.summary, main, catalog: true, theme: collection.theme, extraStyles: ['Religionen/modules/lore/lore.css', 'Religionen/modules/pantheon/pantheon.css'] });
}
