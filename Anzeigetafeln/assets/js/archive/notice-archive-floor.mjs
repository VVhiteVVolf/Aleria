const art = 'assets/images/paper-archive';

export function mountArchiveFloor({ getObjects, canEdit, onOpen, onMove, onMerge }) {
  const root = document.createElement('div');
  root.className = 'paper-archive-floor'; root.setAttribute('aria-label', 'Abgelegte Aushänge am Boden');
  document.getElementById('board-stage').append(root);
  let drag = null, suppressClick = false, pendingFall = null;
  const point = event => {
    const position = window.TafelRuntime.boardPointFromClient(event.clientX, event.clientY);
    const size = window.TafelRuntime.boardSize();
    return { x: position.x / size.w, y: position.y / size.h };
  };
  const buttonFor = id => [...root.querySelectorAll('[data-archive-id]')].find(node => node.dataset.archiveId === id);
  const esc = value => window.TafelRuntime.esc(value);

  function render() {
    if (drag) return;
    root.innerHTML = getObjects().map(object => {
      const count = object.entries.length;
      const file = object.kind === 'pile' ? `pile-${object.size}` : `single-${object.variant + 1}`;
      const width = object.kind === 'pile' ? { small: .105, medium: .14, large: .18 }[object.size] : .052;
      const fall = pendingFall?.id === object.id;
      const label = `${count === 1 ? 'Zusammengeknüllter Aushang' : `Papierhaufen · ${count} abgelegte Aushänge`} · Archiv öffnen`;
      return `<button type="button" class="paper-archive-object${fall ? ' is-falling' : ''}" data-archive-id="${esc(object.id)}"
        aria-label="${esc(label)}" title="${esc(label)}${canEdit() ? ' · Ziehen zum Verschieben oder Zusammenlegen' : ''}"
        style="left:${object.x * 100}%;top:${object.y * 100}%;width:${width * 100}%;${fall ? `--paper-fall-x:${pendingFall.x}px;--paper-fall-y:${pendingFall.y}px;` : ''}">
        <img src="${art}/${file}-v1.webp" alt="" draggable="false">${count > 1 ? `<span class="paper-archive-count">${count}</span>` : ''}</button>`;
    }).join('');
    pendingFall = null;
  }

  function targetAt(event) {
    return [...root.querySelectorAll('[data-archive-id]')].find(node => {
      if (node.dataset.archiveId === drag?.id) return false;
      const box = node.getBoundingClientRect();
      return event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    });
  }
  root.addEventListener('pointerdown', event => {
    const button = event.target.closest('[data-archive-id]');
    if (!button || event.button !== 0) return;
    event.stopPropagation();
    suppressClick = false;
    if (!canEdit()) return;
    const object = getObjects().find(object => object.id === button.dataset.archiveId);
    drag = { id: object.id, pointerId: event.pointerId, origin: point(event), x: object.x, y: object.y,
      clientX: event.clientX, clientY: event.clientY, button, moved: false };
    button.setPointerCapture(event.pointerId);
  });
  root.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.clientX, event.clientY - drag.clientY) < 5) return;
    drag.moved = true;
    const position = point(event);
    drag.position = { x: drag.x + position.x - drag.origin.x, y: drag.y + position.y - drag.origin.y };
    drag.button.style.left = `${drag.position.x * 100}%`; drag.button.style.top = `${drag.position.y * 100}%`;
    const target = targetAt(event);
    for (const node of root.querySelectorAll('[data-archive-id]')) node.classList.toggle('is-drop-target', node === target);
  });
  const finish = (event, canceled = false) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const old = drag, target = !canceled && old.moved ? targetAt(event) : null;
    drag = null;
    if (old.button.hasPointerCapture(event.pointerId)) old.button.releasePointerCapture(event.pointerId);
    suppressClick = old.moved;
    if (!canceled && old.moved) {
      if (target) onMerge(old.id, target.dataset.archiveId);
      else onMove(old.id, old.position);
    }
    if (old.moved || canceled) render();
  };
  root.addEventListener('pointerup', event => finish(event));
  root.addEventListener('pointercancel', event => finish(event, true));
  root.addEventListener('lostpointercapture', event => { if (drag) finish(event, true); });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-archive-id]');
    if (!button) return;
    event.stopPropagation();
    if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
    onOpen(button.dataset.archiveId);
  });
  root.addEventListener('keydown', event => {
    const button = event.target.closest('[data-archive-id]');
    const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!button || !delta || !canEdit()) return;
    event.preventDefault(); event.stopPropagation();
    const object = getObjects().find(object => object.id === button.dataset.archiveId);
    onMove(object.id, { x: object.x + delta[0] * .01, y: object.y + delta[1] * .01 });
    buttonFor(object.id)?.focus();
  });

  return Object.freeze({ render,
    animate(entryId, origin, destination, poster) {
      const size = window.TafelRuntime.boardSize();
      pendingFall = { id: entryId, x: (origin.x - destination.x) * size.w, y: (origin.y - destination.y) * size.h };
      if (!poster) return;
      const ghost = document.createElement('div');
      ghost.className = 'archive-crumple-ghost';
      ghost.style.cssText = `left:${origin.x * 100}%;top:${origin.y * 100}%;width:${poster.style.width};`;
      ghost.innerHTML = poster.innerHTML;
      root.append(ghost);
      // Move the short-lived animation outside the rendered floor list.
      document.getElementById('board-stage').append(ghost);
      ghost.addEventListener('animationend', () => ghost.remove(), { once: true });
      window.setTimeout(() => ghost.remove(), 500);
    },
  });
}
