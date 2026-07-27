import { HOUSE_BALCHDER_PORTRAITS } from './house-balchder-portraits.js';
import { HOUSE_CAERTHWYN_PORTRAITS } from './house-caerthwyn-portraits.js';
import { HOUSE_RHUDDGAR_PORTRAITS } from './house-rhuddgar-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-caerlaen';

const LOCAL_PORTRAIT_PATHS = Object.freeze({
  'trayvon-caerlaen': 'trayvon-caerlaen.jpg',
  'tudor-caerlaen': 'tudor-caerlaen.jpg',
  'enian-caerlaen': 'enian-caerlaen.jpg',
  innogen: 'innogen.jpg',
  wena: 'wena.jpg',
  'merlyn-caerlaen': 'merlyn-caerlaen.jpg',
  'dillion-caerlaen': 'dillion-caerlaen.jpg',
  solveig: 'solveig.jpg',
  vanora: 'vanora-caerlaen.jpg',
  'ysee-caerlaen': 'ysee-caerlaen.jpg',
  'urian-caerlaen': 'urian-caerlaen.jpg',
  'yale-caerlaen': 'yale-caerlaen.jpg',
  'jenyi-caerlaen': 'jenyi-caerlaen.jpg'
});

export const HOUSE_CAERLAEN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(LOCAL_PORTRAIT_PATHS).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])),

  // Geteilte Weltpersonen verwenden die bereits kanonisch gehosteten Portraitdateien.
  'dalvin-balchder': HOUSE_BALCHDER_PORTRAITS['dalvin-balchder'],
  'iseult-caerlaen': HOUSE_BALCHDER_PORTRAITS['iseult-caerlaen'],
  'caderyn-rhuddgar': HOUSE_RHUDDGAR_PORTRAITS['caderyn-rhuddgar'],
  'miraeth-caerlaen': HOUSE_RHUDDGAR_PORTRAITS['miraeth-caerlaen'],
  'ywen-caerthwyn': HOUSE_CAERTHWYN_PORTRAITS['ywen-caerthwyn'],
  'meilyr-caerlaen': HOUSE_CAERTHWYN_PORTRAITS['meilyr-caerlaen']
});
