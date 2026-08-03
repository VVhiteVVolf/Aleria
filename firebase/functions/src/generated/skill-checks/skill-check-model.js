import {
  getSkillTotal,
  resolveCharacterCombatProfile
} from '../combat/combat-profile-model.js?v=20260803-rule-integrity-v1';

export const SEGMENT_MECHANIC_MODES = Object.freeze(['normal', 'skill', 'combat', 'magic']);

export const SKILL_DEFINITIONS = Object.freeze([
  { id: 'persuasion', label: 'Überzeugen', aliases: ['überzeugen', 'ueberzeugen', 'überreden', 'ueberreden'], attributeKey: 'charisma' },
  { id: 'intimidation', label: 'Einschüchtern', aliases: ['einschüchtern', 'einschuechtern'], attributeKey: 'charisma' },
  { id: 'deception', label: 'Täuschen', aliases: ['täuschen', 'taeuschen'], attributeKey: 'charisma' },
  { id: 'performance', label: 'Auftreten', aliases: ['auftreten', 'schauspiel'], attributeKey: 'charisma' },
  { id: 'insight', label: 'Motiv erkennen', aliases: ['motiv erkennen', 'motiverkennen'], attributeKey: 'wisdom' },
  { id: 'animal-handling', label: 'Mit Tieren umgehen', aliases: ['mit tieren umgehen', 'tierkunde'], attributeKey: 'wisdom' },
  { id: 'medicine', label: 'Heilkunde', aliases: ['heilkunde'], attributeKey: 'wisdom' },
  { id: 'investigation', label: 'Nachforschungen', aliases: ['nachforschungen', 'nachforschen'], attributeKey: 'intelligence' },
  { id: 'sleight-of-hand', label: 'Fingerfertigkeit', aliases: ['fingerfertigkeit'], attributeKey: 'dexterity' },
  { id: 'acrobatics', label: 'Akrobatik', aliases: ['akrobatik'], attributeKey: 'dexterity' },
  { id: 'athletics', label: 'Athletik', aliases: ['athletik'], attributeKey: 'strength' },
  { id: 'seduction', label: 'Flirten', aliases: ['flirten', 'verführen', 'verfuehren'], attributeKey: 'charisma' },
  { id: 'body-control', label: 'Körperbeherrschung', aliases: ['körperbeherrschung', 'koerperbeherrschung'], attributeKey: 'constitution' }
]);

const SKILLS_BY_ID = new Map(SKILL_DEFINITIONS.map(skill => [skill.id, skill]));

export const COMMENT_KIND_SKILL_IDS = Object.freeze({
  speech: ['persuasion'],
  shout: ['intimidation'],
  performance: ['deception', 'performance'],
  thought: ['insight', 'investigation'],
  animal: ['animal-handling'],
  interact: ['medicine', 'sleight-of-hand', 'acrobatics', 'athletics', 'body-control'],
  flirt: ['seduction']
});

function clampInteger(value, fallback, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(number)));
}

