import { HOUSE_ARWYDD_FAMILY } from './data/house-arwydd-family.js';
import { RETIRED_FAMILY_IDS } from './data/families.registry.js';
import { loadFamilyById } from './services/family-library.js';
import { loadPersistedFamily } from './services/family-persistence.js';
import { resolveWorkspaceAccess } from './services/workspace-access.js';
import { createFamilyStore } from './state/family-store.js';
import { createAppController } from './ui/app-controller.js';

const requestedFamilyId = new URLSearchParams(globalThis.location.search).get('family');
const requestedFamily = requestedFamilyId ? loadFamilyById(requestedFamilyId) : null;
const persistedFamily = loadPersistedFamily();
const availablePersistedFamily = persistedFamily && !RETIRED_FAMILY_IDS.includes(persistedFamily.document.id)
  ? persistedFamily
  : null;
const initialFamily = requestedFamily?.family || availablePersistedFamily || HOUSE_ARWYDD_FAMILY;
const workspaceAccess = resolveWorkspaceAccess(globalThis.location, globalThis.sessionStorage);
const store = createFamilyStore(initialFamily);
const controller = createAppController({
  store,
  workspaceMode: workspaceAccess.mode,
  requestEditOnInit: workspaceAccess.shouldRequestPassword
});

controller.init();
globalThis.addEventListener('beforeunload', () => controller.destroy(), { once: true });
