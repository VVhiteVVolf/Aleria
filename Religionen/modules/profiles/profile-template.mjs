import { escapeHtml as h, pageLinkFrom } from '../content/content-html.mjs';
import { entryPagePath, entrySymbolPath, relatedEntries } from '../content/content-repository.mjs';
import { profileContext } from '../content/collection-repository.mjs';
import { renderLoreSections, renderDivineNames } from '../lore/lore-template.mjs';
import { renderProfileNavigation, renderProfileFacts } from './profile-register-template.mjs';
import { renderProfileArt } from './profile-art-template.mjs';
import { renderShell } from '../book-shell/book-shell-template.mjs';
import { renderArtifacts } from './profile-artifacts-template.mjs';
import { renderTraditionRegister, renderTraditionHierarchy } from '../traditions/tradition-template.mjs';

function renderConnections(catalog, entry, link) {
  const related = relatedEntries(catalog, entry);
  if (!related.length) return '';
  return `<section class="profile-section" id="verbindungen"><p class="eyebrow">Im selben Glaubensgeflecht</p><h2>Götterkreise & Verbindungen</h2><div class="connection-list">${related.map(item => `<a href="${link(entryPagePath(item))}"><img src="${link(entrySymbolPath(item))}" alt="" width="70" height="70" loading="lazy"><span><small>${h(item.kind)}</small><strong>${h(item.title)}</strong></span><span aria-hidden="true">↗</span></a>`).join('')}</div></section>`;
}

function renderFurtherReading(entry, link) {
  if (!entry.links?.length) return '';
  return `<section class="profile-section" id="weiterlesen"><p class="eyebrow">Weiterführende Überlieferungen</p><h2>Aus den anderen Sammlungen</h2><div class="related-reading">${entry.links.map(item => `<a href="${link(item.href)}"><span><strong>${h(item.label)}</strong><small>${h(item.note)}</small></span><span aria-hidden="true">↗</span></a>`).join('')}</div></section>`;
}

export function renderProfile(catalog, entry) {
  const outputPath = entryPagePath(entry);
  const link = pageLinkFrom(outputPath);
  const { collection, chapter, siblings } = profileContext(catalog, entry);
  const index = siblings.findIndex(item => item.id === entry.id);
  const related = relatedEntries(catalog, entry);
  const contents = [...(entry.tradition ? [{id:'goetterkreis',title:'Götterkreis'}] : []), ...entry.sections.map(section => ({ id: section.id, title: section.title })),
    ...(entry.tradition?.hierarchy ? [{id:'geistlichkeit',title:entry.tradition.hierarchy.title}] : []),
    ...(entry.artifacts ? [{ id: 'artefakte', title: 'Artefakte' }] : []),
    ...(entry.names?.length ? [{ id: 'namen', title: 'Namen & Beinamen' }] : []),
    ...(related.length ? [{ id: 'verbindungen', title: 'Verbindungen' }] : []),
    ...(entry.links?.length ? [{ id: 'weiterlesen', title: 'Weiterlesen' }] : []),
    ...(entry.pending ? [{ id: 'ueberlieferung', title: 'Kommende Überlieferungen' }] : [])];
  const { sidebar, breadcrumbs } = renderProfileNavigation(catalog, entry, { collection, chapter, siblings }, link);
  const main = `${breadcrumbs}
    <header class="profile-cover${entry.portrait ? ' has-portrait' : ''}"><div><p class="eyebrow">${h(chapter.number)} · ${h(entry.kind)} <span aria-hidden="true">/</span> Archivblatt ${String(index + 1).padStart(2, '0')}</p><h1>${h(entry.title)}</h1>${entry.epithet ? `<p class="profile-epithet">${h(entry.epithet)}</p>` : ''}<p>${h(entry.summary)}</p><ul class="profile-tags" aria-label="Themen">${entry.tags.map(tag => `<li>${h(tag)}</li>`).join('')}</ul></div>${renderProfileArt(entry, link)}</header>
    <nav class="profile-contents" aria-label="Auf diesem Archivblatt">${contents.map(item => `<a href="#${item.id}">${h(item.title)}</a>`).join('')}</nav>
    ${renderTraditionRegister(catalog,entry,link)}
    <div class="profile-body"><article class="profile-prose" aria-label="Überlieferung">${renderLoreSections(entry, catalog.sharedLore)}${renderTraditionHierarchy(entry.tradition)}${renderArtifacts(entry.artifacts, link)}${renderDivineNames(entry.names)}${renderConnections(catalog, entry, link)}${renderFurtherReading(entry, link)}${entry.pending ? `<section class="pending-lore" id="ueberlieferung"><span aria-hidden="true">❧</span><div><h2>Ein Archivblatt im Werden</h2><p>${h(entry.pending)}</p></div></section>` : ''}</article>
    ${renderProfileFacts(entry, chapter)}</div>
    <nav class="profile-pagination" aria-label="Archivblätter durchblättern">${index > 0 ? `<a rel="prev" href="${link(entryPagePath(siblings[index - 1]))}"><small>← Vorheriges Archivblatt</small>${h(siblings[index - 1].title)}</a>` : '<span></span>'}${index < siblings.length - 1 ? `<a rel="next" href="${link(entryPagePath(siblings[index + 1]))}"><small>Nächstes Archivblatt →</small>${h(siblings[index + 1].title)}</a>` : '<span></span>'}</nav>`;
  return renderShell({ outputPath, title: entry.title, description: entry.summary, main, sidebar, theme: collection?.theme, searchable: Boolean(entry.tradition), extraStyles: ['Religionen/modules/lore/lore.css', ...(entry.tradition ? ['Religionen/modules/traditions/tradition.css'] : []), ...(entry.artifacts ? ['Religionen/modules/profiles/profile-artifacts.css'] : [])] });
}
