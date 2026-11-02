// Four explicitly requested loadouts. Atomic, optimistic and dry-run by default.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { createContentPublicationClient, createPublicContentReadClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { KNIGHT_EQUIPMENT_TARGETS, planKnightEquipment } from '../../../AleriaAlmanach/modules/gwynthor-seven/knight-equipment-plan.mjs';
import { AUTHORED_ITEMS } from '../../../AleriaAlmanach/modules/item-definitions/authored-item-catalog.js';
import { itemDefinitionFromTemplate, itemDefinitionKey, itemDefinitionContent } from '../../../AleriaAlmanach/modules/item-definitions/item-definition-model.js';
import { GWYNTHOR_SEVEN_LOADOUTS } from '../../../AleriaAlmanach/modules/gwynthor-seven/equipment.mjs';
import { GWYNTHOR_EQUIPMENT_ARTWORK } from '../../../AleriaAlmanach/modules/gwynthor-seven/equipment-artwork.mjs';

const apply = process.argv.includes('--apply');
const verifyOnly = process.argv.includes('--verify');
const root = new URL('../../../', import.meta.url);
const directory = new URL('diagnostics/knight-equipment-20261102/', root);
const save = async (name, data) => writeFile(new URL(name, directory), JSON.stringify(data, null, 2) + '\n');
await mkdir(directory, { recursive: true });
const client = apply ? await createContentPublicationClient() : createPublicContentReadClient();
const decode = raw => raw ? { ...decodeFirestoreFields(raw.fields || {}), id: raw.name.split('/').at(-1) } : null;
const withoutId = ({ id, ...rest }) => rest;
const now = new Date().toISOString();
const registry = JSON.parse(await readFile(new URL('CharakterDatenbank/registry.json', root), 'utf8'));
const seeds = await Promise.all(KNIGHT_EQUIPMENT_TARGETS.map(async target => {
  const row = registry.records.find(row => row.worldPersonId === target.worldPersonId
    || target.knownIds.includes(row.firestoreDocumentId));
  assert(row, `Lokale Akte fehlt: ${target.name}`);
  const record = JSON.parse(await readFile(new URL(`CharakterDatenbank/${row.path}`, root), 'utf8'));
  const { localRecord, imageSets, emotes, activeImageSetId, biography, ...character } = record.character;
  // Optional avatar sets belong to a separate release. Start a missing public
  // record with its existing portrait and the current requested rule versions.
  // The missing record receives only this requested loadout. Local companion
  // drafts have their own creature-publication workflow and remain in source.
  const inventory = { ...(character.inventory || {}), items: [], companions: [] };
  const { weapons, armorItems, ...combatProfile } = character.combatProfile || {};
  return { ...character, inventory, combatProfile, id: row.firestoreDocumentId };
}));
async function query(fieldPath, values) {
  const rows = await client.request(':runQuery', { structuredQuery: { from: [{ collectionId: 'characters' }],
    where: { fieldFilter: { field: { fieldPath }, op: 'IN', value: { arrayValue: { values: values.map(stringValue => ({ stringValue })) } } } } } });
  return rows.flatMap(row => row.document ? [row.document] : []);
}
const results = await Promise.all([
  query('name', KNIGHT_EQUIPMENT_TARGETS.map(target => target.name)),
  query('identity.worldPersonId', KNIGHT_EQUIPMENT_TARGETS.map(target => target.worldPersonId)),
  query('genealogy.worldPersonId', KNIGHT_EQUIPMENT_TARGETS.map(target => target.worldPersonId)),
  ...[...new Set(KNIGHT_EQUIPMENT_TARGETS.flatMap(target => [...target.knownIds, target.worldPersonId]))]
    .map(id => client.request(`/characters/${encodeURIComponent(id)}`).then(raw => raw ? [raw] : []))
]);
const documents = [...new Map(results.flat().map(raw => [raw.name, raw])).values()];
const characters = documents.map(decode);
const selectedIds = new Set(KNIGHT_EQUIPMENT_TARGETS.flatMap(target => GWYNTHOR_SEVEN_LOADOUTS[target.key].map(([key]) => `gwynthor-seven:${key}`)));
const templates = AUTHORED_ITEMS.filter(item => selectedIds.has(item.id));
assert.equal(templates.length, selectedIds.size, 'Redaktionellen Itemkatalog zuerst neu erzeugen.');
const definitions = templates.map(itemDefinitionFromTemplate);
const versionDocuments = await Promise.all(definitions.map(definition => client.request(`/item_definition_versions/${encodeURIComponent(itemDefinitionKey(definition))}`)));
const headDocuments = await Promise.all(definitions.map(definition => client.request(`/item_definitions/${encodeURIComponent(definition.id)}`)));
const plan = planKnightEquipment({ characters, seeds, templates, now });
const configDocument = await client.request('/char_tabs/config');
assert(configDocument, 'Charakterreiter-Konfiguration fehlt.');
const config = decodeFirestoreFields(configDocument.fields);
assert(Array.isArray(config.map?.Gwynthor), 'Gwynthor-Zuordnung fehlt.');
const rianna = plan.entries.find(entry => entry.key === 'rianna-wyrm').character;
const gwynthor = config.map.Gwynthor.includes(rianna.id) ? config.map.Gwynthor : [...config.map.Gwynthor, rianna.id];
const configChanged = !isDeepStrictEqual(config.map.Gwynthor, gwynthor);
const definitionWrites = [];
for (let index = 0; index < definitions.length; index++) {
  const definition = definitions[index], version = versionDocuments[index], head = headDocuments[index];
  if (version) assert.equal(itemDefinitionContent(decodeFirestoreFields(version.fields)), itemDefinitionContent(definition), 'Unveränderliche Version weicht ab.');
  else definitionWrites.push({ update: { name: client.documentName(`item_definition_versions/${itemDefinitionKey(definition)}`), fields: encodeFirestoreFields({ ...definition, createdAt: now }) }, currentDocument: { exists: false } });
  if (!head) definitionWrites.push({ update: { name: client.documentName(`item_definitions/${definition.id}`), fields: encodeFirestoreFields({ ...definition, updatedAt: now }) }, currentDocument: { exists: false } });
  else assert.equal(itemDefinitionContent(decodeFirestoreFields(head.fields)), itemDefinitionContent(definition), 'Vorhandener Definitionskopf benötigt explizite Prüfung.');
}
const entries = plan.entries.filter(entry => entry.create || entry.changed);
const summary = { dryRun: !apply, verifyOnly, profiles: plan.entries.map(entry => ({ key: entry.key, id: entry.character.id,
  create: entry.create, changed: entry.changed, addedItemIds: entry.addedItemIds, removedPlaceholderIds: entry.removedPlaceholderIds,
  items: entry.character.inventory.items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, definitionRef: item.definitionRef })) })),
  missingDefinitionDocuments: definitionWrites.length, configChanged, existingLiveResourcesPreserved: true };
