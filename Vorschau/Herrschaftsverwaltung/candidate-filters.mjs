import { normalizePersonName } from '../../js/world-identity/person-identity.js';

export const RELATIONSHIPS = {
  single: 'Ledig laut Akte', married: 'Verheiratet', engaged: 'Verlobt',
  widowed: 'Verwitwet', divorced: 'Geschieden', unknown: 'Familienstand offen',
};
export const SEXES = { female: 'Frau', male: 'Mann', unknown: 'Geschlecht offen' };
export const AFFILIATIONS = {
  house: 'Eigenes Haus', knight: 'Ritterhaus', service: 'Direkter Dienst',
  family: 'Aus Familienakte', free: 'Freier Bürgerpool', tree: 'Aus Stammbaum ergänzt',
};
export const MIN_ADULT_AGE = 18;

export function filterCandidates(candidates, filters) {
  const terms = normalizePersonName(filters.query).split(' ').filter(Boolean);
  const { sex, relationship, kind, availability, hideMinors, minAge, maxAge } = filters;
  return candidates.filter(person => {
    const assigned = person.appointments.length > 0;
    if ((sex && person.sex !== sex) || (relationship && person.relationship !== relationship)
      || (kind && person.kind !== kind) || (availability === 'unassigned' && assigned)
      || (availability === 'assigned' && !assigned)) return false;
    if (hideMinors && person.age !== null && person.age < MIN_ADULT_AGE) return false;
    if (minAge !== null && (person.age === null || person.age < minAge)) return false;
    if (maxAge !== null && (person.age === null || person.age > maxAge)) return false;
    const titles = person.appointments.map(post => post.title);
    const searchable = normalizePersonName([person.name, person.alias, person.family, person.detail, ...titles].filter(Boolean).join(' '));
    return terms.every(term => searchable.includes(term));
  });
}
