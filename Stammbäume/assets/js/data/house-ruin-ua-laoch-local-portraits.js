const PORTRAIT_ROOT = 'assets/images/portraits/haus-ruin-ua-laoch';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'roibeard-laoch',
  'ronan-laoch',
  'naran-laoch',
  'tormod-laoch',
  'farrell-laoch',
  'eolann-laoch',
  'talamhan-laoch',
  'sinna-laoch',
  'reamonn-laoch',
  'wylba-laoch',
  'treasa-laoch',
  'flann-laoch',
  'zadran-laoch',
  'flannait-laoch',
  'yoran-laoch',
  'fionait-laoch',
  'trian-laoch',
  'eamon-laoch',
  'fergal-laoch',
  'giollan-laoch',
  'peadar-laoch',
  'muireall-laoch',
  'niamh-laoch',
  'lile-laoch',
  'deirdre-laoch'
]);

export const HOUSE_RUIN_UA_LAOCH_LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])
));
