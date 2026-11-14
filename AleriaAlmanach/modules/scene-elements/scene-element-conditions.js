import { getPassivePerception } from '../combat/combat-profile-model.js';
import { resolveSkillModifier } from '../skill-checks/skill-check-model.js';
import { getHealthTaskError } from '../character-health/health-trait-policy.js';
import { getVoluntaryCombatActionBlock } from '../combat/combat-action-permission.js';

// A roleplay contribution is counted once per document, regardless of how many
// actors/segments it contains. System cards and imports are not contributions.
export function getSceneElementContributors(comment = {}) {
  if (comment.importedHistoricalMechanics || (!comment.serverCommitted && !comment.serverValidatedMechanics)
    || comment.sceneElementSignal || comment.herausforderung || comment.narrator
    || comment.combatEncounter || comment.sceneTrade || comment.sceneRest || comment.sceneRegeneration
    || comment.sceneTimeEvent || comment.sceneTransition || comment.fazit || comment.itemShowcase
    || comment.documentAttachment || comment.moduleInsert || comment.sceneDiceRoll || comment.scenePoll
    || comment.combatStatus || comment.sceneInventoryTransfer || comment.sceneItemEvent) return [];
  const actors = new Map();
  const remember = (id, kind = 'character', recordId = id) => {
    if (!id || !recordId || String(id).includes('/') || String(recordId).includes('/')) return;
    actors.set(String(id), { actorId: String(id), kind: kind === 'creature' ? 'creature' : 'character', recordId: String(recordId) });
  };
  for (const segment of Array.isArray(comment.commentSegments) ? comment.commentSegments : []) {
    if (segment.narrator || segment.avatarKind === 'narrator' || segment.isNarrator) continue;
    const persistence = segment.skillResolution?.actorPersistence || segment.combatResolution?.actorPersistence;
    const id = segment.sceneActorId || segment.actorId || segment.characterId || segment.skillResolution?.actorId || segment.combatResolution?.actorId;
    const creature = persistence?.kind === 'creature' || persistence?.kind === 'scene-creature' || segment.actorType === 'creature' || segment.creatureId;
    remember(id, creature ? 'creature' : 'character', persistence?.recordId || persistence?.sourceCreatureId || segment.sceneActorSourceId || segment.creatureId || id);
  }
  if (!actors.size && comment.characterId && comment.avatarKind !== 'narrator') {
    remember(comment.characterId, comment.actorType === 'creature' ? 'creature' : 'character', comment.creatureId || comment.characterId);
  }
  return [...actors.values()];
}

export function collectSceneElementParticipants(comments = []) {
  const participants = new Map();
  for (const comment of comments) for (const actor of getSceneElementContributors(comment)) participants.set(actor.actorId, actor);
  return [...participants.values()].sort((a, b) => a.actorId.localeCompare(b.actorId));
}

export function getSceneElementPassiveValue(profile, condition) {
  if (getHealthTaskError(profile, { sense: condition.requiredSense }) || getVoluntaryCombatActionBlock(profile)) return null;
  // Preserve the sheet's explicit passive-perception bonuses; ordinary passive
  // skill conditions use the same trained skill total, with no invented +5 rule.
  return condition.skillId === 'perception' ? getPassivePerception(profile) : 10 + resolveSkillModifier(profile, condition.skillId).modifier;
}

export function evaluateSceneElementConditions(activation, { commentCount = 0, profiles = [], interactions = [], elementId = '' } = {}) {
  const receipts = activation.conditions.map(condition => {
    if (condition.type === 'comments') return { type: 'comments', satisfied: commentCount >= condition.minimum, actual: commentCount, minimum: condition.minimum };
    if (condition.type === 'interaction') {
      const interaction = interactions.find(entry => entry.sourceId === (condition.sourceId || elementId));
      return { type: 'interaction', satisfied: !!interaction, actorId: interaction?.actorId || '' };
    }
    const matches = profiles.map(({ actorId, name, profile }) => ({ actorId, name, total: getSceneElementPassiveValue(profile, condition) }))
      .filter(actor => actor.total !== null && actor.total >= condition.minimum);
    return { type: 'passive', satisfied: matches.length > 0, skillId: condition.skillId, minimum: condition.minimum, matches };
  });
  return { satisfied: receipts.length > 0 && (activation.mode === 'all' ? receipts.every(receipt => receipt.satisfied) : receipts.some(receipt => receipt.satisfied)), receipts };
}
