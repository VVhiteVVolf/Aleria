import { SUBSTANCE_PROFILES, getSubstanceIcon } from './substance-profiles.js';
import { getSubstanceTolerance, getAlcoholSensitivity } from './health-trait-policy.js';

const HOUR = 3600;
const idFor = (kind, phase, actorId) => `substance:${kind}:${phase}:${actorId}`;
const tiers = (amount, threshold) => amount >= threshold * 2.5 ? 3 : amount >= threshold * 1.5 ? 2 : 1;
function duration(sceneId, start, end, now = start) {
  return { kind: 'scene-time', sceneId: String(sceneId || ''), startedAtSeconds: start, expiresAtSeconds: end, remainingSeconds: Math.max(0, end - now) };
}
function hangoverCondition(condition, now) {
  const state = condition.substance, profile = SUBSTANCE_PROFILES[state.kind];
  const start = condition.durationModel.expiresAtSeconds, end = start + state.hangoverSeconds;
  if (now >= end) return null;
  return { id: idFor(state.kind, 'hangover', state.actorId), name: `Verkatert (${profile.name})`, active: true,
    presetId: 'hangover', source: profile.name, statusKind: 'debuff', icon: '/AleriaAlmanach/assets/development-traits/web/zustand-verkatert.webp',
    description: 'Nachwirkung: −1 auf Fertigkeiten und Initiative. Die Abhängigkeit ist dadurch nicht gelindert.',
    mechanics: { skill: -1, initiative: -1 }, substance: { ...state, phase: 'hangover' },
    durationModel: duration(condition.durationModel.sceneId, start, end, now) };
}
export function advanceSubstanceConditions(conditions = [], seconds, sceneId = '') {
  if (!Number.isFinite(seconds)) return conditions;
  return conditions.flatMap(condition => {
    const model = condition.durationModel;
    if (model?.kind !== 'scene-time' || model.sceneId && sceneId && model.sceneId !== sceneId) return [condition];
    const remainingSeconds = Math.max(0, Number(model.expiresAtSeconds) - seconds);
    if (remainingSeconds > 0) return [{ ...condition, durationModel: { ...model, remainingSeconds } }];
    if (condition.substance?.phase === 'intoxication') {
      const next = hangoverCondition(condition, seconds);
      return next ? [next] : [];
    }
    return [];
  });
}
export function advanceSubstanceStateMap(states, seconds, sceneId = '') {
  if (!Number.isFinite(seconds)) return states;
  states.forEach((state, id) => {
    if (state.temporaryConditions?.some(condition => condition.durationModel?.kind === 'scene-time')) states.set(id, {
      ...state, temporaryConditions: advanceSubstanceConditions(state.temporaryConditions, seconds, sceneId)
    });
  });
  return states;
}
export function createSubstanceIntoxication(kind, { actorId = 'manual', sceneId = '', seconds, minutes, load, peak, tolerance = 1 } = {}) {
  if (!Number.isFinite(seconds)) throw Error('Setze zuerst eine gültige interaktive Szenenzeit. Rausch verwendet keine reale Uhrzeit.');
  const profile = SUBSTANCE_PROFILES[kind];
  if (!profile) throw Error('Unbekanntes Rauschmittel.');
  const exposure = Math.max(profile.threshold, Number(load) || profile.threshold), maximum = Math.max(exposure, Number(peak) || exposure);
  const tier = tiers(maximum, profile.threshold * tolerance);
  const amount = minutes == null ? tier * profile.baseMinutes : Number(minutes);
  if (!Number.isInteger(amount) || amount < (kind === 'alcohol' ? 60 : 1) || amount > 180) throw Error('Die Rauschdauer muss bei Alkohol 60–180, sonst 1–180 Szenenminuten betragen.');
  return { id: idFor(kind, 'active', actorId), name: profile.stateName, active: true, statusKind: 'condition',
    presetId: kind === 'alcohol' ? 'drunk' : `${kind}-intoxication`, source: profile.name,
    icon: getSubstanceIcon(kind), description: profile.description, mechanics: structuredClone(profile.mechanics),
    substance: { version: 1, kind, phase: 'intoxication', actorId: String(actorId), load: exposure, peak: maximum, tolerance,
      atSeconds: seconds, hangoverSeconds: tiers(maximum, profile.threshold) * HOUR },
    durationModel: duration(sceneId, seconds, seconds + amount * 60) };
}
export function applySubstanceExposure(profile = {}, exposure, { actorId = '', sceneId = '', seconds } = {}) {
  if (!exposure) return { changed: false, conditions: profile.temporaryConditions || [] };
  if (!Number.isFinite(seconds)) throw Error('Setze zuerst die interaktive Szenenzeit, bevor ein Rauschmittel konsumiert wird.');
  const rules = SUBSTANCE_PROFILES[exposure.kind];
  if (!rules) throw Error('Dieses Rauschmittel hat noch kein Wirkprofil.');
  const conditions = advanceSubstanceConditions(profile.temporaryConditions || [], seconds, sceneId);
  const previous = conditions.find(condition => condition.id === idFor(exposure.kind, 'active', actorId));
  const tolerance = getSubstanceTolerance(profile, exposure.kind);
  const sensitivity = exposure.kind === 'alcohol' ? getAlcoholSensitivity(profile) : 1;
  const supplied = Number(exposure.amount) * sensitivity;
  if (!Number.isFinite(supplied) || supplied <= 0) throw Error('Die konsumierte Wirkmenge ist ungültig.');
  // Before intoxication a one-hour window prevents drinks on different days adding up.
  const oldLoad = previous?.substance?.phase === 'intoxication' ? previous.substance.load
    : previous?.substance && seconds - previous.substance.atSeconds < HOUR ? previous.substance.load : 0;
  const load = Math.min(1000000, oldLoad + supplied), threshold = rules.threshold * tolerance;
  const remaining = conditions.filter(condition => condition !== previous);
  if (load + 1e-8 < threshold) {
    const condition = { id: idFor(exposure.kind, 'active', actorId), name: `${rules.name} · Belastung ${Number(load.toFixed(2))}/${Number(threshold.toFixed(2))}`,
      active: true, statusKind: 'condition', source: rules.name, icon: getSubstanceIcon(exposure.kind), mechanics: {},
      description: 'Die Rauschschwelle ist noch nicht erreicht. Ein bestehender Kater und Entzug bleiben wirksam.',
      substance: { version: 1, kind: exposure.kind, phase: 'exposure', actorId, load, peak: load, tolerance, atSeconds: seconds },
      durationModel: duration(sceneId, previous?.substance?.phase === 'exposure' ? previous.durationModel.startedAtSeconds : seconds,
        (previous?.substance?.phase === 'exposure' ? previous.durationModel.startedAtSeconds : seconds) + HOUR) };
    return { changed: true, conditions: [...remaining, condition], condition };
  }
  const peak = Math.max(previous?.substance?.peak || 0, load);
  const condition = createSubstanceIntoxication(exposure.kind, { actorId, sceneId, seconds, load, peak, tolerance });
  if (previous?.substance?.phase === 'intoxication') condition.durationModel.expiresAtSeconds = Math.max(condition.durationModel.expiresAtSeconds, previous.durationModel.expiresAtSeconds);
  condition.durationModel.remainingSeconds = condition.durationModel.expiresAtSeconds - seconds;
  // Matching intoxication suspends its own aftereffect; other substances stay active.
  return { changed: true, conditions: [...remaining.filter(entry => entry.id !== idFor(exposure.kind, 'hangover', actorId)), condition], condition };
}
export function createSubstanceHangover({ actorId = 'manual', sceneId = '', seconds, minutes = 60 } = {}) {
  const initial = createSubstanceIntoxication('alcohol', { actorId, sceneId, seconds: seconds - HOUR, minutes: 60 });
  if (![60, 120, 180].includes(Number(minutes))) throw Error('Ein Kater dauert 60, 120 oder 180 Szenenminuten.');
  initial.substance.hangoverSeconds = minutes * 60;
  return hangoverCondition(initial, seconds);
}
