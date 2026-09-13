import { getMorgornClassDefinition } from './morgorn-class-registry.js?v=20260913-morgorn-names-v1';
import { createStructureOnlyProgression } from '../structure-only-class.js';

// Read-only structural projection. Morgorn has no authored combat grants yet.
export function getMorgornClassProgression(id, level = 1) {
  return createStructureOnlyProgression(getMorgornClassDefinition(id), level);
}
