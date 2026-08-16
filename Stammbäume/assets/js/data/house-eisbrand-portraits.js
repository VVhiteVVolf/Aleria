import { HOUSE_TODBRAND_PORTRAITS } from './house-todbrand-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-eisbrand';

export const HOUSE_EISBRAND_LOCAL_PORTRAIT_FILES = Object.freeze({
  'jorvik-eisbrand': 'jorvik-eisbrand.png',
  'fenbjorn-eisbrand': 'fenbjorn-eisbrand.png',
  'skorvir-eisbrand': 'skorvir-eisbrand.png',
  'skaldir-eisbrand': 'skaldir-eisbrand.png',
  'skjorn-eisbrand': 'skjorn-eisbrand.png',
  'brynjolf-eisbrand': 'brynjolf-eisbrand.png',
  'galdrin-eisbrand': 'galdrin-eisbrand.png',
  'haldrik-eisbrand': 'haldrik-eisbrand.png',
  'skorr-eisbrand': 'skorr-eisbrand.png',
  'drakvyr-eisbrand': 'drakvyr-eisbrand.png',
  'kjeldis-eisbrand': 'kjeldis-eisbrand.png',
  'astrid-eisbrand': 'astrid-eisbrand.png',
  'vormir-eisbrand': 'vormir-eisbrand.png'
});

export const HOUSE_EISBRAND_PORTRAIT_SOURCES = Object.freeze({
  'jorvik-eisbrand': 'https://i.imgur.com/UqF3VAM.png',
  'fenbjorn-eisbrand': 'https://i.imgur.com/L4kkEiM.png',
  'skorvir-eisbrand': 'https://i.imgur.com/5IBVGjP.png',
  'skaldir-eisbrand': 'https://i.imgur.com/rsFS7sF.png',
  'skjorn-eisbrand': 'https://i.imgur.com/3owUW2q.png',
  'brynjolf-eisbrand': 'https://i.imgur.com/C7c6M2s.png',
  'galdrin-eisbrand': 'https://i.imgur.com/5EEuA6S.png',
  'haldrik-eisbrand': 'https://i.imgur.com/SkrmYM8.png',
  'skorr-eisbrand': 'https://i.imgur.com/EI0B5oW.png',
  'drakvyr-eisbrand': 'https://i.imgur.com/sUm2MII.png',
  'kjeldis-eisbrand': 'https://i.imgur.com/c8aUjC0.png',
  'astrid-eisbrand': 'https://i.imgur.com/6Oaiieq.png',
  'vormir-eisbrand': 'https://i.imgur.com/TbdEfqx.png'
});

export const HOUSE_EISBRAND_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(HOUSE_EISBRAND_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])),
  'audun-todbrand': HOUSE_TODBRAND_PORTRAITS['audun-todbrand']
});
