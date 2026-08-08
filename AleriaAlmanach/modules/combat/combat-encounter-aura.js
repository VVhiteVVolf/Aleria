import { normalizeRuntimeCondition } from './combat-condition-duration.js?v=20260807-rhiannon-v1';
import { getAuraTargetMechanics } from './combat-profile-model.js?v=20260808-duncan-v1';

const NUMERIC_MECHANIC_KEYS = Object.freeze([
  'attack', 'damage', 'armorClass', 'initiative', 'skill', 'savingThrow',
  'spellAttack', 'spellSaveDc', 'movement', 'maximumHitPoints',
  'combatStartTemporaryHitPoints', 'passivePerception'
]);

function text(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

function number(value, fallback = 0, minimum = -9999, maximum = 9999) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, parsed));
}

function normalizeMechanics(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    ...Object.fromEntries(NUMERIC_MECHANIC_KEYS.map(key => [
      key,
      number(source[key], 0, key === 'combatStartTemporaryHitPoints' ? 0 : -9999, 9999)
    ])),
    attackRollMode: ['advantage', 'disadvantage'].includes(source.attackRollMode)
      ? source.attackRollMode
      : 'normal',
    bonusDamageFormula: text(source.bonusDamageFormula, 40),
    savingThrowAdvantageAttributes: (Array.isArray(source.savingThrowAdvantageAttributes)
      ? source.savingThrowAdvantageAttributes
      : []).map(value => text(value, 20)).filter(Boolean),
    savingThrowDisadvantageAttributes: (Array.isArray(source.savingThrowDisadvantageAttributes)
      ? source.savingThrowDisadvantageAttributes
      : []).map(value => text(value, 20)).filter(Boolean)
  };
}

function relationshipBetween(source = {}, target = {}) {
  const sourceParty = text(source.partyId, 100);
  const targetParty = text(target.partyId, 100);
  if (!sourceParty || !targetParty || sourceParty === 'neutral' || targetParty === 'neutral') return '';
  return sourceParty === targetParty ? 'ally' : 'enemy';
}

function hasOngoingMechanics(mechanics = {}) {
  return NUMERIC_MECHANIC_KEYS
    .filter(key => key !== 'combatStartTemporaryHitPoints')
    .some(key => Number(mechanics[key]) !== 0)
    || mechanics.attackRollMode !== 'normal'
    || Boolean(mechanics.bonusDamageFormula)
    || mechanics.savingThrowAdvantageAttributes.length > 0
    || mechanics.savingThrowDisadvantageAttributes.length > 0;
}

export function normalizeCombatEncounterAuraApplication(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const relation = source.relation === 'ally' ? 'ally' : 'enemy';
  const mechanics = normalizeMechanics(source.mechanics);
  return {
    id: text(source.id || `encounter-aura-${index + 1}`, 180),
    encounterId: text(source.encounterId, 180),
    sourceActorId: text(source.sourceActorId, 180),
    sourceActorName: text(source.sourceActorName, 180),
    targetActorId: text(source.targetActorId, 180),
    targetActorName: text(source.targetActorName, 180),
    relation,
    auraName: text(source.auraName || 'Aura', 160),
    mechanics,
    temporaryHitPoints: number(
      source.temporaryHitPoints ?? mechanics.combatStartTemporaryHitPoints,
      0,
      0,
      9999
    ),
    grantTemporaryHitPoints: source.grantTemporaryHitPoints === true
  };
}

export function buildCombatEncounterAuraApplications(participants = [], options = {}) {
  const active = (Array.isArray(participants) ? participants : [])
    .filter(participant => participant?.status === 'active' && participant?.profile);
  const grantAll = options.grantAllTemporaryHitPoints === true;
  const grantSourceIds = new Set((options.grantTemporaryHitPointSourceIds || []).map(String));
  const grantTargetIds = new Set((options.grantTemporaryHitPointTargetIds || []).map(String));
  const encounterId = text(options.encounterId, 180);
  const applications = [];

  active.forEach(source => {
    if (!source.profile?.aura?.enabled) return;
    active.forEach(target => {
      if (String(source.actorId) === String(target.actorId)) return;
      const relation = relationshipBetween(source, target);
      if (!relation) return;
      // Ein numerischer Radius braucht eine echte Distanz und wird deshalb ohne Positionsdaten
      // nicht globalisiert. Textuelle Reichweiten wie "Kampfszene" sind bewusst szenenweit.
      const mechanics = normalizeMechanics(getAuraTargetMechanics(source.profile, { relation }));
      const temporaryHitPoints = Number(mechanics.combatStartTemporaryHitPoints) || 0;
      if (!hasOngoingMechanics(mechanics) && temporaryHitPoints <= 0) return;
      const sourceActorId = text(source.actorId, 180);
      const targetActorId = text(target.actorId, 180);
      applications.push(normalizeCombatEncounterAuraApplication({
        id: `${encounterId}:aura:${sourceActorId}:${targetActorId}`,
        encounterId,
        sourceActorId,
        sourceActorName: source.name,
        targetActorId,
        targetActorName: target.name,
        relation,
        auraName: source.profile.aura.name,
        mechanics,
        temporaryHitPoints,
        grantTemporaryHitPoints: grantAll || grantSourceIds.has(sourceActorId) || grantTargetIds.has(targetActorId)
      }, applications.length));
    });
  });
  return applications;
}

