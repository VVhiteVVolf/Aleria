import { getSkillDefinition } from '../skill-checks/skill-check-model.js?v=20260928-equipment-art-v4';
import { normalizeHerausforderungBenefits, validateHerausforderungBenefits } from './herausforderung-rewards.js?v=20261014-herausforderung-combat-v1';
import { normalizeChallengeAudience, validateChallengeAudience } from './herausforderung-combat-context.js';
import { normalizeChallengeSceneImage, validateChallengeSceneImage } from './herausforderung-scene-image-model.js';

export const HERAUSFORDERUNG_EVENT_KIND = 'herausforderung-event';
export const HERAUSFORDERUNG_SCHEMA_VERSION = 5;
export const MIN_HERAUSFORDERUNG_APPROACHES = 1;
export const MAX_HERAUSFORDERUNG_APPROACHES = 6;
export const HERAUSFORDERUNG_NARROW_FAILURE_MARGIN = 3;
export const HERAUSFORDERUNG_PREFERRED_MODIFIER = 2;
export const HERAUSFORDERUNG_ALTERNATIVE_MODIFIER = -2;

// Used by both the authoring dialog and the server before normalization.
export function getHerausforderungValidationIssues(event = {}) {
  event = event && typeof event === 'object' ? event : {};
  const issues = [];
  const imageError = validateChallengeSceneImage(event.sceneImage);
  if (imageError) issues.push({ field: 'sceneImage', message: imageError });
  const audienceError = validateChallengeAudience(event.audience);
  if (audienceError) issues.push({ field: 'audience', message: audienceError });
  if (!String(event.publicDescription || '').trim()) issues.push({ field: 'publicDescription', message: 'Eine öffentliche Beschreibung ist erforderlich.' });
  const approaches = Array.isArray(event.approaches) ? event.approaches : [];
  if (!approaches.length) issues.push({ field: 'approaches', message: 'Mindestens ein Ansatz ist erforderlich.' });
  if (approaches.length > MAX_HERAUSFORDERUNG_APPROACHES) issues.push({ field: 'approaches', message: 'Höchstens sechs Ansätze sind erlaubt.' });
  const ids = new Set();
  approaches.forEach((approach, index) => {
    if (!Array.isArray(approach?.preferredSkills) || !approach.preferredSkills.some(skill => String(skill || '').trim())) issues.push({ index, field: 'preferredSkill', message: `Ansatz ${index + 1}: Mindestens eine passende Fertigkeit wählen.` });
    else if (approach.preferredSkills.some(skill => !getSkillDefinition(skill))) issues.push({ index, field: 'preferredSkill', message: `Ansatz ${index + 1}: Eine gültige Fertigkeit wählen.` });
    if (!String(approach?.insight || '').trim()) issues.push({ index, field: 'insight', message: `Ansatz ${index + 1}: Eine verdeckte Erkenntnis eintragen.` });
    const difficulty = Number(approach?.difficulty ?? 10);
    if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 40) issues.push({ index, field: 'difficulty', message: `Ansatz ${index + 1}: Schwierigkeit als ganze Zahl von 1 bis 40 eintragen.` });
    const id = text(approach?.approachId, 40);
    if (id && ids.has(id)) issues.push({ index, field: 'label', message: 'Jeder Ansatz benötigt eine eigene ID.' });
    if (id) ids.add(id);
    for (const field of ['rewards', 'partialEffects', 'failureEffects']) {
      const error = validateHerausforderungBenefits(approach?.[field], { effectsOnly: field !== 'rewards' });
      if (error) issues.push({ index, field, message: `Ansatz ${index + 1}: ${error}` });
    }
  });
  return issues;
}