await save(verifyOnly ? 'verification-plan.json' : 'prepared-plan.json', summary);
if (!verifyOnly) await save('characters-prepared.json', { capturedAt: now, characters: plan.entries.map(entry => entry.character) });
if (verifyOnly) {
  assert.equal(entries.length, 0, 'Inventarabgleich ist nicht idempotent.');
  assert.equal(definitionWrites.length, 0, 'Regelversionen fehlen.');
  assert.equal(configChanged, false, 'Gwynthor-Zuordnung fehlt.');
}
if (apply && (entries.length || definitionWrites.length || configChanged)) {
  const locks = await Promise.all(plan.entries.map(entry => client.request(`/combat_profile_locks/characters/records/${encodeURIComponent(entry.character.id)}`)));
  for (const lock of locks) assert(!(lock && decodeFirestoreFields(lock.fields).activeEncounterKeys?.length), 'Inventarabgleich während eines aktiven Kampfes gesperrt.');
  // Every picture must be publicly readable before references become live.
  const receipts = new Map(Object.values(GWYNTHOR_EQUIPMENT_ARTWORK).map(receipt => [receipt.url, receipt]));
  for (const image of new Set(templates.map(item => item.image))) {
    assert(receipts.has(image), `Bild noch nicht publiziert: ${image}`);
    const response = await fetch(image, { signal: AbortSignal.timeout(30000) });
    assert(response.ok, `Inventarbild: HTTP ${response.status}`);
    assert((await response.arrayBuffer()).byteLength, 'Leeres Inventarbild.');
  }
  const writes = entries.map(entry => {
    if (entry.create) return { update: { name: client.documentName(`characters/${entry.character.id}`), fields: encodeFirestoreFields(withoutId(entry.character)) }, currentDocument: { exists: false } };
    const prior = documents.find(raw => raw.name.endsWith(`/${entry.character.id}`));
    const fields = { inventory: entry.character.inventory,
      combatProfile: entry.before.combatProfile ? { weapons: entry.character.combatProfile.weapons, armorItems: entry.character.combatProfile.armorItems } : entry.character.combatProfile };
    return { update: { name: prior.name, fields: encodeFirestoreFields(fields) },
      updateMask: { fieldPaths: ['inventory', ...(entry.before.combatProfile ? ['combatProfile.weapons', 'combatProfile.armorItems'] : ['combatProfile'])] },
      currentDocument: { updateTime: prior.updateTime } };
  });
  plan.entries.forEach((entry, index) => writes.unshift({ verify: client.documentName(`combat_profile_locks/characters/records/${entry.character.id}`),
    currentDocument: locks[index] ? { updateTime: locks[index].updateTime } : { exists: false } }));
  if (configChanged) writes.push({ update: { name: configDocument.name, fields: encodeFirestoreFields({ map: { Gwynthor: gwynthor } }) }, updateMask: { fieldPaths: ['map.Gwynthor'] }, currentDocument: { updateTime: configDocument.updateTime } });
  writes.push(...definitionWrites);
  await backupContentPublication('knight-equipment-20261102', [...documents, ...versionDocuments, ...headDocuments, configDocument, ...locks],
    writes.filter(write => write.update && write.currentDocument.exists === false).map(write => write.update.name.split('/documents/')[1]), now);
  const committed = await client.request(':commit', { writes });
  const after = await Promise.all(plan.entries.map(async entry => {
    const character = decode(await client.request(`/characters/${encodeURIComponent(entry.character.id)}`));
    assert.deepEqual(character, entry.character, `Unbeteiligte Daten verändert: ${entry.key}`);
    return character;
  }));
  const afterConfig = decodeFirestoreFields((await client.request('/char_tabs/config')).fields);
  assert.deepEqual(afterConfig, { ...config, map: { ...config.map, Gwynthor: gwynthor } }, 'Andere Reiter verändert.');
  const rerun = planKnightEquipment({ characters: after, seeds, templates, now });
  assert(rerun.entries.every(entry => !entry.create && !entry.changed), 'Abgleich würde erneut Besitz vergeben.');
  await save('characters-after.json', { capturedAt: committed.commitTime, characters: after });
  await save('publication-verification.json', { ...summary, dryRun: false, verified: true, idempotent: true,
    committedAt: committed.commitTime, unrelatedFieldsPreserved: true, imageCount: new Set(templates.map(item => item.image)).size });
  console.log(JSON.stringify({ applied: true, characters: after.map(character => ({ id: character.id, name: character.name, items: character.inventory.items.length })), verified: true }));
} else console.log(JSON.stringify(summary));
