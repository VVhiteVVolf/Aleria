import { getChallengeCheckRule } from '../herausforderung/herausforderung-check-policy.js?v=20261016-check-policy-v1';
import { withResolvedChallengeTarget } from '../herausforderung/herausforderung-target.js?v=20261016-check-policy-v1';
import { renderChallengeManeuverReceipts } from '../herausforderung/herausforderung-maneuver-receipts-view.js';
import { getChallengeNarration, isChallengeResolution } from '../herausforderung/herausforderung-narration.js';
import { renderSkillAttemptHeader, renderSkillAttemptBreakdown } from './skill-attempt-view.js?v=20261016-check-policy-v1';
import { collectSkillSupportOptions, selectSkillSupportDefaults, skillSupportOptionKey } from './skill-support-options.js?v=20261016-check-policy-v1';
import { getCheckDescription } from './skill-check-guidance.js?v=20261015-check-options-v1';
import { describeCheckModifierSource } from './attribute-check-model.js?v=20261015-check-options-v1';
import { previewChallengeCombatBenefits, collectChallengeGrantKeys } from '../herausforderung/herausforderung-combat-preview.js?v=20261015-graded-challenges-v1';
import { getChallengeAttemptSettings } from './skill-challenge-attempt.js?v=20261016-check-policy-v1';
import { getChallengeCombatBindingError } from '../herausforderung/herausforderung-combat-context.js?v=20261015-check-options-v1';
import { getActiveCombatPartyMap, getEncounterRelationship, getActiveCombatEncounter } from '../combat/combat-encounter-model.js';
import { sceneDiceService } from '../scene-dice/dice-service.js?v=20261013-performance-v1';
import { CombatProfileResolver } from '../combat/combat-profile-resolver.js?v=20260928-equipment-art-v4';
import { createSceneSkillProfileResolver } from './skill-scene-profile.js?v=20260928-equipment-art-v4';
import { getSceneRecoveryDayKey } from '../scene-time/scene-recovery-day.js';
import { formatHerausforderungRewardReceipt } from '../herausforderung/herausforderung-rewards.js?v=20261015-graded-challenges-v1';
import {
  SKILL_DEFINITIONS,
  CHECK_DEFINITIONS,
  getCheckCommentKind,
  buildSkillRollNotation,
  classifySkillCheck,
  collectRevealedChallengeIds,
  collectRecentSkillChallenges,
  getChallengeAffinityModifier,
  getChallengeId,
  getSkillDefinition,
  getChecksForCommentKind,
  getCheckDefinition,
  isSuccessfulSkillOutcome,
  normalizeMechanicMode,
  normalizeSkillChallenge,
  normalizeSkillCheckSettings,
  resolveSkillModifier
} from './skill-check-model.js?v=20261016-guided-checks-v1';
import { narrateSkillResolution } from './skill-check-narration.js?v=20261015-graded-challenges-v1';
import { SkillResolutionService, getSkillRollContext } from './skill-resolution-service.js?v=20261016-check-policy-v1';
import { collectCombatTriggerRules, deriveCombatRuleFrequencyKeys } from '../combat/combat-trigger-rules.js?v=20260928-equipment-art-v4';
import { renderAutomaticRollMode } from '../combat/ui/combat-roll-mode-view.js?v=20260906-effect-rolls-v1';
import { renderSkillIcon, renderSkillChoiceGroup, renderPreferredSkillHints, skillTooltipAttributes, bindSkillIconTooltips } from './skill-icon-view.js?v=20261016-check-policy-v1';

bindSkillIconTooltips(document);

