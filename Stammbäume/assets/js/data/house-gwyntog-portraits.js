import { HOUSE_BALCHDER_PORTRAITS } from './house-balchder-portraits.js';
import { HOUSE_RHUDDGAR_PORTRAITS } from './house-rhuddgar-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-gwyntog';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'llywarch-gwyntog',
  'ioan-gwyntog',
  'tristan-gwyntog',
  'owena-gwyntog',
  'elian-gwyntog',
  'nudd-gwyntog',
  'manon-gwyntog',
  'gereint-gwyntog',
  'adda-gwyntog',
  'endaf-gwyntog',
  'alva',
  'doged-gwyntog',
  'tybie-gwyntog',
  'gutyn-gwyntog',
  'nanna-gwyntog',
  'sten',
  'afan-gwyntog',
  'asgell-gwyntog',
  'pyderi-gwyntog'
]);

export const HOUSE_GWYNTOG_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    PORTRAIT_ROOT + '/' + personId + '.png'
  ])),

  // Dieselben Weltpersonen verwenden in allen beteiligten Häusern dieselbe
  // bereits kanonische Projektdatei.
  'ithel-der-rote-gwyntog': HOUSE_RHUDDGAR_PORTRAITS['ithel-der-rote-gwyntog'],
  'alastair-gwyntog': HOUSE_BALCHDER_PORTRAITS['alastair-gwyntog'],
  'genofeva-balchder': HOUSE_BALCHDER_PORTRAITS['genofeva-balchder']
});
