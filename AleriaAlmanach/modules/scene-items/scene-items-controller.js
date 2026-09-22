import { renderSceneItemEvent } from './scene-items-ui.js';
import { renderSceneItemComposer, mountSceneItemComposer, serializeSceneItemSegment, previewSceneItem, getSceneItemDraftForEditor, refreshSceneItemTemplates } from './scene-items-composer.js';
window.addEventListener('item-db-store-updated', refreshSceneItemTemplates);
let dialog;
function openCard(item, status = 'In der Szene') {
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'scene-item-card-dialog';
    dialog.setAttribute('aria-label', 'Itemkarte');
    dialog.addEventListener('keydown', event => { if (event.key === 'Escape') event.stopPropagation(); });
    document.body.append(dialog);
  }
  if (!dialog.isConnected) document.body.append(dialog);
  dialog.innerHTML = `<button type="button" data-scene-item-action="close" aria-label="Itemkarte schließen">×</button>${globalThis.buildInventoryCardContent(item, { status })}`;
  if (!dialog.open) dialog.showModal();
}
document.addEventListener('click', event => {
  const button = event.target.closest?.('[data-scene-item-action]');
  if (!button) return;
  if (button.dataset.sceneItemAction === 'close') dialog?.close();
  if (button.dataset.sceneItemAction === 'card') {
    try { openCard(JSON.parse(button.dataset.sceneItemCard), button.dataset.sceneItemStatus); } catch (error) { console.error('Itemkarte konnte nicht geöffnet werden.', error); }
  }
  if (button.dataset.sceneItemAction === 'preview') {
    const editor = button.closest('[data-scene-editor]');
    try {
      openCard(previewSceneItem(getSceneItemDraftForEditor(editor)), 'Vorschau');
      editor.querySelector('[data-scene-error]').textContent = '';
    } catch (error) { editor.querySelector('[data-scene-error]').textContent = error.message; }
  }
});
function renderDraft(draft) {
  try { return renderSceneItemEvent({ operation: 'place', sceneItemId: 'preview', item: previewSceneItem(draft), text: draft.sceneText || draft.description }); }
  catch { return '<p class="scene-item-help">Ergänze Name und Kurzbeschreibung für die Itemvorschau.</p>'; }
}
globalThis.AleriaSceneItems = Object.freeze({ renderEvent: renderSceneItemEvent, renderDraft,
  renderComposer: renderSceneItemComposer, mountComposer: mountSceneItemComposer, serializeSegment: serializeSceneItemSegment,
  validateSubmission(segments) { for (const segment of segments) if (segment.kind === 'sceneitem') previewSceneItem(segment.sceneItemDraft); }
});
