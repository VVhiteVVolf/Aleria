import { FJORDHEIM_REGISTRY_FOLDERS } from './fjordheim-territorial-plan.js';
import { DUNFAL_REGISTRY_FOLDERS } from './dunfal-territorial-catalog.js';

// Beschreibungen und belegte Gebiete ohne Familienakte ergänzen den Familienkatalog.
export const FAMILY_REGISTRY_FOLDERS = Object.freeze([
  ...FJORDHEIM_REGISTRY_FOLDERS,
  ...DUNFAL_REGISTRY_FOLDERS
]);
