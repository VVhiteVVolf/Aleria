import { FJORDHEIM_REGISTRY_FOLDERS } from './fjordheim-territorial-plan.js';
import { VENNYR_REGISTRY_FOLDERS } from './vennyr-registry-folders.js';
import { DUNFAL_REGISTRY_FOLDERS } from './dunfal-territorial-catalog.js';
import { AISLEARNEACH_REGISTRY_FOLDERS } from './aislearneach-territorial-catalog.js';
import { BLAITHNEACH_REGISTRY_FOLDERS } from './blaithneach-territorial-catalog.js';
import { FAELAORN_REGISTRY_FOLDERS } from './faelaorn-registry-folders.js';
import { SKJAERHEIM_REGISTRY_FOLDERS } from './skjaerheim-territorial-plan.js';
import { withReviewedAlbicFolders } from '../modules/albic-territories/family-placements.js';
import { ACCEPTED_REALM_FOLDERS } from './accepted-realm-families.js';

// Beschreibungen und belegte Gebiete ohne Familienakte ergänzen den Familienkatalog.
export const FAMILY_REGISTRY_FOLDERS = withReviewedAlbicFolders([
  ...ACCEPTED_REALM_FOLDERS,
  ...VENNYR_REGISTRY_FOLDERS,
  ...FJORDHEIM_REGISTRY_FOLDERS,
  ...DUNFAL_REGISTRY_FOLDERS,
  ...AISLEARNEACH_REGISTRY_FOLDERS,
  ...BLAITHNEACH_REGISTRY_FOLDERS,
  ...FAELAORN_REGISTRY_FOLDERS,
  ...SKJAERHEIM_REGISTRY_FOLDERS
]);
