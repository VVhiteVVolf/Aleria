// Reproducible local CPU/operation-count evidence; synthetic inventories only.
import { performance } from 'node:perf_hooks';
import { writeFile } from 'node:fs/promises';
import { createRegisterStore } from '../../AleriaAlmanach/modules/item-register/item-register-store.js';
import { querySceneTradeCatalog } from '../../AleriaAlmanach/modules/scene-trade/scene-trade-catalog.js';
import { buildModuleOffers } from '../../AleriaAlmanach/modules/item-register/item-register-module-catalog.js';
import { STANDARD_ITEMS } from '../../AleriaAlmanach/modules/item-register/item-register-standard.js';
import { findBuiltinTradeModule } from '../../AleriaAlmanach/modules/scene-trade/scene-trade-builtins.js';

function registerScenario(minimal) {
  let inventoryReads = 0;
  const characters = Array.from({ length: 300 }, (_, character) => ({ id: `synthetic-${character}`, inventory: {
    get items() { inventoryReads++; return Array.from({ length: 32 }, (_, item) => ({ id: `item-${item}`, name: `Synthetic item ${item}`, quantity: '1' })); }
  } }));
  const callbacks = new Map();
  const store = createRegisterStore({ standards: [], notifyProjection: minimal ? 'records' : 'full' });
  const start = performance.now();
  store.connect({ subscribe(kind, next) { callbacks.set(kind, next); return () => {}; } }, null,
    minimal ? { kinds: ['offers', 'characters'], hydrateInventoryDefinitions: false } : {});
  callbacks.get('offers')([]); callbacks.get('characters')(characters);
  if (!minimal) callbacks.get('creatures')([]);
  for (let index = 0; index < 5; index++) store.refreshDefinitions();
  const milliseconds = performance.now() - start;
  store.stop();
  return { milliseconds, inventoryReads, subscribedCollections: [...callbacks.keys()] };
}
const full = registerScenario(false), trade = registerScenario(true);
let titleReads = 0, merchantReads = 0;
const offers = Array.from({ length: 5000 }, (_, index) => ({ id: String(index),
  get listId() { merchantReads++; return index < 100 ? 'selected' : 'other'; },
  get title() { titleReads++; return `Synthetic product ${index}`; }, type: 'Ware' }));
const searches = Array.from({ length: 40 }, (_, index) => `product ${index}`);
let start = performance.now();
for (const search of searches) offers.filter(product => product.listId === 'selected'
  && String([product.title, product.type].join(' ')).toLocaleLowerCase('de').includes(search));
const before = { milliseconds: performance.now() - start, titleReads, merchantReads };
querySceneTradeCatalog({ offers }, { merchantId: 'selected' });
titleReads = 0; merchantReads = 0; start = performance.now();
for (const search of searches) querySceneTradeCatalog({ offers }, { merchantId: 'selected', search });
const after = { milliseconds: performance.now() - start, titleReads, merchantReads };
const entries = ['goettliche-eleganz', 'lothaires-arkaneum'].map(id => findBuiltinTradeModule(id).entry);
start = performance.now(); const actual = buildModuleOffers(entries, STANDARD_ITEMS);
const report = { measuredAt: new Date().toISOString(), environment: `${process.version}/${process.platform}/${process.arch}`,
  scope: 'Node CPU and property-read counts; no browser frame/network timing claimed, no real inventories read',
  register: { syntheticCharacters: 300, itemsPerCharacter: 32, full, trade },
  search: { globalOffers: 5000, selectedMerchantOffers: 100, inputs: 40, before, after, oneTimeIndexExcludedFromHotPath: true },
  actualTwoShopProjection: { modules: entries.length, products: actual.length, standards: STANDARD_ITEMS.length, milliseconds: performance.now() - start } };
await writeFile(new URL('measurements.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
