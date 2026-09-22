import { getVennyrClassDefinition } from './vennyr-class-registry.js?v=20260909-dragon-parent-v2';
import { getSirenentanzForms } from '../../combat-styles/sirenentanz/sirenentanz-forms.js?v=20260909-dragon-parent-v2';
import { getSirenentanzBasicTechniques } from '../../combat-styles/sirenentanz/sirenentanz-basic-techniques.js?v=20260909-dragon-parent-v2';
import { getSirenentanzExpertTechniques } from '../../combat-styles/sirenentanz/sirenentanz-expert-techniques.js?v=20260909-dragon-parent-v2';
import { createCultureDraftProgression } from '../culture-draft-progression.js';
import { getCenyrClassProgression } from '../cenyr/cenyr-class-progression.js?v=20260909-dragon-parent-v2';

// Read-only projection for pages, archive entries and future character training.
// Drafts intentionally have no grants and cannot mutate an existing profile.
export function getVennyrClassProgression(id, level = 1, options = {}) {
  const definition = getVennyrClassDefinition(id);
  if (!definition) return null;
  if (definition.classId === 'derwyn') {
    const plan = getCenyrClassProgression('derwyn', level, options);
    if (!plan) return null;
    const selected = plan.foundationSelection.options.some(option => option.formId === plan.foundationFormId)
      ? plan.foundationFormId : '';
    const isVisible = form => !selected || !form.isFoundationChoice || form.id === selected;
    const styles = plan.styles.map(style => ({ ...style, forms: style.forms.filter(isVisible) })).filter(style => style.forms.length);
    const attackCatalog = styles.flatMap(style => style.forms.flatMap(form => form.techniques));
    return { ...plan, selectedFoundationFormId: selected, styles, attackCatalog,
      levels: plan.levels.map(level => ({ ...level, forms: level.forms.filter(isVisible),
        attacks: level.attacks.filter(attack => attackCatalog.some(candidate => candidate.id === attack.id)) })) };
  }
  const attackCatalog = [...getSirenentanzBasicTechniques(definition.classId), ...getSirenentanzExpertTechniques(definition.classId)];
  return createCultureDraftProgression(definition, getSirenentanzForms(), attackCatalog,
    { id: 'sirenentanz', name: 'Wyrmtanz', culture: 'Vennyr · avallornische Wurzeln' }, level);
}
