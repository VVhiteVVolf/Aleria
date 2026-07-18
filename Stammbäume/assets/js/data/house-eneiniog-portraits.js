const PORTRAIT_ROOT = 'assets/images/portraits/haus-eneiniog';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'tyrnog-eneiniog',
  'urien-eneiniog',
  'peredur-eneiniog',
  'tuduryn-eneiniog',
  'maredog-eneiniog',
  'lywell-eneiniog',
  'cledwen-eneiniog',
  'rhiwallon-eneiniog',
  'nefydd-eneiniog',
  'angharad-eneiniog',
  'owain-eneiniog',
  'meriadog-eneiniog',
  'rhunog-eneiniog',
  'iyvan-eneiniog',
  'ygraine-eneiniog',
  'nolwen-eneiniog',
  'ieuanor-eneiniog',
  'trysten-eneiniog',
  'deiniol-eneiniog',
  'cynwrig-eneiniog',
  'heddwyn-eneiniog',
  'uthrynn-eneiniog',
  'wynella-eneiniog'
]);

export const HOUSE_ENEINIOG_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
