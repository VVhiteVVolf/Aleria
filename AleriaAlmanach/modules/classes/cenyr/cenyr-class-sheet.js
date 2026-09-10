import { getCenyrClassDefinitionForProfile } from './cenyr-class-registry.js?v=20260909-dragon-parent-v2';
import { getCenyrClassProgression } from './cenyr-class-progression.js?v=20260909-dragon-parent-v2';
import { getCenyrTrainingState } from './cenyr-class-training.js?v=20260909-dragon-parent-v2';
import { getCenyrTechniqueChoiceGroups } from './cenyr-technique-selection.js?v=20260909-dragon-parent-v2';

export function getCenyrCharacterClassSummary(profile = {}) {
  // An explicit template wins; never reinterpret a different selected class from
  // free prose. Ambiguous legacy Milwr needs an explicit Cenyr origin.
  const definition = getCenyrClassDefinitionForProfile(profile);
  if (!definition) return null;
  const plan = getCenyrClassProgression(definition.id, profile.progression?.level, { classTraining: profile.classTraining });
  const state = getCenyrTrainingState(profile, definition);
  const spentSlots = new Set(state.selections.map(selection => selection.spentTechniqueSlotId).filter(Boolean));
  const learnedTechniqueIds = new Set(state.techniqueSelections.map(selection => selection.techniqueId));
  const filledTechniqueSlots = state.techniqueSelections.filter(selection => (
    plan.earnedTechniqueSlots.some(slot => slot.id === selection.slotId) && !spentSlots.has(selection.slotId)
  ));
  const learnedForms = plan.styles.flatMap(style => style.forms)
    .filter(form => form.available)
    .filter(form => form.kind !== 'path' || plan.selectedPathIds.includes(form.id))
    .map(form => form.shortName);
  const pending = getCenyrTechniqueChoiceGroups(profile, plan.selectedLevel, { allEarned: true });
  // The sheet lives in AleriaAlmanach.html; bundle locations are not page roots.
  const href = `../${definition.pagePath}?stufe=${plan.selectedLevel}#ausbildungsplan`;
  return { id: definition.id, name: definition.name, culture: definition.culture,
    level: plan.selectedLevel, availableCount: plan.attackCatalog.filter(attack => attack.minimumLevel <= plan.selectedLevel).length,
    learnedTechniqueCount: learnedTechniqueIds.size, filledTechniqueSlotCount: filledTechniqueSlots.length,
    spentTechniqueSlotCount: spentSlots.size, pendingTechniqueSlotCount: pending.length,
    earnedTechniqueSlots: plan.earnedTechniqueSlots.length, selectedPathCount: plan.selectedPathIds.length,
    pathSelectionRequired: Boolean(plan.pathSelection.firstSelectionRequired
      && plan.selectedLevel >= plan.pathSelection.minimumLevel && plan.selectedPathIds.length === 0),
    learnedForms, trainingFocus: definition.trainingFocus, href,
    foundationOptions: definition.foundationSelection?.options || [],
    foundationFormId: state.selections.find(selection => selection.kind === 'foundation')?.selectionId || '' };
}
