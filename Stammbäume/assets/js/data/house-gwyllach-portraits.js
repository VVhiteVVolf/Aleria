const PORTRAIT_ROOT = 'assets/images/portraits/haus-gwyllach';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'maelgoran-gwyllach',
  'tewrig-gwyllach',
  'odrith-gwyllach',
  'rhydderch-gwyllach',
  'rhovan-gwyllach',
  'efael-gwyllach',
  'talaneth-gwyllach',
  'meredydd-gwyllach',
  'drystan-gwyllach',
  'anelen-gwyllach',
  'meirawen-gwyllach',
  'morwella-gwyllach',
  'talyfer-gwyllach',
  'saerwyn-gwyllach',
  'meirion-gwyllach',
  'eryndor-gwyllach',
  'olyndor-gwyllach',
  'rhufaed-gwyllach',
  'liora-gwyllach'
]);

export const HOUSE_GWYLLACH_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
