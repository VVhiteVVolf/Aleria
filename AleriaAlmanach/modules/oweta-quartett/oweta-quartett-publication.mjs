import { createGrantedItem } from '../item-register/item-register-model.js';
import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { assertItemQuantity, itemDefinitionFromTemplate } from '../item-definitions/item-definition-model.js';
import { moneyState, formatMoney } from '../item-register/item-register-money.js';
import { OWETA_QUARTET_STARTER_STOCK, OWETA_QUARTET_MEMBERS, OWETA_QUARTET_COMPANIONS } from './oweta-quartett-data.mjs';
import { buildOwetaQuartet, OWETA_QUARTET_ID, OWETA_QUARTET_SECTION } from './oweta-quartett-module.mjs';

export const OWETA_QUARTET_SOURCE_KEY = `editorial:group-start-possessions:20261103:${OWETA_QUARTET_ID}`;
export const OWETA_QUARTET_NODE_ID = 'node:gruppen:cenyr/celtigerns-wacht/haus-draig';

export function owetaQuartetStarterTemplates() {
  return OWETA_QUARTET_STARTER_STOCK.map(specification => {
    const matches = STANDARD_ITEMS.filter(template => template.id === specification.sourceKey);
    if (matches.length !== 1) throw Error(`Die gemeinsame Startvorlage fehlt oder ist mehrdeutig: ${specification.sourceKey}`);
    const template = matches[0], definition = itemDefinitionFromTemplate(template);
    if (!definition || definition.kind !== 'shared' || definition.combatDefinition
      || ['waffen', 'ruestungen', 'pferde', 'vieh', 'arkanes'].includes(definition.category)) {
      throw Error(`Ungeeignete Vorlage für den gemeinsamen Reisevorrat: ${specification.sourceKey}`);
    }
    assertItemQuantity(definition, specification.quantity);
    return { specification, template, definition };
  });
}

export function buildOwetaQuartetPlacement(config, revision) {
  const manifest = structuredClone(config.moduleStoreManifest);
  if (!manifest || config.hiddenModuleIds?.[OWETA_QUARTET_ID] || manifest.hiddenModuleIds?.[OWETA_QUARTET_ID]) {
    throw Error('Das Gruppenmanifest fehlt oder die Gruppe ist ausgeblendet.');
  }
  const section = manifest.customSections?.find(section => section.nodeId === OWETA_QUARTET_NODE_ID);
  if (!section || section.tab !== OWETA_QUARTET_SECTION.tab
    || JSON.stringify(section.path) !== JSON.stringify(OWETA_QUARTET_SECTION.path)) {
    throw Error('Die bestehende Haus-Draig-Gruppenablage wurde verändert; die Platzierung benötigt eine erneute Prüfung.');
  }
  section.entryIds = [...new Set([...(section.entryIds || []), OWETA_QUARTET_ID])];
  manifest.entryOverrideIds = [...new Set([...(manifest.entryOverrideIds || []), OWETA_QUARTET_ID])];
  manifest.moduleNodeAssignments = { ...manifest.moduleNodeAssignments, [OWETA_QUARTET_ID]: OWETA_QUARTET_NODE_ID };
  manifest.updatedAtClient = revision;
  const patch = { moduleStoreManifest: manifest, moduleStoreUpdatedAtClient: revision };
  if (Object.hasOwn(config, 'moduleNodeAssignments')) {
    patch.moduleNodeAssignments = { ...config.moduleNodeAssignments, [OWETA_QUARTET_ID]: OWETA_QUARTET_NODE_ID };
  }
  return patch;
}

/** A new account is seeded once. A saved claim always takes precedence over
 * the initial stock, so consumed or transferred supplies are never recreated. */
