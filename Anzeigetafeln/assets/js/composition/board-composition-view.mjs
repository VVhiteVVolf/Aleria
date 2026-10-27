import { dimensions, NAILS } from './board-composition-model.mjs?v=20261027-all-boards-v3';

export function paperMarkup(asset, esc) {
  const { x, y, w, h } = asset.bounds;
  const clip = asset.clipPolygon?.map(point => `${point[0]}% ${point[1]}%`).join(',');
  const mask = clip ? ` style="clip-path:polygon(${esc(clip)})"` : '';
  return `<span class="board-paper"><span class="board-paper-crop"${mask}><img src="${esc(asset.src)}" alt="" draggable="false" style="width:${asset.width / w * 100}%;height:${asset.height / h * 100}%;left:${-x / w * 100}%;top:${-y / h * 100}%"></span></span>`;
}

export function nailMarkup(pin, esc, label = '', interactive = false) {
  const nail = NAILS.find(item => item.id === pin.assetId) || NAILS[0];
  const tag = label ? 'button' : 'span';
  return `<${tag} class="board-poster-pin${interactive ? ' is-active' : ''}" ${label ? `type="button" aria-label="${esc(label)}" data-role="poster-pin"` : 'aria-hidden="true"'} style="left:${pin.x * 100}%;top:${pin.y * 100}%;width:${pin.size * 100}%;transform:translate(-50%,-50%) rotate(${pin.rotation}deg)"><img src="${nail.src}" alt="" draggable="false"></${tag}>`;
}

export function previewMarkup(poster, asset, esc, editable = false) {
  return `<div class="board-art-preview" data-role="pin-preview" style="aspect-ratio:${asset.aspect};--asset-aspect:${asset.aspect}">${paperMarkup(asset, esc)}${nailMarkup(poster.pin, esc, editable ? 'Nagel auf dem Plakat verschieben' : '')}</div>`;
}

export function positionElement(element, poster, asset, board) {
  const size = dimensions(poster, asset, board);
  Object.assign(element.style, {
    left: `${poster.x * board.w}px`, top: `${poster.y * board.h}px`,
    width: `${size.w}px`, height: `${size.h}px`,
    transform: `translate(-50%,-50%) rotate(${poster.rotation}deg)`, zIndex: String(poster.layer + 10001),
  });
}

export function createPosterElement(poster, asset, board, { esc, selected, editing, group }) {
  const element = document.createElement('div');
  element.className = `board-poster${editing ? ' is-editable' : ''}${selected ? ' is-selected' : ''}`;
  element.dataset.posterId = poster.id;
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', asset.name);
  if (editing) element.tabIndex = 0;
  const active = Boolean(group && poster.pin.enabled);
  const label = editing ? `${asset.name} · Plakat bearbeiten` : active
    ? `${group.notices[0].title || 'Aushang öffnen'}${group.notices.length > 1 ? ` · ${group.notices.length} Blätter` : ''}` : '';
  element.innerHTML = paperMarkup(asset, esc) + nailMarkup(poster.pin, esc, label, active);
  positionElement(element, poster, asset, board);
  return element;
}
