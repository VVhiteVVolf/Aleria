import { HOUSE_WELLENSCHILD_PORTRAITS } from './house-wellenschild-portraits.js';

// Bereits in der Wellenschild-Gegenakte gesicherte Porträts werden bewusst
// wiederverwendet. So bleiben dieselben Weltpersonen in beiden Stammbäumen
// auch bildlich identisch und es entstehen keine doppelten Bildquellen.
export const HOUSE_EIBENSCHILD_PORTRAITS = Object.freeze({
  'thorin-eibenschild': HOUSE_WELLENSCHILD_PORTRAITS['thorin-eibenschild'],
  'marit-eibenschild': HOUSE_WELLENSCHILD_PORTRAITS['marit-eibenschild'],
  'yrska-wellenschild': HOUSE_WELLENSCHILD_PORTRAITS['yrska-wellenschild'],
  'torben-wellenschild': HOUSE_WELLENSCHILD_PORTRAITS['torben-wellenschild']
});