function isEncounterAuraCondition(condition = {}, encounterId = '') {
  return condition?.encounterAura === true
    && (!encounterId || String(condition?.durationModel?.encounterId || '') === String(encounterId));
}

function makeAuraCondition(application) {
  const mechanics = {
    ...application.mechanics,
    combatStartTemporaryHitPoints: 0
  };
  if (!hasOngoingMechanics(mechanics)) return null;
  return normalizeRuntimeCondition({
    id: application.id,
    name: `${application.auraName} · ${application.sourceActorName}`,
    source: application.sourceActorName,
    description: application.relation === 'ally'
      ? `Kampfgebundener Verbündeteneffekt von ${application.auraName}.`
      : `Kampfgebundener Gegnereffekt von ${application.auraName}.`,
    active: true,
    encounterAura: true,
    auraSourceActorId: application.sourceActorId,
    tags: 'Aura · Kampfpräsenz',
    duration: 'Bis zum Kampfende oder bis die Auraquelle ausscheidet',
    durationModel: {
      kind: 'combat',
      encounterId: application.encounterId,
      label: 'Kampfgebundene Aura'
    },
    mechanics
  });
}

function normalizeAuraTemporaryHitPointTracker(value = {}, encounterId = '') {
  const source = value && typeof value === 'object' ? value : {};
  if (!source.encounterId || String(source.encounterId) !== String(encounterId)) return null;
  return {
    encounterId: text(source.encounterId, 180),
    baseline: number(source.baseline, 0, 0, 9999),
    sources: (Array.isArray(source.sources) ? source.sources : [])
      .map(entry => ({
        sourceActorId: text(entry?.sourceActorId, 180),
        maximum: number(entry?.maximum, 0, 0, 9999)
      }))
      .filter(entry => entry.sourceActorId && entry.maximum > 0)
  };
}

function reconcileAuraTemporaryHitPoints(state = {}, applications = [], encounterId = '') {
  const previousTemporary = number(state.temporary, 0, 0, 9999);
  const previousTracker = normalizeAuraTemporaryHitPointTracker(state.encounterAuraTemporaryHitPoints, encounterId);
  const previousPeak = Math.max(0, ...(previousTracker?.sources || []).map(entry => entry.maximum));
  const nextSources = [...new Map(applications
    .filter(application => application.temporaryHitPoints > 0)
    .map(application => [application.sourceActorId, {
      sourceActorId: application.sourceActorId,
      maximum: application.temporaryHitPoints
    }])).values()];
  const nextPeak = Math.max(0, ...nextSources.map(entry => entry.maximum));
  const baseline = previousTracker?.baseline ?? previousTemporary;
  const adjustedTemporary = previousTracker
    ? (previousTemporary > previousPeak
      ? previousTemporary
      : Math.min(previousTemporary, Math.max(baseline, nextPeak)))
    : previousTemporary;
  const grantedPeak = Math.max(0, ...applications
    .filter(application => application.grantTemporaryHitPoints)
    .map(application => application.temporaryHitPoints));
  return {
    temporary: Math.max(adjustedTemporary, grantedPeak),
    tracker: nextSources.length ? { encounterId, baseline, sources: nextSources } : null
  };
}

export function applyCombatEncounterAuraApplicationsToStateMap(states, event = {}) {
  if (!(states instanceof Map)) return states;
  const encounterId = text(event.encounterId, 180);
  const applications = (Array.isArray(event.auraApplications) ? event.auraApplications : [])
    .map(normalizeCombatEncounterAuraApplication);
  applications.forEach(application => {
    if (application.targetActorId && !states.has(application.targetActorId)) {
      states.set(application.targetActorId, {});
    }
  });
  states.forEach((state, actorId) => {
    const conditions = (Array.isArray(state?.temporaryConditions) ? state.temporaryConditions : [])
      .filter(condition => !isEncounterAuraCondition(condition, encounterId));
    const targetApplications = applications.filter(application => application.targetActorId === String(actorId));
    const temporaryHitPoints = reconcileAuraTemporaryHitPoints(state, targetApplications, encounterId);
    const nextState = {
      ...state,
      temporaryConditions: conditions,
      temporary: temporaryHitPoints.temporary
    };
    if (temporaryHitPoints.tracker) {
      nextState.encounterAuraTemporaryHitPoints = temporaryHitPoints.tracker;
    } else {
      delete nextState.encounterAuraTemporaryHitPoints;
    }
    states.set(actorId, nextState);
  });

  applications.forEach(application => {
    if (!application.targetActorId) return;
    const previous = states.get(application.targetActorId) || {};
    const conditions = Array.isArray(previous.temporaryConditions)
      ? previous.temporaryConditions.slice()
      : [];
    const condition = makeAuraCondition(application);
    if (condition) conditions.push(condition);
    states.set(application.targetActorId, {
      ...previous,
      temporaryConditions: conditions
    });
  });
  return states;
}

export const combatEncounterAuraInternals = Object.freeze({
  NUMERIC_MECHANIC_KEYS,
  normalizeMechanics,
  relationshipBetween,
  hasOngoingMechanics,
  isEncounterAuraCondition,
  makeAuraCondition,
  normalizeAuraTemporaryHitPointTracker,
  reconcileAuraTemporaryHitPoints
});
