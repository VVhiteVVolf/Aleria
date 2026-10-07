import { createGitHubFamilyRepository } from './modules/github-publication/github-family-repository.js';
import { mergePublishedRegistryRecords } from './modules/family-registry/published-registry-merge.js';
import { createRegistryBrowser } from './modules/family-registry/registry-browser-controller.js';
import { listFamilyRecords } from './services/family-library.js';
import { FAMILY_REGISTRY_FOLDERS } from './data/family-registry-folders.js';

const records = listFamilyRecords();
const browser = createRegistryBrowser({
  root: document.querySelector('.registry-shell'), records, folderDefinitions: FAMILY_REGISTRY_FOLDERS
});

async function loadPublishedRegistry() {
  try {
    const repository = createGitHubFamilyRepository();
    const published = await repository.listPublishedRegistry();
    browser.updateRecords(mergePublishedRegistryRecords(records, published));
  } catch (error) {
    console.info('Das veroeffentlichte Register ist derzeit nicht erreichbar.', error);
  }
}

void loadPublishedRegistry();
