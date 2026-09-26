import { collectApplicableCombatRules, markCombatRuleApplications, mergeCombatRuleEffects } from './combat-trigger-rules.js';
import { getBonusDamageFormulas, getUniversalDamageBonus, getWeaponAttackModifier, getWeaponDamageModifier } from './combat-profile-model.js';
import { getCombatWeaponLoadout } from './combat-weapon-loadout.js';
import { mergeRollModes } from './combat-roll-mode.js';
import { combineDamageFormulas, evaluateAttackRoll } from './rules/combat-mvp-rules.js';
import { applyOutcome } from './combat-attack-evaluation.js';
import { resolveCombatWard } from './combat-ward-resolution.js';

// Each follow-up has its own attack, damage, defenses and per-attack equipment rules.
export async function resolveFollowUpAttacks({ dice, actor, target, weapon, attack, secondarySaves,
  ruleSources, ruleProfileState, actionKind, profileActionId, rulePeriods, usedRuleFrequencyKeys,
  profileRollModes, auraRollMode, targetAuraOnActor, actorAuraOnTarget, targetConditions, options }) {
    const followUp = actor.selectedAction?.followUpAttack;
    const followUpAttacks = [];
    const followRuleConflicts = [];
    let allRuleApplications = [];
    let preWardTargetConditions = targetConditions;
    const followUpRepeatCount = Math.max(1, Math.min(5, Number(followUp?.repeatCount) || 1));
    if ((attack.hit || followUp?.afterMiss) && followUp?.enabled && (followUp.damageFormula || followUp.inheritWeapon)) {
    for (let followUpIndex = 0; followUpIndex < followUpRepeatCount; followUpIndex += 1) {
      const loadout = getCombatWeaponLoadout(actor);
      const usedWeapon = followUp.alternateHands && followUpIndex % 2 === 0 ? loadout.left : loadout.right;
      const followWeapon = followUp.inheritWeapon ? (usedWeapon || weapon) : weapon;
      const followFormula = followUp.inheritWeapon
        ? (followUp.alternateHands ? followWeapon.damageFormula : weapon.damageFormula) : followUp.damageFormula;
      const attackDelta = followUp.alternateHands ? getWeaponAttackModifier(actor, followWeapon) - getWeaponAttackModifier(actor, loadout.right) : 0;
      const damageDelta = followUp.alternateHands ? getWeaponDamageModifier(actor, followWeapon) - getWeaponDamageModifier(actor, loadout.right) : 0;
      const offBalance = followUp.saveFailureBonus && secondarySaves.some(save => !save.succeeded);
      const extraDie = offBalance ? String(followFormula).match(/\d+d(\d+)/i)?.[1] : '';
      const followActor = { ...actor, weapon: followWeapon, weapons: (actor.weapons || []).map(w => ({ ...w, equipped: w.id === followWeapon.id })) };
      const followSources = followUp.triggerReactions === false
        ? ruleSources.map(source => ({ ...source, selectedRuleIds: [] }))
        : ruleSources;
      const currentSources = followSources.map(source => source.sourceRole === 'actor' ? { ...source, profile: followActor } : source);
      const followProfileState = { ...ruleProfileState, actorProfile: followActor, followUp: true };
      const collectFollowRules = (phase, state = {}) => {
        if (followUp.repeatPerAttackRules === false && ['pre-roll', 'post-roll', 'post-hit', 'pre-damage'].includes(phase)) return [];
        const applications = collectApplicableCombatRules({
          phase, actionKind, profileActionId, sources: currentSources, periods: rulePeriods,
          usedFrequencyKeys: usedRuleFrequencyKeys, state: { ...followProfileState, ...state }
        });
        markCombatRuleApplications(applications, usedRuleFrequencyKeys);
        return applications;
      };
      const followPreApplications = collectFollowRules('pre-roll');
      const followPreEffects = mergeCombatRuleEffects(followPreApplications);
      const followRollMode = mergeRollModes(profileRollModes, offBalance ? 'advantage' : 'normal', auraRollMode, followPreApplications.map(application => application.effects?.rollMode));
      const followAttackModifier = Number(actor.attackModifier || 0) + attackDelta + Number(followUp.attackBonus || 0)
        + Number(targetAuraOnActor.attack || 0)
        + (['spell', 'prayer', 'song'].includes(actionKind) ? Number(targetAuraOnActor.spellAttack || 0) : 0)
        + followPreEffects.attackModifier;
      let followDefense = Number(target.totalDefense) + Number(actorAuraOnTarget.armorClass || 0) + followPreEffects.defenseModifier;
      const followAttackRoll = await dice.rollAttack({
        modifier: followAttackModifier,
        rollMode: followRollMode,
        actorName: actor.name,
        targetName: target.name,
        container: options.container
      });
      let followAttack = evaluateAttackRoll(followAttackRoll, followDefense, actor.selectedAction?.criticalThreshold);
      const followPostApplications = collectFollowRules('post-roll', followAttack);
      const followPostEffects = mergeCombatRuleEffects(followPostApplications);
      if (followPostEffects.attackModifier || followPostEffects.defenseModifier) {
        followAttack = evaluateAttackRoll({ ...followAttackRoll, total: Number(followAttackRoll.total) + followPostEffects.attackModifier }, followDefense + followPostEffects.defenseModifier, actor.selectedAction?.criticalThreshold);
      }
      followAttack = applyOutcome(followAttack, followPostEffects.outcome, false);
      followDefense += followPostEffects.defenseModifier;
      const followPostHitApplications = collectFollowRules('post-hit', followAttack);
      const followPostHitEffects = mergeCombatRuleEffects(followPostHitApplications);
      followAttack = applyOutcome(followAttack, followPostHitEffects.outcome, false);
      const followPreDamageApplications = collectFollowRules('pre-damage', followAttack);
      const followPreDamageEffects = mergeCombatRuleEffects(followPreDamageApplications);
      followAttack = applyOutcome(followAttack, followPreDamageEffects.outcome, false);
      const followApplications = [followPreApplications, followPostApplications, followPostHitApplications, followPreDamageApplications].flat();
      allRuleApplications = allRuleApplications.concat(followApplications);
      [
        ['follow-up/pre-roll', followPreEffects.conflicts], ['follow-up/post-roll', followPostEffects.conflicts],
        ['follow-up/post-hit', followPostHitEffects.conflicts], ['follow-up/pre-damage', followPreDamageEffects.conflicts]
      ].forEach(([phase, conflicts]) => {
        if (Array.isArray(conflicts) && conflicts.length) followRuleConflicts.push({ phase, applications: conflicts });
      });
      const followWard = await resolveCombatWard({
        attack: followAttack, conditions: preWardTargetConditions, dice: dice,
        actor, target, container: options.container
      });
      followAttack = followWard.attack;
      preWardTargetConditions = followWard.conditions;
      let followDamage = null;
      if (followAttack.hit) {
        const followBonusDamageFormulas = followFormula && followUp.inheritBonusDamage !== false ? getBonusDamageFormulas(actor) : [];
        followDamage = await dice.rollDamage({
          damageFormula: combineDamageFormulas([followFormula, ...(extraDie ? [`1d${extraDie}`] : []), ...followBonusDamageFormulas]),
          bonus: (followUp.inheritDamageModifier === false ? getUniversalDamageBonus(actor) : Number(actor.damageModifier || 0) + damageDelta) + Number(followUp.damageBonus || 0)
            + Number(targetAuraOnActor.damage || 0)
            + followPostHitEffects.damageModifier + followPreDamageEffects.damageModifier,
          critical: followAttack.criticalSuccess,
          actorName: actor.name,
          targetName: target.name,
          container: options.container
        });
        const reduction = Math.max(0, followPostHitEffects.damageReduction + followPreDamageEffects.damageReduction);
        if (reduction > 0) followDamage = { ...followDamage, rawTotal: Number(followDamage.total), total: Math.max(0, Number(followDamage.total) - reduction), damageReduction: reduction };
      }
      followUpAttacks.push({
        weaponId: followWeapon.id, weaponName: followWeapon.name,
        sameTarget: followUp.sameTarget !== false,
        triggerFurtherEffects: followUp.triggerFurtherEffects === true,
        wardResolution: followWard.wardResolution,
        attack: {
          naturalRoll: Number(followAttackRoll.natural),
          diceResults: Array.isArray(followAttackRoll.dice) ? followAttackRoll.dice.slice() : [],
          modifier: followAttackModifier + followPostEffects.attackModifier,
          total: Number(followAttackRoll.total) + followPostEffects.attackModifier,
          targetDefense: followDefense,
          hit: followAttack.hit,
          criticalSuccess: followAttack.criticalSuccess,
          criticalFailure: followAttack.criticalFailure,
          rollMode: followRollMode,
          rollId: followAttackRoll.id || ''
        },
        damage: followDamage ? {
          notation: followDamage.notation,
          diceResults: Array.isArray(followDamage.keptDice) ? followDamage.keptDice.slice() : [],
          modifier: Number(followDamage.modifier) || 0,
          total: Number(followDamage.total),
          damageType: followUp.damageType || followWeapon.damageType || 'physisch',
          rollId: followDamage.id || ''
        } : null
      });
    }
    }
  return { attacks: followUpAttacks, conflicts: followRuleConflicts, applications: allRuleApplications, conditions: preWardTargetConditions };
}
