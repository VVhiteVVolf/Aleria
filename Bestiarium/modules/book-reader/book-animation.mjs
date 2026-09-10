// StPageFlip is confined to this adapter; content and pagination need no library.
export async function createBookAnimation(mount, pages, geometry, onChange, signal) {
  const { PageFlip } = await import('./vendor/page-flip.mjs');
  if (signal?.aborted) return null;
  const host = document.createElement('div');
  host.className = 'book-flip';
  host.append(...pages);
  mount.append(host);
  const events = new AbortController();
  const engine = new PageFlip(host, {
    width: geometry.width, height: geometry.height, size: 'fixed',
    usePortrait: true, autoSize: false, showCover: true,
    useMouseEvents: false, showPageCorners: false, disableFlipByClick: true,
    mobileScrollSupport: true, flippingTime: 850, maxShadowOpacity: .28, startPage: geometry.startPage
  });
  let drag = null;
  let disposed = false;
  const corners = ['previous', 'next'].map(direction => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `book-corner book-corner-${direction}`;
    button.dataset.direction = direction;
    button.setAttribute('aria-label', direction === 'next' ? 'An der Ecke vorblättern' : 'An der Ecke zurückblättern');
    mount.append(button);
    return button;
  });
  const notify = () => {
    if (disposed) return;
    const index = engine.getCurrentPageIndex();
    const portrait = engine.getOrientation() === 'portrait';
    const visible = [index];
    if (!portrait && index > 0 && index + 1 < pages.length) visible.push(index + 1);
    const activeWasHidden = pages.some((page, i) => !visible.includes(i) && page.contains(document.activeElement));
    pages.forEach((page, i) => {
      page.inert = !visible.includes(i);
      page.setAttribute('aria-hidden', String(!visible.includes(i)));
      page.setAttribute('role', 'group');
      page.setAttribute('aria-label', i === 0 ? 'Vorderer Einband' : i === pages.length - 1 ? 'Hinterer Einband' : `Buchseite ${i}`);
    });
    if (activeWasHidden) mount.focus({ preventScroll: true });
    corners[0].disabled = index === 0;
    corners[1].disabled = visible.includes(pages.length - 1);
    onChange({ index, visible, portrait });
  };
  engine.on('flip', notify);
  engine.on('init', notify);
  engine.on('changeOrientation', notify);
  engine.on('changeState', event => {
    mount.dataset.turning = String(event.data !== 'read');
    if (event.data === 'read') notify();
  });

  function turn(direction) {
    if (disposed || engine.getState() !== 'read') return;
    if (direction === 'next' && !corners[1].disabled) engine.flipNext('bottom');
    if (direction === 'previous' && !corners[0].disabled) engine.flipPrev('bottom');
  }
  const point = event => {
    const bounds = engine.getUI().getDistElement().getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };
  const dragPoint = current => {
    if (engine.getOrientation() !== 'portrait') return current;
    // The engine models a two-page spread even in portrait mode. Map a full
    // visible-page gesture onto that spread so the fold can cross its gutter.
    return { x: drag.start.x + (current.x - drag.start.x) * 2 - (drag.direction === 'previous' ? geometry.width : 0), y: current.y };
  };
  mount.addEventListener('pointerdown', event => {
    const corner = event.target.closest('.book-corner');
    if (!corner || corner.disabled || event.button !== 0 || engine.getState() !== 'read') return;
    event.preventDefault();
    corner.focus({ preventScroll: true });
    corner.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, start: point(event), direction: corner.dataset.direction, moved: false };
    engine.startUserTouch(drag.start);
    engine.getFlipController().start(drag.start);
  }, { signal: events.signal });
  mount.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const current = point(event);
    drag.moved ||= Math.hypot(current.x - drag.start.x, current.y - drag.start.y) > 5;
    if (drag.moved) engine.userMove(dragPoint(current), true);
  }, { signal: events.signal });
  const endDrag = event => {
    if (!drag || drag.id !== event.pointerId) return;
    if (event.type === 'pointercancel') {
      if (drag.moved) engine.userMove(dragPoint(drag.start), true);
      engine.userStop(drag.start, true);
      if (drag.moved) engine.getFlipController().stopMove();
    } else engine.userStop(drag.moved ? dragPoint(point(event)) : point(event));
    drag = null;
  };
  mount.addEventListener('pointerup', endDrag, { signal: events.signal });
  mount.addEventListener('pointercancel', endDrag, { signal: events.signal });
  mount.addEventListener('click', event => {
    const corner = event.target.closest('.book-corner');
    // Pointer clicks were handled by userStop; keyboard/assistive activation has detail 0.
    if (corner && event.detail === 0) turn(corner.dataset.direction);
  }, { signal: events.signal });
  try { engine.loadFromHTML(pages); } catch (error) {
    events.abort(); corners.forEach(corner => corner.remove()); host.remove();
    if (engine.getRender()) engine.destroy();
    throw error;
  }
  notify();
  return {
    turn,
    goTo(index) { if (!disposed) { engine.getRender().finishAnimation(); engine.turnToPage(index); notify(); } },
    destroy() {
      if (disposed) return;
      disposed = true;
      events.abort();
      drag = null;
      engine.destroy();
      corners.forEach(corner => corner.remove());
    }
  };
}
