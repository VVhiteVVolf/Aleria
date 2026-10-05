import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_TODBRAND_PORTRAITS } from './house-todbrand-portraits.js';
import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';
import { HOUSE_LYFANT_PORTRAITS } from './house-lyfant-portraits.js';
import { HOUSE_GWAEDLYD_PORTRAITS } from './house-gwaedlyd-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { HOUSE_TRACHWYLL_PORTRAITS } from './house-trachwyll-portraits.js';

// Kanonische Porträts der Angehörigen dieses Hauses; Gegenakten teilen dieselbe Datei.
export const HOUSE_GWENYEN_PORTRAITS = Object.freeze({
  'lewys-founder-gwenyen': "assets/images/portraits/haus-gwenyen/lewys-founder-gwenyen.png",
  'colwin-gwenyen': HOUSE_BLODYN_PORTRAITS['colwin-gwenyen'],
  'yvain-gwenyen-ogwych': HOUSE_TODBRAND_PORTRAITS['yvain-gwenyen-ogwych'],
  'anarawd-gwenyen': "assets/images/portraits/haus-gwenyen/anarawd-gwenyen.png",
  'heveydd-gwenyen': HOUSE_BRITHYLL_PORTRAITS['heveydd-gwenyen'],
  'owain-gwenyen': HOUSE_LYFANT_PORTRAITS['owain-gwenyen'],
  'blodeuyn-gwenyen': HOUSE_GWAEDLYD_PORTRAITS['blodeuyn-gwenyen'],
  'blodwen-gwenyen': "assets/images/portraits/haus-gwenyen/blodwen-gwenyen.png",
  'rhosyn-gwenyen': "assets/images/portraits/haus-gwenyen/rhosyn-gwenyen.png",
  'eurolwyn-gwenyen': "assets/images/portraits/haus-gwenyen/eurolwyn-gwenyen.png",
  'glyndwr-gwenyen': "assets/images/portraits/haus-gwenyen/glyndwr-gwenyen.png",
  'endellion-gwenyen': "assets/images/portraits/haus-gwenyen/endellion-gwenyen.png",
  'kimball-gwenyen': HOUSE_MOCHDAER_PORTRAITS['kimball-gwenyen'],
  'yvaine-gwenyen': HOUSE_TRACHWYLL_PORTRAITS['yvaine-gwenyen'],
  'maygann-gwenyen': "assets/images/portraits/haus-gwenyen/maygann-gwenyen.png",
  'llewellyn-gwenyen': "assets/images/portraits/haus-gwenyen/llewellyn-gwenyen.png"
});
