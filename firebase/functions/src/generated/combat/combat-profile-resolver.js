import {
  getAttributeModifier,
  getEffectiveCombatLevel,
  getProficiencyBonus,
  getWeaponAttackModifier,
  getWeaponDamageModifier,
  isTechniqueCompatibleWithWeapon,
  resolveCharacterCombatProfile
} from './combat-profile-model.js?v=20260906-character-vitality-v1';
import {
  getActionPaymentCosts,
  normalizeCombatResourceCosts
} from './combat-action-economy.js?v=20260905-resource-balance-v2';
import { getSpellLevelLabel, getSpellSlotLevel, isSpellSlotResource } from './combat-spell-slots.js?v=20260803-character-creation-v1';
import { getSpellManaCost } from './combat-resource-progression.js?v=20260905-resource-balance-v2';
import { buildCombatProfileAiSnapshot } from './combat-profile-context.js?v=20260906-character-vitality-v1';
import { parseDamageFormula, combineDamageFormulas } from './rules/combat-mvp-rules.js?v=20260905-party-combat-v1';
import { getCenyrClassActionModifiers } from '../classes/cenyr/cenyr-class-combat-rules.js?v=20260905-cenyr-character-training-v1';
import { resolveCenyrTechniqueWeaponRules } from '../classes/cenyr/cenyr-technique-weapon-rules.js?v=20260905-cenyr-character-training-v1';
import { getTechniqueDamageScaling, resolveTechniqueDamageFormula } from './combat-technique-damage.js?v=20260905-party-combat-v1';
import { getAutofilledCenyrCombatProfile } from '../classes/cenyr/cenyr-combat-profile-autofill.js?v=20260906-character-vitality-v1';
import { getActiveCombatWeapon } from './combat-equipment-state.js?v=20260905-combat-weapon-slots-v1';

let emptyCharacterTargetProfile = null;
let emptyCreatureTargetProfile = null;

function hasStoredCombatProfile(profile) {
  return !!profile && typeof profile === 'object' && Object.keys(profile).length > 0;
}

function combatPortrait(character = {}) {
  const sets = Array.isArray(character.imageSets) ? character.imageSets : [];
  return String(sets.find(set => set.id === character.activeImageSetId)?.portrait
    || character.portrait || sets.find(set => set.id === 'standard')?.portrait || sets[0]?.portrait || '');
}

function withAutofilledCenyrProfile(character = {}) {
  const combatProfile = getAutofilledCenyrCombatProfile(character.combatProfile || {});
  return combatProfile === character.combatProfile
    ? character
    : { ...character, combatProfile };
}

