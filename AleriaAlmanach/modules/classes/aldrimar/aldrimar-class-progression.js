import { getAldrimarClassDefinition } from './aldrimar-class-registry.js';
import { createCultureDraftProgression } from '../culture-draft-progression.js';
import { getHuskarlForms } from '../../combat-styles/huskarl/huskarl-forms.js';
import { getHuskarlBasicTechniques } from '../../combat-styles/huskarl/huskarl-basic-techniques.js';
import { getHuskarlExpertTechniques } from '../../combat-styles/huskarl/huskarl-expert-techniques.js';
import { getSkjaldrBerserkProgression, getSkjaldrBerserkTiers } from './skjaldr-berserk-progression.js';
import { SKALD_FREYA_REFERENCE } from './skald-freya-reference.js';

export function getAldrimarClassProgression(id, level = 1) {
  const definition = getAldrimarClassDefinition(id);
  if (!definition) return null;
  const plan = createCultureDraftProgression(definition, getHuskarlForms(),
    [...getHuskarlBasicTechniques(definition.classId), ...getHuskarlExpertTechniques(definition.classId)],
    { id: 'huskarl-waffenlehre', name: 'Huskarl-Waffenlehre', culture: 'Aldrimar · nordische Härte und strukturierte Technik' }, level);
  if (definition.classId === 'skjaldr') {
    plan.berserker = getSkjaldrBerserkProgression(plan.selectedLevel);
    plan.berserkerTiers = getSkjaldrBerserkTiers();
  }
  if (definition.classId === 'skalde') plan.skaldReference = structuredClone(SKALD_FREYA_REFERENCE);
  return plan;
}
