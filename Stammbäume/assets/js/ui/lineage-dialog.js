import { fillCrestFrameSelect } from './crest-frame-options.js';

function partnershipLabel(partnership, personById) {
  return partnership.participantIds
    .map(personId => personById.get(personId)?.name || personId)
    .join(' & ');
}

export function createLineageDialog(documentRef = document) {
  const dialog = documentRef.getElementById('lineage-dialog');
  const form = documentRef.getElementById('lineage-form');
  const partnershipSelect = documentRef.getElementById('lineage-founder-partnership');
  const houseSelect = documentRef.getElementById('lineage-house');
  const emblemInput = form.elements.namedItem('emblem');
  let currentFamily = null;

  function selectedEmblem() {
    const house = currentFamily?.houses.find(item => item.id === houseSelect.value);
    return house?.emblem || currentFamily?.document.emblem || '';
  }

  function open(family) {
    currentFamily = family;
    const personById = new Map(family.persons.map(person => [person.id, person]));
    partnershipSelect.replaceChildren(new Option('— Kein Gründerpaar —', ''));
    family.partnerships.forEach(partnership => {
      partnershipSelect.add(new Option(partnershipLabel(partnership, personById), partnership.id));
    });
    houseSelect.replaceChildren(new Option('— Dokumentwappen verwenden —', ''));
    family.houses.forEach(house => houseSelect.add(new Option(house.name, house.id)));
    partnershipSelect.value = family.lineage.founderPartnershipId;
    houseSelect.value = family.lineage.houseId;
    fillCrestFrameSelect(form.elements.namedItem('crestFrame'), family.lineage.crestFrame);
    form.elements.namedItem('crestEmblemScale').value = String(Math.round(family.lineage.crestEmblemScale * 100));
    form.elements.namedItem('crestFrameScale').value = String(Math.round(family.lineage.crestFrameScale * 100));
    form.elements.namedItem('crestSubtitle').value = family.lineage.crestSubtitle;
    emblemInput.value = selectedEmblem();
    dialog.showModal();
  }

  function read() {
    return {
      founderPartnershipId: form.elements.namedItem('founderPartnershipId').value,
      houseId: form.elements.namedItem('houseId').value,
      crestSubtitle: form.elements.namedItem('crestSubtitle').value.trim(),
      crestFrame: form.elements.namedItem('crestFrame').value,
      crestEmblemScale: Number(form.elements.namedItem('crestEmblemScale').value || 86) / 100,
      crestFrameScale: Number(form.elements.namedItem('crestFrameScale').value || 100) / 100,
      emblem: emblemInput.value.trim()
    };
  }

  houseSelect.addEventListener('change', () => {
    emblemInput.value = selectedEmblem();
  });

  return Object.freeze({
    dialog,
    form,
    open,
    close: () => {
      if (dialog.open) dialog.close();
    },
    read
  });
}
