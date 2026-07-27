const PORTRAIT_ROOT = 'assets/images/portraits/haus-cysgodion';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'cadwalader-cysgodion',
  'cynfelyn-cysgodion',
  'colwyn-cysgodion',
  'cadgwan-cysgodion',
  'eirwen-cysgodion',
  'caradoc-cysgodion',
  'cadogan-cysgodion',
  'yorath-cysgodion',
  'betrys-cysgodion',
  'pryce-cysgodion',
  'gronw-cysgodion',
  'morgan-cysgodion',
  'blodwen-cysgodion',
  'astrid-cysgodion',
  'aneira-cysgodion',
  'morwenna-cysgodion',
  'cefin-cysgodion',
  'carys-cysgodion',
  'folant-cysgodion',
  'glendower-cysgodion',
  'cystennin-cysgodion',
  'crystin-cysgodion',
  'morwen-cysgodion',
  'myfanwy-cysgodion'
]);

export const HOUSE_CYSGODION_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.png`
  ]))
);
