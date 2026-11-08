const PORTRAIT_ROOT = 'assets/images/portraits/haus-maerllys';

export const HOUSE_MAERLLYS_PORTRAITS = Object.freeze({
  'nia-maerllys': `${PORTRAIT_ROOT}/nia-maerllys.png`,
  'rhys-maerllys': '../AleriaAlmanach/assets/goettliche-eleganz/portraits/rhys-maerllys.png',
  ...Object.fromEntries(['cadfan-maerllys', 'eira-spouse-maerllys', 'owain-maerllys', 'gwenllian-ysgrif',
    'iorwerth-maerllys', 'bronwen-swyll', 'geraint-maerllys', 'llio-falchdyn', 'rhoswen-maerllys', 'madoc-tonnarth']
    .map(id => [id, `${PORTRAIT_ROOT}/${id}.png`]))
});
