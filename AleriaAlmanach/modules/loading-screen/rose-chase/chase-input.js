const keyActions = {
  Numpad4: 'back', ArrowLeft: 'back',
  Numpad6: 'forward', ArrowRight: 'forward',
  Numpad8: 'jump', ArrowUp: 'jump', Space: 'jump',
  Numpad2: 'down', ArrowDown: 'down'
};

export function bindChaseInput(root, signal, wakeAudio) {
  const held = new Map();
  let jumpRequested = false;
  const listen = (name, callback) => root.addEventListener(name, callback, { signal });

  function press(token, action) {
    if (held.has(token)) return;
    held.set(token, action);
    if (action === 'jump') jumpRequested = true;
    wakeAudio();
  }

  function release(token) {
    held.delete(token);
  }

  function clear() {
    held.clear();
    jumpRequested = false;
    for (const active of root.querySelectorAll('[data-chase-input][data-held]')) delete active.dataset.held;
  }

  listen('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey || (event.code === 'Space' && event.target.closest('button'))) return;
    const action = keyActions[event.code];
    if (!action) return;
    event.preventDefault();
    if (!event.repeat) press(event.code, action);
  });
  listen('keyup', event => release(event.code));
  listen('focusout', event => { if (!root.contains(event.relatedTarget)) clear(); });
  listen('pointerdown', event => {
    const button = event.target.closest('[data-chase-input]');
    if (!button || event.button !== 0) return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    button.dataset.held = '';
    press(event.pointerId, button.dataset.chaseInput);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    listen(type, event => {
      release(event.pointerId);
      const button = event.target.closest('[data-chase-input]');
      if (button) delete button.dataset.held;
    });
  }
  // Keyboard and assistive-technology activation of a touch control still works.
  listen('click', event => {
    const button = event.target.closest('[data-chase-input]');
    if (!button || event.detail !== 0) return;
    press(button, button.dataset.chaseInput);
    root.ownerDocument.defaultView.requestAnimationFrame(() => release(button));
  });

  return {
    clear,
    read() {
      const actions = new Set(held.values());
      const jump = jumpRequested;
      jumpRequested = false;
      return { jump, back: actions.has('back'), forward: actions.has('forward'), down: actions.has('down') };
    }
  };
}
