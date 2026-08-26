import { HOUSE_BLUTSTAHL_PORTRAITS } from './house-blutstahl-portraits.js';
import { HOUSE_EISENBIEGER_PORTRAITS } from './house-eisenbieger-portraits.js';
import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_GRENDEL_PORTRAITS } from './house-grendel-portraits.js';
import { HOUSE_GWIALEN_PORTRAITS } from './house-gwialen-portraits.js';
import { HOUSE_HELGR_PORTRAITS } from './house-helgr-portraits.js';
import { HOUSE_KUMMERHERZ_PORTRAITS } from './house-kummerherz-portraits.js';
import { HOUSE_RIESENTOD_PORTRAITS } from './house-riesentod-portraits.js';
import { HOUSE_SCHWARZDORN_PORTRAITS } from './house-schwarzdorn-portraits.js';
import { HOUSE_VAEREN_PORTRAITS } from './house-vaeren-portraits.js';
import { HOUSE_VARANGR_PORTRAITS } from './house-varangr-portraits.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';
import { HOUSE_VRAGI_PORTRAITS } from './house-vragi-portraits.js';
import { HOUSE_WELLENSAENGER_PORTRAITS } from './house-wellensaenger-portraits.js';
import { HOUSE_WELLENSCHILD_PORTRAITS } from './house-wellenschild-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-sturmgeborene';

// Nur Porträts, die noch keine kanonische Gegenakte besitzen, werden lokal
// ergänzt. Bereits vorhandene Weltpersonen beziehen ihr Bild aus ihrer
// Herkunftsakte, damit ein späterer Bildtausch überall konsistent bleibt.
export const HOUSE_STURMGEBORENE_LOCAL_PORTRAIT_FILES = Object.freeze({
  'asgeir-sturmgeborener': 'asgeir-sturmgeborener.png',
  'runar-1562-sturmgeborener': 'runar-1562-sturmgeborener.png',
  'ulfar-sturmgeborener': 'ulfar-sturmgeborener.png',
  'sverre-sturmgeborener': 'sverre-sturmgeborener.png',
  'yrsa-frostauge': 'yrsa-frostauge.png',
  'gunnar-sturmgeborener': 'gunnar-sturmgeborener.png',
  'snorri-frostauge': 'snorri-frostauge.png',
  'arnthor-sturmgeborener': 'arnthor-sturmgeborener.png',
  'arnkatla-sturmgeborene': 'arnkatla-sturmgeborene.png',
  'bergthor-sturmgeborener': 'bergthor-sturmgeborener.png',
  'raloff-skaife': 'raloff-skaife.png',
  'runar-1694-sturmgeborener': 'runar-1694-sturmgeborener.png',
  'uvard-sturmgeborener': 'uvard-sturmgeborener.png',
  'canrik-sturmgeborener': 'canrik-sturmgeborener.png',
  'njord-sturmgeborener': 'njord-sturmgeborener.png',
  'grimnir-sturmgeborener': 'grimnir-sturmgeborener.png',
  'dagfrid-sturmgeborene': 'dagfrid-sturmgeborene.png',
  'johild-frostauge': 'johild-frostauge.png',
  'gardar-frostauge': 'gardar-frostauge.png',
  'tyr-sturmgeborener': 'tyr-sturmgeborener.png',
  'rjotr-sturmgeborener': 'rjotr-sturmgeborener.png',
  'ottar-sturmgeborener': 'ottar-sturmgeborener.png',
  'greta-sturmgeborene': 'greta-sturmgeborene.png',
  'illug-sturmgeborener': 'illug-sturmgeborener.png',
  'hekla-sturmgeborene': 'hekla-sturmgeborene.png',
  'dofri-sturmgeborener': 'dofri-sturmgeborener.png',
  'katla-sturmgeborene': 'katla-sturmgeborene.png'
});

