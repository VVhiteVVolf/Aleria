import { HOUSE_SAETHWYR_FAMILY } from '../../../Stammbäume/assets/js/data/house-saethwyr-family.js';
import { HOUSE_BRADRHITH_FAMILY } from '../../../Stammbäume/assets/js/data/house-bradrhith-family.js';
import { HOUSE_ENEINIOG_FAMILY } from '../../../Stammbäume/assets/js/data/house-eneiniog-family.js';

function existingPerson(family, id, name, onlineId, role) {
  const person = family.persons.find(person => person.id === id);
  if (!person) throw new Error(`Vorhandene Person fehlt: ${id}`);
  return Object.freeze({
    id, name, onlineId, worldPersonId: person.worldPersonId,
    portrait: `../Stammbäume/${person.portrait}`, birth: person.birth, role
  });
}

export const PATRIARCH = existingPerson(HOUSE_SAETHWYR_FAMILY, 'gwalchgwyn-saethwyr',
  'Gwalchgwyn Saethwyr', 'Q0BYdkMCMOjm5rnJYjq7', 'Patriarch von Celtigerns Wacht');
export const ARIANWEN = existingPerson(HOUSE_BRADRHITH_FAMILY, 'arianwen-bradrhith',
  'Arianwen Bradrhith', 'nLIylooQSlgWjUsA1fpI', 'Bußgängerin unter persönlicher Obhut des Patriarchen');
export const PEREDUR = existingPerson(HOUSE_ENEINIOG_FAMILY, 'peredur-eneiniog',
  'Peredur Eneiniog', '', 'Hoher Prälat · Priester des Vaters');
export const ANGHARAD = existingPerson(HOUSE_ENEINIOG_FAMILY, 'angharad-eneiniog',
  'Angharad Eneiniog', '', 'Paladin im persönlichen Stab des Patriarchen');
export const CHURCH_SYMBOL = '../Religionen/assets/symbols/alerische-kirche.webp';
export const NINE_SYMBOL = '../Religionen/assets/symbols/neun-goettliche.webp';
export const CATHEDRAL_ART = './assets/gwynthor-cathedral/scenes';
