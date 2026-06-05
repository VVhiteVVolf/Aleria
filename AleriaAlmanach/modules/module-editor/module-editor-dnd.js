function getModuleDragType(item) {
  if (!item) return '';
  if (item.classList.contains('module-page-card')) return 'page';
  if (item.classList.contains('module-comment-block-card')) return 'comment';
  if (item.classList.contains('module-scene-block-card')) return 'scene';
  return '';
}

function clearModuleDragMarkers() {
  document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(node => {
    node.classList.remove('drag-over-top', 'drag-over-bottom');
  });
}

function finalizeModuleEditorDrag(applied = false) {
  const drag = _moduleEditorDragState;
  if (!drag) return;
  clearModuleDragMarkers();
  drag.item?.classList.remove('dragging');
  const movedItem = drag.item;
  const dragType = drag.type;
  _moduleEditorDragState = null;
  if (!applied || !movedItem) return;

  if (dragType === 'page') {
    renumberModulePageCards();
    const index = getModulePageCards().indexOf(movedItem);
    setModuleEditorPreviewPage(index >= 0 ? index : 0);
    return;
  }

  const pageCard = movedItem.closest('.module-page-card');
  if (!pageCard) return;
  if (dragType === 'comment') {
    renumberModuleCommentBlocks(pageCard);
  } else if (dragType === 'scene') {
    renumberModuleSceneBlocks(pageCard);
  }
  syncModuleJsonPreview();
}

function handleModuleEditorDragStart(event) {
  const item = event.currentTarget.closest('.module-page-card, .module-comment-block-card, .module-scene-block-card');
  const type = getModuleDragType(item);
  if (!item || !type) return;
  _moduleEditorDragState = {
    type,
    item,
    parent: item.parentElement
  };
  item.classList.add('dragging');
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', type);
  }
}

function handleModuleEditorDragEnd() {
  finalizeModuleEditorDrag(false);
}

function handleModuleEditorDragOver(event) {
  const drag = _moduleEditorDragState;
  const target = event.currentTarget;
  if (!drag || !target) return;
  if (drag.type !== getModuleDragType(target)) return;
  if (target === drag.item || target.parentElement !== drag.parent) return;
  event.preventDefault();
  clearModuleDragMarkers();
  const rect = target.getBoundingClientRect();
  const before = event.clientY < rect.top + (rect.height / 2);
  target.classList.add(before ? 'drag-over-top' : 'drag-over-bottom');
  drag.dropTarget = target;
  drag.before = before;
}

function handleModuleEditorDragLeave(event) {
  const target = event.currentTarget;
  if (!target) return;
  if (event.relatedTarget && target.contains(event.relatedTarget)) return;
  target.classList.remove('drag-over-top', 'drag-over-bottom');
}

function handleModuleEditorDrop(event) {
  const drag = _moduleEditorDragState;
  const target = event.currentTarget;
  if (!drag || !target) return;
  if (drag.type !== getModuleDragType(target)) return;
  if (target === drag.item || target.parentElement !== drag.parent) return;
  event.preventDefault();
  clearModuleDragMarkers();
  if (drag.before) {
    drag.parent.insertBefore(drag.item, target);
  } else {
    drag.parent.insertBefore(drag.item, target.nextElementSibling);
  }
  finalizeModuleEditorDrag(true);
}

function bindModuleEditorDnD() {
  document.querySelectorAll('.module-editor-drag-handle').forEach(handle => {
    if (handle.dataset.dragBound === '1') return;
    handle.dataset.dragBound = '1';
    handle.setAttribute('draggable', 'true');
    handle.addEventListener('dragstart', handleModuleEditorDragStart);
    handle.addEventListener('dragend', handleModuleEditorDragEnd);
  });

  document.querySelectorAll('.module-page-card, .module-comment-block-card, .module-scene-block-card').forEach(item => {
    if (item.dataset.dropBound === '1') return;
    item.dataset.dropBound = '1';
    item.addEventListener('dragover', handleModuleEditorDragOver);
    item.addEventListener('dragleave', handleModuleEditorDragLeave);
    item.addEventListener('drop', handleModuleEditorDrop);
  });
}
