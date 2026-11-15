import { HOF_STAFF, HOF_HOUSING, HOF_FAMILY_WORK } from './hof-residents.mjs';
import { LAND_FAMILIEN_ROSTER } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/landfamilien-roster.mjs';
import { TIRFELYN_FAMILY } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/tirfelyn-family.js';

const household = LAND_FAMILIEN_ROSTER.families.find(family => family.slug === 'tirfelyn');
export const HOF_FAMILY_RESIDENTS = household.persons.filter(person => person.status === 'alive').map(person => ({
  ...person, actorId: TIRFELYN_FAMILY.persons.find(member => member.id === person.id)?.worldPersonId,
  work: HOF_FAMILY_WORK.find(assignment => assignment.personId === person.id)?.work || person.role,
  residenceId: 'bauernherrenhaus'
}));
export const HOF_RESIDENTS = [...HOF_FAMILY_RESIDENTS, ...HOF_STAFF.map(person => ({ ...person, actorId: person.id, work: person.role }))];

export function hofResidentsAt(poi) {
  if (poi.residenceId === 'bauernherrenhaus') return HOF_FAMILY_RESIDENTS;
  const home = HOF_HOUSING.find(house => house.id === poi.residenceId);
  const keys = Array.isArray(home?.residents) ? home.residents : poi.responsibleIds;
  return keys.map(key => HOF_RESIDENTS.find(person => person.id === key || person.key === key)).filter(Boolean);
}
