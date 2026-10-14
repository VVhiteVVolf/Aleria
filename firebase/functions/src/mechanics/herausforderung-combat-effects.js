import { HttpsError } from 'firebase-functions/v2/https';
import { getActiveCombatEncounter } from '../generated/combat/combat-encounter-model.js';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState } from '../generated/combat/combat-state-model.js';
import { getPersistentCombatResources, recoverDailyCombatResources } from '../generated/combat/combat-action-economy.js';
import { reconcileConcentrationConditions } from '../generated/combat/combat-condition-lifecycle.js';
import { applyChallengeCombatBenefits, applyChallengeCombatSnapshots } from '../generated/herausforderung/herausforderung-combat-effects.js';
import { getChallengeCombatParticipants, challengeCombatTargetIds, getChallengeCombatBindingError, challengeRequiresCombat } from '../generated/herausforderung/herausforderung-combat-context.js';
import { isTrustedMechanicalComment, sortSceneHistory } from './trusted-scene-history.js';
import { ProvidedDiceAdapter } from './provided-dice-adapter.js';

export async function bindHerausforderungCombatContext(database, transaction, event, entryId) {
  if (event.audience.mode === 'selected') for (const actorId of event.audience.actorIds) {
    if (actorId.includes('/')) throw new HttpsError('invalid-argument', 'Eine Figuren-ID ist ungültig.');
    const character = await transaction.get(database.collection('characters').doc(actorId));
    if (!character.exists) {
      const creature = await transaction.get(database.collection('creatures').doc(actorId));
      if (!creature.exists) throw new HttpsError('invalid-argument', 'Eine Figur der Zielgruppe ist nicht verfügbar.');
    }
  }
  const targetIds = [...new Set(event.approaches.flatMap(challengeCombatTargetIds))];
  const requiresCombat = event.combatBound || challengeRequiresCombat(event.approaches);
  event.combatContext = { encounterId: '' };
  if (!requiresCombat) return;
  const snapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
  const history = sortSceneHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))).filter(isTrustedMechanicalComment);
  const encounter = getActiveCombatEncounter(history);
  if (!encounter) throw new HttpsError('failed-precondition', 'Für diese Herausforderung ist ein aktiver Kampf erforderlich.');
  const participants = getChallengeCombatParticipants(encounter);
  if (targetIds.some(id => !participants.some(participant => participant.actorId === id))) throw new HttpsError('invalid-argument', 'Kampfwirkungen dürfen nur aktive Teilnehmer dieses Kampfes treffen.');
  event.combatBound = true;
  event.combatContext = { encounterId: encounter.encounterId };
}

export function challengeCombatDescriptors(challenge, encounter) {
  return challengeCombatTargetIds(challenge).map(actorId => {
    const participant = getChallengeCombatParticipants(encounter).find(participant => participant.actorId === actorId);
    if (!participant) throw new HttpsError('failed-precondition', 'Ein Empfänger ist nicht mehr im aktiven Kampf.');
    return { role: 'challenge-effect', actorId, persistence: participant.persistence };
  });
}

export async function stageHerausforderungCombatBenefits({ challenge, actorId, benefits, identity, encounter, submitted, descriptors,
  records, recordEntries, workingStates, persistentUpdates, recoveryDayKey }) {
  const error = getChallengeCombatBindingError(challenge, encounter, actorId);
  if (error) throw new HttpsError('failed-precondition', error);
  const recipients = new Map();
  for (const id of new Set([actorId, ...[...(benefits.effects || []), ...(benefits.combatEffects || [])].map(effect => effect.targetActorId).filter(Boolean)])) {
    const descriptor = descriptors.find(descriptor => descriptor.actorId === id);
    if (!descriptor) throw new HttpsError('failed-precondition', 'Die Profilquelle einer Kampfwirkung fehlt.');
    const key = `${descriptor.persistence.kind}:${descriptor.persistence.recordId}`;
    const record = records.get(key);
    const state = workingStates.get(id) || {};
    const profile = overlayCombatHitPointState(resolveCombatProfile({ ...record, id }), state);
    profile.resources = recoverDailyCombatResources(profile.resources, recoveryDayKey);
    recipients.set(id, { profile, state: { ...state, resources: profile.resources }, descriptor, key, record });
  }
  let combat;
  try {
    combat = await applyChallengeCombatBenefits({ actorId, benefits, recipients, identity, encounterId: encounter?.encounterId || '',
      dice: new ProvidedDiceAdapter({ effectResults: submitted.herausforderungCombatResults || [], secondarySaves: submitted.herausforderungCombatSaves || [] }) });
  } catch (error) { throw error instanceof HttpsError ? error : new HttpsError('failed-precondition', error.message); }
  applyChallengeCombatSnapshots(workingStates, combat.snapshots);
  reconcileConcentrationConditions(workingStates);
  for (const snapshot of combat.snapshots) {
    const recipient = recipients.get(snapshot.actorId);
    if (!recipient.descriptor.persistence.persistent) continue;
    const update = persistentUpdates.get(recipient.key) || { entry: recordEntries.find(entry => entry.key === recipient.key), record: recipient.record };
    const hp = value => JSON.stringify([value.current, value.maximum, value.temporary]);
    if (hp(snapshot.before) !== hp(snapshot.after)) update.hitPoints = { current: snapshot.after.current, maximum: snapshot.after.maximum, temporary: snapshot.after.temporary };
    if (JSON.stringify(snapshot.before.resources) !== JSON.stringify(snapshot.after.resources)) update.resources = getPersistentCombatResources(recipient.profile.resources, snapshot.after.resources);
    if (update.hitPoints || update.resources) persistentUpdates.set(recipient.key, update);
  }
  return combat;
}
