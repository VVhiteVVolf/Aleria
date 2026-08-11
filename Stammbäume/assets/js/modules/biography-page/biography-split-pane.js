const MINIMUM_SHARE = 30;
const MAXIMUM_SHARE = 75;
const DEFAULT_SHARE = 55;
const KEYBOARD_STEP = 3;

function clamp(value) {
  return Math.max(MINIMUM_SHARE, Math.min(MAXIMUM_SHARE, value));
}

export function createBiographySplitPane({ dialog, runtime = globalThis } = {}) {
  let share = DEFAULT_SHARE;
  let dragging = false;

  function body() {
    return dialog?.querySelector?.('.person-biography-dialog__body.is-editing') || null;
  }

  function divider() {
    return dialog?.querySelector?.('[data-biography-splitter]') || null;
  }

  function apply(nextShare = share) {
    share = clamp(Number(nextShare) || DEFAULT_SHARE);
    body()?.style.setProperty('--biography-preview-share', `${share}%`);
    const handle = divider();
    handle?.setAttribute('aria-valuenow', String(Math.round(share)));
    handle?.setAttribute('aria-valuetext', `Live-Vorschau ${Math.round(share)} Prozent`);
  }

  function onPointerDown(event) {
    if (!event.target.closest?.('[data-biography-splitter]') || runtime.innerWidth <= 1024) return;
    dragging = true;
    event.preventDefault();
    divider()?.classList.add('is-dragging');
  }

  function onPointerMove(event) {
    if (!dragging) return;
    const bounds = body()?.getBoundingClientRect?.();
    if (!bounds?.width) return;
    apply(((event.clientX - bounds.left) / bounds.width) * 100);
  }

  function stopDragging() {
    if (!dragging) return;
    dragging = false;
    divider()?.classList.remove('is-dragging');
  }

  function onKeyDown(event) {
    if (!event.target.closest?.('[data-biography-splitter]') || runtime.innerWidth <= 1024) return;
    const delta = event.key === 'ArrowLeft'
      ? -KEYBOARD_STEP
      : event.key === 'ArrowRight'
        ? KEYBOARD_STEP
        : 0;
    if (!delta && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    if (event.key === 'Home') apply(MINIMUM_SHARE);
    else if (event.key === 'End') apply(MAXIMUM_SHARE);
    else apply(share + delta);
  }

  dialog?.addEventListener('pointerdown', onPointerDown);
  dialog?.addEventListener('keydown', onKeyDown);
  runtime.addEventListener?.('pointermove', onPointerMove);
  runtime.addEventListener?.('pointerup', stopDragging);
  runtime.addEventListener?.('pointercancel', stopDragging);

  function destroy() {
    dialog?.removeEventListener('pointerdown', onPointerDown);
    dialog?.removeEventListener('keydown', onKeyDown);
    runtime.removeEventListener?.('pointermove', onPointerMove);
    runtime.removeEventListener?.('pointerup', stopDragging);
    runtime.removeEventListener?.('pointercancel', stopDragging);
  }

  return Object.freeze({ sync: apply, destroy });
}
