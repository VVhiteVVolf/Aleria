import { HOUSE_FEUERHAAR_PORTRAITS } from './house-feuerhaar-portraits.js';
import { HOUSE_GRAUMAHNE_PORTRAITS } from './house-graumahne-portraits.js';
import { HOUSE_HJERTE_PORTRAITS } from './house-hjerte-portraits.js';
import { HOUSE_RAGNULF_PORTRAITS } from './house-ragnulf-portraits.js';
import { HOUSE_SCHMETTERSCHILD_PORTRAITS } from './house-schmetterschild-portraits.js';
import { HOUSE_STERKR_PORTRAITS } from './house-sterkr-portraits.js';
import { HOUSE_TODBRAND_PORTRAITS } from './house-todbrand-portraits.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-kummerherz';

export const HOUSE_KUMMERHERZ_LOCAL_PORTRAIT_FILES = Object.freeze({
  'jothmund-kummerherz': 'jothmund-kummerherz.png',
  'jorah-kummerherz': 'jorah-kummerherz.png',
  'mogunn-kummerherz': 'mogunn-kummerherz.png',
  'lagmar-kummerherz': 'lagmar-kummerherz.png',
  'eystein-kummerherz': 'eystein-kummerherz.png',
  'haraldur-feuerherz': 'haraldur-feuerherz.png',
  'floki-sturmgeborener': 'floki-sturmgeborener.png',
  'finnleik-kummerherz': 'finnleik-kummerherz.png',
  'ljosdis-kummerherz': 'ljosdis-kummerherz.png',
  'njaldis-kummerherz': 'njaldis-kummerherz.png',
  'thorgils-eisenbieger': 'thorgils-eisenbieger.png',
  'nattfar-gullvig': 'nattfar-gullvig.png',
  'tyrfingr-kummerherz': 'tyrfingr-kummerherz.png',
  'nottulf-kummerherz': 'nottulf-kummerherz.png',
  'midna-spindelschlag': 'midna-spindelschlag.png',
  'casthild-sturmgeborene': 'casthild-sturmgeborene.png',
  'rorik-kummerherz': 'rorik-kummerherz.png',
  'finnur-kummerherz': 'finnur-kummerherz.png',
  'isaura-wellensaenger': 'isaura-wellensaenger.png',
  'orm-kummerherz': 'orm-kummerherz.png',
  'melka-kummerherz': 'melka-kummerherz.png'
});

export const HOUSE_KUMMERHERZ_PORTRAIT_SOURCES = Object.freeze({
  'jothmund-kummerherz': 'https://i.imgur.com/c1ioBXD.png',
  'jorah-kummerherz': 'https://i.imgur.com/qcNod24.png',
  'mogunn-kummerherz': 'https://i.imgur.com/OWDIutV.png',
  'lagmar-kummerherz': 'https://i.imgur.com/gE6P7HE.png',
  'eystein-kummerherz': 'https://i.imgur.com/jBQ99zf.png',
  'haraldur-feuerherz': 'https://i.imgur.com/sdDrhRR.png',
  'floki-sturmgeborener': 'https://i.imgur.com/WJDMb5g.png',
  'finnleik-kummerherz': 'https://i.imgur.com/Gq23UOZ.png',
  'ljosdis-kummerherz': 'https://i.imgur.com/2nXUtOS.png',
  'njaldis-kummerherz': 'https://i.imgur.com/TpwGbRj.png',
  'thorgils-eisenbieger': 'https://i.imgur.com/fnQ8d5F.png',
  'nattfar-gullvig': 'https://i.imgur.com/AkXyIIF.png',
  'tyrfingr-kummerherz': 'https://i.imgur.com/FB6sUoK.png',
  'nottulf-kummerherz': 'https://i.imgur.com/fLgpzol.png',
  'midna-spindelschlag': 'https://i.imgur.com/7rjfTYx.png',
  'casthild-sturmgeborene': 'https://i.imgur.com/AmxrPVL.png',
  'rorik-kummerherz': 'https://i.imgur.com/hXnmK7F.png',
  'finnur-kummerherz': 'https://i.imgur.com/W1S8elX.png',
  'isaura-wellensaenger': 'https://i.imgur.com/yFkHhlV.png',
  'orm-kummerherz': 'https://i.imgur.com/T1qgxdX.png',
  'melka-kummerherz': 'https://i.imgur.com/TMY27j5.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_KUMMERHERZ_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_KUMMERHERZ_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'brynjar-hjerte': HOUSE_HJERTE_PORTRAITS['brynjar-hjerte'],
  'asleikr-graumahne': HOUSE_GRAUMAHNE_PORTRAITS['asleikr-graumahne'],
  'naddvar-kummerherz': HOUSE_GRAUMAHNE_PORTRAITS['naddvar-kummerherz'],
  'heremod-sterkr': HOUSE_STERKR_PORTRAITS['heremod-sterkr'],
  'holmdis-kummerherz': HOUSE_STERKR_PORTRAITS['holmdis-kummerherz'],
  'hogrand-kummerherz': HOUSE_WARGH_PORTRAITS['hogrand-kummerherz'],
  'bylga-wargh': HOUSE_WARGH_PORTRAITS['bylga-wargh'],
  'tryggvi-kummerherz': HOUSE_SCHMETTERSCHILD_PORTRAITS['tryggvi-kummerherz'],
  'ormrun-schmetterschild': HOUSE_SCHMETTERSCHILD_PORTRAITS['ormrun-schmetterschild'],
  'armod-feuerhaar': HOUSE_FEUERHAAR_PORTRAITS['armod-feuerhaar'],
  'asta-kummerherz': HOUSE_FEUERHAAR_PORTRAITS['asta-kummerherz'],
  'calthar-todbrand': HOUSE_TODBRAND_PORTRAITS['calthar-todbrand'],
  'froya-kummerherz': HOUSE_TODBRAND_PORTRAITS['froya-kummerherz'],
  'tinna-kummerherz': HOUSE_RAGNULF_PORTRAITS['tinna-kummerherz']
});
