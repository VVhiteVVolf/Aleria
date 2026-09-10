import { escapeHtml as h } from '../content/content-html.mjs';
import { entryPagePath, entrySymbolPath, entrySearchText } from '../content/content-repository.mjs';

function renderCard(entry, index, link) {
  const tag = entry.recordOnly ? 'div' : 'a';
  const symbol = !entry.symbol ? '' : `<div class="faith-symbol"><img src="${link(entrySymbolPath(entry))}" alt="" width="150" height="150" loading="lazy" decoding="async"><span aria-hidden="true" class="symbol-ornament">✧</span></div>`;
  return `<article class="faith-card${entry.recordOnly ? (entry.symbol ? ' register-record' : ' saint-card') : ''}" id="entry-${h(entry.id)}" data-entry-id="${h(entry.id)}" data-title="${h(entry.title)}" data-search="${h(entrySearchText(entry))}" data-order="${index}">
    <${tag} class="faith-card-link"${entry.recordOnly ? '' : ` href="${link(entryPagePath(entry))}"`}>
      ${symbol}<div class="faith-card-copy"><p class="eyebrow">${h(entry.kind)}</p><h3>${h(entry.title)}</h3>${entry.epithet ? `<p class="faith-epithet">${h(entry.epithet)}</p>` : ''}<p class="faith-summary">${h(entry.summary)}</p>${entry.recordOnly && entry.portrait ? `<a class="faith-card-action" href="${link(`Religionen/${entry.portrait.src}`)}" data-religion-image-link target="_blank" rel="noopener">Bildnis ansehen <span aria-hidden="true">↗</span></a>` : `<span class="faith-card-action">${entry.recordOnly ? 'Lebensbeschreibung folgt' : `${entry.page ? 'Archivblatt öffnen' : 'Zur Sphärenkunde'} <span aria-hidden="true">↗</span>`}</span>`}</div>
    </${tag}>
  </article>`;
}

export function renderCatalogChapter(chapter, entries, link) {
  const members = entries.filter(entry => entry.chapterId === chapter.id);
  return `<section class="faith-chapter${members.length ? '' : ' unwritten-chapter'}" id="${h(chapter.id)}" data-chapter="${h(chapter.id)}" aria-labelledby="title-${h(chapter.id)}">
    <header class="chapter-heading"><span class="chapter-number" aria-hidden="true">${h(chapter.number)}</span><div><p class="eyebrow">${h(chapter.label)}</p><h2 id="title-${h(chapter.id)}">${h(chapter.title)}</h2><p>${h(chapter.intro)}</p></div><span class="chapter-count" data-role="chapter-count">${members.length ? String(members.length).padStart(2, '0') : '—'}</span></header>
    ${members.length ? `<div class="faith-grid${chapter.id === 'pantheons' ? ' pantheon-grid' : ''}" data-role="entry-grid">${members.map((entry, index) => renderCard(entry, index, link)).join('')}</div>` : `<div class="unwritten-note"><span aria-hidden="true">❧</span><p>${h(chapter.empty)}</p></div>`}
  </section>`;
}

export function renderCatalogTools(chapters, { searchLabel = 'Religionen und Gottheiten durchsuchen', placeholder = 'Religion, Gottheit oder Begriff suchen …' } = {}) {
  return `<div class="catalog-tools" data-role="catalog-tools" hidden>
    <div class="search-row"><label class="catalog-search"><span aria-hidden="true">⌕</span><span class="sr-only">${h(searchLabel)}</span><input type="search" data-role="search" placeholder="${h(placeholder)}" autocomplete="off" maxlength="200" aria-controls="catalog-chapters"></label><label class="sort-label"><span class="sr-only">Einträge sortieren</span><select data-role="sort" aria-controls="catalog-chapters"><option value="register">Reihenfolge im Codex</option><option value="az">Name: A–Z</option><option value="za">Name: Z–A</option></select></label></div>
    <div class="filter-row"><label><span class="eyebrow">Kapitel</span><select data-role="chapter-filter" aria-controls="catalog-chapters"><option value="all">Alle Kapitel</option>${chapters.map(chapter => `<option value="${h(chapter.id)}">${h(chapter.label)}</option>`).join('')}</select></label><p data-role="result-count" role="status" aria-live="polite" aria-atomic="true"></p><button class="text-button" type="button" data-action="reset-catalog" hidden>Zurücksetzen ↺</button></div>
  </div>`;
}

export function renderCatalogEmpty() {
  return '<div class="catalog-empty" data-role="empty" hidden><span aria-hidden="true">✧</span><h2>Diese Spur verliert sich im Archiv.</h2><p>Zu dieser Suche wurde kein Eintrag gefunden. Versucht einen anderen Namen oder öffnet wieder alle Kapitel.</p><button class="ink-button" type="button" data-action="reset-catalog">Alle Einträge anzeigen</button></div>';
}

export function rootCatalogEntries(catalog) {
  return catalog.entries.filter(entry => !entry.collectionId).map(entry => {
    const collection = catalog.collections?.find(item => item.parentId === entry.id);
    if (!collection) return entry;
    const children = catalog.entries.filter(item => item.collectionId === collection.id);
    const records = (catalog.records || []).filter(item => item.collectionId === collection.id);
    return { ...entry, searchAliases: [...children.map(entrySearchText), ...records.map(entrySearchText), ...(collection.saints?.entries || []).map(saint => `${saint.name} ${saint.epithet || ''}`)] };
  });
}
