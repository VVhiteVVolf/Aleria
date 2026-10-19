import { readFile, writeFile } from 'node:fs/promises';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
const reference = STANDARD_ITEMS.filter(item => item.section === 'standard' && item.priceRange).map(item => ({
  id: item.id, title: item.title, market: item.sourceRefs[0].market, category: item.category, unit: item.hiddenMeta?.unit || '',
  range: [item.priceRange.minCopper, item.priceRange.maxCopper]
}));
const url = new URL('../modules/economy-pricing/price-reference.generated.mjs', import.meta.url);
const source = '// Generated from item-register-standard.js. Do not author prices here.\nexport const STANDARD_PRICE_REFERENCE = ' + JSON.stringify(reference, null, 2) + ';\n';
if (process.argv.includes('--check')) { if (await readFile(url, 'utf8') !== source) throw Error('Economy price reference is stale.'); }
else await writeFile(url, source);
console.log(`${reference.length} canonical price references.`);
