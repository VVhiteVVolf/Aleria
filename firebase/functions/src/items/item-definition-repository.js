import { createHash } from 'node:crypto';
import { HttpsError } from 'firebase-functions/v2/https';
import { itemDefinitionRegistry } from '../generated/item-definitions/item-definition-registry.js';
import { normalizeItemDefinition, normalizeItemDefinitionRef, itemDefinitionKey, itemDefinitionContent, itemDefinitionFromTemplate } from '../generated/item-definitions/item-definition-model.js';
import { synchronizeEquipmentFromInventory } from '../generated/character-equipment/character-equipment-sync.js';

export const definitionRevision = definition => createHash('sha256').update(itemDefinitionContent(definition)).digest('hex').slice(0, 24);
export const definitionVersionRef = (database, reference) => database.collection('item_definition_versions').doc(itemDefinitionKey(reference));

export function productWithItemDefinition(product) {
  if (normalizeItemDefinitionRef(product.definitionRef)) return product;
  const id = `catalog:${createHash('sha256').update(String(product.id)).digest('hex').slice(0, 32)}`;
  let definition = normalizeItemDefinition({ ...product, kind: 'shared',
    description: [product.description, product.details].filter(Boolean).join('\n\n') }, { id, revision: 'draft' });
  definition = { ...definition, revision: definitionRevision(definition) };
  return { ...product, definitionRef: { id, revision: definition.revision }, definitionKind: definition.kind,
    combatDefinition: definition.combatDefinition, useDefinition: definition.useDefinition,
    inventoryUseMode: definition.inventoryUseMode, mechanicsStatus: definition.mechanicsStatus };
}

export async function readItemDefinition(database, transaction, reference, { required = true } = {}) {
  const ref = normalizeItemDefinitionRef(reference);
  if (!ref) {
    if (required) throw new HttpsError('invalid-argument', 'Die Itemreferenz ist ungültig.');
    return null;
  }
  const standard = itemDefinitionRegistry.get(ref);
  if (standard) return standard;
  const snapshot = await transaction.get(definitionVersionRef(database, ref));
  if (!snapshot.exists) {
    if (required) throw new HttpsError('failed-precondition', 'Diese Itemversion ist noch nicht verfügbar. Bitte die Itemdefinition prüfen.');
    return null;
  }
  const definition = normalizeItemDefinition(snapshot.data());
  if (itemDefinitionKey(definition) !== itemDefinitionKey(ref)) throw new HttpsError('failed-precondition', 'Die gespeicherte Itemversion stimmt nicht mit ihrer Referenz überein.');
  return definition;
}

export async function readItemDefinitionIndex(database, transaction, records = [], { verifyHolders = true } = {}) {
  const references = new Map();
  for (const record of records) for (const item of record.inventory?.items || record.items || []) {
    if (normalizeItemDefinitionRef(item.definitionRef)) references.set(itemDefinitionKey(item.definitionRef), item.definitionRef);
  }
  const entries = await Promise.all([...references].map(async ([key, reference]) =>
    [key, await readItemDefinition(database, transaction, reference, { required: false })]));
  const definitions = new Map(entries.filter(([, definition]) => definition));
  if (verifyHolders) for (const record of records) {
    if (!record.id || !record.inventory) continue;
    for (const item of record.inventory.items || []) {
      const definition = definitions.get(itemDefinitionKey(item.definitionRef));
      if (definition?.kind !== 'unique') continue;
      const claim = await transaction.get(database.collection('item_unique_claims').doc(definition.id));
      const holder = claim.data()?.holder;
      const kind = record._itemHolderKind || (record.entityType === 'creature' ? 'creatures' : 'characters');
      if (!claim.exists || claim.data().instanceId !== (item.instanceId || item.id) || holder?.kind !== kind
        || holder?.recordId !== record.id || holder?.itemId !== item.id) throw new HttpsError('failed-precondition', `${definition.title} ist diesem Besitzplatz nicht als Unikat zugeordnet.`);
    }
  }
  return definitions;
}

export function hydrateItemRecord(record, definitions, { requireEquipped = false, preserveLoadout = false } = {}) {
  if (!(record.inventory?.items || []).some(item => item.definitionRef)) return record;
  if (requireEquipped) {
    const equippedIds = new Set([...(record.combatProfile?.weapons || []), ...(record.combatProfile?.armorItems || [])]
      .filter(entry => entry.equipped).map(entry => entry.inventoryItemId));
    for (const item of record.inventory.items) if (item.definitionRef && (item.equipped || equippedIds.has(item.id))
      && !definitions.has(itemDefinitionKey(item.definitionRef))) throw new HttpsError('failed-precondition', `Die Regelversion von ${item.name || 'der angelegten Ausrüstung'} fehlt.`);
  }
  return { ...record, combatProfile: synchronizeEquipmentFromInventory({ inventory: record.inventory,
    combatProfile: record.combatProfile || {}, definitions, addMissingEquipment: true, preserveLoadout }).combatProfile };
}

