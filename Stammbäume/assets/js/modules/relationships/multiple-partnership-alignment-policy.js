const CENTER_BETWEEN_SPOUSES_EXTENSION = 'chartCenterBetweenSpousePersonIds';
const AUTO_CENTER_EXTENSION = 'chartAutomaticCenterBetweenSpouses';
const PARTNER_OVER_CHILDREN_EXTENSION = 'chartAlignPartnerOverChildrenPersonId';
const AUTO_PARTNER_EXTENSION = 'chartAutomaticPartnerOverChildren';
const INACTIVE_STATUSES = new Set(['divorced', 'ended']);

function eligiblePartnership(partnership) {
  return ['marriage', 'union'].includes(partnership.type)
    && !INACTIVE_STATUSES.has(partnership.status || 'active');
}

export function refreshMultiplePartnershipAlignment(family) {
  family.persons.forEach(person => {
    if (person.extensions?.[AUTO_CENTER_EXTENSION] !== true) return;
    const extensions = { ...(person.extensions || {}) };
    delete extensions[CENTER_BETWEEN_SPOUSES_EXTENSION];
    delete extensions[AUTO_CENTER_EXTENSION];
    person.extensions = extensions;
  });
  family.partnerships.forEach(partnership => {
    if (partnership.extensions?.[AUTO_PARTNER_EXTENSION] !== true) return;
    const extensions = { ...(partnership.extensions || {}) };
    delete extensions[PARTNER_OVER_CHILDREN_EXTENSION];
    delete extensions[AUTO_PARTNER_EXTENSION];
    partnership.extensions = extensions;
  });

  const partnershipsByPerson = new Map();
  family.partnerships.filter(eligiblePartnership).forEach(partnership => {
    partnership.participantIds.forEach(personId => {
      const entries = partnershipsByPerson.get(personId) || [];
      entries.push(partnership);
      partnershipsByPerson.set(personId, entries);
    });
  });

  const usedPartnershipIds = new Set();
  [...partnershipsByPerson.entries()]
    .filter(([, partnerships]) => partnerships.length >= 2)
    .sort((first, second) => second[1].length - first[1].length)
    .forEach(([centeredPersonId, partnerships]) => {
      const centeredPerson = family.persons.find(person => person.id === centeredPersonId);
      if (!centeredPerson) return;
      const spousePersonIds = [...new Set(partnerships
        .flatMap(partnership => partnership.participantIds)
        .filter(personId => personId !== centeredPersonId))];
      if (spousePersonIds.length < 2) return;

      const personExtensions = { ...(centeredPerson.extensions || {}) };
      if (!personExtensions[CENTER_BETWEEN_SPOUSES_EXTENSION]) {
        personExtensions[CENTER_BETWEEN_SPOUSES_EXTENSION] = spousePersonIds;
        personExtensions[AUTO_CENTER_EXTENSION] = true;
        centeredPerson.extensions = personExtensions;
      }

      partnerships.forEach(partnership => {
        if (usedPartnershipIds.has(partnership.id)) return;
        const hasChildren = family.parentages.some(parentage => parentage.partnershipId === partnership.id);
        if (!hasChildren) return;
        const partnerPersonId = partnership.participantIds.find(personId => personId !== centeredPersonId);
        const extensions = { ...(partnership.extensions || {}) };
        if (!extensions[PARTNER_OVER_CHILDREN_EXTENSION]) {
          extensions[PARTNER_OVER_CHILDREN_EXTENSION] = partnerPersonId;
          extensions[AUTO_PARTNER_EXTENSION] = true;
          partnership.extensions = extensions;
          usedPartnershipIds.add(partnership.id);
        }
      });
    });
  return family;
}
