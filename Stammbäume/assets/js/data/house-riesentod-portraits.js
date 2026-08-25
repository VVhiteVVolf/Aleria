import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_GRAUMAHNE_PORTRAITS } from './house-graumahne-portraits.js';
import { HOUSE_GULLVIG_PORTRAITS } from './house-gullvig-portraits.js';
import { HOUSE_HELGR_PORTRAITS } from './house-helgr-portraits.js';
import { HOUSE_HYRMGARTHR_PORTRAITS } from './house-hyrmgarthr-portraits.js';
import { HOUSE_NACHTJAEGER_PORTRAITS } from './house-nachtjaeger-portraits.js';
import { HOUSE_SOEKEREN_PORTRAITS } from './house-soekeren-portraits.js';
import { HOUSE_VAEREN_PORTRAITS } from './house-vaeren-portraits.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';
import { HOUSE_WELLENSAENGER_PORTRAITS } from './house-wellensaenger-portraits.js';
import { HOUSE_WELLENSCHILD_PORTRAITS } from './house-wellenschild-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-riesentod';

export const HOUSE_RIESENTOD_LOCAL_PORTRAIT_FILES = Object.freeze({
  'leif-riesentod': 'leif-riesentod.png',
  'toste-riesentod': 'toste-riesentod.png',
  'modolf-riesentod': 'modolf-riesentod.png',
  'thialda-riesentod': 'thialda-riesentod.png',
  'eorlund-riesentod': 'eorlund-riesentod.png',
  'sigurd-sturmgeborener': 'sigurd-sturmgeborener.png',
  'ketill-riesentod': 'ketill-riesentod.png',
  'einarr-riesentod': 'einarr-riesentod.png',
  'erlend-sturmgeborener': 'erlend-sturmgeborener.png',
  'tormund-riesentod': 'tormund-riesentod.png',
  'yrgitte-frostauge': 'yrgitte-frostauge.png',
  'thrainn-riesentod': 'thrainn-riesentod.png',
  'thrand-riesentod': 'thrand-riesentod.png',
  'sigbjorn-riesentod': 'sigbjorn-riesentod.png',
  'zoltar-riesentod': 'zoltar-riesentod.png',
  'lodin-riesentod': 'lodin-riesentod.png',
  'poltar-riesentod': 'poltar-riesentod.png',
  'eola-riesentod': 'eola-riesentod.png',
  'isgerd-spindelschlag': 'isgerd-spindelschlag.png',
  'petar-riesentod': 'petar-riesentod.png',
  'carn-riesentod': 'carn-riesentod.png',
  'rag-riesentod': 'rag-riesentod.png',
  'lydia-riesentod': 'lydia-riesentod.png',
  'mjorn-riesentod': 'mjorn-riesentod.png',
  'ylkir-riesentod': 'ylkir-riesentod.png',
  'galmar-riesentod': 'galmar-riesentod.png',
  'gerdur-riesentod': 'gerdur-riesentod.png'
});

