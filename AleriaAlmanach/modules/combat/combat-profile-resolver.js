import {
  getAttributeModifier,
  getEffectiveCombatLevel,
  getProficiencyBonus,
  getWeaponAttackModifier,
  getWeaponDamageModifier,
  isTechniqueCompatibleWithWeapon,
  resolveCharacterCombatProfile
} from './combat-profile-model.js?v=20260804-referee-v2';
import {
  getActionPaymentCosts,
  normalizeCombatResourceCosts
} from './combat-action-economy.js?v=20260803-economy-audit-v1';
import { getSpellLevelLabel, getSpellSlotLevel, isSpellSlotResource } from './combat-spell-slots.js?v=20260803-character-creation-v1';
import { buildCombatProfileAiSnapshot } from './combat-profile-context.js?v=20260804-referee-v2';
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
      effects: weapon.effects || [],
      ammunition: weapon.ammunition || null,
      auraBypass: weapon.auraBypass,
      resolutionMode: 'weapon-attack',
      segmentKinds: ['combataction'],
      compatible: true,
      default: !!weapon.equipped
    }));
  const techniqueActions = (profile.techniques || [])
    .filter(technique => technique.active && technique.name)
    .map(technique => {
      const weaponCompatible = !!activeWeapon && isTechniqueCompatibleWithWeapon(technique, activeWeapon);
      const levelCompatible = getEffectiveCombatLevel(profile) >= Number(technique.minimumLevel || 1);
      const compatible = weaponCompatible && levelCompatible;
      const formula = technique.damageFormula || activeWeapon?.damageFormula || '';
      const saveAttribute = profile.attributes.find(attribute => attribute.key === technique.secondarySave?.dcAttributeKey);
      const secondarySaveDc = technique.secondarySave?.enabled
        ? Number(technique.secondarySave.dcBase || 8)
          + (technique.secondarySave.addProficiency ? getProficiencyBonus(profile) : 0)
          + getAttributeModifier(saveAttribute)
        : null;
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
        secondarySave: technique.secondarySave?.enabled ? { ...technique.secondarySave, dc: secondarySaveDc } : null,
        followUpAttack: technique.followUpAttack?.enabled ? { ...technique.followUpAttack } : null,
        effects: technique.effects || [],
        segmentKinds: ['combataction'],
        compatible,
        disabledReason: compatible
          ? ''
          : (!levelCompatible
              ? `Wird ab Stufe ${technique.minimumLevel} freigeschaltet.`
              : `Benötigt eine passende Waffenart; aktiv ist ${activeWeapon?.name || 'keine Waffe'}.`),
        default: false
      };
    });
  const abilityActions = (profile.abilities || [])
    .filter(ability => ability.active && ability.combatUsable && ability.name && (ability.rollFormula || ability.effects?.length))
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
        resolutionMode: ability.rollFormula ? (isSpell ? 'spell-attack' : 'weapon-attack') : 'automatic',
        effects: ability.effects || [],
        concentration: !!ability.concentration,
        channelComments: Number(ability.channelComments || 0),
        segmentKinds,
        compatible: delivery !== 'weapon' || !!activeWeapon,
        disabledReason: delivery === 'weapon' && !activeWeapon ? 'Benötigt eine aktive Waffe.' : '',
        default: false
      };
    });
  const spellActions = (profile.magic?.enabled ? profile.magic.spells : [])
    .filter(spell => spell.prepared && spell.name && (spell.rollFormula || spell.effects?.length))
    .map(spell => {
      const presentationKind = ['prayer', 'song'].includes(spell.presentationKind) ? spell.presentationKind : 'spell';
      const cantrip = Number(spell.level) === 0;
      const manaCost = cantrip ? null : resourceCost(manaResource?.id || profile.magic?.manaResourceId || 'mana-focus', manaResource?.name || 'Mana / Fokus', Number(spell.manaCost));
      const slotCost = cantrip ? null : resourceCost(spell.slotResourceId, 'Zauberplatz', Number(spell.slotCost));
      const requiresSlot = !cantrip && Number(spell.slotCost) > 0;
      const slotResource = requiresSlot
        ? profile.resources.find(resource => resource.id === spell.slotResourceId) || null
        : null;
      const slotConfigurationMissing = requiresSlot && (!spell.slotResourceId || !slotResource);
      const dedicatedMagicResourceIds = new Set([
        manaResource?.id || profile.magic?.manaResourceId || 'mana-focus',
        ...profile.resources.filter(resource => isSpellSlotResource(resource, profile.magic?.slotResourceIds)).map(resource => resource.id)
      ]);
      const additionalCosts = (spell.costs || []).filter(cost => !dedicatedMagicResourceIds.has(String(cost.resourceId || '')));
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
        properties: cantrip
          ? 'Zaubertrick · keine Mana- oder Zauberplatzkosten'
          : `${getSpellLevelLabel(spell.level)} · ${spell.manaCost} Mana · ${spell.slotCost} Zauberplatz`,
        notes: spell.description,
        equipped: false
      },
      attackModifier: profile.spellAttackModifier,
      damageModifier: 0,
      activationType: spell.activationType,
      costs: normalizeCombatResourceCosts([...additionalCosts, manaCost, slotCost].filter(Boolean)),
      auraBypass: spell.auraBypass,
      resolutionMode: spell.resolutionType || 'spell-attack',
      saveAttribute: spell.saveAttribute,
      spellSaveDc: profile.spellSaveDc,
      halfDamageOnSave: !!spell.halfDamageOnSave,
      effects: spell.effects || [],
      concentration: !!spell.concentration,
      channelComments: Number(spell.channelComments || 0),
      upcast: spell.upcast || null,
      spellLevel: spell.level,
      spellLevelLabel: getSpellLevelLabel(spell.level),
      isCantrip: cantrip,
      slotResourceId: spell.slotResourceId,
      segmentKinds: [presentationKind],
      compatible: !slotConfigurationMissing,
      disabledReason: slotConfigurationMissing
        ? 'Dieser Zauber benötigt eine vorhandene Zauberplatz-Ressource.'
        : '',
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

function combineFormulas(base = '', addition = '', count = 0) {
  const parts = [String(base || '').trim(), ...Array.from({ length: Math.max(0, count) }, () => String(addition || '').trim())]
    .filter(Boolean);
  return parts.join('+');
}

function applySpellCastLevel(action, profile, requestedLevel) {
  if (!action || action.spellLevel == null || (action.kind !== 'spell' && action.kind !== 'prayer' && action.kind !== 'song')) return action;
  if (action.isCantrip) return { ...action, castLevel: 0, castLevelLabel: getSpellLevelLabel(0) };
  const baseLevel = Math.max(1, Number(action.spellLevel) || 1);
  const maximumLevel = Math.max(baseLevel, Math.min(10, Number(action.upcast?.maximumLevel) || 10));
  const castLevel = Math.max(baseLevel, Math.min(maximumLevel, Number(requestedLevel) || baseLevel));
  const slotResource = profile.resources.find(resource => getSpellSlotLevel(resource) === castLevel) || null;
  const difference = castLevel - baseLevel;
  const scaleFormula = action.upcast?.enabled ? action.upcast.formulaPerLevel : '';
  const scaleAmount = action.upcast?.enabled ? Number(action.upcast.amountPerLevel || 0) : 0;
  const effects = (Array.isArray(action.effects) ? action.effects : []).map((effect, index) => {
    if (index !== 0 || !['damage', 'healing', 'temporary-hit-points'].includes(effect.type)) return { ...effect };
    return {
      ...effect,
      formula: combineFormulas(effect.formula, scaleFormula, difference),
      amount: Number(effect.amount || 0) + (scaleAmount * difference)
    };
  });
  const dedicatedSlotIds = new Set(profile.resources.filter(resource => isSpellSlotResource(resource, profile.magic?.slotResourceIds)).map(resource => String(resource.id)));
  const originalSlotCost = Math.max(1, Number((action.costs || []).find(cost => dedicatedSlotIds.has(String(cost.resourceId || '')))?.amount) || 1);
  const costs = (action.costs || [])
    .filter(cost => !dedicatedSlotIds.has(String(cost.resourceId || '')))
    .concat(slotResource ? [{
      id: `resource-${slotResource.id}`,
      resourceId: slotResource.id,
      name: slotResource.name || getSpellLevelLabel(castLevel),
      amount: originalSlotCost,
      scope: slotResource.scope || 'persistent'
    }] : []);
  const formula = combineFormulas(action.formula, scaleFormula, difference);
  return {
    ...action,
    formula,
    weapon: { ...action.weapon, damageFormula: formula },
    effects,
    costs: normalizeCombatResourceCosts(costs),
    castLevel,
    castLevelLabel: getSpellLevelLabel(castLevel),
    compatible: action.compatible !== false && !!slotResource,
    disabledReason: !slotResource ? `Es fehlt ein Zauberplatz für ${getSpellLevelLabel(castLevel)}.` : action.disabledReason
  };
}

export function resolveCombatProfile(character = {}, options = {}) {
  const profile = resolveCharacterCombatProfile(character);
  const segmentKind = String(options.segmentKind || '');
  const allActions = buildCombatProfileActions(character, profile);
  const actions = segmentKind ? allActions.filter(action => action.segmentKinds.includes(segmentKind)) : allActions;
  const selectedActionBase = actions.find(action => action.id === String(options.actionId || ''))
    || actions.find(action => action.default)
    || actions[0]
    || null;
  const selectedAction = applySpellCastLevel(selectedActionBase, profile, options.castLevel);
  const requestedWeaponGrip = String(options.weaponGrip || '').trim().toLowerCase();
  const supportsVersatileGrip = selectedAction?.kind === 'weapon'
    && Boolean(String(selectedAction?.weapon?.versatileDamageFormula || '').trim());
  const weaponGrip = supportsVersatileGrip && requestedWeaponGrip === 'two-handed'
    ? 'two-handed'
    : 'one-handed';
  const resolvedWeapon = selectedAction?.weapon
    ? {
        ...selectedAction.weapon,
        damageFormula: weaponGrip === 'two-handed'
          ? selectedAction.weapon.versatileDamageFormula
          : selectedAction.weapon.damageFormula
      }
    : profile.weapon;
  const resolvedSelectedAction = selectedAction
    ? {
        ...selectedAction,
        baseDamageFormula: selectedAction.weapon?.damageFormula || selectedAction.formula,
        weapon: { ...resolvedWeapon },
        formula: resolvedWeapon?.damageFormula || selectedAction.formula
      }
    : null;
  return {
    ...profile,
    characterId: String(character.id || ''),
    name: String(character.name || 'Unbekannt'),
    portrait: String(character.portrait || ''),
    inventory: character.inventory && typeof character.inventory === 'object'
      ? JSON.parse(JSON.stringify(character.inventory))
      : { items: [] },
    weapon: { ...(resolvedWeapon || {}) },
    armor: { ...profile.armor },
    attackModifier: selectedAction?.attackModifier ?? profile.attackModifier,
    damageModifier: selectedAction?.damageModifier ?? profile.damageModifier,
    profileActionId: selectedAction?.id || '',
    profileActionKind: selectedAction?.kind || 'weapon',
    resourceCosts: getActionPaymentCosts(selectedAction || {}, options.paymentMode || 'standard', profile),
    actionCosts: normalizeCombatResourceCosts(selectedAction?.costs),
    selectedAction: resolvedSelectedAction,
    weaponGrip,
    supportsVersatileGrip,
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
  if (Number(profile.currentHitPoints) <= 0 && profile.combat?.canActAtZeroHitPoints !== true) problems.push('incapacitated');
  if (profile.selectedAction?.compatible === false) problems.push('incompatibleAction');
  if (!String(profile.weapon?.name || '').trim()) problems.push('weaponName');
  const hasStructuredEffects = Array.isArray(profile.selectedAction?.effects) && profile.selectedAction.effects.length > 0;
  if (!hasStructuredEffects) {
    try {
      parseDamageFormula(profile.weapon?.damageFormula);
    } catch {
      problems.push('weaponDamageFormula');
    }
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

export function getCombatActorValidationMessage(profile = {}, validation = validateCombatActorProfile(profile)) {
  if (validation.ready) return '';
  if (validation.missingFields.includes('incapacitated')) {
    return `${profile.name || 'Die handelnde Figur'} ist bei 0 Trefferpunkten handlungsunfähig.`;
  }
  if (validation.missingFields.includes('incompatibleAction') && profile.selectedAction?.disabledReason) {
    return String(profile.selectedAction.disabledReason);
  }
  return `Ergänze für ${profile.name || 'die handelnde Figur'} zuerst einen passenden Angriff mit Schadenswurf auf dem Profilbogen.`;
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
