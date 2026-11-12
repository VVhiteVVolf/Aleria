import { AURDDEN_FAMILY_PEOPLE, AURDDEN_GUARDS } from '../../../Stammbäume/assets/js/data/aurdden-people.js';

export const AURDDEN_ART = './assets/loer-hofjuwelier';
export const AURDDEN_EMBLEM = '../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Aurdden/aurdden-emblem.png';
const projectPerson = person => Object.freeze({ ...person, characterId: person.worldPersonId,
  portrait: person.portrait ? `../Stammbäume/${person.portrait}` : '' });
export const AURDDEN_PEOPLE = Object.freeze(AURDDEN_FAMILY_PEOPLE.map(projectPerson));
export const AURDDEN_WATCH = Object.freeze(AURDDEN_GUARDS.map(projectPerson));
export const AURDDEN_STAFF = Object.freeze([...AURDDEN_PEOPLE, ...AURDDEN_WATCH].filter(person => person.shopEmployee && !person.death));
export const AURDDEN_BROTHERS = Object.freeze(AURDDEN_PEOPLE.filter(person => person.lineageRole === 'head'));
export function aurddenPerson(id) {
  const person = [...AURDDEN_PEOPLE, ...AURDDEN_WATCH].find(candidate => candidate.id === id);
  if (!person) throw Error(`Unbekannte Aurdden-Figur: ${id}`);
  return person;
}
