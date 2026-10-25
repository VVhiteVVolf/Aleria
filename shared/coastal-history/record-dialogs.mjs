// Feature-owned delegated dialog handling; native Escape and focus restoration remain intact.
for (const scope of document.querySelectorAll('[data-record-dialogs]')) {
  scope.addEventListener('click', event => {
    const opener = event.target.closest('[data-open-record]');
    if (opener && scope.contains(opener)) {
      const dialog = scope.querySelector(`#${CSS.escape(opener.dataset.openRecord)}`);
      if (dialog instanceof HTMLDialogElement && typeof dialog.showModal === 'function') dialog.showModal();
      return;
    }
    const closer = event.target.closest('[data-close-record]');
    if (closer) closer.closest('dialog')?.close();
    if (event.target instanceof HTMLDialogElement && event.target.hasAttribute('open')) {
      const bounds = event.target.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.target.close();
    }
  });
}
