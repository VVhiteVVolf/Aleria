const PORTRAIT_ROOT = 'assets/images/portraits/haus-suedstahl';

export const HOUSE_SUEDSTAHL_LOCAL_PORTRAIT_FILES = Object.freeze({
  'salah-suedstahl': 'salah-suedstahl.png',
  'gormlaith-frisealach': 'gormlaith-frisealach.png',
  'malak-suedstahl': 'malak-suedstahl.png',
  'raghan-suedstahl': 'raghan-suedstahl.png',
  'freydis-tauwind': 'freydis-tauwind.png',
  'astrid-donnerblut': 'astrid-donnerblut.png',
  'lydia-suedstahl': 'lydia-suedstahl.png',
  'maela-suedstahl': 'maela-suedstahl.png',
  'salah-ii-suedstahl': 'salah-ii-suedstahl.png',
  'raghild-suedstahl': 'raghild-suedstahl.png',
  'diarmuid-suedstahl': 'diarmuid-suedstahl.png'
});

export const HOUSE_SUEDSTAHL_PORTRAIT_SOURCES = Object.freeze({
  'salah-suedstahl': 'https://i.imgur.com/lh1KiC9.png',
  'gormlaith-frisealach': 'https://i.imgur.com/EEjH2ZP.png',
  'malak-suedstahl': 'https://i.imgur.com/HOaBOG3.png',
  'raghan-suedstahl': 'https://i.imgur.com/yyBDjnb.png',
  'freydis-tauwind': 'https://i.imgur.com/B8fPg5l.png',
  'astrid-donnerblut': 'https://i.imgur.com/Iz6lBYB.png',
  'lydia-suedstahl': 'https://i.imgur.com/O2tY8n3.png',
  'maela-suedstahl': 'https://i.imgur.com/xr4rnqG.png',
  'salah-ii-suedstahl': 'https://i.imgur.com/DFiVyia.png',
  'raghild-suedstahl': 'https://i.imgur.com/29MzF1R.png',
  'diarmuid-suedstahl': 'https://i.imgur.com/BsQiWAA.png'
});

export const HOUSE_SUEDSTAHL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_SUEDSTAHL_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));
