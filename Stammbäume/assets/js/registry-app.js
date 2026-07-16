import { PORTRAIT_PLACEHOLDERS } from './config/portrait-placeholders.js';
import { createFirebaseClient } from './modules/firebase-platform/firebase-client.js';
import { createFirestoreFamilyRepository } from './modules/family-sync/firestore-family-repository.js';
import {
  formatHouseProfile,
  getHouseProfileSearchTerms
} from './domain/house-profile.js';
import {
  buildRegistryFolderTree,
  countRegistryRecords,
  getRegistryRecordHouseProfile
} from './modules/family-registry/registry-folder-tree.js';
import { listFamilyRecords } from './services/family-library.js';
import { createFamilyViewLink, normalizeFamilyViewLink } from './services/family-links.js';
import { escapeHtml } from './ui/dom.js';

function renderFamilyCard(record) {
  const emblem = record.emblem || record.family?.document.emblem || record.family?.houses[0]?.emblem || PORTRAIT_PLACEHOLDERS.crest;
  const people = Number(record.personCount ?? record.family?.persons.length ?? 0);
  const description = record.motto || record.family?.document.motto || record.family?.document.description || 'Familienakte öffnen';
  const houseProfile = formatHouseProfile(getRegistryRecordHouseProfile(record));
  return `
    <a class="registry-family-card" href="${escapeHtml(createFamilyViewLink(record.id))}">
      <img class="registry-family-emblem" src="${escapeHtml(emblem)}" alt="Wappen von ${escapeHtml(record.title)}">
      <div>
        <h3>${escapeHtml(record.title)}</h3>
        <p>${escapeHtml(description)}</p>
        ${houseProfile ? `<p class="registry-family-profile">${escapeHtml(houseProfile)}</p>` : ''}
      </div>
      <span class="registry-family-meta">
        <span>${people} Personen</span>
        <span class="${record.source === 'local' ? 'registry-source-local' : ''}">${record.source === 'local' ? 'Lokal gespeichert' : record.source === 'firebase' ? 'Veröffentlicht' : 'Projekt-Registry'}</span>
      </span>
    </a>
  `;
}

function renderFolder(node, depth = 0) {
  const folders = [...node.folders.values()]
    .sort((first, second) => first.name.localeCompare(second.name, 'de'))
    .map(child => renderFolder(child, depth + 1))
    .join('');
  const records = [...node.records]
    .sort((first, second) => first.title.localeCompare(second.title, 'de'))
    .map(renderFamilyCard)
    .join('');
  if (!node.name) return `${folders}${records}`;
  return `
    <details class="registry-folder" ${depth <= 2 ? 'open' : ''}>
      <summary>
        ${node.icon ? `<img class="registry-folder-icon" src="${escapeHtml(node.icon)}" alt="" aria-hidden="true">` : ''}
        <span>${escapeHtml(node.name)}</span>
        <span class="registry-folder-count">${countRegistryRecords(node)}</span>
      </summary>
      <div class="registry-folder-children">${folders}${records}</div>
    </details>
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
  treeContainer.innerHTML = renderFolder(buildRegistryFolderTree(records));
  empty.hidden = records.length > 0;
}

search.addEventListener('input', () => render(search.value));
render();

async function loadPublishedRegistry() {
  try {
    const repository = createFirestoreFamilyRepository(createFirebaseClient());
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
        source: 'firebase'
      });
    });
    allRecords = [...records.values()].sort((first, second) => first.title.localeCompare(second.title, 'de'));
    document.getElementById('registry-count').textContent = String(allRecords.length);
    render(search.value);
  } catch (error) {
    console.info('Das veröffentlichte Firebase-Register ist derzeit nicht erreichbar.', error);
  }
}

void loadPublishedRegistry();
