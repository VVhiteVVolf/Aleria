import { DRACHENTANZ_FORM_IDS as F } from '../../combat-styles/drachentanz/drachentanz-ids.js';
import { getCombatAttackRange } from '../../combat/combat-attack-range.js';
import { activeCondition, actionPreparesAttack, actionProvidesGuard, positionPenalty, removeTrainingCondition, trainingCondition } from './class-passive-conditions.js';
import { hasStructuredTag, isBow, isEnemy, passiveRule, passiveUsedValues, weaponProfile } from './class-passive-action.js';

const SHOT_READY = 'cp-helwyr-shot';
const SADDLE_READY = 'cp-uchelwyr-seat';
const BEAR_PRESSURE = 'cp-arthwyr-pressure';
const BEAR_GUARD = 'cp-arthwyr-guard';
const RAPIER_GUARD = 'cp-barddwyr-guard';
const weaponFoot = ['dagger', 'shortsword'];
const heavyProfiles = ['greatsword', 'axe', 'battleaxe', 'club', 'mace'];

function qualifyingAction(context, style = 'drachentanz') {
  return context.role === 'actor' && context.primary && context.paid && context.style === style;
}

function prepare(context, minimumLevel, id, name, data = {}, lifetime = 'next-start') {
  return [passiveRule(context, 'preparation', minimumLevel, { once: false, resultEffects: [
    trainingCondition(id, name, 'self', data, lifetime)
  ] })];
}

export function helwyrPassives(context) {
  const { phase, role, level, state, weapon, action, form, self, target } = context;
  if (role !== 'actor') return [];
  const bow = isBow(weapon);
  if (phase === 'pre-roll' && state.skillId === 'perception' && bow
    && hasStructuredTag(target, ['verborgen', 'hidden', 'concealed', 'versteckt'])) {
    return [passiveRule(context, 'find-target', 5, { effects: { skillModifier: 1 } })];
  }
  if (!qualifyingAction(context)) return [];
  const guard = actionProvidesGuard(action, state.hit);
  if (phase === 'pre-damage') {
    if (bow && actionPreparesAttack(action)) return prepare(context, 7, SHOT_READY, 'Vorbereitete Schusslinie', {}, 'next-end');
    if (bow && guard) return prepare(context, 8, SHOT_READY, 'Gedeckte Schusslinie', {}, 'next-end');
    if (guard && form === F.jagender && weaponFoot.includes(weaponProfile(weapon))) {
      const prolonged = level >= 18 && String(action.sourceId).endsWith('-verstummende-spur');
      return prepare(context, prolonged ? 18 : 14, SHOT_READY, 'Vorbereiteter Schusswinkel',
        {}, prolonged ? 'next-end' : 'next-start');
    }
  }
  const prepared = activeCondition(self, SHOT_READY);
  if (!bow || getCombatAttackRange(context.actor) !== 'ranged' || !isEnemy(context)) return [];
  if (phase === 'pre-roll') {
    const ansitz = String(action.sourceId).endsWith('-langer-ansitz');
    const rules = [];
    if ((prepared || ansitz) && positionPenalty(self)) {
      rules.push(passiveRule(context, 'steady-shot', prepared ? 7 : 10, { effects: { attackModifier: 1 },
        resultEffects: prepared ? [removeTrainingCondition(prepared)] : [] }));
    }
    if (prepared && [F.lauernder, F.jagender].includes(form) && Number(action.targetDefenseModifier || 0) >= 0) {
      rules.push(passiveRule(context, 'shot-defense', 20, { effects: { defenseModifier: -1 }, resultEffects: [removeTrainingCondition(prepared)] }));
    }
    return rules;
  }
  if (phase === 'pre-hit-damage' && state.hit && prepared) {
    return [passiveRule(context, 'retreat', 16, { resultEffects: [
      removeTrainingCondition(prepared), trainingCondition('martial-position-guard', 'Gedeckter Rückzug des Helwyr', 'self', {
        stanceGroup: 'martial-position-guard', triggerRules: [{
          id: 'cp-helwyr-retreat-hit', phase: 'pre-roll', recipient: 'actor', sourceRelation: 'enemy',
          weaponAttackOnly: true, effects: { attackModifier: -1 },
          resultEffects: [{ type: 'remove-condition', target: 'target', on: 'always', conditionId: 'martial-position-guard' }]
        }]
      }, 'next-start')
    ] })];
  }
  return [];
}

export function uchelwyrPassives(context) {
  const { phase, role, level, self, state, action, form } = context;
  if (!self.combat?.mounted) return [];
  const prepared = activeCondition(self, SADDLE_READY);
  if (phase === 'mount-seat' && role === 'target') {
    const used = passiveUsedValues(context, 'seat');
    const slots = prepared ? 2 : 1;
    if (used.length >= slots) return [];
    const bonus = used.length && level < 20 ? 1 : prepared?.seatBonus || 1;
    return [passiveRule(context, 'seat', used.length ? (level >= 20 ? 20 : 7) : bonus >= 3 ? 18 : bonus === 2 ? 10 : 5, {
      signature: String(used.length), effects: { savingThrowModifier: bonus }
    })];
  }
  if (phase === 'pre-secondary-save' && role === 'target' && context.save.prone && prepared && !state.saveContext?.mountLanding) {
    return [passiveRule(context, 'saddle-save', 14, { effects: { savingThrowModifier: Math.min(2, prepared.seatBonus) } })];
  }
  if (phase !== 'pre-damage' || !qualifyingAction(context)) return [];
  const guarded = actionProvidesGuard(action, state.hit);
  const charge = action.requiresMounted === true && (state.charge === true
    || (state.hit && action.sourceId?.endsWith('-sattelantritt')));
  const turning = form === F.schweifender && state.hit && level >= 16;
  const strong = form === F.stuermender && state.hit && level >= 18
    && context.actor.resourceCosts?.some(cost => cost.resourceId === 'special-action');
  if (guarded || charge || turning || strong) {
    const minimumLevel = strong ? 18 : turning ? 16 : guarded ? (level >= 10 ? 10 : 7) : 8;
    return prepare(context, minimumLevel, SADDLE_READY, 'Geschlossener Sitz', { seatBonus: strong ? 3 : level >= 10 ? 2 : 1 });
  }
  return [];
}

