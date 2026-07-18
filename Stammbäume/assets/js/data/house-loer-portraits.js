const PORTRAIT_ROOT = 'assets/images/portraits/haus-loer';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'eurgain-loer',
  'dwynarth-loer',
  'ynyrion-loer',
  'gwynan-loer',
  'garmon-loer',
  'glenys-1695-loer',
  'olwen-loer',
  'gwion-loer',
  'tyne-loer',
  'tesni-loer'
]);

export const HOUSE_LOER_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
