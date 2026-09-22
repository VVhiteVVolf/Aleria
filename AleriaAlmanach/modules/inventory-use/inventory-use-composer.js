import { getCharacterInventoryItems, getInventoryItemQuantity, inferInventoryUseMode } from './inventory-use-model.js';
import { PICKUP_RESOURCES } from '../scene-items/scene-items-model.js';
const labels = { 'bonus-action': 'Bonusaktion', action: 'Aktion', reaction: 'Reaktion', 'special-action': 'Besondere Aktion', 'aura-focus': 'Aura-Fokus' };
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function inventoryUseSelection(segment = {}) {
  segment ||= {};
  return { inventorySource: segment.inventorySource === 'scene' ? 'scene' : 'inventory',
    sceneItemId: String(segment.sceneItemId || ''), inventoryOperation: segment.inventoryOperation === 'pickup' ? 'pickup' : 'use',
    inventoryPaymentResource: PICKUP_RESOURCES.includes(segment.inventoryPaymentResource) ? segment.inventoryPaymentResource : '' };
}

export function renderInventoryUseComposer(segment, actor, sceneItems, edit) {
  if (segment.storedInventoryUse) return `<section class="inventory-use-composer is-locked" data-inventory-use-composer><strong>${escape(segment.storedInventoryUse.item?.name)}</strong><p>Der gespeicherte Inventarvorgang bleibt unverändert.</p></section>`;
  if (edit) return '<section class="inventory-use-composer" data-inventory-use-composer>Neue Gegenstandsaktionen benötigen einen neuen Beitrag.</section>';
  if (!actor) return '<section class="inventory-use-composer" data-inventory-use-composer>Wähle eine Figur mit Inventar.</section>';
  const consuming = segment.kind === 'consume';
  const ownItems = getCharacterInventoryItems(actor).filter(item => getInventoryItemQuantity(item) > 0
    && ![...sceneItems.values()].some(drop => drop.operation === 'drop' && (drop.available || drop.claimedBy !== actor.id) && drop.sourceActorId === actor.id && drop.item?.id === item.id)
    && (inferInventoryUseMode(item) === 'consume') === consuming);
  const ground = [...sceneItems.values()].filter(entry => entry.available
    && (!consuming || inferInventoryUseMode(entry.item) === 'consume'));
  const selected = segment.inventorySource === 'scene' ? `scene|${segment.sceneItemId}` : `inventory|${segment.inventoryItemId || ''}`;
  const option = (value, title) => `<option value="${escape(value)}"${selected === value ? ' selected' : ''}>${escape(title)}</option>`;
  const sceneItem = sceneItems.get(segment.sceneItemId);
  const pickup = !consuming && segment.inventorySource === 'scene' && (sceneItem?.operation === 'drop' || segment.inventoryOperation === 'pickup');
  return `<section class="inventory-use-composer" data-inventory-use-composer>
    <div class="inventory-use-composer-head"><span aria-hidden="true">${consuming ? '⚗' : '✋'}</span><div><small>${consuming ? 'Verbrauchsgüter' : 'Gegenstände & Umgebung'}</small><strong>${consuming ? 'Konsumieren' : 'Interagieren'}</strong></div></div>
    <div class="inventory-use-composer-fields"><label>Gegenstand<select data-inventory-use-input="selection"><option value="">${consuming ? 'Verbrauchsgut wählen …' : 'Freie Interaktion ohne Gegenstand'}</option><optgroup label="Eigenes Inventar">${ownItems.map(item => option(`inventory|${item.id}`, `${item.name} · ${getInventoryItemQuantity(item)}×`)).join('')}</optgroup><optgroup label="Aktive Szene">${ground.map(entry => option(`scene|${entry.sceneItemId}`, `${entry.item.name}${entry.operation === 'drop' ? ' · Entwaffnet / am Boden' : ''}`)).join('')}</optgroup></select></label>
    ${!consuming && segment.inventorySource === 'scene' ? `<label>Aktion<select data-inventory-use-input="operation">${sceneItem?.operation !== 'drop' ? `<option value="use"${!pickup ? ' selected' : ''}>Vor Ort benutzen</option>` : ''}<option value="pickup"${pickup ? ' selected' : ''}>Aufheben</option></select></label>` : ''}
    ${pickup ? `<label>1 Aktionspunkt bezahlen mit<select data-inventory-use-input="payment"><option value="">Automatisch · bevorzugt Bonusaktion</option>${PICKUP_RESOURCES.map(id => `<option value="${id}"${id === segment.inventoryPaymentResource ? ' selected' : ''}>${labels[id]}</option>`).join('')}</select></label>` : ''}</div>
    <p>${consuming ? 'Ein Stück wird verbraucht; der Bestand wird gemeinsam mit dem Beitrag gespeichert.' : pickup ? 'Die Waffe ist bis zum Aufheben nicht benutzbar. Aufheben kostet genau einen verfügbaren Aktionspunkt.' : 'Benutzen erhält den Gegenstand. Verbrauchsgüter stehen unter „Konsumieren“.'}</p>
  </section>`;
}
