import { HOUSE_ARGALL_FAMILY } from './house-argall-family.js';

export const LLYSFAEN_COMMONER_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'argall', title: 'Argall', file: 'Argall.png' })
]);

const DEVELOPED_FAMILIES = Object.freeze({
  argall: HOUSE_ARGALL_FAMILY
});

export const LLYSFAEN_COMMONER_HOUSE_FAMILIES = Object.freeze(
  LLYSFAEN_COMMONER_HOUSE_DEFINITIONS.map(definition => DEVELOPED_FAMILIES[definition.slug])
);
