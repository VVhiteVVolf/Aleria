import { SAMPLE_FAMILY } from './data/sample-family.js';
import { loadFamilyById } from './services/family-library.js';
import { loadPersistedFamily } from './services/family-persistence.js';
import { resolveWorkspaceAccess } from './services/workspace-access.js';
import { createFamilyStore } from './state/family-store.js';
import { createAppController } from './ui/app-controller.js';

const requestedFamilyId = new URLSearchParams(globalThis.location.search).get('family');
const requestedFamily = requestedFamilyId ? loadFamilyById(requestedFamilyId) : null;
const initialFamily = requestedFamily?.family || loadPersistedFamily() || SAMPLE_FAMILY;
const workspaceAccess = resolveWorkspaceAccess(globalThis.location, globalThis.sessionStorage);
const store = createFamilyStore(initialFamily);
const controller = createAppController({
  store,
  workspaceMode: workspaceAccess.mode,
  requestEditOnInit: workspaceAccess.shouldRequestPassword
});

controller.init();
globalThis.addEventListener('beforeunload', () => controller.destroy(), { once: true });
