import { HOUSE_EISENBIEGER_PORTRAITS } from './house-eisenbieger-portraits.js';
import { HOUSE_GRENDEL_PORTRAITS } from './house-grendel-portraits.js';
import { HOUSE_GULLVIG_PORTRAITS } from './house-gullvig-portraits.js';
import { HOUSE_RIESENTOD_PORTRAITS } from './house-riesentod-portraits.js';
import { HOUSE_SCHWARZBLUT_PORTRAITS } from './house-schwarzblut-portraits.js';
import { HOUSE_SCHWARZDORN_PORTRAITS } from './house-schwarzdorn-portraits.js';
import { HOUSE_SKALD_PORTRAITS } from './house-skald-portraits.js';
import { HOUSE_STURMGEBORENE_PORTRAITS } from './house-sturmgeborene-portraits.js';
import { HOUSE_TRACHWYLL_PORTRAITS } from './house-trachwyll-portraits.js';
import { HOUSE_VAEREN_PORTRAITS } from './house-vaeren-portraits.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';
import { HOUSE_WELLENSAENGER_PORTRAITS } from './house-wellensaenger-portraits.js';
import { HOUSE_WELLENSCHILD_PORTRAITS } from './house-wellenschild-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-frostauge';

// Nur Bilder ohne bereits bestehende kanonische Gegenakte werden hier lokal
// geführt. Angeheiratete und schon andernorts registrierte Frostaugen beziehen
// ihr Porträt aus der jeweiligen Herkunftsakte.
export const HOUSE_FROSTAUGE_LOCAL_PORTRAIT_FILES = Object.freeze({
  'thorfinn-frostauge': 'thorfinn-frostauge.png',
  'benjen-frostauge': 'benjen-frostauge.png',
  'eldric-frostauge': 'eldric-frostauge.png',
  'ragnar-frostauge': 'ragnar-frostauge.png',
  'vorn-frostauge': 'vorn-frostauge.png',
  'frideborg-frostauge': 'frideborg-frostauge.png',
  'fjorgynn-frostauge': 'fjorgynn-frostauge.png',
  'malfrid-frostauge': 'malfrid-frostauge.png',
  'lykke-frostauge': 'lykke-frostauge.png',
  'hler-frostauge': 'hler-frostauge.png',
  'garm-frostauge': 'garm-frostauge.png',
  'gymir-frostauge': 'gymir-frostauge.png',
  'kael-frostauge': 'kael-frostauge.png',
  'unna-frostauge': 'unna-frostauge.png',
  'ysa-frostauge': 'ysa-frostauge.png',
  'lysild-frostauge': 'lysild-frostauge.png',
  'nanna-frostauge': 'nanna-frostauge.png'
});

