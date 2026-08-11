import { HOUSE_BRATHFENGR_PORTRAITS } from './house-brathfengr-portraits.js';
import { HOUSE_CEIRWYN_PORTRAITS } from './house-ceirwyn-portraits.js';
import { HOUSE_KAMPFGEBORENE_PORTRAITS } from './house-kampfgeborene-portraits.js';
import { HOUSE_SKAAL_PORTRAITS } from './house-skaal-portraits.js';
import { HOUSE_SKJEGG_PORTRAITS } from './house-skjegg-portraits.js';
import { HOUSE_STERKR_PORTRAITS } from './house-sterkr-portraits.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-soekeren';

export const HOUSE_SOEKEREN_LOCAL_PORTRAIT_FILES = Object.freeze({
  'forseti-soekeren-founder': 'forseti-soekeren-founder.png',
  'sturlaug-soekeren': 'sturlaug-soekeren.png',
  'laufdis-soekeren': 'laufdis-soekeren.png',
  'tonvar-riesentot': 'tonvar-riesentot.png',
  'kjartan-soekeren': 'kjartan-soekeren.png',
  'horik-soekeren': 'horik-soekeren.png',
  'hrothgar-soekeren': 'hrothgar-soekeren.png',
  'thorlak-soekeren': 'thorlak-soekeren.png',
  'rikke-soekeren': 'rikke-soekeren.png',
  'skjomi-soekeren': 'skjomi-soekeren.png',
  'ulfrik-skald': 'ulfrik-skald.png',
  'skjalm-soekeren': 'skjalm-soekeren.png',
  'skorri-soekeren': 'skorri-soekeren.png',
  'kjallak-soekeren': 'kjallak-soekeren.png',
  'hjordis-skald': 'hjordis-skald.png',
  'ljot-soekeren': 'ljot-soekeren.png',
  'mjoll-soekeren': 'mjoll-soekeren.jpeg',
  'hermund-soekeren': 'hermund-soekeren.png',
  'hroald-soekeren': 'hroald-soekeren.png',
  'lif-soekeren': 'lif-soekeren.png'
});

export const HOUSE_SOEKEREN_PORTRAIT_SOURCES = Object.freeze({
  'forseti-soekeren-founder': 'https://i.imgur.com/c2XLNyd.png',
  'sturlaug-soekeren': 'https://i.imgur.com/qKT9v94.png',
  'laufdis-soekeren': 'https://i.imgur.com/KAgoVJu.png',
  'tonvar-riesentot': 'https://i.imgur.com/ECkGbLR.png',
  'kjartan-soekeren': 'https://i.imgur.com/0oVcBlO.png',
  'horik-soekeren': 'https://i.imgur.com/xCz02LL.png',
  'hrothgar-soekeren': 'https://i.imgur.com/H8qVgTK.png',
  'thorlak-soekeren': 'https://i.imgur.com/gUmZlD8.png',
  'rikke-soekeren': 'https://i.imgur.com/E8XTTKO.png',
  'skjomi-soekeren': 'https://i.imgur.com/J2qnWXe.png',
  'ulfrik-skald': 'https://i.imgur.com/RtyDBiR.png',
  'skjalm-soekeren': 'https://i.imgur.com/mUMIkoH.png',
  'skorri-soekeren': 'https://i.imgur.com/WPoWTqS.png',
  'kjallak-soekeren': 'https://i.imgur.com/usJWlUK.png',
  'hjordis-skald': 'https://i.imgur.com/9lQCQoH.png',
  'ljot-soekeren': 'https://i.imgur.com/x7wfBxW.png',
  'mjoll-soekeren': 'https://i.imgur.com/WVbb3Qz.jpeg',
  'hermund-soekeren': 'https://i.imgur.com/ZcL9XDL.png',
  'hroald-soekeren': 'https://i.imgur.com/zOMB7eh.png',
  'lif-soekeren': 'https://i.imgur.com/CLmzcfJ.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_SOEKEREN_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle derselben
// Weltperson. Die wiederholt verwendete schwarze Standardsilhouette der
// Alttabelle wird nicht als individuelles Porträt importiert.
export const HOUSE_SOEKEREN_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'sjofn-skald': 'assets/images/portraits/haus-skald/sjofn-skald.png',
  'aegir-kampfgeborene': HOUSE_KAMPFGEBORENE_PORTRAITS['aegir-kampfgeborene'],
  'hallgerd-soekeren': HOUSE_KAMPFGEBORENE_PORTRAITS['hallgerd-soekeren'],
  'hvitserk-soekeren': HOUSE_BRATHFENGR_PORTRAITS['hvitserk-soekeren'],
  'gruffudd-ceirwyn': HOUSE_CEIRWYN_PORTRAITS['gruffudd-ceirwyn'],
  'magnhild-sokaren': HOUSE_CEIRWYN_PORTRAITS['magnhild-sokaren'],
  'langarr-soekeren': HOUSE_STERKR_PORTRAITS['langarr-soekeren'],
  'skadi-sterkr': HOUSE_STERKR_PORTRAITS['skadi-sterkr'],
  'halfdan-skjegg': HOUSE_SKJEGG_PORTRAITS['halfdan-skjegg'],
  'steinarr-varulv': HOUSE_VARULV_PORTRAITS['steinarr-varulv'],
  'aslaug-soekeren': HOUSE_VARULV_PORTRAITS['aslaug-soekeren'],
  'balrun-soekeren': HOUSE_BRATHFENGR_PORTRAITS['balrun-soekeren'],
  'dagrun-brathfengr': HOUSE_BRATHFENGR_PORTRAITS['dagrun-brathfengr'],
  'sven-skaal': HOUSE_SKAAL_PORTRAITS['sven-skaal'],
  'runa-soekaren': HOUSE_SKAAL_PORTRAITS['runa-soekaren'],
  'dagonet-ceirwyn': HOUSE_CEIRWYN_PORTRAITS['dagonet-ceirwyn'],
  'liska-sokaren': HOUSE_CEIRWYN_PORTRAITS['liska-sokaren']
});