function text(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

function integer(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

function makeApproachId() {
  return typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID().slice(0, 12)
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeHerausforderungApproach(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const preferredSkills = [...new Set((Array.isArray(source.preferredSkills) ? source.preferredSkills : [])
    .map(skillId => text(skillId, 60))
    .filter(Boolean))];
  return {
    approachId: text(source.approachId, 40) || makeApproachId(),
    label: text(source.label, 160) || `Ansatz ${index + 1}`,
    preferredSkills,
    difficulty: integer(source.difficulty, 10, 1, 40),
    insight: text(source.insight, 2000),
    partialHint: text(source.partialHint, 2000),
    failureConsequence: text(source.failureConsequence, 2000),
    rewards: normalizeHerausforderungBenefits(source.rewards),
    partialEffects: normalizeHerausforderungBenefits(source.partialEffects),
    failureEffects: normalizeHerausforderungBenefits(source.failureEffects)
  };
}

export function classifyHerausforderungOutcome({ natural = 0, total = 0, difficulty = 10, outcome = '' } = {}) {
  if (outcome === 'critical-success') return 'kritischer-erfolg';
  if (outcome === 'success') return 'erfolg';
  if (outcome === 'critical-failure') return 'deutlich';
  if (outcome === 'failure' && (Number(natural) === 20 || Number(total) >= Number(difficulty))) return 'deutlich';
  if (Number(natural) === 20) return 'kritischer-erfolg';
  if (Number(natural) === 1) return 'deutlich';
  if (Number(total) >= Number(difficulty)) return 'erfolg';
  const margin = Number(difficulty) - Number(total);
  return margin <= HERAUSFORDERUNG_NARROW_FAILURE_MARGIN ? 'knapp' : 'deutlich';
}

export function normalizeHerausforderungEvent(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const approaches = (Array.isArray(source.approaches) ? source.approaches : [])
    .slice(0, MAX_HERAUSFORDERUNG_APPROACHES)
    .map(normalizeHerausforderungApproach);
  return {
    kind: HERAUSFORDERUNG_EVENT_KIND,
    schemaVersion: HERAUSFORDERUNG_SCHEMA_VERSION,
    title: text(source.title, 180) || 'Herausforderung',
    publicDescription: text(source.publicDescription, 4000),
    sceneImage: normalizeChallengeSceneImage(source.sceneImage),
    audience: normalizeChallengeAudience(source.audience),
    combatBound: source.combatBound === true || source.audience?.mode === 'combatants',
    combatContext: { encounterId: text(source.combatContext?.encounterId, 180) },
    approaches
  };
}

export function isHerausforderungComment(comment = {}) {
  return !!(comment?.herausforderung || comment?.commentKind === HERAUSFORDERUNG_EVENT_KIND || comment?.commentMode === 'herausforderung');
}

export function getHerausforderungApproachTargetId(commentId = '', approachId = '') {
  return `herausforderung:${text(commentId, 200)}:${text(approachId, 40)}`;
}

export function parseHerausforderungApproachTargetId(targetId = '') {
  const match = /^herausforderung:(.+):([^:]+)$/.exec(String(targetId || ''));
  if (!match) return null;
  return { commentId: match[1], approachId: match[2] };
}

export function collectHerausforderungApproaches(comments = []) {
  const approaches = [];
  (Array.isArray(comments) ? comments : []).forEach(comment => {
    if (!isHerausforderungComment(comment)) return;
    const event = normalizeHerausforderungEvent(comment.herausforderung || comment);
    const commentId = text(comment?.id, 200);
    if (!commentId) return;
    const authorKey = `herausforderung:${commentId}`;
    event.approaches.forEach((approach, index) => {
      approaches.push({
        schemaVersion: HERAUSFORDERUNG_SCHEMA_VERSION,
        source: 'herausforderung',
        audience: event.audience, combatBound: event.combatBound, combatContext: event.combatContext,
        id: getHerausforderungApproachTargetId(commentId, approach.approachId),
        commentId,
        approachId: approach.approachId,
        segmentIndex: 0,
        difficulty: approach.difficulty,
        preferredSkills: approach.preferredSkills,
        preferredModifier: HERAUSFORDERUNG_PREFERRED_MODIFIER,
        alternativeModifier: HERAUSFORDERUNG_ALTERNATIVE_MODIFIER,
        defenseMode: 'fixed',
        defenseSkillId: 'deception',
        insight: approach.insight,
        partialHint: approach.partialHint,
        failureConsequence: approach.failureConsequence,
        rewards: approach.rewards,
        partialEffects: approach.partialEffects,
        failureEffects: approach.failureEffects,
        authorId: '',
        authorKey,
        authorName: text(event.title, 180),
        authorPersistence: null,
        createdBy: text(comment?.createdBy, 200),
        visibleText: `${event.title} · ${approach.label}`,
        createdAt: comment?.createdAt || comment?.createdAtClient || null,
        contributionRank: index + 1
      });
    });
  });
  return approaches;
}

export const herausforderungInternals = Object.freeze({ text, integer, makeApproachId });
