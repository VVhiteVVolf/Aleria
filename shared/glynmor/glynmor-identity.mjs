export const GLYNMOR_FAMILY_ID = 'glynmor';
export const GLYNMOR_HOUSE_ID = 'house-glynmor';
export const GLYNMOR_FAMILY_NAME = 'Familie Glynmor';
export const GLYNMOR_FAMILY_PATH = Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
export const GLYNMOR_TREE_MEDIA = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Glynmor';
export const GLYNMOR_EMBLEM = `${GLYNMOR_TREE_MEDIA}/glynmor-wappen-v1.png`;
export const GLYNMOR_TREE_URL = '../Stammbäume/Stammbaum.html?family=glynmor&mode=view';
export const GLYNMOR_HOUSE_URL = '../Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=glynmor';
export const GLYNMOR_MODULE_ID = 'gwynthor-kerzenmacherei-glynmor';
export const GLYNMOR_MODULE_URL = `../AleriaAlmanach/AleriaAlmanach.html?entry=${GLYNMOR_MODULE_ID}`;

export const GLYNMOR_TUDUR = Object.freeze({
  personId: 'person-c8d56880',
  characterId: 'person--glynmor--person-c8d56880'
});
export const GLYNMOR_MEERA = Object.freeze({
  personId: 'person-d665a54d',
  characterId: 'h0VXEDCGuIvxRxCFGyIa'
});

export const isNamedGlynmorPerson = name => !!name?.trim() && !/^(?:\?+|Unbekannt)/i.test(name.trim());
