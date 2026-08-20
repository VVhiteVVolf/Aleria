const PORTRAIT_ROOT = 'assets/images/portraits/haus-jaernblod';

export const HOUSE_JAERNBLOD_LOCAL_PORTRAIT_FILES = Object.freeze({
  'alfgeir-jaernblod': 'alfgeir-jaernblod.png',
  'geri-jaernblod': 'geri-jaernblod.png',
  'skjoldur-jaernblod': 'skjoldur-jaernblod.png',
  'floki-jaernblod': 'floki-jaernblod.png',
  'skalli-jaernblod': 'skalli-jaernblod.png',
  'freki-jaernblod': 'freki-jaernblod.png'
});

export const HOUSE_JAERNBLOD_PORTRAIT_SOURCES = Object.freeze({
  'alfgeir-jaernblod': 'https://i.imgur.com/OW7XOB0.png',
  'geri-jaernblod': 'https://i.imgur.com/KwOMloe.png',
  'skjoldur-jaernblod': 'https://i.imgur.com/o8vpq4s.png',
  'floki-jaernblod': 'https://i.imgur.com/e5plo6x.png',
  'skalli-jaernblod': 'https://i.imgur.com/ZJ2x6Wd.png',
  'freki-jaernblod': 'https://i.imgur.com/AOGREex.png'
});

export const HOUSE_JAERNBLOD_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_JAERNBLOD_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));
