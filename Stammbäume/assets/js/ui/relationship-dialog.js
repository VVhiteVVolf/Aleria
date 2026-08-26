import { resolveParentageSelection } from '../modules/relationships/relationship-form-policy.js';

function replacePersonOptions(select, people, emptyLabel = '') {
  select.replaceChildren();
  if (emptyLabel) select.add(new Option(emptyLabel, ''));
  people.forEach(person => select.add(new Option(`${person.name}${person.title ? ` · ${person.title}` : ''}`, person.id)));
}

export function createRelationshipDialog(documentRef = document) {
  const dialog = documentRef.getElementById('relationship-dialog');
  const form = documentRef.getElementById('relationship-form');
  const personSelect = documentRef.getElementById('relationship-person');
  const secondParentSelect = documentRef.getElementById('relationship-second-parent');
  const recordTypeSelect = form.elements.namedItem('recordType');

  function syncFields() {
    const activeType = recordTypeSelect.value;
    dialog.querySelectorAll('[data-relationship-fields]').forEach(container => {
      container.hidden = container.dataset.relationshipFields !== activeType;
      container.querySelectorAll('select,input,textarea').forEach(field => {
        field.disabled = container.hidden;
      });
    });
    syncSecondParentOptions();
  }

  function syncSecondParentOptions() {
    if (recordTypeSelect.value !== 'parentage') return;
    const referencePersonId = form.elements.namedItem('referencePersonId').value;
    const otherPersonId = personSelect.value;
    const direction = form.elements.namedItem('parentageDirection').value;
    if (!referencePersonId || !otherPersonId || !direction) return;
    const selection = resolveParentageSelection({ referencePersonId, otherPersonId, direction });
    const unavailableIds = new Set(selection.unavailableSecondParentIds);
    [...secondParentSelect.options].forEach(option => {
      option.disabled = Boolean(option.value) && unavailableIds.has(option.value);
    });
    if (unavailableIds.has(secondParentSelect.value)) secondParentSelect.value = '';
  }

  function open(referencePersonId, family) {
    form.reset();
    form.elements.namedItem('referencePersonId').value = referencePersonId;
    const otherPeople = family.persons.filter(person => person.id !== referencePersonId);
    replacePersonOptions(personSelect, otherPeople);
    replacePersonOptions(secondParentSelect, otherPeople, '— Kein weiteres Elternteil —');
    recordTypeSelect.value = 'partnership';
    syncFields();
    dialog.showModal();
  }

  function close() {
    dialog.close();
  }

  function read() {
    return Object.fromEntries(new FormData(form).entries());
  }

  recordTypeSelect.addEventListener('change', syncFields);
  personSelect.addEventListener('change', syncSecondParentOptions);
  form.elements.namedItem('parentageDirection').addEventListener('change', syncSecondParentOptions);
  return Object.freeze({ dialog, form, open, close, read, syncFields });
}
