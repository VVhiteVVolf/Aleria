import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-taranvyr';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'rhydian-taranvyr',
  'vanora-founder-taranvyr',
  'kerrilyn-taranvyr',
  'maredudd-tawelgar',
  'hywel-taranvyr',
  'alestan-taranvyr',
  'linessa-taranvyr',
  'brendan-taranvyr',
  'rhon-taranvyr',
  'reane-spouse-taranvyr',
  'seren-spouse-taranvyr',
  'godwyn-selog',
  'mervynne-spouse-taranvyr',
  'elowen-caerthwyn',
  'powell-taranvyr',
  'leolin-taranvyr',
  'taron-taranvyr',
  'trevor-taranvyr',
  'caelan-taranvyr',
  'wynndie-spouse-taranvyr',
  'nerys-spouse-taranvyr',
  'fiannait-spouse-taranvyr',
  'saselia-spouse-taranvyr',
  'kane-taranvyr',
  'jennifa-taranvyr',
  'marvo-taranvyr',
  'vaughn-taranvyr',
  'gwenda-taranvyr',
  'vanora-taranvyr',
  'cael-taranvyr',
  'hefin-taranvyr',
  'ieuan-taranvyr',
  'lilifer-taranvyr'
]);

export const HOUSE_TARANVYR_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    PORTRAIT_ROOT + '/' + personId + '.jpg'
  ])),

  // Kenyon und Talaith sind dieselben Weltpersonen wie im Haus Gwyvern.
  'kenyon-taranvyr': HOUSE_GWYVERN_PORTRAITS['kenyon-taranvyr'],
  'talaith-gwyvern': HOUSE_GWYVERN_PORTRAITS['talaith-gwyvern']
});
