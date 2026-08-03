import {
  applyInventoryUseToInventory,
  getCharacterInventoryItems,
  getInventoryItemQuantity,
  inferInventoryUseMode,
  prepareInventoryUse,
  resolveInventoryUseMode
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

function renderItemOption(item, selectedId) {
  const quantity = getInventoryItemQuantity(item);
  return `<option value="${escapeHtml(item.id)}"${String(item.id) === String(selectedId) ? ' selected' : ''}>${escapeHtml(item.name || 'Gegenstand')} · ${quantity}× · ${escapeHtml(item.type || item.category || 'Gegenstand')}</option>`;
}

function renderComposer(segment, actor, edit = false) {
  if (String(segment?.kind || '') !== 'consume') return '';
  if (segment.storedInventoryUse) {
    const use = segment.storedInventoryUse;
    return `<section class="inventory-use-composer is-locked" data-inventory-use-composer>
      <div><span>Inventarvorgang</span><strong>${escapeHtml(use.item?.name || 'Gegenstand')}</strong></div>
      <p>Dieser bereits gespeicherte Vorgang bleibt beim Bearbeiten unverändert.</p>
    </section>`;
  }
  if (edit) {
    return `<section class="inventory-use-composer is-warning" data-inventory-use-composer><p>Neue Inventarvorgänge können nur in einem neuen Beitrag angelegt werden.</p></section>`;
  }
  if (!actor) {
    return `<section class="inventory-use-composer is-warning" data-inventory-use-composer><p>Wähle zuerst die Figur, die einen Gegenstand benutzt.</p></section>`;
  }
  const items = getCharacterInventoryItems(actor).filter(item => getInventoryItemQuantity(item) > 0);
  if (!items.length) {
    return `<section class="inventory-use-composer is-warning" data-inventory-use-composer><p>${escapeHtml(actor.name || 'Die Figur')} hat keine verfügbaren Gegenstände im Inventar.</p></section>`;
  }
  if (!items.some(item => String(item.id) === String(segment.inventoryItemId || ''))) {
    segment.inventoryItemId = String(items[0].id || '');
  }
  const item = items.find(candidate => String(candidate.id) === String(segment.inventoryItemId)) || items[0];
  const requestedMode = ['consume', 'use'].includes(segment.inventoryUseMode) ? segment.inventoryUseMode : 'auto';
  const effectiveMode = resolveInventoryUseMode(item, requestedMode);
  const image = getSafeImageSource(item.image);
  const automaticLabel = inferInventoryUseMode(item) === 'consume' ? 'verbrauchen' : 'nur benutzen';
  return `<section class="inventory-use-composer" data-inventory-use-composer>
    <div class="inventory-use-composer-head">
      ${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">` : '<span aria-hidden="true">◆</span>'}
      <div><span>Inventarvorgang</span><strong>${escapeHtml(effectiveMode === 'consume' ? 'Wird verbraucht' : 'Wird benutzt')}</strong></div>
    </div>
    <div class="inventory-use-composer-fields">
      <label>Gegenstand<select data-inventory-use-input="itemId">${items.map(candidate => renderItemOption(candidate, item.id)).join('')}</select></label>
      <label>Verhalten<select data-inventory-use-input="mode"><option value="auto"${requestedMode === 'auto' ? ' selected' : ''}>Automatisch · ${automaticLabel}</option><option value="consume"${requestedMode === 'consume' ? ' selected' : ''}>1 Stück verbrauchen</option><option value="use"${requestedMode === 'use' ? ' selected' : ''}>Nur benutzen</option></select></label>
    </div>
    <p>${effectiveMode === 'consume'
      ? `Beim Eintragen wird der Online-Bestand von ${getInventoryItemQuantity(item)} auf ${Math.max(0, getInventoryItemQuantity(item) - 1)} gesetzt.`
      : 'Der Gegenstand bleibt im Inventar und seine Benutzung wird im Abschnitt protokolliert.'}</p>
  </section>`;
}

function mountComposers(context = {}) {
  latestComposerContext = context;
  const actors = mergeActors(context.sceneActors || []);
  (context.segments || []).forEach(segment => {
    const card = context.list?.querySelector?.(`[data-segment-id="${CSS.escape(String(segment.id || ''))}"]`);
    card?.querySelector?.('[data-inventory-use-composer]')?.remove();
    if (!card || String(segment.kind || '') !== 'consume') return;
    const actor = getActorForSegment(segment, context.selectedCharacterId, actors);
    card.insertAdjacentHTML('beforeend', renderComposer(segment, actor, context.edit === true));
  });
}

function findComposerSegment(trigger) {
  const id = trigger?.closest?.('[data-segment-id]')?.dataset?.segmentId || '';
  return latestComposerContext?.segments?.find(segment => String(segment?.id || '') === String(id)) || null;
}

function remount() {
  if (!latestComposerContext) return;
  mountComposers(latestComposerContext);
  globalThis.persistCommentDraft?.();
}

function handleInput(field) {
  const segment = findComposerSegment(field);
  if (!segment || segment.storedInventoryUse) return;
  if (field.dataset.inventoryUseInput === 'itemId') segment.inventoryItemId = String(field.value || '');
  if (field.dataset.inventoryUseInput === 'mode') segment.inventoryUseMode = ['consume', 'use'].includes(field.value) ? field.value : 'auto';
  remount();
}

function buildUsageSegment(segment, actor, workingInventories) {
  const actorKey = String(actor.id || '');
  const currentInventory = workingInventories.get(actorKey) || actor.inventory || {};
  const workingActor = { ...actor, inventory: currentInventory };
  const inventoryUse = prepareInventoryUse({
    character: workingActor,
    itemId: segment.inventoryItemId,
    requestedMode: segment.inventoryUseMode,
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
  const consumeSegments = segments.filter(segment => String(segment?.kind || segment?.commentKind || '') === 'consume');
  if (!consumeSegments.length) return { handled: false };
  const actors = mergeActors(latestComposerContext?.sceneActors || []);
  const workingInventories = new Map();
  const usages = new Map();
  consumeSegments.forEach(segment => {
    const actor = getActorForSegment(segment, submission.characterId, actors);
    if (!actor) throw new Error('Für „Konsumieren“ ist keine Figur mit Inventar ausgewählt.');
    usages.set(segment, buildUsageSegment(segment, actor, workingInventories));
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
  const consumed = use.mode === 'consume';
  const image = getSafeImageSource(use.item.image);
  const quantity = consumed && use.quantityBefore != null && use.quantityAfter != null
    ? `<span>Bestand ${escapeHtml(use.quantityBefore)} → ${escapeHtml(use.quantityAfter)}</span>`
    : '<span>Bleibt im Inventar</span>';
  const abilityEffects = (Array.isArray(use.abilityEffects) ? use.abilityEffects : [])
    .map(effect => `<span>${escapeHtml(effect.abilityName)}: ${escapeHtml(effect.resourceName)} ${escapeHtml(effect.before)} → ${escapeHtml(effect.after)}</span>`)
    .join('');
  return `<aside class="inventory-use-result" data-mode="${consumed ? 'consume' : 'use'}">
    ${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">` : '<span class="inventory-use-result-icon" aria-hidden="true">◆</span>'}
    <div><small>${consumed ? 'Verbraucht' : 'Benutzt'}</small><strong>${escapeHtml(use.item.name)}</strong>${quantity}${abilityEffects}</div>
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
  handleSubmission,
  renderUsage
});
