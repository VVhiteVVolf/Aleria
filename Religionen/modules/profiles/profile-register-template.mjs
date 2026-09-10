import { escapeHtml as h } from '../content/content-html.mjs';
import { entryPagePath } from '../content/content-repository.mjs';

export function renderProfileNavigation(catalog, entry, { collection, chapter, siblings }, link) {
  const parent = collection && catalog.entries.find(item => item.id === collection.parentId);
  const registerPath = parent ? entryPagePath(parent) : 'Religionen/index.html';
  const registerTitle = parent ? parent.title : 'Glaubenscodex';
  const sidebar = `<aside class="chapter-register profile-register" aria-label="Archivnavigation"><div class="register-sticky">
    <a class="register-heading" href="${link(registerPath)}"><span aria-hidden="true">←</span> ${h(registerTitle)}</a>
    <p class="eyebrow">${h(chapter.label)}</p><nav aria-label="Weitere Archivblätter">${siblings.map(item => `<a href="${link(entryPagePath(item))}"${item.id === entry.id ? ' aria-current="page"' : ''}>${h(item.title)}</a>`).join('')}</nav>
    ${collection ? `<nav class="profile-group-links" aria-label="Weitere Gruppen dieser Sammlung">${collection.groups.filter(group => group.id !== chapter.id).map(group => `<a href="${link(registerPath)}#${h(group.id)}">${h(group.label)} ↗</a>`).join('')}${collection.saints?.entries.length ? `<a href="${link(registerPath)}#heilige">Die Heiligen ↗</a>` : ''}</nav>` : ''}
    <a class="back-to-top" href="#anfang">Zum Seitenanfang ↑</a></div></aside>`;
  const breadcrumbs = `<nav class="breadcrumbs" aria-label="Brotkrumennavigation"><a href="${link('Religionen/index.html')}">Religionen</a><span aria-hidden="true">/</span>${parent ? `<a href="${link(registerPath)}">${h(parent.title)}</a><span aria-hidden="true">/</span>` : ''}<a href="${link(registerPath)}#${h(chapter.id)}">${h(chapter.shortLabel || chapter.label)}</a><span aria-hidden="true">/</span><span aria-current="page">${h(entry.title)}</span></nav>`;
  return { sidebar, breadcrumbs };
}

export function renderProfileFacts(entry, chapter) {
  const facts = [{ label: 'Name', value: entry.title }, { label: 'Einordnung', value: entry.kind },
    ...(entry.facts || [{ label: 'Kapitel', value: chapter.label }])];
  return `<aside class="profile-facts" aria-label="Kurz verzeichnet"><p class="eyebrow">Kurz verzeichnet</p><dl>${facts.map(fact => `<dt>${h(fact.label)}</dt><dd>${h(fact.value)}</dd>`).join('')}</dl><span aria-hidden="true">✧</span><p>Jeder Name ist ein Anfang. Die Überlieferung gibt ihm Tiefe.</p></aside>`;
}
