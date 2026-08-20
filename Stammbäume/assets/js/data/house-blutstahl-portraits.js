const PORTRAIT_ROOT = 'assets/images/portraits/haus-blutstahl';

export const HOUSE_BLUTSTAHL_LOCAL_PORTRAIT_FILES = Object.freeze({
  'sigurd-blutstahl': 'sigurd-blutstahl.png',
  'soren-blutstahl': 'soren-blutstahl.png',
  'sigrun-blutstahl': 'sigrun-blutstahl.png',
  'joralf-blutstahl': 'joralf-blutstahl.png',
  'holgr-blutstahl': 'holgr-blutstahl.png',
  'birger-blutstahl': 'birger-blutstahl.png',
  'einar-bastard-blutstahl': 'einar-bastard-blutstahl.png',
  'harald-blutstahl': 'harald-blutstahl.png',
  'nottulf-kaltherz': 'nottulf-kaltherz.png',
  'sleipnir-blutstahl': 'sleipnir-blutstahl.png',
  'morskar-vragi': 'morskar-vragi.png',
  'kjartan-blutstahl': 'kjartan-blutstahl.png',
  'lythar-feuerherz': 'lythar-feuerherz.png',
  'jorvik-kaltherz': 'jorvik-kaltherz.png',
  'steinar-blutstahl': 'steinar-blutstahl.png',
  'fanne-blutstahl': 'fanne-blutstahl.png',
  'ragnald-blutstahl': 'ragnald-blutstahl.png',
  'pytur-blutstahl': 'pytur-blutstahl.png',
  'grima-blutstahl': 'grima-blutstahl.png',
  'nordar-blutstahl': 'nordar-blutstahl.png',
  'torben-blutstahl': 'torben-blutstahl.png'
});

export const HOUSE_BLUTSTAHL_PORTRAIT_SOURCES = Object.freeze({
  'sigurd-blutstahl': 'https://i.imgur.com/Lg7VAt6.png',
  'soren-blutstahl': 'https://i.imgur.com/Ak7dPVi.png',
  'sigrun-blutstahl': 'https://i.imgur.com/wjS6EiT.png',
  'joralf-blutstahl': 'https://i.imgur.com/VIiPA1v.png',
  'holgr-blutstahl': 'https://i.imgur.com/5mSwC1l.png',
  'birger-blutstahl': 'https://i.imgur.com/q3Qdjpm.png',
  'einar-bastard-blutstahl': 'https://i.imgur.com/AWc6FVl.png',
  'harald-blutstahl': 'https://i.imgur.com/io0HAJD.png',
  'nottulf-kaltherz': 'https://i.imgur.com/vwFeR4T.png',
  'sleipnir-blutstahl': 'https://i.imgur.com/XKFFyiu.png',
  'morskar-vragi': 'https://i.imgur.com/eUjRNTw.png',
  'kjartan-blutstahl': 'https://i.imgur.com/oV6RcxD.png',
  'lythar-feuerherz': 'https://i.imgur.com/jejAgMA.png',
  'jorvik-kaltherz': 'https://i.imgur.com/OoqR5HH.png',
  'steinar-blutstahl': 'https://i.imgur.com/bGPupRb.png',
  'fanne-blutstahl': 'https://i.imgur.com/Qa0RN3L.png',
  'ragnald-blutstahl': 'https://i.imgur.com/4iX9Pvp.png',
  'pytur-blutstahl': 'https://i.imgur.com/0sqHJHq.png',
  'grima-blutstahl': 'https://i.imgur.com/jYWEodQ.png',
  'nordar-blutstahl': 'https://i.imgur.com/Skfzrp5.png',
  'torben-blutstahl': 'https://i.imgur.com/V4AKjTn.png'
});

export const HOUSE_BLUTSTAHL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_BLUTSTAHL_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));