function buildCombatProfileActions(character, profile) {
  const manaResource = profile.resources.find(resource => resource.id === profile.magic?.manaResourceId)
    || profile.resources.find(resource => /mana|fokus/i.test(resource.name || ''))
    || null;
  const weaponKind = character.entityType === 'creature' ? 'Angriff' : 'Waffe';
  const usesWeaponLoadout = character.entityType !== 'creature';
  const activeWeapon = getActiveCombatWeapon(profile.weapons);
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
    .map(weapon => {
      const classModifiers = getCenyrClassActionModifiers(profile, { weapon });
      const equipped = weapon.id === activeWeapon?.id;
      const available = !usesWeaponLoadout || equipped;
      return {
      id: `weapon:${weapon.id}`,
      sourceId: weapon.id,
      kind: 'weapon',
      kindLabel: weaponKind,
      name: weapon.name,
      formula: weapon.damageFormula,
      weapon: { ...weapon },
      attackModifier: getWeaponAttackModifier(profile, weapon) + classModifiers.attackBonus,
      damageModifier: getWeaponDamageModifier(profile, weapon) + classModifiers.damageBonus,
      activationType: weapon.activationType,
      costs: normalizeCombatResourceCosts(weapon.costs),
      effects: weapon.effects || [],
      ammunition: weapon.ammunition || null,
      auraBypass: weapon.auraBypass,
      resolutionMode: 'weapon-attack',
      segmentKinds: ['combataction'],
      compatible: available,
      disabledReason: available ? '' : `Wechsle zuerst als Bonusaktion zu ${weapon.name}.`,
      default: equipped
    }; });
  const techniqueActions = (profile.techniques || [])
    .filter(technique => technique.active && technique.name)
    .map(technique => {
      const weaponCompatible = !!activeWeapon && isTechniqueCompatibleWithWeapon(technique, activeWeapon);
      const levelCompatible = getEffectiveCombatLevel(profile) >= Number(technique.minimumLevel || 1);
      const weaponRules = resolveCenyrTechniqueWeaponRules(profile, technique, activeWeapon || {});
      const compatible = weaponCompatible && levelCompatible && weaponRules.compatible;
      const formula = resolveTechniqueDamageFormula(technique, activeWeapon || {}, profile);
      const scaling = getTechniqueDamageScaling(technique, profile);
      const versatileFormula = technique.damageModel?.mode === 'weapon-dice' && activeWeapon?.versatileDamageFormula
        ? resolveTechniqueDamageFormula(technique, { ...activeWeapon, damageFormula: activeWeapon.versatileDamageFormula }, profile) : '';
      const saveAttribute = profile.attributes.find(attribute => attribute.key === technique.secondarySave?.dcAttributeKey);
      const secondarySaveDc = technique.secondarySave?.enabled
        ? Number(technique.secondarySave.dcBase || 8)
          + (technique.secondarySave.addProficiency ? getProficiencyBonus(profile) : 0)
          + getAttributeModifier(saveAttribute)
        : null;
      const classModifiers = getCenyrClassActionModifiers(profile, { technique, weapon: activeWeapon });
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
          versatileDamageFormula: versatileFormula,
          damageType: technique.damageType || activeWeapon?.damageType || 'physisch',
          range: technique.range || activeWeapon?.range || 'Nahkampf',
          properties: [activeWeapon?.properties, technique.tags].filter(Boolean).join(' · '),
          notes: [technique.description, technique.effect, technique.requirements].filter(Boolean).join('\n')
        },
        attackModifier: getWeaponAttackModifier(profile, activeWeapon || {}) + Number(technique.attackBonus || 0) + classModifiers.attackBonus + weaponRules.attackBonus,
        damageModifier: getWeaponDamageModifier(profile, activeWeapon || {}) + Number(technique.damageBonus || 0) + classModifiers.damageBonus + weaponRules.damageBonus,
        criticalThreshold: Math.min(Number(technique.criticalThreshold) || 20, classModifiers.criticalThreshold || 20, weaponRules.criticalThreshold || 20),
        targetDefenseModifier: weaponRules.targetDefenseModifier,
        maximumTargets: weaponRules.maximumTargets,
        mechanicNotes: [...new Set([...(technique.mechanicNotes || []), ...weaponRules.mechanicNotes,
          ...(scaling ? [`Ausbildungsbonus ab Stufe ${scaling.level}: +${scaling.formula.toUpperCase().replace(/D/g, 'W')} (bereits im Schadenswurf enthalten).`] : [])])].slice(0, 8),
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
              : (weaponRules.disabledReason || `Benötigt eine passende Waffenart; aktiv ist ${activeWeapon?.name || 'keine Waffe'}.`)),
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
        resolutionMode: ability.resolutionType
          || (ability.rollFormula ? (isSpell ? 'spell-attack' : 'weapon-attack') : 'automatic'),
        saveAttribute: ability.saveAttribute || 'dexterity',
        halfDamageOnSave: !!ability.halfDamageOnSave,
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
      const manaCost = resourceCost(manaResource?.id || profile.magic?.manaResourceId || 'mana-focus', manaResource?.name || 'Mana', Number(spell.manaCost));
      const requiresSlot = !cantrip;
      const slotResource = requiresSlot
        ? profile.resources.find(resource => resource.id === spell.slotResourceId) || null
        : null;
      const slotConfigurationMissing = requiresSlot && (!slotResource || getSpellSlotLevel(slotResource) !== Number(spell.level) || Number(slotResource.maximum) < 1);
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
        properties: `${getSpellLevelLabel(spell.level)} · ${spell.manaCost} ${manaResource?.name || 'Mana'}`,
        notes: spell.description,
        equipped: false
      },
      attackModifier: profile.spellAttackModifier,
      damageModifier: 0,
      activationType: spell.activationType,
      costs: normalizeCombatResourceCosts([...additionalCosts, manaCost].filter(Boolean)),
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
        ? 'Der Zaubergrad ist noch nicht freigeschaltet oder seine Gradzuordnung fehlt.'
        : '',
      default: false
    };
    });
  // Aktive Waffe/Schild/Casterinstrument im Kampf zu wechseln kostet eine Bonusaktion und
  // wirkt sich erst auf künftige Handlungen aus - keine Attacke, keine Kosten außer der
  // Bonusaktion, automatisch aufgelöst (kein Wurf nötig).
  const equipmentSwitchActions = (usesWeaponLoadout ? profile.weapons : [])
    .filter(weapon => weapon.name)
    .map(weapon => ({
      id: `equip:${weapon.id}`,
      sourceId: weapon.id,
      kind: 'equipment-switch',
      kindLabel: 'Ausrüstungswechsel',
      name: `Zu ${weapon.name} wechseln`,
      formula: '',
      weapon: { ...weapon },
      attackModifier: 0,
      damageModifier: 0,
      activationType: 'bonus-action',
      costs: normalizeCombatResourceCosts([
        { id: `equip-${weapon.id}-bonus-action`, resourceId: 'bonus-action', name: 'Bonusaktion', amount: 1, scope: 'comment' }
      ]),
      effects: [],
      ammunition: null,
      auraBypass: { allowed: false, resourceId: '', cost: 1 },
      resolutionMode: 'automatic',
      equipmentSwitchTargetId: weapon.id,
      segmentKinds: ['combataction'],
      compatible: weapon.id !== activeWeapon?.id,
      disabledReason: weapon.id === activeWeapon?.id ? 'Bereits aktiv ausgerüstet.' : '',
      default: false
    }));
  return [...weaponActions, ...techniqueActions, ...abilityActions, ...spellActions, ...equipmentSwitchActions];
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
  return combineDamageFormulas(parts);
}

