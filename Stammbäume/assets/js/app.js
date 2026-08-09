import { HOUSE_ARWYDD_FAMILY } from './data/house-arwydd-family.js';
import { RETIRED_FAMILY_IDS } from './data/families.registry.js';
import { createFirebaseClient } from './modules/firebase-platform/firebase-client.js';
import { createLocalImageDraftRepository } from './modules/family-assets/local-image-draft-repository.js';
import { createGitHubFamilyRepository } from './modules/github-publication/github-family-repository.js';
import { createAlmanachCharacterRepository } from './modules/almanach-bridge/almanach-character-repository.js';
import { createFamilyAssetUploadController } from './modules/family-assets/family-asset-upload-controller.js';
import { createFamilySyncController } from './modules/family-sync/family-sync-controller.js';
import { createLocalFamilyRepository } from './modules/family-sync/local-family-repository.js';
import { createLatestLocalFamilySource } from './modules/family-sync/latest-local-family-source.js';
import { resolveProjectFamilyOrigin } from './modules/family-sync/family-origin-resolver.js';
import { applyPublishedFamilyPriority } from './modules/family-sync/published-family-priority.js';
import { loadFamilyById } from './services/family-library.js';
import { loadPersistedFamily } from './services/family-persistence.js';
import {
  hasPendingTreeGeneratorLaunch,
  markPendingTreeGeneratorLaunch,
  resolveWorkspaceAccess,
  WORKSPACE_MODE
} from './services/workspace-access.js';
import { createFamilyStore } from './state/family-store.js';
import { createAppController } from './ui/app-controller.js';

const requestedQuery = new URLSearchParams(globalThis.location.search);
const requestedFamilyId = requestedQuery.get('family');
const requestedPersonId = requestedQuery.get('person');

// Die Landingpage-Kachel "＋ Neue Familie beginnen" verlinkt hierher mit
// ?action=start-tree-generator. Der Parameter wird sofort aus der Adresszeile
// entfernt (verhindert ein erneutes Auslösen beim späteren Aufruf derselben
// Adresse aus der Historie) und stattdessen als Ein-Schuss-Merker in
// sessionStorage abgelegt — er überlebt so den Seiten-Reload, den die
// Passwort-Freigabe für den Bearbeitungsmodus auslöst (siehe app-controller.js).
if (requestedQuery.get('action') === 'start-tree-generator') {
  markPendingTreeGeneratorLaunch(globalThis.sessionStorage);
  const cleanedUrl = new URL(globalThis.location.href);
  cleanedUrl.searchParams.delete('action');
  globalThis.history.replaceState({}, '', cleanedUrl.href);
}
const workspaceAccess = resolveWorkspaceAccess(globalThis.location, globalThis.sessionStorage);
const firebaseClient = createFirebaseClient();
const cloudRepository = createGitHubFamilyRepository();
const localRepository = createLocalFamilyRepository(globalThis.localStorage);
const latestLocalFamilySource = createLatestLocalFamilySource({
  draftRepository: localRepository,
  storage: globalThis.localStorage
});
const assetRepository = createLocalImageDraftRepository();
const almanachCharacterRepository = createAlmanachCharacterRepository(firebaseClient);
const registeredOrSavedFamily = requestedFamilyId ? loadFamilyById(requestedFamilyId) : null;
const localDraft = requestedFamilyId ? localRepository.loadDraft(requestedFamilyId) : null;
const localDraftRecord = localDraft ? { ...localDraft, source: 'local-draft' } : null;
const requestedFamily = workspaceAccess.mode === WORKSPACE_MODE.edit
  ? localDraftRecord || registeredOrSavedFamily
  : registeredOrSavedFamily || localDraftRecord;
const persistedFamily = loadPersistedFamily();
const availablePersistedFamily = persistedFamily && !RETIRED_FAMILY_IDS.includes(persistedFamily.document.id)
  ? persistedFamily
  : null;
const loadedFamily = requestedFamily?.family || availablePersistedFamily || HOUSE_ARWYDD_FAMILY;
const store = createFamilyStore(loadedFamily);
if (requestedPersonId && loadedFamily.persons.some(person => person.id === requestedPersonId)) {
  store.selectPerson(requestedPersonId);
}
const autoOpenTreeGenerator = workspaceAccess.mode === WORKSPACE_MODE.edit
  && hasPendingTreeGeneratorLaunch(globalThis.sessionStorage);
const controller = createAppController({
  store,
  almanachCharacterRepository,
  assetRepository,
  latestLocalFamilySource,
  workspaceMode: workspaceAccess.mode,
  requestEditOnInit: workspaceAccess.shouldRequestPassword,
  autoOpenTreeGenerator
});
const syncController = createFamilySyncController({
  store,
  localRepository,
  cloudRepository,
  editing: workspaceAccess.mode === 'edit',
  resolveOriginFamily: resolveProjectFamilyOrigin
});
const assetUploadController = createFamilyAssetUploadController({
  store,
  assetRepository,
  editing: workspaceAccess.mode === 'edit'
});

controller.init();
void syncController.init();
assetUploadController.init();
if (workspaceAccess.mode === WORKSPACE_MODE.view && requestedFamilyId) {
  void applyPublishedFamilyPriority({
    requestedFamilyId,
    initialFamilyId: loadedFamily.document.id,
    store,
    cloudRepository,
    onUnavailable(error) {
      console.info('Die veröffentlichte GitHub-Fassung ist derzeit nicht erreichbar.', error);
    }
  });
}
globalThis.addEventListener('beforeunload', () => {
  assetUploadController.destroy();
  syncController.destroy();
  controller.destroy();
}, { once: true });
