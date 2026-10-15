import { parseDamageFormula } from '../combat/rules/combat-mvp-rules.js';
import { applyTypedCombatDamage, applyCombatHealing, applyTemporaryHitPoints } from '../combat/combat-effect-model.js';
import { normalizeCombatHitPointState, applyCombatResourceCosts } from '../combat/combat-state-model.js';
import { createManualCombatCondition, buildCombatStatusChange } from '../combat-status/combat-status-model.js?v=20261015-graded-challenges-v1';
import { resolveCombatConcentration } from '../combat/combat-concentration-resolution.js';
export { applyChallengeCombatSnapshots } from './herausforderung-combat-snapshots.js';

export const MAX_CHALLENGE_COMBAT_EFFECTS = 8;
export const CHALLENGE_COMBAT_EFFECT_TYPES = Object.freeze([
  ['damage', 'Schaden'], ['healing', 'Heilung'], ['temporary-hit-points', 'Temporäre TP'],
  ['restore-resource', 'Ressource auffüllen'], ['spend-resource', 'Ressource entziehen'], ['remove-condition', 'Zustand entfernen']
]);
const copy = value => structuredClone(value);
const text = (value, max = 180) => String(value || '').trim().slice(0, max);
export const normalizeChallengeRecipient = value => ({ targetActorId: text(value?.targetActorId, 240) });

export function normalizeChallengeCombatEffects(values = []) {
  return (Array.isArray(values) ? values : []).slice(0, MAX_CHALLENGE_COMBAT_EFFECTS).map(effect => ({
    effectId: text(effect?.effectId, 40), type: text(effect?.type, 50), ...normalizeChallengeRecipient(effect),
    amount: Number(effect?.amount ?? 0), formula: text(effect?.formula, 80), damageType: text(effect?.damageType || 'physisch', 100),
    magical: effect?.magical === true, resourceId: text(effect?.resourceId, 160), conditionId: text(effect?.conditionId, 180)
  }));
}

export function validateChallengeCombatEffects(values = []) {
  if (!Array.isArray(values)) return 'Kampfwirkungen müssen eine Liste sein.';
  if (values.length > MAX_CHALLENGE_COMBAT_EFFECTS) return 'Höchstens acht direkte Kampfwirkungen pro Ergebnis.';
  const ids = new Set();
  for (const effect of values) {
    if (!effect || typeof effect !== 'object' || !effect.effectId || String(effect.effectId).length > 40 || ids.has(effect.effectId)) return 'Jede Kampfwirkung benötigt eine eigene Kennung mit höchstens 40 Zeichen.';
    ids.add(effect.effectId);
    if (!CHALLENGE_COMBAT_EFFECT_TYPES.some(([type]) => type === effect.type)) return 'Diese Kampfwirkung wird nicht unterstützt.';
    const amount = Number(effect.amount ?? 0);
    if (!Number.isInteger(amount) || amount < 0 || amount > 10000) return 'Kampfwerte müssen ganze Zahlen von 0 bis 10.000 sein.';
    if (effect.formula) {
      if (!['damage', 'healing', 'temporary-hit-points'].includes(effect.type)) return 'Würfelformeln gelten nur für Schaden, Heilung und temporäre TP.';
      try { const parsed = parseDamageFormula(effect.formula); if (Math.abs(parsed.fixedModifier) > 10000) return 'Der feste Würfelbonus ist zu groß.'; }
      catch (error) { return error.message; }
      if (amount) return 'Entweder einen festen Betrag oder eine Würfelformel angeben.';
    } else if (effect.type !== 'remove-condition' && amount < 1) return 'Für eine Kampfwirkung einen positiven Betrag oder eine Würfelformel angeben.';
    if (['restore-resource', 'spend-resource'].includes(effect.type) && !text(effect.resourceId)) return 'Eine Ressource auswählen.';
    if (effect.type === 'remove-condition' && !text(effect.conditionId)) return 'Den zu entfernenden Zustand auswählen.';
    if (effect.targetActorId != null && (typeof effect.targetActorId !== 'string' || effect.targetActorId.length > 240)) return 'Der Empfänger der Kampfwirkung ist ungültig.';
  }
  return null;
}

function recipientState(profile, state = {}) {
  return { ...normalizeCombatHitPointState(state, { current: profile.currentHitPoints, maximum: profile.maximumHitPoints, temporary: profile.temporaryHitPoints }),
    ...(Object.hasOwn(state, 'concentration') || profile.concentration ? { concentration: Object.hasOwn(state, 'concentration') ? state.concentration : profile.concentration } : {}),
    ...(Object.hasOwn(state, 'channeling') || profile.channeling ? { channeling: Object.hasOwn(state, 'channeling') ? state.channeling : profile.channeling } : {}),
    resources: copy(state.resources || profile.resources || []), temporaryConditions: copy(state.temporaryConditions || profile.temporaryConditions || []) };
}

