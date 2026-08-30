const PORTRAIT_ROOT = 'assets/images/portraits/haus-na-mhuir';

export const HOUSE_NA_MHUIR_LOCAL_PORTRAIT_IDS = Object.freeze([
  'connla-mhuir',
  'ytaran-mhuir',
  'lochlainn-mhuir',
  'malach-mhuir',
  'muirgheas-mhuir',
  'aodhagan-mhuir',
  'lannraig-mhuir',
  'vionaigh-mhuir',
  'criostoir-mhuir',
  'tuaman-mhuir',
  'oonagh-mhuir',
  'dervla-mhuir',
  'duna-mhuir',
  'beathag-mhuir',
  'artair-mhuir',
  'vannoch-mhuir',
  'heulyn-mhuir',
  'keiran-mhuir'
]);

export const HOUSE_NA_MHUIR_LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_NA_MHUIR_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.png`
  ])
));
