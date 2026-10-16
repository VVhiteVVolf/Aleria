import { HttpsError } from 'firebase-functions/v2/https';
import { normalizeChallengeTarget } from '../generated/herausforderung/herausforderung-target.js';

// Resolve authored identity metadata once inside the existing transaction.
// Attempts later reload the actual sheet; no live profile is copied or changed.
export async function bindHerausforderungTarget(database, transaction, event) {
  const target = normalizeChallengeTarget(event.targetActor);
  if (!target.actorId) return;
  const persistence = target.persistence;
  const recordId = persistence.kind === 'scene-creature' ? persistence.sourceCreatureId : persistence.recordId;
  const collection = persistence.kind === 'character' ? 'characters' : 'creatures';
  const snapshot = await transaction.get(database.collection(collection).doc(recordId));
  if (!snapshot.exists) throw new HttpsError('not-found', 'Der Bogen der Zielperson wurde nicht gefunden.');
  event.targetActor = { ...target, name: String(snapshot.data().name || target.name || 'Zielperson').slice(0, 180) };
}
