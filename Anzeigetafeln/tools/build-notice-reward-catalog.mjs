// Read-only projection of the actual goods register. Its IDs and converters
// remain authoritative; notice rewards never create stock or inventory grants.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { STANDARD_ITEMS } from '../../AleriaAlmanach/modules/item-register/item-register-standard.js';
import { buildModuleOffers } from '../../AleriaAlmanach/modules/item-register/item-register-module-catalog.js';
import { readEconomyModuleSources } from '../../AleriaAlmanach/modules/economy-calculator/economy-source-venues.mjs';
import { itemDefinitionFromTemplate, itemDefinitionKey } from '../../AleriaAlmanach/modules/item-definitions/item-definition-model.js';
import { itemDefinitionRegistry } from '../../AleriaAlmanach/modules/item-definitions/item-definition-registry.js';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export async function buildNoticeRewardCatalog({ check = false } = {}) {
const sections = await readEconomyModuleSources();
const offers = buildModuleOffers(sections.flatMap(section => section.entries || []), STANDARD_ITEMS);
const items = [...new Map([...STANDARD_ITEMS, ...offers].filter(item => !item.archived).map(item => [item.id, item])).values()];
function imagePath(value) {
  if (!value) return '';
  const url = new URL(value, 'https://aleria.local/AleriaAlmanach/');
  return url.hostname === 'aleria.local' ? url.pathname : url.href;
}
// A shop may show its own prose, image or category for a standard item. These
// display fields must never replace the immutable definition behind its ref.
const definitionFor = item => itemDefinitionRegistry.get(item.definitionRef) || (item.definitionDerived ? itemDefinitionFromTemplate(item) : null);
const catalog = { schemaVersion: 2, definitions: [...new Map(items.map(definitionFor).filter(Boolean).map(definition => [itemDefinitionKey(definition), definition])).values()], items: items.map(item => ({ id: item.id, title: item.title, type: item.type || '',
  definitionRef: item.definitionRef || null, moduleId: item.moduleId || '', sourceRevision: item.sourceRevision || '',
  category: item.category || '', image: imagePath(item.image), description: item.description || '', details: item.details || '',
  source: item.listName || item.categoryLabel || 'Standardgüter' })).sort((a, b) => a.title.localeCompare(b.title, 'de')) };
const target = new URL('../assets/data/notice-reward-catalog.json', import.meta.url);
itemDefinitionRegistry.add(catalog.definitions, { current: false });
const content = JSON.stringify(catalog) + '\n';
if (check) {
  if (await readFile(target, 'utf8') !== content) throw new Error('Aushang-Belohnungskatalog muss neu erzeugt werden.');
} else {
  await mkdir(new URL('../assets/data/', import.meta.url), { recursive: true });
  await writeFile(target, content);
}
return catalog;
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const catalog = await buildNoticeRewardCatalog({ check: process.argv.includes('--check') });
  console.log(`Aushang-Belohnungen: ${catalog.items.length} Güterregistereinträge.`);
}
