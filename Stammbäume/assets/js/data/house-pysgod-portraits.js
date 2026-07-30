import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';
import { HOUSE_PYSGOD_LOCAL_PORTRAITS } from './house-pysgod-local-portraits.js';

// Geteilte Personen behalten exakt den Portraitpfad ihrer bereits
// ausgearbeiteten Gegenakte. Dadurch existiert hausübergreifend nur eine
// auslieferbare Bildidentität je Weltperson.
export const HOUSE_PYSGOD_PORTRAITS = Object.freeze({
  ...HOUSE_PYSGOD_LOCAL_PORTRAITS,
  'gingalain-1572-pysgod': HOUSE_PENDRAG_PORTRAITS['gingalain-1572-pysgod'],
  'tarwen-pendrag': HOUSE_PENDRAG_PORTRAITS['tarwen-pendrag'],
  'morholt-pysgod': HOUSE_NEIDR_PORTRAITS['morholt-pysgod'],
  'caitrin-neidr': HOUSE_NEIDR_PORTRAITS['caitrin-neidr'],
  'eiddon-tiwna': 'assets/images/portraits/haus-tiwna/eiddon-tiwna.png',
  'merfyn-draig': HOUSE_DRAIG_PORTRAITS['merfyn-draig'],
  'iorwerth-illewod': HOUSE_ILLEWOD_PORTRAITS['iorwerth-illewod'],
  'cynfor-pysgod': HOUSE_ILLEWOD_PORTRAITS['cynfor-pysgod'],
  'mairwen-illewod': HOUSE_ILLEWOD_PORTRAITS['mairwen-illewod'],
  'pelleas-pendrag': HOUSE_PENDRAG_PORTRAITS['pelleas-pendrag']
});
