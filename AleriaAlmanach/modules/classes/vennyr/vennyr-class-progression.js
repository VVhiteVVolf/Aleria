import { getVennyrClassDefinition } from './vennyr-class-registry.js';
import { getSirenentanzForms } from '../../combat-styles/sirenentanz/sirenentanz-forms.js';
import { getSirenentanzBasicTechniques } from '../../combat-styles/sirenentanz/sirenentanz-basic-techniques.js';
import { getSirenentanzExpertTechniques } from '../../combat-styles/sirenentanz/sirenentanz-expert-techniques.js';
import { createCultureDraftProgression } from '../culture-draft-progression.js';

// Read-only projection for pages, archive entries and future character training.
// Drafts intentionally have no grants and cannot mutate an existing profile.
export function getVennyrClassProgression(id, level = 1) {
  const definition = getVennyrClassDefinition(id);
  if (!definition) return null;
  const attackCatalog = [...getSirenentanzBasicTechniques(definition.classId), ...getSirenentanzExpertTechniques(definition.classId)];
  return createCultureDraftProgression(definition, getSirenentanzForms(), attackCatalog,
    { id: 'sirenentanz', name: 'Sirenentanz', culture: 'Vennyr · avallornische Wurzeln' }, level);
}
