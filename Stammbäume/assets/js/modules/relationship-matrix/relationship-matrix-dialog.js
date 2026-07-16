import { buildRelationshipMatrix } from './relationship-matrix-model.js';
import { renderRelationshipMatrix } from './relationship-matrix-renderer.js';

export function createRelationshipMatrixDialog(documentRef = document) {
  const dialog = documentRef.getElementById('relationship-matrix-dialog');
  const content = dialog?.querySelector('[data-matrix-content]');
  const title = dialog?.querySelector('[data-matrix-title]');
  const count = dialog?.querySelector('[data-matrix-count]');
  const resetButton = dialog?.querySelector('[data-matrix-action="reset"]');
  let family = null;
  let initialPersonId = '';
  let currentPersonId = '';

  function render(personId) {
    if (!content || !family) return;
    const matrix = buildRelationshipMatrix(family, personId);
    currentPersonId = personId;
    title.textContent = `Beziehungsgeflecht · ${matrix.focusPerson.name}`;
    count.textContent = `${matrix.relationshipCount} Personen in der direkten Familie und im unmittelbaren Beziehungsnetz`;
    resetButton.hidden = personId === initialPersonId;
    content.innerHTML = renderRelationshipMatrix(matrix);
  }

  function close() {
    if (dialog?.open) dialog.close();
  }

  dialog?.addEventListener('click', event => {
    const actionTarget = event.target.closest('[data-matrix-action]');
    if (actionTarget?.dataset.matrixAction === 'close') {
      close();
      return;
    }
    if (actionTarget?.dataset.matrixAction === 'reset') {
      render(initialPersonId);
      return;
    }
    const personTarget = event.target.closest('[data-matrix-person-id]');
    const personId = personTarget?.dataset.matrixPersonId;
    if (personId && personId !== currentPersonId) render(personId);
  });

  dialog?.addEventListener('click', event => {
    if (event.target === dialog) close();
  });

  return Object.freeze({
    open(nextFamily, personId) {
      if (!dialog || !content) return false;
      family = nextFamily;
      initialPersonId = personId;
      render(personId);
      if (!dialog.open) dialog.showModal();
      return true;
    },
    close
  });
}
