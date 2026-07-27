import { HOUSE_BALCHDER_PORTRAITS } from './house-balchder-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-barus';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'martyn-barus',
  'macsen-barus',
  'madoc-barus',
  'isolde-barus',
  'llawen-barus',
  'mabon-barus',
  'haulwen-barus',
  'ystwyth-barus',
  'math-barus',
  'lloyd-barus'
]);

export const HOUSE_BARUS_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),

  // Dieselben Weltpersonen und Portraitdateien wie in Cerrins biologischer Balchder-Akte.
  'cerrin-balchder': HOUSE_BALCHDER_PORTRAITS['cerrin-balchder'],
  'wyett-barus': HOUSE_BALCHDER_PORTRAITS['wyett-barus']
});