export const HOUSE_RIESENTOD_PORTRAIT_SOURCES = Object.freeze({
  'leif-riesentod': 'https://i.imgur.com/JkoEzZo.png',
  'toste-riesentod': 'https://i.imgur.com/eQuSFSo.png',
  'modolf-riesentod': 'https://i.imgur.com/2syJFU6.png',
  'thialda-riesentod': 'https://i.imgur.com/PmzsPrY.png',
  'eorlund-riesentod': 'https://i.imgur.com/RKBBmiF.png',
  'sigurd-sturmgeborener': 'https://i.imgur.com/PVtZ5dx.png',
  'ketill-riesentod': 'https://i.imgur.com/IGt0nwf.png',
  'einarr-riesentod': 'https://i.imgur.com/Mp7L3UJ.png',
  'erlend-sturmgeborener': 'https://i.imgur.com/Bc9vJZj.png',
  'tormund-riesentod': 'https://i.imgur.com/jIleE0u.png',
  'yrgitte-frostauge': 'https://i.postimg.cc/XvXQ1MTm/image.png',
  'thrainn-riesentod': 'https://i.imgur.com/zzAaiHj.png',
  'thrand-riesentod': 'https://i.imgur.com/IecTnpr.png',
  'sigbjorn-riesentod': 'https://i.imgur.com/YEtpOaB.png',
  'zoltar-riesentod': 'https://i.imgur.com/g17Q841.png',
  'lodin-riesentod': 'https://i.imgur.com/n9mvFCd.png',
  'poltar-riesentod': 'https://i.imgur.com/VVfChfP.png',
  'eola-riesentod': 'https://i.imgur.com/at1hKAE.png',
  'isgerd-spindelschlag': 'https://i.imgur.com/LQPejbZ.png',
  'petar-riesentod': 'https://i.imgur.com/TfRI7Sd.png',
  'carn-riesentod': 'https://i.imgur.com/7Pfambe.png',
  'rag-riesentod': 'https://i.imgur.com/A7nC4v1.png',
  'lydia-riesentod': 'https://i.imgur.com/cPVfMIF.png',
  'mjorn-riesentod': 'https://i.imgur.com/aOYoaPH.png',
  'ylkir-riesentod': 'https://i.imgur.com/uVePjGP.png',
  'galmar-riesentod': 'https://i.imgur.com/zxIgAON.png',
  'gerdur-riesentod': 'https://i.imgur.com/5YlmnC8.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_RIESENTOD_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle derselben
// Weltperson. Wiederholte schwarze Standardsilhouetten der Quelle werden nicht
// als vermeintliche Individualporträts importiert.
export const HOUSE_RIESENTOD_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'fjornir-graumahne': HOUSE_GRAUMAHNE_PORTRAITS['fjornir-graumahne'],
  'ulfar-graumahne': HOUSE_GRAUMAHNE_PORTRAITS['ulfar-graumahne'],
  'laufdis-soekeren': HOUSE_SOEKEREN_PORTRAITS['laufdis-soekeren'],
  'tonvar-riesentot': HOUSE_SOEKEREN_PORTRAITS['tonvar-riesentot'],
  'kolbjorn-wargh': HOUSE_WARGH_PORTRAITS['kolbjorn-wargh'],
  'ragnar-riesentot': HOUSE_FREIWINTER_PORTRAITS['ragnar-riesentot'],
  'ulfrik-vaeren': HOUSE_VAEREN_PORTRAITS['ulfrik-vaeren'],
  'elsa-riesentod': HOUSE_VAEREN_PORTRAITS['elsa-riesentod'],
  'zurik-eisenbieger': HOUSE_VAEREN_PORTRAITS['zurik-eisenbieger'],
  'hakon-riesentot': HOUSE_WELLENSCHILD_PORTRAITS['hakon-riesentot'],
  'sturlaugr-nachtjaeger': HOUSE_NACHTJAEGER_PORTRAITS['sturlaugr-nachtjaeger'],
  'hranvald-hyrmgardr': HOUSE_HYRMGARTHR_PORTRAITS['hranvald-hyrmgardr'],
  'ulkfred-riesentod': HOUSE_WELLENSAENGER_PORTRAITS['ulkfred-riesentod'],
  'torgeir-helgr': HOUSE_HELGR_PORTRAITS['torgeir-helgr'],
  'petka-riesentot': HOUSE_HELGR_PORTRAITS['petka-riesentot'],
  'skjor-vaeren': HOUSE_VAEREN_PORTRAITS['skjor-vaeren'],
  'fjola-riesentod': HOUSE_VAEREN_PORTRAITS['fjola-riesentod'],
  'askold-gullvig': HOUSE_GULLVIG_PORTRAITS['askold-gullvig'],
  'elsa-1696-riesentod': HOUSE_GULLVIG_PORTRAITS['elsa-1696-riesentod'],
  'uthar-wellensaenger': HOUSE_WELLENSAENGER_PORTRAITS['uthar-wellensaenger'],
  'isfir-riesentod': HOUSE_WELLENSAENGER_PORTRAITS['isfir-riesentod']
});
