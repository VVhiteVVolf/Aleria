// Sorting owns only its interaction state; the editor owns data and persistence.
(() => {
  const tabs = document.getElementById('cp-image-set-tabs');
  if (!tabs) return;
  let draggedId = '';
  const getTab = target => target.closest('[data-image-set-id]');
  const clearMarkers = () => {
    for (const tab of tabs.children) tab.classList.remove('is-drop-before', 'is-drop-after', 'is-dragging');
  };

  tabs.addEventListener('keydown', event => {
    const tab = getTab(event.target);
    if (!tab || event.isComposing || event.ctrlKey || event.metaKey) return;
    const index = _characterImageSets.findIndex(set => set.id === tab.dataset.imageSetId);
    const direction = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[event.key];
    if (!direction && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const destination = event.key === 'Home' ? 0 : event.key === 'End'
      ? _characterImageSets.length - 1 : index + direction;
    if (event.altKey) {
      moveCharacterImageSet(tab.dataset.imageSetId, destination, { focus: true });
    } else {
      const set = _characterImageSets[destination];
      if (!set) return;
      selectCharacterImageSet(set.id);
      tabs.children[destination]?.focus();
    }
  });

  tabs.addEventListener('dragstart', event => {
    const tab = getTab(event.target);
    if (!tab || !event.dataTransfer) return;
    draggedId = tab.dataset.imageSetId;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/x-aleria-image-set', draggedId);
    tab.classList.add('is-dragging');
  });

  tabs.addEventListener('dragover', event => {
    if (!draggedId) return;
    const tab = getTab(event.target);
    if (!tab) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    clearMarkers();
    if (tab.dataset.imageSetId === draggedId) return;
    const bounds = tab.getBoundingClientRect();
    tab.classList.add(event.clientX < bounds.left + bounds.width / 2 ? 'is-drop-before' : 'is-drop-after');
  });

  tabs.addEventListener('drop', event => {
    if (!draggedId) return;
    event.preventDefault();
    const tab = getTab(event.target);
    if (tab && tab.dataset.imageSetId !== draggedId) {
      const from = _characterImageSets.findIndex(set => set.id === draggedId);
      const target = _characterImageSets.findIndex(set => set.id === tab.dataset.imageSetId);
      const bounds = tab.getBoundingClientRect();
      const after = event.clientX >= bounds.left + bounds.width / 2;
      moveCharacterImageSet(draggedId, target + Number(after) - Number(from < target), { focus: true });
    }
    draggedId = '';
    clearMarkers();
  });

  tabs.addEventListener('dragleave', event => {
    if (!tabs.contains(event.relatedTarget)) clearMarkers();
  });
  tabs.addEventListener('dragend', () => { draggedId = ''; clearMarkers(); });
})();
