import { DERWYN_FORM_IDS as F } from '../../combat-styles/sirenentanz/sirenentanz-forms.js';
import { activeCondition, actionProvidesGuard, trainingCondition } from './class-passive-conditions.js';
import { getCombatPassiveClassId } from './class-passive-curriculum.js';
import { isEnemy, leadingWeapon, passiveRule, weaponProfile } from './class-passive-action.js';

const FOCUS_GUARD = 'cp-derwyn-focus';
const WYRM_GUARD = 'cp-derwyn-guard';
const FOCUS_PROFILES = ['staff', 'quarterstaff', 'magic-staff', 'trident'];
const focusId = weapon => String(weapon?.inventoryItemId || weapon?.id || '');

export function getDerwynFocusWeapons(profile) {
  return getCombatPassiveClassId(profile) === 'derwyn'
    ? (profile.weapons || []).filter(weapon => FOCUS_PROFILES.includes(weaponProfile(weapon))) : [];
}

export function getDerwynChannelingFocus(actor, action) {
  if (getCombatPassiveClassId(actor) !== 'derwyn' || !['spell', 'prayer', 'song'].includes(action?.kind)) return '';
  if (!/wasser|water|flut|strom|ström|welle|nimue|wiederherstellung|restitution/i.test(
    [action.tags, action.school, action.name].join(' '))
    && !(action.effects || []).some(effect => ['healing', 'buff', 'temporary-hit-points'].includes(effect.type))) return '';
  const held = leadingWeapon(actor);
  if (!FOCUS_PROFILES.includes(weaponProfile(held))) return '';
  const assigned = actor.magic?.channelingFocusWeaponId;
  return !assigned || [held.id, held.inventoryItemId].includes(assigned) ? focusId(held) : '';
}

export function derwynPassives(context) {
  const { phase, role, self, state, level, weapon, action, form } = context;
  const focus = activeCondition(self, FOCUS_GUARD);
  const guard = activeCondition(self, WYRM_GUARD);
  const concentration = state.concentration || self.concentration;
  const sustainedWithFocus = concentration?.focusWeaponId && concentration.focusWeaponId === focusId(leadingWeapon(self));
  if (phase === 'on-concentration-check' && role === 'target' && sustainedWithFocus) {
    const improved = focus && focus.focusWeaponId === concentration.focusWeaponId;
    return [passiveRule(context, 'focus', improved && level >= 20 ? 20 : improved && level >= 8 ? 8 : 5, {
      effects: { savingThrowModifier: improved && level >= 20 ? 3 : improved && level >= 8 ? 2 : 1 }
    })];
  }
  if (role === 'target' && phase === 'pre-secondary-save' && guard && context.save.disarm) {
    return [passiveRule(context, 'wyrm-grip', 14, { effects: { savingThrowModifier: 1 } })];
  }
  if (role === 'target' && phase === 'pre-hit-damage' && state.hit && context.melee && isEnemy(context)) {
    const staffGuard = guard?.trainingFormId === F.rising && focus?.focusWeaponId === focusId(leadingWeapon(self))
      && FOCUS_PROFILES.includes(weaponProfile(weapon)) && weaponProfile(weapon) !== 'trident';
    if (sustainedWithFocus && focus && level >= 18) {
      return [passiveRule(context, 'focus-guard', 18, { effects: { damageReduction: staffGuard ? 2 : 1 } })];
    }
    if (staffGuard) return [passiveRule(context, 'focus-guard', level >= 16 ? 16 : 10, {
      effects: { damageReduction: level >= 16 ? 2 : 1 }
    })];
  }
  if (role !== 'actor' || !context.primary || !context.paid || !['drachentanz', 'sirenentanz'].includes(context.style)) return [];
  const guarded = actionProvidesGuard(action, state.hit);
  const sameWyrmGuard = guard?.trainingFormId === form;
  const prepared = activeCondition(self, 'cp-derwyn-sword') || sameWyrmGuard;
  if (phase === 'pre-damage' && guarded) {
    return [passiveRule(context, 'guard', 7, { once: false, resultEffects: [
      ...(FOCUS_PROFILES.includes(weaponProfile(weapon)) ? [
        trainingCondition(FOCUS_GUARD, 'Geführter Kanalisator', 'self', { focusWeaponId: focusId(leadingWeapon(self)) }, 'next-start')
      ] : []),
      ...(form === F.creative && weaponProfile(weapon) === 'sword' ? [
        trainingCondition('cp-derwyn-sword', 'Vorbereitete Schwertantwort des Derwyn', 'self')
      ] : []),
      ...(Object.values(F).includes(form) && form !== F.foundation && form !== F.creative ? [
        trainingCondition(WYRM_GUARD, 'Gedeckte Wyrmführung', 'self', { trainingFormId: form })
      ] : []),
      ...(level >= 10 && form === F.whipping && state.hit ? [
        trainingCondition('cp-derwyn-whipping-return', 'Geschlossene Sternwende', 'self', { guardAmount: level >= 16 && sameWyrmGuard ? 2 : 1 }, 'next-start')
      ] : [])
    ] })];
  }
  if (phase === 'pre-roll' && form === F.flowing && prepared && context.melee && isEnemy(context) && !action.lightAttack) {
    const master = level >= 20 && sameWyrmGuard && Number(action.targetDefenseModifier || 0) >= 0;
    return [passiveRule(context, 'wyrm-counter', master ? 20 : level >= 16 ? 16 : 10, {
      effects: { attackModifier: level >= 16 ? 2 : 1, ...(master ? { defenseModifier: -1 } : {}) }
    })];
  }
  if (phase === 'pre-secondary-save' && form === F.breaking && isEnemy(context)
    && (context.save.grip || context.save.position || (level >= 16 && sameWyrmGuard && context.save.disarm))) {
    const master = level >= 20 && sameWyrmGuard;
    return [passiveRule(context, 'wyrm-binding', master ? 20 : context.save.disarm ? 16 : 10, {
      effects: { spellSaveDcModifier: master ? 2 : 1 }
    })];
  }
  return [];
}

export function derwynReturnPassives(context) {
  const guard = activeCondition(context.self, 'cp-derwyn-whipping-return');
  if (context.phase !== 'pre-hit-damage' || context.role !== 'target' || !context.melee
    || !context.state.hit || !isEnemy(context) || !guard) return [];
  return [passiveRule(context, 'wyrm-return', guard.guardAmount > 1 ? 16 : 10, { effects: { damageReduction: guard.guardAmount } })];
}
