import { activeCondition, actionProvidesGuard, removeTrainingCondition, trainingCondition } from './class-passive-conditions.js';
import { inCantrefReach, isEnemy, isPolearm, isSword, passiveRule, passiveUsedValues, withinPosition } from './class-passive-action.js';

const TEULU_GUARD = 'cp-teulu-guard';
const TEULU_REPLY = 'cp-teulu-reply';
const CANTREF_GUARD = 'cp-cantref-guard';

function swordAnswer(context, reply) {
  return reply && context.role === 'actor' && context.primary && context.paid && context.style === 'drachentanz'
    && context.melee && isSword(context.weapon) && !context.action.lightAttack && isEnemy(context)
    && (Number(context.action.maximumTargets) || 1) === 1
    && reply.trainingOpponentId === context.target.characterId
    && (context.level >= 20 || context.form === reply.trainingFormId);
}

function swordGuard(context) {
  return activeCondition(context.self, TEULU_GUARD);
}

export function teuluPassives(context) {
  const { phase, role, level, weapon, save, state, sourceId, actor, target, action, form, primary, paid } = context;
  if (!isSword(weapon)) return [];
  const reply = activeCondition(context.self, TEULU_REPLY);
  const guard = swordGuard(context);
  const prepared = swordAnswer(context, reply);
  if (phase === 'pre-secondary-save' && role === 'target' && save.disarm) {
    return [passiveRule(context, 'grip', level >= 16 ? 16 : 5, { effects: { savingThrowModifier: level >= 16 ? 2 : 1 } })];
  }
  if (phase === 'pre-secondary-save' && prepared && (save.disarm || save.grip)) {
    return [passiveRule(context, 'answer-save', 14, { effects: { spellSaveDcModifier: 1 } })];
  }
  if (phase === 'post-roll' && role === 'target' && primary && guard && context.melee && isEnemy(context)) {
    return [passiveRule(context, 'observe-attack', 7, { resultEffects: [
      trainingCondition(TEULU_REPLY, 'Vorbereitete Schwertantwort', 'target', {
        trainingFormId: guard.trainingFormId, trainingOpponentId: actor.characterId
      })
    ] })];
  }
  if (phase === 'pre-roll' && prepared) {
    return [passiveRule(context, 'answer', 7, { effects: { attackModifier: 1 },
      resultEffects: [removeTrainingCondition(reply)] })];
  }
  if (phase !== 'pre-hit-damage') return [];
  const rules = [];
  if (role === 'actor' && primary && paid && context.style === 'drachentanz') {
    if (actionProvidesGuard(action, state.hit)) {
      rules.push(passiveRule(context, 'guard', level >= 8 ? 8 : 7, { once: false, resultEffects: [
        trainingCondition(TEULU_GUARD, 'Gehaltene Schwertdeckung', 'self', { trainingFormId: form })
      ] }));
    }
    if (prepared && (state.hit || level >= 18)) {
      rules.push(passiveRule(context, 'closed-guard', level >= 18 && !state.hit ? 18 : 10, { resultEffects: [
        trainingCondition('cp-teulu-closed', 'Geschlossene Schwertantwort', 'target', { triggerRules: [{
          id: 'cp-teulu-closed-attack', name: 'Deckung der Schwertantwort', phase: 'pre-roll', activation: 'passive',
          recipient: 'actor', sourceRelation: 'self', attackRange: 'melee', weaponAttackOnly: true, requiredTargetId: sourceId,
          effects: { attackModifier: -1 }, resultEffects: [{
            type: 'remove-condition', target: 'self', conditionId: 'cp-teulu-closed', on: 'always'
          }]
        }] })
      ] }));
    }
  }
  if (state.hit) {
    if (role === 'target' && guard && context.melee && isEnemy(context) && isSword(actor.weapon)) {
      rules.push(passiveRule(context, 'blade-guard', 8, { effects: { damageReduction: 1 } }));
    } else if (prepared) {
      rules.push(passiveRule(context, 'answer-damage', 7, { effects: { damageModifier: 2 } }));
    } else if (role === 'actor' && primary && paid && String(action.sourceId).endsWith('-taeuschende-klaue') && isEnemy(context)) {
      rules.push(passiveRule(context, 'feint', 20, { resultEffects: [
        trainingCondition(TEULU_REPLY, 'Vorbereitete Schwertantwort', 'self', {
          trainingFormId: form, trainingOpponentId: target.characterId
        })
      ] }));
    }
  }
  return rules;
}

function cantrefGuardRules(context) {
  const { role, level, source, state, sourceId, actor, target } = context;
  if (!state.hit || role === 'actor' || !context.melee || !isEnemy(context) || !inCantrefReach(context)) return [];
  const ally = role === 'support';
  if (ally && (level < 14 || !withinPosition(context, 1.5))) return [];
  if (source.passiveRulesAllowed === false && !ally) return [];
  const used = passiveUsedValues(context, 'line').map(signature => signature.split('|'));
  const attacker = encodeURIComponent(actor.characterId);
  const recipient = encodeURIComponent(target.characterId);
  if (used.length >= (level >= 10 ? 2 : 1) || used.some(([id]) => id === attacker)) return [];
  const protectedAllies = used.filter(([, id]) => id !== encodeURIComponent(sourceId));
  if (ally && (protectedAllies.length >= (level >= 20 ? 2 : 1) || protectedAllies.some(([, id]) => id === recipient))) return [];
  const minimumLevel = ally ? (level >= 20 && protectedAllies.length ? 20 : 14) : used.length ? 10 : 5;
  return [passiveRule(context, 'line', minimumLevel, { signature: `${attacker}|${recipient}`, support: ally,
    effects: { damageReduction: 2 } })];
}

export function cantrefPassives(context) {
  const { phase, role, level, self, weapon, primary, paid, style, state, action, save, target } = context;
  if (!isPolearm(weapon) || self.combat?.mounted) return [];
  if (phase === 'pre-hit-damage' && role === 'actor' && primary && paid && style === 'drachentanz') {
    const activeDefense = actionProvidesGuard(action, state.hit);
    if (activeDefense && (action.nonDamaging || (level >= 8 && state.hit))) {
      return [passiveRule(context, 'guard', action.nonDamaging ? 5 : 8, { once: false, resultEffects: [
        trainingCondition(CANTREF_GUARD, 'Gehaltene Speerlinie', 'self', {}, 'next-start')
      ] })];
    }
  }
  if (phase === 'pre-secondary-save' && role === 'actor' && primary && paid && style === 'drachentanz' && isEnemy(context)
    && (save.grip || save.position) && !save.disarm && !save.prone && !state.saveContext?.failureCondition?.blockedResource) {
    const used = passiveUsedValues(context, 'spear-save');
    if (used.length < (level >= 18 ? 2 : 1)) return [passiveRule(context, 'spear-save', used.length ? 18 : 7, {
      signature: encodeURIComponent(target.characterId), effects: { spellSaveDcModifier: 1 }
    })];
  }
  if (!activeCondition(self, CANTREF_GUARD)) return [];
  if (phase === 'pre-secondary-save' && role === 'target' && (save.prone || save.movement)) {
    return [passiveRule(context, 'stand', 16, { effects: { savingThrowModifier: 1 } })];
  }
  return phase === 'pre-hit-damage' ? cantrefGuardRules(context) : [];
}
