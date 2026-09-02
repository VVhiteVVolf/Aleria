(function () {
  'use strict';

  let toastTimer = null;

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
  }

  function uid() {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  }

  function toast(message) {
    const element = document.getElementById('toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => element.classList.remove('on'), 2800);
  }

  function closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
  }

  function renderZettel() {
    window.TafelZettelBoard?.render();
  }

  function applyState(incoming) {
    window.TafelState.apply(incoming);
    window.TafelBoard.applyImage();
    window.TafelEditor?.applyMeta();
    renderZettel();
  }

  window.TafelRuntime = Object.freeze({
    state: () => window.TafelState.get(),
    uid,
    esc,
    save: () => window.TafelState.save(),
    backup: label => window.TafelState.backup(label),
    applyState,
    toast,
    renderZettel,
    closeModal,
    closeSidebar: () => window.TafelEditor?.closeSidebar(),
    canEditZettel: () => Boolean(window.TafelEditor?.isEditMode()),
    isEditMode: () => Boolean(window.TafelEditor?.isEditMode()),
    boardSize: () => window.TafelBoard.imageSize(),
    boardViewport: () => window.TafelBoard.viewport(),
    boardPointFromClient: (x, y) => window.TafelBoard.pointFromClient(x, y),
    openEditorShell: (kind, id) => window.TafelEditor?.openEditorShell(kind, id),
    renderEditorPreview: () => window.TafelEditor?.renderEditorPreview(),
  });

  window.TafelInit = function init() {
    const config = window.TAFEL_CONFIG || {};
    if (config.documentTitle) document.title = config.documentTitle;
    window.TafelBoard.init();
    window.TafelEditor.init();
    window.TafelZettelBoard.attachDragListeners();

    const loadPublishedOrDraft = () => window._fb.sub(remote => {
      if (remote) applyState(remote);
    });
    if (window._fb) loadPublishedOrDraft();
    else window.addEventListener('fb-ready', loadPublishedOrDraft, { once: true });

    if (window.TAFEL_BOOT_STATUS !== 'active') {
      toast('Diese Anzeigetafel ist noch nicht vollständig eingerichtet');
    }
  };
})();
