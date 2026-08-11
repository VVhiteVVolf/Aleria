import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_SKJEGG_PORTRAITS } from './house-skjegg-portraits.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-skaal';

export const HOUSE_SKAAL_LOCAL_PORTRAIT_FILES = Object.freeze({
  'thor-skaal-founder': 'thor-skaal-founder.png',
  'sif-skaal-founder': 'sif-skaal-founder.png',
  'hjalmar-skaal': 'hjalmar-skaal.png',
  'asmund-skaal': 'asmund-skaal.png',
  'ottnar-kampfgeborener': 'ottnar-kampfgeborener.png',
  'svanhild-skaal': 'svanhild-skaal.png',
  'bjoern-vaeren': 'bjoern-vaeren.png',
  'ofeig-skaal': 'ofeig-skaal.png',
  'hogne-wargh': 'hogne-wargh.png',
  'steinarr-skaal': 'steinarr-skaal.png',
  'sigmund-skaal': 'sigmund-skaal.png',
  'skjold-brathfengr': 'skjold-brathfengr.png',
  'sigvard-skaal': 'sigvard-skaal.png',
  'thrand-skaal': 'thrand-skaal.png',
  'ketill-skald': 'ketill-skald.png',
  'gunnar-feuerhaar': 'gunnar-feuerhaar.png',
  'sigurd-skaal': 'sigurd-skaal.jpeg',
  'sjovald-skaal': 'sjovald-skaal.png',
  'sven-skaal': 'sven-skaal.png',
  'baldvin-skaal': 'baldvin-skaal.png',
  'hardar-skaal': 'hardar-skaal.png',
  'dagny-helgr': 'dagny-helgr.png',
  'runa-soekaren': 'runa-soekaren.png',
  'brynja-skaal': 'brynja-skaal.png',
  'jorah-skaal': 'jorah-skaal.png',
  'juna-skaal': 'juna-skaal.png',
  'duna-skaal': 'duna-skaal.png',
  'dora-skaal': 'dora-skaal.png',
  'olaf-skaal': 'olaf-skaal.png',
  'ivar-skaal': 'ivar-skaal.png',
  'knut-skaal': 'knut-skaal.jpeg'
});

export const HOUSE_SKAAL_PORTRAIT_SOURCES = Object.freeze({
  'thor-skaal-founder': 'https://i.imgur.com/rr1ZcpE.png',
  'sif-skaal-founder': 'https://i.imgur.com/w7oNGqr.png',
  'hjalmar-skaal': 'https://i.imgur.com/cGWdXGM.png',
  'asmund-skaal': 'https://i.imgur.com/U6YC5Aq.png',
  'ottnar-kampfgeborener': 'https://i.imgur.com/hryBhbL.png',
  'svanhild-skaal': 'https://i.imgur.com/WWEFky7.png',
  'bjoern-vaeren': 'https://i.imgur.com/XePiyOa.png',
  'ofeig-skaal': 'https://i.imgur.com/1B5Wct2.png',
  'hogne-wargh': 'https://i.imgur.com/bs4RtBE.png',
  'steinarr-skaal': 'https://i.imgur.com/OISLsc4.png',
  'sigmund-skaal': 'https://i.imgur.com/zQhPtmY.png',
  'skjold-brathfengr': 'https://i.imgur.com/oLEFv2b.png',
  'sigvard-skaal': 'https://i.imgur.com/9I3U6tD.png',
  'thrand-skaal': 'https://i.imgur.com/ZQXvJ5g.png',
  'ketill-skald': 'https://i.imgur.com/49sD2kI.png',
  'gunnar-feuerhaar': 'https://i.imgur.com/GeCwqaL.png',
  'sigurd-skaal': 'https://i.imgur.com/hWGHAoC.jpeg',
  'sjovald-skaal': 'https://i.imgur.com/seFbY5J.png',
  'sven-skaal': 'https://i.imgur.com/uyof3XM.png',
  'baldvin-skaal': 'https://i.imgur.com/tUe3k3F.png',
  'hardar-skaal': 'https://i.imgur.com/avQn7Lx.png',
  'dagny-helgr': 'https://i.imgur.com/rWl5I0F.png',
  'runa-soekaren': 'https://i.imgur.com/a6RXVra.png',
  'brynja-skaal': 'https://i.imgur.com/PygWBBe.png',
  'jorah-skaal': 'https://i.imgur.com/yPb8qRh.png',
  'juna-skaal': 'https://i.imgur.com/bjDPXfS.png',
  'duna-skaal': 'https://i.imgur.com/RpQzvJZ.png',
  'dora-skaal': 'https://i.imgur.com/S1RnbVx.png',
  'olaf-skaal': 'https://i.imgur.com/bTim5od.png',
  'ivar-skaal': 'https://i.imgur.com/rPAKcZ1.png',
  'knut-skaal': 'https://i.imgur.com/GuKZWxT.jpeg'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_SKAAL_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Quelle gemeinsamer
// Weltpersonen. Die wiederholte schwarze Standardsilhouette der Altquelle ist
// kein Individualporträt und wird deshalb nicht heruntergeladen.
export const HOUSE_SKAAL_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'sveinung-skaal': HOUSE_SKJEGG_PORTRAITS['sveinung-skaal'],
  'arne-skaal': HOUSE_SKJEGG_PORTRAITS['arne-skaal'],
  'revna-skjegg': HOUSE_SKJEGG_PORTRAITS['revna-skjegg'],
  'hanne-skaal': HOUSE_SKJEGG_PORTRAITS['hanne-skaal'],
  'thiodolf-skjegg': HOUSE_SKJEGG_PORTRAITS['thiodolf-skjegg'],
  'katla-skaal': HOUSE_FREIWINTER_PORTRAITS['katla-skaal'],
  'fridthjof-freiwinter': HOUSE_FREIWINTER_PORTRAITS['fridthjof-freiwinter'],
  'svantje-skaal': HOUSE_VARULV_PORTRAITS['svantje-skaal'],
  'sleipnir-varulv': HOUSE_VARULV_PORTRAITS['sleipnir-varulv']
});
