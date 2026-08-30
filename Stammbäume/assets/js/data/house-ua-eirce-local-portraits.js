const PORTRAIT_ROOT = 'assets/images/portraits/haus-ua-eirce';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'eigneachan-eirce',
  'raghallach-eirce',
  'hoibrean-eirce',
  'fiachra-eirce',
  'vannoch-eirce',
  'tallula-eirce',
  'brock-eirce',
  'maoltuile-eirce',
  'daithi-eirce',
  'rabhla-eirce',
  'nechtan-eirce',
  'keara-eirce',
  'uisdean-eirce',
  'wray-eirce',
  'kavan-eirce',
  'jilbhe-eirce',
  'vaila-eirce'
]);

export const HOUSE_UA_EIRCE_LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  LOCAL_PORTRAIT_IDS.map(personId => [personId, `${PORTRAIT_ROOT}/${personId}.jpg`])
));
