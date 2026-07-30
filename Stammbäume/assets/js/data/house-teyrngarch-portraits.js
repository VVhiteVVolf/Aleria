import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_PENDERYN_PORTRAITS } from './house-penderyn-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-teyrngarch';

export const HOUSE_TEYRNGARCH_LOCAL_PORTRAITS = Object.freeze({
  'taredd-teyrngarch': `${PORTRAIT_ROOT}/taredd-teyrngarch.png`,
  'quinlan-luga': `${PORTRAIT_ROOT}/quinlan-luga.jpg`,
  'seithved-teyrngarch': `${PORTRAIT_ROOT}/seithved-teyrngarch.png`,
  'glendower-canwyll': `${PORTRAIT_ROOT}/glendower-canwyll.jpg`,
  'garselid-gwarchod': `${PORTRAIT_ROOT}/garselid-gwarchod.jpg`,
  'edlym-teyrngarch': `${PORTRAIT_ROOT}/edlym-teyrngarch.png`,
  'marwine-teyrngarch': `${PORTRAIT_ROOT}/marwine-teyrngarch.png`,
  'heledd-teyrngarch': `${PORTRAIT_ROOT}/heledd-teyrngarch.png`,
  'tegin-blach': `${PORTRAIT_ROOT}/tegin-blach.png`,
  'donnagh-heaghra': `${PORTRAIT_ROOT}/donnagh-heaghra.jpeg`,
  'siona-teyrngarch': `${PORTRAIT_ROOT}/siona-teyrngarch.png`,
  'arfon-teyrngarch': `${PORTRAIT_ROOT}/arfon-teyrngarch.png`,
  'brannoc-teyrngarch': `${PORTRAIT_ROOT}/brannoc-teyrngarch.png`,
  'shylene-teyrngarch': `${PORTRAIT_ROOT}/shylene-teyrngarch.png`,
  'fotor-tir-addawol': `${PORTRAIT_ROOT}/fotor-tir-addawol.jpg`,
  'annegret-schwarzdorn': `${PORTRAIT_ROOT}/annegret-schwarzdorn.png`,
  'eimear-marcaigh': `${PORTRAIT_ROOT}/eimear-marcaigh.png`,
  'gwifredd-illwath': `${PORTRAIT_ROOT}/gwifredd-illwath.png`,
  'gandwy-teyrngarch': `${PORTRAIT_ROOT}/gandwy-teyrngarch.png`,
  'olwen-teyrngarch': `${PORTRAIT_ROOT}/olwen-teyrngarch.png`,
  'iona-teyrngarch': `${PORTRAIT_ROOT}/iona-teyrngarch.png`,
  'evrel-teyrngarch': `${PORTRAIT_ROOT}/evrel-teyrngarch.png`,
  'dafi-teyrngarch': `${PORTRAIT_ROOT}/dafi-teyrngarch.png`,
  'wendy-teyrngarch': `${PORTRAIT_ROOT}/wendy-teyrngarch.png`,
  'cadfan-teyrngarch': `${PORTRAIT_ROOT}/cadfan-teyrngarch.png`,
  'elen-1721-teyrngarch': `${PORTRAIT_ROOT}/elen-1721-teyrngarch.png`,
  'grippuid-teyrngarch': `${PORTRAIT_ROOT}/grippuid-teyrngarch.png`
});

export const HOUSE_TEYRNGARCH_PORTRAITS = Object.freeze({
  ...HOUSE_TEYRNGARCH_LOCAL_PORTRAITS,
  'ercwiff-teyrngarch': HOUSE_ILLEWOD_PORTRAITS['ercwiff-teyrngarch'],
  'gaenor-teyrngarch': HOUSE_ILLEWOD_PORTRAITS['gaenor-teyrngarch'],
  'elen-illewod': HOUSE_ILLEWOD_PORTRAITS['elen-illewod'],
  'gwastad-teyrngarch': HOUSE_PENDERYN_PORTRAITS['gwastad-teyrngarch'],
  'gareth-penderyn': HOUSE_PENDERYN_PORTRAITS['gareth-penderyn'],
  'elinor-teyrngarch': HOUSE_PENDERYN_PORTRAITS['elinor-teyrngarch'],
  'dwnn-penderyn': HOUSE_PENDERYN_PORTRAITS['dwnn-penderyn'],
  // Die Wylan-Akte besitzt für Lugh eine historische, falsch geschriebene technische ID.
  // Sie bleibt zur Wahrung der Weltpersonen-Identität erhalten; sichtbar heißt er Teyrngarch.
  'lugh-teyrngrach': HOUSE_WYLAN_PORTRAITS['lugh-teyrngrach'],
  'cariad-wylan': HOUSE_WYLAN_PORTRAITS['cariad-wylan']
});
