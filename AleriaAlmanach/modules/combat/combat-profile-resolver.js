import {
  getWeaponAttackModifier,
  getWeaponDamageModifier,
  resolveCharacterCombatProfile
} from './combat-profile-model.js?v=20260802-combat-sheet-v4';
import { buildCombatProfileAiSnapshot } from './combat-profile-context.js?v=20260802-combat-sheet-v4';
import { parseDamageFormula } from './rules/combat-mvp-rules.js';

function buildCombatProfileActions(character, profile) {
  const manaResource = profile.resources.find(resource => resource.id === profile.magic?.manaResourceId)
    || profile.resources.find(resource => /mana|fokus/i.test(resource.name || ''))
    || null;
  const weaponKind = character.entityType === 'creature' ? 'Angriff' : 'Waffe';
  const weaponActions = profile.weapons
    .filter(weapon => weapon.name && weapon.damageFormula)
    .map(weapon => ({
      id: `weapon:${weapon.id}`,
      sourceId: weapon.id,
      kind: 'weapon',
      kindLabel: weaponKind,
      name: weapon.name,
      formula: weapon.damageFormula,
      weapon: { ...weapon },
      attackModifier: getWeaponAttackModifier(profile, weapon),
      damageModifier: getWeaponDamageModifier(profile, weapon),
      resourceCosts: [],
      default: !!weapon.equipped
    }));
  const spellActions = (profile.magic?.enabled ? profile.magic.spells : [])
    .filter(spell => spell.prepared && spell.name && spell.rollFormula)
    .map(spell => ({
      id: `spell:${spell.id}`,
      sourceId: spell.id,
      kind: 'spell',
      kindLabel: 'Zauber',
      name: spell.name,
      formula: spell.rollFormula,
      weapon: {
        id: spell.id,
        name: spell.name,
        damageFormula: spell.rollFormula,
        damageType: 'Magie',
        attackAttribute: profile.magic.castingAttribute,
        range: 'Zauber',
        properties: `Zaubergrad ${spell.level} · ${spell.manaCost} Mana`,
        notes: spell.description,
        equipped: false
      },
      attackModifier: profile.spellAttackModifier,
      damageModifier: 0,
      resourceCosts: Number(spell.manaCost) > 0 ? [{
        resourceId: manaResource?.id || profile.magic?.manaResourceId || 'mana-focus',
        name: manaResource?.name || 'Mana / Fokus',
        amount: Number(spell.manaCost)
      }] : [],
      default: false
    }));
  return [...weaponActions, ...spellActions];
}

function resolveCombatPersistence(character = {}) {
  const actorId = String(character.id || '').trim();
  const sourceCreatureId = String(character.sourceCreatureId || character.sceneActorSourceId || '').trim();
  if (sourceCreatureId) {
    return { kind: 'scene-creature', actorId, sourceCreatureId };
  }
  if (!actorId || character._builtin) {
    return { kind: 'scene-actor', actorId };
  }
  return character.entityType === 'creature'
    ? { kind: 'creature', recordId: actorId }
    : { kind: 'character', recordId: actorId };
}

export function resolveCombatProfile(character = {}, options = {}) {
  const profile = resolveCharacterCombatProfile(character);
  const actions = buildCombatProfileActions(character, profile);
  const selectedAction = actions.find(action => action.id === String(options.actionId || ''))
    || actions.find(action => action.default)
    || actions[0]
    || null;
  return {
    ...profile,
    characterId: String(character.id || ''),
    name: String(character.name || 'Unbekannt'),
    portrait: String(character.portrait || ''),
    weapon: { ...(selectedAction?.weapon || profile.weapon) },
    armor: { ...profile.armor },
    attackModifier: selectedAction?.attackModifier ?? profile.attackModifier,
    damageModifier: selectedAction?.damageModifier ?? profile.damageModifier,
    profileActionId: selectedAction?.id || '',
    profileActionKind: selectedAction?.kind || 'weapon',
    resourceCosts: Array.isArray(selectedAction?.resourceCosts) ? selectedAction.resourceCosts : [],
    actions,
    persistence: resolveCombatPersistence(character),
    aiSnapshot: buildCombatProfileAiSnapshot(character)
  };
}

export function getCombatActorProblems(profile = {}) {
  const problems = [];
  if (!profile.characterId) problems.push('characterId');
  if (!String(profile.weapon?.name || '').trim()) problems.push('weaponName');
  try {
    parseDamageFormula(profile.weapon?.damageFormula);
  } catch {
    problems.push('weaponDamageFormula');
  }
  return problems;
}

export function getCombatTargetProblems(profile = {}) {
  const problems = [];
  if (!profile.characterId) problems.push('characterId');
  if (profile.totalDefense == null || !Number.isFinite(Number(profile.totalDefense))) problems.push('totalDefense');
  return problems;
}

export function validateCombatActorProfile(profile = {}) {
  const missingFields = getCombatActorProblems(profile);
  return { ready: missingFields.length === 0, missingFields };
}

export function validateCombatTargetProfile(profile = {}) {
  const missingFields = getCombatTargetProblems(profile);
  return { ready: missingFields.length === 0, missingFields };
}

export class CombatProfileResolver {
  resolve(character, options = {}) {
    return resolveCombatProfile(character, options);
  }

  validateActor(profile) {
    return validateCombatActorProfile(profile);
  }

  validateTarget(profile) {
    return validateCombatTargetProfile(profile);
  }
}
