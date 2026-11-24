export function bindPlacementDrag({
  root, sourceSelector, targetSelector, canStart, onDrop, ghostClass = 'drag-crest',
}) {
  const document = root.ownerDocument;
  const ghost = document.createElement('div');
  ghost.className = ghostClass;
  ghost.hidden = true;
  ghost.setAttribute('aria-hidden', 'true');
  let gesture;
  let dropTarget;
  let suppressClickUntil = 0;

  function setDropTarget(target) {
    if (target === dropTarget) return;
    dropTarget?.classList.remove('is-drop-target');
    dropTarget = target;
    dropTarget?.classList.add('is-drop-target');
  }

  function findTarget(event) {
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(targetSelector);
    return target && root.contains(target) ? target : null;
  }

  function finish(event, cancel) {
    if (!gesture || (event && event.pointerId !== gesture.pointerId)) return;
    const { source, pointerId, active } = gesture;
    const target = active && !cancel ? findTarget(event) : null;
    gesture = null;
    if (source.hasPointerCapture(pointerId)) source.releasePointerCapture(pointerId);
    root.classList.remove('is-dragging');
    ghost.remove();
    ghost.hidden = true;
    setDropTarget(null);
    if (active && !cancel) suppressClickUntil = Date.now() + 200;
    if (target) onDrop(source, target, event);
  }

  root.addEventListener('pointerdown', event => {
    suppressClickUntil = 0;
    const source = event.target.closest(sourceSelector);
    if (!source || event.button !== 0 || gesture || !canStart(source, event)) return;
    gesture = { source, pointerId: event.pointerId, x: event.clientX, y: event.clientY, active: false };
  });
  root.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    if (!gesture.active) {
      if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 7) return;
      if (!gesture.source.isConnected) return finish(event, true);
      gesture.active = true;
      gesture.source.setPointerCapture(event.pointerId);
      root.classList.add('is-dragging');
      (gesture.source.closest('dialog') ?? root).append(ghost);
      const image = gesture.source.querySelector('img');
      ghost.replaceChildren(...(image ? [image.cloneNode()] : []));
      ghost.hidden = false;
    }
    event.preventDefault();
    ghost.style.left = event.clientX + 'px';
    ghost.style.top = event.clientY + 'px';
    setDropTarget(findTarget(event));
  });
  root.addEventListener('pointerup', event => finish(event, false));
  root.addEventListener('pointercancel', event => finish(event, true));
  root.addEventListener('lostpointercapture', event => {
    if (event.target === gesture?.source) finish(event, true);
  });
  root.addEventListener('pointerleave', event => {
    if (gesture && !gesture.active) finish(event, true);
  });
  root.addEventListener('dragstart', event => {
    if (event.target.closest(sourceSelector)) event.preventDefault();
  });
  root.addEventListener('click', event => {
    if (event.detail && Date.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, { capture: true });
  return { cancel: () => finish(null, true) };
}
