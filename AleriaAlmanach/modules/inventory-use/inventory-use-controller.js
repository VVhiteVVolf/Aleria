import { renderInventoryUseComposer, inventoryUseSelection } from './inventory-use-composer.js';
import { deriveSceneItems, applySceneItemEvent } from '../scene-items/scene-items-model.js';
import { applySceneItemInteraction } from '../scene-items/scene-item-interaction.js';
import { resolveCombatProfile } from '../combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../combat/combat-state-model.js';
import { resetCommentScopedResources } from '../combat/combat-action-economy.js';
import { renderSceneItemEvent } from '../scene-items/scene-items-ui.js';
import {
  applyInventoryUseToInventory,
  prepareInventoryUse
} from './inventory-use-model.js?v=20260803-gawain-level4-v1';

let latestComposerContext = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mergeActors(sceneActors = []) {
  const available = typeof globalThis.getAvailableCommentCharacters === 'function'
    ? globalThis.getAvailableCommentCharacters()
    : [];
  const merged = new Map();
  available.forEach(actor => merged.set(String(actor?.id || ''), actor));
  sceneActors.forEach(actor => merged.set(String(actor?.id || ''), actor));
  return [...merged.values()];
}

function getActorForSegment(segment, fallbackActorId = '', actors = []) {
  const actorId = String(segment?.sceneActorId || segment?.actorId || segment?.characterId || fallbackActorId || '');
  return actors.find(actor => String(actor?.id || '') === actorId) || null;
}

function getSafeImageSource(value) {
  return typeof globalThis.sanitizeImageSrc === 'function'
    ? globalThis.sanitizeImageSrc(String(value || ''))
    : String(value || '');
}

function mountComposers(context = {}) {
  latestComposerContext = context;
  const segments = Array.isArray(context.segments) ? context.segments : [];
  const needsInventoryComposer = segments.some(segment => ['consume', 'interact'].includes(String(segment.kind || '')));
  const actors = needsInventoryComposer ? mergeActors(context.sceneActors || []) : [];
  segments.forEach(segment => {
    const card = context.list?.querySelector?.(`[data-segment-id="${CSS.escape(String(segment.id || ''))}"]`);
    card?.querySelector?.('[data-inventory-use-composer]')?.remove();
    if (!card || !['consume', 'interact'].includes(String(segment.kind || ''))) return;
    const actor = getActorForSegment(segment, context.selectedCharacterId, actors);
    card.insertAdjacentHTML('beforeend', renderInventoryUseComposer(segment, actor, deriveSceneItems(globalThis.getCachedCommentsForThread?.(context.threadId) || []), context.edit === true));
  });
}

function findComposerSegment(trigger) {
  const id = trigger?.closest?.('[data-segment-id]')?.dataset?.segmentId || '';
  return latestComposerContext?.segments?.find(segment => String(segment?.id || '') === String(id)) || null;
}

function remount() {
  if (!latestComposerContext) return;
  mountComposers(latestComposerContext);
  document.dispatchEvent(new CustomEvent('aleria:inventory-use-selection-changed'));
  globalThis.persistCommentDraft?.();
}

function handleInput(field) {
  const segment = findComposerSegment(field);
  if (!segment || segment.storedInventoryUse) return;
  if (field.dataset.inventoryUseInput === 'itemId') segment.inventoryItemId = String(field.value || '');
  if (field.dataset.inventoryUseInput === 'mode') segment.inventoryUseMode = ['consume', 'use'].includes(field.value) ? field.value : 'auto';
  if (field.dataset.inventoryUseInput === 'selection') {
    const value=String(field.value || '');
    const split=value.indexOf('|');
    segment.inventorySource=split >= 0 ? value.slice(0,split) : 'inventory';
    segment.inventoryItemId=segment.inventorySource === 'inventory' && split >= 0 ? value.slice(split+1) : '';
    segment.sceneItemId=segment.inventorySource === 'scene' ? value.slice(split+1) : '';
    segment.inventoryOperation='use';
  }
  if (field.dataset.inventoryUseInput === 'operation') segment.inventoryOperation=field.value;
  if (field.dataset.inventoryUseInput === 'payment') segment.inventoryPaymentResource=field.value;
  remount();
}

