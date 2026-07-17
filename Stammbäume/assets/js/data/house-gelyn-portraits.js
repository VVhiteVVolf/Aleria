const PORTRAIT_ROOT = 'assets/images/portraits/haus-gelyn';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'cadoc-gelyn',
  'dehlia-gelyn',
  'aliza',
  'brannoc-gelyn',
  'senara-gelyn',
  'madoc-gelyn',
  'gwyron-gelyn',
  'gwawr-gelyn',
  'glinda',
  'kamber-balchder',
  'ceciley',
  'maygan',
  'wynfor',
  'rhon-gelyn',
  'torri-gelyn',
  'fflam-gelyn',
  'gwion-gelyn',
  'garym-gelyn',
  'reece-gelyn',
  'llew-gelyn',
  'teleri-gelyn',
  'meic-gelyn'
]);

export const HOUSE_GELYN_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