export const HOUSE_STURMGEBORENE_PORTRAIT_SOURCES = Object.freeze({
  'asgeir-sturmgeborener': 'https://i.imgur.com/9GmxY1D.png',
  'runar-1562-sturmgeborener': 'https://i.imgur.com/mHCp60g.png',
  'ulfar-sturmgeborener': 'https://i.imgur.com/WxgMniG.png',
  'sverre-sturmgeborener': 'https://i.imgur.com/2AGmAOF.png',
  'yrsa-frostauge': 'https://i.imgur.com/JGYtaR1.png',
  'gunnar-sturmgeborener': 'https://i.imgur.com/GUzYPaa.png',
  'snorri-frostauge': 'https://i.imgur.com/168fza4.png',
  'arnthor-sturmgeborener': 'https://i.imgur.com/4cjarOb.png',
  'arnkatla-sturmgeborene': 'https://i.imgur.com/w1O8X0h.png',
  'bergthor-sturmgeborener': 'https://i.imgur.com/g7T4S8d.png',
  'raloff-skaife': 'https://i.imgur.com/51CghpL.png',
  'runar-1694-sturmgeborener': 'https://i.imgur.com/CvHiTuL.png',
  'uvard-sturmgeborener': 'https://i.imgur.com/JVUHPbt.png',
  'canrik-sturmgeborener': 'https://i.imgur.com/Y7VFDC2.png',
  'njord-sturmgeborener': 'https://i.imgur.com/mAMQ9AY.png',
  'grimnir-sturmgeborener': 'https://i.imgur.com/B5rm4PF.png',
  'dagfrid-sturmgeborene': 'https://i.imgur.com/1NsL0Oi.png',
  'johild-frostauge': 'https://i.postimg.cc/Xqfs3Hzf/image.png',
  'gardar-frostauge': 'https://i.postimg.cc/Vvjvsn1c/image.png',
  'tyr-sturmgeborener': 'https://i.imgur.com/jRG5HYl.png',
  'rjotr-sturmgeborener': 'https://i.imgur.com/x7CmL74.png',
  'ottar-sturmgeborener': 'https://i.imgur.com/7tN4TtK.png',
  'greta-sturmgeborene': 'https://i.imgur.com/Om2IDgL.png',
  'illug-sturmgeborener': 'https://i.imgur.com/wdvPqZz.png',
  'hekla-sturmgeborene': 'https://i.imgur.com/o99OMLY.png',
  'dofri-sturmgeborener': 'https://i.imgur.com/9D5Hb5o.png',
  'katla-sturmgeborene': 'https://i.imgur.com/BcAcuDI.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_STURMGEBORENE_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_STURMGEBORENE_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'norlind-sturmgeborener': HOUSE_EISENBIEGER_PORTRAITS['norlind-sturmgeborener'],
  'solvig-eisenbieger': HOUSE_EISENBIEGER_PORTRAITS['solvig-eisenbieger'],
  'thorkel-sturmgeborener': HOUSE_WELLENSAENGER_PORTRAITS['thorkel-sturmgeborener'],
  'llewarc-gwialen': HOUSE_GWIALEN_PORTRAITS['llewarc-gwialen'],
  'eola-sturmgeborene': HOUSE_VAEREN_PORTRAITS['eola-sturmgeborene'],
  'balgruuf-younger-vaeren': HOUSE_VAEREN_PORTRAITS['balgruuf-younger-vaeren'],
  'ragnhild-sturmgeborene': HOUSE_FREIWINTER_PORTRAITS['ragnhild-sturmgeborene'],
  'brynjolf-freiwinter': HOUSE_FREIWINTER_PORTRAITS['brynjolf-freiwinter'],
  'sigurd-sturmgeborener': HOUSE_RIESENTOD_PORTRAITS['sigurd-sturmgeborener'],
  'thialda-riesentod': HOUSE_RIESENTOD_PORTRAITS['thialda-riesentod'],
  'floki-sturmgeborener': HOUSE_KUMMERHERZ_PORTRAITS['floki-sturmgeborener'],
  'gunnlaug-kummerherz': HOUSE_KUMMERHERZ_PORTRAITS['gunnlaug-kummerherz'],
  'vallborg-sturmgeborene': HOUSE_BLUTSTAHL_PORTRAITS['vallborg-sturmgeborene'],
  'birger-blutstahl': HOUSE_BLUTSTAHL_PORTRAITS['birger-blutstahl'],
  'hafgrim-sturmgeborener': HOUSE_HELGR_PORTRAITS['hafgrim-sturmgeborener'],
  'yggrid-helgr': HOUSE_HELGR_PORTRAITS['yggrid-helgr'],
  'kormak-sturmgeborener': HOUSE_WELLENSCHILD_PORTRAITS['kormak-sturmgeborener'],
  'magdis-wellenschild': HOUSE_WELLENSCHILD_PORTRAITS['magdis-wellenschild'],
  'torger-sturmgeborene': HOUSE_VARULV_PORTRAITS['torger-sturmgeborene'],
  'rannveig-varulv': HOUSE_VARULV_PORTRAITS['rannveig-varulv'],
  'lydia-sturmgeborene': HOUSE_VAEREN_PORTRAITS['lydia-sturmgeborene'],
  'rag-vaeren': HOUSE_VAEREN_PORTRAITS['rag-vaeren'],
  'thorbrand-sturmgeborener': HOUSE_GRENDEL_PORTRAITS['thorbrand-sturmgeborener'],
  'astrid-grendel': HOUSE_GRENDEL_PORTRAITS['astrid-grendel'],
  'erlend-sturmgeborener': HOUSE_RIESENTOD_PORTRAITS['erlend-sturmgeborener'],
  'svana-riesentod': HOUSE_RIESENTOD_PORTRAITS['svana-riesentod'],
  'hadvar-varangr': HOUSE_VARANGR_PORTRAITS['hadvar-varangr'],
  'idmar-sturmgeborener': HOUSE_VRAGI_PORTRAITS['idmar-sturmgeborener'],
  'drifa-vragi': HOUSE_VRAGI_PORTRAITS['drifa-vragi'],
  'vilborg-sturmgeborene': HOUSE_SCHWARZDORN_PORTRAITS['vilborg-sturmgeborene'],
  'torvard-schwarzdorn': HOUSE_SCHWARZDORN_PORTRAITS['torvard-schwarzdorn'],
  'casthild-sturmgeborene': HOUSE_KUMMERHERZ_PORTRAITS['casthild-sturmgeborene'],
  'nottulf-kummerherz': HOUSE_KUMMERHERZ_PORTRAITS['nottulf-kummerherz'],
  'isdis-grendel': HOUSE_GRENDEL_PORTRAITS['isdis-grendel']
});
