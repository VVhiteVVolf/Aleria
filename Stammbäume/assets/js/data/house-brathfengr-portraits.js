import { HOUSE_CEIRWYN_PORTRAITS } from './house-ceirwyn-portraits.js';
import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_ILLYSYWEN_PORTRAITS } from './house-illysywen-portraits.js';
import { HOUSE_KAMPFGEBORENE_PORTRAITS } from './house-kampfgeborene-portraits.js';
import { HOUSE_NACHTJAEGER_PORTRAITS } from './house-nachtjaeger-portraits.js';
import { HOUSE_SCHWARZDORN_PORTRAITS } from './house-schwarzdorn-portraits.js';
import { HOUSE_SKAAL_PORTRAITS } from './house-skaal-portraits.js';
import { HOUSE_SKJEGG_PORTRAITS } from './house-skjegg-portraits.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-brathfengr';

export const HOUSE_BRATHFENGR_LOCAL_PORTRAIT_FILES = Object.freeze({
  'kvasir-founder-brathfengr': 'kvasir-founder-brathfengr.png',
  'tryggvar-brathfengr': 'tryggvar-brathfengr.png',
  'ragnfred-sterkr': 'ragnfred-sterkr.png',
  'bjarn-brathfengr': 'bjarn-brathfengr.png',
  'ingjald-brathfengr': 'ingjald-brathfengr.png',
  'valir-brathfengr': 'valir-brathfengr.png',
  'sigurd-brathfengr': 'sigurd-brathfengr.png',
  'hvitserk-soekeren': 'hvitserk-soekeren.png',
  'ingthor-varangr': 'ingthor-varangr.png',
  'munthor-brathfengr': 'munthor-brathfengr.png',
  'glodis-skald': 'glodis-skald.png',
  'isbjalla-1696-brathfengr': 'isbjalla-1696-brathfengr.png',
  'dagrun-brathfengr': 'dagrun-brathfengr.png',
  'lova-brathfengr': 'lova-brathfengr.png',
  'hallbera-brathfengr': 'hallbera-brathfengr.png',
  'solja-brathfengr': 'solja-brathfengr.png',
  'asta-brathfengr': 'asta-brathfengr.png',
  'blenda-brathfengr': 'blenda-brathfengr.png',
  'inga-brathfengr': 'inga-brathfengr.png',
  'kvasir-1730-brathfengr': 'kvasir-1730-brathfengr.png',
  'rognvaldr-sterkr': 'rognvaldr-sterkr.png',
  'balrun-soekeren': 'balrun-soekeren.png'
});

export const HOUSE_BRATHFENGR_PORTRAIT_SOURCES = Object.freeze({
  'kvasir-founder-brathfengr': 'https://i.imgur.com/d7slAih.png',
  'tryggvar-brathfengr': 'https://i.imgur.com/TyPbMDW.png',
  'ragnfred-sterkr': 'https://i.postimg.cc/8zKq7VGn/image.png',
  'bjarn-brathfengr': 'https://i.imgur.com/C1d0joW.png',
  'ingjald-brathfengr': 'https://i.imgur.com/3zTp8xd.png',
  'valir-brathfengr': 'https://i.imgur.com/p6yqFDN.png',
  'sigurd-brathfengr': 'https://i.imgur.com/qzN3CJQ.png',
  'hvitserk-soekeren': 'https://i.imgur.com/MaU8DxK.png',
  'ingthor-varangr': 'https://i.imgur.com/cusBmXn.png',
  'munthor-brathfengr': 'https://i.imgur.com/GC01HBg.png',
  'glodis-skald': 'https://i.imgur.com/EMp5sMg.png',
  'isbjalla-1696-brathfengr': 'https://i.imgur.com/CFvYcZO.png',
  'dagrun-brathfengr': 'https://i.imgur.com/S5O6X9G.png',
  'lova-brathfengr': 'https://i.imgur.com/ZrSmBf9.png',
  'hallbera-brathfengr': 'https://i.imgur.com/lvRjseY.png',
  'solja-brathfengr': 'https://i.imgur.com/zAwimxe.png',
  'asta-brathfengr': 'https://i.imgur.com/xrIISVL.png',
  'blenda-brathfengr': 'https://i.imgur.com/4luv5wM.png',
  'inga-brathfengr': 'https://i.imgur.com/myxHafB.png',
  'kvasir-1730-brathfengr': 'https://i.imgur.com/UKGvvUK.png',
  'rognvaldr-sterkr': 'https://i.postimg.cc/NjYRw7t8/image.png',
  'balrun-soekeren': 'https://i.imgur.com/GSx31vw.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_BRATHFENGR_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Weltpersonen, die bereits in einer Gegenakte vorkommen, verwenden auch hier
// deren kanonisches Porträt. Die vielfach wiederholte Standardsilhouette der
// Alttabelle wird bewusst nicht als individuelles Bild importiert.
export const HOUSE_BRATHFENGR_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'gefjon-skald': 'assets/images/portraits/haus-skald/gefjon-skald.png',
  'fannarr-varulv': HOUSE_VARULV_PORTRAITS['fannarr-varulv'],
  'gunnar-nachtjaeger': HOUSE_NACHTJAEGER_PORTRAITS['gunnar-nachtjaeger'],
  'erling-varulv': HOUSE_VARULV_PORTRAITS['erling-varulv'],
  'hakon-skjegg': HOUSE_SKJEGG_PORTRAITS['hakon-skjegg'],
  'halstein-brathfengr': HOUSE_FREIWINTER_PORTRAITS['halstein-brathfengr'],
  'skjold-brathfengr': HOUSE_SKAAL_PORTRAITS['skjold-brathfengr'],
  'halstein-kampfgeborene': HOUSE_KAMPFGEBORENE_PORTRAITS['halstein-kampfgeborene'],
  'irnskar-brathfengr': HOUSE_CEIRWYN_PORTRAITS['irnskar-brathfengr'],
  'merlion-ceirwyn': HOUSE_CEIRWYN_PORTRAITS['merlion-ceirwyn'],
  'vorna-brathfengr': HOUSE_VARULV_PORTRAITS['vorna-brathfengr'],
  'gunhild-varulv': HOUSE_VARULV_PORTRAITS['gunhild-varulv'],
  'dagny-brathfengr': HOUSE_ILLYSYWEN_PORTRAITS['dagny-brathfengr'],
  'nodawl-illysywen': HOUSE_ILLYSYWEN_PORTRAITS['nodawl-illysywen'],
  'hildigunn-brathfengr': HOUSE_SCHWARZDORN_PORTRAITS['hildigunn-brathfengr'],
  'hoskuld-schwarzdorn': HOUSE_SCHWARZDORN_PORTRAITS['hoskuld-schwarzdorn']
});
