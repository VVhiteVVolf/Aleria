// Visual evidence only: the supplied portraits establish these four animals,
// but provide no personal names, training, health, attributes or combat rules.
export const PERLLAN_PICTURED_COMPANIONS = Object.freeze([
  Object.freeze({ personId: 'person-b758cea4', slug: 'eichhoernchen', name: 'Unbenanntes Eichhörnchen', species: 'Eichhörnchen',
    detail: 'Ein rötliches Eichhörnchen sitzt auf Onns Schulter.' }),
  Object.freeze({ personId: 'person-b758cea4', slug: 'rotkehlchen', name: 'Unbenanntes Rotkehlchen', species: 'Rotkehlchen',
    detail: 'Ein Rotkehlchen sitzt auf Onns Hand.' }),
  Object.freeze({ personId: 'person-f3cccc1a', slug: 'kaninchen', name: 'Unbenanntes Kaninchen', species: 'Kaninchen',
    detail: 'Ein braun-weißes Kaninchen ist neben Lili abgebildet.' }),
  Object.freeze({ personId: 'person-f3cccc1a', slug: 'blaumeise', name: 'Unbenannte Blaumeise', species: 'Blaumeise',
    detail: 'Eine blau-gelbe Meise ist links neben Lili abgebildet.' })
]);

export function getPerllanPicturedCompanions(personId) {
  return PERLLAN_PICTURED_COMPANIONS.filter(spec => spec.personId === personId);
}

export function buildPerllanCompanionInventory(character, candidate, authoredAt) {
  const specs = getPerllanPicturedCompanions(candidate.personId);
  if (!specs.length) return null;
  if (character.id !== candidate.worldPersonId) throw Error('Die Porträtzuordnung gehört zu einer anderen Person.');
  const items = [], companions = [];
  for (const spec of specs) {
    const id = `perllan-${candidate.personId}-${spec.slug}`;
    const description = `${spec.detail} Name, Alter, Geschlecht und Ausbildung sind nicht überliefert.`;
    const infoRows = [
      { label: 'Bezugsperson', value: character.name },
      { label: 'Beleg', value: 'Geliefertes Personenporträt' },
      { label: 'Name', value: 'Nicht überliefert' },
      { label: 'Ausbildung', value: 'Nicht überliefert' }
    ];
    items.push({
      id, instanceId: id, name: spec.name, type: spec.species,
      category: 'companion', registerCategory: 'vieh', quantity: '1',
      itemStorageMode: 'character', image: candidate.portrait,
      imageFormat: 'portrait', imageFit: 'contain', imagePosition: 'center',
      description, ownerCharacterId: character.id, ownerCharacterName: character.name,
      individualizedAt: authoredAt, attributes: [], infoRows,
      sourceEvidence: { kind: 'supplied-portrait', familyId: candidate.familyId,
        personId: candidate.personId, worldPersonId: candidate.worldPersonId,
        image: candidate.portrait, observation: spec.detail }
    });
    companions.push({
      id: `card-${id}`, inventoryItemId: id, name: spec.name, species: spec.species,
      image: candidate.portrait, imageFormat: 'portrait', imageFit: 'contain', imagePosition: 'center',
      role: 'Abgebildeter Tierbegleiter', status: 'Nicht festgelegt',
      summary: spec.detail, description, attributes: [], infoRows
    });
  }
  return { items, companions, attributes: [], infoRows: [], showInfoTable: false,
    status: 'Nicht festgelegt', hitpoints: 'Nicht festgelegt', carryValue: 'Nicht festgelegt',
    moneyNotice: 'Ein Geldbestand ist in der gelieferten Familienakte nicht überliefert.' };
}
