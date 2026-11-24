import { HEALTH_STATUS_PRESETS } from '../character-health/health-status-presets.js';
import { getCombatConditionIconSource } from './combat-condition-icons.js';
import { COMBAT_CONDITION_RULES } from './combat-condition-rules.js';

const iconRoot = '../IconOrdner/Zauber Icons/Baldurs Gate/Condition Icons/';
const legacyIcons = {
  advantage: 'Bless_Condition_Icon.webp', disadvantage: 'Bane_Condition_Icon.webp', blessed: 'Bless_Condition_Icon.webp',
  protected: 'Shielded_Condition_Icon.webp', bane: 'Bane_Condition_Icon.webp', poisoned: 'Poisoned_Condition_Icon.webp',
  burning: 'Burning_Condition_Icon.webp', bleeding: 'Bleeding_Condition_Icon.webp', blinded: 'Blinded_Condition_Icon.webp',
  prone: 'Prone_Condition_Icon.webp', restrained: 'Restrained_Condition_Icon.webp',
  festgehalten: '/Bestiarium/assets/kreaturenkarten/zeichen/festgehalten.webp', stunned: 'Stunned_Condition_Icon.webp',
  sleeping: 'Sleeping_Condition_Icon.webp', wet: 'Wet_Condition_Icon.webp'
};

export const COMBAT_STATUS_PRESETS = Object.freeze([
  ...Object.entries(COMBAT_CONDITION_RULES).map(([id, rule]) => ({ id, kind: 'condition', ...rule,
    icon: legacyIcons[id] || getCombatConditionIconSource({ presetId: id }) })),
  ...HEALTH_STATUS_PRESETS
]);

export const STATUS_MODIFIERS = Object.freeze([
  ['attack', 'Angriff'], ['damage', 'Schaden'], ['armorClass', 'Rüstungsklasse'],
  ['savingThrow', 'Rettungswürfe'], ['skill', 'Fertigkeiten'], ['spellAttack', 'Zauberangriff'], ['spellSaveDc', 'Zauber-SG'],
  ['movement', 'Bewegung in Metern'], ['initiative', 'Initiative']
]);

export const STATUS_ROLL_MODES = Object.freeze([
  ['attackRollMode', 'Angriffe'], ['skillRollMode', 'Fertigkeitsproben']
]);

export function getStatusIcon(condition = {}) {
  const preset = COMBAT_STATUS_PRESETS.find(item => item.id === condition.presetId
    || item.name.toLocaleLowerCase('de') === String(condition.name || '').toLocaleLowerCase('de'));
  return preset ? (preset.icon.startsWith('/') ? preset.icon : `${iconRoot}${preset.icon}`) : '';
}
