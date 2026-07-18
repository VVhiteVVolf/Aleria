// Helfer für „Beziehung modifizieren“: Personen aus anderen Registerakten
// in den aktuellen Stammbaum übernehmen und Aktionen vorbereiten.

function houseSurname(houseName) {
  return String(houseName || '').replace(/^haus\s+/i, '').trim();
}

// Fremde Personen tragen im Zielbaum den vollen Namen samt Hausnamen
// (Konvention: „Godwyn Cludwyr“ im Rhyddid-Baum).
export function buildImportedPersonName(sourcePerson, sourceHouse) {
  const name = String(sourcePerson.name || '').trim();
  const surname = houseSurname(sourceHouse?.name);
  if (!surname || !name) return name;
  if (name.toLocaleLowerCase('de').includes(surname.toLocaleLowerCase('de'))) return name;
  return `${name} ${surname}`;
}

// Findet eine bereits vorhandene Fassung derselben Weltperson im Zielbaum.
export function findExistingImport(family, sourcePerson) {
  return family.persons.find(person => (
    person.id === sourcePerson.id
    || (sourcePerson.worldPersonId && person.worldPersonId === sourcePerson.worldPersonId)
  )) || null;
}

export function buildImportedPersonValues(sourceFamily, sourcePerson, options = {}) {
  const sourceHouse = sourceFamily.houses.find(house => house.id === sourcePerson.houseId) || null;
  const usedIds = new Set(sourceFamily === options.targetFamily ? [] : (options.targetFamily?.persons || []).map(person => person.id));
  let id = sourcePerson.id;
  if (usedIds.has(id)) id = `${id}-${sourcePerson.birth || 'import'}`.replace(/[^a-z0-9-]/gi, '-');
  return {
    id,
    worldPersonId: sourcePerson.worldPersonId || '',
    name: buildImportedPersonName(sourcePerson, sourceHouse),
    title: '',
    sex: sourcePerson.sex,
    status: sourcePerson.status,
    birth: sourcePerson.birth,
    death: sourcePerson.death,
    portrait: sourcePerson.portrait || '',
    portraitPlaceholder: sourcePerson.portraitPlaceholder || 'auto',
    houseId: sourceHouse ? sourcePerson.houseId : '',
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch',
    notes: '',
    house: sourceHouse
      ? { id: sourceHouse.id, name: sourceHouse.name, emblem: sourceHouse.emblem || '' }
      : null
  };
}

// Beschreibt die zur Aktion passende Verbindung für addRelatedPerson/addPartnership.
export function relationForAction(action, secondParentId = '') {
  if (action === 'marry') {
    return { relationKind: 'partnership', partnershipType: 'marriage', partnershipStatus: 'active', certainty: 'confirmed', visibility: 'public' };
  }
  if (action === 'betroth') {
    return { relationKind: 'partnership', partnershipType: 'engagement', partnershipStatus: 'active', certainty: 'confirmed', visibility: 'public' };
  }
  if (action === 'import-ward') {
    return {
      relationKind: 'child',
      parentageType: 'foster',
      legitimacy: 'unknown',
      secondParentId,
      certainty: 'confirmed',
      visibility: 'public'
    };
  }
  throw new Error('Für diese Aktion ist keine Verbindungsart hinterlegt.');
}
