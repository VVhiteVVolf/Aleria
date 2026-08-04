import { sceneDiceService } from '../scene-dice/dice-service.js?v=20260802-dice-audio-v2';
import { CombatProfileResolver } from '../combat/combat-profile-resolver.js?v=20260804-referee-v2';
import {
  SKILL_DEFINITIONS,
  buildSkillRollNotation,
  classifySkillCheck,
  collectRevealedChallengeIds,
  collectRecentSkillChallenges,
  getChallengeAffinityModifier,
  getChallengeId,
  getSkillDefinition,
  getSkillsForCommentKind,
  isSuccessfulSkillOutcome,
  normalizeMechanicMode,
  normalizeSkillChallenge,
  normalizeSkillCheckSettings,
  resolveSkillModifier
} from './skill-check-model.js?v=20260803-skill-checks-v2';
import { narrateSkillResolution } from './skill-check-narration.js?v=20260803-skill-checks-v2';
import { SkillResolutionService } from './skill-resolution-service.js?v=20260804-referee-v2';
import { collectCombatTriggerRules, deriveCombatRuleFrequencyKeys } from '../combat/combat-trigger-rules.js?v=20260804-referee-v2';

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
let latestComposerContext = null;
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
  const firstTeam = String(first.combatTeam || first.fraktion || first.faction || '').trim().toLocaleLowerCase('de');
  const secondTeam = String(second.combatTeam || second.fraktion || second.faction || '').trim().toLocaleLowerCase('de');
  return firstTeam && secondTeam && firstTeam === secondTeam ? 'ally' : 'enemy';
}

