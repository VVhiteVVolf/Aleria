import { getCenyrClassDefinitionForProfile } from './cenyr-class-registry.js?v=20260909-dragon-parent-v2';
import { reconcileCultureFormArsenal } from '../class-form-arsenal.js';
import { reconcileCenyrTrainingForLevel } from './cenyr-technique-selection.js?v=20260909-dragon-parent-v2';
import { migrateDrachentanzTechniqueResources } from '../../combat-styles/drachentanz/drachentanz-training-migration.js?v=20260909-dragon-parent-v2';

const autofillCache = new WeakMap();

function trainingSignature(profile = {}) {
  const training = profile.classTraining || {};
  return JSON.stringify({
    classId: profile.templateSelections?.classId || profile.identity?.archetype || '',
    ancestry: profile.identity?.ancestry || '',
    level: profile.progression?.level || 1,
    curriculumId: training.curriculumId || '',
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
  if (!definition) return reconcileCultureFormArsenal(profile);

  const signature = trainingSignature(profile);
  const cached = autofillCache.get(profile);
  if (cached?.signature === signature) return migrateDrachentanzTechniqueResources({ ...profile, ...cached.training });

  const reconciled = reconcileCenyrTrainingForLevel(profile, profile.progression?.level, {
    autoFill: true,
    preserveExisting: true,
    replaceClassTechniques: true
  }).profile;
  const training = { classTraining: reconciled.classTraining, techniques: reconciled.techniques };
  autofillCache.set(profile, { signature, training });
  // Resource balances and custom references remain live even when training is cached.
  return migrateDrachentanzTechniqueResources({ ...profile, ...training });
}

export const cenyrCombatProfileAutofillInternals = Object.freeze({ trainingSignature });
