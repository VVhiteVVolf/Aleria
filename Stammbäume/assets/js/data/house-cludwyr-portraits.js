const PORTRAIT_ROOT = 'assets/images/portraits/haus-cludwyr';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'saith-cludwyr',
  'godwyn-cludwyr',
  'rhain-cludwyr',
  'tigris-cludwyr',
  'parzifal-cludwyr',
  'klervi-balchder',
  'rhena',
  'slevin-cludwyr',
  'glaw-cludwyr',
  'iestyn-cludwyr',
  'winnifred-cludwyr',
  'selwyn-cludwyr',
  'arwen',
  'gavin-1702',
  'aslaug',
  'janto',
  'llio',
  'sian-cludwyr',
  'aled-cludwyr',
  'bogus-cludwyr',
  'cady-cludwyr',
  'brac-cludwyr',
  'gildas-cludwyr',
  'ellis-cludwyr',
  'dee-cludwyr',
  'eira-cludwyr',
  'dewi-cludwyr'
]);

export const HOUSE_CLUDWYR_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
