import { HOUSE_CREYR_PORTRAITS } from './house-creyr-portraits.js';
import { HOUSE_GWARCHOD_PORTRAITS } from './house-gwarchod-portraits.js';
import { HOUSE_HWYADEN_PORTRAITS } from './house-hwyaden-portraits.js';
import { HOUSE_MARWOLAETH_PORTRAITS } from './house-marwolaeth-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';
import { HOUSE_TIR_ADDAWOL_PORTRAITS } from './house-tir-addawol-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-saith';

const LOCAL_PORTRAIT_FILES = Object.freeze({
  'dadweir-saith': 'dadweir-saith.png',
  'argyll-saith': 'argyll-saith.png',
  'sieffre-draenog': 'sieffre-draenog.jpg',
  'merlijn-saith': 'merlijn-saith.png',
  'luan-tsaoir': 'luan-tsaoir.jpg',
  'nelwyn-saith': 'nelwyn-saith.png',
  'darwyn-saith': 'darwyn-saith.png',
  'vortigern-saith': 'vortigern-saith.png',
  'alaweyn-saith': 'alaweyn-saith.png',
  'saselia-saith': 'saselia-saith.png',
  'gwendolyn-crefyddol': 'gwendolyn-crefyddol.jpg',
  'jowan-canwyll': 'jowan-canwyll.jpg',
  'uvel-canwyll': 'uvel-canwyll.jpg',
  'lyonel-saith': 'lyonel-saith.png',
  'lyabelle-saith': 'lyabelle-saith.png',
  'bran-tiwna': 'bran-tiwna.png',
  'maelyn-saith': 'maelyn-saith.png',
  'wynoc-pyrth': 'wynoc-pyrth.png',
  'boudwin-saith': 'boudwin-saith.png',
  'eleri-saith': 'eleri-saith.png',
  'ysarn-saith': 'ysarn-saith.png',
  'urien-saith': 'urien-saith.png',
  'bysen-saith': 'bysen-saith.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Quelle ihrer
// Weltpersonen und Bilder. Wiederholte Standardsilhouetten aus der Saith-Quelle
// werden nicht als scheinbare Individualporträts importiert.
export const HOUSE_SAITH_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'bors-saith': HOUSE_NEIDR_PORTRAITS['bors-saith'],
  'gwennan-neidr': HOUSE_NEIDR_PORTRAITS['gwennan-neidr'],
  'merwin-neidr': HOUSE_NEIDR_PORTRAITS['merwin-neidr'],
  'jinell-neidr': HOUSE_NEIDR_PORTRAITS['jinell-neidr'],
  'hetwn-saith': HOUSE_NEIDR_PORTRAITS['hetwn-saith'],
  'ariana-saith': HOUSE_NEIDR_PORTRAITS['ariana-saith'],
  'odyar-neidr': HOUSE_NEIDR_PORTRAITS['odyar-neidr'],
  'lancel-saith': HOUSE_CREYR_PORTRAITS['lancel-saith'],
  'blodwen-creyr': HOUSE_CREYR_PORTRAITS['blodwen-creyr'],
  'hopcyn-saith': HOUSE_WYLAN_PORTRAITS['hopcyn-saith'],
  'duny-saith': HOUSE_MARWOLAETH_PORTRAITS['duny-saith'],
  'pavetta-marwolaeth': HOUSE_MARWOLAETH_PORTRAITS['pavetta-marwolaeth'],
  'waleran-gwarchod': HOUSE_GWARCHOD_PORTRAITS['waleran-gwarchod'],
  'yseut-saith': HOUSE_GWARCHOD_PORTRAITS['yseut-saith'],
  'maelron-saith': HOUSE_SAETHWYR_PORTRAITS['maelron-saith'],
  'enora-saethwyr': HOUSE_SAETHWYR_PORTRAITS['enora-saethwyr'],
  'xylon-saith': HOUSE_HWYADEN_PORTRAITS['xylon-saith'],
  'zinnara-hwyaden': HOUSE_HWYADEN_PORTRAITS['zinnara-hwyaden'],
  'yvette-saith': HOUSE_TIR_ADDAWOL_PORTRAITS['yvette-saith'],
  'tirian-tir-addawol': HOUSE_TIR_ADDAWOL_PORTRAITS['tirian-tir-addawol']
});
