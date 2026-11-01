import { HttpsError } from 'firebase-functions/v2/https';
import { buildSceneItemDefinition, sceneItemDraftFromTemplate } from '../generated/scene-items/scene-item-definition.js';
import { resolveRegisterItemTemplate } from './item-register-template.js';
import { createHash } from 'node:crypto';
import { normalizeItemDefinition, itemDefinitionContent } from '../generated/item-definitions/item-definition-model.js';
import { storeInventoryItem } from '../generated/item-definitions/item-definition-resolver.js';
import { prepareTemplateDefinition, prepareDefinitionVersion, definitionRevision } from '../items/item-definition-repository.js';
export const resolveSceneItemTemplate = resolveRegisterItemTemplate;

export async function buildSceneItemSegments(database, transaction, segments, commentId, { definitionWrites = [], uniqueGrants = [], actorUid = '' } = {}) {
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
    let prepared;
    if (item.definitionRef) prepared = await prepareTemplateDefinition(database, transaction, template, { actorUid, publishHead: true });
    else {
      let definition = normalizeItemDefinition({ id: 'item:scene-draft', revision: 'draft', kind: 'shared',
        title: item.name, category: item.registerCategory, type: item.type, image: item.image,
        description: item.description, combatDefinition: item.combatDefinition, inventoryUseMode: item.inventoryUseMode,
        baseRef: template?.definitionRef, mechanicsStatus: item.combatDefinition ? 'provisional' : 'narrative' });
      const id = `scene-item:${createHash('sha256').update(itemDefinitionContent(definition)).digest('hex').slice(0, 32)}`;
      definition = { ...definition, id };
      definition.revision = definitionRevision(definition);
      prepared = await prepareDefinitionVersion(database, transaction, definition, { actorUid });
    }
    if (prepared.definition) {
      item = storeInventoryItem({ ...item, definitionRef: { id: prepared.definition.id, revision: prepared.definition.revision } });
      definitionWrites.push(prepared);
      uniqueGrants.push({ definition: prepared.definition, instanceId: item.instanceId, quantity: 1, sceneItemId });
    }
    const text = String(draft.sceneText || item.description).trim().slice(0, 1800);
    result.push({ ...common, text, sceneItemEvent: { operation: 'place', sceneItemId, item, text, sourceActorId: '' } });
  }
  return result;
}
