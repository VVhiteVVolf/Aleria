import { PENRUDD_PEOPLE, PENRUDD_EMBLEM } from './penrudd-household.mjs';

export const TOR_EMBLEM = `../Stammbäume/${PENRUDD_EMBLEM}`;
export const TOR_FAMILY_LINK = '../Stammbäume/Stammbaum.html?family=haus-penrudd&mode=view';
export function penruddPerson(key) {
  const person = PENRUDD_PEOPLE.find(person => person.id === `${key}-penrudd`);
  if (!person) throw Error(`Unbekanntes Mitglied der Penrudds: ${key}`);
  return person;
}
export const TOR_WORKING_KEYS = Object.freeze(['carwyn', 'olwen', 'aled', 'cerys', 'mared', 'hywel', 'ffion', 'rhosyn']);
export const TOR_WORKING_PEOPLE = Object.freeze(TOR_WORKING_KEYS.map(penruddPerson));
export const torFamilyConnection = key => {
  const person = penruddPerson(key);
  return { name: person.name, detail: person.role, image: person.portrait };
};
