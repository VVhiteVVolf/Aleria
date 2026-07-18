const PORTRAIT_ROOT = 'assets/images/portraits/haus-gostyn';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'roderic-gostyn',
  'coel-gostyn',
  'cadoc-gostyn',
  'eifion-gostyn',
  'derfel-gostyn',
  'gruffydd-gostyn',
  'nest-gostyn',
  'amlyn-gostyn',
  'barri-gostyn',
  'deiniol-gostyn',
  'heddwyn-gostyn',
  'saeth-gostyn',
  'clydno-gostyn',
  'eurig-gostyn',
  'garmon-gostyn',
  'illtud-gostyn',
  'math-gostyn',
  'lola-gostyn'
]);

export const HOUSE_GOSTYN_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
