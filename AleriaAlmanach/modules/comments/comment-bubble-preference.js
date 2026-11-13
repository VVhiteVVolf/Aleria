// Personal reading preference. This never changes module or comment records.
(function initCommentBubblePreference() {
  const storageKey = 'aleria-comment-bubble-art-enabled-v1';
  const toggleSelector = 'input[data-comment-bubble-toggle]';
  let enabled = false;
  try { enabled = localStorage.getItem(storageKey) === '1'; } catch { /* Use the default when storage is unavailable. */ }

  function applyPreference(next, persist) {
    enabled = next === true;
    if (persist) {
      try { localStorage.setItem(storageKey, enabled ? '1' : '0'); } catch { /* The current view still works. */ }
    }
    document.querySelectorAll('.session-page, [data-comment-bubble-surface]').forEach(scene => {
      scene.dataset.animatedBubbles = String(enabled);
    });
    document.querySelectorAll(toggleSelector).forEach(toggle => { toggle.checked = enabled; });
  }

  function renderControl() {
    return `<label class="scene-bubble-preference" title="Animierte Sprechblasen (experimentell)">
      <input type="checkbox" data-comment-bubble-toggle aria-label="Animierte Sprechblasen (experimentell)"${enabled ? ' checked' : ''}>
      <span>Frames</span>
    </label>`;
  }

  document.addEventListener('change', event => {
    if (event.target?.matches?.(toggleSelector)) applyPreference(event.target.checked, true);
  });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) applyPreference(event.key !== null && event.newValue === '1', false);
  });

  window.AleriaCommentBubbles = Object.freeze({ isEnabled: () => enabled, renderControl });
  document.querySelectorAll('[data-comment-bubble-control]').forEach(slot => { slot.innerHTML = renderControl(); });
  applyPreference(enabled, false);
})();
