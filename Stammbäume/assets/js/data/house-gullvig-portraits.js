import { HOUSE_BLUTSTAHL_PORTRAITS } from './house-blutstahl-portraits.js';
import { HOUSE_FEUERHAAR_PORTRAITS } from './house-feuerhaar-portraits.js';
import { HOUSE_GRENDEL_PORTRAITS } from './house-grendel-portraits.js';
import { HOUSE_KUMMERHERZ_PORTRAITS } from './house-kummerherz-portraits.js';
import { HOUSE_SCHWARZBLUT_PORTRAITS } from './house-schwarzblut-portraits.js';
import { HOUSE_STERKR_PORTRAITS } from './house-sterkr-portraits.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';
import { HOUSE_WELLENSCHILD_PORTRAITS } from './house-wellenschild-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-gullvig';

export const HOUSE_GULLVIG_LOCAL_PORTRAIT_FILES = Object.freeze({
  'sten-gullvig': 'sten-gullvig.png',
  'jorvik-gullvig': 'jorvik-gullvig.png',
  'norrik-gullvig': 'norrik-gullvig.png',
  'skeld-gullvig': 'skeld-gullvig.png',
  'sven-gullvig': 'sven-gullvig.png',
  'orrek-gullvig': 'orrek-gullvig.png',
  'detlaf-1629-gullvig': 'detlaf-1629-gullvig.png',
  'tjodrik-gullvig': 'tjodrik-gullvig.png',
  'vetrar-gullvig': 'vetrar-gullvig.png',
  'freki-eisenbieger': 'freki-eisenbieger.png',
  'inghard-frostauge': 'inghard-frostauge.png',
  'askold-gullvig': 'askold-gullvig.png',
  'elsa-1696-riesentod': 'elsa-1696-riesentod.png',
  'barni-gullvig': 'barni-gullvig.png',
  'gulla-gullvig': 'gulla-gullvig.png',
  'fiosa-gullvig': 'fiosa-gullvig.png'
});

export const HOUSE_GULLVIG_PORTRAIT_SOURCES = Object.freeze({
  'sten-gullvig': 'https://i.imgur.com/uLfTSGw.png',
  'jorvik-gullvig': 'https://i.imgur.com/u90L30B.png',
  'norrik-gullvig': 'https://i.imgur.com/7LlDIE9.png',
  'skeld-gullvig': 'https://i.imgur.com/NGJS6xc.png',
  'sven-gullvig': 'https://i.imgur.com/lm3v1BS.png',
  'orrek-gullvig': 'https://i.imgur.com/X5woywn.png',
  'detlaf-1629-gullvig': 'https://i.imgur.com/a5jhMI7.png',
  'tjodrik-gullvig': 'https://i.imgur.com/oWEm747.png',
  'vetrar-gullvig': 'https://i.imgur.com/o4HdGo5.png',
  'freki-eisenbieger': 'https://i.imgur.com/7nkBLlq.png',
  'inghard-frostauge': 'https://i.postimg.cc/7PVTsqzX/image.png',
  'askold-gullvig': 'https://i.imgur.com/ma8w95n.png',
  'elsa-1696-riesentod': 'https://i.imgur.com/VGKhoc3.png',
  'barni-gullvig': 'https://i.imgur.com/J4V0hKq.png',
  'gulla-gullvig': 'https://i.imgur.com/M14g7st.png',
  'fiosa-gullvig': 'https://i.imgur.com/JRbGMXp.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_GULLVIG_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Standardsilhouetten der Quelle bleiben echte Platzhalter. Weltpersonen aus
// Gegenakten verwenden immer das dort bereits kanonische Porträt.
export const HOUSE_GULLVIG_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'detlaf-schwarzblut': HOUSE_SCHWARZBLUT_PORTRAITS['detlaf-schwarzblut'],
  'jorleif-gullvig': HOUSE_WELLENSCHILD_PORTRAITS['jorleif-gullvig'],
  'thordis-wellenschild': HOUSE_WELLENSCHILD_PORTRAITS['thordis-wellenschild'],
  'ubbe-sterkr': HOUSE_STERKR_PORTRAITS['ubbe-sterkr'],
  'holgr-blutstahl': HOUSE_BLUTSTAHL_PORTRAITS['holgr-blutstahl'],
  'udveig-gullvig': HOUSE_BLUTSTAHL_PORTRAITS['udveig-gullvig'],
  'estrid-grendel': HOUSE_GRENDEL_PORTRAITS['estrid-grendel'],
  'grimleik-gullvig': HOUSE_GRENDEL_PORTRAITS['grimleik-gullvig'],
  'nattfar-gullvig': HOUSE_KUMMERHERZ_PORTRAITS['nattfar-gullvig'],
  'njaldis-kummerherz': HOUSE_KUMMERHERZ_PORTRAITS['njaldis-kummerherz'],
  'olmar-wargh': HOUSE_WARGH_PORTRAITS['olmar-wargh'],
  'asahel-gullvig': HOUSE_WARGH_PORTRAITS['asahel-gullvig'],
  'aksel-gullvig': HOUSE_SCHWARZBLUT_PORTRAITS['aksel-gullvig'],
  'svantje-schwarzblut': HOUSE_SCHWARZBLUT_PORTRAITS['svantje-schwarzblut'],
  'magni-gullvig': HOUSE_FEUERHAAR_PORTRAITS['magni-gullvig']
});
