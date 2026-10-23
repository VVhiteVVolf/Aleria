export function bindRegionInteraction({ map, panel, runtime, session, changed, discard, report }) {
  let dragging = false;
  let tracking = false;
  // Tool controls must not start the map's pan/zoom or pin-drag listeners.
  for (const type of ['pointerdown', 'mousedown', 'mouseup', 'mousemove', 'click', 'wheel', 'touchstart', 'touchmove', 'touchend']) {
    panel.addEventListener(type, event => event.stopPropagation());
  }
  const point = event => {
    const p = runtime.normalizedMapPointFromClient(event.clientX, event.clientY);
    return [Math.max(0, Math.min(1, p.x)), Math.max(0, Math.min(1, p.y))];
  };
  const active = event => runtime.isEditMode() && session() && !panel.contains(event.target);

  // Capture owns primary input only while a region draft is open. The existing
  // map listeners still own wheel zoom and auxiliary-button panning.
  for (const type of ['mousedown', 'click', 'dblclick', 'touchstart', 'touchmove', 'touchend']) {
    map.addEventListener(type, event => {
      if (!active(event) || ('button' in event && event.button !== 0)) return;
      event.preventDefault(); event.stopImmediatePropagation();
    }, { capture: true, passive: false });
  }
  map.addEventListener('pointerdown', event => {
    if (!active(event) || event.button !== 0 || !event.isPrimary) return;
    event.preventDefault(); event.stopPropagation();
    const handle = event.target.closest('[data-region-vertex]');
    const edit = session();
    tracking = true; dragging = Boolean(handle);
    map.setPointerCapture(event.pointerId);
    if (handle) {
      edit.select(Number(handle.dataset.regionPath), Number(handle.dataset.regionVertex));
      edit.beginMove(); changed();
    }
  }, true);
  map.addEventListener('pointermove', event => {
    if (!tracking || !dragging || !session()) return;
    session().move(point(event)); changed();
  }, true);
  function release(event) {
    if (!tracking) return;
    const edit = session();
    try {
      if (edit && !dragging && event.type !== 'pointercancel') {
        if (edit.inserting()) edit.insert(point(event));
        else if (edit.drawing()) edit.add(point(event));
      }
      changed();
    } catch (error) { report(error.message); }
    dragging = false; tracking = false;
    if (map.hasPointerCapture(event.pointerId)) map.releasePointerCapture(event.pointerId);
  }
  map.addEventListener('pointerup', release, true);
  map.addEventListener('pointercancel', release, true);
  document.addEventListener('keydown', event => {
    const edit = session();
    if (!edit || !runtime.isEditMode()) return;
    const inField = event.target.matches('input,select,textarea,[contenteditable="true"]')
      || (event.key === 'Enter' && event.target.closest('button,a'));
    if (inField && event.key !== 'Escape') return;
    const undo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z';
    if (!undo && !['Enter','Escape','Delete','Backspace'].includes(event.key)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    try {
      if (event.key === 'Escape') discard(true);
      else if (undo || (event.key === 'Backspace' && edit.drawing())) edit.undo();
      else if (event.key === 'Enter') edit.finish();
      else edit.remove();
      changed();
    } catch (error) { report(error.message); }
  }, true);
}
