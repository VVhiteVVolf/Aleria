import { resolveEquipmentImage } from '../character-equipment/equipment-artwork.js?v=20260928-equipment-art-v4';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderSceneItemEvent(event = {}) {
  if (!event.sceneItemId || !event.item?.name) return '';
  // Old receipts retain their item data; only the shared artwork projection is refreshed.
  const item = { ...event.item, image: resolveEquipmentImage(event.item, {
    characterId: event.sourceActorId, combatEntryId: event.weaponId
  }) };
  const labels = { drop: 'Zu Boden gefallen', place: 'In der Szene', pickup: 'Aufgehoben', use: 'Benutzt', consume: 'Verbraucht' };
  return `<aside class="scene-item-bubble" data-scene-item-id="${escape(event.sceneItemId)}">
    ${item.image ? `<img src="${escape(item.image)}" alt="${escape(item.name)}" loading="lazy">` : '<span class="scene-item-symbol" aria-hidden="true">◇</span>'}
    <div><small>${escape(labels[event.operation] || 'Gegenstand')}</small><h4>${escape(item.name)}</h4><p>${escape(event.text || item.description)}</p><button type="button" class="scene-item-card-link" data-scene-item-action="card" data-scene-item-status="${escape(labels[event.operation] || 'Gegenstand')}" data-scene-item-card="${escape(JSON.stringify(item))}">Itemkarte öffnen ↗</button></div>
  </aside>`;
}
