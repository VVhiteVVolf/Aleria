import { HOUSE_ARWYDD_FAMILY } from './data/house-arwydd-family.js';
import { RETIRED_FAMILY_IDS } from './data/families.registry.js';
import { createFirebaseAuthService } from './modules/firebase-platform/firebase-auth.js';
import { createFirebaseClient } from './modules/firebase-platform/firebase-client.js';
import { createFirebaseAssetRepository } from './modules/family-assets/firebase-asset-repository.js';
import { createAlmanachCharacterRepository } from './modules/almanach-bridge/almanach-character-repository.js';
import { createFamilyAssetUploadController } from './modules/family-assets/family-asset-upload-controller.js';
import { createFamilySyncController } from './modules/family-sync/family-sync-controller.js';
import { createFirestoreFamilyRepository } from './modules/family-sync/firestore-family-repository.js';
import { createLocalFamilyRepository } from './modules/family-sync/local-family-repository.js';
import { loadFamilyById } from './services/family-library.js';
import { loadPersistedFamily } from './services/family-persistence.js';
import { resolveWorkspaceAccess } from './services/workspace-access.js';
import { createFamilyStore } from './state/family-store.js';
import { createAppController } from './ui/app-controller.js';

const requestedQuery = new URLSearchParams(globalThis.location.search);
const requestedFamilyId = requestedQuery.get('family');
const requestedPersonId = requestedQuery.get('person');
const firebaseClient = createFirebaseClient();
const cloudRepository = createFirestoreFamilyRepository(firebaseClient);
const authService = createFirebaseAuthService(firebaseClient);
const localRepository = createLocalFamilyRepository(globalThis.localStorage);
const assetRepository = createFirebaseAssetRepository(firebaseClient);
const almanachCharacterRepository = createAlmanachCharacterRepository(firebaseClient);
let requestedFamily = requestedFamilyId ? loadFamilyById(requestedFamilyId) : null;
if (requestedFamilyId && !requestedFamily) {
  try {
    const published = await cloudRepository.loadPublished(requestedFamilyId);
    if (published) requestedFamily = { ...published, source: 'firebase' };
  } catch (error) {
    console.info('Die veröffentlichte Firebase-Fassung ist derzeit nicht erreichbar.', error);
  }
}
const persistedFamily = loadPersistedFamily();
const availablePersistedFamily = persistedFamily && !RETIRED_FAMILY_IDS.includes(persistedFamily.document.id)
  ? persistedFamily
  : null;
const loadedFamily = requestedFamily?.family || availablePersistedFamily || HOUSE_ARWYDD_FAMILY;
const initialFamily = requestedPersonId && loadedFamily.persons.some(person => person.id === requestedPersonId)
  ? { ...loadedFamily, view: { ...loadedFamily.view, focusPersonId: requestedPersonId } }
  : loadedFamily;
const workspaceAccess = resolveWorkspaceAccess(globalThis.location, globalThis.sessionStorage);
const store = createFamilyStore(initialFamily);
const controller = createAppController({
  store,
  almanachCharacterRepository,
  workspaceMode: workspaceAccess.mode,
  requestEditOnInit: workspaceAccess.shouldRequestPassword
});
const syncController = createFamilySyncController({
  store,
  localRepository,
  cloudRepository,
  authService,
  editing: workspaceAccess.mode === 'edit'
});
const assetUploadController = createFamilyAssetUploadController({
  store,
  assetRepository,
  editing: workspaceAccess.mode === 'edit'
});

controller.init();
void syncController.init();
assetUploadController.init();
globalThis.addEventListener('beforeunload', () => {
  assetUploadController.destroy();
  syncController.destroy();
  controller.destroy();
}, { once: true });
