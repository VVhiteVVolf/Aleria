const PORTRAIT_ROOT = 'assets/images/portraits/haus-sgrechiwr';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'gareth-sgrechiwr',
  'gerallt-sgrechiwr',
  'cadogan-sgrechiwr',
  'fflur-sgrechiwr',
  'colwyn-sgrechiwr',
  'godwyn-sgrechiwr',
  'amlodd-sgrechiwr',
  'eluned-sgrechiwr',
  'meinwen-sgrechiwr',
  'euros-sgrechiwr',
  'angwen-sgrechiwr',
  'eirwen-sgrechiwr',
  'dylis-sgrechiwr',
  'bran-sgrechiwr',
  'arial-sgrechiwr',
  'cadell-sgrechiwr'
]);

export const HOUSE_SGRECHIWR_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
