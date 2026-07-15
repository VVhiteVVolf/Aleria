import { fillCrestFrameSelect } from './crest-frame-options.js';
import { earliestKnownBirthYear, latestKnownPersonYear } from '../domain/time-boundaries.js';

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
    const founderPartnership = family.partnerships.find(item => item.id === family.lineage.founderPartnershipId);
    const descendantIds = family.parentages
      .filter(parentage => parentage.partnershipId === family.lineage.founderPartnershipId)
      .map(parentage => parentage.childId);
    partnershipSelect.replaceChildren(new Option('— Kein Gründerpaar —', ''));
    family.partnerships.forEach(partnership => {
      partnershipSelect.add(new Option(partnershipLabel(partnership, personById), partnership.id));
    });
    houseSelect.replaceChildren(new Option('— Dokumentwappen verwenden —', ''));
    family.houses.forEach(house => houseSelect.add(new Option(house.name, house.id)));
    partnershipSelect.value = family.lineage.founderPartnershipId;
    houseSelect.value = family.lineage.houseId;
    fillCrestFrameSelect(form.elements.namedItem('crestFrame'), family.lineage.crestFrame);
    form.elements.namedItem('crestSubtitle').value = family.lineage.crestSubtitle;
    emblemInput.value = selectedEmblem();
    form.elements.namedItem('timeGapEnabled').checked = family.lineage.timeGap.enabled;
    form.elements.namedItem('timeGapFromYear').value = family.lineage.timeGap.fromYear
      || latestKnownPersonYear(founderPartnership?.participantIds || [], personById);
    form.elements.namedItem('timeGapToYear').value = family.lineage.timeGap.toYear
      || earliestKnownBirthYear(descendantIds, personById);
    form.elements.namedItem('timeGapYears').value = String(family.lineage.timeGap.years || '');
    form.elements.namedItem('timeGapLabel').value = family.lineage.timeGap.label;
    dialog.showModal();
  }

  function read() {
    return {
      founderPartnershipId: form.elements.namedItem('founderPartnershipId').value,
      houseId: form.elements.namedItem('houseId').value,
      crestSubtitle: form.elements.namedItem('crestSubtitle').value.trim(),
      crestFrame: form.elements.namedItem('crestFrame').value,
      emblem: emblemInput.value.trim(),
      timeGap: {
        enabled: form.elements.namedItem('timeGapEnabled').checked,
        years: Number(form.elements.namedItem('timeGapYears').value || 0),
        fromYear: form.elements.namedItem('timeGapFromYear').value.trim(),
        toYear: form.elements.namedItem('timeGapToYear').value.trim(),
        label: form.elements.namedItem('timeGapLabel').value.trim()
      }
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
