// Shared class rule. Equipment still owns its Dexterity mode and cap; this
// feature controls when an armored fighter may use that contribution.
export const ARMOR_ROUTINE = Object.freeze({
  id: 'armor-routine', name: 'Rüstungsroutine', minimumLevel: 12,
  description: 'Ab Stufe 12 zählt Geschicklichkeit auch in angelegter Rüstung zur Rüstungsklasse, entsprechend deren GES-Modus und Begrenzung. Ohne Rüstung gelten die normalen Geschicklichkeitsregeln.',
  mechanics: null, status: 'confirmed'
});

export const ARMOR_ROUTINE_CLASS_IDS = Object.freeze([
  'milwr', 'teulu', 'cantref', 'uchelwyr', 'helwyr', 'arthwyr', 'barddwyr',
  'morwyr', 'rhyfelwyr', 'ceidwyn', 'rhiddwyr', 'derwyn',
  'kern', 'cateran', 'mormaer', 'serf', 'airig', 'currach', 'ceolaire-piobaire',
  'riada', 'silvaner', 'galloghlaigh', 'fathach',
  'hird-maid', 'skjoldr', 'thegnar', 'skeidr', 'skjaldr', 'skytte', 'skalde',
  'hird-kona', 'stjorn', 'ravnar', 'ulfhednar', 'berserkir', 'veigir', 'tungur', 'hestgar',
  'gold-aldknecht', 'husar', 'aldmar', 'eldner', 'schirmer', 'flamberger', 'havner', 'guldner', 'oraner',
  'gardist', 'ritter', 'slogar', 'rathaire', 'coillan', 'druan', 'mordan',
  'landsknecht', 'landsprotektor', 'kurassier', 'harlekin', 'landsmariner', 'landsjager',
  'fyrd', 'isen', 'wigar', 'hyld', 'scoet', 's-rinc', 'gliwere', 'miles', 'ceorl',
  'kampfer', 'reiter', 'asket', 'schurke', 'barde', 'eidgeschworener', 'barbar', 'waldlaufer', 'seefahrer'
]);
const fighterClasses = new Set(ARMOR_ROUTINE_CLASS_IDS);
const aliases = Object.freeze({ krieger: 'kampfer', fighter: 'kampfer', paladin: 'eidgeschworener', monch: 'asket',
  ceidwynr: 'ceidwyn', rhiddwyrr: 'rhiddwyr', saerinc: 's-rinc' });

export function hasArmorRoutineClass(profile = {}) {
  // An explicit class selection takes precedence over a legacy text label.
  const value = profile.templateSelections?.classId || profile.identity?.archetype || '';
  const key = String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .replace(/^(cenyr|vennyr|alben|aldrimar|universal)-/, '');
  return fighterClasses.has(aliases[key] || key);
}

export function getArmorRoutine(profile = {}) {
  if (!hasArmorRoutineClass(profile)) return null;
  return { ...ARMOR_ROUTINE, unlocked: (Number(profile.progression?.level) || 1) >= ARMOR_ROUTINE.minimumLevel };
}

export function isArmorDexterityUnlocked(profile = {}, bodyArmor = null) {
  const equipmentLevel = Math.max(0, Number(bodyArmor?.dexterityUnlockLevel) || 0);
  // Legacy sheets may store worn armor as a base value without an item slot.
  const armored = Boolean(bodyArmor) || Number(profile.armorClass?.overrideMode === 'base'
    ? profile.armorClass.override ?? profile.armorClass.base : profile.armorClass?.base) > 10;
  if (armored && hasArmorRoutineClass(profile) && !getArmorRoutine(profile).unlocked) return false;
  return (Number(profile.progression?.level) || 1) + (Number(profile.progression?.specialLevels) || 0) >= equipmentLevel;
}