// All reads happen while preparing. The caller writes only after its remaining
// price, permission, stock, scene and claim reads have completed.
export async function prepareDefinitionVersion(database, transaction, input, { actorUid = '', publishHead = false, now = new Date().toISOString() } = {}) {
  const definition = normalizeItemDefinition(input);
  const builtin = itemDefinitionRegistry.get(definition);
  if (builtin) {
    if (itemDefinitionContent(builtin) !== itemDefinitionContent(definition)) throw new HttpsError('failed-precondition', 'Geschützte Standardwerte dürfen nicht überschrieben werden.');
    return { definition: builtin, previousRevision: builtin.revision, write() {} };
  }
  if (definition.id.startsWith('standard:')) throw new HttpsError('permission-denied', 'Standarddefinitionen werden durch eine geprüfte Datenversion veröffentlicht.');
  const versionRef = definitionVersionRef(database, definition);
  const headRef = database.collection('item_definitions').doc(definition.id);
  const [version, head] = await Promise.all([transaction.get(versionRef), transaction.get(headRef)]);
  if (version.exists && itemDefinitionContent(version.data()) !== itemDefinitionContent(definition)) throw new HttpsError('failed-precondition', 'Eine gespeicherte Itemversion ist unveränderlich.');
  if (head.exists && head.data().kind !== definition.kind) throw new HttpsError('failed-precondition', 'Die Definitionart kann nicht nachträglich zwischen Seriengegenstand und Unikat wechseln.');
  return { definition, previousRevision: head.data()?.revision || '', write() {
    if (!version.exists) transaction.create(versionRef, { ...definition, createdAt: now, createdBy: actorUid });
    if (!head.exists || publishHead) transaction.set(headRef, { ...definition, updatedAt: now, updatedBy: actorUid });
  } };
}

export async function prepareTemplateDefinition(database, transaction, template, options = {}) {
  const definition = itemDefinitionFromTemplate(template);
  if (!definition) return { definition: null, write() {} };
  const stored = await readItemDefinition(database, transaction, template.definitionRef, { required: false });
  if (stored) return { definition: stored, write() {} };
  return prepareDefinitionVersion(database, transaction, definition, options);
}

export async function prepareUniqueItemClaims(database, transaction, grants, { now = new Date().toISOString(), actorUid = '' } = {}) {
  const normalizeHolder = holder => holder && holder.kind && holder.recordId && holder.itemId
    ? { kind: String(holder.kind), recordId: String(holder.recordId), itemId: String(holder.itemId) } : null;
  const holderKey = holder => JSON.stringify(normalizeHolder(holder));
  const pending = new Map();
  for (const { definition, instanceId, quantity = 1, holder, previousHolder } of grants) {
    if (definition?.kind !== 'unique') continue;
    if (Number(quantity) !== 1) throw new HttpsError('failed-precondition', 'Ein Unikat kann nicht als Stapel erzeugt werden.');
    if (!normalizeHolder(holder)) throw new HttpsError('failed-precondition', 'Ein Unikat benötigt einen eindeutigen Besitz- oder Szenenplatz.');
    const previous = pending.get(definition.id);
    if (previous && (previous.instanceId !== instanceId || holderKey(previous.holder) !== holderKey(holder) && holderKey(previous.holder) !== holderKey(previousHolder))) throw new HttpsError('already-exists', 'Dasselbe Unikat darf nur einmal existieren.');
    pending.set(definition.id, { definition, instanceId, holder, previousHolder: previous ? previous.previousHolder : previousHolder });
  }
  const writes = await Promise.all([...pending.values()].map(async ({ definition, instanceId, holder, previousHolder }) => {
    const ref = database.collection('item_unique_claims').doc(definition.id);
    const current = await transaction.get(ref);
    if (current.exists && current.data().instanceId !== instanceId) throw new HttpsError('already-exists', `${definition.title} existiert bereits als einzelner Gegenstand.`);
    if (current.exists && current.data().holder && holderKey(current.data().holder) !== holderKey(holder)
      && holderKey(current.data().holder) !== holderKey(previousHolder)) throw new HttpsError('already-exists', `${definition.title} ist bereits einem anderen Besitzplatz zugeordnet.`);
    return { ref, exists: current.exists, before: current.data() || null, data: { ...(current.data() || {}), definitionId: definition.id, instanceId, holder: normalizeHolder(holder),
      ...(current.exists ? { updatedAt: now } : { createdAt: now, createdBy: actorUid }) } };
  }));
  const commit = () => { for (const write of writes) if (!write.exists) transaction.create(write.ref, write.data); else transaction.set(write.ref, write.data); };
  commit.undo = writes.map(write => ({ definitionId: write.ref.id, before: write.before, after: write.data }));
  return commit;
}