export function normalizeLookupText(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function normalizeMechanicMode(value, segment = {}) {
  const mode = String(value || '').trim().toLowerCase();
  if (SEGMENT_MECHANIC_MODES.includes(mode)) return mode;
  if (segment?.combatResolution || segment?.combatAction || segment?.storedCombatResolution || segment?.storedCombatAction) {
    return ['spell', 'prayer', 'song'].includes(String(segment.commentKind || segment.kind || '')) ? 'magic' : 'combat';
  }
  return 'normal';
}

export function getSkillDefinition(skillId) {
  return SKILLS_BY_ID.get(String(skillId || '')) || null;
}

export function getSkillsForCommentKind(kind) {
  return (COMMENT_KIND_SKILL_IDS[String(kind || '')] || [])
    .map(getSkillDefinition)
    .filter(Boolean);
}

export function findProfileSkill(profile, definition) {
  if (!definition) return null;
  const accepted = new Set([definition.label, ...definition.aliases].map(normalizeLookupText));
  return (profile?.skills || []).find(skill => accepted.has(normalizeLookupText(skill?.name))) || null;
}

export function resolveSkillModifier(character = {}, skillId = '') {
  const definition = getSkillDefinition(skillId);
  if (!definition) throw new Error('Die gewählte Fertigkeit ist nicht verfügbar.');
  const profile = resolveCharacterCombatProfile(character);
  const profileSkill = findProfileSkill(profile, definition);
  const syntheticSkill = {
    id: `derived-${definition.id}`,
    name: definition.label,
    attributeKey: definition.attributeKey,
    proficiency: 'none',
    bonus: 0
  };
  return {
    definition,
    profile,
    profileSkill,
    modifier: getSkillTotal(profile, profileSkill || syntheticSkill),
    source: profileSkill ? 'character-sheet' : 'attribute-fallback'
  };
}

export function normalizeSkillChallenge(source = {}) {
  if (!source || typeof source !== 'object' || source.enabled === false) return null;
  const preferredSkills = [...new Set((Array.isArray(source.preferredSkills) ? source.preferredSkills : [])
    .map(value => String(value || ''))
    .filter(value => SKILLS_BY_ID.has(value)))];
  return {
    schemaVersion: 2,
    id: String(source.id || '').trim().slice(0, 120),
    enabled: true,
    actualKind: 'performance',
    disguisedKind: 'speech',
    difficulty: clampInteger(source.difficulty, 10, 1, 40),
    preferredSkills,
    preferredModifier: clampInteger(source.preferredModifier, 2, -20, 20),
    alternativeModifier: clampInteger(source.alternativeModifier, -2, -20, 20)
  };
}

export function normalizeSkillCheckSettings(source = {}) {
  return {
    skillId: SKILLS_BY_ID.has(String(source.skillId || '')) ? String(source.skillId) : '',
    customModifier: clampInteger(source.customModifier, 0, -99, 99),
    difficulty: clampInteger(source.difficulty, 10, 1, 40),
    rollMode: ['advantage', 'disadvantage'].includes(source.rollMode) ? source.rollMode : 'normal',
    targetChallengeId: String(source.targetChallengeId || '').trim().slice(0, 120)
  };
}

export function getChallengeAffinityModifier(challenge, skillId) {
  const normalized = normalizeSkillChallenge(challenge);
  if (!normalized) return 0;
  return normalized.preferredSkills.includes(String(skillId || ''))
    ? normalized.preferredModifier
    : normalized.alternativeModifier;
}

export function classifySkillCheck({ natural = 0, total = 0, difficulty = 10 } = {}) {
  if (Number(natural) === 20) return 'critical-success';
  if (Number(natural) === 1) return 'critical-failure';
  return Number(total) >= Number(difficulty) ? 'success' : 'failure';
}

export function isSuccessfulSkillOutcome(outcome) {
  return outcome === 'success' || outcome === 'critical-success';
}

export function buildSkillRollNotation(modifier = 0, rollMode = 'normal') {
  const dice = rollMode === 'advantage' ? '2d20kh1' : (rollMode === 'disadvantage' ? '2d20kl1' : '1d20');
  const safeModifier = clampInteger(modifier, 0, -999, 999);
  return safeModifier === 0 ? dice : `${dice}${safeModifier > 0 ? '+' : ''}${safeModifier}`;
}

export function getChallengeId(segmentId = '') {
  const source = String(segmentId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  return `skill-challenge-${source || Date.now().toString(36)}`;
}

export function collectSkillChallenges(comments = []) {
  const challenges = [];
  (Array.isArray(comments) ? comments : []).forEach(comment => {
    (Array.isArray(comment?.commentSegments) ? comment.commentSegments : []).forEach((segment, segmentIndex) => {
      const challenge = normalizeSkillChallenge(segment?.skillChallenge);
      if (!challenge?.id) return;
      challenges.push({
        ...challenge,
        commentId: String(comment?.id || ''),
        segmentIndex,
        authorId: String(segment?.sceneActorId || segment?.characterId || comment?.characterId || ''),
        authorKey: String(segment?.sceneActorId || segment?.characterId || comment?.characterId || segment?.charName || comment?.charName || 'unbekannt'),
        authorName: String(segment?.charName || comment?.charName || 'Unbekannt'),
        visibleText: String(segment?.text || ''),
        createdAt: comment?.createdAt || comment?.createdAtClient || null
      });
    });
  });
  return challenges;
}

function getCommentActors(comment = {}) {
  const segments = Array.isArray(comment.commentSegments) && comment.commentSegments.length
    ? comment.commentSegments
    : [comment];
  return [...new Map(segments.map(segment => {
    const key = String(segment?.sceneActorId || segment?.characterId || comment?.characterId || segment?.charName || comment?.charName || 'unbekannt');
    return [key, { key, name: String(segment?.charName || comment?.charName || 'Unbekannt') }];
  })).values()];
}

export function collectRecentSkillChallenges(comments = [], maximumContributions = 3) {
  const source = Array.isArray(comments) ? comments : [];
  const rankByActorAndComment = new Map();
  const contributionCounts = new Map();
  [...source].reverse().forEach((comment, reverseIndex) => {
    const commentKey = String(comment?.id || `comment-${source.length - reverseIndex}`);
    getCommentActors(comment).forEach(actor => {
      const rank = (contributionCounts.get(actor.key) || 0) + 1;
      contributionCounts.set(actor.key, rank);
      rankByActorAndComment.set(`${actor.key}\u0000${commentKey}`, rank);
    });
  });
  return collectSkillChallenges(source)
    .map(challenge => ({
      ...challenge,
      contributionRank: rankByActorAndComment.get(`${challenge.authorKey}\u0000${challenge.commentId}`) || Number.MAX_SAFE_INTEGER
    }))
    .filter(challenge => challenge.contributionRank <= Math.max(1, Number(maximumContributions) || 3))
    .sort((left, right) => left.contributionRank - right.contributionRank);
}

export function collectRevealedChallengeIds(comments = []) {
  const revealed = new Set();
  (Array.isArray(comments) ? comments : []).forEach(comment => {
    (Array.isArray(comment?.commentSegments) ? comment.commentSegments : []).forEach(segment => {
      const resolution = segment?.skillResolution;
      if (resolution?.targetChallengeId && isSuccessfulSkillOutcome(resolution.outcome)) {
        revealed.add(String(resolution.targetChallengeId));
      }
    });
  });
  return revealed;
}

export const skillCheckInternals = Object.freeze({ clampInteger, getCommentActors });
