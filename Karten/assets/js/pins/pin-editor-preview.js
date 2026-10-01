// Owns the editor's live card. Preserve loaded media while updating changed content.
(function () {
  let container = null;
  let previous = null;
  let markup = '';
  let frame = null;
  let pendingPin = null;

  function cancel() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    pendingPin = null;
  }

  function reset() {
    cancel();
    container = null;
    previous = null;
    markup = '';
  }

  function syncNode(live, before, after) {
    if (before.nodeType !== after.nodeType || before.nodeName !== after.nodeName) {
      live.replaceWith(after.cloneNode(true));
      return;
    }
    if (after.nodeType !== Node.ELEMENT_NODE) {
      if (before.nodeValue !== after.nodeValue) live.nodeValue = after.nodeValue;
      return;
    }
    for (const attr of before.attributes) {
      if (!after.hasAttribute(attr.name)) live.removeAttribute(attr.name);
    }
    for (const attr of after.attributes) {
      if (before.getAttribute(attr.name) !== attr.value) live.setAttribute(attr.name, attr.value);
    }
    // Keep an image's error fallback until a genuinely different URL is selected.
    if (after.tagName === 'IMG' && before.getAttribute('src') !== after.getAttribute('src')) {
      live.hidden = false;
      const banner = live.closest('.sv-banner');
      if (banner) banner.hidden = false;
      const fallback = live.closest('.sv-img-wrap, .sv-crest')?.querySelector('.sv-img-ph, .sv-crest-placeholder');
      if (fallback) fallback.hidden = true;
    }
    syncChildren(live, before, after);
  }

  function syncChildren(live, before, after) {
    const oldChildren = [...before.childNodes];
    const newChildren = [...after.childNodes];
    const liveChildren = [...live.childNodes];
    for (let index = 0; index < Math.max(oldChildren.length, newChildren.length); index++) {
      if (!newChildren[index]) liveChildren[index]?.remove();
      else if (!oldChildren[index]) live.appendChild(newChildren[index].cloneNode(true));
      else syncNode(liveChildren[index], oldChildren[index], newChildren[index]);
    }
  }

  function render(pin) {
    cancel();
    const target = document.getElementById('sb-preview-content');
    if (!target || !document.getElementById('sidebar')?.classList.contains('editor-fullscreen')) return;
    const nextMarkup = pin
      ? `<div class="editor-preview-card">${window.KartoPinCard.render(pin, {titleId:'pin-preview-title'})}</div>`
      : '<div class="editor-preview-empty">Kein Pin gewählt.</div>';
    if (target === container && nextMarkup === markup) return;
    const next = document.createElement('template');
    next.innerHTML = nextMarkup;
    if (target !== container || !previous) target.replaceChildren(next.content.cloneNode(true));
    else syncChildren(target, previous, next.content);
    container = target;
    previous = next.content;
    markup = nextMarkup;
  }

  function schedule(pin) {
    pendingPin = pin;
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      const latest = pendingPin;
      pendingPin = null;
      // The mobile editor refreshes on demand when switching to its preview tab.
      if (document.getElementById('sb-preview')?.getClientRects().length) {
        window.KartoRuntime.renderEditorPreview(latest);
      }
    });
  }

  window.KartoPinEditorPreview = Object.freeze({render, schedule, reset});
})();
