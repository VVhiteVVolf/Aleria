import { fillCrestFrameSelect } from './crest-frame-options.js';

function personLabel(person, houseById) {
  const houseName = houseById.get(person.houseId)?.name;
  return houseName ? `${person.name} · ${houseName}` : person.name;
}

export function createLineageOriginDialog(documentRef = document) {
  const dialog = documentRef.getElementById('lineage-origin-dialog');
  const form = documentRef.getElementById('lineage-origin-form');
  const houseSelect = form.elements.namedItem('houseId');
  const childSelect = form.elements.namedItem('childIds');

  function open(family) {
    const origin = family.lineage.originHouse;
    const selectedChildIds = new Set(origin.childIds);
    const parentedPersonIds = new Set(family.parentages.map(parentage => parentage.childId));
    const houseById = new Map(family.houses.map(house => [house.id, house]));

    form.reset();
    houseSelect.replaceChildren(new Option('— Kein Hausdatensatz —', ''));
    family.houses.forEach(house => houseSelect.add(new Option(house.name, house.id)));
    childSelect.replaceChildren();
    family.persons
      .filter(person => selectedChildIds.has(person.id) || !parentedPersonIds.has(person.id))
      .forEach(person => {
        const option = new Option(personLabel(person, houseById), person.id);
        option.selected = selectedChildIds.has(person.id);
        childSelect.add(option);
      });

    ['id', 'houseId', 'name', 'subtitle', 'emblem', 'targetFamilyId', 'notes'].forEach(fieldName => {
      form.elements.namedItem(fieldName).value = origin[fieldName] || '';
    });
    fillCrestFrameSelect(form.elements.namedItem('crestFrame'), origin.crestFrame);
    form.elements.namedItem('emblemScale').value = String(Math.round(origin.emblemScale * 100));
    form.elements.namedItem('frameScale').value = String(Math.round(origin.frameScale * 100));
    if (!dialog.open) dialog.showModal();
  }

  function read() {
    const values = Object.fromEntries(new FormData(form).entries());
    return {
      ...values,
      enabled: true,
      childIds: [...childSelect.selectedOptions].map(option => option.value),
      emblemScale: Number(values.emblemScale || 86) / 100,
      frameScale: Number(values.frameScale || 100) / 100
    };
  }

  return Object.freeze({
    dialog,
    form,
    open,
    read,
    close() {
      if (dialog.open) dialog.close();
    }
  });
}
