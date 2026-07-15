import { DEFAULT_CREST_FRAME } from '../config/chart-frames.js';
import { fillCrestFrameSelect } from './crest-frame-options.js';

function partnershipLabel(partnership, personById) {
  return partnership.participantIds
    .map(personId => personById.get(personId)?.name || personId)
    .join(' & ');
}

export function createCadetDialog(documentRef = document) {
  const dialog = documentRef.getElementById('cadet-dialog');
  const form = documentRef.getElementById('cadet-form');
  const partnershipSelect = documentRef.getElementById('cadet-parent-partnership');
  const title = documentRef.getElementById('cadet-dialog-title');
  const submitButton = documentRef.getElementById('cadet-dialog-submit');
  const deleteButton = documentRef.getElementById('cadet-dialog-delete');

  function populatePartnerships(family, preferredPartnershipId = '') {
    const personById = new Map(family.persons.map(person => [person.id, person]));
    partnershipSelect.replaceChildren();
    family.partnerships.forEach(partnership => {
      partnershipSelect.add(new Option(partnershipLabel(partnership, personById), partnership.id));
    });
    if (preferredPartnershipId && family.partnerships.some(item => item.id === preferredPartnershipId)) {
      partnershipSelect.value = preferredPartnershipId;
    }
  }

  function openCreate(family, preferredPartnershipId = '') {
    form.reset();
    fillCrestFrameSelect(form.elements.namedItem('crestFrame'), DEFAULT_CREST_FRAME);
    populatePartnerships(family, preferredPartnershipId);
    title.textContent = 'Hausknoten anlegen';
    submitButton.textContent = 'Verknüpfung anlegen';
    deleteButton.hidden = true;
    if (!dialog.open) dialog.showModal();
  }

  function openEdit(family, branchId) {
    const branch = family.cadetBranches.find(item => item.id === branchId);
    if (!branch) throw new Error('Die Hausverknüpfung wurde nicht gefunden.');
    form.reset();
    populatePartnerships(family, branch.parentPartnershipId);
    fillCrestFrameSelect(form.elements.namedItem('crestFrame'), branch.crestFrame);
    ['id', 'houseId', 'linkType', 'name', 'subtitle', 'founded', 'emblem', 'targetFamilyId', 'notes'].forEach(fieldName => {
      form.elements.namedItem(fieldName).value = branch[fieldName] || '';
    });
    title.textContent = 'Hausknoten bearbeiten';
    submitButton.textContent = 'Verknüpfung speichern';
    deleteButton.hidden = false;
    if (!dialog.open) dialog.showModal();
  }

  function read() {
    return Object.fromEntries(new FormData(form).entries());
  }

  function getCurrentId() {
    return String(form.elements.namedItem('id').value || '');
  }

  return Object.freeze({
    dialog,
    form,
    openCreate,
    openEdit,
    close: () => {
      if (dialog.open) dialog.close();
    },
    read,
    getCurrentId
  });
}