export const HOUSE_FROSTAUGE_PORTRAIT_SOURCES = Object.freeze({
  'thorfinn-frostauge': 'https://i.imgur.com/aQQTVqm.png',
  'benjen-frostauge': 'https://i.imgur.com/DfZWggm.png',
  'eldric-frostauge': 'https://i.imgur.com/bvSsD0s.png',
  'ragnar-frostauge': 'https://i.imgur.com/voQ0dvr.png',
  'vorn-frostauge': 'https://i.imgur.com/4fkF2Bp.png',
  'frideborg-frostauge': 'https://i.imgur.com/h36p8jP.png',
  'fjorgynn-frostauge': 'https://i.imgur.com/mXexDPX.png',
  'malfrid-frostauge': 'https://i.postimg.cc/5NZ2DPVN/image.png',
  'lykke-frostauge': 'https://i.imgur.com/CHrJkAm.png',
  'hler-frostauge': 'https://i.imgur.com/ob3YThE.png',
  'garm-frostauge': 'https://i.imgur.com/D8QLszY.png',
  'gymir-frostauge': 'https://i.postimg.cc/VvMwmgYL/fbe9e993-e2ba-4bc8-85b7-71e2aebbbac6.png',
  'kael-frostauge': 'https://i.imgur.com/0MYU3aP.png',
  'unna-frostauge': 'https://i.postimg.cc/qqY9h3vS/image.png',
  'ysa-frostauge': 'https://i.postimg.cc/cCqzdN9X/image.png',
  'lysild-frostauge': 'https://i.postimg.cc/QM2mTJQH/image.png',
  'nanna-frostauge': 'https://i.postimg.cc/28CDW4Tz/image.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_FROSTAUGE_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_FROSTAUGE_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'hrolfr-frostauge': HOUSE_EISENBIEGER_PORTRAITS['hrolfr-frostauge'],
  'bergdis-eisenbieger': HOUSE_EISENBIEGER_PORTRAITS['bergdis-eisenbieger'],
  'lathgertha-frostauge': HOUSE_WELLENSAENGER_PORTRAITS['lathgertha-frostauge'],
  'hallvard-wellensaenger': HOUSE_WELLENSAENGER_PORTRAITS['hallvard-wellensaenger'],
  'yrsa-frostauge': HOUSE_STURMGEBORENE_PORTRAITS['yrsa-frostauge'],
  'sverre-sturmgeborener': HOUSE_STURMGEBORENE_PORTRAITS['sverre-sturmgeborener'],
  'leifric-frostauge': HOUSE_TRACHWYLL_PORTRAITS['leifric-frostauge'],
  'alawen-trachwyll': HOUSE_TRACHWYLL_PORTRAITS['alawen-trachwyll'],
  'snorri-frostauge': HOUSE_STURMGEBORENE_PORTRAITS['snorri-frostauge'],
  'cyneleif-frostauge': HOUSE_EISENBIEGER_PORTRAITS['cyneleif-frostauge'],
  'ranveig-sturmgeborene': HOUSE_STURMGEBORENE_PORTRAITS['ranveig-sturmgeborene'],
  'mirja-eisenbieger': HOUSE_EISENBIEGER_PORTRAITS['mirja-eisenbieger'],
  'halfdan-skald': HOUSE_SKALD_PORTRAITS['halfdan-skald'],
  'othrik-wellenschild': HOUSE_WELLENSCHILD_PORTRAITS['othrik-wellenschild'],
  'gunnleik-varulv': HOUSE_VARULV_PORTRAITS['gunnleik-varulv'],
  'njord-frostauge': HOUSE_GRENDEL_PORTRAITS['njord-frostauge'],
  'nott-grendel': HOUSE_GRENDEL_PORTRAITS['nott-grendel'],
  'yrgitte-frostauge': HOUSE_RIESENTOD_PORTRAITS['yrgitte-frostauge'],
  'tormund-riesentod': HOUSE_RIESENTOD_PORTRAITS['tormund-riesentod'],
  'aegir-frostauge': HOUSE_SCHWARZBLUT_PORTRAITS['aegir-frostauge'],
  'alta-schwarzblut': HOUSE_SCHWARZBLUT_PORTRAITS['alta-schwarzblut'],
  'egberta-frostauge': HOUSE_SCHWARZDORN_PORTRAITS['egberta-frostauge'],
  'tjudmund-schwarzdorn': HOUSE_SCHWARZDORN_PORTRAITS['tjudmund-schwarzdorn'],
  'inghard-frostauge': HOUSE_GULLVIG_PORTRAITS['inghard-frostauge'],
  'eldrid-gullvig': HOUSE_GULLVIG_PORTRAITS['eldrid-gullvig'],
  'freydis-frostauge': HOUSE_VAEREN_PORTRAITS['freydis-frostauge'],
  'sigurd-vaeren': HOUSE_VAEREN_PORTRAITS['sigurd-vaeren'],
  'gangr-frostauge': HOUSE_EISENBIEGER_PORTRAITS['gangr-frostauge'],
  'gerda-eisenbieger': HOUSE_EISENBIEGER_PORTRAITS['gerda-eisenbieger'],
  'johild-frostauge': HOUSE_STURMGEBORENE_PORTRAITS['johild-frostauge'],
  'runar-1694-sturmgeborener': HOUSE_STURMGEBORENE_PORTRAITS['runar-1694-sturmgeborener'],
  'gardar-frostauge': HOUSE_STURMGEBORENE_PORTRAITS['gardar-frostauge'],
  'dagfrid-sturmgeborene': HOUSE_STURMGEBORENE_PORTRAITS['dagfrid-sturmgeborene']
});