function applySpellCastLevel(action, profile, requestedLevel) {
  if (!action || action.spellLevel == null || (action.kind !== 'spell' && action.kind !== 'prayer' && action.kind !== 'song')) return action;
  if (action.isCantrip) return { ...action, castLevel: 0, castLevelLabel: getSpellLevelLabel(0) };
  const baseLevel = Math.max(1, Number(action.spellLevel) || 1);
  const maximumLevel = Math.max(baseLevel, Math.min(10, Number(action.upcast?.maximumLevel) || 10));
  const castLevel = Math.max(baseLevel, Math.min(maximumLevel, Number(requestedLevel) || baseLevel));
  const slotResource = profile.resources.find(resource => castLevel === baseLevel
    ? resource.id === action.slotResourceId : getSpellSlotLevel(resource) === castLevel) || null;
  const gradeUnlocked = !!slotResource && Number(slotResource.maximum) >= 1;
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
  const manaResourceId = profile.magic?.manaResourceId || 'mana-focus';
  const costs = (action.costs || [])
    .filter(cost => !dedicatedSlotIds.has(String(cost.resourceId || '')))
    .map(cost => cost.resourceId === manaResourceId ? { ...cost, amount: getSpellManaCost(castLevel) } : cost);
  const formula = combineFormulas(action.formula, scaleFormula, difference);
  return {
    ...action,
    formula,
    weapon: { ...action.weapon, damageFormula: formula,
      properties: `${getSpellLevelLabel(castLevel)} · ${getSpellManaCost(castLevel)} ${profile.resources.find(resource => resource.id === manaResourceId)?.name || 'Mana'}` },
    effects,
    costs: normalizeCombatResourceCosts(costs),
    castLevel,
    castLevelLabel: getSpellLevelLabel(castLevel),
    compatible: action.compatible !== false && gradeUnlocked,
    disabledReason: !gradeUnlocked ? `${getSpellLevelLabel(castLevel)} ist noch nicht freigeschaltet.` : action.disabledReason
  };
}