export function planOwetaQuartetPublication({ config, module = null, account = null, claim = null, image, now } = {}) {
  if (claim) {
    if (claim.sourceKey !== OWETA_QUARTET_SOURCE_KEY || claim.result?.recordId !== OWETA_QUARTET_ID
      || claim.result?.recordKind !== 'groups' || module?.id !== OWETA_QUARTET_ID || account?.id !== OWETA_QUARTET_ID) {
      throw Error('Der vorhandene Gruppen-Startbeleg passt nicht zu Modul und gemeinsamem Konto.');
    }
    return { alreadyPublished: true, entry: structuredClone(module), account: structuredClone(account), claim: structuredClone(claim), configPatch: null, definitions: [] };
  }
  if (module || account) throw Error('Die Gruppenkennung ist bereits ohne zugehörigen Startbeleg belegt. Es wird nichts überschrieben.');
  if (typeof now !== 'string' || !Number.isFinite(Date.parse(now))) throw Error('Ein gültiger Vergabezeitpunkt wird benötigt.');
  const revision = Math.max(Date.parse(now), Number(config?.moduleStoreUpdatedAtClient || 0) + 1,
    Number(config?.moduleStoreManifest?.updatedAtClient || 0) + 1);
  if (!Number.isSafeInteger(revision)) throw Error('Die Modulrevision ist ungültig.');
  const slots = owetaQuartetStarterTemplates(), entry = buildOwetaQuartet({ image });
  const items = slots.map(({ specification, template }) => ({
    ...createGrantedItem(template, { id: `${OWETA_QUARTET_ID}-start-${specification.key}`, characterId: OWETA_QUARTET_ID,
      characterName: entry.title, quantity: specification.quantity, now }),
    ...(specification.image ? { image: specification.image } : {}),
    acquisition: { kind: 'group-grant', sourceKey: OWETA_QUARTET_SOURCE_KEY, at: now }
  }));
  const wallet = moneyState(0);
  const seededAccount = { id: OWETA_QUARTET_ID, name: entry.title, schemaVersion: 1, revision: 1,
    inventory: { definitionSchemaVersion: 1, revision: 1, items, moneyState: wallet, money: formatMoney(wallet) },
    createdAt: now, updatedAt: now };
  const seededClaim = { sourceKey: OWETA_QUARTET_SOURCE_KEY, operationId: `group-start-possessions:20261103:${OWETA_QUARTET_ID}`,
    title: `Gemeinsamer Startvorrat · ${entry.title}`, at: now,
    rewards: slots.map(({ specification, template }) => ({ kind: 'item', itemId: template.id,
      definitionRef: structuredClone(template.definitionRef), quantity: specification.quantity })),
    result: { recordKind: 'groups', recordId: OWETA_QUARTET_ID, copper: 0,
      items: items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, definitionRef: structuredClone(item.definitionRef) })) } };
  return { alreadyPublished: false, entry, account: seededAccount, claim: seededClaim,
    configPatch: buildOwetaQuartetPlacement(config, revision), definitions: slots.map(slot => slot.definition) };
}

export function assertOwetaQuartetOwnership(characters, creatures) {
  for (const member of OWETA_QUARTET_MEMBERS) {
    const character = characters.find(row => row.id === member.id);
    const allowedNames = member.name === 'Caralyn Chwedonol' ? [member.name, 'Caralyn Chwedlonol'] : [member.name];
    if (!character || !allowedNames.includes(character.name)) {
      throw Error(`Die verknüpfte Figur ist nicht eindeutig belegt: ${member.name}`);
    }
  }
  for (const companion of OWETA_QUARTET_COMPANIONS) {
    const creature = creatures.find(row => row.id === companion.id);
    const owner = characters.find(row => row.id === companion.ownerId);
    const possessions = owner.inventory?.items?.filter(item => item.creatureId === companion.id && Number(item.quantity ?? 1) > 0) || [];
    if (!creature || possessions.length !== 1) throw Error(`Der persönliche Tierbesitz ist nicht eindeutig verknüpft: ${companion.name}`);
    const origin = creature.itemOrigin, possession = possessions[0];
    if (possession.ownerCharacterId !== owner.id || origin?.ownerGroupId || origin?.ownerCharacterId !== owner.id || origin.inventoryItemId !== possession.id
      || origin.instanceId !== (possession.instanceId || possession.id)
      || origin.disposition && origin.disposition !== 'owned') {
      throw Error(`Die gespeicherte Tierherkunft passt nicht zum persönlichen Inventar: ${companion.name}`);
    }
  }
}
