import { randomUUID } from 'node:crypto';
import { HttpsError } from 'firebase-functions/v2/https';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { SkillResolutionService } from '../generated/skill-checks/skill-resolution-service.js';
import {
  collectRecentSkillChallenges,
  collectRevealedChallengeIds,
  getSkillsForCommentKind,
  normalizeSkillCheckSettings
} from '../generated/skill-checks/skill-check-model.js';
import { ProvidedDiceAdapter } from './provided-dice-adapter.js';

const EDIT_ROLES = new Set(['editor', 'moderator', 'admin']);
const RECORD_KINDS = new Set(['character', 'creature']);

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

function normalizePersistence(value = {}, actorId = '') {
  const kind = clean(value?.kind, 40);
  if (RECORD_KINDS.has(kind) && value.recordId) {
    if (String(actorId) !== String(value.recordId)) fail('failed-precondition', 'Figuren-ID und Profilquelle stimmen nicht \u00fcberein.');
    return { kind, recordId: clean(value.recordId, 240), persistent: true };
  }
  if (kind === 'scene-creature' && value.sourceCreatureId) {
    return { kind: 'creature', recordId: clean(value.sourceCreatureId, 240), persistent: false };
  }
  fail('failed-precondition', 'Der Fertigkeitsversuch besitzt keine serverseitig pr\u00fcfbare Profilquelle.');
}

function canControl(record, persistence, request) {
  if (EDIT_ROLES.has(String(request.auth?.token?.aleriaRole || ''))) return true;
  if (persistence.kind === 'creature') return true;
  const uid = String(request.auth?.uid || '');
  return String(record.ownerUid || record.createdBy || '') === uid
    || (Array.isArray(record.controllerUids) && record.controllerUids.includes(uid));
}

function makeActor(record, persistence, actorId) {
  return { ...record, id: String(actorId), entityType: persistence.kind === 'creature' ? 'creature' : 'character' };
}

export function skillSegments(metadata = {}) {
  return (Array.isArray(metadata?.commentSegments) ? metadata.commentSegments : [])
    .map((segment, index) => ({ segment, index, submitted: segment?.skillResolution }))
    .filter(entry => entry.submitted?.resolutionId);
}

export async function validateSkillCommentSegments({
  database,
  transaction,
  request,
  metadata,
  history = [],
  rulePeriods = {},
  usedRuleFrequencyKeys = new Set()
} = {}) {
  const entries = skillSegments(metadata);
  if (!entries.length) return {
    commentSegments: Array.isArray(metadata?.commentSegments) ? metadata.commentSegments : [],
    usedRuleFrequencyKeys
  };
  const descriptors = entries.map(entry => ({
    actorId: clean(entry.submitted.actorId, 240),
    persistence: normalizePersistence(entry.submitted.actorPersistence, entry.submitted.actorId)
  }));
  const recordEntries = [...new Map(descriptors.map(descriptor => {
    const key = `${descriptor.persistence.kind}:${descriptor.persistence.recordId}`;
    return [key, {
      key,
      ...descriptor.persistence,
      ref: database.collection(descriptor.persistence.kind === 'creature' ? 'creatures' : 'characters').doc(descriptor.persistence.recordId)
    }];
  })).values()];
  const snapshots = await Promise.all(recordEntries.map(entry => transaction.get(entry.ref)));
  const records = new Map();
  recordEntries.forEach((entry, index) => {
    if (!snapshots[index].exists) fail('not-found', 'Das Profil eines Fertigkeitsversuchs wurde nicht gefunden.');
    records.set(entry.key, snapshots[index].data() || {});
  });

  const challenges = collectRecentSkillChallenges(history, 3);
  const revealed = collectRevealedChallengeIds(history);
  const enhanced = (Array.isArray(metadata?.commentSegments) ? metadata.commentSegments : []).map(segment => ({ ...segment }));
  let usedKeys = usedRuleFrequencyKeys instanceof Set ? new Set(usedRuleFrequencyKeys) : new Set();

  for (const entry of entries) {
    const descriptor = descriptors[entries.indexOf(entry)];
    const record = records.get(`${descriptor.persistence.kind}:${descriptor.persistence.recordId}`);
    if (!canControl(record, descriptor.persistence, request)) fail('permission-denied', 'Du darfst diese Figur nicht f\u00fcr einen Fertigkeitsversuch einsetzen.');
    const allowed = getSkillsForCommentKind(entry.segment.commentKind || entry.segment.kind);
    const settings = normalizeSkillCheckSettings({
      skillId: entry.segment.skillId || entry.submitted.skillId,
      customModifier: entry.segment.skillCustomModifier ?? entry.submitted.customModifier,
      difficulty: entry.segment.skillDifficulty ?? entry.submitted.difficulty,
      rollMode: entry.segment.skillRollMode || entry.submitted.rollMode,
      targetChallengeId: entry.segment.skillTargetChallengeId || entry.submitted.targetChallengeId
    });
    if (!allowed.some(skill => skill.id === settings.skillId)) fail('failed-precondition', 'Die Fertigkeit passt nicht zur gew\u00e4hlten Blase.');
    const challenge = settings.targetChallengeId
      ? challenges.find(item => item.id === settings.targetChallengeId && !revealed.has(item.id))
      : null;
    if (settings.targetChallengeId && !challenge) fail('failed-precondition', 'Die verdeckte Herausforderung ist nicht mehr aufl\u00f6sbar.');
    const actor = makeActor(record, descriptor.persistence, descriptor.actorId);
    const profile = resolveCombatProfile(actor);
    const service = new SkillResolutionService(new ProvidedDiceAdapter(entry.submitted));
    const resolution = await service.resolve({ actor, settings, challenge, actorPersistence: entry.submitted.actorPersistence }, {
      ruleSources: [{
        actorId: profile.characterId,
        actorName: profile.name,
        profile,
        sourceRole: 'actor',
        relationToActor: 'self',
        relationToTarget: 'enemy',
        distanceToActor: 0,
        distanceToTarget: null,
        selectedRuleIds: []
      }],
      rulePeriods,
      usedRuleFrequencyKeys: usedKeys
    });
    usedKeys = new Set(resolution.usedRuleFrequencyKeys || []);
    resolution.resolutionId = randomUUID();
    resolution.serverValidated = true;
    resolution.validatedAt = new Date().toISOString();
    resolution.actorProfileSnapshot = profile.aiSnapshot || null;
    resolution.originalAttempt = clean(entry.segment.text, 5000);
    resolution.targetContribution = clean(challenge?.visibleText, 5000);
    enhanced[entry.index] = { ...entry.segment, skillResolution: resolution };
  }
  return { commentSegments: enhanced, usedRuleFrequencyKeys: usedKeys };
}

export const skillCommentValidatorInternals = Object.freeze({ normalizePersistence, canControl });
