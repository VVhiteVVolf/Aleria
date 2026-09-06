import { getCenyrClassDefinitionForProfile } from './cenyr-class-registry.js?v=20260905-cenyr-runtime-autofill-v1';
import { reconcileCenyrTrainingForLevel } from './cenyr-technique-selection.js?v=20260906-effect-rolls-v1';

const autofillCache = new WeakMap();

function trainingSignature(profile = {}) {
  const training = profile.classTraining || {};
  return JSON.stringify({
    classId: profile.templateSelections?.classId || profile.identity?.archetype || '',
    ancestry: profile.identity?.ancestry || '',
    level: profile.progression?.level || 1,
    selections: (training.selections || []).map(selection => [
      selection.kind,
      selection.selectionId,
      selection.selectedAtLevel,
      selection.spentTechniqueSlotId
    ]),
    techniqueSelections: (training.techniqueSelections || []).map(selection => [
      selection.slotId,
      selection.techniqueId,
      selection.selectedAtLevel
    ]),
    weapons: (profile.weapons || []).map(weapon => [
      weapon.id,
      weapon.weaponType,
      weapon.weaponProfileId,
      weapon.equipped === true
    ]),
    techniques: profile.techniques || []
  });
}

/**
 * Materializes the class-owned Cenyr techniques for a combat profile without
 * mutating the stored character. This keeps old Firestore records usable while
 * their local class-training migration has not been uploaded yet.
 */
export function getAutofilledCenyrCombatProfile(profile = {}) {
  if (!profile || typeof profile !== 'object') return profile;
  const definition = getCenyrClassDefinitionForProfile(profile);
  if (!definition) return profile;

  const signature = trainingSignature(profile);
  const cached = autofillCache.get(profile);
  if (cached?.signature === signature) return { ...profile, ...cached.training };

  const reconciled = reconcileCenyrTrainingForLevel(profile, profile.progression?.level, {
    autoFill: true,
    preserveExisting: true,
    replaceClassTechniques: true
  }).profile;
  const training = { classTraining: reconciled.classTraining, techniques: reconciled.techniques };
  autofillCache.set(profile, { signature, training });
  return { ...profile, ...training };
}

export const cenyrCombatProfileAutofillInternals = Object.freeze({ trainingSignature });
