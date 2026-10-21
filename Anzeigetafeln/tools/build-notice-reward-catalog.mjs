// Read-only projection of the actual goods register. Its IDs and converters
// remain authoritative; notice rewards never create stock or inventory grants.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { STANDARD_ITEMS } from '../../AleriaAlmanach/modules/item-register/item-register-standard.js';
import { buildModuleOffers } from '../../AleriaAlmanach/modules/item-register/item-register-module-catalog.js';
import { readEconomyModuleSources } from '../../AleriaAlmanach/modules/economy-calculator/economy-source-venues.mjs';

const sections = await readEconomyModuleSources();
const offers = buildModuleOffers(sections.flatMap(section => section.entries || []), STANDARD_ITEMS);
const items = [...new Map([...STANDARD_ITEMS, ...offers].filter(item => !item.archived).map(item => [item.id, item])).values()];
function imagePath(value) {
  if (!value) return '';
  const url = new URL(value, 'https://aleria.local/AleriaAlmanach/');
  return url.hostname === 'aleria.local' ? url.pathname : url.href;
}
const catalog = { schemaVersion: 1, items: items.map(item => ({ id: item.id, title: item.title, type: item.type || '',
  category: item.category || '', image: imagePath(item.image), description: item.description || '', details: item.details || '',
  source: item.listName || item.categoryLabel || 'Standardgüter' })).sort((a, b) => a.title.localeCompare(b.title, 'de')) };
const target = new URL('../assets/data/notice-reward-catalog.json', import.meta.url);
const content = JSON.stringify(catalog) + '\n';
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== content) throw new Error('Aushang-Belohnungskatalog muss neu erzeugt werden.');
} else {
  await mkdir(new URL('../assets/data/', import.meta.url), { recursive: true });
  await writeFile(target, content);
  console.log(`Aushang-Belohnungen: ${catalog.items.length} Güterregistereinträge.`);
}
