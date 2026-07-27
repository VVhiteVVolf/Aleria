import { HOUSE_RHUDDGAR_PORTRAITS } from './house-rhuddgar-portraits.js';
import { HOUSE_TARANVYR_PORTRAITS } from './house-taranvyr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-caerthwyn';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'bowen-caerthwyn',
  'sath-caerthwyn',
  'arlais',
  'hollie',
  'adeon-caerthwyn',
  'micah-caerthwyn',
  'ywen-caerthwyn',
  'reece-caerthwyn',
  'ffion-caerthwyn',
  'breven',
  'alicyn',
  'meilyr-caerlaen',
  'brinley',
  'heston',
  'sion-caerthwyn',
  'talaith-caerthwyn',
  'gwil-caerthwyn',
  'glaw-caerthwyn',
  'huw-caerthwyn',
  'rhun-caerthwyn',
  'llinos-caerthwyn',
  'ioan-caerthwyn',
  'jowna-caerthwyn',
  'larna-caerthwyn'
]);

export const HOUSE_CAERTHWYN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),

  // Dieselben Weltpersonen und Portraitdateien wie in den beiden Gegenakten.
  'rhon-taranvyr': HOUSE_TARANVYR_PORTRAITS['rhon-taranvyr'],
  'elowen-caerthwyn': HOUSE_TARANVYR_PORTRAITS['elowen-caerthwyn'],
  'serenna-rhuddgar': HOUSE_RHUDDGAR_PORTRAITS['serenna-rhuddgar'],
  'emyrs-caerthwyn': HOUSE_RHUDDGAR_PORTRAITS['emyrs-caerthwyn']
});
