import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_GRENDEL_PORTRAITS } from './house-grendel-portraits.js';
import { HOUSE_GULLVIG_PORTRAITS } from './house-gullvig-portraits.js';
import { HOUSE_KUMMERHERZ_PORTRAITS } from './house-kummerherz-portraits.js';
import { HOUSE_SKALD_PORTRAITS } from './house-skald-portraits.js';
import { HOUSE_SOEKEREN_PORTRAITS } from './house-soekeren-portraits.js';
import { HOUSE_TRACHWYLL_PORTRAITS } from './house-trachwyll-portraits.js';
import { HOUSE_VAEREN_PORTRAITS } from './house-vaeren-portraits.js';
import { HOUSE_WELLENSCHILD_PORTRAITS } from './house-wellenschild-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-wellensaenger';

export const HOUSE_WELLENSAENGER_LOCAL_PORTRAIT_FILES = Object.freeze({
  'snorri-wellensaenger': 'snorri-wellensaenger.png',
  'hallvard-wellensaenger': 'hallvard-wellensaenger.png',
  'thorkel-sturmgeborener': 'thorkel-sturmgeborener.png',
  'castar-wellensaenger': 'castar-wellensaenger.png',
  'agnar-wellensaenger': 'agnar-wellensaenger.png',
  'eldgrim-wellensaenger': 'eldgrim-wellensaenger.png',
  'gustaf-wellensaenger': 'gustaf-wellensaenger.png',
  'drengur-wellensaenger': 'drengur-wellensaenger.png',
  'zyrek-wellensaenger': 'zyrek-wellensaenger.png',
  'bjartur-wellensaenger': 'bjartur-wellensaenger.png',
  'ulkfred-riesentod': 'ulkfred-riesentod.png',
  'uthar-wellensaenger': 'uthar-wellensaenger.png',
  'njalfr-wellensaenger': 'njalfr-wellensaenger.png',
  'ulrika-wellensaenger': 'ulrika-wellensaenger.png',
  'hordur-wellensaenger': 'hordur-wellensaenger.png',
  'maiken-wellensaenger': 'maiken-wellensaenger.png',
  'isfir-riesentod': 'isfir-riesentod.png',
  'siri-schneehammer': 'siri-schneehammer.png',
  'nodin-heldenruf': 'nodin-heldenruf.png',
  'sigrid-eisensang': 'sigrid-eisensang.png',
  'ulfrik-nordwind': 'ulfrik-nordwind.png',
  'njall-wellensaenger': 'njall-wellensaenger.png',
  'oksana-wellensaenger': 'oksana-wellensaenger.png',
  'isak-wellensaenger': 'isak-wellensaenger.png',
  'orm-wellensaenger': 'orm-wellensaenger.png',
  'rikka-wellensaenger': 'rikka-wellensaenger.png',
  'elrik-wellensaenger': 'elrik-wellensaenger.png',
  'arne-wellensaenger': 'arne-wellensaenger.png',
  'kaisa-wellensaenger': 'kaisa-wellensaenger.png'
});

export const HOUSE_WELLENSAENGER_PORTRAIT_SOURCES = Object.freeze({
  'snorri-wellensaenger': 'https://i.imgur.com/tUvGh9a.png',
  'hallvard-wellensaenger': 'https://i.imgur.com/ZHOaree.png',
  'thorkel-sturmgeborener': 'https://i.imgur.com/fJxCDx7.png',
  'castar-wellensaenger': 'https://i.imgur.com/rKBtA7T.png',
  'agnar-wellensaenger': 'https://i.imgur.com/iUZhbFY.png',
  'eldgrim-wellensaenger': 'https://i.imgur.com/SbdERss.png',
  'gustaf-wellensaenger': 'https://i.imgur.com/JODD2Gm.png',
  'drengur-wellensaenger': 'https://i.imgur.com/yJ6JVv3.png',
  'zyrek-wellensaenger': 'https://i.imgur.com/m68EIaD.png',
  'bjartur-wellensaenger': 'https://i.imgur.com/oWigMdu.png',
  'ulkfred-riesentod': 'https://i.imgur.com/17ImeHr.png',
  'uthar-wellensaenger': 'https://i.imgur.com/wxX2tUc.png',
  'njalfr-wellensaenger': 'https://i.imgur.com/ey22jzC.png',
  'ulrika-wellensaenger': 'https://i.imgur.com/V3egY3x.png',
  'hordur-wellensaenger': 'https://i.imgur.com/279iUk1.png',
  'maiken-wellensaenger': 'https://i.imgur.com/aJJLmgK.png',
  'isfir-riesentod': 'https://i.imgur.com/TDpkpLE.png',
  'siri-schneehammer': 'https://i.imgur.com/iyd4eJE.png',
  'nodin-heldenruf': 'https://i.imgur.com/JDFf7Mv.png',
  'sigrid-eisensang': 'https://i.imgur.com/Zvj9mv5.png',
  'ulfrik-nordwind': 'https://i.imgur.com/JNPjq4x.png',
  'njall-wellensaenger': 'https://i.imgur.com/g5cwqzA.png',
  'oksana-wellensaenger': 'https://i.imgur.com/HjW4ns2.png',
  'isak-wellensaenger': 'https://i.imgur.com/GCLBz6V.png',
  'orm-wellensaenger': 'https://i.imgur.com/w0ZUnL4.png',
  'rikka-wellensaenger': 'https://i.imgur.com/NTngkIm.png',
  'elrik-wellensaenger': 'https://i.imgur.com/APyDqLB.png',
  'arne-wellensaenger': 'https://i.imgur.com/QmyI8Op.png',
  'kaisa-wellensaenger': 'https://i.imgur.com/mKbzE01.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_WELLENSAENGER_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Wiederholte Standardsilhouetten bleiben echte Platzhalter. Bereits in einer
// Gegenakte kanonisierte Weltpersonen beziehen ihr Porträt aus genau dieser Akte.
export const HOUSE_WELLENSAENGER_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'gunnar-wellensaenger': HOUSE_WELLENSCHILD_PORTRAITS['gunnar-wellensaenger'],
  'siegthrygre-vaeren': HOUSE_VAEREN_PORTRAITS['siegthrygre-vaeren'],
  'skeld-gullvig': HOUSE_GULLVIG_PORTRAITS['skeld-gullvig'],
  'arthan-trachwyll': HOUSE_TRACHWYLL_PORTRAITS['arthan-trachwyll'],
  'bjoern-freiwinter': HOUSE_FREIWINTER_PORTRAITS['bjoern-freiwinter'],
  'hrothgar-soekeren': HOUSE_SOEKEREN_PORTRAITS['hrothgar-soekeren'],
  'fjorlag-wellensaenger': HOUSE_SKALD_PORTRAITS['fjorlag-wellensaenger'],
  'bryndis-skald': HOUSE_SKALD_PORTRAITS['bryndis-skald'],
  'ivana-wellensaenger': HOUSE_WELLENSCHILD_PORTRAITS['ivana-wellensaenger'],
  'asgeir-wellenschild': HOUSE_WELLENSCHILD_PORTRAITS['asgeir-wellenschild'],
  'bjarni-grendel': HOUSE_GRENDEL_PORTRAITS['bjarni-grendel'],
  'isaura-wellensaenger': HOUSE_KUMMERHERZ_PORTRAITS['isaura-wellensaenger']
});
