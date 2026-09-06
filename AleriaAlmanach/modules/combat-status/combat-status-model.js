import { normalizeRuntimeCondition } from '../combat/combat-condition-duration.js?v=20260906-character-vitality-v1';
import { COMBAT_STATUS_PRESETS, STATUS_MODIFIERS } from './combat-status-catalog.js';

export const STATUS_DURATIONS = Object.freeze([
  ['actor-comments', 'Eigene Beiträge'], ['scene-comments', 'Szenenbeiträge'],
  ['combat', 'Bis zum Kampfende'], ['short-rest', 'Bis zur nächsten Rast'],
  ['long-rest', 'Bis zur langen Rast'], ['day', 'Bis zum nächsten Szenentag'], ['permanent', 'Bis zum Entfernen']
]);
const clean = (value, maximum = 160) => String(value || '').trim().slice(0, maximum);

export function createManualCombatCondition(value = {}, { id, encounterId = '' } = {}) {
  const preset = COMBAT_STATUS_PRESETS.find(item => item.id === value.presetId);
  const name = clean(value.name || preset?.name);
  if (!name) throw new Error('Gib dem Zustand einen Namen.');
  const kind = value.durationKind || 'actor-comments';
  if (!STATUS_DURATIONS.some(([key]) => key === kind)) throw new Error('Wähle eine gültige Dauer.');
  const amount = Number(value.durationAmount);
  if (['actor-comments', 'scene-comments'].includes(kind) && (!Number.isInteger(amount) || amount < 1 || amount > 999)) {
    throw new Error('Die Dauer muss zwischen 1 und 999 Beiträgen liegen.');
  }
  const mechanics = {};
  for (const [key] of STATUS_MODIFIERS) {
    const modifier = Number(value.mechanics?.[key] || 0);
    if (!Number.isInteger(modifier) || Math.abs(modifier) > 30) throw new Error('Boni und Mali müssen ganze Zahlen zwischen −30 und +30 sein.');
    if (modifier) mechanics[key] = modifier;
  }
  return normalizeRuntimeCondition({
    id: clean(id, 180), name, active: true, source: clean(value.source || 'Manuell vergeben'),
    presetId: preset?.id || '', statusKind: ['buff', 'debuff', 'condition'].includes(value.kind) ? value.kind : preset?.kind || 'condition',
    description: clean(value.description || preset?.description, 1600), mechanics, manual: true,
    durationModel: { kind, amount, encounterId: kind === 'combat' ? encounterId : '' }
  });
}

export function formatStatusDuration(condition = {}) {
  const duration = normalizeRuntimeCondition(condition).durationModel;
  if (duration.kind === 'actor-comments') return duration.remainingActorComments === 1 ? '1 eigener Beitrag' : `${duration.remainingActorComments} eigene Beiträge`;
  if (duration.kind === 'scene-comments') return duration.remainingSceneComments === 1 ? '1 Szenenbeitrag' : `${duration.remainingSceneComments} Szenenbeiträge`;
  if (duration.kind === 'concentration') return 'Konzentration';
  if (duration.kind === 'channeling') return 'Kanalisierung';
  return STATUS_DURATIONS.find(([key]) => key === duration.kind)?.[1] || condition.duration || 'Bis zum Entfernen';
}

export function buildCombatStatusChange({ operation, profile, state = {}, condition, conditionId, resetState } = {}) {
  const conditions = (state.temporaryConditions || profile.temporaryConditions || []).map(normalizeRuntimeCondition).filter(item => item.active);
  if (operation === 'add') {
    if (conditions.length >= 60) throw new Error('Es sind bereits 60 temporäre Effekte aktiv. Entferne zuerst einen Effekt.');
    return { temporaryConditions: [...conditions, condition] };
  }
  if (operation === 'remove') {
    const existing = conditions.find(item => item.id === conditionId);
    if (!existing) throw new Error('Dieser temporäre Effekt ist nicht mehr aktiv.');
    // Encounter auras are owned by the encounter, not by this editor.
    if (existing.encounterAura === true || existing.sourceKind === 'encounter-aura' || String(existing.id).startsWith('encounter-aura:')) {
      throw new Error('Diese Aura wird durch die Kampfliste verwaltet.');
    }
    return { temporaryConditions: conditions.filter(item => item.id !== conditionId) };
  }
  if (operation === 'reset' && resetState) return {
    current: resetState.hitPoints.current, maximum: resetState.hitPoints.maximum, temporary: 0,
    resources: resetState.resources.map(resource => ({ ...resource, current: resource.maximum })),
    abilities: resetState.abilities.map(ability => ({ ...ability, usesCurrent: ability.usesMaximum })), temporaryConditions: [], concentration: null, channeling: null,
    encounterAuraTemporaryHitPoints: null
  };
  throw new Error('Unbekannte Zustandsänderung.');
}

export function applyCombatStatusCommentToStateMap(states, comment = {}) {
  if (comment.serverValidatedMechanics !== true || comment.importedHistoricalMechanics === true) return false;
  const event = comment.combatStatus;
  if (!event?.actorId || !event.after || !['add', 'remove', 'reset'].includes(event.operation)) return false;
  const actorId = String(event.actorId);
  states.set(actorId, { ...(states.get(actorId) || {}), ...event.after });
  return true;
}
