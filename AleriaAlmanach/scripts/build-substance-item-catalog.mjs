import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { readEconomyModuleSources } from '../modules/economy-calculator/economy-source-venues.mjs';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { DRINK_MEASURES } from '../modules/trade-catalog/drink-catalog-model.mjs';

const root = new URL('../../', import.meta.url), check = process.argv.includes('--check');
const sections = await readEconomyModuleSources(), entries = sections.flatMap(section => section.entries || []);
const offers = buildModuleOffers(entries, STANDARD_ITEMS);
const clean = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
function family(item) {
  const text = clean(`${item.title} ${item.type}`).toLocaleLowerCase('de');
  if (/\bwasser\b|aufguss|tee\b|hartkäse|rettich|dörräpfel/.test(text)) return '';
  if (/whisk|branntwein|schnaps|spiritus/.test(text)) return 'whisky';
  if (/apfelwein/.test(text)) return 'cider';
  if (/wein|champagnia|schaumwein/.test(text)) return 'wine';
  if (/met\b|honigbreu/.test(text)) return 'mead';
  if (/bier|dünnbier/.test(text)) return 'beer';
  return '';
}
function volume(unit, kind) {
  const matches = [...unit.matchAll(/(\d+(?:[.,]\d+)?)\s*(ml|cl|l)\b/gi)];
  if (matches.length === 1) return Number(matches[0][1].replace(',', '.')) * ({ ml: 1, cl: 10, l: 1000 })[matches[0][2].toLowerCase()];
  if (matches.length > 1) throw Error(`Mehrdeutige Inhaltsmenge: ${unit}`);
  const measure = DRINK_MEASURES[kind === 'whisky' ? 'whisky' : kind === 'mead' ? 'mead' : 'beer'];
  if (/fass/i.test(unit)) return measure.caskMl;
  if (/flasche/i.test(unit)) return kind === 'wine' ? 750 : measure.bottleMl;
  if (/krug|humpen/i.test(unit)) return 500;
  if (/glas|becher/i.test(unit)) return kind === 'whisky' ? measure.servingMl : 200;
  throw Error(`Kein eindeutiger Inhalt für ${unit}`);
}
function strength(item, kind) {
  const text = clean(`${item.description} ${item.details}`);
  const values = [...new Set([...text.matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)].map(match => Number(match[1].replace(',', '.'))))];
  if (values.length === 1 && values[0] > 0 && values[0] <= 100) return { abv: values[0], basis: 'source-abv' };
  const identity = clean(`${item.title} ${item.type}`).toLocaleLowerCase('de');
  const abv = /spiritus/.test(identity) ? 60 : /dünn|gewässert/.test(identity) ? 2 : /starkbier/.test(identity) ? 7.5
    : kind === 'mead' && /leicht/.test(identity) ? 6 : ({ whisky: 40, wine: 12, cider: 5, mead: 10, beer: 5 })[kind];
  return { abv, basis: 'game-design-default' };
}
const records = new Map(), excluded = [];
for (const item of [...STANDARD_ITEMS, ...offers]) {
  const sourceId = item.sourceRefs?.find(ref => ['kriss', 'smaragdflux', 'blutstaub'].includes(ref.sourceId))?.sourceId;
  const kind = item.category === 'getraenke' ? family(item) : '';
  if (!kind && !sourceId) {
    if (item.category === 'getraenke' && /alkohol|hochprozent|droge/i.test(item.type)) throw Error(`Dieses neue Rauschmittel benötigt ein ausdrücklich ausgearbeitetes Wirkprofil: ${item.title}`);
    if (item.category === 'getraenke') excluded.push({ name: item.title, id: item.id }); continue;
  }
  const key = item.definitionRef?.id || item.definitionSourceId;
  if (!key) throw Error(`Ungebundene Rauschquelle: ${item.title}`);
  const unit = item.hiddenMeta?.unit || '';
  const details = kind ? { volumeMl: volume(unit, kind), ...strength(item, kind) } : { doses: 1, basis: 'one-published-phial-or-serving' };
  const amount = kind ? details.volumeMl * details.abv / 1000 : 1;
  const record = { definitionId: key, name: item.title, family: kind || sourceId, unit,
    exposure: { kind: kind ? 'alcohol' : sourceId, amount: Math.round(amount * 1000000) / 1000000 }, ...details,
    offerIds: [item.id], sourceRefs: item.sourceRefs || [] };
  const existing = records.get(key);
  if (existing) {
    if (Math.abs(existing.exposure.amount - record.exposure.amount) > 0.000001 || existing.exposure.kind !== record.exposure.kind) throw Error(`Widersprüchliche Inhaltsmenge für dieselbe Itemdefinition: ${item.title}`);
    existing.offerIds = [...new Set([...existing.offerIds, item.id])];
    continue;
  }
  records.set(key, record);
}
const catalog = [...records.values()].sort((a, b) => a.definitionId.localeCompare(b.definitionId));
const data = `// Generated from actual public item and venue sources. Do not match editable item names.\nexport const SUBSTANCE_ITEM_CATALOG = Object.freeze(${JSON.stringify(catalog, null, 2)});\n`;
const destination = new URL('modules/character-health/substance-item-catalog.js', new URL('../', import.meta.url));
if (check) {
  if (await readFile(destination, 'utf8') !== data) throw Error('Der Rauschmittelkatalog ist nicht aktuell.');
} else {
  await writeFile(destination, data);
  const dir = new URL('diagnostics/health-substances-20261102/', root); await mkdir(dir, { recursive: true });
  const moduleSource = await readFile(new URL('AleriaAlmanach/data/sections.js', root), 'utf8');
  const feverText = moduleSource.slice(moduleSource.indexOf('id: "arkanistenfieber"'), moduleSource.indexOf('id: "theriantrophie"'));
  await writeFile(new URL('source-review.json', dir), JSON.stringify({ feverPath: 'AleriaAlmanach/data/sections.js', feverSha256: createHash('sha256').update(moduleSource).digest('hex'), feverText,
    drugSources: ['Markt/Alchemist/data/alchemy-data.js', 'Markt/Schwarzmarkt/data/blackmarket-data.js'], modules: entries.length,
    drinkOffers: offers.filter(item => item.category === 'getraenke').length, matchedDefinitions: catalog.length, excluded,
    catalog }, null, 2) + '\n');
}
console.log(`${catalog.length} geprüfte Wirkprofile; ${entries.length} öffentliche Module; ${excluded.length} alkoholfreie oder nicht trinkbare Angebote ausgeschlossen.`);
