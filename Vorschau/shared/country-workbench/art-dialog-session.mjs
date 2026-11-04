/** Culture-free modal lifecycle; country renderers own content and facts. */
export function createArtDialogSession({ dialog, onSelect, contentSelector = '[data-role="art-details"]' }) {
  const content = dialog.querySelector(contentSelector);
  if (!content) throw new Error('The artwork dialog has no content slot.');
  let trigger, restoreFocus = true;

  function handleClose() {
    if (restoreFocus && trigger?.isConnected) trigger.focus({ preventScroll: true });
    restoreFocus = true;
  }
  function handleClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    if (button.dataset.action === 'close-art') dialog.close();
    if (button.dataset.action === 'select-from-dialog' && onSelect) {
      restoreFocus = false;
      dialog.close();
      onSelect(button.dataset.house);
    }
  }
  dialog.addEventListener('close', handleClose);
  dialog.addEventListener('click', handleClick);

  return {
    open(html) {
      if (!dialog.open) trigger = dialog.ownerDocument.activeElement;
      content.innerHTML = html;
      if (!dialog.open) dialog.showModal();
      dialog.scrollTop = 0;
      content.scrollTop = 0;
    },
    destroy() {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleClick);
      trigger = null;
    },
  };
}
