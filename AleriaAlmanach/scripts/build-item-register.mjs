import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildHouseArmorTemplates } from '../modules/house-armor/house-armor-model.js';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
import { parsePrice } from '../modules/item-register/item-register-money.js';
import { extractRossmarktEntries } from './source-pages/rossmarkt-source.mjs';
import { reconcileMarketItems } from './source-pages/market-reconciliation.mjs';
import { withRegisterGameplayDefaults } from '../modules/item-register/item-register-gameplay-defaults.js';
import { resolveStandardItemImage } from '../modules/item-register/item-register-standard-artwork.js';
import { normalizeItemDefinition, itemDefinitionFromTemplate, itemDefinitionContent, itemDefinitionKey } from '../modules/item-definitions/item-definition-model.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const frontend = resolve(root, 'AleriaAlmanach');
const context = vm.createContext({ console, window: {} });
for (const name of ['normalizer', 'extractors']) {
  vm.runInContext(await readFile(resolve(frontend, `modules/item-database/item-db-${name}.js`), 'utf8'), context);
}
const sources = vm.runInContext('ITEM_DB_MARKET_SOURCES', context);
for (const source of sources) vm.runInContext(await readFile(resolve(frontend, source.path), 'utf8'), context);
const candidates = vm.runInContext('itemDbCollectMarketCandidates()', context);
const mounts = extractRossmarktEntries(await readFile(resolve(root, 'Markt/Rossmarkt/Rossmarkt.html'), 'utf8'));
const slug = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-');
// Correct transliterations in prose only; source IDs and asset paths stay stable.
const transcribedWords = new Set(`Aerger Albenfuersten Armbrustschuetzen Autoritaet Boegen Einschuechterung Fellruestung Flaeche Flexibilitaet Fuer Fusskaempfer Gelaende Genuegsam Geschaeft Gewoehnlich Grenzjaegern Groesse Gruenes Haengen Hoehen Hueten Identitaet Jaegern Kaelte Kaempfer Kaempfergilde Kaempfern Kettenruestung Koennen Koerper Kostenguenstig Kraeuter Lamellenruestung Lederruestung Luecken Maenner Maersche Maeuse Maeusen Oberkoerper Pfluege Plaetzchen Plattenruestung Praezisionsruestung Prunkstueck Raeuber Raeumen Rattenpruegel Ritterplattenruestung Rueckgrat Ruestung Ruestungen Ruestungsbrecher Schaedlingskontrolle Schildwaelle Schlaege Soeldner Soeldners Stabilitaet Stahlkuerass Stoffruestung Sueden Traeger Traegermaterial Trueffel Turnierruestung Ueberlebenswerkzeug Uebung Ungewoehnlich Verstaerkte Verstaerkter Vorruecken Wachgefluegel Waerme Woelfe Zaehigkeit aeltere anstaendigen auffaellig bewaehrt daempft dafuer fuehren fuehrt fuer fuerstliche gefaehrlich gefuehrt gehaertetes genuegsam genuegsamen geschuetzte guenstig haelt herkoemmlichen klueger koennen kraeftig kraeftiger laendlichen laesst moegen noerdlichen nuetzlich nuetzlicher schlaegt schoen schuetzt stoerrischer suedlichen taeglich traegt ueberall ueberlappenden ueberreicht unauffaellig ungeschuetzte verkaeuflich verlaessliche verlaesslichste vernaeht verschnuert verstaerkte vollstaendig waehrend waermt wuerzig zaeh zuverlaessig`.split(' '));
const umlauts = value => String(value || '').replace(/[A-Za-z]+/g, word => transcribedWords.has(word)
  ? word.replace(/ae|oe|ue|Ae|Oe|Ue/g, match => ({ ae: 'ä', oe: 'ö', ue: 'ü', Ae: 'Ä', Oe: 'Ö', Ue: 'Ü' })[match]) : word);
