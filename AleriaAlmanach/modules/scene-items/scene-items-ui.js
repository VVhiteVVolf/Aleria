const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderSceneItemEvent(event = {}) {
  if (!event.sceneItemId || !event.item?.name) return '';
  const image = String(event.item.image || '').trim();
  const safeImage = /^(https?:\/\/|\.?\.?\/|public\/)/i.test(image) ? image : '';
  const labels = { drop: 'Zu Boden gefallen', place: 'In der Szene', pickup: 'Aufgehoben', use: 'Benutzt', consume: 'Verbraucht' };
  return `<aside class="scene-item-bubble" data-scene-item-id="${escape(event.sceneItemId)}">
    ${safeImage ? `<img src="${escape(safeImage)}" alt="${escape(event.item.name)}" loading="lazy">` : '<span class="scene-item-symbol" aria-hidden="true">◇</span>'}
    <div><small>${escape(labels[event.operation] || 'Gegenstand')}</small><h4>${escape(event.item.name)}</h4><p>${escape(event.text || event.item.description)}</p><button type="button" class="scene-item-card-link" data-scene-item-action="card" data-scene-item-status="${escape(labels[event.operation] || 'Gegenstand')}" data-scene-item-card="${escape(JSON.stringify(event.item))}">Itemkarte öffnen ↗</button></div>
  </aside>`;
}
