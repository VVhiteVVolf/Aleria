import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS } from './house-fir-an-gallchobhair-portraits.js';
import { HOUSE_ILLWATH_PORTRAITS } from './house-illwath-portraits.js';
import { HOUSE_LLWYNOG_PORTRAITS } from './house-llwynog-portraits.js';
import { HOUSE_NA_MHUIR_LOCAL_PORTRAITS } from './house-na-mhuir-local-portraits.js';
import { HOUSE_RUIN_UA_LAOCH_LOCAL_PORTRAITS } from './house-ruin-ua-laoch-local-portraits.js';
import { HOUSE_UA_EIRCE_LOCAL_PORTRAITS } from './house-ua-eirce-local-portraits.js';
import { HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS } from './house-ui-fiachrach-local-portraits.js';

// Die drei bereitgestellten Kadettenquellen enthalten ausdrücklich veraltete
// Bilder. Diese Listen dürfen deshalb nur bereits kanonische Projektporträts
// derselben Weltpersonen referenzieren; eigene Quellbilder gibt es hier nicht.
export const HOUSE_UA_CLEIR_REUSED_PORTRAIT_IDS = Object.freeze([
  'gilleon-gallchobhair',
  'hoibrean-eirce',
  'sloane-gallchobhair',
  'yoliva-fiachrach',
  'nessa-cleir',
  'kynwas-illwath',
  'mairead-cleir',
  'bevan-llwynog',
  'vionaigh-mhuir'
]);

export const HOUSE_UA_CLEIR_PORTRAITS = Object.freeze({
  'gilleon-gallchobhair': HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS['gilleon-gallchobhair'],
  'hoibrean-eirce': HOUSE_UA_EIRCE_LOCAL_PORTRAITS['hoibrean-eirce'],
  'sloane-gallchobhair': HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS['sloane-gallchobhair'],
  'yoliva-fiachrach': HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS['yoliva-fiachrach'],
  'nessa-cleir': HOUSE_ILLWATH_PORTRAITS['nessa-cleir'],
  'kynwas-illwath': HOUSE_ILLWATH_PORTRAITS['kynwas-illwath'],
  'mairead-cleir': HOUSE_LLWYNOG_PORTRAITS['mairead-cleir'],
  'bevan-llwynog': HOUSE_LLWYNOG_PORTRAITS['bevan-llwynog'],
  'vionaigh-mhuir': HOUSE_NA_MHUIR_LOCAL_PORTRAITS['vionaigh-mhuir']
});

export const HOUSE_UA_GHAISCIOCH_REUSED_PORTRAIT_IDS = Object.freeze([
  'taerlach-gallchobhair',
  'rhynnon-blach',
  'bhaltair-fiachrach',
  'treasa-laoch',
  'myfanwy-llwynog',
  'darragh-ua-ghaiscioch',
  'orren-gallchobhair',
  'ailis-ghaiscioch',
  'criostoir-mhuir',
  'saorlaith-caiomhe',
  'meabh-ruitheach'
]);

export const HOUSE_UA_GHAISCIOCH_PORTRAITS = Object.freeze({
  'taerlach-gallchobhair': HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS['taerlach-gallchobhair'],
  'rhynnon-blach': HOUSE_BLACH_PORTRAITS['rhynnon-blach'],
  'bhaltair-fiachrach': HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS['bhaltair-fiachrach'],
  'treasa-laoch': HOUSE_RUIN_UA_LAOCH_LOCAL_PORTRAITS['treasa-laoch'],
  'myfanwy-llwynog': HOUSE_LLWYNOG_PORTRAITS['myfanwy-llwynog'],
  'darragh-ua-ghaiscioch': HOUSE_LLWYNOG_PORTRAITS['darragh-ua-ghaiscioch'],
  'orren-gallchobhair': HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS['orren-gallchobhair'],
  'ailis-ghaiscioch': HOUSE_BLACH_PORTRAITS['ailis-ghaiscioch'],
  'criostoir-mhuir': HOUSE_NA_MHUIR_LOCAL_PORTRAITS['criostoir-mhuir'],
  'saorlaith-caiomhe': 'assets/images/portraits/haus-nic-caoimhe/saorlaith-caiomhe.png',
  'meabh-ruitheach': 'assets/images/portraits/haus-dal-ruitheach/meabh-ruitheach.jpg'
});

export const HOUSE_DAL_CEARDAIOCHT_REUSED_PORTRAIT_IDS = Object.freeze([
  'aonghus-gallchobhair',
  'caibrel-ceardaiocht',
  'sianwen-illwath',
  'aideen-gallchobhair',
  'caitriona-ceardaiocht',
  'emyrs-blach',
  'cari-llwynog',
  'duna-mhuir',
  'hanae-frisealach'
]);

export const HOUSE_DAL_CEARDAIOCHT_PORTRAITS = Object.freeze({
  'aonghus-gallchobhair': HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS['aonghus-gallchobhair'],
  'caibrel-ceardaiocht': HOUSE_ILLWATH_PORTRAITS['caibrel-ceardaiocht'],
  'sianwen-illwath': HOUSE_ILLWATH_PORTRAITS['sianwen-illwath'],
  'aideen-gallchobhair': HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS['aideen-gallchobhair'],
  'caitriona-ceardaiocht': HOUSE_BLACH_PORTRAITS['caitriona-ceardaiocht'],
  'emyrs-blach': HOUSE_BLACH_PORTRAITS['emyrs-blach'],
  'cari-llwynog': HOUSE_LLWYNOG_PORTRAITS['cari-llwynog'],
  'duna-mhuir': HOUSE_NA_MHUIR_LOCAL_PORTRAITS['duna-mhuir'],
  'hanae-frisealach': 'assets/images/portraits/haus-ard-frisealach/hanae-frisealach.png'
});
