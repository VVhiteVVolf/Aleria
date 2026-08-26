import { FAMILY_ROLES } from '../config/family-colors.js';
import { DEFAULT_PERSON_LINEAGE_ROLE, PERSON_LINEAGE_ROLES } from '../config/person-lineage.js';
import { normalizeEditedPersonLifeState } from '../domain/person-life-state.js';

function setField(form, name, value) {
  const field = form.elements.namedItem(name);
  if (field) field.value = value ?? '';
}

export function createPersonDialog(documentRef = document) {
  const dialog = documentRef.getElementById('person-dialog');
  const form = documentRef.getElementById('person-form');
  const title = documentRef.getElementById('person-dialog-title');
  const roleSelect = documentRef.getElementById('person-family-role');
  const lineageRoleSelect = documentRef.getElementById('person-lineage-role');
  const houseSelect = documentRef.getElementById('person-house');
  const statusSelect = form.elements.namedItem('status');
  const deathInput = form.elements.namedItem('death');

  roleSelect.replaceChildren(...Object.values(FAMILY_ROLES).map(role => new Option(role.label, role.id)));
  lineageRoleSelect.replaceChildren(...Object.values(PERSON_LINEAGE_ROLES)
    .map(role => new Option(role.label, role.id)));

  function populateHouses(houses, selectedId = '') {
    houseSelect.replaceChildren(new Option('— Kein Haus —', ''));
    houses.forEach(house => houseSelect.add(new Option(house.name, house.id)));
    houseSelect.value = selectedId;
  }

  function openCreate(family) {
    form.reset();
    title.textContent = 'Person anlegen';
    setField(form, 'id', '');
    setField(form, 'sex', 'unknown');
    setField(form, 'status', 'alive');
    setField(form, 'familyRole', 'core');
    setField(form, 'lineageRole', DEFAULT_PERSON_LINEAGE_ROLE);
    populateHouses(family.houses);
    dialog.showModal();
    form.elements.namedItem('name')?.focus();
  }

  function openEdit(person, family) {
    title.textContent = 'Person bearbeiten';
    populateHouses(family.houses, person.houseId);
    ['id', 'name', 'title', 'sex', 'status', 'birth', 'death', 'portrait', 'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole', 'notes']
      .forEach(name => setField(form, name, person[name]));
    if (String(deathInput.value || '').trim()) statusSelect.value = 'dead';
    dialog.showModal();
    form.elements.namedItem('name')?.focus();
  }

  function close() {
    dialog.close();
  }

  function read() {
    const values = Object.fromEntries(new FormData(form).entries());
    const life = normalizeEditedPersonLifeState(values);
    return {
      id: values.id,
      name: String(values.name || '').trim(),
      title: String(values.title || '').trim(),
      sex: values.sex,
      status: life.status,
      birth: String(values.birth || '').trim(),
      death: life.death,
      portrait: String(values.portrait || '').trim(),
      portraitPlaceholder: values.portraitPlaceholder,
      houseId: values.houseId,
      familyRole: values.familyRole,
      lineageRole: values.lineageRole,
      notes: String(values.notes || '').trim()
    };
  }

  statusSelect.addEventListener('change', () => {
    if (statusSelect.value === 'dead') {
      if (!String(deathInput.value || '').trim()) deathInput.value = '????';
      return;
    }
    deathInput.value = '';
  });
  deathInput.addEventListener('input', () => {
    if (String(deathInput.value || '').trim()) statusSelect.value = 'dead';
  });

  return Object.freeze({ dialog, form, openCreate, openEdit, close, read });
}
