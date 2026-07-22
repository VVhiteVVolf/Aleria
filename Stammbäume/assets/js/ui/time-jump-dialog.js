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
  const personSelect = form.elements.namedItem('parentPersonId');
  const childSelect = form.elements.namedItem('childId');
  const fromYearInput = form.elements.namedItem('fromYear');
  const toYearInput = form.elements.namedItem('toYear');
  const title = documentRef.getElementById('time-jump-dialog-title');
  const submitButton = documentRef.getElementById('time-jump-dialog-submit');
  const deleteButton = documentRef.getElementById('time-jump-dialog-delete');
  let currentFamily = null;
  let currentTimeJump = null;

  function personIndex() {
    return new Map((currentFamily?.persons || []).map(person => [person.id, person]));
  }

  function suggestFromYear() {
    const partnership = currentFamily?.partnerships.find(item => item.id === partnershipSelect.value);
    const anchorPersonIds = partnership?.participantIds || (personSelect.value ? [personSelect.value] : []);
    fromYearInput.value = latestKnownPersonYear(anchorPersonIds, personIndex());
  }

  function suggestToYear() {
    toYearInput.value = earliestKnownBirthYear(childSelect.value ? [childSelect.value] : [], personIndex());
  }

  function populateChildren() {
    const partnership = currentFamily?.partnerships.find(item => item.id === partnershipSelect.value);
    const excludedIds = new Set([
      ...(partnership?.participantIds || []),
      ...(partnership ? [] : personSelect.value ? [personSelect.value] : []),
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
    partnershipSelect.replaceChildren(new Option('— Nur die ausgewählte Person —', ''));
    family.partnerships.forEach(partnership => {
      partnershipSelect.add(new Option(partnershipLabel(partnership, personById), partnership.id));
    });
    if (preferredPartnershipId && family.partnerships.some(item => item.id === preferredPartnershipId)) {
      partnershipSelect.value = preferredPartnershipId;
    }
  }

  function populatePeople(family, preferredPersonId = '') {
    personSelect.replaceChildren(new Option('— Person wählen —', ''));
    family.persons.forEach(person => personSelect.add(new Option(person.name, person.id)));
    if (preferredPersonId && family.persons.some(person => person.id === preferredPersonId)) {
      personSelect.value = preferredPersonId;
    }
  }

  function openCreate(family, preferredPartnershipId = '', preferredPersonId = '') {
    form.reset();
    currentFamily = family;
    currentTimeJump = null;
    childSelect.disabled = false;
    populatePeople(family, preferredPersonId);
    populatePartnerships(family, preferredPartnershipId);
    populateChildren();
    suggestFromYear();
    form.elements.namedItem('years').value = '';
    title.textContent = 'Zeitsprungknoten anlegen';
    submitButton.textContent = 'Zeitsprungknoten anlegen';
    deleteButton.hidden = true;
    if (!dialog.open) dialog.showModal();
  }

  function openEdit(family, timeJumpId) {
    const timeJump = family.timeJumps.find(item => item.id === timeJumpId);
    if (!timeJump) throw new Error('Der Zeitsprungknoten wurde nicht gefunden.');
    form.reset();
    currentFamily = family;
    currentTimeJump = timeJump;
    const partnership = family.partnerships.find(item => item.id === timeJump.parentPartnershipId);
    populatePeople(family, timeJump.parentPersonId || partnership?.participantIds[0] || '');
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
      parentPartnershipId: String(values.parentPartnershipId || ''),
      parentPersonId: values.parentPartnershipId ? '' : String(values.parentPersonId || ''),
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
    const partnership = currentFamily?.partnerships.find(item => item.id === partnershipSelect.value);
    if (partnership && !partnership.participantIds.includes(personSelect.value)) {
      personSelect.value = partnership.participantIds[0] || '';
    }
    populateChildren();
    suggestFromYear();
  });
  personSelect.addEventListener('change', () => {
    const partnership = currentFamily?.partnerships.find(item => item.id === partnershipSelect.value);
    if (partnership && !partnership.participantIds.includes(personSelect.value)) partnershipSelect.value = '';
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
