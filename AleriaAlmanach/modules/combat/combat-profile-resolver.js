import {
  getWeaponAttackModifier,
  getWeaponDamageModifier,
  isTechniqueCompatibleWithWeapon,
  resolveCharacterCombatProfile
} from './combat-profile-model.js?v=20260803-combat-sheet-v6';
import {
  getActionPaymentCosts,
  normalizeCombatResourceCosts
} from './combat-action-economy.js?v=20260803-action-economy-v2';
import { buildCombatProfileAiSnapshot } from './combat-profile-context.js?v=20260803-combat-sheet-v6';
import { parseDamageFormula } from './rules/combat-mvp-rules.js';

function buildCombatProfileActions(character, profile) {
  const manaResource = profile.resources.find(resource => resource.id === profile.magic?.manaResourceId)
    || profile.resources.find(resource => /mana|fokus/i.test(resource.name || ''))
    || null;
  const weaponKind = character.entityType === 'creature' ? 'Angriff' : 'Waffe';
  const activeWeapon = profile.weapons.find(weapon => weapon.equipped) || profile.weapons[0] || null;
  const resourceCost = (resourceId, name, amount) => {
    const resource = profile.resources.find(item => item.id === resourceId);
    return amount > 0 && resourceId ? {
      id: `resource-${resourceId}`,
      resourceId,
      name: resource?.name || name,
      amount,
      scope: resource?.scope || 'persistent'
    } : null;
  };
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
      activationType: weapon.activationType,
      costs: normalizeCombatResourceCosts(weapon.costs),
      auraBypass: weapon.auraBypass,
      resolutionMode: 'weapon-attack',
      segmentKinds: ['combataction'],
      compatible: true,
      default: !!weapon.equipped
    }));
  const techniqueActions = (profile.techniques || [])
    .filter(technique => technique.active && technique.name)
    .map(technique => {
      const compatible = !!activeWeapon && isTechniqueCompatibleWithWeapon(technique, activeWeapon);
      const formula = technique.damageFormula || activeWeapon?.damageFormula || '';
      return {
        id: `technique:${technique.id}`,
        sourceId: technique.id,
        kind: 'technique',
        kindLabel: technique.activationType === 'reaction' ? 'Reaktion' : (technique.activationType === 'bonus-action' ? 'Bonusaktion' : 'Technik'),
        name: technique.name,
        formula,
        weapon: {
          ...(activeWeapon || {}),
          id: technique.id,
          name: technique.name,
          damageFormula: formula,
          damageType: technique.damageType || activeWeapon?.damageType || 'physisch',
          range: technique.range || activeWeapon?.range || 'Nahkampf',
          properties: [activeWeapon?.properties, technique.tags].filter(Boolean).join(' · '),
          notes: [technique.description, technique.effect, technique.requirements].filter(Boolean).join('\n')
        },
        attackModifier: getWeaponAttackModifier(profile, activeWeapon || {}) + Number(technique.attackBonus || 0),
        damageModifier: getWeaponDamageModifier(profile, activeWeapon || {}) + Number(technique.damageBonus || 0),
        activationType: technique.activationType,
        costs: normalizeCombatResourceCosts(technique.costs),
        auraBypass: technique.auraBypass,
        resolutionMode: 'weapon-attack',
        forcedRollMode: technique.rollMode,
        segmentKinds: ['combataction'],
        compatible,
        disabledReason: compatible ? '' : `Benötigt eine passende Waffenart; aktiv ist ${activeWeapon?.name || 'keine Waffe'}.`,
        default: false
      };
    });
  const abilityActions = (profile.abilities || [])
    .filter(ability => ability.active && ability.combatUsable && ability.name && ability.rollFormula)
    .map(ability => {
      const delivery = ability.delivery || 'ability';
      const isSpell = delivery === 'spell' || delivery === 'prayer' || delivery === 'song';
      const segmentKinds = isSpell ? [delivery] : ['combataction'];
      return {
        id: `ability:${ability.id}`,
        sourceId: ability.id,
        kind: delivery,
        kindLabel: delivery === 'song' ? 'Gesang' : (delivery === 'prayer' ? 'Gebet' : (isSpell ? 'Magische Fähigkeit' : 'Fähigkeit')),
        name: ability.name,
        formula: ability.rollFormula,
        weapon: {
          ...(delivery === 'weapon' ? (activeWeapon || {}) : {}),
          id: ability.id,
          name: ability.name,
          damageFormula: ability.rollFormula,
          damageType: ability.damageType || (isSpell ? 'Magie' : activeWeapon?.damageType || 'physisch'),
          range: ability.range || activeWeapon?.range || '',
          properties: ability.tags,
          notes: [ability.description, ability.requirements].filter(Boolean).join('\n')
        },
        attackModifier: isSpell ? profile.spellAttackModifier : getWeaponAttackModifier(profile, activeWeapon || {}),
        damageModifier: isSpell ? 0 : getWeaponDamageModifier(profile, activeWeapon || {}),
        activationType: ability.activationType,
        costs: normalizeCombatResourceCosts(ability.costs),
        auraBypass: ability.auraBypass,
        resolutionMode: isSpell ? 'spell-attack' : 'weapon-attack',
        segmentKinds,
        compatible: delivery !== 'weapon' || !!activeWeapon,
        disabledReason: delivery === 'weapon' && !activeWeapon ? 'Benötigt eine aktive Waffe.' : '',
        default: false
      };
    });
  const spellActions = (profile.magic?.enabled ? profile.magic.spells : [])
    .filter(spell => spell.prepared && spell.name && spell.rollFormula)
    .map(spell => {
      const presentationKind = ['prayer', 'song'].includes(spell.presentationKind) ? spell.presentationKind : 'spell';
      const manaCost = resourceCost(manaResource?.id || profile.magic?.manaResourceId || 'mana-focus', manaResource?.name || 'Mana / Fokus', Number(spell.manaCost));
      const slotCost = resourceCost(spell.slotResourceId, 'Zauberslot', Number(spell.slotCost));
      return {
      id: `spell:${spell.id}`,
      sourceId: spell.id,
      kind: presentationKind,
      kindLabel: presentationKind === 'prayer' ? 'Gebet' : (presentationKind === 'song' ? 'Gesang' : 'Zauber'),
      name: spell.name,
      formula: spell.rollFormula,
      weapon: {
        id: spell.id,
        name: spell.name,
        damageFormula: spell.rollFormula,
        damageType: spell.damageType || 'Magie',
        attackAttribute: profile.magic.castingAttribute,
        range: spell.range || 'Zauber',
        properties: `Zaubergrad ${spell.level} · ${spell.manaCost} Mana`,
        notes: spell.description,
        equipped: false
      },
      attackModifier: profile.spellAttackModifier,
      damageModifier: 0,
      activationType: spell.activationType,
      costs: normalizeCombatResourceCosts([...(spell.costs || []), manaCost, slotCost].filter(Boolean)),
      auraBypass: spell.auraBypass,
      resolutionMode: spell.resolutionType || 'spell-attack',
      saveAttribute: spell.saveAttribute,
      spellSaveDc: profile.spellSaveDc,
      halfDamageOnSave: !!spell.halfDamageOnSave,
      segmentKinds: [presentationKind],
      compatible: true,
      default: false
    };
    });
  return [...weaponActions, ...techniqueActions, ...abilityActions, ...spellActions];
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
  const segmentKind = String(options.segmentKind || '');
  const allActions = buildCombatProfileActions(character, profile);
  const actions = segmentKind ? allActions.filter(action => action.segmentKinds.includes(segmentKind)) : allActions;
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
    resourceCosts: getActionPaymentCosts(selectedAction || {}, options.paymentMode || 'standard', profile),
    actionCosts: normalizeCombatResourceCosts(selectedAction?.costs),
    selectedAction: selectedAction ? { ...selectedAction } : null,
    paymentMode: options.paymentMode || 'standard',
    actionResolutionMode: selectedAction?.resolutionMode || 'weapon-attack',
    actionSaveAttribute: selectedAction?.saveAttribute || 'dexterity',
    actionSpellSaveDc: selectedAction?.spellSaveDc ?? profile.spellSaveDc,
    actionHalfDamageOnSave: !!selectedAction?.halfDamageOnSave,
    forcedRollMode: selectedAction?.forcedRollMode || 'normal',
    actions,
    persistence: resolveCombatPersistence(character),
    aiSnapshot: buildCombatProfileAiSnapshot(character)
  };
}

export function getCombatActorProblems(profile = {}) {
  const problems = [];
  if (!profile.characterId) problems.push('characterId');
  if (profile.selectedAction?.compatible === false) problems.push('incompatibleAction');
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
