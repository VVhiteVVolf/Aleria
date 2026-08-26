const PORTRAIT_ROOT = 'assets/images/portraits/haus-albholz';

export const HOUSE_ALBHOLZ_LOCAL_PORTRAIT_FILES = Object.freeze({
  'albhric-albholz': 'albhric-albholz.png',
  'liorain-gruenhand': 'liorain-gruenhand.png',
  'branoc-albholz': 'branoc-albholz.png',
  'toran-albholz': 'toran-albholz.png',
  'eiran-albholz': 'eiran-albholz.png',
  'liora-albholz': 'liora-albholz.png',
  'mornhild-moorbrand': 'mornhild-moorbrand.png',
  'saga-toran-affair': 'saga-toran-affair.png',
  'sven-bjarnvarg': 'sven-bjarnvarg.png',
  'albhrin-albholz': 'albhrin-albholz.png',
  'maelaith-albholz': 'maelaith-albholz.png',
  'elbric-albholz': 'elbric-albholz.png',
  'torwynn-albholz': 'torwynn-albholz.png',
  'lorcan-albholz': 'lorcan-albholz.png'
});

export const HOUSE_ALBHOLZ_PORTRAIT_SOURCES = Object.freeze({
  'albhric-albholz': 'https://i.imgur.com/U8wrKfR.png',
  'liorain-gruenhand': 'https://i.imgur.com/YauXhNg.png',
  'branoc-albholz': 'https://i.imgur.com/K1BlELU.png',
  'toran-albholz': 'https://i.imgur.com/zNFq3ag.png',
  'eiran-albholz': 'https://i.imgur.com/hw24kEE.png',
  'liora-albholz': 'https://i.imgur.com/7yB9PR6.png',
  'mornhild-moorbrand': 'https://i.imgur.com/pVGPHEC.png',
  'saga-toran-affair': 'https://i.imgur.com/zuGR5Ps.png',
  'sven-bjarnvarg': 'https://i.imgur.com/aijqq1V.png',
  'albhrin-albholz': 'https://i.imgur.com/u1PSI7p.png',
  'maelaith-albholz': 'https://i.imgur.com/KZu3Mnn.png',
  'elbric-albholz': 'https://i.imgur.com/oIDd0TC.png',
  'torwynn-albholz': 'https://i.imgur.com/tDaLoeV.png',
  'lorcan-albholz': 'https://i.imgur.com/GE6hk8o.png'
});

export const HOUSE_ALBHOLZ_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_ALBHOLZ_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));