// The caller supplies authoritative profiles and dice. Damage, equipment guards,
// affinities, healing caps and condition ownership remain combat responsibilities.
export async function applyChallengeCombatBenefits({ actorId, benefits = {}, recipients, identity, encounterId = '', dice }) {
  const error = validateChallengeCombatEffects(benefits.combatEffects || []);
  if (error) throw Error(error);
  const contexts = new Map(), results = [], saves = [];
  const getContext = effect => {
    const id = effect.targetActorId || actorId;
    if (!contexts.has(id)) {
      const recipient = recipients.get(id);
      if (!recipient) throw Error('Der Empfänger der Kampfwirkung ist nicht verfügbar.');
      const state = recipientState(recipient.profile, recipient.state);
      contexts.set(id, { ...recipient, actorId: id, state, before: copy(state) });
    }
    return contexts.get(id);
  };
  for (const effect of benefits.effects || []) {
    const context = getContext(effect);
    if (effect.durationKind === 'combat' && !encounterId) throw Error('Ein Effekt bis Kampfende benötigt einen aktiven Kampf.');
    const condition = createManualCombatCondition({ ...effect, source: 'Herausforderung' }, { id: `reward:${identity}:${effect.effectId}`, encounterId });
    context.state.temporaryConditions = buildCombatStatusChange({ operation: 'add', profile: context.profile, state: context.state, condition }).temporaryConditions;
    results.push({ effectId: effect.effectId, type: effect.kind, actorId: context.actorId, actorName: context.profile.name, condition });
  }
  for (const effect of benefits.combatEffects || []) {
    const context = getContext(effect);
    let roll = null, amount = effect.amount || 0;
    if (effect.formula) {
      if (!dice?.rollDamage) throw Error('Der Würfelbeleg der Kampfwirkung fehlt.');
      const value = await dice.rollDamage({ damageFormula: effect.formula, critical: false, actorName: context.profile.name, targetName: context.profile.name, effectType: effect.type });
      amount = value.total;
      roll = { notation: value.notation || parseDamageFormula(effect.formula).notation, diceResults: value.dice || value.keptDice, modifier: value.modifier || 0, total: value.total, rollId: value.id || '' };
    }
    let applied;
    if (effect.type === 'damage') {
      applied = applyTypedCombatDamage(context.state, amount, context.profile, { damageType: effect.damageType, magical: effect.magical, conditions: context.state.temporaryConditions });
      Object.assign(context.state, applied.after, { temporaryConditions: applied.conditions });
      const previousConditionIds = new Set((context.profile.temporaryConditions || []).map(condition => condition.id));
      const profile = { ...context.profile, concentration: context.state.concentration,
        conditions: [...(context.profile.conditions || []).filter(condition => !previousConditionIds.has(condition.id)), ...context.state.temporaryConditions] };
      const concentration = await resolveCombatConcentration({ profile,
        counterpart: recipients.get(actorId)?.profile || profile, hitPoints: context.state, conditions: context.state.temporaryConditions,
        damage: applied.incoming || 0, dice, allowResultEffects: false,
        context: { actorId, actionKind: 'skill', profileActionId: '', ruleSources: [], rulePeriods: {}, usedRuleFrequencyKeys: new Set(), attack: {} } });
      if (concentration.snapshot) { context.state.concentration = concentration.snapshot.after; context.state.temporaryConditions = concentration.conditions; }
      saves.push(...concentration.saves);
      if (context.state.current <= 0 && context.state.channeling) context.state.channeling = null;
    } else if (effect.type === 'healing' || effect.type === 'temporary-hit-points') {
      applied = effect.type === 'healing' ? applyCombatHealing(context.state, amount) : applyTemporaryHitPoints(context.state, amount);
      Object.assign(context.state, applied.after);
    } else if (['restore-resource', 'spend-resource'].includes(effect.type)) {
      const resource = context.state.resources.find(item => item.id === effect.resourceId);
      if (!resource) throw Error('Die gewählte Ressource gehört nicht zum Empfänger.');
      const before = Number(resource.current) || 0;
      if (effect.type === 'restore-resource') resource.current = Math.min(Number(resource.maximum) || 0, before + amount);
      else context.state.resources = applyCombatResourceCosts(context.state.resources, [{ resourceId: resource.id, amount: Math.min(before, amount), scope: resource.scope }]).after;
      applied = { resourceId: resource.id, resourceName: resource.name, before, after: context.state.resources.find(item => item.id === resource.id).current };
    } else if (effect.type === 'remove-condition') {
      const condition = context.state.temporaryConditions.find(item => item.id === effect.conditionId);
      context.state.temporaryConditions = buildCombatStatusChange({ operation: 'remove', profile: context.profile, state: context.state, conditionId: effect.conditionId }).temporaryConditions;
      applied = { conditionId: effect.conditionId, name: condition?.name };
    }
    results.push({ effectId: effect.effectId, type: effect.type, actorId: context.actorId, actorName: context.profile.name, amount, damageType: effect.damageType, magical: effect.magical, roll, applied });
  }
  const snapshots = [...contexts.values()].map(context => ({ actorId: context.actorId, actorName: context.profile.name,
    before: context.before, after: copy(context.state) }));
  return { results, snapshots, encounterId, saves };
}

export function formatChallengeCombatResult(result) {
  const target = result.actorName || 'Figur';
  const applied = result.applied || {};
  if (result.type === 'damage') return `${target}: ${applied.incoming || 0} ${result.damageType}-Schaden (${applied.hitPointDamage || 0} TP, ${applied.absorbedByTemporary || 0} temporäre TP)`;
  if (result.type === 'healing') return `${target}: ${applied.restored || 0} TP geheilt`;
  if (result.type === 'temporary-hit-points') return `${target}: ${applied.granted || 0} temporäre TP erhalten`;
  if (result.type === 'remove-condition') return `${target}: ${applied.name || 'Zustand'} entfernt`;
  if (['restore-resource', 'spend-resource'].includes(result.type)) return `${target}: ${applied.resourceName || applied.resourceId} ${applied.before} → ${applied.after}`;
  return `${target}: ${result.condition?.name || 'Zustand'}`;
}
