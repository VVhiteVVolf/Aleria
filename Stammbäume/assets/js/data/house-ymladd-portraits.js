const PORTRAIT_ROOT = 'assets/images/portraits/haus-ymladd';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'dafydd-ymladd',
  'hedd-ymladd',
  'gruffydd-ymladd',
  'garan-ymladd',
  'idris-ymladd',
  'idwal-ymladd',
  'alistair-ymladd',
  'keneth-ymladd',
  'emeric-ymladd',
  'nerys-ymladd',
  'guto-ymladd',
  'menna-ymladd',
  'gwilym-ymladd',
  'iorwerth-ymladd',
  'morfudd-ymladd',
  'tywll-ymladd'
]);

export const HOUSE_YMLADD_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
