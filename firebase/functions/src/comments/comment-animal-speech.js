import { HttpsError } from 'firebase-functions/v2/https';
import { getAnimalSpeechError, isAnimalSpeechSegment } from '../generated/character-development/development-animal-speech.js';

// Presentation capability only. Read the actual actor record, never trait data
// supplied by the comment. All callers invoke this before transaction writes.
export async function assertCommentAnimalSpeech({ database, transaction, metadata = {} }) {
  const segments = Array.isArray(metadata.commentSegments) ? metadata.commentSegments : [metadata];
  const records = new Map();
  for (const segment of segments.filter(isAnimalSpeechSegment)) {
    const creature = segment.actorType === 'creature' || !!segment.creatureId || !!segment.sceneActorSourceId
      || (!segment.characterId && metadata.actorType === 'creature');
    const id = String(segment.sceneActorSourceId || segment.creatureId || segment.characterId || metadata.creatureId || metadata.characterId || '').trim();
    if (!id || id.length > 160 || id.includes('/')) throw new HttpsError('failed-precondition', 'Für Tiersprache eine gespeicherte Figur mit dem passenden Merkmal wählen.');
    const collection = creature ? 'creatures' : 'characters';
    const key = `${collection}/${id}`;
    if (!records.has(key)) {
      const snapshot = await transaction.get(database.collection(collection).doc(id));
      records.set(key, snapshot.exists ? snapshot.data() : null);
    }
    const error = getAnimalSpeechError(records.get(key));
    if (error) throw new HttpsError('failed-precondition', error);
  }
}
