import { FAMILY_ROLES } from '../config/family-colors.js';
import { DEFAULT_PERSON_LINEAGE_ROLE, PERSON_LINEAGE_ROLES } from '../config/person-lineage.js';

function addPeople(select, people, emptyLabel) {
  select.replaceChildren(new Option(emptyLabel, ''));
  people.forEach(person => select.add(new Option(
    `${person.name}${person.title ? ` · ${person.title}` : ''}`,
    person.id
  )));
}

export function createRelatedPersonDialog(documentRef = document) {
  const dialog = documentRef.getElementById('related-person-dialog');
  const form = documentRef.getElementById('related-person-form');
  const heading = documentRef.getElementById('related-person-heading');
  const relationSelect = form.elements.namedItem('relationKind');
  const partnershipType = form.elements.namedItem('partnershipType');
  const parentageType = form.elements.namedItem('parentageType');
  const legitimacy = form.elements.namedItem('legitimacy');
  const roleSelect = form.elements.namedItem('familyRole');
  const lineageRoleSelect = form.elements.namedItem('lineageRole');
  const houseSelect = form.elements.namedItem('houseId');
  const secondParentSelect = form.elements.namedItem('secondParentId');

  roleSelect.replaceChildren(...Object.values(FAMILY_ROLES).map(role => new Option(role.label, role.id)));
  lineageRoleSelect.replaceChildren(...Object.values(PERSON_LINEAGE_ROLES)
    .map(role => new Option(role.label, role.id)));

  function inferRole() {
    if (relationSelect.value === 'partnership') {
      roleSelect.value = partnershipType.value === 'affair'
        ? 'affair'
        : partnershipType.value === 'forced' ? 'forced' : 'married';
      return;
    }
    if (relationSelect.value === 'child' || relationSelect.value === 'time-jump-child') {
      if (parentageType.value === 'adoptive') roleSelect.value = 'adopted';
      else if (parentageType.value === 'foster') roleSelect.value = 'ward';
      else if (['illegitimate', 'legitimized'].includes(legitimacy.value)) roleSelect.value = 'bastard';
      else roleSelect.value = 'core';
      return;
    }
    roleSelect.value = 'core';
  }

  function syncFields() {
    const relationKind = relationSelect.value;
    dialog.querySelectorAll('[data-related-fields]').forEach(container => {
      const types = container.dataset.relatedFields.split(' ');
      container.hidden = !types.includes(relationKind);
      container.querySelectorAll('select,input,textarea').forEach(field => {
        field.disabled = container.hidden;
      });
    });
    if (relationKind === 'time-jump-child') {
      parentageType.value = 'claimed';
      parentageType.disabled = true;
    }
    inferRole();
  }

  function open(referencePersonId, family, options = {}) {
    form.reset();
    const reference = family.persons.find(person => person.id === referencePersonId);
    if (!reference) throw new Error('Die ausgewählte Person wurde nicht gefunden.');
    heading.textContent = options.heading || `Neue Person bei ${reference.name}`;
    form.elements.namedItem('referencePersonId').value = referencePersonId;
    form.elements.namedItem('timeJumpId').value = options.timeJumpId || '';
    relationSelect.value = options.timeJumpId ? 'time-jump-child' : (options.relationKind || 'partnership');
    relationSelect.querySelector('[value="time-jump-child"]').disabled = !options.timeJumpId;
    houseSelect.replaceChildren(new Option('— Kein Haus —', ''));
    family.houses.forEach(house => houseSelect.add(new Option(house.name, house.id)));
    addPeople(
      secondParentSelect,
      family.persons.filter(person => person.id !== referencePersonId),
      '— Kein weiteres Elternteil —'
    );
    if (options.secondParentId && family.persons.some(person => person.id === options.secondParentId)) {
      secondParentSelect.value = options.secondParentId;
    }
    if (options.houseId && family.houses.some(house => house.id === options.houseId)) {
      houseSelect.value = options.houseId;
    }
    form.elements.namedItem('sex').value = 'unknown';
    form.elements.namedItem('status').value = 'alive';
    form.elements.namedItem('portraitPlaceholder').value = 'auto';
    lineageRoleSelect.value = DEFAULT_PERSON_LINEAGE_ROLE;
    form.elements.namedItem('certainty').value = 'confirmed';
    form.elements.namedItem('visibility').value = 'public';
    syncFields();
    dialog.showModal();
    form.elements.namedItem('name').focus();
  }

  function read() {
    const values = Object.fromEntries(new FormData(form).entries());
    return {
      referencePersonId: values.referencePersonId,
      person: {
        name: String(values.name || '').trim(),
        title: String(values.title || '').trim(),
        sex: values.sex,
        status: values.status,
        birth: String(values.birth || '').trim(),
        death: String(values.death || '').trim(),
        portrait: String(values.portrait || '').trim(),
        portraitPlaceholder: values.portraitPlaceholder,
        houseId: values.houseId,
        familyRole: values.familyRole,
        lineageRole: values.lineageRole,
        notes: String(values.notes || '').trim()
      },
      relation: {
        relationKind: values.relationKind,
        timeJumpId: values.timeJumpId || '',
        partnershipType: values.partnershipType || 'union',
        partnershipStatus: values.partnershipStatus || 'active',
        secondParentId: values.secondParentId || '',
        parentageType: values.parentageType || 'biological',
        legitimacy: values.legitimacy || 'unknown',
        certainty: values.certainty || 'confirmed',
        visibility: values.visibility || 'public'
      }
    };
  }

  relationSelect.addEventListener('change', syncFields);
  partnershipType.addEventListener('change', inferRole);
  parentageType.addEventListener('change', inferRole);
  legitimacy.addEventListener('change', inferRole);

  return Object.freeze({
    dialog,
    form,
    open,
    close: () => dialog.close(),
    read,
    syncFields
  });
}
