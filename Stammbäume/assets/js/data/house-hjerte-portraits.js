const PORTRAIT_ROOT = 'assets/images/portraits/haus-hjerte';

export const HOUSE_HJERTE_LOCAL_PORTRAIT_FILES = Object.freeze({
  'fafnir-hjerte': 'fafnir-hjerte.png',
  'brynjar-hjerte': 'brynjar-hjerte.png',
  'zarnik-hjerte': 'zarnik-hjerte.png',
  'fjalmar-hjerte': 'fjalmar-hjerte.png',
  'kjalmar-hjerte': 'kjalmar-hjerte.png'
});

export const HOUSE_HJERTE_PORTRAIT_SOURCES = Object.freeze({
  'fafnir-hjerte': 'https://i.imgur.com/1wUH2eD.png',
  'brynjar-hjerte': 'https://i.imgur.com/W6GPgoc.png',
  'zarnik-hjerte': 'https://i.imgur.com/prs8V1o.png',
  'fjalmar-hjerte': 'https://i.imgur.com/1x4xeAI.png',
  'kjalmar-hjerte': 'https://i.imgur.com/Dh8msnP.png'
});

export const HOUSE_HJERTE_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_HJERTE_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));
