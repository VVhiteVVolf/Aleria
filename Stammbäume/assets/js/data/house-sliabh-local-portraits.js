const PORTRAIT_ROOT = 'assets/images/portraits/haus-sliabh';

export const HOUSE_SLIABH_LOCAL_PORTRAIT_FILES = Object.freeze({
  'odhran-sliabh': 'odhran-sliabh.png',
  'labhoise-sliabh': 'labhoise-sliabh.png',
  'gorman-sliabh': 'gorman-sliabh.png',
  'ciara-sliabh': 'ciara-sliabh.png',
  'lomhan-sliabh': 'lomhan-sliabh.png',
  'oideach-sliabh': 'oideach-sliabh.png',
  'wiorna-sliabh': 'wiorna-sliabh.png',
  'haodh-sliabh': 'haodh-sliabh.png',
  'latharna-sliabh': 'latharna-sliabh.png',
  'alwyn-sliabh': 'alwyn-sliabh.png',
  'conan-sliabh': 'conan-sliabh.png',
  'brinley-sliabh': 'brinley-sliabh.png'
});

export const HOUSE_SLIABH_LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_SLIABH_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));
