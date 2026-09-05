import { PORTRAIT_PLACEHOLDERS } from '../../config/portrait-placeholders.js';
import { getHouseRankIcon } from '../../domain/house-profile.js';
import { createFamilyViewLink } from '../../services/family-links.js';
import { escapeHtml as esc } from '../../ui/dom.js';
import { getRegistryRecordHouseProfile } from './registry-folder-tree.js';
import { groupRegistryFamilies, registryPathKey, searchRegistry } from './registry-browser-model.js';

const housesLabel = count => `${count} ${count === 1 ? 'Haus' : 'Häuser'}`;
const action = (name, key) => `data-action="${name}" data-path="${esc(key)}"`;
const icon = (source, className) => source
  ? `<img class="${className}" src="${esc(source)}" alt="" loading="lazy">`
  : `<span class="${className} registry-icon-placeholder" aria-hidden="true">◇</span>`;

function renderNavigationNode(node, selectedKey, expanded) {
  const current = node.key === selectedKey;
  const open = expanded.has(node.key);
  return `<li><div class="registry-nav-row${current ? ' is-selected' : ''}">
    ${node.children.length
      ? `<button type="button" class="registry-nav-toggle" ${action('toggle-region', node.key)} aria-expanded="${open}" aria-label="${esc(node.name)} ${open ? 'zuklappen' : 'aufklappen'}">${open ? '▾' : '▸'}</button>`
      : '<span class="registry-nav-spacer"></span>'}
    <button type="button" class="registry-nav-select" ${action('select-region', node.key)}${current ? ' aria-current="location"' : ''}>
      ${icon(node.icon, 'registry-folder-icon')}<span>${esc(node.name)}</span>
      <small aria-label="${housesLabel(node.totalCount)} einschließlich Unterorte">${node.totalCount}</small>
    </button></div>
    ${open && node.children.length ? `<ul>${node.children.map(child => renderNavigationNode(child, selectedKey, expanded)).join('')}</ul>` : ''}
  </li>`;
}

export function renderRegistryNavigation(index, selectedKey, expanded) {
  return `<button type="button" class="registry-nav-home" ${action('select-region', index.root.key)}${selectedKey === index.root.key ? ' aria-current="location"' : ''}>Alle Gebiete <small>${housesLabel(index.root.totalCount)}</small></button>
    <ul class="registry-nav-list">${index.root.children.map(node => renderNavigationNode(node, selectedKey, expanded)).join('')}</ul>`;
}

function renderBreadcrumbs(node) {
  return `<nav class="registry-breadcrumbs" aria-label="Gebietspfad"><ol>
    <li><button type="button" ${action('select-region', '[]')}${!node.path.length ? ' aria-current="location"' : ''}>Alle Gebiete</button></li>
    ${node.path.map((name, i) => `<li><span aria-hidden="true">›</span><button type="button" ${action('select-region', registryPathKey(node.path.slice(0, i + 1)))}${i === node.path.length - 1 ? ' aria-current="location"' : ''}>${esc(name)}</button></li>`).join('')}
  </ol></nav>`;
}

function renderFolderCards(nodes, showPath = false) {
  return `<div class="registry-region-grid">${nodes.map(node => `<button type="button" class="registry-region-card" ${action('select-region', node.key)}>
    ${icon(node.icon, 'registry-region-emblem')}
    <span><strong>${esc(node.name)}</strong><small>${housesLabel(node.totalCount)}${node.children.length ? ' · mit Unterorten' : ''}</small>
    ${showPath ? `<small class="registry-result-path">${esc(node.path.join(' › '))}</small>` : ''}</span>
    <span aria-hidden="true">›</span>
  </button>`).join('')}</div>`;
}

