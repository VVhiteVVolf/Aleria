import { getCenyrClassDefinitionForProfile } from './cenyr-class-registry.js?v=20260909-dragon-parent-v2';
import { ensureCenyrTrainingState } from './cenyr-class-training.js?v=20260909-dragon-parent-v2';
import { getCenyrWeaponProfileId } from './cenyr-technique-weapon-rules.js?v=20260909-dragon-parent-v2';
import { getDrachentanzPathFeatures } from '../../combat-styles/drachentanz/drachentanz-path-features.js?v=20260909-dragon-parent-v2';

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

function selectedPathIds(profile = {}) {
  return new Set((profile.classTraining?.selections || [])
    .filter(selection => selection?.kind === 'path')
    .map(selection => String(selection.selectionId || ''))
    .filter(Boolean));
}

function pathRequirementAllows(mechanics = {}, profile = {}, context = {}) {
  const weaponProfileId = getCenyrWeaponProfileId(context.weapon || {});
  if (mechanics.maximumHostileOpponents != null
    && Number.isFinite(Number(context.hostileOpponentCount))
    && Number(context.hostileOpponentCount) > Number(mechanics.maximumHostileOpponents)) return false;
  if (mechanics.requiresMounted && profile.combat?.mounted !== true) return false;
  if (mechanics.requiresDualWield && !/^dual-/.test(weaponProfileId)) return false;
  if (mechanics.requiresWeaponProfileId && weaponProfileId !== mechanics.requiresWeaponProfileId) return false;
  if (mechanics.requiresRangedWeapon && !isRangedWeapon(context.weapon)) return false;
  if (mechanics.requiresCharge && context.charge !== true) return false;
  return true;
}

function getActivePathFeatures(profile = {}, context = {}) {
  const formId = String(context.technique?.combatStyleFormId || '');
  const definition = getDefinition(profile);
  const fixedPath = definition?.pathSelection?.multiplePathsAllowed === false
    && definition.formAccess?.some(access => access.formId === formId && access.status !== 'blocked');
  if (!formId || (!selectedPathIds(profile).has(formId) && !fixedPath)) return [];
  const level = Number(profile.progression?.level) || 1;
  return getDrachentanzPathFeatures(formId)
    .filter(feature => feature.minimumLevel <= level)
    .filter(feature => pathRequirementAllows(feature.mechanics, profile, context));
}

function getPathActionModifiers(profile = {}, context = {}) {
  const features = getActivePathFeatures(profile, context);
  const latestValue = key => [...features].reverse().find(feature => feature.mechanics?.[key] != null)?.mechanics?.[key];
  const shieldTechnique = context.technique?.cenyrTraining?.requiresShield === true;
  let attackBonus = Number(latestValue('attackBonus')) || 0;
  if (shieldTechnique && latestValue('shieldIgnoresAttackPenalty') === true && attackBonus < 0) attackBonus = 0;
  return {
    attackBonus,
    damageBonus: Number(latestValue('damageBonus')) || 0,
    criticalThreshold: Number(latestValue('criticalThreshold')) || 20,
    targetDefenseModifier: Number(latestValue('targetDefenseModifier')) || 0,
    sources: features
      .filter(feature => ['attackBonus', 'damageBonus', 'criticalThreshold', 'targetDefenseModifier']
        .some(key => feature.mechanics?.[key] != null))
      .map(feature => ({ id: feature.id, name: feature.name }))
  };
}

export function getCenyrPathActionEffects(profile = {}, context = {}) {
  const features = getActivePathFeatures(profile, context);
  const armorFeature = [...features].reverse().find(feature => feature.mechanics?.afterTechniqueArmorClass != null);
  const movementFeature = [...features].reverse().find(feature => feature.mechanics?.movementBonus != null);
  const armorClass = Number(armorFeature?.mechanics?.afterTechniqueArmorClass) || 0;
  return {
    movementBonus: Number(movementFeature?.mechanics?.movementBonus) || 0,
    effects: armorClass ? [{
      id: `cenyr-path-${context.technique?.combatStyleFormId}-stance`,
      type: armorClass > 0 ? 'buff' : 'debuff',
      target: 'self',
      on: 'always',
      condition: {
        id: `cenyr-path-${context.technique?.combatStyleFormId}-stance`,
        name: armorFeature.name,
        description: armorFeature.description,
        duration: '1 eigener Beitrag',
        durationModel: { kind: 'actor-comments', remainingActorComments: 1 },
        tags: 'Drachentanz · Pfadpassiv',
        mechanics: { armorClass }
      },
      notes: armorFeature.description
    }] : []
  };
}

// Conditional class bonuses are resolved at action time. They are not copied into
// stored attacks, so later balance changes cannot overwrite a character's own edits.
export function getCenyrClassActionModifiers(profile = {}, context = {}) {
  const definition = getDefinition(profile);
  if (!definition) return { attackBonus: 0, damageBonus: 0, criticalThreshold: 20, sources: [] };
  const sources = definition.classFeatures.filter(feature => applies(feature, profile, context.technique, context.weapon));
  const path = getPathActionModifiers(profile, context);
  const result = {
    attackBonus: sources.reduce((sum, feature) => sum + (Number(feature.mechanics.attackBonus) || 0), 0) + path.attackBonus,
    damageBonus: sources.reduce((sum, feature) => sum + (Number(feature.mechanics.damageBonus) || 0), 0) + path.damageBonus,
    criticalThreshold: Math.min(
      sources.reduce((threshold, feature) => Math.min(threshold, Number(feature.mechanics.criticalThreshold) || 20), 20),
      path.criticalThreshold
    ),
    sources: [...sources.map(feature => ({ id: feature.id, name: feature.name })), ...path.sources]
  };
  if (path.targetDefenseModifier) result.targetDefenseModifier = path.targetDefenseModifier;
  return result;
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

export const cenyrClassCombatRuleInternals = Object.freeze({
  RANGED_WEAPON_TYPES, isRangedWeapon, applies, selectedPathIds, pathRequirementAllows,
  getActivePathFeatures, getPathActionModifiers
});
