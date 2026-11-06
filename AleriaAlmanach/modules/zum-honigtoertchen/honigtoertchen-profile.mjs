import { GWYNTHOR_CITY_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';

export const HONIGTOERTCHEN_ID = 'zum-honigtoertchen';
export const HONIGTOERTCHEN_ART = './assets/zum-honigtoertchen';
export const MELOG_EMBLEM = '../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Melog/melog-emblem.png';
export const MELOG_BAKER = `${HONIGTOERTCHEN_ART}/figures/baecker-melog.png`;
export const MELOG_MASTER_ID = 'person--melog--person-0c68dade';
export const MELOG_FAMILY_LINK = '../Stammbäume/Stammbaum.html?family=melog&mode=view';
export const MELOG_HOUSE_LINK = '../Familien Häuser und Clans/kleinehaeuser.html?haus=melog';
export const HONIGTOERTCHEN_SECTION = Object.freeze({
  key: 'Gwynthor-Stadt', tab: 'Völker & Kulturen', path: GWYNTHOR_CITY_PATH,
  description: 'Bespielbare Orte und Geschäfte in Gwynthor-Stadt.'
});

export const HONIGTOERTCHEN_PROFILE = Object.freeze([
  ['Name', 'Zum Honigtörtchen'], ['Gewerbe', 'Bäckerei & Konditorei'],
  ['Standort', 'Gwynthor · Llamreis Ankunft'], ['Besitzerfamilie', 'Melog · bürgerliches Haus'],
  ['Leitung', 'Tewdwr Melog'], ['Spezialität', 'Feine Kuchen, Torten & süßes Gebäck'],
  ['Glaube', 'Alerische Kirche · besondere Verehrung Tharims']
]);
