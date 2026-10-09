import { buildRelationshipMatrix } from './relationship-matrix-model.js';
import { renderRelationshipMatrix } from './relationship-matrix-renderer.js';

export function createRelationshipMatrixDialog(documentRef = document) {
  const dialog = documentRef.getElementById('relationship-matrix-dialog');
  const content = dialog?.querySelector('[data-matrix-content]');
  const title = dialog?.querySelector('[data-matrix-title]');
  const count = dialog?.querySelector('[data-matrix-count]');
  const resetButton = dialog?.querySelector('[data-matrix-action="reset"]');
  const backButton = dialog?.querySelector('[data-matrix-action="back"]');
  let family = null;
  let initialPersonId = '';
  let currentPersonId = '';
  let history = [];

  function render(personId) {
    if (!content || !family) return;
    const matrix = buildRelationshipMatrix(family, personId);
    currentPersonId = personId;
    title.textContent = `Beziehungsgeflecht · ${matrix.focusPerson.name}`;
    count.textContent = `${matrix.relationshipCount} Personen in der direkten Familie und im unmittelbaren Beziehungsnetz`;
    resetButton.hidden = personId === initialPersonId;
    if (backButton) backButton.hidden = history.length === 0;
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
      history = [];
      render(initialPersonId);
      return;
    }
    if (actionTarget?.dataset.matrixAction === 'back') {
      const previousId = history.pop();
      if (previousId) render(previousId);
      return;
    }
    const personTarget = event.target.closest('[data-matrix-person-id]');
    const personId = personTarget?.dataset.matrixPersonId;
    if (personId && personId !== currentPersonId) {
      history.push(currentPersonId);
      render(personId);
      content.scrollTop = 0;
      content.querySelector('.relationship-matrix-focus h3')?.focus({ preventScroll: true });
    }
  });

  dialog?.addEventListener('click', event => {
    if (event.target === dialog) close();
  });

  return Object.freeze({
    open(nextFamily, personId, partnershipId = '') {
      if (!dialog || !content) return false;
      family = nextFamily;
      initialPersonId = personId;
      history = [];
      render(personId);
      if (!dialog.open) dialog.showModal();
      if (partnershipId) {
        const group = [...content.querySelectorAll('[data-matrix-partnership-id]')].find(element => element.dataset.matrixPartnershipId === partnershipId);
        group?.classList.add('is-selected');
        group?.scrollIntoView({ block: 'nearest' });
      } else content.scrollTop = 0;
      return true;
    },
    close
  });
}
