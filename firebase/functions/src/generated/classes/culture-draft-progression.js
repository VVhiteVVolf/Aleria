import { getAuraFocusMaximum } from '../combat/combat-resource-progression.js';
import { getCombatActionEconomy, fillActionPoolChoices } from '../combat/combat-action-progression.js';

// A read-only view of authored cultural training. It never grants abilities.
export function createCultureDraftProgression(definition, formCatalog, attackCatalog, style, inputLevel = 1) {
  const value = Number(inputLevel);
  const selectedLevel = Number.isFinite(value) ? Math.max(1, Math.min(20, Math.trunc(value))) : 1;
  const authoredThrough = definition.authoredThroughLevel || 20;
  const forms = formCatalog.filter(form => definition.formIds.includes(form.id)).map(form => ({
    ...form, techniques: attackCatalog.filter(attack => attack.combatStyleFormId === form.id),
    accessStatus: 'draft', blocked: false, eligible: selectedLevel >= form.minimumLevel,
    isChoice: form.kind === 'path' && definition.pathSelection.multiplePathsAllowed,
    accessNote: form.description, available: false, selected: false
  }));
  const levels = Array.from({ length: 20 }, (_, index) => {
    const level = index + 1;
    return { level, phase: definition.trainingPhases.find(phase => level >= phase.minimumLevel && level <= phase.maximumLevel),
      forms: forms.filter(form => form.minimumLevel === level && !form.isChoice),
      pathOptions: forms.filter(form => form.minimumLevel === level && form.isChoice),
      techniqueSlots: definition.techniqueBudget.slots.filter(slot => slot.level === level),
      attacks: attackCatalog.filter(attack => attack.minimumLevel === level),
      features: definition.classFeatures.filter(feature => feature.minimumLevel === level),
      resources: level > authoredThrough ? null : {
        ...getCombatActionEconomy(level, 0, fillActionPoolChoices([], level)), 'aura-focus': getAuraFocusMaximum(level)
      }, status: level > authoredThrough ? 'pending' : 'draft' };
  });
  return { ...definition, selectedLevel, levels, attackCatalog,
    styles: forms.length ? [{ ...style, forms }] : [], selectedPathIds: [],
    pathOptions: forms.filter(form => form.isChoice), availableAttacks: [],
    earnedTechniqueSlots: definition.techniqueBudget.slots.filter(slot => slot.level <= selectedLevel) };
}
