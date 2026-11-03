import { COMBAT_ACTIVATION_TYPES } from '../combat/combat-action-economy.js';
import { describeTechniqueDamage } from '../combat/combat-technique-damage.js?v=20260905-party-combat-v1';
import { getCombatFormPresentation } from '../combat-styles/combat-form-presentation.js?v=20260909-dragon-parent-v2';
import { getCharacterArchiveOriginMeta } from './character-archive-origin-presentation.js';

const recoveryLabels = Object.freeze({
  'short-rest': 'Kurze Rast', 'long-rest': 'Lange Rast', scene: 'Je Szene',
  combat: 'Je Kampf', day: 'Pro Aleria-Tag', manual: 'Manuell'
});

export function getCharacterArchiveEntryMeta(entry = {}) {
  const data = entry.data || {};
  if (entry.kind === 'ancestry') return getCharacterArchiveOriginMeta(entry);
  if (entry.kind === 'spell') return [Number(data.level) ? `Grad ${data.level}` : 'Zaubertrick', data.school, data.damageType].filter(Boolean);
  if (entry.kind === 'technique') return [getCombatFormPresentation(data)?.label, describeTechniqueDamage(data), data.damageType].filter(Boolean);
  if (entry.kind === 'attack') return [data.weaponType, data.damageFormula?.toUpperCase?.(), data.damageType].filter(Boolean);
  if (entry.kind === 'class') return [data.baseClass ? 'Standardklasse' : (data.cultures || []).join(' · '), data.subtitle].filter(Boolean);
  if (entry.kind === 'condition') return [data.duration, data.source].filter(Boolean);
  if (entry.kind === 'ability') return [COMBAT_ACTIVATION_TYPES.find(type => type.id === data.activationType)?.label,
    recoveryLabels[data.recovery]].filter(Boolean);
  if (entry.kind?.startsWith('register-')) return [data.type, data.origin, [data.price, data.currency].filter(Boolean).join(' ')].filter(Boolean);
  return [data.group, data.subtitle, data.appliesWhen].filter(Boolean);
}
