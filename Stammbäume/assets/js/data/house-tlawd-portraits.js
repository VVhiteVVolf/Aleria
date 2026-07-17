const PORTRAIT_ROOT = 'assets/images/portraits/haus-tlawd';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'edric-tlawd',
  'owain-tlawd',
  'mair-tlawd',
  'gareth-tlawd',
  'cadfael-tlawd',
  'siarl-tlawd',
  'nedri-tlawd',
  'modlen-tlawd',
  'lloyd-tlawd',
  'rhyderch-tlawd',
  'renfri-tlawd',
  'lludd-tlawd',
  'arwel-tlawd',
  'caron-tlawd',
  'edric-tlawd-1716',
  'taran-tlawd',
  'haf-tlawd',
  'owain-tlawd-1720',
  'leisa-tlawd'
]);

export const HOUSE_TLAWD_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
