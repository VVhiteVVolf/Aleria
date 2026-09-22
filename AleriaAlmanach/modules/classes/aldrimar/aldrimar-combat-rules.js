import { getHuskarlBasicTechniques } from '../../combat-styles/huskarl/huskarl-basic-techniques.js';
import { getHuskarlExpertTechniques } from '../../combat-styles/huskarl/huskarl-expert-techniques.js';
import { getCombatWeaponLoadout, hasEquippedCombatShield } from '../../combat/combat-weapon-loadout.js';

const classId = profile => String(profile.templateSelections?.classId || '').toLowerCase();
const techniques = new Map(['hird-maid', 'skjoldr', 'thegnar', 'skeidr', 'skjaldr', 'skytte', 'skalde']
  .flatMap(id => [...getHuskarlBasicTechniques(id), ...getHuskarlExpertTechniques(id)])
  .map(technique => [technique.id, technique]));

// Class training follows the wielder, never the transferable inventory item.
export function getAldrimarWeaponAttackBonus(profile = {}, weapon = {}) {
  return classId(profile) === 'skytte' && weapon.weaponType === 'bow' ? 1 : 0;
}

// Read requirements from the authored curriculum, even after profile sanitization.
export function getHuskarlTechniqueUnavailableReason(profile = {}, technique = {}) {
  if (technique.combatStyleId !== 'huskarl-waffenlehre') return '';
  const source = techniques.get(technique.id);
  if (!source) return 'Diese Huskarl-Technik ist nicht im Ausbildungskatalog enthalten.';
  const rules = source.cultureTraining;
  if (!rules.allowedClassIds.includes(classId(profile))) return 'Diese Technik gehört zu einer anderen Huskarl-Klasse.';
  if (Number(profile.progression?.level || 1) < source.minimumLevel) return `Wird ab Stufe ${source.minimumLevel} freigeschaltet.`;
  const loadout = getCombatWeaponLoadout(profile);
  if (rules.requiresMounted && !profile.combat?.mounted) return 'Diese Technik benötigt ein geführtes Reittier.';
  if (rules.requiresShield && (loadout.dualWield || !hasEquippedCombatShield(profile))) return 'Diese Technik benötigt einen gleichzeitig geführten Schild und eine freie Schildhand.';
  if (rules.requiresTwoHands && (loadout.left || hasEquippedCombatShield(profile))) return 'Diese Technik benötigt beide Hände; Zweitwaffe oder Schild zuerst ablegen.';
  if (rules.requiresTwoHands && !loadout.right?.versatileDamageFormula
    && !/zweihändig/i.test(loadout.right?.properties || '')) return 'Diese Technik benötigt eine zweihändig führbare Waffe.';
  if (rules.requiresDualWield && (!loadout.dualWield || hasEquippedCombatShield(profile)
    || !source.weaponTypes.includes(loadout.left?.weaponType))) return 'Diese Technik benötigt zwei passende, gleichzeitig geführte Waffen ohne Schild.';
  return '';
}
