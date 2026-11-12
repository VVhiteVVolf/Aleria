import { AURDDEN_PORTRAIT_PEOPLE } from './aurdden-people.js';

// Stable person-to-file mapping; the intake manifest records actual versions.
export const HOUSE_AURDDEN_PORTRAITS = Object.freeze(Object.fromEntries(
  AURDDEN_PORTRAIT_PEOPLE.map(person => [person.id, person.portrait])
));