export function arthwyrPassives(context) {
  const { phase, role, level, self, weapon, save, state, action, form } = context;
  const guarded = activeCondition(self, BEAR_GUARD);
  const wounded = Number(self.currentHitPoints) > 0 && Number(self.currentHitPoints) <= Number(self.maximumHitPoints) / 2;
  if (role === 'target' && context.melee && isEnemy(context)) {
    if (phase === 'pre-secondary-save' && (save.prone || (level >= 7 && save.movement))) {
      const strengthened = level >= 16 && guarded;
      return [passiveRule(context, 'stand', strengthened ? 16 : (save.prone ? 5 : 7), {
        effects: { savingThrowModifier: strengthened ? 2 : 1 }
      })];
    }
    if (phase === 'on-damaged' && state.damage > 0) {
      return [passiveRule(context, 'pressure', 8, { once: false, resultEffects: [
        trainingCondition(BEAR_PRESSURE, 'Druck nach erlittenem Treffer', 'target')
      ] })];
    }
  }
  if (!qualifyingAction(context) || !heavyProfiles.includes(weaponProfile(weapon))) return [];
  if (phase === 'pre-damage' && actionProvidesGuard(action, state.hit)) return prepare(context, 16, BEAR_GUARD, 'Fester Tatzenstand');
  if (!context.melee || !isEnemy(context) || action.lightAttack) return [];
  const pressure = activeCondition(self, BEAR_PRESSURE);
  if (phase === 'pre-roll' && pressure && positionPenalty(self)) {
    return [passiveRule(context, 'wound-position', 8, { effects: { attackModifier: 1 } })];
  }
  if (phase === 'pre-secondary-save' && (pressure || (level >= 14 && wounded))
    && (save.grip || save.position) && !save.disarm && !save.prone && !state.saveContext?.failureCondition?.blockedResource) {
    const master = level >= 20 && wounded && form === F.baerenklaue;
    return [passiveRule(context, 'pressure-save', master ? 20 : pressure ? 10 : 14, {
      effects: { spellSaveDcModifier: master ? 2 : 1 }
    })];
  }
  if (phase === 'pre-hit-damage' && state.hit && wounded && [F.baerenklaue, F.bruellender].includes(form)
    && context.actor.resourceCosts?.some(cost => cost.resourceId === 'special-action')) {
    return [passiveRule(context, 'wound-damage', 18, { effects: { damageModifier: 2 } })];
  }
  return [];
}

export function barddwyrPassives(context) {
  const { phase, role, level, weapon, save, action, state, self, form, sourceId } = context;
  if (weaponProfile(weapon) !== 'rapier') return [];
  const guarded = activeCondition(self, RAPIER_GUARD);
  if (phase === 'pre-secondary-save' && role === 'target' && save.disarm && guarded) {
    return [passiveRule(context, 'rapier-grip', level >= 16 ? 16 : 8, { effects: { savingThrowModifier: level >= 16 ? 2 : 1 } })];
  }
  if (!qualifyingAction(context)) return [];
  const guard = actionProvidesGuard(action, state.hit);
  if (phase === 'pre-damage' && guard) return prepare(context, 8, RAPIER_GUARD, 'Gedeckte Rapierlinie');
  if (phase !== 'pre-hit-damage' || !state.hit || !state.criticalSuccess || !context.melee || !isEnemy(context)
    || action.lightAttack || Number(action.maximumTargets) > 1) return [];
  const reaction = action.activationType === 'reaction';
  if (reaction && (level < 7 || (form !== F.traellernder && form !== F.kreischender))) return [];
  const special = context.actor.resourceCosts?.some(cost => cost.resourceId === 'special-action');
  const strengthened = form === F.kreischender && ((level >= 10 && guard) || (level >= 14 && guarded)
    || (level >= 18 && special) || (level >= 20 && Number(state.naturalRoll) >= 18));
  const effectId = `cp-barddwyr-takt-${sourceId}`;
  return [passiveRule(context, 'rapier-critical', reaction ? 7 : 5, { resultEffects: [
    trainingCondition(effectId, 'Gestörter Rapier-Takt', 'target', { triggerRules: [{
      id: `${effectId}-attack`, phase: 'pre-roll', recipient: 'actor', sourceRelation: 'self',
      attackRange: 'melee', weaponAttackOnly: true, requiredTargetId: sourceId,
      effects: { attackModifier: strengthened ? -2 : -1 },
      resultEffects: [{ type: 'remove-condition', target: 'self', conditionId: effectId, on: 'always' }]
    }] })
  ] })];
}
