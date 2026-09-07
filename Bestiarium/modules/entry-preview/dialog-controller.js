// Native dialog supplies focus containment and Escape handling for both archive previews and images.
export function createDialogController(dialog, closeAction) {
  let opener = null;
  dialog.addEventListener('click', event => {
    if (event.target.closest(`[data-action="${closeAction}"]`)) dialog.close();
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  });
  return {
    open(trigger) {
      opener = trigger;
      dialog.showModal();
    }
  };
}
