import { HttpsError } from 'firebase-functions/v2/https';
import { MAX_COMBAT_PHASE, PHASE_CONDITION_DURATIONS } from '../generated/combat-phase-counter/combat-phase-model.js';
import { COMBAT_STATUS_PRESETS } from '../generated/combat-status/combat-status-catalog.js';

export function validateCombatPhaseSettings(value, participants, activePhase, scheduledChallenges, previous) {
  const validPhase = phase => Number.isInteger(phase) && phase >= 1 && phase <= MAX_COMBAT_PHASE;
  const invalid = message => { throw new HttpsError('invalid-argument', message); };
  if (!validPhase(value?.firstPhase) || (activePhase && value.firstPhase !== previous.firstPhase)) invalid('Wähle eine gültige erste Phase vor dem Start.');
  if (!validPhase(value?.lastPhase) || value.lastPhase < Math.max(activePhase, value.firstPhase)) invalid(`Die letzte Phase muss zwischen ${Math.max(value.firstPhase, activePhase)} und ${MAX_COMBAT_PHASE} liegen.`);
  if (scheduledChallenges.some(challenge => challenge.state === 'armed' && (challenge.phase < value.firstPhase || challenge.phase > value.lastPhase))) invalid('Ein vorbereiteter Eintrag liegt außerhalb des Phasenbereichs.');
  if (typeof value.renewActions !== 'boolean' || typeof value.phaseConditions !== 'boolean' || !Array.isArray(value.steps)
    || value.steps.length > MAX_COMBAT_PHASE) invalid('Die Zählereinstellungen sind unvollständig.');
  const phases = new Set();
  const steps = value.steps.map(step => {
    if (!validPhase(step?.phase) || step.phase < value.firstPhase || step.phase > value.lastPhase || step.phase <= activePhase || phases.has(step.phase)) {
      invalid('Verwende für jeden vorbereiteten Eintrag eine eigene kommende Phase.');
    }
    phases.add(step.phase);
    if (typeof step.flavor !== 'string' || step.flavor.length > 1600) invalid('Der Phasentext darf höchstens 1600 Zeichen haben.');
    if (!Array.isArray(step.conditions) || step.conditions.length > 8) invalid('Pro Phase sind bis zu acht Zustände möglich.');
    const previousConditions = previous.steps?.find(item => item.phase === step.phase)?.conditions || [];
    const conditions = step.conditions.map(condition => {
      if (!condition || (!participants.has(condition.actorId) && !previousConditions.some(item => item.actorId === condition.actorId))
        || !COMBAT_STATUS_PRESETS.some(preset => preset.id === condition.presetId && !preset.sceneMinutes)
        || !Object.hasOwn(PHASE_CONDITION_DURATIONS, condition.durationKind)) invalid('Wähle eine Kampffigur, eine Zustandsvorlage und die Dauer.');
      if (condition.durationKind === 'actor-comments'
        && (!Number.isInteger(condition.durationAmount) || condition.durationAmount < 1 || condition.durationAmount > 999)) {
        invalid('Die Zustandsdauer muss zwischen 1 und 999 liegen.');
      }
      return { actorId: condition.actorId, presetId: condition.presetId, durationKind: condition.durationKind,
        durationAmount: condition.durationKind === 'actor-comments' ? condition.durationAmount : 0 };
    });
    return { phase: step.phase, flavor: step.flavor.trim(), conditions };
  });
  return { firstPhase: value.firstPhase, lastPhase: value.lastPhase, renewActions: value.renewActions, phaseConditions: value.phaseConditions,
    steps: steps.filter(step => step.flavor || step.conditions.length).sort((a, b) => a.phase - b.phase) };
}
