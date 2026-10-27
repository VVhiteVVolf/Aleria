import { NAILS } from './board-composition-model.mjs';
import { previewMarkup } from './board-composition-view.mjs';

export function createPosterInspector({ esc, assets, getSelected, getAsset, groups, change, action }) {
  const root = document.createElement('aside');
  root.className = 'board-art-inspector';
  root.hidden = true;
  root.setAttribute('aria-label', 'Plakat ausrichten');
  document.querySelector('.tafel-workspace').append(root);
  let dragging = null;
  const option = (value, text, current) => `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(text)}</option>`;
  const number = (label, field, value, min, max, step = 1) => `<label>${label}<input type="number" data-poster-field="${field}" value="${Math.round(value * 100) / 100}" min="${min}" max="${max}" step="${step}"></label>`;
  const button = (name, text, more = '') => `<button type="button" data-poster-action="${name}" ${more}>${text}</button>`;

  function render() {
    const poster = getSelected();
    root.hidden = !poster;
    if (!poster) return;
    const asset = getAsset(poster.assetId);
    root.innerHTML = `<header class="board-art-inspector-head"><div><small>Plakat ausrichten</small><h2>${esc(asset.name)}</h2></div>${button('close', '×', 'aria-label="Plakatwerkzeug schließen"')}</header>
      <div class="board-art-inspector-body"><p class="board-art-help">Plakat auf dem Brett ziehen. Den Nagel hier in der Vorschau frei positionieren.</p>
      <label class="board-art-label">Plakatmotiv<select data-poster-field="assetId">${assets.map(item => option(item.id, item.name, poster.assetId)).join('')}</select></label>
      <div class="board-art-preview-wrap">${previewMarkup(poster, asset, esc, true)}</div>
      <div class="board-art-fields board-art-number-grid">
        ${number('Breite (%)', 'width', poster.width * 100, 1.5, 80, .1)}${number('Drehung (°)', 'rotation', poster.rotation, -180, 180, .5)}
        ${number('Position X (%)', 'x', poster.x * 100, 0, 100, .1)}${number('Position Y (%)', 'y', poster.y * 100, 0, 100, .1)}
      </div><fieldset class="board-art-fieldset"><legend>Ebene</legend><div class="board-art-layer-tools">${button('back', 'Ganz hinten')}${button('lower', 'Eine zurück')}${button('raise', 'Eine vor')}${button('front', 'Ganz vorne')}</div></fieldset>
      <fieldset class="board-art-fieldset"><legend>Sichtbarer Nagel</legend><label class="board-art-label">Befestigung<select data-poster-field="nail">${NAILS.map(nail => option(nail.id, nail.name, poster.pin.assetId)).join('')}</select></label>
        <div class="board-art-fields board-art-number-grid">${number('Nagel X (%)', 'pinX', poster.pin.x * 100, 0, 100, .5)}${number('Nagel Y (%)', 'pinY', poster.pin.y * 100, 0, 100, .5)}${number('Nagelgröße (%)', 'pinSize', poster.pin.size * 100, 4, 65, 1)}${number('Nagel drehen (°)', 'pinRotation', poster.pin.rotation, -180, 180, 1)}</div>
        <label class="board-art-checkbox"><input type="checkbox" data-poster-field="enabled"${poster.pin.enabled ? ' checked' : ''}> Klickfunktion aktivieren</label>
      </fieldset>
      <label class="board-art-label">Verknüpfter Aushang<select data-poster-field="noticeId">${option('', 'Nur Dekoration · kein Inhalt', poster.noticeId || '')}${groups().map(group => {
        const current = group.notices.some(notice => notice.id === poster.noticeId) ? group.notices[0].id : poster.noticeId;
        return option(group.notices[0].id, group.notices[0].title || 'Ohne Titel', current);
      }).join('')}</select></label>
      <div class="board-art-content-tools">${poster.noticeId ? button('edit-content', 'Inhalt bearbeiten') : button('new-content', 'Inhalt hinzufügen')}</div>
      <p class="board-art-help">Plakat und Nagel werden gemeinsam gespeichert. „Plakat entfernen“ erhält verknüpfte Texte und Kommentare.</p>
      <div class="board-art-content-tools">${button('duplicate', 'Duplizieren')}${button('delete', 'Plakat entfernen')}</div></div>`;
  }

  function refreshPreview() {
    const poster = getSelected();
    if (!poster) return;
    const wrap = root.querySelector('.board-art-preview-wrap');
    wrap.innerHTML = previewMarkup(poster, getAsset(poster.assetId), esc, true);
  }

  root.addEventListener('click', event => {
    const target = event.target.closest('[data-poster-action]');
    if (target) action(target.dataset.posterAction);
  });
  root.addEventListener('input', event => {
    const field = event.target.dataset.posterField;
    if (!field || event.target.tagName === 'SELECT' || event.target.value === '') return;
    change(field, event.target.type === 'checkbox' ? event.target.checked : Number(event.target.value));
    refreshPreview();
  });
  root.addEventListener('change', event => {
    const field = event.target.dataset.posterField;
    if (!field || event.target.tagName !== 'SELECT') return;
    change(field, event.target.value);
    render();
  });
  root.addEventListener('pointerdown', event => {
    const preview = event.target.closest('[data-role="pin-preview"]');
    if (!preview || event.button !== 0) return;
    event.preventDefault();
    dragging = preview;
    preview.setPointerCapture(event.pointerId);
    move(event);
  });
  function move(event) {
    if (!dragging) return;
    const rect = dragging.getBoundingClientRect();
    change('pinX', Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100)));
    change('pinY', Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100)));
    // Keep the capture element alive while dragging.
    const poster = getSelected();
    const pin = dragging.querySelector('.board-poster-pin');
    pin.style.left = `${poster.pin.x * 100}%`;
    pin.style.top = `${poster.pin.y * 100}%`;
    root.querySelector('[data-poster-field="pinX"]').value = Math.round(poster.pin.x * 1000) / 10;
    root.querySelector('[data-poster-field="pinY"]').value = Math.round(poster.pin.y * 1000) / 10;
  }
  root.addEventListener('pointermove', move);
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) root.addEventListener(name, () => { dragging = null; });
  return { render, close: () => { root.hidden = true; }, contains: element => root.contains(element) };
}
