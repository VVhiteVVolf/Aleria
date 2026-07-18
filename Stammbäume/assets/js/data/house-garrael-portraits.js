const PORTRAIT_ROOT = 'assets/images/portraits/haus-garrael';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'aledd-garrael',
  'lyonnel-garrael',
  'carys-garrael',
  'bedwyr-garrael',
  'uther-garrael',
  'eithne-garrael',
  'elain-garrael',
  'gavin-garrael',
  'lowri-garrael',
  'emyr-garrael',
  'megan-garrael',
  'heledd-garrael',
  'gareth-garrael',
  'jac-garrael',
  'marc-garrael'
]);

export const HOUSE_GARRAEL_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
