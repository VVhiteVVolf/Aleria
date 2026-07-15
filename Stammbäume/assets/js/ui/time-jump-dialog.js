import { earliestKnownBirthYear, latestKnownPersonYear } from '../domain/time-boundaries.js';

function partnershipLabel(partnership, personById) {
  return partnership.participantIds
    .map(personId => personById.get(personId)?.name || personId)
    .join(' & ');
}

export function createTimeJumpDialog(documentRef = document) {
  const dialog = documentRef.getElementById('time-jump-dialog');
  const form = documentRef.getElementById('time-jump-form');
  const partnershipSelect = form.elements.namedItem('parentPartnershipId');
  const childSelect = form.elements.namedItem('childId');
  const fromYearInput = form.elements.namedItem('fromYear');
  const toYearInput = form.elements.namedItem('toYear');
  const title = documentRef.getElementById('time-jump-dialog-title');
  const submitButton = documentRef.getElementById('time-jump-dialog-submit');
  const deleteButton = documentRef.getElementById('time-jump-dialog-delete');
  const addChildButton = documentRef.getElementById('time-jump-dialog-add-child');
  let currentFamily = null;
  let currentTimeJump = null;

  function personIndex() {
    return new Map((currentFamily?.persons || []).map(person => [person.id, person]));
  }

  function suggestFromYear() {
    const partnership = currentFamily?.partnerships.find(item => item.id === partnershipSelect.value);
    fromYearInput.value = latestKnownPersonYear(partnership?.participantIds || [], personIndex());
  }

  function suggestToYear() {
    toYearInput.value = earliestKnownBirthYear(childSelect.value ? [childSelect.value] : [], personIndex());
  }

  function populateChildren() {
    const partnership = currentFamily?.partnerships.find(item => item.id === partnershipSelect.value);
    const excludedIds = new Set([
      ...(partnership?.participantIds || []),
      ...(currentFamily?.timeJumps
        .filter(timeJump => timeJump.id !== currentTimeJump?.id)
        .flatMap(timeJump => timeJump.childIds) || [])
    ]);
    childSelect.replaceChildren(new Option('— Noch keine bekannte Person —', ''));
    currentFamily?.persons
      .filter(person => !excludedIds.has(person.id))
      .forEach(person => childSelect.add(new Option(person.name, person.id)));
    suggestToYear();
  }

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
    currentFamily = family;
    currentTimeJump = null;
    childSelect.disabled = false;
    populatePartnerships(family, preferredPartnershipId);
    populateChildren();
    suggestFromYear();
    form.elements.namedItem('years').value = '';
    title.textContent = 'Zeitsprungknoten anlegen';
    submitButton.textContent = 'Zeitsprungknoten anlegen';
    deleteButton.hidden = true;
    addChildButton.hidden = true;
    if (!dialog.open) dialog.showModal();
  }

  function openEdit(family, timeJumpId) {
    const timeJump = family.timeJumps.find(item => item.id === timeJumpId);
    if (!timeJump) throw new Error('Der Zeitsprungknoten wurde nicht gefunden.');
    form.reset();
    currentFamily = family;
    currentTimeJump = timeJump;
    populatePartnerships(family, timeJump.parentPartnershipId);
    populateChildren();
    form.elements.namedItem('id').value = timeJump.id;
    form.elements.namedItem('fromYear').value = timeJump.fromYear;
    form.elements.namedItem('toYear').value = timeJump.toYear;
    form.elements.namedItem('years').value = String(timeJump.years || '');
    form.elements.namedItem('label').value = timeJump.label;
    form.elements.namedItem('notes').value = timeJump.notes;
    childSelect.value = timeJump.childIds[0] || '';
    childSelect.disabled = true;
    title.textContent = 'Zeitsprungknoten bearbeiten';
    submitButton.textContent = 'Zeitsprung speichern';
    deleteButton.hidden = false;
    addChildButton.hidden = false;
    if (!dialog.open) dialog.showModal();
  }

  function read() {
    const values = Object.fromEntries(new FormData(form).entries());
    const fromYear = String(values.fromYear || '').trim();
    const toYear = String(values.toYear || '').trim();
    const calculatedYears = /^\d{1,4}$/.test(fromYear) && /^\d{1,4}$/.test(toYear)
      ? Math.max(0, Number(toYear) - Number(fromYear))
      : 0;
    return {
      id: String(values.id || ''),
      parentPartnershipId: values.parentPartnershipId,
      childIds: currentTimeJump
        ? [...currentTimeJump.childIds]
        : values.childId ? [values.childId] : [],
      years: Number(values.years || calculatedYears),
      fromYear,
      toYear,
      label: String(values.label || '').trim(),
      notes: String(values.notes || '').trim()
    };
  }

  partnershipSelect.addEventListener('change', () => {
    populateChildren();
    suggestFromYear();
  });
  childSelect.addEventListener('change', suggestToYear);
  return Object.freeze({
    dialog,
    form,
    openCreate,
    openEdit,
    close: () => {
      if (dialog.open) dialog.close();
    },
    read,
    getCurrentId: () => currentTimeJump?.id || ''
  });
}