function buildUsageSegment(segment, actor, workingInventories, sceneItems, states, actors) {
  const actorKey = String(actor.id || '');
  const currentInventory = workingInventories.get(actorKey) || actor.inventory || {};
  const workingActor = { ...actor, inventory: currentInventory };
  const consuming = (segment.kind || segment.commentKind) === 'consume';
  if (segment.inventorySource === 'scene') {
    const entry=sceneItems.get(segment.sceneItemId);
    const profile=resolveCombatProfile(workingActor);
    const state=states.get(actorKey) || {};
    const resolved=overlayCombatHitPointState(profile, {...state, inventory:currentInventory,
      resources:state.resources || resetCommentScopedResources(profile.resources)});
    const applied=applySceneItemInteraction({entry,actor:resolved,
      sourceActor:actors.find(actor=>actor.id === entry?.sourceActorId),
      operation:consuming ? 'consume' : entry?.operation === 'drop' ? 'pickup' : segment.inventoryOperation || 'use',
      paymentResource:segment.inventoryPaymentResource,usageId:'scene-use:'+Date.now()+':'+segment.clientSegmentId});
    workingInventories.set(actorKey,applied.inventory);
    states.set(actorKey,{...state,resources:applied.resources});
    applySceneItemEvent(sceneItems,applied.inventoryUse.sceneItemEvent);
    return applied.inventoryUse;
  }
  if ([...sceneItems.values()].some(entry=>entry.sourceActorId === actorKey && entry.item?.id === segment.inventoryItemId
    && (entry.available || entry.claimedBy && entry.claimedBy !== actorKey))) throw new Error('Diese Waffe liegt nicht in der Hand. Zuerst aufheben.');
  const inventoryUse = prepareInventoryUse({
    character: workingActor,
    itemId: segment.inventoryItemId,
    requestedMode: consuming ? 'consume' : 'use',
    quantity: 1
  });
  if (inventoryUse.mode === 'consume' && inventoryUse.actorPersistence.kind !== 'character') {
    throw new Error(`${actor.name || 'Die Figur'} muss zuerst als Online-Charakter gespeichert werden, damit Gegenstände dauerhaft verbraucht werden können.`);
  }
  const applied = applyInventoryUseToInventory(currentInventory, inventoryUse);
  workingInventories.set(actorKey, applied.inventory);
  return applied.inventoryUse;
}

async function handleSubmission(submission = {}) {
  const segments = Array.isArray(submission.commentSegments) ? submission.commentSegments : [];
  const consumeSegments = segments.filter(segment => ['consume','interact'].includes(String(segment?.kind || segment?.commentKind || '')) && (segment.inventoryItemId || segment.sceneItemId));
  if (!consumeSegments.length) return { handled: false };
  const actors = mergeActors(latestComposerContext?.sceneActors || []);
  const workingInventories = new Map();
  const history=globalThis.getCachedCommentsForThread?.(submission.threadId) || [];
  const sceneItems=deriveSceneItems(history);
  const states=deriveCombatStateFromComments(history);
  for (const [id,state] of states) if (state.resources) states.set(id,{...state,resources:resetCommentScopedResources(state.resources)});
  const usages = new Map();
  consumeSegments.forEach(segment => {
    const actor = getActorForSegment(segment, submission.characterId, actors);
    if (!actor) throw new Error('Für „Konsumieren“ ist keine Figur mit Inventar ausgewählt.');
    usages.set(segment, buildUsageSegment(segment, actor, workingInventories, sceneItems, states, actors));
  });
  const enhancedSegments = segments.map(segment => {
    const { clientSegmentId, ...storedSegment } = segment;
    return usages.has(segment) ? { ...storedSegment, inventoryUse: usages.get(segment) } : storedSegment;
  });
  return { handled: true, commentMetadata: { commentSegments: enhancedSegments } };
}

function renderUsage(segment = {}) {
  const use = segment.inventoryUse;
  if (!use?.item?.name) return '';
  if (use.sceneItemEvent) return renderSceneItemEvent(use.sceneItemEvent);
  const consumed = use.mode === 'consume';
  const image = getSafeImageSource(use.item.image);
  const quantity = consumed && use.quantityBefore != null && use.quantityAfter != null
    ? `<span>Bestand ${escapeHtml(use.quantityBefore)} → ${escapeHtml(use.quantityAfter)}</span>`
    : '<span>Bleibt im Inventar</span>';
  const abilityEffects = (Array.isArray(use.abilityEffects) ? use.abilityEffects : [])
    .map(effect => `<span>${escapeHtml(effect.abilityName)}: ${escapeHtml(effect.resourceName)} ${escapeHtml(effect.before)} → ${escapeHtml(effect.after)}</span>`)
    .join('');
  const conditionEffects = (use.conditionSnapshot?.after || []).filter(condition => condition.sourceConditionId === 'zornkappe-rausch')
    .map(condition => `<span>${escapeHtml(condition.name)}: ${escapeHtml(condition.description)} Bis Kampfende.</span>`).join('');
  return `<aside class="inventory-use-result" data-mode="${consumed ? 'consume' : 'use'}">
    ${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">` : '<span class="inventory-use-result-icon" aria-hidden="true">◆</span>'}
    <div><small>${consumed ? 'Verbraucht' : 'Benutzt'}</small><strong>${escapeHtml(use.item.name)}</strong>${quantity}${abilityEffects}${conditionEffects}</div>
  </aside>`;
}

document.addEventListener('change', event => {
  const field = event.target?.closest?.('[data-inventory-use-input]');
  if (field) handleInput(field);
});

globalThis.AleriaInventoryUse = Object.freeze({
  mountComposer(list, context = {}) {
    mountComposers({
      list,
      segments: Array.isArray(context.segments) ? context.segments : [],
      selectedCharacterId: String(context.selectedCharacterId || ''),
      sceneActors: Array.isArray(context.sceneActors) ? context.sceneActors : [],
      threadId: String(context.threadId || ''),
      edit: context.edit === true
    });
  },
  serializeSelection: inventoryUseSelection,
  handleSubmission,
  renderUsage
});
