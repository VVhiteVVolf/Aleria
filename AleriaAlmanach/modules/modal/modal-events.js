// Modal overlay and keyboard navigation events.
document.getElementById('modal-overlay')?.addEventListener('click', event => {
  if (event.target === event.currentTarget) closeModal();
});

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-modal-action]');
  if (!trigger || !trigger.closest('#modal-overlay')) return;
  const action = trigger.dataset.modalAction;
  if (![
    'close',
    'jump-page',
    'flip-page',
    'save-inline-edit',
    'cancel-inline-edit',
    'move-inline-page',
    'remove-inline-page',
    'export-current-module',
    'export-current-comment-thread',
    'import-current-comment-thread',
    'open-module-editor-current'
  ].includes(action)) return;
  event.preventDefault();

  if (action === 'close') {
    closeModal();
    return;
  }
  if (action === 'jump-page') {
    jumpToPage(Number(trigger.dataset.pageIndex) || 0);
    return;
  }
  if (action === 'flip-page') {
    flipPage(Number(trigger.dataset.direction) || 0);
    return;
  }
  if (action === 'save-inline-edit') {
    saveInlineModuleEdit();
    return;
  }
  if (action === 'cancel-inline-edit') {
    cancelInlineModuleEdit();
    return;
  }
  if (action === 'move-inline-page') {
    moveInlineCurrentPage(Number(trigger.dataset.direction) || 0);
    return;
  }
  if (action === 'remove-inline-page') {
    removeInlineCurrentPage();
    return;
  }
  if (action === 'export-current-module') {
    exportCurrentModule();
    return;
  }
  if (action === 'export-current-comment-thread') {
    exportCurrentCommentThreadFromModal();
    return;
  }
  if (action === 'import-current-comment-thread') {
    importCurrentCommentThreadFromModal();
    return;
  }
  if (action === 'open-module-editor-current') {
    openModuleEditorForCurrent();
  }
});

document.addEventListener('change', event => {
  const field = event.target;
  if (!field?.closest?.('#modal-overlay')) return;
  const action = field.dataset?.modalAction;

  if (action === 'filter-scene-speaker') {
    const selected = String(field.value || '');
    const textCol = field.closest('.modal-text-col') || document.getElementById('modal-text-col-el');
    textCol?.querySelectorAll?.('.scene-bubble[data-scene-speaker]').forEach(bubble => {
      bubble.hidden = !!selected && bubble.dataset.sceneSpeaker !== selected;
    });
    return;
  }

  if (action === 'add-inline-page' && field.value) {
    addInlinePage(field.value);
    field.value = '';
    return;
  }
  if (action === 'apply-inline-template') {
    applyInlineModuleTemplate(field);
  }
});

function isModalKeyboardBlocked() {
  if (typeof isCommentFormOpen === 'function' && isCommentFormOpen()) return true;
  return !!(
    document.getElementById('edit-comment-overlay')?.classList.contains('active') ||
    document.getElementById('delete-confirm-overlay')?.classList.contains('active') ||
    document.getElementById('char-profile-overlay')?.classList.contains('active') ||
    document.getElementById('module-editor-overlay')?.classList.contains('active') ||
    document.getElementById('crop-overlay')?.classList.contains('active')
  );
}

function isModalTypingTarget(target) {
  return !!target && (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  );
}

document.addEventListener('keydown', event => {
  const overlay = document.getElementById('modal-overlay');
  const isModalOpen = !!currentEntry && overlay?.classList.contains('active');
  if (!isModalOpen || isModalKeyboardBlocked()) return;

  if (event.key === 'Escape') {
    closeModal();
    return;
  }

  if (isModalTypingTarget(event.target)) return;
  if (event.key === 'ArrowRight') flipPage(1);
  if (event.key === 'ArrowLeft') flipPage(-1);
});
