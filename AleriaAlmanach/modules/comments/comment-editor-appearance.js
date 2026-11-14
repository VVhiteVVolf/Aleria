// Personal editor appearance. Sizes never enter drafts or comment records.
(function initCommentEditorAppearance() {
  const storageKey = 'aleria-comment-editor-avatar-sizes-v1';
  const settings = {
    preview: { label: 'Avatare in der Vorschau', min: 56, max: 184, default: 120 },
    segments: { label: 'Avatare in den Abschnitten', min: 48, max: 144, default: 80 }
  };
  const roots = [...document.querySelectorAll('[data-comment-editor-appearance]')];
  let sizes;

  function normalize(value) {
    return Object.fromEntries(Object.entries(settings).map(([key, setting]) => {
      const size = value?.[key];
      return [key, typeof size === 'number' && Number.isFinite(size)
        ? Math.max(setting.min, Math.min(setting.max, Math.round(size / 8) * 8))
        : setting.default];
    }));
  }

  function readSizes() {
    try { return normalize(JSON.parse(localStorage.getItem(storageKey))); }
    catch { return normalize(null); }
  }

  function applySizes() {
    roots.forEach(root => {
      Object.entries(sizes).forEach(([key, size]) => {
        root.style.setProperty(`--comment-editor-${key}-avatar-size`, `${size}px`);
        root.querySelectorAll(`[data-comment-avatar-size="${key}"]`).forEach(input => {
          input.value = String(size);
          input.setAttribute('aria-valuetext', `${size} Pixel`);
        });
        root.querySelectorAll(`[data-comment-avatar-value="${key}"]`).forEach(output => { output.textContent = `${size} px`; });
      });
    });
  }

  sizes = readSizes();
  roots.forEach(root => {
    root.querySelectorAll('[data-comment-avatar-control]').forEach(slot => {
      const key = slot.dataset.commentAvatarControl, setting = settings[key];
      if (!setting) return;
      const input = document.createElement('input');
      input.type = 'range'; input.min = String(setting.min); input.max = String(setting.max); input.step = '8';
      input.id = `comment-avatar-size-${slot.dataset.commentAvatarId}`;
      input.dataset.commentAvatarSize = key;
      const label = document.createElement('label'); label.htmlFor = input.id; label.textContent = setting.label;
      const output = document.createElement('output'); output.setAttribute('for', input.id); output.dataset.commentAvatarValue = key;
      slot.classList.add('comment-avatar-size-control'); slot.replaceChildren(label, input, output);
    });
    root.addEventListener('input', event => {
      const input = event.target, key = input?.dataset?.commentAvatarSize;
      if (!input?.matches?.('input[type="range"][data-comment-avatar-size]') || !Object.hasOwn(settings, key)) return;
      sizes = normalize({ ...sizes, [key]: Number(input.value) });
      applySizes();
      try { localStorage.setItem(storageKey, JSON.stringify(sizes)); } catch { /* Current controls remain usable. */ }
    });
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    sizes = readSizes(); applySizes();
  });
  applySizes();
})();
