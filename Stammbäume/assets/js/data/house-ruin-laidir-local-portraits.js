const PORTRAIT_ROOT = 'assets/images/portraits/haus-ruin-laidir';

export const HOUSE_RUIN_LAIDIR_LOCAL_PORTRAIT_FILES = Object.freeze({
  'lughaidh-founder-laidir': 'lughaidh-founder-laidir.png',
  'valtair-laidir': 'valtair-laidir.png',
  'aonghus-laidir': 'aonghus-laidir.png',
  'rioghnan-laidir': 'rioghnan-laidir.png',
  'kadhghan-laidir': 'kadhghan-laidir.png',
  'trianach-laidir': 'trianach-laidir.png',
  'fechin-laidir': 'fechin-laidir.png',
  'pailtear-laidir': 'pailtear-laidir.png',
  'padraigin-laidir': 'padraigin-laidir.png',
  'eibhlin-laidir': 'eibhlin-laidir.png',
  'lughaidh-1698-laidir': 'lughaidh-1698-laidir.png',
  'fionnchu-laidir': 'fionnchu-laidir.png',
  'tiona-laidir': 'tiona-laidir.png',
  'nogh-laidir': 'nogh-laidir.jpg',
  'onora-laidir': 'onora-laidir.jpg',
  'keitha-laidir': 'keitha-laidir.jpg',
  'abhan-laidir': 'abhan-laidir.png'
});

export const HOUSE_RUIN_LAIDIR_LOCAL_PORTRAIT_IDS = Object.freeze(
  Object.keys(HOUSE_RUIN_LAIDIR_LOCAL_PORTRAIT_FILES)
);

export const HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_RUIN_LAIDIR_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));
