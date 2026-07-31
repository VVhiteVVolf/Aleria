import { PORTRAIT_PLACEHOLDERS } from './config/portrait-placeholders.js';
import { createGitHubFamilyRepository } from './modules/github-publication/github-family-repository.js';
import {
  getHouseProfileSearchTerms,
  getHouseRank,
  getHouseRankIcon
} from './domain/house-profile.js';
import {
  buildRegistryFolderTree,
  countRegistryRecords,
  getRegistryRecordHouseProfile
} from './modules/family-registry/registry-folder-tree.js';
import { listFamilyRecords } from './services/family-library.js';
import { createFamilyViewLink, normalizeFamilyViewLink } from './services/family-links.js';
import { escapeHtml } from './ui/dom.js';

function recordRank(record) {
  return getHouseRank(getRegistryRecordHouseProfile(record)?.rankId);
}

function renderFamilyTile(record) {
  const emblem = record.emblem || record.family?.document.emblem || record.family?.houses[0]?.emblem || PORTRAIT_PLACEHOLDERS.crest;
  const people = Number(record.personCount ?? record.family?.persons.length ?? 0);
  const motto = record.motto || record.family?.document.motto || '';
  const flag = record.source === 'local' ? 'Lokal' : record.source === 'github' ? 'GitHub' : '';
  return `
    <a class="registry-tile" href="${escapeHtml(createFamilyViewLink(record.id))}"
      title="${escapeHtml(record.title)}${motto ? ` · ${escapeHtml(motto)}` : ''}">
      ${flag ? `<span class="registry-tile-flag">${flag}</span>` : ''}
      <img class="registry-tile-emblem" src="${escapeHtml(emblem)}" alt="Wappen von ${escapeHtml(record.title)}">
      <strong>${escapeHtml(record.title)}</strong>
      <small>${people ? `${people} Personen` : 'Leerakte'}</small>
    </a>
  `;
}

// Häuser stehen als kompakte Wappenkacheln nach Rang gruppiert – je nobler, desto weiter oben.
function renderRecordsGrid(records) {
  if (!records.length) return '';
  const sorted = [...records].sort((first, second) => (
    recordRank(first).order - recordRank(second).order
    || first.title.localeCompare(second.title, 'de')
  ));
  const sections = [];
  sorted.forEach(record => {
    const rank = recordRank(record);
    let section = sections.find(item => item.rankId === rank.id);
    if (!section) {
      section = { rankId: rank.id, label: rank.label, tiles: [] };
      sections.push(section);
    }
    section.tiles.push(renderFamilyTile(record));
  });
  return sections.map(section => {
    const icon = getHouseRankIcon(section.rankId);
    return `
    <section class="registry-rank-section registry-rank--${escapeHtml(section.rankId)}">
      <h4 class="registry-rank-heading">
        ${icon ? `<img class="registry-rank-icon" src="${escapeHtml(icon)}" alt="" aria-hidden="true">` : ''}
        <span>${escapeHtml(section.label)}</span>
      </h4>
      <div class="registry-tile-grid">${section.tiles.join('')}</div>
    </section>
  `;
  }).join('');
}

// Merkt sich pfadweise, ob ein Zweig manuell auf-/zugeklappt wurde (übersteht Suchfilter-Neuaufbauten).
const treeOpenOverrides = new Map();

function flattenFolderRows(node, depth, parentPath, rows) {
  [...node.folders.values()]
    .sort((first, second) => first.name.localeCompare(second.name, 'de'))
    .forEach(child => {
      const path = `${parentPath}/${child.name}`;
      const defaultOpen = false;
      const open = treeOpenOverrides.has(path) ? treeOpenOverrides.get(path) : defaultOpen;
      const hasChildren = child.folders.size > 0 || child.records.length > 0;
      rows.push({ type: 'folder', path, parentPath, depth, node: child, open, hasChildren });
      if (child.records.length) {
        rows.push({ type: 'records', path: `${path}#records`, parentPath: path, depth: depth + 1, records: [...child.records] });
      }
      flattenFolderRows(child, depth + 1, path, rows);
    });
}

