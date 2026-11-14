import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { collectSceneElementParticipants } from '../generated/scene-elements/scene-element-conditions.js';
import { nextMechanicalCommentOrderKey } from '../mechanics/mechanical-comment-order.js';
import { assertPublicInteraction } from './scene-element-evaluation.js';

export async function recordSceneElementInteraction(database, entryId, interaction, operationId, auth, now) {
  if (typeof operationId !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(operationId)) throw new HttpsError('invalid-argument', 'Die Interaktion benötigt eine gültige Vorgangskennung.');
  const ref = database.collection('comments').doc('interaction-' + createHash('sha256').update(auth.uid + '\0' + operationId).digest('hex'));
  const fingerprint = createHash('sha256').update(JSON.stringify({ entryId, interaction })).digest('hex');
  await database.runTransaction(async transaction => {
    const previous = await transaction.get(ref);
    if (previous.exists) {
      if (previous.data().sceneElementInteraction.fingerprint !== fingerprint) throw new HttpsError('failed-precondition', 'Dieser Interaktionsauftrag wurde bereits mit anderem Inhalt gespeichert.');
      return;
    }
    const snapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    assertPublicInteraction(history, interaction);
    const participant = collectSceneElementParticipants(history).find(actor => actor.actorId === interaction.actorId);
    const actor = await transaction.get(database.collection(participant.kind === 'creature' ? 'creatures' : 'characters').doc(participant.recordId));
    if (!actor.exists) throw new HttpsError('not-found', 'Die interagierende Figur besitzt keinen verfügbaren Bogen.');
    const source = history.find(comment => comment.id === interaction.sourceId || comment.sceneElementSignal?.id === interaction.sourceId);
    const sourceTitle = source.herausforderung?.title || source.sceneElementSignal?.title || 'einer Auffälligkeit';
    const actorName = String(actor.data().name || interaction.actorId).slice(0, 160);
    transaction.create(ref, { entryId, narrator: true, charName: 'Erzähler', commentMode: 'scene-element', commentKind: 'scene-element-interaction',
      text: `${actorName} interagiert mit ${sourceTitle}.`, commentSegments: null, createdBy: auth.uid,
      sceneElementInteraction: { ...interaction, receiptId: ref.id, actorName, sourceTitle, fingerprint },
      serverValidatedMechanics: true, mechanicalAudit: true, orderKey: nextMechanicalCommentOrderKey(history, null, now),
      createdAtClient: now, activityAtClient: now, ts: FieldValue.serverTimestamp() });
  });
  return ref.id;
}
