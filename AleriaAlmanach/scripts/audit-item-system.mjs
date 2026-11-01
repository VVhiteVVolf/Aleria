// Local, read-only inventory of public item sources. No Firebase, credentials,
// browser storage, private dossiers, migrations or write-back to source data.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../modules/item-register/item-register-standard.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { buildOwnedItems } from '../modules/item-register/item-register-model.js';
import { isInventoryPlaceholder } from '../modules/character-inventory/inventory-placeholders.js';
import { readEconomyModuleSources } from '../modules/economy-calculator/economy-source-venues.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const snapshotPath = 'CharakterDatenbank/generated/characters.snapshot.json';
const snapshotText = await readFile(resolve(root, snapshotPath), 'utf8');
const { characters } = JSON.parse(snapshotText);
const modules = (await readEconomyModuleSources()).flatMap(section => section.entries || []);
const offers = buildModuleOffers(modules, STANDARD_ITEMS);
const items = characters.flatMap(character => (character.inventory?.items || []).map(item => ({ ...item, auditOwner: character.id })));
const equipment = characters.flatMap(character => ['weapons', 'armorItems'].flatMap(collection =>
  (character.combatProfile?.[collection] || []).map(item => ({ ...item, auditOwner: character.id, collection }))));
const unarmed = item => item.id === 'default-unarmed-melee';
const summary = records => ({
  count: records.length,
  categories: Object.fromEntries([...new Set(records.map(item => item.category))].sort().map(category => [category, {
    count: records.filter(item => item.category === category).length,
    withCombatDefinition: records.filter(item => item.category === category && item.combatDefinition).length,
    linkedToTemplate: records.filter(item => item.category === category && item.templateId).length
  }]))
});
const placeholders = items.filter(isInventoryPlaceholder);
const templates = [...STANDARD_ITEMS, ...offers];
const knownKeys = new Set(templates.flatMap(item => [item.id, ...(item.aliases || [])]));
const linked = items.filter(item => item.templateId || item.originItemDbKey || item.itemDbKey);
const unresolved = linked.filter(item => ![item.templateId, item.originItemDbKey, item.itemDbKey].some(key => knownKeys.has(key)));
const rewardText = await readFile(resolve(root, 'Anzeigetafeln/assets/data/notice-reward-catalog.json'), 'utf8');
const rewardItems = JSON.parse(rewardText).items;
const report = {
  schemaVersion: 1,
  scope: 'Public repository sources and local character snapshot only; not a live Firebase census.',
  exclusions: ['Private dossiers', 'Browser drafts and IndexedDB', 'Historical comments treated as current stock', 'Live Firebase records'],
  input: { characterSnapshot: snapshotPath, characterSnapshotSha256: createHash('sha256').update(snapshotText).digest('hex'), standardVersion: STANDARD_VERSION },
  standards: { ...summary(STANDARD_ITEMS), regionalCount: STANDARD_ITEMS.filter(item => item.section === 'regional').length,
    missingEquipmentMechanics: STANDARD_ITEMS.filter(item => ['waffen', 'ruestungen'].includes(item.category) && !item.combatDefinition).map(item => item.id),
    provisionalCount: STANDARD_ITEMS.filter(item => item.mechanicsStatus === 'provisional').length },
  moduleOffers: { ...summary(offers), sourceModulesScanned: modules.length, providers: new Set(offers.map(item => item.moduleId)).size,
    missingEquipmentMechanics: offers.filter(item => ['waffen', 'ruestungen'].includes(item.category) && !item.combatDefinition).map(item => ({ id: item.id, title: item.title, moduleId: item.moduleId })) },
  characters: { count: characters.length, inventoryRows: items.length,
    untouchedPlaceholders: placeholders.length,
    placeholdersByName: Object.fromEntries([...new Set(placeholders.map(item => item.name))].sort().map(name => [name, placeholders.filter(item => item.name === name).length])),
    realRows: items.length - placeholders.length, registerProjectionRows: buildOwnedItems(characters, templates).length,
    withCombatDefinition: items.filter(item => item.combatDefinition).length, withTemplateReference: linked.length,
    unresolvedReferences: unresolved.map(item => ({ characterId: item.auditOwner, inventoryItemId: item.id, reference: item.templateId || item.originItemDbKey || item.itemDbKey })),
    equipmentEntries: equipment.length, virtualUnarmedEntries: equipment.filter(unarmed).length,
    equipmentWithoutInventoryLink: equipment.filter(item => !unarmed(item) && !item.inventoryItemId).map(item => ({ characterId: item.auditOwner, equipmentId: item.id, name: item.name, collection: item.collection })) },
  noticeRewards: { catalogRows: rewardItems.length, withCombatDefinition: rewardItems.filter(item => item.combatDefinition).length,
    withResolvableRegisterId: rewardItems.filter(item => knownKeys.has(item.id)).length,
    withDefinitionReference: rewardItems.filter(item => item.definitionRef).length,
    distinctDefinitions: JSON.parse(rewardText).definitions?.length || 0,
    behavior: 'Promises remain descriptive until a moderator awards them; one immutable claim per board and notice group prevents repeated payouts.' }
};

const outputIndex = process.argv.indexOf('--output');
if (outputIndex >= 0) {
  if (!process.argv[outputIndex + 1]) throw new Error('--output benötigt einen Pfad innerhalb des Workspace.');
  const target = resolve(root, process.argv[outputIndex + 1]);
  const local = relative(root, target);
  if (local.startsWith('..') || isAbsolute(local)) throw new Error('Der Auditbericht muss im Workspace bleiben.');
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(`Itemaudit geschrieben: ${local}`);
} else console.log(JSON.stringify(report, null, 2));
