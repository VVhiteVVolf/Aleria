import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';
import { HOUSE_CANWYLL_PORTRAITS } from './house-canwyll-portraits.js';
import { HOUSE_CATH_PORTRAITS } from './house-cath-portraits.js';
import { HOUSE_CREFYDDOL_PORTRAITS } from './house-crefyddol-portraits.js';
import { HOUSE_GWIALEN_PORTRAITS } from './house-gwialen-portraits.js';
import { HOUSE_MORFIL_PORTRAITS } from './house-morfil-portraits.js';
import { HOUSE_MWYALCHEN_PORTRAITS } from './house-mwyalchen-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_TIWNA_PORTRAITS } from './house-tiwna-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-pawen';

export const HOUSE_PAWEN_LOCAL_PORTRAIT_FILES = Object.freeze({
  'cadoc-pawen': 'cadoc-pawen.jpg',
  'blegywryd-pawen': 'blegywryd-pawen.jpg',
  'amaethon-pawen': 'amaethon-pawen.jpg',
  'joally-pawen': 'joally-pawen.jpg',
  'mared-pawen': 'mared-pawen.jpg',
  'glinda-crafanc': 'glinda-crafanc.jpg',
  'tegid-cwningod': 'tegid-cwningod.jpg',
  'urien-eirth': 'urien-eirth.jpg',
  'ianto-pawen': 'ianto-pawen.jpg',
  'owena-pawen': 'owena-pawen.jpg',
  'thalen-pawen': 'thalen-pawen.jpg',
  'niniel-pawen': 'niniel-pawen.jpg',
  'guto-pawen': 'guto-pawen.png'
});

export const HOUSE_PAWEN_PORTRAIT_SOURCES = Object.freeze({
  'cadoc-pawen': 'https://64.media.tumblr.com/f1372719fc2e89a3dd88bd7bb3d944a1/61c4bf701607a1c0-4d/s250x400/590a42f29036209f0376dde05a8c9a4ac1c831cb.pnj',
  'blegywryd-pawen': 'https://64.media.tumblr.com/25f5bd1fc09456bc722205eaa38045f7/61c4bf701607a1c0-bc/s250x400/2fbccfc1c6db653ed9e8a5b7c0e2fd9504378a4c.pnj',
  'amaethon-pawen': 'https://64.media.tumblr.com/4a00a8d4c98c039a1e06332820a26b25/61c4bf701607a1c0-bc/s250x400/6d5f53ed202485fbd45c6d33c5fbf8d4c812af40.pnj',
  'joally-pawen': 'https://64.media.tumblr.com/8f74f9682145902f1e275d1ecd33bfa2/61c4bf701607a1c0-ec/s250x400/519a7dfeaf63c9fc74948e1fe2e356863d42a9b7.pnj',
  'mared-pawen': 'https://64.media.tumblr.com/2a7cb22b33cb19b5f1176505b50523e4/61c4bf701607a1c0-3c/s250x400/edf124a4228be763a494c83dcb874014e7c2fb0c.pnj',
  'glinda-crafanc': 'https://64.media.tumblr.com/975afc09457997941396eae34b8e1ab0/deb6c6d744f2a5cc-6c/s250x400/975aa6dab9fd5442cd848327718584b8375c3672.pnj',
  'tegid-cwningod': 'https://64.media.tumblr.com/c6f1dac712fbffee9005127270ea3a34/ede4c143dc24726b-04/s250x400/641fb7f1138cb071c600ac3fa6d7bc857c5ac613.pnj',
  'urien-eirth': 'https://64.media.tumblr.com/2fd5a0c89ac7d4d12b9df1d0f4c68d79/ef7b451a93b548d3-e6/s250x400/99d03d629f23abcd0459a9492705fc94dd878308.pnj',
  'ianto-pawen': 'https://64.media.tumblr.com/ec8265eddfcc834cafe43382e70df787/61c4bf701607a1c0-ff/s250x400/754b2b07616a04150861fb43208918c31568e1cf.pnj',
  'owena-pawen': 'https://64.media.tumblr.com/f2257046f87766f92b7af79a93c0e79d/61c4bf701607a1c0-f0/s400x600/9e68a05063599497ca7cb4aaf9645f01b8cc8927.pnj',
  'thalen-pawen': 'https://64.media.tumblr.com/288a48fab8f4a99a26d0bdf4d3239f4b/61c4bf701607a1c0-8d/s400x600/b20a7535f88e2943dc3d2f666dc055ffe1794bf7.pnj',
  'niniel-pawen': 'https://64.media.tumblr.com/17d6427a6a714ca8ecf36900e444bbc1/61c4bf701607a1c0-bc/s250x400/0719b2cc095d8175fce92a3a9366f2101e848fe0.pnj',
  'guto-pawen': 'https://i.imgur.com/CQuGR1z.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_PAWEN_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle geteilter
// Weltpersonen. Wiederholte Standardsilhouetten der Altquelle werden nicht als
// vermeintliche Individualporträts gespeichert.
export const HOUSE_PAWEN_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'lamorak-arth': HOUSE_ARTH_PORTRAITS['lamorak-arth'],
  'trahaern-arth': HOUSE_ARTH_PORTRAITS['trahaern-arth'],
  'sadwrn-pawen': HOUSE_ARTH_PORTRAITS['sadwrn-pawen'],
  'brac-pawen': HOUSE_ARTH_PORTRAITS['brac-pawen'],
  'tarian-arth': HOUSE_ARTH_PORTRAITS['tarian-arth'],
  'domnall-arth': HOUSE_ARTH_PORTRAITS['domnall-arth'],
  'gwenfrewi-pawen': HOUSE_ARTH_PORTRAITS['gwenfrewi-pawen'],
  'emrys-crefyddol': HOUSE_CREFYDDOL_PORTRAITS['emrys-crefyddol'],
  'rhodri-pawen': HOUSE_CANWYLL_PORTRAITS['rhodri-pawen'],
  'madoc-tiwna': HOUSE_TIWNA_PORTRAITS['madoc-tiwna'],
  'heledd-cath': HOUSE_CATH_PORTRAITS['heledd-cath'],
  'grufudd-pawen': HOUSE_CATH_PORTRAITS['grufudd-pawen'],
  'artus-gwialen': HOUSE_GWIALEN_PORTRAITS['artus-gwialen'],
  'aneirin-brithyll': HOUSE_BRITHYLL_PORTRAITS['aneirin-brithyll'],
  'genofeva-neidr': HOUSE_NEIDR_PORTRAITS['genofeva-neidr'],
  'lamorak-pawen': HOUSE_NEIDR_PORTRAITS['lamorak-pawen'],
  'naili-mwyalchen': HOUSE_MWYALCHEN_PORTRAITS['naili-mwyalchen'],
  'lwyd-pawen': HOUSE_MWYALCHEN_PORTRAITS['lwyd-pawen'],
  'mabil-morfil': HOUSE_MORFIL_PORTRAITS['mabil-morfil'],
  'march-pawen': HOUSE_MORFIL_PORTRAITS['march-pawen']
});
