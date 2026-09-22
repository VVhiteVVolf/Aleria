import { HttpsError } from 'firebase-functions/v2/https';
import { STANDARD_ITEMS } from '../generated/item-register/item-register-standard.js';
import { normalizeOffer } from '../generated/item-register/item-register-model.js';
import { buildSceneItemDefinition, sceneItemDraftFromTemplate } from '../generated/scene-items/scene-item-definition.js';
import { resolveModuleProduct } from './item-register-module-source.js';

export async function resolveSceneItemTemplate(database, transaction, draft) {
  if (!draft.template) return null;
  let template = STANDARD_ITEMS.find(item => item.id === draft.template);
  if (!template && draft.moduleId) template = await resolveModuleProduct({ database, transaction, standards: STANDARD_ITEMS,
    input: { moduleId: draft.moduleId, productId: draft.template, sourceRevision: draft.sourceRevision } });
  if (!template && /^offer:[\w:.-]{1,210}$/.test(draft.template)) {
    const snapshot = await transaction.get(database.collection('item_register_offers').doc(draft.template));
    if (snapshot.exists) template = normalizeOffer({ ...snapshot.data(), id: snapshot.id }, STANDARD_ITEMS);
  }
  if (!template || template.archived || ['pferde', 'vieh'].includes(template.category)) {
    throw new HttpsError('invalid-argument', 'Diese Registervorlage ist nicht als Szenengegenstand verfügbar.');
  }
  return template;
}

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
