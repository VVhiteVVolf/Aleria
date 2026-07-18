const PORTRAIT_ROOT = 'assets/images/portraits/haus-awenydd';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'aeddan-awenydd',
  'colwyn-awenydd',
  'selwyn-awenydd',
  'derfel-awenydd',
  'eleri-awenydd',
  'hafgan-awenydd',
  'gildas-awenydd',
  'delyth-awenydd',
  'idnerth-awenydd',
  'gwern-awenydd',
  'brychan-awenydd',
  'ruarc-balguen',
  'rhoswyn-penwyn',
  'rhiwallon-awenydd',
  'hafren-awenydd',
  'orlaith-awenydd',
  'amren-awenydd',
  'arthen-awenydd',
  'beliad-awenydd',
  'rhosyn-awenydd',
  'ysolt-awenydd',
  'bors-awenydd',
  'ludd-awenydd'
]);

export const HOUSE_AWENYDD_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