// Eine Zeile ist sichtbar, wenn jeder Vorfahr im Pfad aufgeklappt ist.
function isRowVisible(row, rowsByPath) {
  let parentPath = row.parentPath;
  while (parentPath) {
    const parentRow = rowsByPath.get(parentPath);
    if (!parentRow) break;
    if (!parentRow.open) return false;
    parentPath = parentRow.parentPath;
  }
  return true;
}

function renderTreeTable(root) {
  const rows = [];
  flattenFolderRows(root, 0, '', rows);
  if (!rows.length) return '';
  const rowsByPath = new Map(rows.filter(row => row.type === 'folder').map(row => [row.path, row]));
  const body = rows.map(row => {
    if (!isRowVisible(row, rowsByPath)) return '';
    if (row.type === 'records') {
      const grid = renderRecordsGrid(row.records);
      if (!grid) return '';
      return `
        <tr class="registry-tree-row registry-tree-row--records">
          <td colspan="3" style="--registry-tree-depth: ${row.depth}">${grid}</td>
        </tr>
      `;
    }
    const { node, path, depth, open, hasChildren } = row;
    return `
      <tr class="registry-tree-row registry-tree-row--folder" data-path="${escapeHtml(path)}">
        <td class="registry-tree-toggle">
          ${hasChildren
            ? `<button type="button" class="registry-tree-toggle-btn" data-toggle-path="${escapeHtml(path)}" aria-expanded="${open}">${open ? '▾' : '▸'}</button>`
            : ''}
        </td>
        <td class="registry-tree-name" style="--registry-tree-depth: ${depth}">
          ${node.icon ? `<img class="registry-folder-icon" src="${escapeHtml(node.icon)}" alt="" aria-hidden="true">` : ''}
          <span>${escapeHtml(node.name)}</span>
        </td>
        <td class="registry-tree-count">${countRegistryRecords(node)}</td>
      </tr>
    `;
  }).join('');
  return `
    <table class="registry-tree-table">
      <thead>
        <tr><th></th><th>Name</th><th>Anzahl</th></tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

let allRecords = listFamilyRecords();
const treeContainer = document.getElementById('registry-tree');
const empty = document.getElementById('registry-empty');
const search = document.getElementById('registry-search');
document.getElementById('registry-count').textContent = String(allRecords.length);

function render(query = '') {
  const needle = query.trim().toLocaleLowerCase('de');
  const records = needle
    ? allRecords.filter(record => [
      record.title,
      record.id,
      ...(record.folderPath || []),
      ...getHouseProfileSearchTerms(getRegistryRecordHouseProfile(record))
    ]
      .some(value => String(value).toLocaleLowerCase('de').includes(needle)))
    : allRecords;
  treeContainer.innerHTML = renderTreeTable(buildRegistryFolderTree(records));
  empty.hidden = records.length > 0;
}

treeContainer.addEventListener('click', event => {
  const button = event.target.closest('.registry-tree-toggle-btn');
  if (!button) return;
  const path = button.dataset.togglePath;
  const currentlyOpen = button.getAttribute('aria-expanded') === 'true';
  treeOpenOverrides.set(path, !currentlyOpen);
  render(search.value);
});

search.addEventListener('input', () => render(search.value));
render();

async function loadPublishedRegistry() {
  try {
    const repository = createGitHubFamilyRepository();
    const published = await repository.listPublishedRegistry();
    const records = new Map(allRecords.map(record => [record.id, record]));
    published.forEach(record => {
      const id = String(record.familyId || record.id);
      const projectFallback = records.get(id);
      records.set(id, {
        ...projectFallback,
        ...record,
        id,
        title: String(record.title || id),
        folderPath: Array.isArray(record.folderPath) ? record.folderPath.map(String).filter(Boolean) : [],
        houseProfile: record.houseProfile || projectFallback?.houseProfile || projectFallback?.family?.document.houseProfile,
        family: projectFallback?.family,
        link: normalizeFamilyViewLink(record.link, id),
        source: 'github'
      });
    });
    allRecords = [...records.values()].sort((first, second) => first.title.localeCompare(second.title, 'de'));
    document.getElementById('registry-count').textContent = String(allRecords.length);
    render(search.value);
  } catch (error) {
    console.info('Das veröffentlichte GitHub-Register ist derzeit nicht erreichbar.', error);
  }
}

void loadPublishedRegistry();
