import { getSkillIdentity } from '../skill-checks/skill-definitions.js';
import { isHealthTraitMechanicallyActive } from '../character-health/health-trait-policy.js';
import { isPsychologicalTraitMechanicallyActive } from '../character-development/development-psychological-policy.js';
// Conditional training stays on the person, never on a transferable item.
export function personalWeaponAttribute(profile, weapon) {
  const trained = (profile.abilities || []).some(a => a.active !== false && a.activationType === 'passive'
    && a.mechanics?.dexterityWeaponTypes?.includes(weapon.weaponType));
  return trained ? 'dexterity' : weapon.attackAttribute;
}
export function conditionalWeaponModifier(profile, weapon, key) {
  return passiveSources(profile)
    .flatMap(a => a.mechanics?.weaponModifiers || [])
    .filter(m => m.weaponTypes.includes(weapon.weaponType))
    .reduce((sum, m) => sum + Number(m[key] || 0), 0);
}
export function conditionalSkillModifier(profile, skill) {
  return passiveSources(profile)
    .flatMap(a => a.mechanics?.skillModifiers || [])
    .filter(m => getSkillIdentity(m.name) === getSkillIdentity(skill.name))
    .reduce((sum, m) => sum + m.bonus, 0);
}
function passiveSources(profile) {
  return [...(profile.abilities || []).filter(a => a.activationType === 'passive'),
    ...(profile.quirks || []), ...(profile.conditions || [])]
    .filter(source => source.active !== false && isHealthTraitMechanicallyActive(source, profile)
      && isPsychologicalTraitMechanicallyActive(source, profile));
}
export function conditionalSaveModifier(profile, context = {}) {
  const effects = context.effects || [];
  const names = [context.name, context.failureCondition?.name, ...effects.map(e => e.condition?.name)].join(' ').toLowerCase();
  const kinds = new Set(context.saveTags || []);
  if (/furcht|angst|furchtsam|verängstigt/.test(names)) kinds.add('fear');
  if (/gift|vergift/.test(names) || effects.some(e => /gift|poison/i.test(e.damageType || ''))) kinds.add('poison');
  if (/blutung|blutend|bleeding/.test(names)) kinds.add('bleeding');
  if (/niederwerf|liegend|zu boden/.test(names)) kinds.add('prone');
  if (effects.some(e => e.type === 'move' && ['push', 'pull'].includes(e.movementKind))) kinds.add('forced-movement');
  const sources = [...passiveSources(profile),
    ...(profile.armorItems || []).filter(a => a.equipped)];
  // One effect can both push and knock prone; the same passive applies once.
  return sources.reduce((total, source) => {
    const matches = (source.mechanics?.saveModifiers || []).filter(m => kinds.has(m.kind)).map(m => Number(m.bonus) || 0);
    return total + (matches.length ? Math.max(...matches.filter(n => n > 0), 0) + Math.min(...matches.filter(n => n < 0), 0) : 0);
  }, 0);
}
