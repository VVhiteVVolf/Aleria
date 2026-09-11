import { createStructureOnlyProgression } from '../structure-only-class.js';
import { getVenalysClassDefinition } from './venalys-class-registry.js?v=20260911-venalys-v1';

// Read-only structural projection. Venalys has no authored combat grants yet.
export function getVenalysClassProgression(id, level = 1) {
  return createStructureOnlyProgression(getVenalysClassDefinition(id), level);
}