function buildClientSkillRuleContext(segment, actor, actorProfile, targetChallenge, actors = []) {
  const targetActor = targetChallenge
    ? actors.find(candidate => [targetChallenge.authorId, targetChallenge.authorKey].includes(String(candidate?.id || ''))) || null
    : null;
  const targetProfile = targetActor ? profileResolver.resolve(targetActor) : null;
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
  if (targetActor && targetProfile) sources.push({
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
  (Array.isArray(segment.skillRuleSelections) ? segment.skillRuleSelections : []).forEach(selection => {
    const actorId = String(selection?.sourceActorId || '');
    if (!actorId) return;
    const current = groupedSelections.get(actorId) || { actorId, ruleIds: [], distanceMeters: Number(selection?.distanceMeters) || 0 };
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
    const supportProfile = profileResolver.resolve(supportActor);
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

function getComposerChallenges(threadId) {
  const comments = globalThis.getCachedCommentsForThread?.(threadId) || [];
  const revealed = collectRevealedChallengeIds(comments);
  return collectRecentSkillChallenges(comments, 3).filter(challenge => !revealed.has(challenge.id));
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

function renderSkillSupportOptions(segment, actor, actors = []) {
  const selected = new Set((Array.isArray(segment.skillRuleSelections) ? segment.skillRuleSelections : [])
    .map(item => `${item.sourceActorId}:${item.ruleId}`));
  const options = [];
  actors.filter(candidate => String(candidate?.id || '') !== String(actor?.id || '')).forEach(candidate => {
    const profile = profileResolver.resolve(candidate);
    const rules = collectCombatTriggerRules(profile)
      .filter(rule => rule.activation === 'reaction' && (!rule.actionKinds.length || rule.actionKinds.includes('skill')));
    if (profile.aura?.enabled) rules.unshift({ id: '@aura:actor', entryKind: 'aura', entryId: 'aura', entryName: profile.aura.name || 'Aura', name: 'Aura auf Probe' });
    rules.forEach(rule => options.push({ candidate, profile, rule }));
  });
  if (!options.length) return '';
  return `<fieldset class="skill-check-support"><legend>Unterstützung & Reaktionen</legend>
    <p>Nur ausdrücklich gewählte Reaktionen werden verbraucht. Passive Regeln des Gegenspielers prüft der Server automatisch.</p>
    <div>${options.map(({ candidate, profile, rule }) => {
      const ruleId = rule.id === '@aura:actor' ? rule.id : (rule.id || `${rule.entryKind}:${rule.entryId}`);
      const key = `${candidate.id}:${ruleId}`;
      const persistence = profile.persistence || {};
      return `<label><input type="checkbox" data-skill-rule-toggle data-source-actor-id="${escapeHtml(candidate.id)}" data-rule-id="${escapeHtml(ruleId)}" data-persistence-kind="${escapeHtml(persistence.kind)}" data-record-id="${escapeHtml(persistence.recordId)}" data-source-creature-id="${escapeHtml(persistence.sourceCreatureId)}"${selected.has(key) ? ' checked' : ''}> <b>${escapeHtml(candidate.name)}</b> · ${escapeHtml(rule.name || rule.entryName)}</label>`;
    }).join('')}</div>
  </fieldset>`;
}

function renderSkillComposer(segment, actor, challenges, actors = []) {
  if (normalizeMechanicMode(segment?.mechanicMode, segment) !== 'skill') return '';
  const kindSkills = getSkillsForCommentKind(segment.kind);
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
  segment.skillRollMode = settings.rollMode;
  segment.skillTargetChallengeId = settings.targetChallengeId;
  const actorKey = String(actor?.id || '');
  const availableChallenges = challenges.filter(challenge => !actorKey || challenge.authorKey !== actorKey);
  const selectedTarget = availableChallenges.find(challenge => challenge.id === settings.targetChallengeId) || null;
  const selectedTargetActorKey = String(segment.skillTargetActorKey || selectedTarget?.authorKey || '');
  const targetActors = [...new Map(availableChallenges.map(challenge => [challenge.authorKey, {
    key: challenge.authorKey,
    name: challenge.authorName
  }])).values()];
  const actorChallenges = selectedTargetActorKey
    ? availableChallenges.filter(challenge => challenge.authorKey === selectedTargetActorKey)
    : [];
  const target = actorChallenges.find(challenge => challenge.id === settings.targetChallengeId) || null;
  if (settings.targetChallengeId && !target) {
    segment.skillTargetChallengeId = '';
    settings.targetChallengeId = '';
  }
  let profileDetail = 'Charakterbogen fehlt';
  if (actor && segment.skillId) {
    const skill = resolveSkillModifier(actor, segment.skillId);
    const sign = skill.modifier >= 0 ? '+' : '';
    profileDetail = `${sign}${skill.modifier} aus ${skill.source === 'character-sheet' ? 'Fertigkeit & Attribut' : 'Attribut (Fertigkeit noch leer)'}`;
  }
  return `
    <section class="skill-check-composer" data-skill-composer>
      <div class="skill-check-composer-title"><span>Fertigkeitsauswertung</span><strong>Würfelt erst beim Eintragen</strong></div>
      ${actor ? '' : '<p class="skill-check-warning">Wähle zuerst eine Figur mit Charakter- oder Kreaturenbogen.</p>'}
      <div class="skill-check-fields">
        <label>Fertigkeit
          <select data-skill-input="skillId">
            ${kindSkills.map(skill => `<option value="${skill.id}"${skill.id === segment.skillId ? ' selected' : ''}>${escapeHtml(skill.label)}</option>`).join('')}
          </select>
          <small>${escapeHtml(profileDetail)}</small>
        </label>
        <label class="skill-check-target-search">Figur durchsuchen
          <input type="search" data-skill-target-actor-search placeholder="Name der Figur …" autocomplete="off">
        </label>
        <label>Ziel-Figur
          <select data-skill-input="targetActorKey">
            <option value="">Freier Versuch ohne verdecktes Ziel</option>
            ${targetActors.map(targetActor => `<option value="${escapeHtml(targetActor.key)}"${targetActor.key === selectedTargetActorKey ? ' selected' : ''}>${escapeHtml(targetActor.name)}</option>`).join('')}
          </select>
        </label>
        <label>Beitrag dieser Figur
          <select data-skill-input="targetChallengeId">
            <option value="">${selectedTargetActorKey ? 'Beitrag wählen' : 'Zuerst eine Figur wählen'}</option>
            ${actorChallenges.map(challenge => `<option value="${escapeHtml(challenge.id)}"${challenge.id === target?.id ? ' selected' : ''}>${escapeHtml(getContributionRankLabel(challenge.contributionRank))} · ${escapeHtml(challenge.visibleText.slice(0, 80) || 'Beitrag ohne Text')}</option>`).join('')}
          </select>
        </label>
        <label>Schwierigkeit
          <input type="number" min="1" max="40" value="${target?.difficulty ?? settings.difficulty}" data-skill-input="difficulty"${target ? ' disabled' : ''}>
          <small>${target ? 'Wird von der Herausforderung vorgegeben' : 'SG 10 ist ein einfacher Standardversuch'}</small>
        </label>
        <label>Eigener Bonus / Debuff
          <input type="number" min="-99" max="99" value="${settings.customModifier}" data-skill-input="customModifier">
          <small>Optional, 0 lässt den Bogenwert unverändert</small>
        </label>
        <label>Wurfart
          <select data-skill-input="rollMode">
            <option value="normal"${settings.rollMode === 'normal' ? ' selected' : ''}>Normal</option>
            <option value="advantage"${settings.rollMode === 'advantage' ? ' selected' : ''}>Vorteil</option>
            <option value="disadvantage"${settings.rollMode === 'disadvantage' ? ' selected' : ''}>Nachteil</option>
          </select>
        </label>
      </div>
      ${target ? `<div class="skill-check-target-note"><b>${escapeHtml(target.authorName)} · ${escapeHtml(getContributionRankLabel(target.contributionRank))}</b><span>Bevorzugte Fertigkeiten: ${escapeHtml(target.preferredSkills.map(id => getSkillDefinition(id)?.label).filter(Boolean).join(', ') || 'keine')}</span></div>` : ''}
      ${renderSkillSupportOptions(segment, actor, actors)}
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
          <div class="skill-challenge-skills"><span>Bevorzugte Lösungen</span>${SKILL_DEFINITIONS.map(skill => `<label><input type="checkbox" data-skill-challenge-skill="${skill.id}"${preferred.has(skill.id) ? ' checked' : ''}>${escapeHtml(skill.label)}</label>`).join('')}</div>
          <label>Bonus bevorzugt<input type="number" min="-20" max="20" value="${clampNumber(segment.skillChallengePreferredModifier, 2, -20, 20)}" data-skill-input="challengePreferredModifier"></label>
          <label>Modifikator andere Fertigkeit<input type="number" min="-20" max="20" value="${clampNumber(segment.skillChallengeAlternativeModifier, -2, -20, 20)}" data-skill-input="challengeAlternativeModifier"></label>
        </div>
        <p class="skill-challenge-privacy">Der Abschnitt wird als gewöhnliche Rede veröffentlicht. Erst eine erfolgreiche Auswertung entlarvt ihn als Schauspiel.</p>` : ''}
    </section>`;
}

function mountComposers(context = {}) {
  latestComposerContext = context;
  const segments = Array.isArray(context.segments) ? context.segments : [];
  const needsSkillComposer = segments.some(segment => normalizeMechanicMode(segment?.mechanicMode, segment) === 'skill');
  const actors = needsSkillComposer ? mergeActors(context.sceneActors || []) : [];
  const challenges = needsSkillComposer ? getComposerChallenges(context.threadId || '') : [];
  segments.forEach(segment => {
    const card = context.list?.querySelector?.(`[data-segment-id="${CSS.escape(String(segment.id || ''))}"]`);
    const host = card?.querySelector?.('[data-segment-mechanics-host]');
    if (!host) return;
    const actor = needsSkillComposer ? getActorForSegment(segment, context.selectedCharacterId, actors) : null;
    host.innerHTML = `${renderModeControl(segment)}${renderSkillComposer(segment, actor, challenges, actors)}${renderChallengeComposer(segment)}`;
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
  if (field === 'skillId') segment.skillId = String(value || '');
  if (field === 'targetActorKey') {
    segment.skillTargetActorKey = String(value || '');
    segment.skillTargetChallengeId = '';
  }
  if (field === 'targetChallengeId') segment.skillTargetChallengeId = String(value || '');
  if (field === 'difficulty') segment.skillDifficulty = clampNumber(value, 10, 1, 40);
  if (field === 'customModifier') segment.skillCustomModifier = clampNumber(value, 0, -99, 99);
  if (field === 'rollMode') segment.skillRollMode = ['advantage', 'disadvantage'].includes(value) ? value : 'normal';
  if (field === 'challengeEnabled') {
    segment.skillChallengeEnabled = !!value;
    if (segment.skillChallengeEnabled) {
      segment.kind = 'performance';
      segment.mechanicMode = 'normal';
      segment.combatPaymentConfirmed = false;
    }
  }
  if (field === 'challengeDifficulty') segment.skillChallengeDifficulty = clampNumber(value, 10, 1, 40);
  if (field === 'challengePreferredModifier') segment.skillChallengePreferredModifier = clampNumber(value, 2, -20, 20);
  if (field === 'challengeAlternativeModifier') segment.skillChallengeAlternativeModifier = clampNumber(value, -2, -20, 20);
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
      <span>Fertigkeitsauswertung</span>
      <h2>Die Würfel entscheiden</h2>
      <div class="skill-dice-stage" data-skill-dice-stage></div>
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
  const allowed = getSkillsForCommentKind(segment.commentKind || segment.kind);
  const settings = normalizeSkillCheckSettings({
    skillId: segment.skillId || allowed[0]?.id,
    customModifier: segment.skillCustomModifier,
    difficulty: segment.skillDifficulty,
    rollMode: segment.skillRollMode,
    targetChallengeId: segment.skillTargetChallengeId
  });
  if (!allowed.some(skill => skill.id === settings.skillId)) throw new Error('Wähle für jeden Fertigkeitsversuch eine zur Blase passende Fertigkeit.');
  const targetChallenge = challenges.find(challenge => challenge.id === settings.targetChallengeId) || null;
  if (settings.targetChallengeId && !targetChallenge) throw new Error('Die gewählte verdeckte Herausforderung ist nicht mehr verfügbar.');
  const profile = profileResolver.resolve(actor);
  const ruleContext = buildClientSkillRuleContext(segment, actor, profile, targetChallenge, actors);
  const stage = document.querySelector('[data-skill-dice-stage]');
  if (stage) stage.innerHTML = '';
  const definition = getSkillDefinition(settings.skillId);
  setResolutionStatus(total > 1 ? `Fertigkeitsversuch ${index + 1} von ${total} …` : `${definition?.label || 'Fertigkeit'} wird gewürfelt …`);
  const resolution = await skillResolutionService.resolve({
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
  resolutionContext.usedRuleFrequencyKeys = new Set(resolution.usedRuleFrequencyKeys || []);
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
  const skillSegments = segments.filter(segment => normalizeMechanicMode(segment?.mechanicMode, segment) === 'skill');
  const hasChallenges = segments.some(segment => segment?.skillChallengeEnabled
    && String(segment.kind || segment.commentKind || '') === 'performance');
  if (!skillSegments.length && !hasChallenges) return { handled: false, published: false };
  const actors = mergeActors(latestComposerContext?.sceneActors || []);
  const challenges = getComposerChallenges(submission.threadId || '');
  const comments = globalThis.getCachedCommentsForThread?.(submission.threadId || '') || [];
  const timeline = typeof globalThis.buildSceneTimeline === 'function' ? globalThis.buildSceneTimeline(comments) : [];
  const lastTimedEntry = [...timeline].reverse().find(entry => Number.isFinite(entry?.endSeconds));
  const day = typeof globalThis.getSceneDayFromSeconds === 'function'
    ? globalThis.getSceneDayFromSeconds(lastTimedEntry?.endSeconds || 0)
    : 1;
  const rulePeriods = {
    comment: `draft:${String(submission.threadId || '')}:${Date.now()}`,
    scene: String(submission.threadId || ''),
    day: `scene:${String(submission.threadId || '')}:day-${day}`
  };
  const resolutionContext = {
    rulePeriods,
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

function renderEvaluation(source = {}) {
  const resolution = source.skillResolution || source.resolution;
  if (!resolution?.resolutionId) return '';
  const sourceLabel = resolution.narration?.source === 'aleria-gpt' ? 'AleriaGPT-Auswertung' : 'Systemauswertung · ohne KI';
  const affinity = Number(resolution.affinityModifier || 0);
  const custom = Number(resolution.customModifier || 0);
  const ruleModifier = Number(resolution.ruleModifier || 0);
  const ruleLedger = (Array.isArray(resolution.ruleApplications) ? resolution.ruleApplications : []).map(rule => (
    `<span class="skill-rule-ledger"><b>${escapeHtml(rule.sourceActorName || 'Regelquelle')} · ${escapeHtml(rule.ruleName)}</b><small>${escapeHtml(rule.before?.total ?? rule.before?.modifier ?? '')} → ${escapeHtml(rule.after?.total ?? rule.after?.modifier ?? '')}</small></span>`
  )).join('');
  const ruleCosts = (Array.isArray(resolution.ruleResourceSnapshots) ? resolution.ruleResourceSnapshots : []).flatMap(snapshot => (snapshot.changes || []).map(change => `<span>${escapeHtml(snapshot.sourceActorName || 'Unterstützung')} · ${escapeHtml(change.name || 'Ressource')}: <b>${escapeHtml(change.before)} → ${escapeHtml(change.after)}</b></span>`)).join('');
  const abilityCosts = (Array.isArray(resolution.ruleAbilitySnapshots) ? resolution.ruleAbilitySnapshots : []).map(snapshot => `<span>${escapeHtml(snapshot.change?.name || 'Fähigkeit')}: <b>${escapeHtml(snapshot.change?.before ?? '')} → ${escapeHtml(snapshot.change?.after ?? '')}</b> Nutzungen</span>`).join('');
  const opposedDefense = resolution.opposedDefense
    ? `<span>Gegenprobe: <b>${escapeHtml(resolution.opposedDefense.actorName)} · passive ${escapeHtml(resolution.opposedDefense.skillName)} ${escapeHtml(resolution.opposedDefense.passiveTotal)}</b></span>`
    : '';
  return `
    <aside class="skill-evaluation" data-state="${escapeHtml(resolution.outcome || 'failure')}" aria-label="Fertigkeitsauswertung">
      <div class="skill-evaluation-heading"><span>Fertigkeitsauswertung</span><strong>${escapeHtml(getOutcomeLabel(resolution.outcome))}</strong></div>
      <p>${escapeHtml(resolution.narration?.text || '')}</p>
      <div class="skill-evaluation-mechanics">
        <span><b>${escapeHtml(resolution.total)}</b> ${escapeHtml(resolution.skillName)}</span>
        <span>gegen <b>SG ${escapeHtml(resolution.difficulty)}</b></span>
        ${opposedDefense}
        <span>Bogen ${Number(resolution.profileModifier) >= 0 ? '+' : ''}${escapeHtml(resolution.profileModifier)}${custom ? ` · frei ${custom >= 0 ? '+' : ''}${escapeHtml(custom)}` : ''}${affinity ? ` · Lösung ${affinity >= 0 ? '+' : ''}${escapeHtml(affinity)}` : ''}${ruleModifier ? ` · Regeln ${ruleModifier >= 0 ? '+' : ''}${escapeHtml(ruleModifier)}` : ''}</span>
        ${ruleLedger}
        ${ruleCosts}
        ${abilityCosts}
      </div>
      <div class="skill-evaluation-source">${escapeHtml(sourceLabel)}</div>
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
    return;
  }
  if (field?.matches?.('[data-skill-input]')) {
    updateSegmentField(segment, field.dataset.skillInput, field.type === 'checkbox' ? field.checked : field.value);
    if (field.dataset.skillInput === 'challengeEnabled') rerenderSegmentEditor();
    else if (['skillId', 'targetActorKey', 'targetChallengeId'].includes(field.dataset.skillInput)) remountAll();
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
