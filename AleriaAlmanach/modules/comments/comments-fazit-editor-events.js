// Fazit editor interactions that are not ordinary click actions: drag/drop,
// active-section tracking and keyboard shortcuts.
let _draggedFazitLineId = '';

function clearFazitDragIndicators() {
  document.querySelectorAll('[data-fazit-line].is-dragging, [data-fazit-line].is-drop-before, [data-fazit-line].is-drop-after')
    .forEach(section => section.classList.remove('is-dragging', 'is-drop-before', 'is-drop-after'));
}

function handleFazitDragStart(event) {
  const handle = event.target?.closest?.('[data-role="fazit-drag-handle"]');
  if (!handle) return;
  const lineId = String(handle.dataset.lineId || '');
  const section = handle.closest('[data-fazit-line]');
  if (!lineId || !section) return;
  _draggedFazitLineId = lineId;
  section.classList.add('is-dragging');
  event.dataTransfer?.setData('text/plain', lineId);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  setActiveFazitLine(lineId);
}

function handleFazitDragOver(event) {
  const section = event.target?.closest?.('[data-fazit-line]');
  if (!section || !_draggedFazitLineId || section.dataset.lineId === _draggedFazitLineId) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('[data-fazit-line].is-drop-before, [data-fazit-line].is-drop-after')
    .forEach(node => node.classList.remove('is-drop-before', 'is-drop-after'));
  const bounds = section.getBoundingClientRect();
  const placement = event.clientY >= bounds.top + bounds.height / 2 ? 'after' : 'before';
  section.classList.add(placement === 'after' ? 'is-drop-after' : 'is-drop-before');
}

function handleFazitDrop(event) {
  const section = event.target?.closest?.('[data-fazit-line]');
  if (!section || !_draggedFazitLineId) return;
  event.preventDefault();
  const placement = section.classList.contains('is-drop-after') ? 'after' : 'before';
  const targetLineId = String(section.dataset.lineId || '');
  const sourceLineId = _draggedFazitLineId;
  clearFazitDragIndicators();
  _draggedFazitLineId = '';
  moveFazitLineRelative(sourceLineId, targetLineId, placement);
}

function handleFazitDragEnd() {
  _draggedFazitLineId = '';
  clearFazitDragIndicators();
}

function handleFazitEditorFocusIn(event) {
  const section = event.target?.closest?.('[data-fazit-line]');
  if (section?.dataset.lineId) setActiveFazitLine(section.dataset.lineId);
}

function handleFazitEditorShortcut(event) {
  if (!event.target?.closest?.('#fazit-form-overlay')) return;
  const modifier = event.ctrlKey || event.metaKey;
  if (modifier && !event.altKey && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    if (event.shiftKey) redoFazitChange();
    else undoFazitChange();
    return;
  }
  if (modifier && !event.altKey && event.key.toLowerCase() === 'y') {
    event.preventDefault();
    redoFazitChange();
    return;
  }
  if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
  const section = event.target?.closest?.('[data-fazit-line]');
  if (!section?.dataset.lineId) return;
  event.preventDefault();
  const lineId = section.dataset.lineId;
  moveFazitLine(lineId, event.key === 'ArrowDown' ? 'down' : 'up');
  focusFazitLine(lineId);
}

document.addEventListener('dragstart', handleFazitDragStart);
document.addEventListener('dragover', handleFazitDragOver);
document.addEventListener('drop', handleFazitDrop);
document.addEventListener('dragend', handleFazitDragEnd);
document.addEventListener('focusin', handleFazitEditorFocusIn);
document.addEventListener('keydown', handleFazitEditorShortcut);
