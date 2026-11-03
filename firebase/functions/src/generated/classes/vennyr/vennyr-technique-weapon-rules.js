import { getSirenentanzBasicTechniques } from '../../combat-styles/sirenentanz/sirenentanz-basic-techniques.js';
import { getSirenentanzExpertTechniques } from '../../combat-styles/sirenentanz/sirenentanz-expert-techniques.js';
import { getCenyrWeaponProfileId } from '../cenyr/cenyr-technique-weapon-rules.js';
import { getCombatWeaponLoadout, hasEquippedCombatShield } from '../../combat/combat-weapon-loadout.js';
import { getDevelopmentTechniqueId } from '../../character-development/development-entry-reference.js';
import { getEffectiveCombatLevel } from '../../combat/combat-profile-model.js';
import { isCombatWeaponProfileAllowed } from '../../combat/combat-weapon-profile-family.js';

const techniques = new Map(['morwyr', 'rhyfelwyr', 'ceidwyn', 'rhiddwyr', 'derwyn', 'milwr']
  .flatMap(id => [...getSirenentanzBasicTechniques(id), ...getSirenentanzExpertTechniques(id)])
  .map(technique => [technique.id, technique]));

// Keep the shared Cenyr recognition and extend only the Vennyr weapon routes.
// Explicit authored weapon profiles take precedence over name recognition.
const vennyrNames = [
  ['harpoon', /harpun/], ['sabre', /säbel|saebel/], ['greataxe', /gro(?:ß|ss)axt/],
  ['warhammer', /kriegshammer/], ['raven-beak', /rabenschnabel/],
  ['flail', /flegel/], ['glaive', /glefe/]
];
function weaponProfile(weapon) {
  if (weapon.weaponProfileId) return getCenyrWeaponProfileId(weapon);
  const text = `${weapon.name || ''} ${weapon.properties || ''}`.toLocaleLowerCase('de');
  return vennyrNames.find(([, pattern]) => pattern.test(text))?.[0]
    || getCenyrWeaponProfileId(weapon) || String(weapon.weaponType || '');
}

// Requirements come from the catalogue, never from editable copied metadata.
// Purchasing a technique from another class is supported by the development
// system; class ownership is not an equipment requirement.
export function getVennyrTechniqueUnavailableReason(profile = {}, technique = {}, weapon = {}) {
  const id = getDevelopmentTechniqueId(technique);
  const source = techniques.get(id);
  if (!source) return '';
  const rules = source.cultureTraining || {};
  if (getEffectiveCombatLevel(profile) < source.minimumLevel) return `Wird ab Stufe ${source.minimumLevel} freigeschaltet.`;
  if (!source.weaponTypes.includes(weapon.weaponType)) return `Benötigt ${source.weaponLabel}.`;
  const actualProfile = weaponProfile(weapon);
  if (!isCombatWeaponProfileAllowed(rules.weaponProfileIds, actualProfile)) {
    return `Benötigt ${source.weaponLabel}.`;
  }
  if (rules.requiresMounted && profile.combat?.mounted !== true) return 'Diese Technik benötigt ein geführtes Reittier und berittenen Status.';
  const loadout = getCombatWeaponLoadout(profile);
  const shield = hasEquippedCombatShield(profile);
  const occupiedOffHand = (profile.weapons || []).some(item => item.id === profile.combat?.offHandWeaponId && item.id !== weapon.id);
  if (rules.requiresShield && (loadout.dualWield || !shield)) return 'Diese Technik benötigt einen gleichzeitig geführten Schild und eine freie Schildhand.';
  if (rules.requiresTwoHands && (occupiedOffHand || loadout.left || shield)) return 'Diese Technik benötigt beide Hände; Zweitwaffe oder Schild zuerst ablegen.';
  return '';
}
