import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_GWAEDLYD_PORTRAITS } from './house-gwaedlyd-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { HOUSE_MORFIL_PORTRAITS } from './house-morfil-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-lyfant';

export const HOUSE_LYFANT_LOCAL_PORTRAIT_FILES = Object.freeze({
  'conan-founder-lyfant': 'conan-founder-lyfant.png',
  'gareth-lyfant': 'gareth-lyfant.png',
  'macsen-lyfant': 'macsen-lyfant.png',
  'tomos-lyfant': 'tomos-lyfant.png',
  'anarawd-gwenyen': 'anarawd-gwenyen.png',
  'wynfor-crwynog': 'wynfor-crwynog.png',
  'mared-lyfant': 'mared-lyfant.png',
  'cadwgan-lyfant': 'cadwgan-lyfant.png',
  'meredydd-lyfant': 'meredydd-lyfant.png',
  'teudebur-cwningod': 'teudebur-cwningod.jpg',
  'neila-serenoc': 'neila-serenoc.png',
  'edlym-blodeuwedd': 'edlym-blodeuwedd.png',
  'owain-gwenyen': 'owain-gwenyen.png',
  'rhisiart-lyfant': 'rhisiart-lyfant.png',
  'goronwy-lyfant': 'goronwy-lyfant.png',
  'bethan-lyfant': 'bethan-lyfant.png',
  'yale-lyfant': 'yale-lyfant.png',
  'deiniol-lyfant': 'deiniol-lyfant.png',
  'pryderi-walwrs': 'pryderi-walwrs.jpg',
  'morgana-arfordir': 'morgana-arfordir.png',
  'conan-young-lyfant': 'conan-young-lyfant.png',
  'heulwen-lyfant': 'heulwen-lyfant.png',
  'derfel-lyfant': 'derfel-lyfant.png',
  'cybi-lyfant': 'cybi-lyfant.png',
  'crispin-lyfant': 'crispin-lyfant.png',
  'eilin-lyfant': 'eilin-lyfant.png',
  'ceri-lyfant': 'ceri-lyfant.png',
  'cadi-lyfant': 'cadi-lyfant.png'
});

export const HOUSE_LYFANT_PORTRAIT_SOURCES = Object.freeze({
  'conan-founder-lyfant': 'https://i.imgur.com/51CghpL.png',
  'gareth-lyfant': 'https://i.imgur.com/bc3XfYp.png',
  'macsen-lyfant': 'https://i.imgur.com/rgu9Hgv.png',
  'tomos-lyfant': 'https://i.imgur.com/eRkTL6a.png',
  'anarawd-gwenyen': 'https://i.imgur.com/ekhswcS.png',
  'wynfor-crwynog': 'https://i.imgur.com/5ZzAplF.png',
  'mared-lyfant': 'https://i.imgur.com/1Udlyu2.png',
  'cadwgan-lyfant': 'https://i.imgur.com/JVVZGhA.png',
  'meredydd-lyfant': 'https://i.imgur.com/nInQImq.png',
  'teudebur-cwningod': 'https://64.media.tumblr.com/093660625bf467e8e3c1fc623eb92ee9/ede4c143dc24726b-f0/s250x400/7fb2f7d5caf4bec29bef4271f5826e96d207814d.pnj',
  'neila-serenoc': 'https://i.imgur.com/5AoilgM.png',
  'edlym-blodeuwedd': 'https://i.imgur.com/A2HQTVI.png',
  'owain-gwenyen': 'https://i.imgur.com/b5Ot2CP.png',
  'rhisiart-lyfant': 'https://i.imgur.com/CY2drBW.png',
  'goronwy-lyfant': 'https://i.imgur.com/XLXOfbH.png',
  'bethan-lyfant': 'https://i.imgur.com/baTkjCM.png',
  'yale-lyfant': 'https://i.imgur.com/8klAupi.png',
  'deiniol-lyfant': 'https://i.imgur.com/WXKCV8c.png',
  'pryderi-walwrs': 'https://64.media.tumblr.com/175823138f5f980f518d0c7045da8e9c/5cb9705b68b3ce6b-ca/s250x400/f9961d13238a3391d4fde189228c4b33f8889191.pnj',
  'morgana-arfordir': 'https://i.imgur.com/X4AF5ac.png',
  'conan-young-lyfant': 'https://i.imgur.com/gZ54EuW.png',
  'heulwen-lyfant': 'https://i.imgur.com/8Q1pvuu.png',
  'derfel-lyfant': 'https://i.imgur.com/HoteBwe.png',
  'cybi-lyfant': 'https://i.imgur.com/TDsxkay.png',
  'crispin-lyfant': 'https://i.imgur.com/r1jGACa.png',
  'eilin-lyfant': 'https://i.imgur.com/VvnrFwq.png',
  'ceri-lyfant': 'https://i.imgur.com/rlnJXfn.png',
  'cadi-lyfant': 'https://i.imgur.com/qSUibaK.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_LYFANT_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle. Die vom
// Nutzer als veraltet markierten Bilder für Agnes, Gunhild Eisenbieger, Aine
// Drummond, Gereint Drewi und Dafydd Trachwyll werden bewusst nicht importiert.
export const HOUSE_LYFANT_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'main-trachwyll': 'assets/images/portraits/haus-trachwyll/main-trachwyll.jpg',
  'catryn-llyfant': HOUSE_BLODYN_PORTRAITS['catryn-llyfant'],
  'gruffydd-blodyn': HOUSE_BLODYN_PORTRAITS['gruffydd-blodyn'],
  'cledwyn-lyfant': HOUSE_MOCHDAER_PORTRAITS['cledwyn-lyfant'],
  'rhosyn-mochdaer': HOUSE_MOCHDAER_PORTRAITS['rhosyn-mochdaer'],
  'eilun-llyfant': HOUSE_MORFIL_PORTRAITS['eilun-llyfant'],
  'guto-morfil': HOUSE_MORFIL_PORTRAITS['guto-morfil'],
  'frewi-llyfant': HOUSE_GWAEDLYD_PORTRAITS['frewi-llyfant'],
  'uryen-gwaedlyd': HOUSE_GWAEDLYD_PORTRAITS['uryen-gwaedlyd']
});