function renderFamilyCard(entry, showPaths) {
  const { record } = entry;
  const profile = getRegistryRecordHouseProfile(record);
  const emblem = record.emblem || record.family?.document?.emblem || record.family?.houses?.[0]?.emblem || PORTRAIT_PLACEHOLDERS.crest;
  const people = Number(record.personCount ?? record.family?.persons?.length ?? 0);
  const lieges = profile.liegeHouses?.map(house => house.name).filter(Boolean) || [];
  if (!lieges.length && profile.liegeHouseName) lieges.push(profile.liegeHouseName);
  return `<article class="registry-house-card">
    <a class="registry-house-link" href="${esc(createFamilyViewLink(record.id))}">
      ${icon(emblem, 'registry-house-emblem')}<span><strong>${esc(record.title)}</strong><small>${people ? `${people} Personen` : 'Noch keine Personen'}</small></span>
      <span class="registry-house-arrow" aria-hidden="true">↗</span>
    </a>
    <dl class="registry-house-details">
      ${profile.seat ? `<div><dt>Sitz</dt><dd>${esc(profile.seat)}</dd></div>` : ''}
      ${lieges.length ? `<div><dt>Untersteht</dt><dd>${esc(lieges.join(' · '))}</dd></div>` : ''}
    </dl>
    ${showPaths ? `<div class="registry-house-paths">${entry.placements.map(({ node }) => `<button type="button" ${action('select-region', node.key)} title="Gebiet öffnen">${esc(node.path.join(' › '))}</button>`).join('')}</div>` : ''}
  </article>`;
}

function renderHouseGroups(entries, showPaths = false) {
  return groupRegistryFamilies(entries).map(({ rank, entries: grouped }) => `<section class="registry-rank-section">
    <h4 class="registry-rank-heading">${icon(getHouseRankIcon(rank.id), 'registry-rank-icon')}<span>${esc(rank.label)}</span><small>${grouped.length}</small></h4>
    <div class="registry-house-grid">${grouped.map(entry => renderFamilyCard(entry, showPaths)).join('')}</div>
  </section>`).join('');
}

export function renderRegistryContent(index, selected, query) {
  if (query.trim()) {
    const results = searchRegistry(index, query);
    const status = `${housesLabel(results.families.length)} und ${results.folders.length} Gebiete gefunden`;
    return { status, html: `<div class="registry-panel-heading"><p class="eyebrow">Im gesamten Register</p><h2 id="registry-location-title" tabindex="-1">Suche nach „${esc(query.trim())}“</h2><p>${status}</p>
      <button type="button" class="registry-text-button" data-action="clear-search">Suche schließen · zurück zu ${esc(selected.name)}</button></div>
      ${results.folders.length ? `<section class="registry-section"><h3>Passende Gebiete</h3>${renderFolderCards(results.folders, true)}</section>` : ''}
      ${results.families.length ? `<section class="registry-section"><h3>Gefundene Häuser</h3>${renderHouseGroups(results.families, true)}</section>` : ''}
      ${!results.folders.length && !results.families.length ? '<p class="registry-empty">Keine passenden Häuser oder Gebiete. Versuche einen kürzeren Namen oder einen anderen Ort.</p>' : ''}` };
  }
  const status = selected.path.length
    ? `${housesLabel(selected.totalCount)} im Gebiet · ${selected.directCount} direkt hier · ${selected.totalCount - selected.directCount} weitere in Unterorten`
    : `${housesLabel(index.root.totalCount)} in ${index.root.children.length} Gebieten`;
  return { status, html: `${renderBreadcrumbs(selected)}
    <div class="registry-panel-heading"><p class="eyebrow">${selected.path.length ? 'Gebietsübersicht' : 'Genealogische Archive'}</p><h2 id="registry-location-title" tabindex="-1">${esc(selected.name)}</h2><p>${status}</p></div>
    ${selected.children.length ? `<section class="registry-section"><h3>${selected.path.length ? 'Untergebiete & Orte' : 'Länder & Regionen'}</h3>${renderFolderCards(selected.children)}</section>` : ''}
    ${selected.records.length ? `<section class="registry-section"><h3>Häuser in ${esc(selected.name)}</h3>${renderHouseGroups(selected.records.map(record => ({ record, placements: [{ record, node: selected }] })))}</section>` : ''}
    ${!selected.totalCount ? '<p class="registry-empty">Noch keine Häuser eingetragen.</p>' : ''}` };
}
