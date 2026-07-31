const PORTRAIT_ROOT = 'assets/images/portraits/haus-durdynn';

export const HOUSE_DURDYNN_LOCAL_PORTRAIT_FILES = Object.freeze({
  'caryl-durdynn': 'caryl-durdynn.png'
});

export const HOUSE_DURDYNN_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_DURDYNN_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));