const profileResolver = new CombatProfileResolver();
const skillResolutionService = new SkillResolutionService({
  async rollSkill({ notation, actorName, skillName, container }) {
    return sceneDiceService.roll(notation, container, {
      roller: actorName || 'Unbekannt',
      purpose: skillName || 'Fertigkeitsversuch',
      rollType: 'general'
    });
  }
});
const supportDefaults = new WeakMap();
let latestComposerContext = null;
let composerRefreshQueued = false;
for (const name of ['aleria:comments-updated', 'aleria:combat-profile-committed', 'aleria:characters-changed']) document.addEventListener(name, () => {
  if (composerRefreshQueued || !latestComposerContext?.list?.isConnected || latestComposerContext.list.closest('[aria-hidden="true"]')) return;
  composerRefreshQueued = true;
  requestAnimationFrame(() => {
    composerRefreshQueued = false;
    if (latestComposerContext?.list?.isConnected && !latestComposerContext.list.closest('[aria-hidden="true"]')) mountComposers(latestComposerContext);
  });
});
let revealedChallengeIds = new Set();

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clampNumber(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

function makeResolutionId() {
  return `skill-resolution-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function getCharacters() {
  try {
    return typeof globalThis.getAvailableCommentCharacters === 'function'
      ? globalThis.getAvailableCommentCharacters()
      : [];
  } catch {
    return [];
  }
}

function mergeActors(sceneActors = []) {
  const sourceIds = new Set(sceneActors.map(actor => String(actor?.sourceCreatureId || '')).filter(Boolean));
  const merged = new Map();
  getCharacters()
    .filter(actor => !(actor?.entityType === 'creature' && sourceIds.has(String(actor?.id || ''))))
    .forEach(actor => merged.set(String(actor?.id || ''), actor));
  sceneActors.forEach(actor => merged.set(String(actor?.id || ''), actor));
  return [...merged.values()];
}

function getActorForSegment(segment, fallbackActorId = '', actors = []) {
  const actorId = String(segment?.sceneActorId || segment?.actorId || segment?.characterId || fallbackActorId || '');
  return actors.find(actor => String(actor?.id || '') === actorId) || null;
}

function relationshipBetweenActors(first = {}, second = {}) {
  if (String(first.id) === String(second.id)) return 'self';
  const comments = globalThis.getCachedCommentsForThread?.(latestComposerContext?.threadId || '') || [];
  const encounterRelation = getEncounterRelationship(first.id, second.id, getActiveCombatPartyMap(comments));
  if (encounterRelation) return encounterRelation;
  const firstTeam = String(first.combatTeam || first.fraktion || first.faction || '').trim().toLocaleLowerCase('de');
  const secondTeam = String(second.combatTeam || second.fraktion || second.faction || '').trim().toLocaleLowerCase('de');
  return firstTeam && secondTeam && firstTeam === secondTeam ? 'ally' : 'enemy';
}

function buildClientSkillRuleContext(segment, actor, actorProfile, targetChallenge, actors = [], resolver = profileResolver, selections = segment.skillRuleSelections) {
  const targetActor = targetChallenge
    ? actors.find(candidate => [targetChallenge.authorId, targetChallenge.authorKey].includes(String(candidate?.id || ''))) || null
    : null;
  const targetProfile = targetActor ? resolver.resolve(targetActor) : null;
  const sources = [{
    actorId: actorProfile.characterId,
    actorName: actorProfile.name,
    profile: actorProfile,
    sourceRole: 'actor',
    relationToActor: 'self',
    relationToTarget: targetActor ? relationshipBetweenActors(actor, targetActor) : 'enemy',
    distanceToActor: 0,
    distanceToTarget: null,
    selectedRuleIds: []
  }];
  if (targetActor && targetProfile && targetActor.id !== actor.id) sources.push({
    actorId: targetProfile.characterId,
    actorName: targetProfile.name,
    profile: targetProfile,
    sourceRole: 'target',
    relationToActor: relationshipBetweenActors(targetActor, actor),
    relationToTarget: 'self',
    distanceToActor: null,
    distanceToTarget: 0,
    selectedRuleIds: []
  });
  const groupedSelections = new Map();
  (Array.isArray(selections) ? selections : []).forEach(selection => {
    const actorId = String(selection?.sourceActorId || '');
    if (!actorId) return;
    const distanceMeters = selection?.distanceMeters == null ? null : Number(selection.distanceMeters);
    const current = groupedSelections.get(actorId) || { actorId, ruleIds: [], distanceMeters };
    current.ruleIds.push(String(selection?.ruleId || ''));
    groupedSelections.set(actorId, current);
  });
  groupedSelections.forEach(selection => {
    let source = sources.find(candidate => String(candidate.actorId) === selection.actorId);
    if (source) {
      source.selectedRuleIds = [...new Set([...source.selectedRuleIds, ...selection.ruleIds])];
      return;
    }
    const supportActor = actors.find(candidate => String(candidate?.id || '') === selection.actorId);
    if (!supportActor) return;
    const supportProfile = resolver.resolve(supportActor);
    source = {
      actorId: supportProfile.characterId,
      actorName: supportProfile.name,
      profile: supportProfile,
      sourceRole: 'support',
      relationToActor: relationshipBetweenActors(supportActor, actor),
      relationToTarget: targetActor ? relationshipBetweenActors(supportActor, targetActor) : 'enemy',
      distanceToActor: selection.distanceMeters,
      distanceToTarget: selection.distanceMeters,
      selectedRuleIds: [...new Set(selection.ruleIds)]
    };
    sources.push(source);
  });
  const opposedSkill = targetProfile && targetChallenge?.defenseMode !== 'fixed'
    ? resolveSkillModifier(targetProfile, targetChallenge.defenseSkillId || 'deception')
    : null;
  const opposedDifficulty = opposedSkill ? Math.max(1, 10 + Number(opposedSkill.modifier || 0)) : null;
  return {
    targetProfile,
    sources,
    opposedDifficulty,
    opposedDefense: opposedSkill ? {
      actorId: targetProfile.characterId,
      actorName: targetProfile.name,
      skillId: opposedSkill.definition.id,
      skillName: opposedSkill.definition.label,
      modifier: opposedSkill.modifier,
      passiveTotal: opposedDifficulty
    } : null
  };
}

function getModeOptions(segment) {
  const kind = String(segment?.kind || segment?.commentKind || 'speech');
  const options = [{ id: 'normal', label: 'Normal', hint: 'Nur erzählen, ohne Wurf' }];
  if (segment?.skillChallengeEnabled || kind === 'consume' || kind === 'action' || kind === 'narrator') return options;
  options.push(
    { id: 'skill', label: 'Fertigkeitsversuch', hint: 'Blase und Fertigkeit wählen, würfeln und auswerten' },
    { id: 'combat', label: 'Kampf', hint: 'Nur Kampfbeschreibung, Angriff und Kosten auswerten' },
    { id: 'magic', label: 'Zauber wirken', hint: 'Nur Zauberformel, Gebet oder Gesang magisch auswerten' }
  );
  return options;
}

function getHerausforderungApproaches(comments) {
  try {
    return typeof globalThis.AleriaHerausforderung?.collectApproaches === 'function'
      ? globalThis.AleriaHerausforderung.collectApproaches(comments)
      : [];
  } catch (error) {
    console.error('herausforderung approaches unavailable:', error);
    return [];
  }
}

function getComposerChallenges(threadId) {
  const comments = globalThis.getCachedCommentsForThread?.(threadId) || [];
  const revealed = collectRevealedChallengeIds(comments);
  return [
    ...collectRecentSkillChallenges(comments, 3),
    ...getHerausforderungApproaches(comments)
  ].filter(challenge => !revealed.has(challenge.id) && (!challenge.attemptLimit || comments.flatMap(comment => comment.commentSegments || []).filter(segment => segment.skillResolution?.targetChallengeId === challenge.id).length < challenge.attemptLimit));
}

function getContributionRankLabel(rank) {
  if (rank === 1) return 'Letzter Beitrag';
  if (rank === 2) return 'Vorletzter Beitrag';
  return 'Drittletzter Beitrag';
}

function renderModeControl(segment) {
  const options = getModeOptions(segment);
  const requestedMode = normalizeMechanicMode(segment?.mechanicMode, segment);
  const mode = options.some(option => option.id === requestedMode) ? requestedMode : 'normal';
  segment.mechanicMode = mode;
  return `
    <div class="segment-mechanic-switch" role="group" aria-label="Mechanik für diesen Abschnitt">
      <span class="segment-mechanic-switch-label">Dieser Abschnitt</span>
      ${options.map(option => `
        <button type="button" class="segment-mechanic-option${mode === option.id ? ' active' : ''}" data-skill-action="set-mode" data-value="${option.id}" title="${escapeHtml(option.hint)}" aria-pressed="${mode === option.id}">${escapeHtml(option.label)}</button>`).join('')}
    </div>`;
}

function prepareSkillSupport(segment, actor, settings, target, actors, resolver) {
  if (!actor) return [];
  const comments = globalThis.getCachedCommentsForThread?.(latestComposerContext?.threadId || '') || [];
  const encounter = getActiveCombatEncounter(comments);
  const present = new Set(encounter
    ? [...encounter.participants.values()].filter(item => item.status === 'active').map(item => item.actorId)
    : [...(latestComposerContext?.sceneActors || []).map(item => item.id),
      ...comments.flatMap(comment => [comment.characterId, ...(comment.commentSegments || []).map(item => item.sceneActorId || item.characterId)])].filter(Boolean));
  present.add(actor.id);
  const candidates = actors.filter(candidate => present.has(candidate.id) && ['self', 'ally'].includes(relationshipBetweenActors(candidate, actor)));
  const selections = candidates.flatMap(candidate => {
    const profile = resolver.resolve(candidate);
    const rules = collectCombatTriggerRules(profile).filter(rule => rule.activation === 'reaction');
    return [...rules.map(rule => rule.id), ...(profile.aura?.enabled ? ['@aura:actor'] : [])]
      .map(ruleId => ({ sourceActorId: candidate.id, ruleId, distanceMeters: candidate.id === actor.id ? 0 : null }));
  });
  const context = buildClientSkillRuleContext(segment, actor, resolver.resolve(actor), target, actors, resolver, selections);
  const day = getSceneRecoveryDayKey(latestComposerContext?.threadId, comments);
  const options = collectSkillSupportOptions({ actor, settings }, {
    actorProfile: resolver.resolve(actor), ruleSources: context.sources, targetProfile: context.targetProfile,
    rulePeriods: { scene: latestComposerContext?.threadId || '', day, comment: 'skill-draft' },
    usedRuleFrequencyKeys: deriveCombatRuleFrequencyKeys(comments)
  });
  const contextKey = `${actor.id}:${settings.skillId}:${target?.id || ''}`;
  let defaults = supportDefaults.get(segment);
  if (!defaults || defaults.contextKey !== contextKey) {
    defaults = { contextKey, seen: new Set() };
    supportDefaults.set(segment, defaults);
  }
  segment.skillRuleSelections = selectSkillSupportDefaults(options, segment.skillRuleSelections || [], defaults.seen, day);
  return options;
}

function renderSkillSupportOptions(segment, options) {
  if (!options.length) return '';
  const selected = new Set((segment.skillRuleSelections || []).map(skillSupportOptionKey));
  return `<fieldset class="skill-check-support"><legend>Passende Unterstützung & Reaktionen</legend>
    <p>Passende verfügbare Unterstützung ist vorausgewählt. Beim Eintragen werden die angegebenen Kosten fällig, wenn die Regel greift. Du kannst Unterstützung abwählen.</p>
    <div class="skill-check-support-options">${options.map(option => {
      const persistence = option.source.profile.persistence || {};
      const costs = [...option.costs.map(cost => `${cost.amount} ${cost.name || cost.resourceId}`), ...(option.consumesAbilityUse ? ['1 Nutzung'] : [])].join(' · ');
      const condition = option.condition === 'always' ? '' : ' · nur bei passendem Würfelergebnis';
      return `<label class="skill-check-support-option"><input type="checkbox" data-skill-rule-toggle data-source-actor-id="${escapeHtml(option.sourceActorId)}" data-rule-id="${escapeHtml(option.ruleId)}" data-persistence-kind="${escapeHtml(persistence.kind)}" data-record-id="${escapeHtml(persistence.recordId)}" data-source-creature-id="${escapeHtml(persistence.sourceCreatureId)}"${selected.has(skillSupportOptionKey(option)) ? ' checked' : ''}><span><b>${escapeHtml(option.sourceActorName)}</b> · ${escapeHtml(option.ruleName)}<small>${escapeHtml(costs || 'Ohne Ressourcenkosten')}${escapeHtml(condition)}</small></span></label>`;
    }).join('')}</div>
  </fieldset>`;
}

function renderSkillComposer(segment, actor, challenges, actors = [], sceneResolver = profileResolver) {
  if (normalizeMechanicMode(segment?.mechanicMode, segment) !== 'skill') return '';
  const kindSkills = getChecksForCommentKind(segment.kind);
  const settings = normalizeSkillCheckSettings({
    skillId: segment.skillId || kindSkills[0]?.id,
    customModifier: segment.skillCustomModifier,
    difficulty: segment.skillDifficulty,
    rollMode: segment.skillRollMode,
    targetChallengeId: segment.skillTargetChallengeId
  });
  segment.skillId = settings.skillId || kindSkills[0]?.id || '';
  segment.skillCustomModifier = settings.customModifier;
  segment.skillDifficulty = settings.difficulty;
  segment.skillRollMode = 'normal';
  segment.skillTargetChallengeId = settings.targetChallengeId;
  const actorKey = String(actor?.id || '');
  const encounter = getActiveCombatEncounter(globalThis.getCachedCommentsForThread?.(latestComposerContext?.threadId || '') || []);
  const availableChallenges = challenges.map(challenge => withResolvedChallengeTarget(challenge, { encounter, actorId: actorKey }))
    .filter(challenge => !actorKey || ((challenge.source === 'herausforderung' || challenge.authorId !== actorKey) && !getChallengeCombatBindingError(challenge, encounter, actorKey)));
  const selectedTarget = availableChallenges.find(challenge => challenge.id === settings.targetChallengeId) || null;
  const selectedTargetActorKey = String(segment.skillTargetActorKey || selectedTarget?.authorKey || '');
  const targetActors = [...new Map(availableChallenges.map(challenge => [challenge.authorKey, {
    key: challenge.authorKey,
    name: challenge.title || challenge.authorName
  }])).values()];
  const actorChallenges = selectedTargetActorKey
    ? availableChallenges.filter(challenge => challenge.authorKey === selectedTargetActorKey)
    : [];
  const target = actorChallenges.find(challenge => challenge.id === settings.targetChallengeId) || null;
  if (settings.targetChallengeId && !target) {
    segment.skillTargetChallengeId = '';
    settings.targetChallengeId = '';
  }
  if (target && !getChallengeCheckRule(target, segment.skillId).allowed) {
    segment.skillId = target.preferredSkills.find(id => getCheckDefinition(id)) || '';
    settings.skillId = segment.skillId;
    segment.kind = getCheckCommentKind(segment.skillId) || segment.kind;
  }
  const checkRule = getChallengeCheckRule(target, segment.skillId);
  const checkValues = {};
  let profileModifier = 0, ruleModifier = 0;
  let profileDetail = 'Charakterbogen fehlt';
  let rollModes = [];
  let automaticModifier = null;
  const supportOptions = prepareSkillSupport(segment, actor, settings, target, actors, sceneResolver);
  if (actor && segment.skillId) {
    const actorProfile = sceneResolver.resolve(actor);
    const ruleContext = buildClientSkillRuleContext(segment, actor, actorProfile, target, actors, sceneResolver);
    const rollContext = getSkillRollContext({ actor, settings }, { actorProfile, ruleSources: ruleContext.sources, targetProfile: ruleContext.targetProfile });
    const skill = rollContext.skill;
    profileModifier = skill.modifier;
    ruleModifier = Number(rollContext.preEffects[rollContext.modifierKey] || 0);
    automaticModifier = profileModifier + ruleModifier + checkRule.modifier;
    for (const check of CHECK_DEFINITIONS) checkValues[check.id] = resolveSkillModifier(actorProfile, check.id).modifier;
    rollModes = [...rollContext.profileRollModes, ...rollContext.preApplications.map(application => application.effects?.rollMode)];
    const sign = skill.modifier >= 0 ? '+' : '';
    profileDetail = `${sign}${skill.modifier} aus ${describeCheckModifierSource(skill.source)}`;
  }
  return `
    <section class="skill-check-composer" data-skill-composer>
      ${renderSkillAttemptHeader({ actor, target, targetActor: actors.find(candidate => candidate.id === target?.authorId), skillId: segment.skillId })}
      ${actor ? '' : '<p class="skill-check-warning">Wähle zuerst eine Figur mit Charakter- oder Kreaturenbogen.</p>'}
      <div class="skill-check-fields">
        ${renderSkillChoiceGroup({ skills: kindSkills, selectedId: segment.skillId, segmentId: segment.id, target, profileDetail, checkValues })}
        <label class="skill-check-target-search">${target?.source === 'herausforderung' ? 'Herausforderung suchen' : 'Figur durchsuchen'}
          <input type="search" data-skill-target-actor-search placeholder="Name der Figur …" autocomplete="off">
        </label>
        <label class="${target ? 'skill-check-preset' : ''}">${target?.source === 'herausforderung' ? 'Herausforderung' : 'Ziel-Figur'}
          <select data-skill-input="targetActorKey">
            <option value="">Freier Versuch ohne verdecktes Ziel</option>
            ${targetActors.map(targetActor => `<option value="${escapeHtml(targetActor.key)}"${targetActor.key === selectedTargetActorKey ? ' selected' : ''}>${escapeHtml(targetActor.name)}</option>`).join('')}
          </select>
        </label>
        <label class="${target ? 'skill-check-preset' : ''}">${target?.source === 'herausforderung' ? 'Lösungsweg' : 'Beitrag dieser Figur'}
          <select data-skill-input="targetChallengeId">
            <option value="">${selectedTargetActorKey ? 'Beitrag wählen' : 'Zuerst eine Figur wählen'}</option>
            ${actorChallenges.map(challenge => `<option value="${escapeHtml(challenge.id)}"${challenge.id === target?.id ? ' selected' : ''}>${escapeHtml(challenge.source === 'herausforderung' ? challenge.approachLabel || challenge.visibleText : `${getContributionRankLabel(challenge.contributionRank)} · ${challenge.visibleText.slice(0, 80) || 'Beitrag ohne Text'}`)}</option>`).join('')}
          </select>
        </label>
        <label class="${target ? 'skill-check-preset' : ''}">Schwierigkeit
          <input type="number" min="1" max="40" value="${target?.difficulty ?? settings.difficulty}" data-skill-input="difficulty"${target ? ' disabled' : ''}>
          <small>${target ? 'Wird von der Herausforderung vorgegeben' : 'SG 10 ist ein einfacher Standardversuch'}</small>
        </label>
        ${renderAutomaticRollMode(rollModes)}
      </div>
      ${target ? `<div class="skill-check-target-note"><b>${target.source === 'herausforderung' ? 'Freigegebene Proben' : `${escapeHtml(target.authorName)} · ${escapeHtml(getContributionRankLabel(target.contributionRank))}`}</b>${renderPreferredSkillHints(target)}</div>` : ''}
      ${renderSkillAttemptBreakdown({ actor, profileModifier, ruleModifier, checkRule, totalModifier: automaticModifier, difficulty: target?.difficulty ?? settings.difficulty, checkType: getCheckDefinition(segment.skillId)?.checkType })}
      ${renderSkillSupportOptions(segment, supportOptions)}
    </section>`;
}

function renderChallengeComposer(segment) {
  if (String(segment?.kind || segment?.commentKind || '') !== 'performance') return '';
  const challenge = normalizeSkillChallenge({
    id: segment.skillChallengeId || getChallengeId(segment.id),
    enabled: !!segment.skillChallengeEnabled,
    difficulty: segment.skillChallengeDifficulty,
    preferredSkills: segment.skillChallengePreferredSkills,
    preferredModifier: segment.skillChallengePreferredModifier,
    alternativeModifier: segment.skillChallengeAlternativeModifier,
    defenseMode: segment.skillChallengeDefenseMode || 'passive',
    defenseSkillId: segment.skillChallengeDefenseSkillId || 'deception'
  });
  if (!segment.skillChallengeId) segment.skillChallengeId = getChallengeId(segment.id);
  const enabled = !!segment.skillChallengeEnabled;
  const preferred = new Set(challenge?.preferredSkills || segment.skillChallengePreferredSkills || []);
  return `
    <section class="skill-challenge-composer${enabled ? ' active' : ''}" data-skill-challenge-composer>
      <label class="skill-challenge-toggle">
        <input type="checkbox" data-skill-input="challengeEnabled"${enabled ? ' checked' : ''}>
        <span>Verdeckte Falle, Täuschung oder Wahrheit hinterlegen</span>
      </label>
      ${enabled ? `
        <div class="skill-challenge-fields">
          <label>Schwierigkeit<input type="number" min="1" max="40" value="${clampNumber(segment.skillChallengeDifficulty, 10, 1, 40)}" data-skill-input="challengeDifficulty"></label>
          <label>Gegenprobe<select data-skill-input="challengeDefenseMode"><option value="passive"${challenge?.defenseMode === 'passive' ? ' selected' : ''}>Passive Gegenfertigkeit (10 + Bonus)</option><option value="fixed"${challenge?.defenseMode === 'fixed' ? ' selected' : ''}>Fester SG</option></select></label>
          <label>Verteidigende Fertigkeit<select data-skill-input="challengeDefenseSkillId">${SKILL_DEFINITIONS.map(skill => `<option value="${skill.id}"${skill.id === challenge?.defenseSkillId ? ' selected' : ''}>${escapeHtml(skill.label)}</option>`).join('')}</select></label>
          <div class="skill-challenge-skills"><span>Bevorzugte Lösungen</span>${SKILL_DEFINITIONS.map(skill => `<label ${skillTooltipAttributes(`${skill.label}: ${getCheckDescription(skill)} Als mögliche Lösung auswählen.`)}><input type="checkbox" data-skill-challenge-skill="${skill.id}"${preferred.has(skill.id) ? ' checked' : ''}>${renderSkillIcon(skill)}${escapeHtml(skill.label)}</label>`).join('')}</div>
          <p>Proben verwenden den Bogenwert einschließlich Übung und geltender Effekte. Kein zusätzlicher Ansatzbonus.</p>
        </div>
        <p class="skill-challenge-privacy">Der Abschnitt wird als gewöhnliche Rede veröffentlicht. Erst eine erfolgreiche Auswertung entlarvt ihn als Schauspiel.</p>` : ''}
    </section>`;
}

function mountComposers(context = {}) {
  bindSkillIconTooltips(document).hide();
  latestComposerContext = context;
  const segments = Array.isArray(context.segments) ? context.segments : [];
  const needsSkillComposer = segments.some(segment => normalizeMechanicMode(segment?.mechanicMode, segment) === 'skill');
  const actors = needsSkillComposer ? mergeActors(context.sceneActors || []) : [];
  const challenges = needsSkillComposer ? getComposerChallenges(context.threadId || '') : [];
  const comments = globalThis.getCachedCommentsForThread?.(context.threadId || '') || [];
  const sceneResolver = needsSkillComposer ? createSceneSkillProfileResolver(comments, {
    recoveryDayKey: getSceneRecoveryDayKey(context.threadId, comments)
  }) : profileResolver;
  segments.forEach(segment => {
    const card = context.list?.querySelector?.(`[data-segment-id="${CSS.escape(String(segment.id || ''))}"]`);
    const host = card?.querySelector?.('[data-segment-mechanics-host]');
    if (!host) return;
    const actor = needsSkillComposer ? getActorForSegment(segment, context.selectedCharacterId, actors) : null;
    host.innerHTML = `${renderModeControl(segment)}${renderSkillComposer(segment, actor, challenges, actors, sceneResolver)}${renderChallengeComposer(segment)}`;
  });
}

function remountAll() {
  if (!latestComposerContext) return;
  mountComposers(latestComposerContext);
  globalThis.AleriaCombat?.mountComposer?.(latestComposerContext.list, {
    segments: latestComposerContext.segments,
    selectedCharacterId: latestComposerContext.selectedCharacterId,
    sceneActors: latestComposerContext.sceneActors,
    threadId: latestComposerContext.threadId
  });
}

function findComposerSegment(trigger) {
  const id = trigger?.closest?.('[data-segment-id]')?.dataset?.segmentId || '';
  return latestComposerContext?.segments?.find(segment => String(segment?.id || '') === String(id)) || null;
}

function updateSegmentField(segment, field, value) {
  if (!segment) return;
  if (field === 'skillId') {
    const challenge = getComposerChallenges(latestComposerContext?.threadId || '').find(item => item.id === segment.skillTargetChallengeId);
    if (!getCheckDefinition(value) || !getChallengeCheckRule(challenge, value).allowed) return;
    segment.skillId = String(value);
    if (challenge?.source === 'herausforderung') segment.kind = getCheckCommentKind(segment.skillId) || segment.kind;
  }
  if (field === 'targetActorKey') {
    segment.skillTargetActorKey = String(value || '');
    segment.skillTargetChallengeId = '';
  }
  if (field === 'targetChallengeId') segment.skillTargetChallengeId = String(value || '');
  if (field === 'difficulty') segment.skillDifficulty = clampNumber(value, 10, 1, 40);
  if (field === 'customModifier') return;
  if (field === 'rollMode') return;
  if (field === 'challengeEnabled') {
    segment.skillChallengeEnabled = !!value;
    if (segment.skillChallengeEnabled) {
      segment.kind = 'performance';
      segment.mechanicMode = 'normal';
      segment.combatPaymentConfirmed = false;
    }
  }
  if (field === 'challengeDifficulty') segment.skillChallengeDifficulty = clampNumber(value, 10, 1, 40);
  if (field === 'challengeDefenseMode') segment.skillChallengeDefenseMode = value === 'fixed' ? 'fixed' : 'passive';
  if (field === 'challengeDefenseSkillId') segment.skillChallengeDefenseSkillId = getSkillDefinition(value) ? String(value) : 'deception';
  globalThis.persistCommentDraft?.();
}

function rerenderSegmentEditor() {
  const listId = latestComposerContext?.list?.id || '';
  if (listId === 'cf-segment-list' && typeof globalThis.renderCommentSegmentList === 'function') {
    globalThis.renderCommentSegmentList();
    return;
  }
  if (listId === 'ec-segment-list' && typeof globalThis.renderEditCommentSegmentList === 'function') {
    globalThis.renderEditCommentSegmentList();
    return;
  }
  remountAll();
}

function setSegmentMode(segment, mode) {
  if (!segment || !getModeOptions(segment).some(option => option.id === mode)) return;
  globalThis.AleriaCommentSegmentModeRules?.applyMode?.(segment, mode, latestComposerContext?.list?.id === 'ec-segment-list');
  globalThis.persistCommentDraft?.();
  rerenderSegmentEditor();
}

function togglePreferredSkill(segment, skillId, checked) {
  if (!segment || !getSkillDefinition(skillId)) return;
  const preferred = new Set(Array.isArray(segment.skillChallengePreferredSkills) ? segment.skillChallengePreferredSkills : []);
  if (checked) preferred.add(skillId);
  else preferred.delete(skillId);
  segment.skillChallengePreferredSkills = [...preferred];
  globalThis.persistCommentDraft?.();
}

function updateSkillRuleSelection(segment, field) {
  if (!Array.isArray(segment.skillRuleSelections)) segment.skillRuleSelections = [];
  const sourceActorId = String(field.dataset.sourceActorId || '');
  const ruleId = String(field.dataset.ruleId || '');
  const index = segment.skillRuleSelections.findIndex(item => String(item.sourceActorId) === sourceActorId && String(item.ruleId) === ruleId);
  if (!field.checked && index >= 0) segment.skillRuleSelections.splice(index, 1);
  if (field.checked && index < 0) {
    const kind = String(field.dataset.persistenceKind || '');
    segment.skillRuleSelections.push({
      sourceActorId,
      ruleId,
      distanceMeters: 0,
      sourcePersistence: kind === 'scene-creature'
        ? { kind, sourceCreatureId: String(field.dataset.sourceCreatureId || '') }
        : { kind, recordId: String(field.dataset.recordId || '') }
    });
  }
  globalThis.persistCommentDraft?.();
}

function ensureResolutionDialog() {
  let overlay = document.getElementById('skill-resolution-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'skill-resolution-overlay';
  overlay.className = 'skill-resolution-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="skill-resolution-dialog">
      <span>Probenauswertung</span>
      <h2>Die Würfel entscheiden</h2>
      <div class="skill-dice-stage" id="skill-dice-stage" data-skill-dice-stage></div>
      <p data-skill-resolution-status>Bereit …</p>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function openResolutionDialog() {
  const overlay = ensureResolutionDialog();
  overlay.setAttribute('aria-hidden', 'false');
  if (typeof globalThis.activateDialog === 'function') globalThis.activateDialog(overlay.id, { initialFocus: '[data-skill-resolution-status]' });
  else overlay.classList.add('active');
  return overlay;
}

function closeResolutionDialog() {
  const overlay = document.getElementById('skill-resolution-overlay');
  if (!overlay) return;
  if (typeof globalThis.deactivateDialog === 'function') globalThis.deactivateDialog(overlay.id);
  else overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
}

function setResolutionStatus(message) {
  const node = document.querySelector('[data-skill-resolution-status]');
  if (node) node.textContent = String(message || '');
}

async function resolveSegment(segment, submission, actors, challenges, index, total, resolutionContext) {
  const actor = getActorForSegment(segment, submission.characterId, actors);
  if (!actor) throw new Error('Für diesen Fertigkeitsversuch ist keine Figur mit Profil ausgewählt.');
  const allowed = getChecksForCommentKind(segment.commentKind || segment.kind);
  const settings = normalizeSkillCheckSettings({
    skillId: segment.skillId || allowed[0]?.id,
    customModifier: segment.skillCustomModifier,
    difficulty: segment.skillDifficulty,
    rollMode: segment.skillRollMode,
    targetChallengeId: segment.skillTargetChallengeId
  });
  if (!allowed.some(skill => skill.id === settings.skillId)) throw new Error('Wähle für jeden Fertigkeitsversuch eine zur Blase passende Fertigkeit.');
  segment.skillCustomModifier = 0;
  const targetChallenge = withResolvedChallengeTarget(challenges.find(challenge => challenge.id === settings.targetChallengeId) || null, { encounter: getActiveCombatEncounter(resolutionContext.comments || []), actorId: actor.id });
  if (settings.targetChallengeId && !targetChallenge) throw new Error('Die gewählte verdeckte Herausforderung ist nicht mehr verfügbar.');
  const eligibility = targetChallenge && getChallengeCombatBindingError(targetChallenge, getActiveCombatEncounter(resolutionContext.comments || []), actor.id);
  if (eligibility) throw Error(eligibility);
  const profile = resolutionContext.profileResolver.resolve(actor);
  const ruleContext = buildClientSkillRuleContext(segment, actor, profile, targetChallenge, actors, resolutionContext.profileResolver);
  const stage = document.querySelector('[data-skill-dice-stage]');
  sceneDiceService.clear();
  const definition = getCheckDefinition(settings.skillId);
  setResolutionStatus(total > 1 ? `Fertigkeitsversuch ${index + 1} von ${total} …` : `${definition?.label || 'Fertigkeit'} wird gewürfelt …`);
  let resolution = await skillResolutionService.resolve({
    actor,
    settings,
    challenge: targetChallenge,
    actorPersistence: profile.persistence || null
  }, {
    container: stage,
    actorProfile: profile,
    ruleSources: ruleContext.sources,
    targetProfile: ruleContext.targetProfile,
    opposedDifficulty: ruleContext.opposedDifficulty,
    opposedDefense: ruleContext.opposedDefense,
    rulePeriods: resolutionContext.rulePeriods,
    usedRuleFrequencyKeys: resolutionContext.usedRuleFrequencyKeys
  });
  resolution = await previewChallengeCombatBenefits({ challenge: targetChallenge, resolution, actors,
    profileResolver: resolutionContext.profileResolver, comments: resolutionContext.comments || [],
    grantedKeys: resolutionContext.grantedKeys, container: stage });
  resolutionContext.usedRuleFrequencyKeys = new Set(resolution.usedRuleFrequencyKeys || []);
  resolutionContext.profileResolver.appendResolution(resolution);
  return { ...resolution, actorProfileSnapshot: profile.aiSnapshot || null, originalAttempt: String(segment.text || '') };
}

function buildStoredChallenge(segment) {
  if (!segment.skillChallengeEnabled || String(segment.kind || segment.commentKind || '') !== 'performance') return null;
  const challenge = normalizeSkillChallenge({
    id: segment.skillChallengeId || getChallengeId(segment.clientSegmentId),
    enabled: true,
    difficulty: segment.skillChallengeDifficulty,
    preferredSkills: segment.skillChallengePreferredSkills,
    preferredModifier: segment.skillChallengePreferredModifier,
    alternativeModifier: segment.skillChallengeAlternativeModifier,
    defenseMode: segment.skillChallengeDefenseMode || 'passive',
    defenseSkillId: segment.skillChallengeDefenseSkillId || 'deception'
  });
  if (!challenge.preferredSkills.length) throw new Error('Wähle für jede verdeckte Herausforderung mindestens eine bevorzugte Fertigkeit.');
  return challenge;
}

async function handleSubmission(submission = {}) {
  const segments = Array.isArray(submission.commentSegments) ? submission.commentSegments : [];
  const skillSegments = submission.deferToCombat ? [] : segments.filter(segment => normalizeMechanicMode(segment?.mechanicMode, segment) === 'skill');
  const hasChallenges = segments.some(segment => segment?.skillChallengeEnabled
    && String(segment.kind || segment.commentKind || '') === 'performance');
  if (!skillSegments.length && !hasChallenges && !submission.deferToCombat) return { handled: false, published: false };
  const actors = mergeActors(latestComposerContext?.sceneActors || []);
  const challenges = getComposerChallenges(submission.threadId || '');
  const comments = globalThis.getCachedCommentsForThread?.(submission.threadId || '') || [];
  const rulePeriods = {
    comment: `draft:${String(submission.threadId || '')}:${Date.now()}`,
    scene: String(submission.threadId || ''),
    day: getSceneRecoveryDayKey(submission.threadId, comments)
  };
  const resolutionContext = {
    rulePeriods, comments, grantedKeys: collectChallengeGrantKeys(comments),
    profileResolver: createSceneSkillProfileResolver(comments, { commentId: rulePeriods.comment, recoveryDayKey: rulePeriods.day }),
    usedRuleFrequencyKeys: deriveCombatRuleFrequencyKeys(comments, rulePeriods)
  };
  if (skillSegments.length) openResolutionDialog();
  try {
    const resolutions = [];
    for (let index = 0; index < skillSegments.length; index += 1) {
      resolutions.push(await resolveSegment(skillSegments[index], submission, actors, challenges, index, skillSegments.length, resolutionContext));
    }
    let resolutionIndex = 0;
    const enhancedSegments = segments.map(segment => {
      const { clientSegmentId, ...storedSegment } = segment;
      const skillResolution = normalizeMechanicMode(storedSegment.mechanicMode, storedSegment) === 'skill'
        ? resolutions[resolutionIndex++]
        : null;
      const skillChallenge = buildStoredChallenge({ ...storedSegment, clientSegmentId });
      return {
        ...storedSegment,
        skillChallengeEnabled: !!skillChallenge,
        ...(skillChallenge ? { kind: 'performance', commentKind: 'performance' } : {}),
        mechanicMode: skillChallenge ? 'normal' : normalizeMechanicMode(storedSegment.mechanicMode, storedSegment),
        ...(skillResolution ? { skillResolution } : {}),
        ...(skillChallenge ? { skillChallenge } : {})
      };
    });
    if (skillSegments.length) closeResolutionDialog();
    return {
      handled: true,
      published: false,
      commentMetadata: { commentSegments: enhancedSegments }
    };
  } catch (error) {
    if (skillSegments.length) closeResolutionDialog();
    throw error;
  }
}

async function narrateCommittedMechanics(mechanics = {}) {
  const segments = Array.isArray(mechanics.commentSegments) ? mechanics.commentSegments : [];
  const narrations = [];
  for (const segment of segments) {
    const resolution = segment?.skillResolution;
    if (!resolution?.serverValidated || !resolution.resolutionId) continue;
    narrations.push({
      resolutionId: resolution.resolutionId,
      narration: await narrateSkillResolution({
        actorId: resolution.actorId,
        actor: resolution.actorName,
        skill: resolution.skillName,
        outcome: resolution.outcome,
        attempt: resolution.originalAttempt || segment.text || '',
        targetContribution: resolution.targetContribution || '',
        targetActor: resolution.targetChallengeAuthor || '',
        revealedText: resolution.revealedText || '',
        herausforderungTier: resolution.herausforderungTier || '',
        herausforderungLabel: resolution.herausforderungLabel || '',
        targetChallengeId: resolution.targetChallengeId || '',
        herausforderungSolved: resolution.herausforderungSolved,
        herausforderungCombatResults: resolution.herausforderungCombatResults || [],
        actorProfileSnapshot: resolution.actorProfileSnapshot || null,
        ruleApplications: resolution.ruleApplications || []
      })
    });
  }
  return narrations;
}

function getOutcomeLabel(outcome) {
  if (outcome === 'critical-success') return 'Kritischer Erfolg';
  if (outcome === 'success') return 'Erfolg';
  if (outcome === 'critical-failure') return 'Kritischer Fehlschlag';
  return 'Fehlschlag';
}

const HERAUSFORDERUNG_TIER_LABELS = {
  'kritischer-erfolg': 'Kritischer Erfolg',
  erfolg: 'Erfolg',
  knapp: 'Knappes Scheitern',
  deutlich: 'Deutliches Scheitern'
};

function renderEvaluation(source = {}) {
  const resolution = source.skillResolution || source.resolution;
  if (!resolution?.resolutionId) return '';
  const outcomeLabel = resolution.herausforderungLabel || HERAUSFORDERUNG_TIER_LABELS[resolution.herausforderungTier] || getOutcomeLabel(resolution.outcome);
  const sourceLabel = resolution.narration?.source === 'aleria-gpt' ? 'AleriaGPT-Auswertung' : 'Systemauswertung · ohne KI';
  const affinity = Number(resolution.affinityModifier || 0);
  const rewardReceipt = formatHerausforderungRewardReceipt(resolution.herausforderungReward);
  const challenge = isChallengeResolution(resolution);
  const narrative = challenge ? getChallengeNarration(resolution) : resolution.narration?.text || '';
  const custom = Number(resolution.customModifier || 0);
  const ruleModifier = Number(resolution.ruleModifier || 0);
  const challengeModifier = Number(resolution.challengeModifier || 0);
  const ruleLedger = (Array.isArray(resolution.ruleApplications) ? resolution.ruleApplications : []).map(rule => (
    `<span class="skill-rule-ledger"><b>${escapeHtml(rule.sourceActorName || 'Regelquelle')} · ${escapeHtml(rule.ruleName)}</b><small>${escapeHtml(rule.before?.total ?? rule.before?.modifier ?? '')} → ${escapeHtml(rule.after?.total ?? rule.after?.modifier ?? '')}</small></span>`
  )).join('');
  const ruleCosts = (Array.isArray(resolution.ruleResourceSnapshots) ? resolution.ruleResourceSnapshots : []).flatMap(snapshot => (snapshot.changes || []).map(change => `<span>${escapeHtml(snapshot.sourceActorName || 'Unterstützung')} · ${escapeHtml(change.name || 'Ressource')}: <b>${escapeHtml(change.before)} → ${escapeHtml(change.after)}</b></span>`)).join('');
  const abilityCosts = (Array.isArray(resolution.ruleAbilitySnapshots) ? resolution.ruleAbilitySnapshots : []).map(snapshot => `<span>${escapeHtml(snapshot.change?.name || 'Fähigkeit')}: <b>${escapeHtml(snapshot.change?.before ?? '')} → ${escapeHtml(snapshot.change?.after ?? '')}</b> Nutzungen</span>`).join('');
  const opposedDefense = resolution.opposedDefense
    ? `<span>Gegenprobe: <b>${escapeHtml(resolution.opposedDefense.actorName)} · passive ${escapeHtml(resolution.opposedDefense.skillName)} ${escapeHtml(resolution.opposedDefense.passiveTotal)}</b></span>`
    : '';
  return `
    <aside class="skill-evaluation${challenge ? ' is-challenge' : ''}" data-state="${escapeHtml(resolution.herausforderungTier || resolution.outcome || 'failure')}" aria-label="Fertigkeitsauswertung">
      <div class="skill-evaluation-heading"><span>Probenauswertung</span><strong>${escapeHtml(outcomeLabel)}</strong></div>
      <p>${escapeHtml(narrative)}</p>
      ${challenge ? '<details class="skill-evaluation-details"><summary>Wurf &amp; Auswirkungen ansehen</summary>' : ''}
      <div class="skill-evaluation-mechanics">
        <span><b>${escapeHtml(resolution.total)}</b> ${escapeHtml(resolution.skillName)}</span>
        <span>gegen <b>SG ${escapeHtml(resolution.difficulty)}</b></span>
        ${opposedDefense}
        <span>Bogen ${Number(resolution.profileModifier) >= 0 ? '+' : ''}${escapeHtml(resolution.profileModifier)}${custom ? ` · frei ${custom >= 0 ? '+' : ''}${escapeHtml(custom)}` : ''}${affinity ? ` · Lösung ${affinity >= 0 ? '+' : ''}${escapeHtml(affinity)}` : ''}${ruleModifier ? ` · Regeln ${ruleModifier >= 0 ? '+' : ''}${escapeHtml(ruleModifier)}` : ''}</span>
        ${challengeModifier ? `<span>Ansatz-Malus: <b>${escapeHtml(challengeModifier)}</b> · ${escapeHtml(resolution.challengeModifierReason || 'Vom Ersteller festgelegt')}</span>` : ''}
        ${ruleLedger}
        ${ruleCosts}
        ${abilityCosts}
        ${rewardReceipt ? `<span class="skill-reward-receipt">${isSuccessfulSkillOutcome(resolution.outcome) ? 'Belohnung' : 'Folgen'}: <b>${escapeHtml(rewardReceipt)}</b></span>` : ''}
      </div>
      ${renderChallengeManeuverReceipts(resolution.herausforderungCombatResults)}
      <div class="skill-evaluation-source">${escapeHtml(sourceLabel)}</div>
      ${challenge ? '</details>' : ''}
    </aside>`;
}

function renderChallengeStatus(segment = {}) {
  const challenge = normalizeSkillChallenge(segment.skillChallenge);
  if (!challenge?.id) return '';
  const revealed = revealedChallengeIds.has(challenge.id);
  if (!revealed) return '';
  return '<div class="skill-challenge-status" data-state="revealed"><span>Entlarvt</span><strong>Diese Rede war Schauspiel.</strong><small>Ein erfolgreicher Fertigkeitsversuch hat die Täuschung offengelegt.</small></div>';
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-skill-action="set-mode"]');
  if (!trigger) return;
  setSegmentMode(findComposerSegment(trigger), trigger.dataset.value || 'normal');
});

document.addEventListener('change', event => {
  const field = event.target;
  const segment = findComposerSegment(field);
  if (!segment) return;
  if (field?.matches?.('[data-skill-rule-toggle]')) {
    updateSkillRuleSelection(segment, field);
    remountAll();
    return;
  }
  if (field?.matches?.('[data-skill-input]')) {
    const previousKind = segment.kind;
    updateSegmentField(segment, field.dataset.skillInput, field.type === 'checkbox' ? field.checked : field.value);
    if (field.dataset.skillInput === 'skillId' && previousKind !== segment.kind) { rerenderSegmentEditor(); return; }
    if (field.dataset.skillInput === 'challengeEnabled') rerenderSegmentEditor();
    else if (['skillId', 'targetActorKey', 'targetChallengeId'].includes(field.dataset.skillInput)) {
      remountAll();
      if (field.dataset.skillInput === 'skillId') latestComposerContext?.list?.querySelector(`[data-segment-id="${CSS.escape(String(segment.id))}"] [data-skill-input="skillId"]:checked`)?.focus({ preventScroll: true });
    }
    return;
  }
  if (field?.matches?.('[data-skill-challenge-skill]')) togglePreferredSkill(segment, field.dataset.skillChallengeSkill, field.checked);
});

document.addEventListener('input', event => {
  const search = event.target?.closest?.('[data-skill-target-actor-search]');
  if (!search) return;
  const select = search.closest('[data-skill-composer]')?.querySelector?.('[data-skill-input="targetActorKey"]');
  if (!select) return;
  const query = String(search.value || '').trim().toLocaleLowerCase('de');
  [...select.options].forEach((option, index) => { option.hidden = index > 0 && query && !option.textContent.toLocaleLowerCase('de').includes(query); });
});

globalThis.AleriaSkillChecks = Object.freeze({
  getChallengeAttemptSettings,
  mountComposer(list, context = {}) {
    mountComposers({
      list,
      segments: Array.isArray(context.segments) ? context.segments : [],
      selectedCharacterId: String(context.selectedCharacterId || ''),
      sceneActors: Array.isArray(context.sceneActors) ? context.sceneActors : [],
      threadId: String(context.threadId || '')
    });
  },
  handleSubmission,
  async resolveDraftSegment(segment, submission, resolutionContext) {
    const actors = mergeActors(latestComposerContext?.sceneActors || []);
    const challenges = getComposerChallenges(submission.threadId || '');
    openResolutionDialog();
    try { return await resolveSegment(segment, submission, actors, challenges, 0, 1, resolutionContext); }
    finally { closeResolutionDialog(); }
  },
  narrateCommittedMechanics,
  renderEvaluation,
  renderChallengeStatus,
  setRenderContext(comments = []) {
    revealedChallengeIds = collectRevealedChallengeIds(comments);
  },
  getDisplayText(segment = {}) {
    return String(segment.text || '');
  },
  getDisplayKind(segment = {}) {
    if (segment.skillChallengeEnabled && !segment.skillChallenge) return 'speech';
    const challenge = normalizeSkillChallenge(segment.skillChallenge);
    if (!challenge?.id) return String(segment.commentKind || segment.kind || 'speech');
    return revealedChallengeIds.has(challenge.id) ? 'performance' : 'speech';
  },
  isChallengeRevealed(challengeId) {
    return revealedChallengeIds.has(String(challengeId || ''));
  }
});

export const skillCheckControllerInternals = Object.freeze({
  relationshipBetweenActors,
  buildClientSkillRuleContext
});
