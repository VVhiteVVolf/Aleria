import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-mochdaer';

// Wiederverwendete schwarze Silhouetten der Quelltabelle sind keine
// Individualportraits und bleiben deshalb den Kartenplatzhaltern überlassen.
export const HOUSE_MOCHDAER_LOCAL_PORTRAIT_IDS = Object.freeze([
  'micah-founder-mochdaer',
  'owain-mochdaer',
  'marmaduke-mochdaer',
  'mordred-trachwyll',
  'merwin-mochdaer',
  'drudwas-mochdaer',
  'slavi-mochdaer',
  'rhosyn-mochdaer',
  'aethlem-mochdaer',
  'jowna-1681-mochdaer',
  'lindsey-ness',
  'cledwyn-lyfant',
  'lunet-blaidd',
  'artgal-crafanc',
  'idris-mochdaer',
  'ceridwen-mochdaer',
  'vanna-mochdaer',
  'micah-1693-mochdaer',
  'catrin-mochdaer',
  'kimball-gwenyen',
  'senga-haig',
  'murvin-dianc',
  'jenica-dinefwr',
  'tathal-walwrs',
  'arian-mochdaer',
  'afon-mochdaer',
  'jareth-mochdaer',
  'cariad-mochdaer',
  'cadel-mochdaer',
  'marve-hwyaden',
  'gwynfa-creyr'
]);

export const HOUSE_MOCHDAER_LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_MOCHDAER_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])
));

export const HOUSE_MOCHDAER_PORTRAITS = Object.freeze({
  ...HOUSE_MOCHDAER_LOCAL_PORTRAITS,
  // Diese drei Personen bleiben dieselben Weltpersonen wie in ihren Gegenakten.
  'luned-mochdear': HOUSE_BLODYN_PORTRAITS['luned-mochdear'],
  'tarrant-blodyn': HOUSE_BLODYN_PORTRAITS['tarrant-blodyn'],
  'tomi-wylan': HOUSE_WYLAN_PORTRAITS['tomi-wylan']
});
