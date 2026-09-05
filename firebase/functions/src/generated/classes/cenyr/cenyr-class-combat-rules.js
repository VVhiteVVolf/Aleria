import { getCenyrClassDefinitionForProfile } from './cenyr-class-registry.js?v=20260905-cenyr-character-training-v1';
import { ensureCenyrTrainingState } from './cenyr-class-training.js?v=20260905-cenyr-character-training-v1';
import { getCenyrWeaponProfileId } from './cenyr-technique-weapon-rules.js?v=20260905-cenyr-character-training-v1';

const RANGED_WEAPON_TYPES = new Set(['bow', 'crossbow', 'firearm']);

function isRangedWeapon(weapon = {}) {
  return RANGED_WEAPON_TYPES.has(String(weapon.weaponType || '')) || /fernkampf/i.test(String(weapon.range || ''));
}

function getDefinition(profile = {}) {
  return getCenyrClassDefinitionForProfile(profile);
}

function applies(feature, profile, technique, weapon) {
  if (!feature.mechanics || feature.minimumLevel == null) return false;
  if ((Number(profile.progression?.level) || 1) < feature.minimumLevel) return false;
  if (feature.mechanics.styleId && technique?.combatStyleId !== feature.mechanics.styleId) return false;
  if (feature.mechanics.weaponTypes?.length && !feature.mechanics.weaponTypes.includes(weapon?.weaponType)) return false;
  if (feature.mechanics.weaponProfileIds?.length && !feature.mechanics.weaponProfileIds.includes(getCenyrWeaponProfileId(weapon))) return false;
  if (feature.mechanics.range === 'ranged' && !isRangedWeapon(weapon)) return false;
  return true;
}

// Conditional class bonuses are resolved at action time. They are not copied into
// stored attacks, so later balance changes cannot overwrite a character's own edits.
export function getCenyrClassActionModifiers(profile = {}, context = {}) {
  const definition = getDefinition(profile);
  if (!definition) return { attackBonus: 0, damageBonus: 0, criticalThreshold: 20, sources: [] };
  const sources = definition.classFeatures.filter(feature => applies(feature, profile, context.technique, context.weapon));
  return {
    attackBonus: sources.reduce((sum, feature) => sum + (Number(feature.mechanics.attackBonus) || 0), 0),
    damageBonus: sources.reduce((sum, feature) => sum + (Number(feature.mechanics.damageBonus) || 0), 0),
    criticalThreshold: sources.reduce((threshold, feature) => Math.min(threshold, Number(feature.mechanics.criticalThreshold) || 20), 20),
    sources: sources.map(feature => ({ id: feature.id, name: feature.name }))
  };
}

export function applyCenyrClassLevelProgression(profile = {}, targetLevel = 1) {
  const next = ensureCenyrTrainingState(profile);
  const definition = getDefinition(next);
  const level = Math.max(1, Math.min(20, Math.trunc(Number(targetLevel) || 1)));
  const unlockedFeatures = [];
  if (definition?.classId === 'barddwyr' && level >= 6 && !next.magic?.enabled) {
    next.magic = { ...next.magic, enabled: true, castingAttribute: 'charisma',
      notes: 'Barddwyr-Grundzauber, Verstärkungen und Rituale sind ab Stufe 6 freigeschaltet; die konkrete Zauberliste folgt.' };
    unlockedFeatures.push(definition.classFeatures.find(feature => feature.id === 'barddwyr-spell-training'));
  }
  return { profile: next, unlockedFeatures: unlockedFeatures.filter(Boolean) };
}

export const cenyrClassCombatRuleInternals = Object.freeze({ RANGED_WEAPON_TYPES, isRangedWeapon, applies });
