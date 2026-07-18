const PORTRAIT_ROOT = 'assets/images/portraits/haus-awenor';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'aergol-awenor',
  'glynfael-awenor',
  'ffraid-awenor',
  'gwylan-awenor',
  'gethor-awenor',
  'gwaeron-awenor',
  'derwain-awenor',
  'nerwen-awenor',
  'garan-1695-awenor',
  'rhyd-awenor',
  'rhys-awenor',
  'elfael-awenor',
  'telyn-awenor',
  'cochan-awenor',
  'urfael-awenor',
  'briallen-awenor',
  'isgar-awenor',
  'erydd-awenor',
  'carys-awenor'
]);

export const HOUSE_AWENOR_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
