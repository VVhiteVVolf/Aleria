import { getCenyrClassDefinition, getCenyrFormLabel } from './cenyr-class-registry.js?v=20260909-dragon-parent-v2';
import { getCombatStyle, getCombatStyleTechniqueUnlockLevel } from '../../combat-styles/combat-style-registry.js?v=20260909-dragon-parent-v2';

function techniqueBelongsToClass(technique = {}, classId = '') {
  const allowedClassIds = technique.cenyrTraining?.allowedClassIds || [];
  return !allowedClassIds.length || allowedClassIds.includes(classId);
}

// Read-only projection used by class pages, archive cards and character sheets.
// Reading a plan never adds attacks to a character or writes to storage.
export function getCenyrClassProgression(id, level = 1, options = {}) {
  const definition = getCenyrClassDefinition(id);
  if (!definition) return null;
  const selectedLevel = Math.max(1, Math.min(20, Math.trunc(Number(level) || 1)));
  const storedPathIds = (Array.isArray(options.classTraining?.selections) ? options.classTraining.selections : [])
    .filter(selection => selection.kind === 'path')
    .map(selection => selection.selectionId);
  const selectedPathIds = new Set(Array.isArray(options.selectedPathIds) ? options.selectedPathIds : storedPathIds);
  const foundationOptions = definition.foundationSelection?.options || [];
  const foundationFormId = options.foundationFormId || options.classTraining?.selections?.find(selection => selection.kind === 'foundation')?.selectionId || '';
  const styleIds = [...new Set(definition.combatStyleGrants.map(grant => grant.styleId))];
  const styles = styleIds.map(styleId => {
    const style = getCombatStyle(styleId);
    return { ...style, forms: (style?.forms || []).filter(form => definition.formAccess.some(access => access.formId === form.id))
      .sort((a, b) => definition.formAccess.findIndex(access => access.formId === a.id) - definition.formAccess.findIndex(access => access.formId === b.id)).map(form => {
      const formAccess = definition.formAccess.find(access => access.formId === form.id);
      const grant = definition.combatStyleGrants.find(grant => grant.styleId === styleId && grant.formId === form.id);
      const minimumLevel = formAccess?.minimumLevel ?? null;
      const pathAllowed = (definition.pathSelection.allowedFormIds || []).includes(form.id);
      const accessGranted = !['blocked', 'unavailable', 'eligibility-pending'].includes(formAccess?.status || 'unavailable');
      const requiredPathId = formAccess?.requiredPathId || form.parentPathId || '';
      const dependencySatisfied = !requiredPathId || selectedPathIds.has(requiredPathId);
      const isChoice = definition.pathSelection.multiplePathsAllowed
        && minimumLevel >= definition.pathSelection.minimumLevel && pathAllowed;
      const isFoundationChoice = foundationOptions.some(option => option.formId === form.id);
      const foundationAllowed = !isFoundationChoice || form.id === foundationFormId;
      const selected = isChoice && selectedPathIds.has(form.id);
      const classLabel = getCenyrFormLabel(form.id, definition.classId);
      const shortName = classLabel && classLabel !== form.id ? classLabel : form.shortName;
      const dependencyNote = requiredPathId && !dependencySatisfied
        ? `Setzt zuerst ${getCenyrFormLabel(requiredPathId, definition.classId)} voraus.` : '';
      return { ...form, shortName, name: `${style.name} ${isChoice ? 'Pfad' : 'Form'} · ${shortName}`,
        minimumLevel, maximumTrainingLevel: formAccess?.maximumLevel ?? null,
        accessStatus: formAccess?.status || 'unavailable', accessNote: [formAccess?.note || '', dependencyNote].filter(Boolean).join(' '),
        requiredPathId, requiredPathName: requiredPathId ? getCenyrFormLabel(requiredPathId, definition.classId) : '', dependencySatisfied,
        eligible: minimumLevel != null && selectedLevel >= minimumLevel && accessGranted && dependencySatisfied,
        selected, isFoundationChoice, foundationSelected: isFoundationChoice && foundationAllowed,
        available: minimumLevel != null && selectedLevel >= minimumLevel && accessGranted && dependencySatisfied && foundationAllowed && (!isChoice || selected),
        blocked: formAccess?.status === 'blocked',
        isChoice, initialTechniqueCount: formAccess?.initialTechniqueCount || 0,
        techniques: form.techniques.filter(technique => techniqueBelongsToClass(technique, definition.classId))
          .map(technique => {
            const grantedLevel = grant ? getCombatStyleTechniqueUnlockLevel(grant, technique) : null;
            return { ...technique,
              trainingForm: form.id === 'drachentanz-form-ii-schwertdrache' ? `Drachentanz · ${shortName}` : technique.trainingForm,
              minimumLevel: grantedLevel ?? technique.minimumLevel, grantedLevel, live: grantedLevel != null };
          }) };
    }) };
  });
  const levels = Array.from({ length: 20 }, (_, index) => {
    const level = index + 1;
    const startingForms = styles.flatMap(style => style.forms.filter(form => form.minimumLevel === level && !form.isChoice && !form.blocked));
    const pathOptions = styles.flatMap(style => style.forms.filter(form => form.minimumLevel === level && form.isChoice));
    const techniqueSlots = definition.techniqueBudget.slots.filter(slot => slot.level === level);
    return { level, phase: definition.trainingPhases.find(phase => level >= phase.minimumLevel && level <= phase.maximumLevel) || null,
      forms: startingForms, pathOptions, techniqueSlots,
      attacks: styles.flatMap(style => style.forms.flatMap(form => form.techniques.filter(attack => attack.minimumLevel === level))),
      features: definition.classFeatures.filter(feature => feature.minimumLevel === level), status: 'partial' };
  });
  return { ...definition, selectedLevel, styles, levels,
    selectedPathIds: [...selectedPathIds], foundationFormId,
    earnedTechniqueSlots: definition.techniqueBudget.slots.filter(slot => slot.level <= selectedLevel),
    pathOptions: styles.flatMap(style => style.forms.filter(form => form.isChoice || form.blocked)),
    attackCatalog: styles.flatMap(style => style.forms.flatMap(form => form.techniques)),
    availableAttacks: styles.flatMap(style => style.forms.filter(form => form.available)
      .flatMap(form => form.techniques.filter(attack => attack.live && attack.minimumLevel <= selectedLevel))) };
}

export const cenyrClassProgressionInternals = Object.freeze({ techniqueBelongsToClass });
