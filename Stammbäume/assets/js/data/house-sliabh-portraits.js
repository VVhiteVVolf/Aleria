import { HOUSE_DURDYNN_PORTRAITS } from './house-durdynn-portraits.js';
import { HOUSE_ILYUNCU_PORTRAITS } from './house-ilyuncu-portraits.js';
import {
  HOUSE_SLIABH_LOCAL_PORTRAIT_FILES,
  HOUSE_SLIABH_LOCAL_PORTRAITS
} from './house-sliabh-local-portraits.js';

export { HOUSE_SLIABH_LOCAL_PORTRAIT_FILES };

// Bogus und Caryl bleiben in ihren jeweiligen Herkunftsakten die kanonischen
// Bildquellen. Sliabh verweist auf dieselben Dateien statt sie zu kopieren.
export const HOUSE_SLIABH_PORTRAITS = Object.freeze({
  ...HOUSE_SLIABH_LOCAL_PORTRAITS,
  'bogus-ilyuncu': HOUSE_ILYUNCU_PORTRAITS['bogus-ilyuncu'],
  'caryl-durdynn': HOUSE_DURDYNN_PORTRAITS['caryl-durdynn']
});
