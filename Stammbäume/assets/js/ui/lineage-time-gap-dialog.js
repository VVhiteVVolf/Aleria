import { earliestKnownBirthYear, latestKnownPersonYear } from '../domain/time-boundaries.js';

export function createLineageTimeGapDialog(documentRef = document) {
  const dialog = documentRef.getElementById('lineage-time-gap-dialog');
  const form = documentRef.getElementById('lineage-time-gap-form');
  const title = documentRef.getElementById('lineage-time-gap-title');
  const submitButton = documentRef.getElementById('lineage-time-gap-submit');
  const deleteButton = documentRef.getElementById('lineage-time-gap-delete');

  function open(family, options = {}) {
    const editing = family.lineage.timeGap.enabled === true;
    const personById = new Map(family.persons.map(person => [person.id, person]));
    const partnership = family.partnerships.find(item => item.id === family.lineage.founderPartnershipId);
    const descendantIds = family.parentages
      .filter(parentage => parentage.partnershipId === family.lineage.founderPartnershipId)
      .map(parentage => parentage.childId);
    form.reset();
    form.elements.namedItem('fromYear').value = family.lineage.timeGap.fromYear
      || latestKnownPersonYear(partnership?.participantIds || [], personById);
    form.elements.namedItem('toYear').value = family.lineage.timeGap.toYear
      || earliestKnownBirthYear(descendantIds, personById);
    form.elements.namedItem('years').value = String(family.lineage.timeGap.years || '');
    form.elements.namedItem('label').value = family.lineage.timeGap.label;
    title.textContent = editing ? 'Zeitsprung unter dem Hauswappen bearbeiten' : 'Zeitsprung unter dem Hauswappen einfügen';
    submitButton.textContent = editing ? 'Zeitsprung speichern' : 'Zeitsprung einfügen';
    deleteButton.hidden = !editing;
    if (!dialog.open) dialog.showModal();
    if (options.focusLabel) form.elements.namedItem('label').focus();
  }

  function read() {
    const fromYear = form.elements.namedItem('fromYear').value.trim();
    const toYear = form.elements.namedItem('toYear').value.trim();
    const calculatedYears = /^\d{1,4}$/.test(fromYear) && /^\d{1,4}$/.test(toYear)
      ? Math.max(0, Number(toYear) - Number(fromYear))
      : 0;
    return {
      enabled: true,
      fromYear,
      toYear,
      years: Number(form.elements.namedItem('years').value || calculatedYears),
      label: form.elements.namedItem('label').value.trim()
    };
  }

  return Object.freeze({
    dialog,
    form,
    open,
    read,
    close: () => {
      if (dialog.open) dialog.close();
    }
  });
}
