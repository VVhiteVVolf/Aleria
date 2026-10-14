import { HttpsError } from 'firebase-functions/v2/https';
import { buildSceneItemDefinition, sceneItemDraftFromTemplate } from '../generated/scene-items/scene-item-definition.js';
import { resolveRegisterItemTemplate } from './item-register-template.js';
export const resolveSceneItemTemplate = resolveRegisterItemTemplate;

export async function buildSceneItemSegments(database, transaction, segments, commentId) {
  const result = [];
  for (const [index, segment] of segments.entries()) {
    const kind = segment.kind || segment.commentKind;
    if (!['sceneitem', 'action', 'narrator'].includes(kind) || segment.narrator === false) throw new HttpsError('invalid-argument', 'Gegenstände gehören in einen Erzählerbeitrag.');
    const durationSeconds = Math.max(0, Math.min(86400, Number(segment.durationSeconds) || 0));
    const common = { kind, commentKind: kind, narrator: true, charName: 'Erzähler', characterId: '', durationSeconds };
    if (kind !== 'sceneitem') {
      const text = String(segment.text || '').trim().slice(0, 10000);
      if (text) result.push({ ...common, text });
      continue;
    }
    const draft = segment.sceneItemDraft || {};
    const template = await resolveSceneItemTemplate(database, transaction, draft);
    const sceneItemId = `${commentId}-${index}`;
    let item;
    try { item = buildSceneItemDefinition({ ...sceneItemDraftFromTemplate(template || {}), ...draft }, template, sceneItemId); }
    catch (error) { throw new HttpsError('invalid-argument', error.message); }
    const text = String(draft.sceneText || item.description).trim().slice(0, 1800);
    result.push({ ...common, text, sceneItemEvent: { operation: 'place', sceneItemId, item, text, sourceActorId: '' } });
  }
  return result;
}