export function resolveCombatProfile(character = {}, options = {}) {
  const effectiveCharacter = withAutofilledCenyrProfile(character);
  const profile = resolveCharacterCombatProfile(effectiveCharacter);
  const segmentKind = String(options.segmentKind || '');
  const allActions = buildCombatProfileActions(effectiveCharacter, profile);
  const actions = segmentKind ? allActions.filter(action => action.segmentKinds.includes(segmentKind)) : allActions;
  const selectedActionBase = actions.find(action => action.id === String(options.actionId || ''))
    || actions.find(action => action.default)
    || actions[0]
    || null;
  const selectedAction = applySpellCastLevel(selectedActionBase, profile, options.castLevel);
  const requestedWeaponGrip = String(options.weaponGrip || '').trim().toLowerCase();
  const supportsVersatileGrip = ['weapon', 'technique'].includes(selectedAction?.kind)
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
    characterId: String(effectiveCharacter.id || ''),
    name: String(effectiveCharacter.name || 'Unbekannt'),
    portrait: combatPortrait(effectiveCharacter),
    inventory: effectiveCharacter.inventory && typeof effectiveCharacter.inventory === 'object'
      ? JSON.parse(JSON.stringify(effectiveCharacter.inventory))
      : { items: [] },
    weapon: { ...(resolvedWeapon || {}) },
    activeWeaponId: String(getActiveCombatWeapon(profile.weapons)?.id || ''),
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
    persistence: resolveCombatPersistence(effectiveCharacter),
    aiSnapshot: buildCombatProfileAiSnapshot(effectiveCharacter)
  };
}

/**
 * Lightweight read model for the target picker. It intentionally omits action,
 * inventory and AI projections; the complete profile is still resolved when a
 * target is selected and the attack is evaluated.
 */
export function resolveCombatTargetProfile(character = {}) {
  const effectiveCharacter = withAutofilledCenyrProfile(character);
  const creature = effectiveCharacter.entityType === 'creature';
  let profile;
  if (hasStoredCombatProfile(effectiveCharacter.combatProfile)) {
    profile = resolveCharacterCombatProfile(effectiveCharacter);
  } else if (creature) {
    emptyCreatureTargetProfile ||= resolveCharacterCombatProfile({ entityType: 'creature', combatProfile: {} });
    profile = emptyCreatureTargetProfile;
  } else {
    emptyCharacterTargetProfile ||= resolveCharacterCombatProfile({ entityType: 'character', combatProfile: {} });
    profile = emptyCharacterTargetProfile;
  }
  return {
    ...profile,
    characterId: String(effectiveCharacter.id || ''),
    name: String(effectiveCharacter.name || 'Unbekannt'),
    portrait: combatPortrait(effectiveCharacter)
  };
}

export function getCombatActorProblems(profile = {}) {
  const problems = [];
  if (!profile.characterId) problems.push('characterId');
  if (Number(profile.currentHitPoints) <= 0 && profile.combat?.canActAtZeroHitPoints !== true) problems.push('incapacitated');
  if (profile.selectedAction?.compatible === false) problems.push('incompatibleAction');
  if (profile.selectedAction?.kind === 'equipment-switch') return problems;
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

export function validateCombatActorProfile(profile = {}, { startedAction = null } = {}) {
  // Only an already resolved first target can continue the same area action.
  // The caller supplies its own resolution, never a client-provided permission.
  const continuingAction = !!startedAction?.resolutionId
    && startedAction.actionType !== 'channeling'
    && startedAction.actorId === profile.characterId
    && startedAction.profileActionId === profile.profileActionId;
  const missingFields = getCombatActorProblems(profile)
    .filter(problem => problem !== 'incapacitated' || !continuingAction);
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

  resolveTarget(character) {
    return resolveCombatTargetProfile(character);
  }

  validateActor(profile, options = {}) {
    return validateCombatActorProfile(profile, options);
  }

  validateTarget(profile) {
    return validateCombatTargetProfile(profile);
  }
}