function sourceCategory(candidate) {
  const source = candidate.sourceRefs[0].market;
  const category = candidate.category;
  if (source === 'Taverne') return ['Speisen', 'Menüs'].includes(category) ? 'speisen' : 'getraenke';
  if (source === 'Viehmarkt') return category === 'Roesser' ? 'pferde' : 'vieh';
  if (source === 'Gemischtwarenhändler') return /Proviant/.test(category) ? 'speisen' : /Heil/.test(category) ? 'alchemie' : 'werkzeuge';
  if (source === 'Waffen & Rüstungen') return category === 'Waffen' ? 'waffen' : 'ruestungen';
  if (source === 'Schwarzmarkt') return ({ Waffen: 'waffen', Drogen: 'alchemie', Rohmaterial: 'alchemie' })[category] || 'arkanes';
  return category;
}
const mountCandidates = mounts.map(mount => ({
  title: mount.name, category: mount.section === 'uebrige' ? 'vieh' : 'pferde', type: mount.type,
  description: mount.description, details: `Herkunft: ${mount.origin}`, image: mount.image,
  price: mount.price, currency: mount.currency, tags: [mount.type, mount.origin, ...mount.uses],
  mountSection: mount.section, mountId: mount.id,
  sourceRefs: [{ kind: 'market-folder', market: 'Rossmarkt', sourcePage: mount.sourcePage, sourceId: mount.id }],
  hiddenMeta: { sourceTemplate: 'Markt/Rossmarkt', origin: mount.origin }
}));
const items = reconcileMarketItems([...candidates.filter(candidate => candidate.sourceRefs[0].market !== 'Rossmarkt'), ...mountCandidates].map(candidate => {
  const legacy = vm.runInContext(`itemDbNormalizeItem(${JSON.stringify(candidate)})`, context);
  candidate.category = sourceCategory(candidate);
  const normalized = vm.runInContext(`itemDbNormalizeItem(${JSON.stringify(candidate)})`, context);
  const source = candidate.sourceRefs[0];
  // Preserve the released template identities, including the historical pony suffix.
  const mountKey = candidate.mountId ? `${candidate.category}:${candidate.title}${candidate.mountSection === 'ponys' ? '-pony' : ''}` : '';
  const id = `standard:${slug(source.market)}:${slug(mountKey || source.sourceId || normalized.canonicalKey)}`;
  const priceRange = parsePrice(normalized.price, normalized.currency);
  return { ...normalized, id, canonicalKey: id, aliases: [...new Set([legacy.canonicalKey, normalized.canonicalKey, ...(mountKey ? [`${candidate.category}:${slug(mountKey.split(':')[1])}`] : [])])], section: 'standard',
    ...(candidate.mountId ? { mountId: candidate.mountId, mountSection: candidate.mountSection } : {}),
    image: resolveStandardItemImage({ id }, normalized.image),
    title: umlauts(normalized.title), type: umlauts(normalized.type), description: umlauts(normalized.description),
    details: umlauts(normalized.details), tags: normalized.tags.map(umlauts),
    priceRange, stock: null, combatDefinition: candidate.combatDefinition || null, updatedAt: 0,
    sourceRefs: candidate.sourceRefs, hiddenMeta: { ...normalized.hiddenMeta, rarity: umlauts(normalized.hiddenMeta.rarity) } };
}));
items.push(...buildHouseArmorTemplates());
for (let index = 0; index < items.length; index++) items[index] = withRegisterGameplayDefaults(items[index]);
for (const item of items) {
  const definition = normalizeItemDefinition({ ...item, kind: 'shared', weight: null,
    description: [item.description, item.details].filter(Boolean).join('\n\n') }, { id: item.id, revision: 'draft' });
  item.definitionRef = { id: item.id, revision: createHash('sha256').update(itemDefinitionContent(definition)).digest('hex').slice(0, 24) };
  item.definitionKind = 'shared';
}
if (new Set(items.map(item => item.id)).size !== items.length) throw new Error('Doppelte Standard-ID.');
async function previousBinding(path, name, fallback = []) {
  const text = await readFile(path, 'utf8').catch(() => '');
  const start = text.indexOf(`export const ${name} = `);
  return start < 0 ? fallback : JSON.parse(text.slice(start + `export const ${name} = `.length).trim().replace(/;\s*$/, ''));
}
const archivePath = resolve(frontend, 'modules/item-definitions/item-definition-versions.js');
const oldVersions = await previousBinding(archivePath, 'ARCHIVED_ITEM_DEFINITIONS');
const oldItems = await previousBinding(resolve(frontend, 'modules/item-register/item-register-standard.js'), 'STANDARD_ITEMS');
// Display-name corrections must not discard explicit legacy lookup identities.
const previousById = new Map(oldItems.map(item => [item.id, item]));
for (const item of items) item.aliases = [...new Set([...(item.aliases || []), ...(previousById.get(item.id)?.aliases || [])])];
const currentKeys = new Set(items.map(item => itemDefinitionKey(item.definitionRef)));
const archive = new Map([...oldVersions, ...oldItems.map(itemDefinitionFromTemplate).filter(Boolean)]
  .filter(definition => !currentKeys.has(itemDefinitionKey(definition)))
  .map(definition => [itemDefinitionKey(definition), definition]));
const archiveSource = `// Generated by scripts/build-item-register.mjs. Referenced old versions remain available.\nexport const ARCHIVED_ITEM_DEFINITIONS = ${JSON.stringify([...archive.values()].sort((a, b) => itemDefinitionKey(a).localeCompare(itemDefinitionKey(b))), null, 2)};\n`;
if (process.argv.includes('--check')) {
  if (await readFile(archivePath, 'utf8') !== archiveSource) throw Error('Die archivierten Itemversionen sind veraltet.');
} else await writeFile(archivePath, archiveSource, 'utf8');
const version = createHash('sha256').update(JSON.stringify(items)).digest('hex').slice(0, 16);
const source = `// Generated by scripts/build-item-register.mjs from versioned Markt sources.\nexport const STANDARD_VERSION = ${JSON.stringify(version)};\nexport const STANDARD_ITEMS = ${JSON.stringify(items, null, 2)};\n`;
const manifestPath = resolve(frontend, 'modules/item-register/item-register-version.json');
const manifest = JSON.stringify({ version, itemCount: items.length }, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (await readFile(manifestPath, 'utf8').catch(() => '') !== manifest) throw new Error('Die Registerversionsdatei ist veraltet.');
} else await writeFile(manifestPath, manifest, 'utf8');
for (const path of ['AleriaAlmanach/modules/item-register/item-register-standard.js', 'firebase/functions/src/generated/item-register/item-register-standard.js']) {
  const target = resolve(root, path);
  if (process.argv.includes('--check')) {
    if (await readFile(target, 'utf8').catch(() => '') !== source) throw new Error(`Standardgüter veraltet: ${path}`);
    continue;
  }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, source, 'utf8');
}
console.log(`${items.filter(item => item.section === 'standard').length} Standardgüter, ${items.filter(item => item.section === 'regional').length} länderspezifische Vorlagen, Version ${version}`);
