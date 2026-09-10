import { escapeHtml as h } from '../content/content-html.mjs';
import { entryPagePath } from '../content/content-repository.mjs';
import { renderLoreBlocks } from '../lore/lore-template.mjs';
import { renderCatalogTools, renderCatalogEmpty } from '../catalog/catalog-register-template.mjs';

function connectionTarget(catalog, entry) {
  if (!entry.recordOnly) return entryPagePath(entry);
  const collection = catalog.collections.find(collection=>collection.id===entry.collectionId);
  return `${entryPagePath(catalog.entries.find(parent=>parent.id===collection.parentId))}#entry-${entry.id}`;
}

function renderFigure(catalog, member, index, entries, link) {
  const related = member.relatedIds.map(id=>entries.get(id));
  const searchText = [member.name,member.epithet,...related.map(entry=>`${entry.title} ${entry.epithet || ''}`)].join(' ');
  return `<article class="tradition-card" id="gestalt-${h(member.id)}" data-entry-id="${h(member.id)}" data-title="${h(member.name)}" data-search="${h(searchText)}" data-order="${index}">
    <a class="tradition-image" href="${link(`Religionen/${member.image.src}`)}" data-religion-image-link target="_blank" rel="noopener" aria-label="${h(member.name)}: vollständiges Bild öffnen"><img src="${link(`Religionen/${member.image.src}`)}" alt="${h(member.image.alt)}" width="${member.image.width}" height="${member.image.height}" loading="lazy" decoding="async"></a>
    <div class="tradition-card-copy"><h4>${h(member.name)}</h4>${member.epithet ? `<p>${h(member.epithet)}</p>` : ''}${related.length ? `<div class="tradition-comparisons"><span>Vergleich im Codex</span>${related.map(entry=>`<a href="${link(connectionTarget(catalog,entry))}">${h(entry.title)}</a>`).join('')}</div>` : ''}</div>
  </article>`;
}

export function renderTraditionRegister(catalog, entry, link) {
  const tradition = entry.tradition;
  if (!tradition) return '';
  const entries = new Map([...catalog.entries,...catalog.records].map(entry=>[entry.id,entry]));
  const chapters = tradition.groups.map(group=>({id:`glaube-${group.id}`,label:group.title}));
  return `<section class="tradition-register" id="goetterkreis" aria-labelledby="goetterkreis-title" data-religion-catalog>
    <header class="tradition-heading"><p class="eyebrow">Gestalten dieser Überlieferung</p><h2 id="goetterkreis-title">${h(tradition.title)}</h2><p>${h(tradition.intro)}</p></header>
    ${tradition.quotation ? `<blockquote class="tradition-quotation"><p>${h(tradition.quotation.text)}</p><cite>${h(tradition.quotation.attribution)}</cite></blockquote>` : ''}
    <nav class="tradition-groups" aria-label="Gruppen des Glaubensregisters">${tradition.groups.map((group,index)=>`<a href="#${chapters[index].id}" data-action="navigate-chapter" data-chapter-id="${chapters[index].id}">${h(group.title)} <span>${group.entries.length}</span></a>`).join('')}</nav>
    ${renderCatalogTools(chapters,{searchLabel:'Gestalten dieser Religion durchsuchen',placeholder:'Name, Aspekt oder Entsprechung …'})}
    <div id="catalog-chapters">${tradition.groups.map((group,index)=>`<section class="tradition-group" id="${chapters[index].id}" data-chapter="${chapters[index].id}" aria-labelledby="title-${chapters[index].id}"><header><h3 id="title-${chapters[index].id}">${h(group.title)}</h3><span data-role="chapter-count">${String(group.entries.length).padStart(2,'0')}</span></header><div class="tradition-grid" data-role="entry-grid">${group.entries.map((member,index)=>renderFigure(catalog,member,index,entries,link)).join('')}</div></section>`).join('')}</div>
    ${renderCatalogEmpty()}
    ${(tradition.notes || []).length ? `<aside class="tradition-notes" aria-label="Zur Überlieferung">${tradition.notes.map(note=>`<p>${h(note)}</p>`).join('')}</aside>` : ''}
  </section>`;
}

export function renderTraditionHierarchy(tradition) {
  const hierarchy = tradition?.hierarchy;
  if (!hierarchy) return '';
  return `<section class="profile-section tradition-hierarchy" id="geistlichkeit"><p class="eyebrow">Ämter, Dienste und Berufungen</p><h2>${h(hierarchy.title)}</h2><p>Die überlieferte Reihenfolge und die Aufgaben dieser Glaubensgemeinschaft. Öffnet einen Rang, um seine Beschreibung zu lesen.</p><div class="tradition-ranks">${hierarchy.entries.map((rank,index)=>`<details class="tradition-rank" id="rang-${h(rank.id)}"${index===0?' open':''}><summary><span class="tradition-rank-number">${String(index+1).padStart(2,'0')}</span><span>${h(rank.title)}</span></summary><div class="tradition-rank-body">${rank.blocks.length?renderLoreBlocks(rank.blocks):'<p class="tradition-rank-pending">Der Rang ist namentlich überliefert; eine eigene Beschreibung liegt noch nicht vor.</p>'}${rank.military?.length ? `<aside class="tradition-military"><p class="eyebrow">Militärischer Zweig</p>${renderLoreBlocks(rank.military)}</aside>` : ''}</div></details>`).join('')}</div></section>`;
}
