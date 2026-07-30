import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';

const SHARED_PERSON_IDS = Object.freeze([
  'tynan-gallchobhair',
  'anali-illewod',
  'dymphna-gallchobhair',
  'deaglan-gallchobhair'
]);

// Alle vier Quellbilder liegen bereits lokal in der Illewod-Gegenakte. Die
// Grianlaoch-Akte verweist bewusst auf dieselben Dateien, statt Bildkopien und
// voneinander abweichende Portraitfassungen anzulegen.
export const HOUSE_GRIANLAOCH_PORTRAITS = Object.freeze(Object.fromEntries(
  SHARED_PERSON_IDS.map(personId => [personId, HOUSE_ILLEWOD_PORTRAITS[personId]])
));
