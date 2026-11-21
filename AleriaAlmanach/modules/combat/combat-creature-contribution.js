import { getCommentActorIds } from './combat-condition-duration.js';
import { CREATURE_TURN_END_ID, getEscapeActionId, getHeldCondition, hasCreatureTurnEnd } from './combat-creature-actions.js';
import { COMBAT_WAIT_ACTION } from './combat-wait-action.js';

const segmentActorId = (segment, fallbackId) => String(segment.sceneActorId || segment.actorId || segment.characterId || fallbackId || '');

function contributionProfiles(segments, characterId, profileFor) {
  return [...getCommentActorIds({ characterId, commentSegments: segments })].map(profileFor)
    .filter(profile => profile?.currentHitPoints > 0);
}

export const hasCreatureContribution = (segments, characterId, profileFor) => contributionProfiles(segments, characterId, profileFor)
  .some(profile => getHeldCondition(profile) || hasCreatureTurnEnd(profile));

function targetedByHold(segments, characterId, profiles) {
  const byId = new Map(profiles.map(profile => [profile.characterId, profile]));
  const targets = new Set();
  for (const segment of segments) {
    if (!segment.combatActionId) continue;
    const actor = byId.get(segmentActorId(segment, characterId));
    if (!actor?.actions.some(action => action.id === segment.combatActionId && action.holdAction)) continue;
    for (const id of segment.combatTargetIds?.length ? segment.combatTargetIds : [segment.combatTargetId]) targets.add(id);
  }
  return targets;
}

function creatureSegment(profile, combatActionId, text) {
  return { kind: 'speech', commentKind: 'speech', mechanicMode: 'combat', actorId: profile.characterId, characterId: profile.characterId,
    charName: profile.name, portrait: profile.portrait || '', text, combatActionId,
    combatTargetId: profile.characterId, combatTargetIds: [profile.characterId], combatPaymentConfirmed: true, combatRollMode: 'normal',
    creatureAutomatic: true };
}

export function withCreatureContribution(segments, characterId, profileFor, previews = new Map()) {
  const prepared = segments.slice();
  const profiles = contributionProfiles(segments, characterId, profileFor);
  const holdTargets = targetedByHold(segments, characterId, profiles);
  for (const profile of profiles) {
    const waits = segments.some(segment => segmentActorId(segment, characterId) === profile.characterId
      && segment.combatActionId === COMBAT_WAIT_ACTION.id);
    if (holdTargets.has(profile.characterId) || (!waits && getHeldCondition(profile))) {
      const method = previews.get(profile.characterId)?.method || 'dexterity';
      prepared.push(creatureSegment(profile, getEscapeActionId(method), 'Die Figur versucht, sich aus dem Griff zu befreien.'));
    }
    if (hasCreatureTurnEnd(profile)) prepared.push(creatureSegment(profile, CREATURE_TURN_END_ID, 'Trollblut wird am Ende des Beitrags ausgewertet.'));
  }
  return prepared;
}
